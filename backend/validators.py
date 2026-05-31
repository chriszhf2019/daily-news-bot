"""
请求参数验证
"""

import re
from functools import wraps
from flask import request
from flask_jwt_extended import get_jwt_identity


class ValidationError(Exception):
    def __init__(self, message: str, field: str = None):
        self.message = message
        self.field = field
        super().__init__(message)


def validate_json(*required_fields, **field_validators):
    """
    装饰器 — 验证 JSON 请求体中的必填字段和格式

    用法:
        @validate_json("username", "password",
                       username=validate_username,
                       password=validate_password,
                       email=validate_email)
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            data = request.get_json(silent=True)
            if data is None:
                return {"success": False, "message": "请求体必须是有效的 JSON"}, 400

            errors = []

            for field in required_fields:
                value = data.get(field)
                if not value or (isinstance(value, str) and not value.strip()):
                    errors.append({"field": field, "message": f"{field} 不能为空"})

            for field, validator in field_validators.items():
                value = data.get(field)
                if value:
                    try:
                        data[field] = validator(value)
                    except ValidationError as e:
                        errors.append({"field": field, "message": e.message})

            if errors:
                return {"success": False, "message": "参数验证失败", "errors": errors}, 400

            return f(*args, **kwargs)
        return wrapper
    return decorator


def validate_required_params(*param_names):
    """验证 URL 查询参数中的必填字段"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            for name in param_names:
                value = request.args.get(name, "").strip()
                if not value:
                    return {
                        "success": False,
                        "message": f"参数 {name} 不能为空"
                    }, 400
            return f(*args, **kwargs)
        return wrapper
    return decorator


# -- 字段验证器 --

def validate_username(value: str) -> str:
    value = value.strip()
    if len(value) < 2:
        raise ValidationError("用户名至少2个字符")
    if len(value) > 32:
        raise ValidationError("用户名不能超过32个字符")
    if not re.match(r'^[\w一-鿿]+$', value):
        raise ValidationError("用户名只能包含字母、数字、下划线、中文")
    return value


def validate_password(value: str) -> str:
    value = value.strip()
    if len(value) < 6:
        raise ValidationError("密码至少6个字符")
    if len(value) > 128:
        raise ValidationError("密码不能超过128个字符")
    return value


def validate_email(value: str) -> str:
    value = value.strip()
    if not re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', value):
        raise ValidationError("邮箱格式不正确")
    return value


def validate_keyword(value: str) -> str:
    value = value.strip()
    if not value:
        raise ValidationError("关键词不能为空")
    if len(value) > 100:
        raise ValidationError("关键词不能超过100个字符")
    return value


def validate_news_id(value) -> int:
    try:
        nid = int(value)
    except (TypeError, ValueError):
        raise ValidationError("新闻ID必须是整数")
    if nid <= 0:
        raise ValidationError("新闻ID必须大于0")
    return nid


def validate_per_page(value) -> int:
    try:
        n = int(value)
    except (TypeError, ValueError):
        raise ValidationError("per_page 必须是整数")
    if n < 1 or n > 100:
        raise ValidationError("per_page 必须在 1-100 之间")
    return n


def validate_page(value) -> int:
    try:
        n = int(value)
    except (TypeError, ValueError):
        raise ValidationError("page 必须是整数")
    if n < 1:
        raise ValidationError("page 必须大于0")
    return n
