# NewsBrief 部署指南

## 一键部署到 velolabs.top/newsbrief

### 步骤 1: 登录 Vercel

在终端执行：
```bash
cd web
npx vercel login
```

浏览器会自动打开，登录你的 Vercel 账号。

### 步骤 2: 创建 Vercel Postgres 数据库

1. 打开 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Storage" → "Create Database" → "Postgres"
3. 选择免费计划 (Hobby)
4. 创建后，复制 `DATABASE_URL`

### 步骤 3: 部署应用

```bash
cd web
npx vercel --prod
```

首次部署会询问：
- Set up and deploy? → Y
- Which scope? → 选择你的账号
- Link to existing project? → N
- Project name? → newsbrief
- Directory? → ./
- Override settings? → N

### 步骤 4: 配置环境变量

在 Vercel Dashboard 中：
1. 进入项目 → Settings → Environment Variables
2. 添加以下变量：

| 变量名 | 值 |
|--------|-----|
| DATABASE_URL | postgresql://... (从 Storage 复制) |
| NEWSDATA_API_KEY | pub_24e3e6b568bc4dc092f837de6c18ec39 |

### 步骤 5: 初始化数据库

```bash
cd web
npx prisma db push
```

### 步骤 6: 配置自定义域名

1. 在 Vercel Dashboard → 项目 → Settings → Domains
2. 添加域名: `velolabs.top/newsbrief`
3. 或者添加子域名: `newsbrief.velolabs.top`

### 步骤 7: 重新部署

```bash
npx vercel --prod
```

---

## 快速命令汇总

```bash
# 1. 登录
npx vercel login

# 2. 部署
npx vercel --prod

# 3. 推送数据库
npx prisma db push

# 4. 查看日志
npx vercel logs
```

---

## 访问地址

部署完成后访问：
- https://newsbrief-xxx.vercel.app (Vercel 默认域名)
- https://velolabs.top/newsbrief (配置自定义域名后)

---

## 常见问题

### Q: 数据库连接失败？
A: 确保 DATABASE_URL 环境变量已正确配置，并且已执行 `npx prisma db push`

### Q: API 调用失败？
A: 检查 NEWSDATA_API_KEY 是否正确配置

### Q: 页面 404？
A: 确保 vercel.json 中的 rewrites 配置正确
