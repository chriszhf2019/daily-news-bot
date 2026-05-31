"""
HTTP 缓存辅助函数
"""

import hashlib
import json
from functools import wraps
from flask import request, make_response, jsonify


def cache_control(max_age: int = 300, public: bool = True):
    """为响应添加 Cache-Control 头"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            resp = f(*args, **kwargs)
            if isinstance(resp, tuple):
                body, status = resp
                response = make_response(body, status)
            else:
                response = make_response(resp)
            directive = "public" if public else "private"
            response.headers["Cache-Control"] = f"{directive}, max-age={max_age}"
            return response
        return wrapper
    return decorator


def etag():
    """为 JSON 响应添加 ETag 头，支持 304 Not Modified"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            resp = f(*args, **kwargs)
            if isinstance(resp, tuple):
                body, status = resp
                response = make_response(body, status)
            else:
                response = make_response(resp)

            data = response.get_json()
            if data is not None:
                etag_val = hashlib.md5(
                    json.dumps(data, sort_keys=True, default=str).encode()
                ).hexdigest()
                response.headers["ETag"] = f'"{etag_val}"'

                if_none = request.headers.get("If-None-Match", "")
                if if_none == f'"{etag_val}"':
                    return "", 304
            return response
        return wrapper
    return decorator
