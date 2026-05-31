#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
每日新闻推送脚本
功能：使用 Tavily 搜索全球热点新闻和AI行业动态，通过 DeepSeek 总结后推送到微信/邮件
"""

import os
import sys
import json
import logging
from datetime import datetime
from pathlib import Path

import requests
import smtplib
from email.mime.text import MIMEText
from email.utils import formataddr

from dotenv import load_dotenv
from openai import OpenAI

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def load_config():
    """加载 .env 配置文件"""
    env_path = Path(__file__).parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
        logger.info(f"已加载配置文件: {env_path}")
    else:
        logger.warning("未找到 .env 配置文件，使用系统环境变量")

    return {
        "tavily_api_key": os.getenv("TAVILY_API_KEY"),
        "deepseek_api_key": os.getenv("DEEPSEEK_API_KEY"),
        "wechat_app_id": os.getenv("WECHAT_APP_ID"),
        "wechat_app_secret": os.getenv("WECHAT_APP_SECRET"),
        "wechat_openid": os.getenv("WECHAT_OPENID"),
        "wechat_template_id": os.getenv("WECHAT_TEMPLATE_ID"),
        "email_smtp_server": os.getenv("EMAIL_SMTP_SERVER", "smtp.qq.com"),
        "email_smtp_port": int(os.getenv("EMAIL_SMTP_PORT", 465)),
        "email_username": os.getenv("EMAIL_USERNAME"),
        "email_password": os.getenv("EMAIL_PASSWORD"),
        "email_to": os.getenv("EMAIL_TO"),
        "email_from_name": os.getenv("EMAIL_FROM_NAME", "每日新闻推送"),
        "pushplus_token": os.getenv("PUSHPLUS_TOKEN"),
    }


def check_push_method(config):
    """检查可用的推送方式"""
    if all([config["wechat_app_id"], config["wechat_app_secret"],
            config["wechat_openid"], config["wechat_template_id"]]):
        logger.info("检测到微信测试号配置")
        return "wechat"
    if all([config["email_username"], config["email_password"], config["email_to"]]):
        logger.info("检测到邮件推送配置")
        return "email"
    if config["pushplus_token"]:
        logger.info("检测到 Pushplus 配置")
        return "pushplus"
    logger.error("未配置任何推送方式")
    return None


def search_news(query: str, tavily_api_key: str, max_results: int = 5) -> list[dict]:
    """使用 Tavily API 搜索新闻"""
    logger.info(f"搜索: {query}")
    url = "https://api.tavily.com/search"
    payload = {
        "api_key": tavily_api_key,
        "query": query,
        "search_depth": "advanced",
        "max_results": max_results,
        "include_answer": True,
    }
    resp = requests.post(url, json=payload, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    results = data.get("results", [])
    logger.info(f"获取到 {len(results)} 条结果")
    return [
        {"title": r["title"], "url": r["url"], "content": r.get("content", "")}
        for r in results
    ]


def summarize_with_deepseek(config: dict, global_news: list[dict], ai_news: list[dict]) -> str:
    """使用 DeepSeek API 总结新闻"""
    logger.info("调用 DeepSeek 生成新闻简报...")

    news_input = {
        "全球热点新闻": global_news,
        "AI行业动态": ai_news,
    }

    prompt = f"""请将以下新闻内容总结成一篇简洁的每日新闻简报：

新闻内容：
{json.dumps(news_input, ensure_ascii=False, indent=2)}

请按以下格式输出：
1. 🌍 今日全球热点（3-5条，每条不超过两句话）
2. 🤖 AI行业动态（2-3条，每条不超过两句话）
3. 💡 今日关注焦点（1-2句话的总结性评论）
4. 🔗 新闻关联分析（分析新闻之间的潜在联系）

请用简洁专业的语言，便于快速阅读。"""

    client = OpenAI(
        api_key=config["deepseek_api_key"],
        base_url="https://api.deepseek.com",
    )

    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": "你是一个专业的新闻编辑，擅长将复杂新闻总结成简洁易读的简报。"},
            {"role": "user", "content": prompt},
        ],
        max_tokens=2000,
        temperature=0.7,
    )

    summary = response.choices[0].message.content
    logger.info("新闻总结完成")
    return summary


def save_news_data(global_news: list[dict], ai_news: list[dict]):
    """保存新闻数据到本地 JSON 文件"""
    output_path = Path(__file__).parent / "latest_news_data.json"
    data = {
        "generated_at": datetime.now().isoformat(),
        "global_news": global_news,
        "ai_news": ai_news,
    }
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    logger.info(f"新闻数据已保存到: {output_path}")


# ---- 推送方法 ----

def send_via_wechat(config: dict, summary: str) -> bool:
    """通过微信测试号推送"""
    logger.info("通过微信测试号推送...")
    try:
        token_url = "https://api.weixin.qq.com/cgi-bin/token"
        params = {
            "grant_type": "client_credential",
            "appid": config["wechat_app_id"],
            "secret": config["wechat_app_secret"],
        }
        token_resp = requests.get(token_url, params=params, timeout=10)
        token_data = token_resp.json()
        if "access_token" not in token_data:
            logger.error(f"获取 access_token 失败: {token_data.get('errmsg')}")
            return False

        access_token = token_data["access_token"]
        send_url = f"https://api.weixin.qq.com/cgi-bin/message/template/send?access_token={access_token}"

        template_data = {
            "touser": config["wechat_openid"],
            "template_id": config["wechat_template_id"],
            "data": {
                "first": {"value": "📰 今日新闻简报已生成", "color": "#173177"},
                "keyword1": {"value": "每日新闻摘要", "color": "#173177"},
                "keyword2": {"value": datetime.now().strftime("%Y-%m-%d"), "color": "#173177"},
                "remark": {"value": summary.replace("**", "").replace("#", "")[:500], "color": "#666666"},
            },
        }

        send_resp = requests.post(send_url, json=template_data, timeout=10)
        send_data = send_resp.json()
        if send_data.get("errcode") == 0:
            logger.info("微信推送成功")
            return True
        logger.error(f"微信推送失败: {send_data.get('errmsg')}")
        return False
    except Exception as e:
        logger.error(f"微信推送异常: {e}")
        return False


def send_via_email(config: dict, summary: str) -> bool:
    """通过邮件推送"""
    logger.info("通过邮件推送...")
    try:
        msg = MIMEText(summary, "html", "utf-8")
        msg["Subject"] = f"📰 每日新闻简报 - {datetime.now().strftime('%Y-%m-%d')}"
        msg["From"] = formataddr([config["email_from_name"], config["email_username"]])
        msg["To"] = config["email_to"]

        server = smtplib.SMTP_SSL(config["email_smtp_server"], config["email_smtp_port"], timeout=30)
        server.login(config["email_username"], config["email_password"])
        server.sendmail(config["email_username"], [config["email_to"]], msg.as_string())
        server.quit()
        logger.info("邮件发送成功")
        return True
    except Exception as e:
        logger.error(f"邮件推送异常: {e}")
        return False


def send_via_pushplus(config: dict, summary: str) -> bool:
    """通过 Pushplus 推送"""
    logger.info("通过 Pushplus 推送...")
    try:
        resp = requests.post(
            "http://pushplus.hxtrip.com/send",
            json={
                "token": config["pushplus_token"],
                "title": f"📰 每日新闻简报 - {datetime.now().strftime('%Y-%m-%d')}",
                "content": summary,
            },
            timeout=30,
        )
        result = resp.json()
        if result.get("code") == 200:
            logger.info("Pushplus 推送成功")
            return True
        logger.error(f"Pushplus 推送失败: {result.get('msg')}")
        return False
    except Exception as e:
        logger.error(f"Pushplus 推送异常: {e}")
        return False


# ---- 主流程 ----

def main():
    print("=" * 50)
    print("🚀 每日新闻推送程序启动")
    print("=" * 50)

    config = load_config()

    # 检查必要的 API Key
    if not config["tavily_api_key"]:
        logger.error("未配置 TAVILY_API_KEY，无法搜索新闻，请检查 .env 文件")
        sys.exit(1)
    if not config["deepseek_api_key"]:
        logger.error("未配置 DEEPSEEK_API_KEY，无法总结新闻，请检查 .env 文件")
        sys.exit(1)

    # 1. 搜索新闻
    try:
        global_news = search_news("today's top global news", config["tavily_api_key"], max_results=6)
    except Exception as e:
        logger.error(f"搜索全球新闻失败: {e}")
        global_news = []

    try:
        ai_news = search_news("AI industry news artificial intelligence latest", config["tavily_api_key"], max_results=4)
    except Exception as e:
        logger.error(f"搜索AI新闻失败: {e}")
        ai_news = []

    if not global_news and not ai_news:
        logger.error("未能获取任何新闻，程序退出")
        sys.exit(1)

    # 2. AI 总结
    try:
        summary = summarize_with_deepseek(config, global_news, ai_news)
    except Exception as e:
        logger.error(f"AI 总结失败: {e}")
        sys.exit(1)

    # 3. 保存数据
    save_news_data(global_news, ai_news)

    # 4. 推送
    push_method = check_push_method(config)
    if push_method == "wechat":
        success = send_via_wechat(config, summary)
    elif push_method == "email":
        success = send_via_email(config, summary)
    elif push_method == "pushplus":
        success = send_via_pushplus(config, summary)
    else:
        logger.info("未配置推送方式，新闻数据仅保存到本地文件")
        success = True

    if success:
        print("\n🎉 程序执行完成！")
    else:
        print("\n⚠️ 推送失败，但新闻数据已保存到本地文件")

    print("=" * 50)


if __name__ == "__main__":
    main()
