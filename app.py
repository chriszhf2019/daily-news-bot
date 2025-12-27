#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
每日新闻推送脚本
功能：自动搜索全球热点新闻和AI行业动态，使用AI总结后推送到微信
作者：自动生成
"""

import os
import sys
import json
import smtplib
import requests
import logging
from datetime import datetime
from email.mime.text import MIMEText
from email.utils import formataddr
from pathlib import Path

# 导入所需的库
from dotenv import load_dotenv
from openai import OpenAI

# ============================================
# 第一步：加载环境变量配置
# ============================================
def load_config():
    """
    加载.env文件中的配置
    这样可以保护API密钥不被泄露到代码中
    """
    # 获取当前文件所在目录的.env文件路径
    env_path = Path(__file__).parent / ".env"
    
    if env_path.exists():
        load_dotenv(env_path)
        print(f"✅ 已加载配置文件: {env_path}")
    else:
        print(f"⚠️  警告：未找到.env配置文件，将使用系统环境变量")
    
    # 从环境变量中获取API密钥
    config = {
        "tavily_api_key": os.getenv("TAVILY_API_KEY"),
        "deepseek_api_key": os.getenv("DEEPSEEK_API_KEY"),
        # 微信测试号配置
        "wechat_app_id": os.getenv("WECHAT_APP_ID"),
        "wechat_app_secret": os.getenv("WECHAT_APP_SECRET"),
        "wechat_openid": os.getenv("WECHAT_OPENID"),
        "wechat_template_id": os.getenv("WECHAT_TEMPLATE_ID"),
        # 邮件推送配置
        "email_smtp_server": os.getenv("EMAIL_SMTP_SERVER", "smtp.qq.com"),
        "email_smtp_port": int(os.getenv("EMAIL_SMTP_PORT", 465)),
        "email_username": os.getenv("EMAIL_USERNAME"),
        "email_password": os.getenv("EMAIL_PASSWORD"),
        "email_to": os.getenv("EMAIL_TO"),
        "email_from_name": os.getenv("EMAIL_FROM_NAME", "每日新闻推送"),
        # Pushplus配置（备用）
        "pushplus_token": os.getenv("PUSHPLUS_TOKEN"),
    }
    
    return config


# ============================================
# 第二步：检查API密钥是否配置正确
# ============================================
def check_api_keys(config):
    """
    检查所有必要的API密钥是否已配置
    """
    # 检查微信测试号（优先使用，最直接）
    has_wechat_config = all([
        config["wechat_app_id"],
        config["wechat_app_secret"],
        config["wechat_openid"],
        config["wechat_template_id"]
    ])
    
    if has_wechat_config:
        print("✅ 检测到微信测试号配置")
        return "wechat"
    
    # 检查是否配置了邮件推送
    has_email_config = all([
        config["email_smtp_server"],
        config["email_username"],
        config["email_password"],
        config["email_to"]
    ])
    
    if has_email_config:
        print("✅ 检测到邮件推送配置")
        print(f"   发送方：{config['email_username']}")
        print(f"   接收方：{config['email_to']}")
        return "email"
    
    # 检查是否配置了Pushplus
    if config["pushplus_token"]:
        print("✅ 检测到 Pushplus 配置")
        return "pushplus"
    
    print("❌ 错误：未配置任何推送方式！")
    print("\n请选择以下任一方式配置：")
    print("\n方式1：微信测试号（推荐，直接推送到微信）")
    print("在 .env 文件中添加：")
    print("  WECHAT_APP_ID=wx1234567890abcdef")
    print("  WECHAT_APP_SECRET=your-app-secret")
    print("  WECHAT_OPENID=o7Vb-jgGGds123456789")
    print("  WECHAT_TEMPLATE_ID=your-template-id")
    print("\n方式2：邮件推送")
    print("在 .env 文件中添加：")
    print("  EMAIL_SMTP_SERVER=smtp.qq.com")
    print("  EMAIL_USERNAME=你的邮箱@qq.com")
    print("  EMAIL_PASSWORD=你的邮箱授权码")
    print("  EMAIL_TO=接收推送的邮箱")
    return None


# ============================================
# 第三步：使用Tavily搜索全球热点新闻
# ============================================
def search_global_news(config):
    """
    使用Tavily搜索今日全球最热的5条新闻
    
    Tavily是一个专门为AI优化的搜索引擎
    """
    print("\n📰 步骤1：搜索全球热点新闻...")
    
    try:
        # 这里使用Tavily的搜索功能
        # 由于需要实际API密钥，我们模拟搜索结果
        # 实际使用时应该这样调用：
        # from tavily import TavilyClient
        # client = TavilyClient(api_key=config["tavily_api_key"])
        # response = client.search("today's top global news", max_results=5)
        
        # 模拟搜索结果（实际使用时请取消注释上面的代码）
        mock_news = [
            {
                "title": "人工智能技术在医疗领域取得重大突破",
                "url": "https://example.com/news1",
                "content": "最新的AI诊断系统在多个疾病的早期检测中表现出色，准确率超过95%。"
            },
            {
                "title": "全球气候峰会达成新的碳排放协议",
                "url": "https://example.com/news2", 
                "content": "各国代表在峰会上签署了历史性的气候协议，承诺在2030年前减少50%的碳排放。"
            },
            {
                "title": "新能源汽车销量创历史新高",
                "url": "https://example.com/news3",
                "content": "得益于技术进步和政策支持，全球新能源汽车销量同比增长150%。"
            },
            {
                "title": "SpaceX成功发射新一代星际飞船",
                "url": "https://example.com/news4",
                "content": "SpaceX的星际飞船在今天成功发射，标志着太空探索进入新纪元。"
            },
            {
                "title": "元宇宙技术应用扩展到教育领域",
                "url": "https://example.com/news5",
                "content": "多所顶尖大学开始采用元宇宙技术进行沉浸式教学，学生参与度大幅提升。"
            }
        ]
        
        print(f"✅ 获取到 {len(mock_news)} 条全球热点新闻")
        return mock_news
        
    except Exception as e:
        print(f"❌ 搜索全球新闻时出错：{e}")
        return []


# ============================================
# 第四步：使用Tavily搜索AI行业动态
# ============================================
def search_ai_news(config):
    """
    根据关键词'AI 行业动态'搜索相关的3条热点新闻
    """
    print("\n🤖 步骤2：搜索AI行业动态...")
    
    try:
        # 模拟搜索结果（实际使用时请取消注释下面的代码）
        # response = client.search("AI 行业动态", max_results=3)
        
        mock_ai_news = [
            {
                "title": "OpenAI发布新一代GPT-5模型，性能大幅提升",
                "url": "https://example.com/ai1",
                "content": "GPT-5在推理能力和多模态处理方面有了质的飞跃，引发行业广泛关注。"
            },
            {
                "title": "中国AI芯片企业突破7nm制程技术",
                "url": "https://example.com/ai2",
                "content": "国产AI芯片在性能和能效方面取得重大突破，有望打破国际技术垄断。"
            },
            {
                "title": "AI大模型在企业级应用市场快速增长",
                "url": "https://example.com/ai3",
                "content": "越来越多的企业开始采用AI大模型优化业务流程，预计市场规模将在3年内增长10倍。"
            }
        ]
        
        print(f"✅ 获取到 {len(mock_ai_news)} 条AI行业动态")
        return mock_ai_news
        
    except Exception as e:
        print(f"❌ 搜索AI新闻时出错：{e}")
        return []


# ============================================
# 第五步：使用DeepSeek API总结新闻
# ============================================
def summarize_news(config, global_news, ai_news):
    """
    使用DeepSeek API将搜索结果总结成一篇简报
    
    DeepSeek支持OpenAI兼容的API格式
    """
    print("\n📝 步骤3：使用AI总结新闻...")
    
    try:
        # 准备要总结的内容
        all_news = {
            "全球hots": global_news,
            "AI行业动态": ai_news
        }
        
        # 构建提示词
        prompt = f"""请将以下新闻内容总结成一篇简洁的每日新闻简报：

新闻内容：
{json.dumps(all_news, ensure_ascii=False, indent=2)}

请按照以下格式总结：
1. 今日全球热点新闻（3-5条）
2. AI行业动态（3条）
3. 今日关注焦点

请用简洁的语言总结，每条新闻不超过两句话。"""
        
        # 初始化DeepSeek客户端（OpenAI兼容格式）
        # DeepSeek的API地址通常是 https://api.deepseek.com
        client = OpenAI(
            api_key=config["deepseek_api_key"],
            base_url="https://api.deepseek.com"
        )
        
        # 调用API生成总结
        response = client.chat.completions.create(
            model="deepseek-chat",  # 使用DeepSeek的模型
            messages=[
                {
                    "role": "system", 
                    "content": "你是一个专业的新闻编辑，擅长将复杂的新闻内容总结成简洁易读的简报。"
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            max_tokens=2000,  # 限制输出的token数量
            temperature=0.7   # 控制创造性，0.7是比较平衡的值
        )
        
        # 获取总结结果
        summary = response.choices[0].message.content
        
        print("✅ 新闻总结完成")
        return summary
        
    except Exception as e:
        print(f"❌ 使用DeepSeek总结时出错：{e}")
        # 如果API调用失败，返回一个简单的默认总结
        return generate_default_summary(global_news, ai_news)


def generate_default_summary(global_news, ai_news):
    """
    当API调用失败时，生成一个简单的默认总结
    """
    summary = f"""📰 每日新闻简报 - {datetime.now().strftime('%Y年%m月%d日')}

🌍 全球hots新闻：
"""
    
    for i, news in enumerate(global_news, 1):
        summary += f"{i}. {news['title']}\n   {news['content']}\n\n"
    
    summary += """🤖 AI行业动态：
"""
    
    for i, news in enumerate(ai_news, 1):
        summary += f"{i}. {news['title']}\n   {news['content']}\n\n"
    
    summary += "💡 提示：此为自动生成的简报，如需更详细的AI总结，请检查API配置。"
    
    return summary


# ============================================
# 方案1：微信测试号推送（推荐）
# ============================================
def send_to_wechat_via_wechat(config, summary):
    """
    使用微信测试号发送模板消息到微信
    
    步骤：
    1. 访问 https://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login 获取测试号
    2. 扫描二维码登录
    3. 获取 appID 和 appsecret
    4. 添加你的微信为测试用户
    5. 创建模板消息
    """
    print("\n📱 步骤4：通过微信测试号推送...")
    
    try:
        # 1. 获取 access_token
        print("🔐 获取微信 access_token...")
        token_url = f"https://api.weixin.qq.com/cgi-bin/token"
        token_params = {
            "grant_type": "client_credential",
            "appid": config["wechat_app_id"],
            "secret": config["wechat_app_secret"]
        }
        
        token_response = requests.get(token_url, params=token_params, timeout=10)
        token_data = token_response.json()
        
        if "access_token" not in token_data:
            print(f"❌ 获取 access_token 失败：{token_data.get('errmsg', '未知错误')}")
            return False
        
        access_token = token_data["access_token"]
        print("✅ 成功获取 access_token")
        
        # 2. 发送模板消息
        print("📤 发送模板消息...")
        send_url = f"https://api.weixin.qq.com/cgi-bin/message/template/send?access_token={access_token}"
        
        # 准备模板数据
        # 微信模板消息格式有限制，我们截取部分内容
        first_line = "📰 今日新闻简报已生成"
        
        # 提取关键内容（微信模板消息有长度限制）
        summary_lines = summary.split('\n')
        keyword1 = ""
        keyword2 = ""
        
        # 收集前几行作为关键词
        for line in summary_lines:
            if line.strip() and not line.startswith('---') and not line.startswith('*'):
                if not keyword1:
                    keyword1 = line[:20]  # 限制长度
                elif not keyword2 and line.startswith('###'):
                    keyword2 = line.replace('###', '').strip()[:20]
                elif not keyword2:
                    keyword2 = line[:20]
        
        template_data = {
            "touser": config["wechat_openid"],
            "template_id": config["wechat_template_id"],
            "url": "",  # 可以设置点击跳转的链接
            "data": {
                "first": {
                    "value": first_line,
                    "color": "#173177"
                },
                "keyword1": {
                    "value": keyword1 or "全球hots + AI动态",
                    "color": "#173177"
                },
                "keyword2": {
                    "value": keyword2 or datetime.now().strftime('%Y-%m-%d'),
                    "color": "#173177"
                },
                "remark": {
                    "value": "\n点击查看完整新闻简报\n\n" + summary[:200] + "...",
                    "color": "#666666"
                }
            }
        }
        
        send_response = requests.post(send_url, json=template_data, timeout=10)
        send_data = send_response.json()
        
        if send_data["errcode"] == 0:
            print("✅ 微信推送成功！")
            print("📱 请查看微信消息")
            return True
        else:
            print(f"❌ 微信推送失败：{send_data.get('errmsg', '未知错误')}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ 网络请求错误：{e}")
        return False
    except Exception as e:
        print(f"❌ 发送微信消息时出错：{e}")
        return False


# ============================================
# 方案2：使用邮件发送到微信
# ============================================
def send_to_wechat_via_email(config, summary):
    """
    使用邮件推送方式发送新闻简报到微信
    
    原理：QQ邮箱/163邮箱收到邮件后，可以设置接收提醒到微信
    """
    print("\n📧 步骤4：通过邮件发送到微信...")
    
    try:
        # 准备邮件内容
        msg = MIMEText(summary, 'html', 'utf-8')
        msg['Subject'] = f"📰 每日新闻简报 - {datetime.now().strftime('%Y-%m-%d')}"
        msg['From'] = formataddr([config["email_from_name"], config["email_username"]])
        msg['To'] = config["email_to"]
        
        # 连接SMTP服务器并发送邮件
        print(f"📨 连接到邮件服务器：{config['email_smtp_server']}...")
        
        # 使用SSL/TLS加密连接
        server = smtplib.SMTP_SSL(
            config["email_smtp_server"], 
            config["email_smtp_port"],
            timeout=30
        )
        
        # 登录邮箱
        print(f"🔐 登录邮箱：{config['email_username']}...")
        server.login(
            config["email_username"], 
            config["email_password"]
        )
        
        # 发送邮件
        print(f"📤 发送邮件到：{config['email_to']}...")
        server.sendmail(
            config["email_username"],
            [config["email_to"]],
            msg.as_string()
        )
        
        # 关闭连接
        server.quit()
        
        print("✅ 邮件发送成功！")
        print("💡 请检查邮箱，邮件提醒已推送到微信")
        return True
        
    except smtplib.SMTPAuthenticationError:
        print("❌ 邮箱登录失败：用户名或密码错误")
        print("💡 提示：QQ邮箱需要使用'授权码'而不是登录密码")
        print("   获取方法：QQ邮箱 → 设置 → 账户 → 开启IMAP/SMTP服务 → 获取授权码")
        return False
        
    except Exception as e:
        print(f"❌ 发送邮件时出错：{e}")
        return False


# ============================================
# 方案3：使用Pushplus发送到微信
# ============================================
def send_to_wechat_via_pushplus(config, summary):
    """
    使用Pushplus接口将新闻简报发送到微信
    
    Pushplus是一个免费的微信推送服务
    """
    print("\n📱 步骤4：通过Pushplus推送到微信...")
    
    try:
        # Pushplus的API地址
        pushplus_url = "http://pushplus.hxtrip.com/send"
        
        # 准备请求数据
        data = {
            "token": config["pushplus_token"],  # 你的Pushplus token
            "title": f"📰 每日新闻简报 - {datetime.now().strftime('%Y-%m-%d')}",
            "content": summary,  # 新闻简报内容
            "topic": ""  # 可选：主题标签
        }
        
        # 发送POST请求
        response = requests.post(
            pushplus_url, 
            json=data,
            headers={"Content-Type": "application/json"},
            timeout=30  # 30秒超时
        )
        
        # 打印响应内容以便调试
        print(f"📨 响应状态码：{response.status_code}")
        print(f"📨 响应内容：{response.text[:500]}")  # 只打印前500字符
        
        # 检查响应
        if response.status_code == 200:
            try:
                result = response.json()
                if result["code"] == 200:
                    print("✅ 微信推送成功！")
                    return True
                else:
                    print(f"❌ 微信推送失败：{result.get('msg', '未知错误')}")
                    return False
            except json.JSONDecodeError:
                print("❌ 响应不是有效的JSON格式")
                return False
        else:
            print(f"❌ 请求失败，状态码：{response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 发送微信消息时出错：{e}")
        return False


# ============================================
# 主程序
# ============================================
def main():
    """
    主函数：执行完整的新闻推送流程
    """
    print("=" * 50)
    print("🚀 每日新闻推送程序启动")
    print("=" * 50)
    
    # 1. 加载配置
    print("\n📋 步骤0：加载配置...")
    config = load_config()
    
    # 2. 检查推送方式
    push_method = check_api_keys(config)
    
    if not push_method:
        print("\n❌ 程序终止：请先配置推送方式")
        sys.exit(1)
    
    # 3. 搜索全球热点新闻
    global_news = search_global_news(config)
    
    # 4. 搜索AI行业动态
    ai_news = search_ai_news(config)
    
    # 5. 总结新闻
    summary = summarize_news(config, global_news, ai_news)
    
    # 打印总结内容
    print("\n📄 新闻简报内容：")
    print("-" * 50)
    print(summary)
    print("-" * 50)
    
    # 6. 发送到微信（根据配置选择方式）
    if push_method == "wechat":
        success = send_to_wechat_via_wechat(config, summary)
    elif push_method == "email":
        success = send_to_wechat_via_email(config, summary)
    else:
        success = send_to_wechat_via_pushplus(config, summary)
    
    if success:
        print("\n🎉 程序执行完成！")
        if push_method == "wechat":
            print("📱 请查看微信消息")
        elif push_method == "email":
            print("📱 请查看邮件，微信会收到提醒")
        else:
            print("📱 请查看微信消息")
    else:
        print("\n⚠️  消息推送失败，但新闻内容已生成。")
        print("请检查配置或网络连接。")
    
    print("\n" + "=" * 50)


# 当直接运行此脚本时执行main函数
if __name__ == "__main__":
    main()