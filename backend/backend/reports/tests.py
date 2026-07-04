from unittest.mock import patch
from rest_framework.test import APITestCase
from rest_framework import status
from users.models import CustomUser
from inventory.models import Category, Product, Inventory, StockMovement
from warehouses.models import Warehouse, Zone, Rack, Shelf
from reports.models import Report


class ReportsTests(APITestCase):

    def setUp(self):
        self.admin = CustomUser.objects.create_superuser(
            username="admin_r", password="admin123", email="admin_r@test.com", role="ADMIN"
        )
        resp = self.client.post("/api/token/", {"username": "admin_r", "password": "admin123"})
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {resp.data["access"]}')
        self.category = Category.objects.create(name="RepCat")
        self.product = Product.objects.create(
            name="RepProd", sku="REP001", category=self.category,
            unit_volume=1.0, unit_weight=0.5
        )
        wh = Warehouse.objects.create(
            name="RepWH", location="Chennai", total_capacity=1000,
            available_capacity=800
        )
        Warehouse.objects.create(
            name="ZeroWH", location="Delhi", total_capacity=0,
            available_capacity=0
        )
        zone = Zone.objects.create(warehouse=wh, name="RZ1", capacity=500)
        rack = Rack.objects.create(zone=zone, rack_code="RR1", capacity=100)
        shelf = Shelf.objects.create(rack=rack, shelf_code="RS1", capacity=50)
        self.inv = Inventory.objects.create(product=self.product, shelf=shelf, quantity=20)
        StockMovement.objects.create(product=self.product, quantity=5, movement_type="OUT", notes="Sale")
        StockMovement.objects.create(product=self.product, quantity=3, movement_type="IN", notes="Restock")

    def _create_report(self, report_type, title):
        resp = self.client.post("/api/reports/reports/", {"report_type": report_type, "title": title})
        self.assertIn(resp.status_code, [200, 201])
        return resp.data["id"]

    def test_create_inventory_report(self):
        resp = self.client.post("/api/reports/reports/", {"report_type": "INVENTORY", "title": "Inv Report"})
        self.assertIn(resp.status_code, [200, 201])

    def test_create_stock_report(self):
        resp = self.client.post("/api/reports/reports/", {"report_type": "STOCK", "title": "Stock Report"})
        self.assertIn(resp.status_code, [200, 201])

    def test_create_warehouse_report(self):
        resp = self.client.post("/api/reports/reports/", {"report_type": "WAREHOUSE", "title": "WH Report"})
        self.assertIn(resp.status_code, [200, 201])

    def test_create_space_report(self):
        resp = self.client.post("/api/reports/reports/", {"report_type": "SPACE", "title": "Space Report"})
        self.assertIn(resp.status_code, [200, 201])

    def test_list_reports(self):
        resp = self.client.get("/api/reports/reports/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_forecasting_report_endpoint(self):
        resp = self.client.get("/api/reports/reports/forecasting/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["report_type"], "FORECASTING")
        self.assertIn("summary", resp.data)

    def test_dashboard_summary_endpoint(self):
        resp = self.client.get("/api/reports/dashboard-summary/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_analytics_endpoint(self):
        resp = self.client.get("/api/reports/analytics/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_analytics_dead_stock(self):
        resp = self.client.get("/api/reports/analytics/?type=dead_stock")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["report_type"], "dead_stock")

    def test_analytics_turnover_with_data(self):
        resp = self.client.get("/api/reports/analytics/?type=turnover")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["report_type"], "turnover")

    def test_analytics_invalid_type(self):
        resp = self.client.get("/api/reports/analytics/?type=invalid")
        self.assertEqual(resp.status_code, 400)

    def test_export_csv_with_data(self):
        rid = self._create_report("INVENTORY", "CSV Inv")
        resp = self.client.get(f"/api/reports/reports/{rid}/export_csv/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("text/csv", resp["Content-Type"])

    def test_export_excel_with_data(self):
        rid = self._create_report("STOCK", "Excel Stock")
        resp = self.client.get(f"/api/reports/reports/{rid}/export_excel/")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("spreadsheetml", resp["Content-Type"])

    def test_export_pdf_with_data(self):
        rid = self._create_report("WAREHOUSE", "PDF WH")
        resp = self.client.get(f"/api/reports/reports/{rid}/export_pdf/")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp["Content-Type"], "application/pdf")

    def test_export_csv_empty_report(self):
        report = Report.objects.create(
            title="Empty", report_type="INVENTORY",
            generated_by=self.admin, status="COMPLETED", result={}
        )
        resp = self.client.get(f"/api/reports/reports/{report.id}/export_csv/")
        self.assertEqual(resp.status_code, 200)

    def test_export_excel_empty_report(self):
        report = Report.objects.create(
            title="EmptyXL", report_type="STOCK",
            generated_by=self.admin, status="COMPLETED", result={}
        )
        resp = self.client.get(f"/api/reports/reports/{report.id}/export_excel/")
        self.assertEqual(resp.status_code, 200)

    def test_export_pdf_empty_report(self):
        report = Report.objects.create(
            title="EmptyPDF", report_type="SPACE",
            generated_by=self.admin, status="COMPLETED", result={}
        )
        resp = self.client.get(f"/api/reports/reports/{report.id}/export_pdf/")
        self.assertEqual(resp.status_code, 200)

    def test_flatten_non_list_result(self):
        report = Report.objects.create(
            title="NonList", report_type="INVENTORY",
            generated_by=self.admin, status="COMPLETED",
            result={"meta": "string_value"}
        )
        resp = self.client.get(f"/api/reports/reports/{report.id}/export_csv/")
        self.assertEqual(resp.status_code, 200)

    def test_retrieve_report(self):
        rid = self._create_report("INVENTORY", "Retrieve Me")
        resp = self.client.get(f"/api/reports/reports/{rid}/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_delete_report(self):
        rid = self._create_report("STOCK", "Delete Me")
        resp = self.client.delete(f"/api/reports/reports/{rid}/")
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)

    def test_report_str(self):
        report = Report.objects.create(
            title="StrTest", report_type="INVENTORY",
            generated_by=self.admin, status="COMPLETED", result={}
        )
        self.assertIn("StrTest", str(report))

    def test_generate_report_exception_path(self):
        """Patch Inventory.objects to raise - hits except block lines 68-71."""
        with patch("reports.views.Inventory.objects") as mock_inv:
            mock_inv.values.side_effect = Exception("forced error")
            resp = self.client.post("/api/reports/reports/",
                {"report_type": "INVENTORY", "title": "Fail Report"})
            self.assertIn(resp.status_code, [200, 201])
        # Verify the report was saved with FAILED status
        report = Report.objects.filter(title="Fail Report").first()
        self.assertIsNotNone(report)
        self.assertEqual(report.status, "FAILED")


class WarehouseTests(APITestCase):

    def setUp(self):
        self.admin = CustomUser.objects.create_superuser(
            username="admin_w", password="admin123", email="admin_w@test.com", role="ADMIN"
        )
        resp = self.client.post("/api/token/", {"username": "admin_w", "password": "admin123"})
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {resp.data["access"]}')
        self.warehouse = Warehouse.objects.create(
            name="Test WH", location="Chennai", total_capacity=1000,
            available_capacity=800
        )

    def test_list_warehouses(self):
        resp = self.client.get("/api/warehouses/warehouses/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_create_warehouse(self):
        resp = self.client.post("/api/warehouses/warehouses/", {
            "name": "New WH", "location": "Mumbai",
            "total_capacity": 500, "available_capacity": 500
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_warehouse_kpi(self):
        resp = self.client.get("/api/warehouses/kpi/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_create_zone(self):
        resp = self.client.post("/api/warehouses/zones/", {
            "warehouse": self.warehouse.id, "name": "Zone A", "capacity": 200
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)


class OptimizationTests(APITestCase):

    def setUp(self):
        self.admin = CustomUser.objects.create_superuser(
            username="admin_o", password="admin123", email="admin_o@test.com", role="ADMIN"
        )
        resp = self.client.post("/api/token/", {"username": "admin_o", "password": "admin123"})
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {resp.data["access"]}')
        self.category = Category.objects.create(name="OptCat")
        self.product = Product.objects.create(
            name="OptProduct", sku="OPT001", category=self.category,
            unit_volume=1.0, unit_weight=0.5
        )
        wh = Warehouse.objects.create(name="OWH", location="Delhi", total_capacity=1000, available_capacity=1000)
        zone = Zone.objects.create(warehouse=wh, name="Z1", capacity=500)
        rack = Rack.objects.create(zone=zone, rack_code="OR1", capacity=100)
        self.shelf = Shelf.objects.create(rack=rack, shelf_code="OS1", capacity=50)
        self.inv = Inventory.objects.create(product=self.product, shelf=self.shelf, quantity=30)

    def test_abc_classification_endpoint(self):
        resp = self.client.get("/api/inventory/abc-classification/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_product_velocity_endpoint(self):
        resp = self.client.get("/api/inventory/product-velocity/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_warehouse_utilization_endpoint(self):
        resp = self.client.get("/api/inventory/warehouse-utilization/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_shelf_recommendation_best_fit(self):
        resp = self.client.post("/api/inventory/shelf-recommendation/",
            {"required_volume": 5.0, "strategy": "BEST_FIT"}, format="json"
        )
        self.assertIn(resp.status_code, [200, 404])

    def test_shelf_recommendation_first_fit(self):
        resp = self.client.post("/api/inventory/shelf-recommendation/",
            {"required_volume": 5.0, "strategy": "FIRST_FIT"}, format="json"
        )
        self.assertIn(resp.status_code, [200, 404])

    def test_demand_forecast_endpoint(self):
        resp = self.client.get("/api/inventory/demand-forecast/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_demand_forecast_summary_endpoint(self):
        resp = self.client.get("/api/inventory/demand-forecast/summary/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn("total_products_analyzed", resp.data)

    def test_stock_movement_in(self):
        resp = self.client.post("/api/inventory/stock-movements/", {
            "product": self.product.id, "quantity": 10, "movement_type": "IN", "notes": "Restock"
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_stock_movement_out(self):
        resp = self.client.post("/api/inventory/stock-movements/", {
            "product": self.product.id, "quantity": 5, "movement_type": "OUT", "notes": "Dispatch"
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

