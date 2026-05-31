"""
数据管道 — 免费 RSS 源 → 去重 → 数据库入库
零 API Key 依赖，开箱即用
用法: python pipeline.py
"""

import os
import re
import sys
import json
import hashlib
import logging
from datetime import datetime
from xml.etree import ElementTree as ET
from urllib.request import urlopen, Request
from urllib.error import URLError

from dotenv import load_dotenv

load_dotenv()

from config import get_config
from models import init_database, create_session_factory, DatabaseManager

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("pipeline")

# 新闻源
RSS_SOURCES = [
    # 中文科技
    {"name": "36氪", "url": "https://36kr.com/feed", "category": "科技前沿"},
    {"name": "虎嗅", "url": "https://www.huxiu.com/rss/0.xml", "category": "科技前沿"},
    {"name": "少数派", "url": "https://sspai.com/feed", "category": "科技前沿"},
    {"name": "IT之家", "url": "https://www.ithome.com/rss/", "category": "科技前沿"},
    {"name": "机器之心", "url": "https://www.jiqizhixin.com/rss", "category": "AI动态"},
    {"name": "量子位", "url": "https://www.qbitai.com/feed", "category": "AI动态"},
    {"name": "爱范儿", "url": "https://www.ifanr.com/feed", "category": "科技前沿"},
    {"name": "品玩", "url": "https://www.pingwest.com/feed", "category": "科技前沿"},
    {"name": "钛媒体", "url": "https://www.tmtpost.com/rss.xml", "category": "科技前沿"},
    # 国际权威科技
    {"name": "TechCrunch", "url": "https://techcrunch.com/feed/", "category": "AI动态"},
    {"name": "The Verge", "url": "https://www.theverge.com/rss/index.xml", "category": "科技前沿"},
    {"name": "Wired", "url": "https://www.wired.com/feed/rss", "category": "科技前沿"},
    {"name": "MIT Tech Review", "url": "https://www.technologyreview.com/feed/", "category": "AI动态"},
    {"name": "Ars Technica", "url": "https://feeds.arstechnica.com/arstechnica/index", "category": "科技前沿"},
    {"name": "Nature", "url": "https://www.nature.com/nature.rss", "category": "科技前沿"},
    {"name": "Science", "url": "https://www.science.org/rss/news_current.xml", "category": "科技前沿"},
]

USER_AGENT = "NewsBrief/1.0 (RSS Reader)"


def strip_html(text: str) -> str:
    """去除 HTML 标签"""
    text = re.sub(r"<[^>]+>", "", text or "")
    text = text.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"')
    return re.sub(r"\s+", " ", text).strip()


def extract_tags(title: str, summary: str) -> list[str]:
    """从标题和摘要中提取关键词作为标签"""
    keywords = ["AI", "人工智能", "大模型", "GPT", "OpenAI", "芯片", "半导体", "苹果",
                "特斯拉", "华为", "小米", "量子", "自动驾驶", "新能源", "机器人",
                "融资", "IPO", "上市", "政策", "监管", "发布", "突破", "合作"]
    text = f"{title or ''} {summary or ''}"
    tags = []
    for kw in keywords:
        if kw.lower() in text.lower():
            tags.append(kw)
    return tags[:5] or ["科技"]


def fetch_rss(source: dict) -> list[dict]:
    """拉取单个 RSS 源"""
    req = Request(source["url"], headers={"User-Agent": USER_AGENT})
    try:
        with urlopen(req, timeout=10) as resp:
            tree = ET.parse(resp)
    except Exception as e:
        logger.warning(f"  {source['name']}: 拉取失败 - {e}")
        return []

    items = tree.findall(".//item") or tree.findall(".//{http://www.w3.org/2005/Atom}entry")
    results = []
    for item in items:
        title = strip_html(
            item.findtext("title") or
            item.findtext("{http://www.w3.org/2005/Atom}title") or ""
        )
        description = strip_html(
            item.findtext("description") or
            item.findtext("{http://www.w3.org/2005/Atom}summary") or
            item.findtext("{http://www.w3.org/2005/Atom}content") or ""
        )
        link = (
            item.findtext("link") or
            (item.find("{http://www.w3.org/2005/Atom}link") or {}).get("href", "")
        )
        if not title or len(title) < 5:
            continue
        results.append({
            "title": title[:200],
            "summary": description[:500],
            "source": source["name"],
            "source_url": link,
            "category": source["category"],
            "tags": extract_tags(title, description),
        })
    return results


def deduplicate(news_items: list[dict]) -> list[dict]:
    """按标题去重"""
    seen = set()
    unique = []
    for item in news_items:
        # 取标题前 30 个字符做指纹
        fp = hashlib.md5(item["title"][:60].encode()).hexdigest()
        if fp not in seen:
            seen.add(fp)
            unique.append(item)
    return unique


def enrich_with_ai(items: list[dict], api_key: str) -> list[dict]:
    """用 DeepSeek 为新闻生成精准标签和一句话摘要"""
    from openai import OpenAI

    client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")
    enriched = []
    batch_size = 10

    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        titles = [f"{j+1}. {it['title']}" for j, it in enumerate(batch)]
        prompt = f"""为以下每条新闻生成 3-5 个精准的中文标签和一句中文摘要。

{chr(10).join(titles)}

返回纯 JSON 数组，每个元素格式：
{{"index": 从1开始的序号, "tags": ["标签1","标签2","标签3"], "summary": "一句话摘要"}}

只输出 JSON，不要其他文字。"""

        try:
            resp = client.chat.completions.create(
                model="deepseek-chat",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=2000, temperature=0.3,
            )
            text = resp.choices[0].message.content.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            results = json.loads(text)
            for r in results:
                idx = r.get("index", 0) - 1
                if 0 <= idx < len(batch):
                    batch[idx]["tags"] = r.get("tags", batch[idx].get("tags", []))
                    batch[idx]["summary"] = r.get("summary", batch[idx].get("summary", ""))
            logger.info(f"  AI 标签批次 {i//batch_size + 1}: {len(batch)} 条完成")
        except Exception as e:
            logger.warning(f"  AI 标签批次失败: {e}")

        enriched.extend(batch)

    return enriched


def store_news(db_url: str, items: list[dict]) -> int:
    """批量入库"""
    engine = init_database(db_url)
    Session = create_session_factory(engine)
    db = DatabaseManager(Session())
    count = 0
    try:
        for item in items:
            try:
                db.create_news(
                    title=item["title"],
                    summary=item.get("summary", ""),
                    content=item.get("summary", ""),
                    category=item.get("category", "综合"),
                    source=item.get("source", "RSS"),
                    source_url=item.get("source_url", ""),
                    tags=item.get("tags", []),
                    published_at=datetime.utcnow(),
                )
                count += 1
            except Exception as e:
                logger.warning(f"  入库失败: {item['title'][:40]} - {e}")
        logger.info(f"已入库 {count} 条新闻")
    finally:
        db.close()
    return count


def run():
    config = get_config()
    logger.info("开始 RSS 新闻采集...")

    all_news = []
    for source in RSS_SOURCES:
        logger.info(f"拉取 {source['name']}...")
        items = fetch_rss(source)
        logger.info(f"  获取 {len(items)} 条")
        all_news.extend(items)

    if not all_news:
        logger.error("未获取到任何新闻，请检查网络连接")
        sys.exit(1)

    unique = deduplicate(all_news)
    logger.info(f"去重: {len(all_news)} → {len(unique)} 条")

    # DeepSeek AI 增强标签和摘要
    deepseek_key = os.getenv("DEEPSEEK_API_KEY", "")
    if deepseek_key and unique:
        logger.info("使用 DeepSeek 生成精准标签...")
        unique = enrich_with_ai(unique, deepseek_key)

    count = store_news(config.DATABASE_URL, unique)
    print(f"\n✅ 管道完成: RSS 采集 {len(all_news)} 条，去重后入库 {count} 条")

    # 保存本地 JSON
    output_path = os.path.join(os.path.dirname(__file__), "..", "latest_news_data.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({"generated_at": datetime.now().isoformat(), "news": unique[:50]},
                  f, ensure_ascii=False, indent=2)
    print(f"✅ 已更新: {output_path}")


if __name__ == "__main__":
    run()
