from locust import HttpUser, task, between
import json

class WarehouseUser(HttpUser):
    wait_time = between(1, 3)
    token = None

    def on_start(self):
        res = self.client.post("/api/token/", json={
            "username": "admin",
            "password": "admin123"
        })
        if res.status_code == 200:
            self.token = res.json().get("access")

    def auth(self):
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    @task(3)
    def view_dashboard(self):
        self.client.get("/api/dashboard-summary/", headers=self.auth())

    @task(3)
    def list_inventory(self):
        self.client.get("/api/inventory/", headers=self.auth())

    @task(2)
    def list_products(self):
        self.client.get("/api/products/", headers=self.auth())

    @task(2)
    def list_warehouses(self):
        self.client.get("/api/warehouses/", headers=self.auth())

    @task(2)
    def list_stock_movements(self):
        self.client.get("/api/stock-movements/", headers=self.auth())

    @task(1)
    def list_notifications(self):
        self.client.get("/api/notifications/", headers=self.auth())

    @task(1)
    def view_analytics(self):
        self.client.get("/api/analytics/?type=slow_moving", headers=self.auth())

    @task(1)
    def list_reports(self):
        self.client.get("/api/reports/", headers=self.auth())