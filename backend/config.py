"""
Flask 应用配置
"""

import os
from datetime import timedelta


class Config:
    """基础配置"""

    SECRET_KEY = os.environ.get("SECRET_KEY", os.urandom(32).hex())
    DEBUG = os.environ.get("DEBUG", "False").lower() == "true"

    # JWT 配置
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", os.urandom(32).hex())
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.environ.get("JWT_EXPIRY_HOURS", 24)))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=int(os.environ.get("JWT_REFRESH_DAYS", 30)))

    # DeepSeek API 配置
    DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")
    DEEPSEEK_API_ENDPOINT = os.environ.get("DEEPSEEK_API_ENDPOINT", "https://api.deepseek.com/v1")

    # 数据库配置
    DATABASE_URL = os.environ.get(
        "DATABASE_URL", "postgresql://user:password@localhost:5432/news_analysis"
    )

    # CORS 配置
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")

    # 日志配置
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


def get_config(env=None):
    if env is None:
        env = os.environ.get("FLASK_ENV", "development")
    configs = {"development": DevelopmentConfig, "production": ProductionConfig}
    return configs.get(env, DevelopmentConfig)()
