"""
结构化日志配置
"""

import os
import logging
import logging.handlers
from datetime import datetime

LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
LOG_DIR = os.environ.get("LOG_DIR", os.path.dirname(__file__))
LOG_FORMAT = "%(asctime)s [%(levelname)s] %(name)s - %(message)s"
JSON_LOG = os.environ.get("JSON_LOG", "").lower() == "true"


def setup_logging(app_name: str = "newsbrief") -> logging.Logger:
    """配置应用日志 — 同时输出到控制台和文件"""
    logger = logging.getLogger(app_name)
    logger.setLevel(getattr(logging, LOG_LEVEL.upper(), logging.INFO))

    # 避免重复添加 handler
    if logger.handlers:
        return logger

    # 控制台 handler
    console = logging.StreamHandler()
    console.setLevel(logging.DEBUG)
    console.setFormatter(logging.Formatter(LOG_FORMAT))
    logger.addHandler(console)

    # 文件 handler（按天轮转，保留 7 天）
    log_file = os.path.join(LOG_DIR, f"{app_name}.log")
    file_handler = logging.handlers.TimedRotatingFileHandler(
        log_file, when="midnight", interval=1, backupCount=7, encoding="utf-8"
    )
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(logging.Formatter(LOG_FORMAT))
    logger.addHandler(file_handler)

    # 错误日志单独文件
    error_file = os.path.join(LOG_DIR, f"{app_name}_error.log")
    error_handler = logging.handlers.TimedRotatingFileHandler(
        error_file, when="midnight", interval=1, backupCount=30, encoding="utf-8"
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(logging.Formatter(LOG_FORMAT))
    logger.addHandler(error_handler)

    return logger


def get_request_logger() -> logging.Logger:
    """获取请求日志记录器"""
    return logging.getLogger("newsbrief.request")


class RequestLogMiddleware:
    """Flask 请求日志中间件"""

    def __init__(self, app, logger: logging.Logger = None):
        self.app = app
        self.logger = logger or logging.getLogger("newsbrief.request")

    def __call__(self, environ, start_response):
        start = datetime.utcnow()
        path = environ.get("PATH_INFO", "")
        method = environ.get("REQUEST_METHOD", "")

        def custom_start_response(status, headers, exc_info=None):
            elapsed = (datetime.utcnow() - start).total_seconds()
            status_code = int(status.split()[0])
            log_fn = self.logger.warning if status_code >= 400 else self.logger.info
            log_fn(f"{method} {path} -> {status_code} ({elapsed:.3f}s)")
            return start_response(status, headers, exc_info)

        return self.app(environ, custom_start_response)
