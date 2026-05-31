"""共享测试 fixtures"""
import os
import pytest

# 确保测试使用 SQLite 内存数据库
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("FLASK_ENV", "development")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-32-bytes-minimum-for-sha256-hmac")


@pytest.fixture(autouse=True)
def reset_rate_limits():
    """每个测试前重置限流状态，避免跨测试泄漏"""
    from rate_limit import reset
    reset()


@pytest.fixture
def app():
    from app import app
    app.config["TESTING"] = True
    return app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_headers():
    """返回已认证用户的 token 和 headers"""
    from app import app as flask_app
    flask_app.config["TESTING"] = True
    client = flask_app.test_client()
    resp = client.post("/api/v1/auth/register", json={
        "username": "fixture_user", "password": "testpassword"
    })
    token = resp.get_json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}
