from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_invalid_repository_owner_is_rejected():
    response = client.get("/api/repositories/invalid%20owner/repo")
    assert response.status_code == 400
