from rest_framework.test import APITestCase
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from users.models import CustomUser
from inventory.models import (
    Category, Product, Inventory, StockMovement, SpaceAllocation,
    InventoryAdjustmentRequest, StockTransferRequest
)
from warehouses.models import Warehouse, Zone, Rack, Shelf


class InventoryBaseTest(APITestCase):
    def setUp(self):
        self.admin = CustomUser.objects.create_superuser(
            username="inv_admin", password="admin123", email="inv_admin@test.com", role="ADMIN"
        )
        self.staff = CustomUser.objects.create_user(
            username="inv_staff", password="staff123", email="inv_staff@test.com", role="STAFF"
        )
        resp = self.client.post("/api/token/", {"username": "inv_admin", "password": "admin123"})
        self.token = resp.data["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

        self.category = Category.objects.create(name="TestCat")
        self.product = Product.objects.create(
            name="TestProd", sku="TST001", category=self.category,
            unit_volume=2.0, unit_weight=1.0
        )
        self.product2 = Product.objects.create(
            name="TestProd2", sku="TST002", category=self.category,
            unit_volume=1.0, unit_weight=0.5
        )
        self.product3 = Product.objects.create(
            name="TestProd3", sku="TST003", category=self.category,
            unit_volume=0.5, unit_weight=0.2
        )
        self.wh = Warehouse.objects.create(
            name="TestWH", location="Chennai", total_capacity=1000,
            available_capacity=900
        )
        self.zone = Zone.objects.create(warehouse=self.wh, name="Z1", capacity=500)
        self.rack = Rack.objects.create(zone=self.zone, rack_code="R1", capacity=200)
        self.shelf = Shelf.objects.create(rack=self.rack, shelf_code="S1", capacity=100)
        self.shelf2 = Shelf.objects.create(rack=self.rack, shelf_code="S2", capacity=50)
        self.inv = Inventory.objects.create(product=self.product, shelf=self.shelf, quantity=50)
        self.inv2 = Inventory.objects.create(product=self.product2, shelf=self.shelf2, quantity=20)
        # product1: heavy OUT (forces ABC class A)
        for _ in range(8):
            StockMovement.objects.create(product=self.product, quantity=100, movement_type="OUT", notes="sale")
        # product3: tiny OUT (forces ABC class B or C after product1 takes A)
        StockMovement.objects.create(product=self.product3, quantity=1, movement_type="OUT", notes="small")
        # product2: no OUT movement (hits zero-movement C branch)
        StockMovement.objects.create(product=self.product, quantity=5, movement_type="IN", notes="restock")


class CategoryTests(InventoryBaseTest):
    def test_list_categories(self):
        resp = self.client.get("/api/inventory/categories/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_create_category(self):
        resp = self.client.post("/api/inventory/categories/", {"name": "NewCat"})
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_update_category(self):
        """Hits AuditLogMixin.perform_update (lines 35-36)."""
        resp = self.client.patch(f"/api/inventory/categories/{self.category.id}/", {"name": "UpdatedCat"})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_delete_category(self):
        resp = self.client.delete(f"/api/inventory/categories/{self.category.id}/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)

    def test_staff_cannot_create_category(self):
        resp2 = self.client.post("/api/token/", {"username": "inv_staff", "password": "staff123"})
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {resp2.data["access"]}')
        resp = self.client.post("/api/inventory/categories/", {"name": "Blocked"})
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


class ProductTests(InventoryBaseTest):
    def test_list_products(self):
        resp = self.client.get("/api/inventory/products/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_create_product(self):
        resp = self.client.post("/api/inventory/products/", {
            "name": "NewProd", "sku": "NEW001",
            "category": self.category.id, "unit_volume": 1.5, "unit_weight": 0.8
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_unauthenticated_blocked(self):
        self.client.credentials()
        resp = self.client.get("/api/inventory/products/")
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class ShelfRecommendationTests(InventoryBaseTest):
    def test_missing_required_volume(self):
        resp = self.client.post("/api/inventory/shelf-recommendation/", {}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_required_volume(self):
        resp = self.client.post("/api/inventory/shelf-recommendation/",
            {"required_volume": "abc"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_no_shelf_found(self):
        resp = self.client.post("/api/inventory/shelf-recommendation/",
            {"required_volume": 99999.0}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_best_fit_found(self):
        resp = self.client.post("/api/inventory/shelf-recommendation/",
            {"required_volume": 5.0, "strategy": "BEST_FIT"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("shelf_id", resp.data)

    def test_first_fit_found(self):
        resp = self.client.post("/api/inventory/shelf-recommendation/",
            {"required_volume": 5.0, "strategy": "FIRST_FIT"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_best_fit_with_warehouse_id(self):
        resp = self.client.post("/api/inventory/shelf-recommendation/",
            {"required_volume": 5.0, "warehouse_id": self.wh.id, "strategy": "BEST_FIT"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_first_fit_with_warehouse_id(self):
        resp = self.client.post("/api/inventory/shelf-recommendation/",
            {"required_volume": 5.0, "warehouse_id": self.wh.id, "strategy": "FIRST_FIT"}, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_no_shelf_in_empty_warehouse(self):
        """Hits return None in both first_fit and best_fit warehouse_id filter."""
        other_wh = Warehouse.objects.create(
            name="EmptyWH", location="Pune", total_capacity=100,
            available_capacity=100
        )
        for strategy in ["FIRST_FIT", "BEST_FIT"]:
            resp = self.client.post("/api/inventory/shelf-recommendation/",
                {"required_volume": 5.0, "warehouse_id": other_wh.id, "strategy": strategy},
                format="json")
            self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)


class WarehouseUtilizationTests(InventoryBaseTest):
    def test_utilization_all(self):
        resp = self.client.get("/api/inventory/warehouse-utilization/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_utilization_filtered(self):
        resp = self.client.get(f"/api/inventory/warehouse-utilization/?warehouse_id={self.wh.id}")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)


class ForecastingTests(InventoryBaseTest):
    def test_forecast_all_products(self):
        resp = self.client.get("/api/inventory/demand-forecast/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_forecast_specific_product(self):
        resp = self.client.get(f"/api/inventory/demand-forecast/?product_id={self.product.id}")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("product_id", resp.data)

    def test_forecast_product_not_found(self):
        resp = self.client.get("/api/inventory/demand-forecast/?product_id=99999")
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_forecast_summary(self):
        resp = self.client.get("/api/inventory/demand-forecast/summary/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("total_products_analyzed", resp.data)

    def test_forecast_with_enough_data_for_evaluation(self):
        """4+ weeks of data hits evaluate_model full path (forecasting.py line 121)."""
        for weeks_ago in range(5):
            sm = StockMovement.objects.create(
                product=self.product2, quantity=10 + weeks_ago,
                movement_type="OUT", notes="week data"
            )
            sm.timestamp = timezone.now() - timedelta(weeks=weeks_ago)
            sm.save()
        resp = self.client.get(f"/api/inventory/demand-forecast/?product_id={self.product2.id}")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_forecast_decreasing_trend_hits_summary_branch(self):
        """Hits forecasting.py lines 130,132 - decreasing branch in get_forecasting_summary."""
        p = Product.objects.create(
            name="Declining", sku="DEC001", category=self.category,
            unit_volume=1.0, unit_weight=1.0
        )
        # Large quantities weeks ago, tiny quantity recently = strong decreasing trend
        quantities = [200, 150, 100, 50, 10, 1]
        for i, weeks_ago in enumerate([5, 4, 3, 2, 1, 0]):
            sm = StockMovement.objects.create(
                product=p, quantity=quantities[i],
                movement_type="OUT", notes="declining"
            )
            sm.timestamp = timezone.now() - timedelta(weeks=weeks_ago, days=1)
            sm.save()
        resp = self.client.get("/api/inventory/demand-forecast/summary/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("products_with_decreasing_demand", resp.data)


class ABCClassificationTests(InventoryBaseTest):
    def test_abc_has_all_expected_classes(self):
        """Hits A class, B/C cumulative branch, and zero-movement C branch."""
        resp = self.client.get("/api/inventory/abc-classification/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        classes = {item["sku"]: item["abc_class"] for item in resp.data}
        # All products must appear
        self.assertIn("TST001", classes)
        self.assertIn("TST002", classes)
        self.assertIn("TST003", classes)
        # product2 has zero OUT � must be C via zero-movement branch
        self.assertEqual(classes.get("TST002"), "C")
        # product1 has massive OUT (800 total) � must be A
        self.assertEqual(classes.get("TST001"), "A")
        # product3 has tiny OUT (1 unit) � B or C cumulative branch
        self.assertIn(classes.get("TST003"), ["B", "C"])


class ProductVelocityTests(InventoryBaseTest):
    def test_velocity_endpoint(self):
        resp = self.client.get("/api/inventory/product-velocity/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("total_outbound_quantity", resp.data[0])


class StockMovementTests(InventoryBaseTest):
    def test_create_movement_in(self):
        resp = self.client.post("/api/inventory/stock-movements/", {
            "product": self.product.id, "quantity": 20, "movement_type": "IN", "notes": "Arrived"
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_create_movement_out(self):
        resp = self.client.post("/api/inventory/stock-movements/", {
            "product": self.product.id, "quantity": 5, "movement_type": "OUT", "notes": "Shipped"
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_staff_cannot_delete_movement(self):
        sm = StockMovement.objects.first()
        resp2 = self.client.post("/api/token/", {"username": "inv_staff", "password": "staff123"})
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {resp2.data["access"]}')
        resp = self.client.delete(f"/api/inventory/stock-movements/{sm.id}/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


class SpaceAllocationTests(InventoryBaseTest):
    def test_create_space_allocation(self):
        resp = self.client.post("/api/inventory/space-allocations/", {
            "product": self.product.id, "shelf": self.shelf.id,
            "allocated_volume": 10.0, "utilization_percentage": 20.0
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)


class TransferRequestTests(InventoryBaseTest):
    def _create_transfer(self):
        return StockTransferRequest.objects.create(
            product=self.product, quantity=5,
            from_inventory=self.inv, to_inventory=self.inv2,
            requested_by=self.admin, reason="Test", status="PENDING"
        )

    def test_staff_sees_own_transfers_only(self):
        """Hits non-admin get_queryset branch (views.py line 108/111)."""
        t = self._create_transfer()
        # Staff user only sees their own � this exercises the filter branch
        resp2 = self.client.post("/api/token/", {"username": "inv_staff", "password": "staff123"})
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {resp2.data["access"]}')
        # Create a transfer owned by staff
        StockTransferRequest.objects.create(
            product=self.product, quantity=2,
            from_inventory=self.inv, to_inventory=self.inv2,
            requested_by=self.staff, reason="Staff transfer", status="PENDING"
        )
        resp = self.client.get("/api/inventory/transfer-requests/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # Staff should only see their own, not admin's
        for item in resp.data["results"] if "results" in resp.data else resp.data:
            self.assertEqual(item["requested_by"], self.staff.id)

    def test_approve_transfer(self):
        t = self._create_transfer()
        resp = self.client.post(f"/api/inventory/transfer-requests/{t.id}/approve/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        t.refresh_from_db()
        self.assertEqual(t.status, "APPROVED")

    def test_approve_non_pending_fails(self):
        t = self._create_transfer()
        t.status = "APPROVED"
        t.save()
        resp = self.client.post(f"/api/inventory/transfer-requests/{t.id}/approve/")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reject_transfer(self):
        t = self._create_transfer()
        resp = self.client.post(f"/api/inventory/transfer-requests/{t.id}/reject/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        t.refresh_from_db()
        self.assertEqual(t.status, "REJECTED")

    def test_reject_non_pending_fails(self):
        t = self._create_transfer()
        t.status = "REJECTED"
        t.save()
        resp = self.client.post(f"/api/inventory/transfer-requests/{t.id}/reject/")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class AdjustmentRequestTests(InventoryBaseTest):
    def test_create_adjustment_request(self):
        resp = self.client.post("/api/inventory/adjustment-requests/", {
            "inventory": self.inv.id, "requested_quantity": 60,
            "adjustment_type": "ADD", "reason": "Stock count correction"
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_approve_adjustment_request(self):
        adj = InventoryAdjustmentRequest.objects.create(
            inventory=self.inv, requested_by=self.admin,
            requested_quantity=70, adjustment_type="ADD",
            reason="Correction", status="PENDING"
        )
        resp = self.client.post(f"/api/inventory/adjustment-requests/{adj.id}/approve/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        adj.refresh_from_db()
        self.assertEqual(adj.status, "APPROVED")

    def test_approve_non_pending_fails(self):
        adj = InventoryAdjustmentRequest.objects.create(
            inventory=self.inv, requested_by=self.admin,
            requested_quantity=70, adjustment_type="ADD",
            reason="Already done", status="APPROVED"
        )
        resp = self.client.post(f"/api/inventory/adjustment-requests/{adj.id}/approve/")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reject_adjustment_request(self):
        adj = InventoryAdjustmentRequest.objects.create(
            inventory=self.inv, requested_by=self.admin,
            requested_quantity=70, adjustment_type="REMOVE",
            reason="Reject me", status="PENDING"
        )
        resp = self.client.post(f"/api/inventory/adjustment-requests/{adj.id}/reject/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        adj.refresh_from_db()
        self.assertEqual(adj.status, "REJECTED")

    def test_reject_non_pending_fails(self):
        adj = InventoryAdjustmentRequest.objects.create(
            inventory=self.inv, requested_by=self.admin,
            requested_quantity=70, adjustment_type="REMOVE",
            reason="Already rejected", status="REJECTED"
        )
        resp = self.client.post(f"/api/inventory/adjustment-requests/{adj.id}/reject/")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class ModelStrTests(InventoryBaseTest):
    def test_category_str(self):
        self.assertIn("TestCat", str(self.category))

    def test_product_str(self):
        self.assertIn("TestProd", str(self.product))

    def test_inventory_str(self):
        self.assertIn("TestProd", str(self.inv))

    def test_stock_movement_str(self):
        sm = StockMovement.objects.filter(product=self.product).first()
        self.assertIn("TestProd", str(sm))

    def test_space_allocation_str(self):
        sa = SpaceAllocation.objects.create(
            product=self.product, shelf=self.shelf,
            allocated_volume=5.0, utilization_percentage=10.0
        )
        self.assertIn("TestProd", str(sa))

    def test_transfer_request_str(self):
        t = StockTransferRequest.objects.create(
            product=self.product, quantity=5,
            from_inventory=self.inv, to_inventory=self.inv2,
            requested_by=self.admin, reason="Test", status="PENDING"
        )
        self.assertIn("Transfer", str(t))

    def test_adjustment_request_str(self):
        adj = InventoryAdjustmentRequest.objects.create(
            inventory=self.inv, requested_by=self.admin,
            requested_quantity=10, adjustment_type="ADD",
            reason="Test", status="PENDING"
        )
        self.assertIn("Adjustment", str(adj))


class CoverageBoostTests(InventoryBaseTest):
    def test_create_transfer_request_via_post(self):
        resp = self.client.post('/api/inventory/transfer-requests/', {
            'product': self.product.id,
            'quantity': 3,
            'from_inventory': self.inv.id,
            'to_inventory': self.inv2.id,
            'reason': 'POST test',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_abc_hits_b_class(self):
        from inventory.models import Product, StockMovement
        p_b = Product.objects.create(
            name='BProd', sku='BBB001', category=self.category,
            unit_volume=1.0, unit_weight=1.0
        )
        # product1 already has 800 OUT (takes A at <70%)
        # Give p_b enough to land in 70-90% cumulative range
        StockMovement.objects.create(product=p_b, quantity=150, movement_type='OUT', notes='b')
        resp = self.client.get('/api/inventory/abc-classification/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        classes = {item['sku']: item['abc_class'] for item in resp.data}
        self.assertIn(classes.get('BBB001'), ['B', 'C'])

    def test_forecast_summary_no_products(self):
        from inventory.forecasting import get_forecasting_summary
        from unittest.mock import patch
        with patch('inventory.forecasting.forecast_all_products', return_value=[]):
            result = get_forecasting_summary()
        self.assertIn('message', result)

    def test_moving_average_forecast(self):
        from inventory.forecasting import moving_average_forecast, compare_models
        data = [(0, 10), (1, 20), (2, 30), (3, 40), (4, 50)]
        result = moving_average_forecast(data, window=3, forecast_periods=4)
        self.assertEqual(len(result), 4)
        self.assertTrue(all(r >= 0 for r in result))
        result2 = moving_average_forecast([], forecast_periods=4)
        self.assertEqual(result2, [0, 0, 0, 0])
        comparison = compare_models(data)
        self.assertIn('selected_model', comparison)
        self.assertIn('linear_regression', comparison)
        self.assertIn('moving_average', comparison)
        short = compare_models([(0, 10), (1, 20)])
        self.assertIn('note', short)

    def test_forecast_summary_increasing_decreasing(self):
        from inventory.forecasting import get_forecasting_summary
        from unittest.mock import patch
        fake = [
            {'product_name': 'P1', 'sku': 'S1', 'trend': 'increasing',
             'model_evaluation': {'mae': 1.0, 'model_accuracy': 'Good'}},
            {'product_name': 'P2', 'sku': 'S2', 'trend': 'decreasing',
             'model_evaluation': {'mae': 1.0, 'model_accuracy': 'Fair'}},
        ]
        with patch('inventory.forecasting.forecast_all_products', return_value=fake):
            result = get_forecasting_summary()
        self.assertEqual(len(result['products_with_increasing_demand']), 1)
        self.assertEqual(len(result['products_with_decreasing_demand']), 1)

