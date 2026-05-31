"""
简易内存速率限制 — 无需 Redis，适合单机部署
"""

import time
import threading
from functools import wraps
from flask import request, jsonify

_lock = threading.Lock()
_windows: dict[str, list[float]] = {}
_max_requests = 60   # 默认每窗口最大请求数
_window_seconds = 60  # 窗口长度（秒）


def configure(requests_per_minute: int = 60):
    global _max_requests
    _max_requests = requests_per_minute


def _get_key() -> str:
    """按 IP + 路径 组合限流"""
    ip = request.headers.get("X-Forwarded-For", request.remote_addr or "unknown")
    path = request.path
    return f"{ip}:{path}"


def _check(key: str, max_req: int, window: float) -> bool:
    now = time.time()
    with _lock:
        timestamps = _windows.get(key, [])
        timestamps = [t for t in timestamps if now - t < window]
        _windows[key] = timestamps
        if len(timestamps) >= max_req:
            return False
        timestamps.append(now)
        return True


def limit(max_requests: int = None, per_seconds: int = None):
    """装饰器 — 对单个端点限流"""
    max_req = max_requests or _max_requests
    window = float(per_seconds or _window_seconds)

    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            key = _get_key()
            if not _check(key, max_req, window):
                return jsonify({
                    "success": False,
                    "message": "请求过于频繁，请稍后重试",
                }), 429
            return f(*args, **kwargs)
        return wrapper
    return decorator


# 定期清理过期窗口数据
def _cleanup():
    while True:
        time.sleep(300)  # 每 5 分钟清理
        now = time.time()
        with _lock:
            stale = [k for k, v in _windows.items()
                     if not any(now - t < _window_seconds for t in v)]
            for k in stale:
                del _windows[k]


_cleanup_thread = threading.Thread(target=_cleanup, daemon=True)
_cleanup_thread.start()


def reset():
    """重置所有限流状态（仅用于测试）"""
    with _lock:
        _windows.clear()
