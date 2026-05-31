# NewsBrief Web 应用

新闻简报 Web 端应用，部署在 velolabs.top/newsbrief

## 技术栈

- 前端：React + Vite + TailwindCSS + Zustand
- 后端：Vercel Serverless Functions
- 数据库：PostgreSQL (Prisma ORM)
- 部署：Vercel

## 本地开发

```bash
# 安装依赖
npm install

# 生成 Prisma Client
npm run db:generate

# 推送数据库结构
npm run db:push

# 启动开发服务器
npm run dev
```

## 环境变量

在 `.env` 文件中配置：

```env
DATABASE_URL="postgresql://..."
NEWSDATA_API_KEY="pub_xxx"
```

## 部署到 Vercel

### 1. 创建 Vercel Postgres 数据库

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入项目 → Storage → Create Database → Postgres
3. 复制 `DATABASE_URL` 到环境变量

### 2. 配置环境变量

在 Vercel 项目设置中添加：
- `DATABASE_URL`: PostgreSQL 连接字符串
- `NEWSDATA_API_KEY`: NewsData.io API Key

### 3. 部署

```bash
vercel --prod
```

## 目录结构

```
web/
├── api/                  # Vercel Serverless Functions
│   ├── news/
│   ├── user/
│   └── analysis/
├── prisma/
│   └── schema.prisma     # 数据库模型
├── src/
│   ├── components/       # React 组件
│   ├── pages/           # 页面组件
│   ├── services/        # API 服务
│   └── store/           # Zustand 状态管理
└── public/              # 静态资源
```

## 功能模块

1. **首页** - 新闻列表、分类筛选、刷新
2. **七要素审计** - AI 驱动的新闻审计分析
3. **相关性分析** - 私人顾问决策建议
4. **深度探索** - 战略研究因果溯源
5. **设置** - API 配置、主题设置
