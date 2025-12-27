# 🚀 GitHub Actions 自动部署指南

本项目已配置 GitHub Actions，每天早上 9 点自动运行新闻推送脚本。

## 📋 准备工作

### 步骤 1：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 创建一个新的公开仓库（public repository）
3. 仓库名称：`daily-news-bot`（或你喜欢的名称）
4. **不要**勾选 "Add a README file"（因为本地已有文件）
5. 点击 "Create repository"

### 步骤 2：初始化本地 Git 仓库

在终端中执行：

```bash
cd /Users/haifangzhao/Documents/2025-app/news

# 初始化 Git 仓库
git init

# 添加所有文件（除了 .env）
git add app.py requirements.txt README.md .gitignore .github/

# 创建初始提交
git commit -m "初始化每日新闻推送项目"

# 重命名主分支为 main
git branch -M main
```

### 步骤 3：配置 GitHub Secrets（非常重要！）

GitHub Actions 需要使用 API 密钥，但不能直接写在代码中。我们使用 GitHub Secrets 来安全存储：

1. **推送代码到 GitHub**（先不推送，稍后一起操作）
2. 访问你的 GitHub 仓库页面
3. 点击 **Settings**（设置）
4. 在左侧菜单中找到 **Secrets and variables** → **Actions**
5. 点击 **New repository secret** 添加以下密钥：

#### 添加 TAVILY_API_KEY：
- Name: `TAVILY_API_KEY`
- Value: `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`
- 点击 **Add secret**

#### 添加 DEEPSEEK_API_KEY：
- Name: `DEEPSEEK_API_KEY`
- Value: `sk-ec3b522f78834a859b9908ac0d5e7475`
- 点击 **Add secret**

#### 添加 WECHAT_APP_ID：
- Name: `WECHAT_APP_ID`
- Value: `wx4bc84b68e8499c7d`
- 点击 **Add secret**

#### 添加 WECHAT_APP_SECRET：
- Name: `WECHAT_APP_SECRET`
- Value: `82d690b15e08dca9230757c5b3115f70`
- 点击 **Add secret**

#### 添加 WECHAT_OPENID：
- Name: `WECHAT_OPENID`
- Value: `oDjqy2KBTavQcBGPdTYPK-3D8OxI`
- 点击 **Add secret**

#### 添加 WECHAT_TEMPLATE_ID：
- Name: `WECHAT_TEMPLATE_ID`
- Value: `_wIrPsCMxlUw6J7zJt3i3Yn1EIYpwWnk-WBYPP4lyP4`
- 点击 **Add secret**

#### 完成后应该看到：
```
✅ TAVILY_API_KEY
✅ DEEPSEEK_API_KEY  
✅ WECHAT_APP_ID
✅ WECHAT_APP_SECRET
✅ WECHAT_OPENID
✅ WECHAT_TEMPLATE_ID
```

#### 添加 PUSHPLUS_TOKEN：
- Name: `PUSHPLUS_TOKEN`
- Value: `8aa33fc5d78d4b05aa46fba6dd9c78bd`
- 点击 **Add secret**

#### 完成后应该看到：
```
✅ TAVILY_API_KEY
✅ DEEPSEEK_API_KEY  
✅ PUSHPLUS_TOKEN
```

### 步骤 4：推送到 GitHub

```bash
# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/daily-news-bot.git

# 推送代码到 GitHub
git push -u origin main
```

### 步骤 5：验证部署

1. 访问你的 GitHub 仓库页面
2. 点击 **Actions** 标签页
3. 你应该能看到 "每日新闻推送" 工作流
4. 首次推送会触发手动运行，可以查看运行日志

## ⏰ 自动运行时间

脚本会在以下时间自动运行：

- **每天早上 9:00**（UTC+8 北京时间）
- **每次手动触发**（在 Actions 页面点击 "Run workflow"）
- **每次代码更新**（推送到 main 分支时）

## 📊 查看运行结果

### 查看 Actions 页面：
1. 进入 GitHub 仓库
2. 点击 **Actions** 标签
3. 选择 "每日新闻推送" 工作流
4. 查看每次运行的日志

### 查看详细日志：
- 点击具体的 workflow run
- 可以看到每个步骤的执行情况
- 包括 Python 安装、脚本运行等

## 🔧 手动触发运行

如果想立即测试，不需要等到明天早上：

1. 进入 GitHub 仓库的 **Actions** 页面
2. 找到 "每日新闻推送" 工作流
3. 点击 **Run workflow** 按钮
4. 选择分支（通常为 main）
5. 点击 **Run workflow**
6. 等待几秒钟后刷新页面，查看运行状态

## 🛠️ 常见问题

### Q: 工作流运行失败怎么办？
A:
1. 点击失败的 workflow run
2. 查看详细的错误日志
3. 常见问题：
   - API 密钥配置错误
   - 网络连接问题
   - Python 依赖安装失败

### Q: 如何修改运行时间？
A: 编辑 `.github/workflows/daily-news.yml` 文件，修改 cron 表达式：

```yaml
schedule:
  - cron: '0 9 * * *'  # 每天 9:00
```

其他时间示例：
- `0 8 * * *` - 每天早上 8:00
- `0 12 * * *` - 每天中午 12:00
- `0 20 * * *` - 每天晚上 20:00
- `0 9 * * 1` - 每周一早上 9:00

### Q: 微信没收到消息怎么办？
A:
1. 先在本地测试：`python3 app.py`
2. 检查 Pushplus 是否正确配置
3. 查看 GitHub Actions 日志中的错误信息
4. 确认 Secrets 中的 token 是否正确

### Q: 可以关闭自动部署吗？
A:
- 要暂停自动运行：删除或注释掉 `schedule` 部分
- 要禁用整个工作流：在 GitHub Actions 页面禁用该 workflow

## 🎯 后续优化建议

1. **添加失败通知**：当运行失败时发送邮件或微信通知
2. **日志存档**：将每日运行日志保存到文件中
3. **多平台推送**：添加邮件、Telegram 等其他推送方式
4. **自定义搜索**：根据兴趣调整搜索关键词

## 📝 文件结构

```
daily-news-bot/
├── .github/
│   └── workflows/
│       └── daily-news.yml    # GitHub Actions 配置
├── .env                       # API 密钥（本地使用，不上传）
├── .gitignore                 # Git 忽略配置
├── app.py                     # 主程序脚本
├── requirements.txt           # Python 依赖
└── README.md                  # 项目说明
```

## ✅ 完成清单

- [ ] 创建 GitHub 仓库
- [ ] 初始化本地 Git 仓库
- [ ] 配置 GitHub Secrets（3个 API 密钥）
- [ ] 推送代码到 GitHub
- [ ] 手动触发一次测试运行
- [ ] 验证微信收到消息
- [ ] 等待明天早上 9 点自动运行

恭喜！你已经完成了所有配置！现在你的新闻推送脚本将在 GitHub 的云端服务器上每天自动运行，不需要任何服务器费用。🚀
