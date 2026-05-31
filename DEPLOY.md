# 小程序测试分发指南

## 一、免费部署后端（30 分钟）

### 1. Neon 数据库（2 分钟）
1. 打开 https://neon.tech → Sign Up（GitHub 登录）
2. Create Project → 名字填 `newsbrief` → 选 Singapore 区域
3. 创建后复制 **Connection string**（格式：`postgresql://...`）

### 2. Render 后端（5 分钟）
1. 打开 https://render.com → Sign Up（GitHub 登录）
2. 把项目推送到你的 GitHub：
   ```bash
   git add -A && git commit -m "deploy" && git push
   ```
3. Render 控制台 → New → Web Service → 连接 GitHub 仓库
4. 自动检测 `render.yaml`，手动填一个环境变量：
   - `DATABASE_URL` = 粘贴 Neon 的 Connection string
5. 点 Deploy，等 3 分钟

### 3. 跑首次数据管道
部署成功后，在 Render 的 Shell 里运行：
```bash
cd backend && python pipeline.py
```
118 条真实新闻入库。

### 4. 获取后端地址
Render 会分配一个域名如 `https://newsbrief-api.onrender.com`

---

## 二、微信小程序配置（10 分钟）

### 1. 配置服务器域名
1. 打开 https://mp.weixin.qq.com → 登录
2. 开发 → 开发管理 → 开发设置 → 服务器域名
3. **request 合法域名** 添加 Render 域名（如 `https://newsbrief-api.onrender.com`）

### 2. 更新小程序 API 地址
修改 `miniprogram/utils/api.js` 第一行：
```js
const API_BASE = 'https://newsbrief-api.onrender.com/api/v1'
```

### 3. 上传体验版
1. 微信开发者工具 → 右上角「上传」
2. 版本号填 `0.1.0`，描述写「首次测试」
3. 上传成功后，去 mp.weixin.qq.com → 管理 → 版本管理
4. 开发版本 → 选刚上传的版本 → 「选为体验版」

### 4. 添加测试人员
1. mp.weixin.qq.com → 管理 → 成员管理
2. 添加测试人员 → 输入他们的微信号
3. 把体验版二维码发给他们扫码测试

---

## 三、Web 前端部署到 Vercel

```bash
cd web
npx vercel --prod
```

---

## 四、测试流程（给测试人员的指引）

1. 微信扫描体验版二维码
2. 首次打开会看到引导页 → 设置关注关键词 → 进入首页
3. 测试项目：
   - 首页是否显示最新新闻
   - 点击新闻进入详情页
   - 搜索功能是否正常
   - 收藏/取消收藏
   - 设置页功能
   - 情报中心数据

---

## 五、可选：DeepSeek AI 分析

在 Render 环境变量中添加 `DEEPSEEK_API_KEY`，管道运行时会自动生成精准标签和摘要。
