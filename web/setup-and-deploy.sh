#!/bin/bash

# NewsBrief 自动部署脚本
# 部署到 velolabs.top/newsbrief

set -e

echo "================================================"
echo "🚀 NewsBrief 自动部署脚本"
echo "================================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装 Node.js"
    exit 1
fi

# 进入 web 目录
cd "$(dirname "$0")"

echo "📦 步骤 1/5: 安装依赖..."
npm install

echo ""
echo "🔧 步骤 2/5: 生成 Prisma Client..."
npx prisma generate

echo ""
echo "🏗️ 步骤 3/5: 构建前端..."
npm run build

echo ""
echo "🔐 步骤 4/5: 登录 Vercel..."
echo "如果未登录，浏览器会自动打开登录页面"
npx vercel whoami 2>/dev/null || npx vercel login

echo ""
echo "☁️ 步骤 5/5: 部署到 Vercel..."
echo ""
echo "⚠️ 首次部署请按以下方式回答："
echo "   - Set up and deploy? → Y"
echo "   - Which scope? → 选择你的账号"
echo "   - Link to existing project? → N"
echo "   - Project name? → newsbrief"
echo "   - Directory? → ./"
echo "   - Override settings? → N"
echo ""

npx vercel --prod

echo ""
echo "================================================"
echo "✅ 部署完成！"
echo "================================================"
echo ""
echo "📝 接下来请完成以下步骤："
echo ""
echo "1. 在 Vercel Dashboard 创建 Postgres 数据库："
echo "   https://vercel.com/dashboard → Storage → Create Database → Postgres"
echo ""
echo "2. 配置环境变量："
echo "   - DATABASE_URL: 从 Storage 复制"
echo "   - NEWSDATA_API_KEY: pub_24e3e6b568bc4dc092f837de6c18ec39"
echo ""
echo "3. 初始化数据库："
echo "   npx prisma db push"
echo ""
echo "4. 重新部署："
echo "   npx vercel --prod"
echo ""
echo "5. 配置自定义域名 velolabs.top/newsbrief"
echo ""
