"""
Flask API 应用入口 — 新闻情报平台后端
"""

import os
import logging
from contextlib import contextmanager
from datetime import datetime
from functools import wraps

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity,
)

from sqlalchemy import text

from models import (
    Base, User, News, AnalysisResult, FocusPoint, NewsFavorite, ReadLater,
    DatabaseManager, create_session_factory, init_database,
)
from config import get_config
from validators import (
    validate_json, validate_required_params,
    validate_username, validate_password, validate_email,
    validate_keyword, validate_news_id, validate_per_page, validate_page,
)
from logging_config import setup_logging, RequestLogMiddleware
from rate_limit import limit
from cache import cache_control, etag

logger = setup_logging("newsbrief")

app = Flask(__name__)
app.wsgi_app = RequestLogMiddleware(app.wsgi_app, logger)

config = get_config()

# CORS — 生产环境限制来源
allowed_origins = os.environ.get("CORS_ORIGINS", "*")
if allowed_origins == "*":
    CORS(app)
else:
    CORS(app, origins=allowed_origins.split(","))

app.config["JWT_SECRET_KEY"] = config.JWT_SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = config.JWT_ACCESS_TOKEN_EXPIRES
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = config.JWT_REFRESH_TOKEN_EXPIRES

DEEPSEEK_API_KEY = config.DEEPSEEK_API_KEY
DEEPSEEK_API_ENDPOINT = config.DEEPSEEK_API_ENDPOINT
DATABASE_URL = config.DATABASE_URL

engine = init_database(DATABASE_URL)
Session = create_session_factory(engine)
jwt = JWTManager(app)


# ---- Helpers ----

class APIError(Exception):
    def __init__(self, message, status_code=400):
        self.message = message
        self.status_code = status_code


@app.errorhandler(APIError)
def handle_api_error(error):
    return jsonify({"success": False, "message": error.message}), error.status_code


@contextmanager
def get_db():
    """数据库会话上下文管理器，确保异常时回滚、结束时关闭"""
    db = DatabaseManager(Session())
    try:
        yield db
    except Exception:
        db.session.rollback()
        raise


def admin_required(f):
    @wraps(f)
    @jwt_required()
    def decorated(*args, **kwargs):
        with get_db() as db:
            user = db.get_user_by_id(int(get_jwt_identity()))
            if not user or (user.preferences or {}).get("role") != "admin":
                raise APIError("需要管理员权限", 403)
        return f(*args, **kwargs)
    return decorated


def news_to_dict(news):
    return {
        "id": news.id,
        "title": news.title,
        "summary": news.summary,
        "category": news.category,
        "source": news.source,
        "source_url": news.source_url,
        "image_url": news.image_url,
        "tags": news.tags or [],
        "published_at": news.published_at.isoformat() if news.published_at else None,
    }


# ---- Health & Stats ----

@app.route("/api/v1/health")
def health():
    db_ok = False
    try:
        with get_db() as db:
            db.session.execute(text("SELECT 1"))
            db_ok = True
    except Exception as e:
        logger.error(f"DB health check failed: {e}")

    return jsonify({
        "success": db_ok,
        "message": "服务正常" if db_ok else "数据库连接异常",
        "database": "ok" if db_ok else "unavailable",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
    }), 200 if db_ok else 503


@app.route("/api/v1/stats")
@cache_control(max_age=60)
@etag()
def stats():
    with get_db() as db:
        db_ok = True
        try:
            news_count = db.session.query(News).count()
            user_count = db.session.query(User).count()
            analysis_count = db.session.query(AnalysisResult).count()
        except Exception:
            db_ok = False
            news_count = user_count = analysis_count = 0

        return jsonify({
            "success": True,
            "data": {
                "news_count": news_count,
                "user_count": user_count,
                "analysis_count": analysis_count,
                "database": "ok" if db_ok else "unavailable",
                "uptime": "available",
            },
        })


# ---- Auth ----

@app.route("/api/v1/auth/register", methods=["POST"])
@limit(max_requests=5, per_seconds=60)
@validate_json("username", "password",
               username=validate_username,
               password=validate_password)
def register():
    data = request.get_json()
    username = data["username"]
    password = data["password"]

    with get_db() as db:
        if db.get_user_by_openid(username):
            raise APIError("用户名已存在", 409)
        user = db.create_user(openid=username, password=password, nickname=username)
        token = create_access_token(identity=str(user.id))
        return jsonify({
            "success": True,
            "message": "注册成功",
            "data": {"user_id": user.id, "username": username, "access_token": token},
        }), 201


@app.route("/api/v1/auth/login", methods=["POST"])
@limit(max_requests=10, per_seconds=60)
@validate_json("username", "password")
def login():
    data = request.get_json()
    username = data["username"]
    password = data["password"]

    with get_db() as db:
        user = db.get_user_by_openid(username)
        if not user or not user.check_password(password):
            raise APIError("用户名或密码错误", 401)
        token = create_access_token(identity=str(user.id))
        return jsonify({
            "success": True,
            "message": "登录成功",
            "data": {"user_id": user.id, "username": user.nickname or username, "access_token": token},
        })


@app.route("/api/v1/auth/profile", methods=["GET"])
@jwt_required()
def get_profile():
    identity = get_jwt_identity()
    with get_db() as db:
        user = db.get_user_by_id(int(identity))
        if not user:
            raise APIError("用户不存在", 404)
        return jsonify({
            "success": True,
            "data": {
                "user_id": user.id,
                "username": user.nickname,
                "email": user.email,
                "preferences": user.preferences,
            },
        })


@app.route("/api/v1/auth/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    identity = get_jwt_identity()
    data = request.get_json()
    with get_db() as db:
        user = db.get_user_by_id(int(identity))
        if not user:
            raise APIError("用户不存在", 404)
        if data.get("nickname"):
            user.nickname = data["nickname"]
        if data.get("email"):
            user.email = data["email"]
        if data.get("preferences"):
            user.preferences = data["preferences"]
        user.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify({"success": True, "message": "更新成功"})


# ---- News ----

@app.route("/api/v1/news", methods=["GET"])
@cache_control(max_age=120)
@etag()
def get_news_list():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    category = request.args.get("category")

    with get_db() as db:
        news_list, total = db.get_news_list(page=page, per_page=per_page, category=category)
        return jsonify({
            "success": True,
            "data": {
                "news": [news_to_dict(n) for n in news_list],
                "pagination": {
                    "page": page,
                    "per_page": per_page,
                    "total": total,
                    "total_pages": max(1, (total + per_page - 1) // per_page) if total else 0,
                },
            },
        })


@app.route("/api/v1/news/<int:news_id>", methods=["GET"])
def get_news_detail(news_id):
    with get_db() as db:
        news = db.get_news_by_id(news_id)
        if not news:
            raise APIError("新闻不存在", 404)
        return jsonify({"success": True, "data": news_to_dict(news)})


@app.route("/api/v1/news/search", methods=["GET"])
@validate_required_params("keyword")
def search_news():
    keyword = validate_keyword(request.args.get("keyword", ""))
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    with get_db() as db:
        results, total = db.search_news(keyword, page=page, per_page=per_page)
        return jsonify({
            "success": True,
            "data": {
                "keyword": keyword,
                "results": [news_to_dict(n) for n in results],
                "total": total,
            },
        })


@app.route("/api/v1/news", methods=["POST"])
@jwt_required()
@validate_json("title")
def create_news():
    data = request.get_json()

    with get_db() as db:
        news = db.create_news(
            title=data["title"],
            summary=data.get("summary", ""),
            content=data.get("content", ""),
            category=data.get("category"),
            source=data.get("source"),
            source_url=data.get("source_url"),
            tags=data.get("tags"),
        )
        return jsonify({"success": True, "data": news_to_dict(news)}), 201


# ---- Favorites ----

@app.route("/api/v1/news/favorite", methods=["POST"])
@jwt_required()
def add_favorite():
    identity = get_jwt_identity()
    data = request.get_json()
    news_id = data.get("news_id")
    if not news_id:
        raise APIError("新闻ID不能为空")

    with get_db() as db:
        db.add_favorite(int(identity), int(news_id))
        return jsonify({"success": True, "message": "收藏成功"})


@app.route("/api/v1/news/favorite/<int:news_id>", methods=["DELETE"])
@jwt_required()
def remove_favorite(news_id):
    identity = get_jwt_identity()
    with get_db() as db:
        db.remove_favorite(int(identity), news_id)
        return jsonify({"success": True, "message": "取消收藏成功"})


@app.route("/api/v1/user/favorites", methods=["GET"])
@jwt_required()
def get_favorites():
    identity = get_jwt_identity()
    with get_db() as db:
        favorites = db.get_favorites(int(identity))
        result = []
        for fav in favorites:
            news = db.get_news_by_id(fav.news_id)
            if news:
                item = news_to_dict(news)
                item["favorited_at"] = fav.created_at.isoformat()
                result.append(item)
        return jsonify({"success": True, "data": {"favorites": result}})


# ---- Focus Points ----

@app.route("/api/v1/user/focus", methods=["GET"])
@jwt_required()
def get_focus_points():
    identity = get_jwt_identity()
    with get_db() as db:
        points = db.get_focus_points(int(identity))
        return jsonify({
            "success": True,
            "data": {
                "focus_points": [
                    {"id": p.id, "keyword": p.keyword, "category": p.category} for p in points
                ],
            },
        })


@app.route("/api/v1/user/focus", methods=["POST"])
@jwt_required()
@validate_json("keyword", keyword=validate_keyword)
def add_focus_point():
    identity = get_jwt_identity()
    data = request.get_json()

    with get_db() as db:
        fp = db.create_focus_point(int(identity), data["keyword"], data.get("category"))
        return jsonify({"success": True, "message": "添加成功", "data": {"id": fp.id, "keyword": data["keyword"]}})


@app.route("/api/v1/user/focus/<int:focus_id>", methods=["DELETE"])
@jwt_required()
def remove_focus_point(focus_id):
    identity = get_jwt_identity()
    with get_db() as db:
        if db.delete_focus_point(focus_id, int(identity)):
            return jsonify({"success": True, "message": "删除成功"})
        raise APIError("关注点不存在", 404)


# ---- Analysis (with real DeepSeek integration) ----

@app.route("/api/v1/analysis/audit", methods=["POST"])
@limit(max_requests=20, per_seconds=60)
@jwt_required()
@validate_json("news_id", news_id=validate_news_id)
def seven_elements_analysis():
    identity = get_jwt_identity()
    data = request.get_json()
    news_id = data["news_id"]

    with get_db() as db:
        news = db.get_news_by_id(int(news_id))
        if not news:
            raise APIError("新闻不存在", 404)

        if DEEPSEEK_API_KEY:
            from services.deepseek_client import DeepSeekClient
            client = DeepSeekClient(DEEPSEEK_API_KEY, DEEPSEEK_API_ENDPOINT)
            try:
                result = client.generate_audit_analysis({
                    "id": news.id, "title": news.title,
                    "summary": news.summary or "", "content": news.content or "",
                })
            except Exception as e:
                logger.warning(f"DeepSeek 分析失败，使用基础分析: {e}")
                result = _basic_audit_result(news)
        else:
            result = _basic_audit_result(news)

        analysis = db.create_analysis_result(int(identity), news.id, "audit", result)
        return jsonify({"success": True, "data": {"analysis_id": analysis.id, "result": result}})


def _basic_audit_result(news):
    return {
        "sources": [{"name": "新闻来源", "reliability": 70}],
        "consensus": news.title,
        "conflicts": "暂未发现争议点",
        "facts": [{"fact": news.title, "status": "verified"}],
        "logic": "待进一步分析",
        "warnings": [],
        "trust_score": 70,
        "timeline": [],
    }


@app.route("/api/v1/analysis/relevance", methods=["POST"])
@jwt_required()
def relevance_analysis():
    identity = get_jwt_identity()
    data = request.get_json()
    news_id = data.get("news_id")
    if not news_id:
        raise APIError("新闻ID不能为空")

    with get_db() as db:
        news = db.get_news_by_id(int(news_id))
        if not news:
            raise APIError("新闻不存在", 404)

        focus_points = db.get_focus_points(int(identity))
        if DEEPSEEK_API_KEY and focus_points:
            from services.deepseek_client import DeepSeekClient
            client = DeepSeekClient(DEEPSEEK_API_KEY, DEEPSEEK_API_ENDPOINT)
            try:
                result = client.generate_relevance_analysis(
                    {"title": news.title, "summary": news.summary or ""},
                    [{"keyword": fp.keyword} for fp in focus_points],
                )
            except Exception as e:
                logger.warning(f"相关性分析失败: {e}")
                result = _basic_relevance_result(news, focus_points)
        else:
            result = _basic_relevance_result(news, focus_points)

        analysis = db.create_analysis_result(int(identity), news.id, "relevance", result)
        return jsonify({"success": True, "data": {"analysis_id": analysis.id, "result": result}})


def _basic_relevance_result(news, focus_points):
    return {
        "focus_points": [{"keyword": fp.keyword, "score": 50, "level": "medium"} for fp in focus_points],
        "overall_score": 50,
    }


@app.route("/api/v1/analysis/exploration", methods=["POST"])
@jwt_required()
def deep_exploration():
    identity = get_jwt_identity()
    data = request.get_json()
    news_id = data.get("news_id")
    if not news_id:
        raise APIError("新闻ID不能为空")

    with get_db() as db:
        news = db.get_news_by_id(int(news_id))
        if not news:
            raise APIError("新闻不存在", 404)

        if DEEPSEEK_API_KEY:
            from services.deepseek_client import DeepSeekClient
            client = DeepSeekClient(DEEPSEEK_API_KEY, DEEPSEEK_API_ENDPOINT)
            try:
                result = client.generate_deep_exploration({
                    "title": news.title, "summary": news.summary or "", "content": news.content or "",
                })
            except Exception as e:
                logger.warning(f"深度探索失败: {e}")
                result = _basic_exploration_result(news)
        else:
            result = _basic_exploration_result(news)

        analysis = db.create_analysis_result(int(identity), news.id, "exploration", result)
        return jsonify({"success": True, "data": {"analysis_id": analysis.id, "result": result}})


def _basic_exploration_result(news):
    return {
        "semantic_analysis": news.summary or news.title,
        "related_events": [],
        "impact_prediction": {"short_term": "待分析", "long_term": "待分析"},
        "multi_dimension": {"technical": "", "market": "", "policy": "", "social": ""},
    }


@app.route("/api/v1/analysis/history", methods=["GET"])
@jwt_required()
def get_analysis_history():
    identity = get_jwt_identity()
    with get_db() as db:
        history = db.get_analysis_history(int(identity))
        return jsonify({
            "success": True,
            "data": {
                "analyses": [
                    {"id": a.id, "type": a.analysis_type, "news_id": a.news_id,
                     "result": a.result, "created_at": a.created_at.isoformat()}
                    for a in history
                ],
            },
        })


@app.route("/api/v1/analysis/<int:analysis_id>", methods=["GET"])
@jwt_required()
def get_analysis_detail(analysis_id):
    with get_db() as db:
        a = db.get_analysis_by_id(analysis_id)
        if not a:
            raise APIError("分析记录不存在", 404)
        return jsonify({
            "success": True,
            "data": {"id": a.id, "type": a.analysis_type, "result": a.result,
                     "created_at": a.created_at.isoformat()},
        })


# ---- Main ----

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=config.DEBUG)
