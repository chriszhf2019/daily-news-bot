"""
后端 API 基础测试
使用 SQLite 内存数据库，无需 PostgreSQL
conftest.py 提供共享 fixtures: app, client, reset_rate_limits
"""

import json
import pytest
from models import User


class TestHealth:
    def test_health_check(self, client):
        resp = client.get("/api/v1/health")
        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert data["success"] is True
        assert data["version"] == "1.0.0"


class TestAuth:
    def test_register_missing_fields(self, client):
        resp = client.post("/api/v1/auth/register", json={})
        assert resp.status_code == 400

        resp = client.post("/api/v1/auth/register", json={"username": "test"})
        assert resp.status_code == 400

    def test_register_short_password(self, client):
        resp = client.post("/api/v1/auth/register", json={"username": "test", "password": "123"})
        assert resp.status_code == 400

    def test_register_and_login(self, client, app):
        # 注册
        resp = client.post("/api/v1/auth/register", json={
            "username": "testuser", "password": "secure123"
        })
        assert resp.status_code == 201
        data = json.loads(resp.data)
        assert data["success"] is True
        user_id = data["data"]["user_id"]

        # 注册后需先审核（直接操作 app 的数据库 session）
        from models import DatabaseManager, create_session_factory
        db2 = DatabaseManager(create_session_factory(app.config.get("_engine"))())
        db2.approve_user(user_id)
        db2.close()

        # 登录
        resp = client.post("/api/v1/auth/login", json={
            "username": "testuser", "password": "secure123"
        })
        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert data["success"] is True
        assert "access_token" in data["data"]

        # 获取个人信息
        token = data["data"]["access_token"]
        resp = client.get("/api/v1/auth/profile", headers={
            "Authorization": f"Bearer {token}"
        })
        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert data["data"]["username"] == "testuser"

    def test_login_wrong_password(self, client):
        client.post("/api/v1/auth/register", json={
            "username": "testuser2", "password": "secure123"
        })
        resp = client.post("/api/v1/auth/login", json={
            "username": "testuser2", "password": "wrong"
        })
        assert resp.status_code == 401

    def test_login_missing_fields(self, client):
        resp = client.post("/api/v1/auth/login", json={})
        assert resp.status_code == 400


class TestNews:
    def test_get_news_list(self, client):
        resp = client.get("/api/v1/news")
        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert data["success"] is True
        assert "news" in data["data"]
        assert "pagination" in data["data"]

    def test_search_news_empty_keyword(self, client):
        resp = client.get("/api/v1/news/search?keyword=")
        assert resp.status_code == 400

    def test_search_news(self, client):
        resp = client.get("/api/v1/news/search?keyword=AI")
        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert data["success"] is True


class TestModels:
    def test_user_password_hashing(self):
        user = User(openid="test_user")
        user.set_password("secure123")
        assert user.password_hash is not None
        assert ":" in user.password_hash
        assert user.check_password("secure123") is True
        assert user.check_password("wrong") is False


class TestStats:
    def test_stats_endpoint(self, client):
        resp = client.get("/api/v1/stats")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["success"] is True
        assert "news_count" in data["data"]
        assert "user_count" in data["data"]


class TestRateLimit:
    def test_register_rate_limit(self, client):
        for i in range(6):
            resp = client.post("/api/v1/auth/register", json={
                "username": f"ratelimit_{i}", "password": "test123"
            })
        assert resp.status_code == 429
        assert "过于频繁" in resp.get_json()["message"]


class TestPipeline:
    """管道集成测试（不调用外部 API）"""

    def test_pipeline_module_imports(self):
        """验证管道模块可正确导入"""
        import sys
        import os
        sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
        from pipeline import RSS_SOURCES
        assert len(RSS_SOURCES) >= 3
        for src in RSS_SOURCES:
            assert isinstance(src["name"], str) and src["name"]
            assert isinstance(src["url"], str) and src["url"]
            assert isinstance(src["category"], str) and src["category"]

    def test_news_creation_via_api(self, client):
        """通过 API 创建新闻并验证"""
        token_resp = client.post("/api/v1/auth/register", json={
            "username": "pipeline_test", "password": "testpass123"
        })
        token = token_resp.get_json()["data"]["access_token"]

        resp = client.post("/api/v1/news", json={
            "title": "Test News from Pipeline",
            "summary": "A test news summary",
            "content": "Full content of the test news",
            "category": "AI动态",
            "source": "Test Source",
            "tags": ["test", "pipeline"],
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 201

        news_id = resp.get_json()["data"]["id"]
        resp = client.get(f"/api/v1/news/{news_id}")
        assert resp.status_code == 200
        assert resp.get_json()["data"]["title"] == "Test News from Pipeline"


class TestSmoke:
    """端到端冒烟测试"""

    def test_full_auth_flow(self, client):
        resp = client.post("/api/v1/auth/register", json={
            "username": "smoke_test", "password": "testpass123"
        })
        assert resp.status_code == 201
        token = resp.get_json()["data"]["access_token"]

        resp = client.get("/api/v1/auth/profile", headers={
            "Authorization": f"Bearer {token}"
        })
        assert resp.status_code == 200
        assert resp.get_json()["data"]["username"] == "smoke_test"

        resp = client.post("/api/v1/user/focus", json={
            "keyword": "AI", "category": "tech"
        }, headers={"Authorization": f"Bearer {token}"})
        assert resp.status_code == 200

        resp = client.get("/api/v1/user/focus", headers={
            "Authorization": f"Bearer {token}"
        })
        assert resp.status_code == 200
        assert resp.get_json()["data"]["focus_points"][0]["keyword"] == "AI"
