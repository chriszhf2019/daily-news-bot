"""
数据库初始化 — 创建表并填充种子数据
用法: python init_db.py
"""

import os
import sys
from datetime import datetime

from models import Base, User, News, create_session_factory, init_database, DatabaseManager
from config import get_config

SEED_NEWS = [
    {
        "title": "OpenAI 发布 GPT-5 模型，推理能力大幅提升",
        "summary": "GPT-5 在推理能力和多模态处理方面实现重大突破，参数规模达 1.76 万亿。",
        "content": "OpenAI 发布 GPT-5，参数规模 1.76 万亿，推理速度比 GPT-4 快 60%，支持 200 万 token 上下文。",
        "category": "AI动态",
        "source": "OpenAI 官网",
        "tags": ["OpenAI", "GPT-5", "人工智能", "大语言模型"],
    },
    {
        "title": "特斯拉 FSD 完全自动驾驶获监管批准",
        "summary": "特斯拉 FSD 技术获得 NHTSA 正式批准，自动驾驶进入商业化新阶段。",
        "content": "特斯拉宣布 FSD 技术已获美国国家公路交通安全管理局批准，可在高速公路和城市道路实现完全自动驾驶。",
        "category": "自动驾驶",
        "source": "特斯拉官方",
        "tags": ["特斯拉", "FSD", "自动驾驶"],
    },
    {
        "title": "苹果发布 iOS 19，AI 功能全面升级",
        "summary": "iOS 19 引入 Apple Intelligence 端侧 AI 引擎，Siri 对话理解能力提升 45%。",
        "content": "苹果发布 iOS 19 系统，核心升级为 Apple Intelligence 端侧 AI 引擎和 Siri 2.0。",
        "category": "科技前沿",
        "source": "Apple 官网",
        "tags": ["苹果", "iOS 19", "AI"],
    },
    {
        "title": "IBM 发布 1000 量子比特处理器 Condor",
        "summary": "IBM 发布 Condor 量子处理器，量子比特数从 433 提升至 1000，量子体积达 8192。",
        "content": "IBM 在 Quantum Summit 发布 Condor 处理器，相干时间延长至 200 微秒，错误率降至 0.01%。",
        "category": "量子计算",
        "source": "IBM Research",
        "tags": ["IBM", "量子计算", "Condor"],
    },
    {
        "title": "Meta 发布 Quest 4 VR 头显",
        "summary": "Meta Quest 4 单眼 4K 显示，全新 XR3 芯片性能提升 200%，续航 6 小时。",
        "content": "Meta 在 Connect 大会发布 Quest 4，标准版 599 美元，企业版 799 美元。",
        "category": "VR/AR",
        "source": "Meta 官网",
        "tags": ["Meta", "Quest 4", "VR"],
    },
]


def init_db(database_url: str = None):
    if database_url is None:
        config = get_config()
        database_url = config.DATABASE_URL

    print(f"初始化数据库: {database_url}")
    engine = init_database(database_url)
    Session = create_session_factory(engine)
    session = Session()
    db = DatabaseManager(session)

    try:
        existing = session.query(News).count()
        if existing > 0:
            print(f"数据库已有 {existing} 条新闻，跳过种子数据")
            return db

        for item in SEED_NEWS:
            db.create_news(
                title=item["title"],
                summary=item["summary"],
                content=item["content"],
                category=item["category"],
                source=item["source"],
                tags=item.get("tags", []),
                published_at=datetime.utcnow(),
            )
        print(f"已插入 {len(SEED_NEWS)} 条种子新闻")

        admin = db.create_user(openid="admin", password="admin123", nickname="管理员")
        admin.is_approved = True
        admin.role = "admin"
        db.session.commit()
        print("已创建管理员账号 (admin / admin123，已审核)")

    finally:
        db.close()

    print("数据库初始化完成")
    return db


if __name__ == "__main__":
    db_url = sys.argv[1] if len(sys.argv) > 1 else None
    init_db(db_url)
