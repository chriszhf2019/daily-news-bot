"""
SQLAlchemy 数据库模型
"""

import hashlib
import os
from datetime import datetime

from sqlalchemy import (
    create_engine, Column, Integer, String, Text, DateTime, JSON, Boolean, Float, ForeignKey,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

Base = declarative_base()


# ---- 用户模型 ----

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    openid = Column(String(100), unique=True, nullable=False, index=True)
    nickname = Column(String(50))
    avatar = Column(String(500))
    email = Column(String(100))
    phone = Column(String(20), unique=True, index=True)  # 手机号登录
    wx_unionid = Column(String(100), unique=True, index=True)  # 微信unionid
    password_hash = Column(String(256))
    preferences = Column(JSON)
    is_approved = Column(Boolean, default=False)
    role = Column(String(20), default="user")
    last_login = Column(DateTime)
    login_count = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)      # 累计 token 消耗
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    analysis_results = relationship("AnalysisResult", back_populates="user")
    focus_points = relationship("FocusPoint", back_populates="user")
    news_favorites = relationship("NewsFavorite", back_populates="user")
    read_later = relationship("ReadLater", back_populates="user")
    api_usages = relationship("ApiUsage", back_populates="user")

    def set_password(self, password: str):
        salt = os.urandom(32)
        key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
        self.password_hash = salt.hex() + ":" + key.hex()

    def check_password(self, password: str) -> bool:
        if not self.password_hash or ":" not in self.password_hash:
            return False
        salt_hex, key_hex = self.password_hash.split(":", 1)
        salt = bytes.fromhex(salt_hex)
        key = bytes.fromhex(key_hex)
        new_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
        return key == new_key


# ---- 新闻模型 ----

class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True)
    title = Column(String(500), nullable=False)
    summary = Column(Text)
    content = Column(Text)
    category = Column(String(50), index=True)
    source = Column(String(100))
    source_url = Column(String(500))
    image_url = Column(String(500))
    tags = Column(JSON)
    published_at = Column(DateTime, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    analysis_results = relationship("AnalysisResult", back_populates="news")
    favorites = relationship("NewsFavorite", back_populates="news")


# ---- 分析结果模型 ----

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    news_id = Column(Integer, ForeignKey("news.id"), nullable=False, index=True)
    analysis_type = Column(String(50), nullable=False)
    result = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="analysis_results")
    news = relationship("News", back_populates="analysis_results")


# ---- 关注点模型 ----

class FocusPoint(Base):
    __tablename__ = "focus_points"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    keyword = Column(String(100), nullable=False)
    category = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="focus_points")


# ---- 收藏模型 ----

class NewsFavorite(Base):
    __tablename__ = "news_favorites"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    news_id = Column(Integer, ForeignKey("news.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="news_favorites")
    news = relationship("News", back_populates="favorites")


# ---- 稍后读模型 ----

class ReadLater(Base):
    __tablename__ = "read_later"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    news_id = Column(Integer, ForeignKey("news.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="read_later")


# ---- API 用量追踪 ----

class ApiUsage(Base):
    __tablename__ = "api_usages"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    endpoint = Column(String(200))
    method = Column(String(10))
    response_time_ms = Column(Float)
    status_code = Column(Integer)
    tokens_used = Column(Integer, default=0)       # 本次调用消耗 token
    estimated_cost = Column(Float, default=0.0)    # 估算费用 (元)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="api_usages")


# ---- 数据库工具 ----

def init_database(database_url: str):
    engine = create_engine(database_url)
    Base.metadata.create_all(engine)
    return engine


def create_session_factory(engine):
    return sessionmaker(bind=engine)


# ---- 数据库管理器 ----

class DatabaseManager:
    def __init__(self, session):
        self.session = session

    # -- 用户 --
    def create_user(self, openid, password=None, nickname=None, email=None, preferences=None):
        user = User(
            openid=openid,
            nickname=nickname or openid,
            email=email,
            preferences=preferences or {},
        )
        if password:
            user.set_password(password)
        self.session.add(user)
        self.session.commit()
        return user

    def get_user_by_openid(self, openid):
        return self.session.query(User).filter(User.openid == openid).first()

    def get_user_by_id(self, user_id):
        return self.session.query(User).filter(User.id == user_id).first()

    def get_user_by_phone(self, phone):
        return self.session.query(User).filter(User.phone == phone).first()

    def get_user_by_wx_unionid(self, unionid):
        return self.session.query(User).filter(User.wx_unionid == unionid).first()

    # -- 新闻 --
    def get_news_list(self, page=1, per_page=20, category=None):
        query = self.session.query(News)
        if category and category != "all":
            query = query.filter(News.category == category)
        total = query.count()
        news = query.order_by(News.published_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
        return news, total

    def get_news_by_id(self, news_id):
        return self.session.query(News).filter(News.id == news_id).first()

    def search_news(self, keyword, page=1, per_page=20):
        pattern = f"%{keyword}%"
        query = self.session.query(News).filter(
            (News.title.ilike(pattern)) | (News.content.ilike(pattern))
        )
        total = query.count()
        results = query.order_by(News.published_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
        return results, total

    def create_news(self, title, summary="", content="", category=None, source=None, source_url=None, tags=None, published_at=None):
        # 去重：按标题检查是否已存在
        existing = self.session.query(News).filter(News.title == title).first()
        if existing:
            return existing
        news = News(
            title=title,
            summary=summary,
            content=content,
            category=category,
            source=source,
            source_url=source_url,
            tags=tags or [],
            published_at=published_at or datetime.utcnow(),
        )
        self.session.add(news)
        self.session.commit()
        return news

    # -- 分析结果 --
    def create_analysis_result(self, user_id, news_id, analysis_type, result):
        analysis = AnalysisResult(
            user_id=user_id,
            news_id=news_id,
            analysis_type=analysis_type,
            result=result,
        )
        self.session.add(analysis)
        self.session.commit()
        return analysis

    def get_analysis_history(self, user_id, limit=20):
        return (
            self.session.query(AnalysisResult)
            .filter(AnalysisResult.user_id == user_id)
            .order_by(AnalysisResult.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_analysis_by_id(self, analysis_id):
        return self.session.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()

    # -- 关注点 --
    def create_focus_point(self, user_id, keyword, category=None):
        focus = FocusPoint(user_id=user_id, keyword=keyword, category=category)
        self.session.add(focus)
        self.session.commit()
        return focus

    def get_focus_points(self, user_id):
        return (
            self.session.query(FocusPoint)
            .filter(FocusPoint.user_id == user_id)
            .order_by(FocusPoint.created_at.desc())
            .all()
        )

    def delete_focus_point(self, focus_id, user_id):
        focus = self.session.query(FocusPoint).filter(
            FocusPoint.id == focus_id, FocusPoint.user_id == user_id
        ).first()
        if focus:
            self.session.delete(focus)
            self.session.commit()
            return True
        return False

    # -- 收藏 --
    def add_favorite(self, user_id, news_id):
        existing = self.session.query(NewsFavorite).filter(
            NewsFavorite.user_id == user_id, NewsFavorite.news_id == news_id
        ).first()
        if existing:
            return existing
        fav = NewsFavorite(user_id=user_id, news_id=news_id)
        self.session.add(fav)
        self.session.commit()
        return fav

    def remove_favorite(self, user_id, news_id):
        fav = self.session.query(NewsFavorite).filter(
            NewsFavorite.user_id == user_id, NewsFavorite.news_id == news_id
        ).first()
        if fav:
            self.session.delete(fav)
            self.session.commit()

    def get_favorites(self, user_id):
        return (
            self.session.query(NewsFavorite)
            .filter(NewsFavorite.user_id == user_id)
            .order_by(NewsFavorite.created_at.desc())
            .all()
        )

    # -- 稍后读 --
    def add_read_later(self, user_id, news_id):
        existing = self.session.query(ReadLater).filter(
            ReadLater.user_id == user_id, ReadLater.news_id == news_id
        ).first()
        if existing:
            return existing
        rl = ReadLater(user_id=user_id, news_id=news_id)
        self.session.add(rl)
        self.session.commit()
        return rl

    def remove_read_later(self, user_id, news_id):
        rl = self.session.query(ReadLater).filter(
            ReadLater.user_id == user_id, ReadLater.news_id == news_id
        ).first()
        if rl:
            self.session.delete(rl)
            self.session.commit()

    def get_read_later(self, user_id):
        return (
            self.session.query(ReadLater)
            .filter(ReadLater.user_id == user_id)
            .order_by(ReadLater.created_at.desc())
            .all()
        )

    # -- 管理员 --
    def get_pending_users(self):
        return self.session.query(User).filter(User.is_approved == False).all()

    def get_all_users(self):
        return self.session.query(User).order_by(User.created_at.desc()).all()

    def approve_user(self, user_id):
        user = self.get_user_by_id(user_id)
        if user:
            user.is_approved = True
            self.session.commit()
        return user

    def reject_user(self, user_id):
        user = self.get_user_by_id(user_id)
        if user:
            self.session.delete(user)
            self.session.commit()
        return True

    def set_user_role(self, user_id, role):
        user = self.get_user_by_id(user_id)
        if user:
            user.role = role
            self.session.commit()

    def record_login(self, user_id):
        user = self.get_user_by_id(user_id)
        if user:
            user.last_login = datetime.utcnow()
            user.login_count = (user.login_count or 0) + 1
            self.session.commit()

    # -- API 用量 --
    def log_api_usage(self, user_id, endpoint, method, response_time_ms, status_code, tokens_used=0, estimated_cost=0.0):
        usage = ApiUsage(
            user_id=user_id, endpoint=endpoint, method=method,
            response_time_ms=response_time_ms, status_code=status_code,
            tokens_used=tokens_used, estimated_cost=estimated_cost,
        )
        self.session.add(usage)
        # 累计用户总 token
        if tokens_used > 0:
            user = self.get_user_by_id(user_id)
            if user:
                user.total_tokens = (user.total_tokens or 0) + tokens_used
        self.session.commit()

    def get_user_usage_summary(self):
        from sqlalchemy import func
        results = (
            self.session.query(
                ApiUsage.user_id,
                func.count().label("total_calls"),
                func.sum(ApiUsage.tokens_used).label("total_tokens"),
                func.sum(ApiUsage.estimated_cost).label("total_cost"),
                func.avg(ApiUsage.response_time_ms).label("avg_time_ms"),
                func.max(ApiUsage.created_at).label("last_call"),
            )
            .group_by(ApiUsage.user_id)
            .all()
        )
        return [
            {
                "user_id": r[0],
                "total_calls": r[1],
                "total_tokens": int(r[2] or 0),
                "total_cost": round(float(r[3] or 0), 4),
                "avg_time_ms": round(r[4], 1) if r[4] else 0,
                "last_call": r[5].isoformat() if r[5] else None,
            }
            for r in results
        ]

    def close(self):
        self.session.close()
