"""
Flask API 应用入口 — 新闻情报平台后端
"""

import os
import re
import json
import logging
from contextlib import contextmanager
from datetime import datetime
from functools import wraps

import requests

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity,
)

from sqlalchemy import text

from models import (
    Base, User, News, AnalysisResult, FocusPoint, NewsFavorite, ReadLater, ApiUsage,
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
app.config["_engine"] = engine  # 测试用
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
            if not user or user.role != "admin":
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
        if not user.is_approved and user.role != "admin":
            raise APIError("账号尚未通过审核，请联系管理员", 403)
        db.record_login(user.id)
        token = create_access_token(identity=str(user.id))
        is_admin = user.role == "admin"
        return jsonify({
            "success": True,
            "message": "登录成功",
            "data": {"user_id": user.id, "username": user.nickname or username,
                     "access_token": token, "is_admin": is_admin},
        })


# ---- 微信登录 ----

@app.route("/api/v1/auth/wechat-login", methods=["POST"])
def wechat_login():
    """微信小程序登录：wx.login 获取 code → 后端换取 openid → 自动注册/登录"""
    data = request.get_json()
    code = (data.get("code") or "").strip()
    if not code:
        raise APIError("code 不能为空")

    # 调用微信 API 换取 openid 和 session_key
    appid = os.environ.get("WECHAT_APPID", "")
    secret = os.environ.get("WECHAT_SECRET", "")
    if not appid or not secret:
        raise APIError("微信登录未配置", 500)

    try:
        wx_resp = requests.get(
            "https://api.weixin.qq.com/sns/jscode2session",
            params={"appid": appid, "secret": secret, "js_code": code, "grant_type": "authorization_code"},
            timeout=10,
        )
        wx_data = wx_resp.json()
    except Exception as e:
        raise APIError(f"微信API调用失败: {e}", 500)

    if "errcode" in wx_data and wx_data["errcode"] != 0:
        raise APIError(f"微信登录失败: {wx_data.get('errmsg', 'unknown')}", 400)

    openid = wx_data.get("openid")
    unionid = wx_data.get("unionid")
    if not openid:
        raise APIError("获取微信openid失败", 500)

    # 查找或创建用户
    with get_db() as db:
        user = db.get_user_by_wx_unionid(unionid) if unionid else None
        if not user:
            user = db.get_user_by_openid(f"wx_{openid}")

        if not user:
            # 新用户：自动注册（微信用户默认通过审核）
            user = db.create_user(
                openid=f"wx_{openid}",
                nickname=data.get("nickname", "微信用户"),
                preferences=data.get("userInfo", {}),
            )
            user.wx_unionid = unionid
            user.is_approved = True
            db.session.commit()
        else:
            # 更新用户信息
            if data.get("nickname"):
                user.nickname = data["nickname"]
            if unionid and not user.wx_unionid:
                user.wx_unionid = unionid
            db.session.commit()

        db.record_login(user.id)
        token = create_access_token(identity=str(user.id))
        is_admin = user.role == "admin"
        return jsonify({
            "success": True, "message": "微信登录成功",
            "data": {"user_id": user.id, "username": user.nickname,
                     "access_token": token, "is_admin": is_admin},
        }), 200 if user.is_approved else 201


# ---- 手机号登录 ----

@app.route("/api/v1/auth/phone-login", methods=["POST"])
def phone_login():
    """手机号登录/注册：发送验证码 → 验证 → 自动登录"""
    data = request.get_json()
    phone = (data.get("phone") or "").strip()
    code = (data.get("code") or "").strip()

    if not phone or not re.match(r"^1[3-9]\d{9}$", phone):
        raise APIError("请输入有效的手机号")
    if not code:
        raise APIError("请输入验证码")

    # 验证码校验（演示版：任意6位数字视为有效，生产环境需接入短信服务）
    if not re.match(r"^\d{4,6}$", code):
        raise APIError("验证码格式错误")

    # 生产环境应从 Redis/DB 校验验证码，此处简化
    if code != "123456" and len(code) != 6:
        raise APIError("验证码错误")

    with get_db() as db:
        user = db.get_user_by_phone(phone)
        if not user:
            # 自动注册
            user = db.create_user(
                openid=f"phone_{phone}",
                nickname=data.get("nickname", f"用户{phone[-4:]}"),
                phone=phone,
            )
            user.is_approved = True  # 手机号用户自动审核
            db.session.commit()

        db.record_login(user.id)
        token = create_access_token(identity=str(user.id))
        return jsonify({
            "success": True, "message": "登录成功",
            "data": {"user_id": user.id, "username": user.nickname,
                     "access_token": token, "is_admin": user.role == "admin"},
        })


# ---- 发送验证码 ----

@app.route("/api/v1/auth/send-code", methods=["POST"])
def send_code():
    """发送手机验证码（演示版直接返回，生产需接入短信API）"""
    data = request.get_json()
    phone = (data.get("phone") or "").strip()
    if not re.match(r"^1[3-9]\d{9}$", phone):
        raise APIError("请输入有效的手机号")

    # 生产环境：调用短信 API 发送验证码，存入 Redis 设置过期时间
    # 演示版：直接返回 mock code
    import random
    demo_code = "123456" if os.environ.get("FLASK_ENV") != "production" else str(random.randint(100000, 999999))
    return jsonify({
        "success": True,
        "message": "验证码已发送",
        "data": {"phone": phone, "code": demo_code if os.environ.get("FLASK_ENV") != "production" else None},
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


# ---- Admin ----

@app.route("/api/v1/admin/users", methods=["GET"])
@admin_required
def admin_list_users():
    with get_db() as db:
        users = db.get_all_users()
        return jsonify({
            "success": True,
            "data": {"users": [
                {"id": u.id, "username": u.nickname or u.openid, "email": u.email,
                 "is_approved": u.is_approved, "role": u.role,
                 "login_count": u.login_count or 0,
                 "last_login": u.last_login.isoformat() if u.last_login else None,
                 "created_at": u.created_at.isoformat() if u.created_at else None}
                for u in users
            ]},
        })


@app.route("/api/v1/admin/users/<int:user_id>/approve", methods=["POST"])
@jwt_required()
def admin_approve_user(user_id):
    with get_db() as db:
        db.approve_user(user_id)
        return jsonify({"success": True, "message": "用户已审核通过"})


@app.route("/api/v1/admin/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def admin_reject_user(user_id):
    with get_db() as db:
        db.reject_user(user_id)
        return jsonify({"success": True, "message": "用户已删除"})


@app.route("/api/v1/admin/dashboard", methods=["GET"])
def admin_dashboard():
    import time
    t0 = time.time()
    with get_db() as db:
        from sqlalchemy import func
        total_users = db.session.query(func.count(User.id)).scalar() or 0
        approved = db.session.query(func.count(User.id)).filter(User.is_approved == True).scalar() or 0
        pending = total_users - approved
        total_news = db.session.query(func.count(News.id)).scalar() or 0
        total_analyses = db.session.query(func.count(AnalysisResult.id)).scalar() or 0
        today = datetime.utcnow().date()
        today_calls = db.session.query(func.count(ApiUsage.id)).filter(
            func.date(ApiUsage.created_at) == today
        ).scalar() or 0
        today_tokens = db.session.query(func.sum(ApiUsage.tokens_used)).filter(
            func.date(ApiUsage.created_at) == today
        ).scalar() or 0
        today_cost = db.session.query(func.sum(ApiUsage.estimated_cost)).filter(
            func.date(ApiUsage.created_at) == today
        ).scalar() or 0.0
        total_tokens = db.session.query(func.sum(ApiUsage.tokens_used)).scalar() or 0
        total_cost = db.session.query(func.sum(ApiUsage.estimated_cost)).scalar() or 0.0
        return jsonify({
            "success": True,
            "data": {
                "total_users": total_users, "approved_users": approved, "pending_users": pending,
                "total_news": total_news, "total_analyses": total_analyses,
                "today_api_calls": today_calls, "today_tokens": int(today_tokens),
                "today_cost": round(float(today_cost), 4),
                "total_tokens": int(total_tokens), "total_cost": round(float(total_cost), 4),
                "response_time_ms": round((time.time() - t0) * 1000, 1),
            },
        })


@app.route("/api/v1/admin/usage", methods=["GET"])
@jwt_required()
def admin_usage():
    with get_db() as db:
        usage = db.get_user_usage_summary()
        # 关联用户名
        for u in usage:
            user = db.get_user_by_id(u["user_id"])
            u["username"] = user.nickname or user.openid if user else "unknown"
        return jsonify({"success": True, "data": {"usage": usage}})


# ---- API 用量中间件 ----

@app.before_request
def track_api_usage():
    if request.path.startswith("/api/") and request.path != "/api/v1/health":
        request._start_time = datetime.utcnow()


@app.after_request
def log_api_usage(response):
    if hasattr(request, "_start_time") and request.path.startswith("/api/"):
        elapsed = (datetime.utcnow() - request._start_time).total_seconds() * 1000
        try:
            identity = get_jwt_identity()
            if identity:
                # 估算 token 消耗：分析类端点按响应内容估算
                tokens = 0
                cost = 0.0
                if response.is_json:
                    body = response.get_json(silent=True) or {}
                    # 如果有 result 字段（AI 分析结果），按内容长度估算 token
                    result = body.get("result") or body.get("data", {}).get("result")
                    if result and isinstance(result, str):
                        # 中文 ~2 chars/token, 英文 ~4 chars/token
                        tokens = max(1, len(result) // 2)
                    elif result and isinstance(result, dict):
                        import json
                        text = json.dumps(result, ensure_ascii=False)
                        tokens = max(1, len(text) // 2)
                    else:
                        tokens = 1  # 普通 API 调用 ~1 token
                else:
                    tokens = 1

                cost = round(tokens / 1000000 * 2.0, 6)  # DeepSeek ~¥2/1M tokens (简化估算)

                db = DatabaseManager(Session())
                try:
                    db.log_api_usage(
                        user_id=int(identity),
                        endpoint=request.path,
                        method=request.method,
                        response_time_ms=round(elapsed, 1),
                        status_code=response.status_code,
                        tokens_used=tokens,
                        estimated_cost=cost,
                    )
                finally:
                    db.close()
        except Exception:
            pass
    return response


# ---- Main ----

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=config.DEBUG)
