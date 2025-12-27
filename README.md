# 📰 每日新闻推送脚本

这是一个自动化的Python脚本，每天帮你搜索全球热点新闻和AI行业动态，使用AI总结后推送到微信。

## 🛠️ 环境配置

### 1. 安装Python依赖包

在终端中运行以下命令安装所需的Python库：

```bash
cd /Users/haifangzhao/Documents/2025-app/news
pip install -r requirements.txt
```

### 2. 配置API密钥

#### 第一步：复制配置文件
```bash
cp .env .env.example
```

#### 第二步：编辑.env文件
用文本编辑器打开 `.env` 文件，填入你的API密钥：

```bash
# Tavily API Key - 用于搜索新闻
# 获取地址：https://tavily.com/
TAVILY_API_KEY=your_tavily_api_key_here

# DeepSeek API Key - 用于总结新闻
# 获取地址：https://platform.deepseek.com/
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Pushplus Token - 用于微信推送
# 获取地址：http://pushplus.hxtrip.com/
PUSHPLUS_TOKEN=your_pushplus_token_here
```

#### 第三步：获取各平台API密钥

**Tavily API Key**：
1. 访问 https://tavily.com/
2. 注册账号并获取API Key
3. Tavily是一个专门为AI优化的搜索引擎

**DeepSeek API Key**：
1. 访问 https://platform.deepseek.com/
2. 注册账号并创建API Key
3. DeepSeek提供OpenAI兼容的API格式

**Pushplus Token**：
1. 访问 http://pushplus.hxtrip.com/
2. 使用微信扫码登录
3. 在个人中心查看你的token
4. 关注Pushplus公众号，绑定微信账号

## 🚀 运行脚本

### 基本用法

```bash
python app.py
```

### 定时自动运行（可选）

如果你想让脚本每天自动运行，可以使用系统的定时任务：

**macOS/Linux 使用 crontab**：

1. 打开终端，输入：
```bash
crontab -e
```

2. 添加定时任务（例如每天早上8点运行）：
```bash
0 8 * * * /usr/bin/python3 /Users/haifangzhao/Documents/2025-app/news/app.py >> /Users/haifangzhao/Documents/2025-app/news/news.log 2>&1
```

**macOS 使用 launchd**：

创建 `~/Library/LaunchAgents/com.user.dailynews.plist` 文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.user.dailynews</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>/Users/haifangzhao/Documents/2025-app/news/app.py</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>8</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
</dict>
</plist>
```

然后运行：
```bash
launchctl load ~/Library/LaunchAgents/com.user.dailynews.plist
```

## 📁 文件说明

- **`app.py`** - 主程序脚本，包含所有的功能代码
- **`.env`** - API密钥配置文件（已添加到.gitignore，不会泄露到GitHub）
- **`requirements.txt`** - Python依赖包列表
- **`README.md`** - 使用说明文档

## ⚠️ 重要安全提醒

1. **永远不要**将 `.env` 文件提交到GitHub等代码仓库
2. **永远不要**在代码中硬编码API密钥
3. 定期更新你的API密钥以确保安全
4. 监控API使用情况，避免超出限额

## 🔧 常见问题

### Q: 运行时提示"未找到API密钥"？
A: 请检查 `.env` 文件是否存在，以及API密钥是否正确填入。确保没有删除行首的 `#` 符号。

### Q: 微信推送失败怎么办？
A: 
1. 检查Pushplus token是否正确
2. 确保已关注Pushplus公众号并绑定微信
3. 检查网络连接

### Q: 如何修改搜索的关键词？
A: 编辑 `app.py` 文件，搜索 `search_global_news` 和 `search_ai_news` 函数，修改搜索关键词。

### Q: 脚本运行很慢怎么办？
A: 这是正常的，因为需要调用外部API进行搜索和总结。通常需要10-30秒。

## 📝 许可证

MIT License - 可以自由使用和修改

## 🤝 贡献

欢迎改进这个脚本！如果你有任何建议或优化，欢迎提交Pull Request。
