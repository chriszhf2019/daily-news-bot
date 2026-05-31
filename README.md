# 点透 (DianTou) — 新闻情报平台

多端新闻情报平台，提供 AI 驱动的新闻聚合、深度分析和个性化推送。

## 项目结构

```
.
├── app.py                      # 每日新闻推送脚本（Tavily 搜索 + DeepSeek 总结 + 微信/邮件推送）
├── backend/                    # Flask REST API 后端
│   ├── app.py                  # API 入口（认证、新闻CRUD、AI分析）
│   ├── models.py               # SQLAlchemy 数据模型（User, News, Analysis 等）
│   ├── config.py               # 配置管理
│   ├── services/
│   │   └── deepseek_client.py  # DeepSeek API 封装
│   ├── tests/                  # 测试
│   └── requirements.txt
├── NewsBrief/                  # iOS SwiftUI App
│   ├── Models/                 # 数据模型和 ViewModel
│   ├── Views/                  # UI 视图
│   ├── Services/               # 网络、缓存、认证服务
│   └── Config/                 # API 配置
├── miniprogram/                # 微信小程序
├── web/                        # React Web 前端
└── docs/archive/               # 历史文档归档
```

## 快速开始

### 1. 每日新闻推送脚本

```bash
cp .env.example .env
# 编辑 .env 填入 API 密钥
pip install -r requirements.txt
python app.py
```

### 2. 后端 API

```bash
cd backend
pip install -r requirements.txt
# 配置 DATABASE_URL 和 DEEPSEEK_API_KEY 环境变量
python app.py
```

### 3. 运行测试

```bash
cd backend
pip install pytest
python -m pytest tests/ -v
```

## 环境变量

| 变量 | 说明 | 必需 |
|------|------|------|
| `TAVILY_API_KEY` | Tavily 搜索 API 密钥 | 推送脚本 |
| `DEEPSEEK_API_KEY` | DeepSeek AI API 密钥 | 推送脚本 / 后端 |
| `DATABASE_URL` | PostgreSQL 连接串 | 后端 |
| `JWT_SECRET_KEY` | JWT 签名密钥 | 后端 |
| `SECRET_KEY` | Flask session 密钥 | 后端 |

## 技术栈

- **后端**: Flask + SQLAlchemy + PostgreSQL + JWT
- **iOS**: SwiftUI + MVVM + Combine
- **小程序**: 原生微信小程序框架
- **Web**: React + Vite
- **AI**: DeepSeek API + Tavily Search
- **部署**: GitHub Actions + Vercel

## 安全

- `.env` 已加入 `.gitignore`，不要提交 API 密钥
- API 密钥通过 `Info.plist` 或环境变量注入，禁止硬编码
- 密码使用 PBKDF2-SHA256 哈希存储
