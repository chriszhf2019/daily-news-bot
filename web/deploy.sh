#!/bin/bash

# NewsBrief 部署脚本
# 部署到 velolabs.top/newsbrief

set -e

echo "🚀 开始部署 NewsBrief..."

# 1. 安装依赖
echo "📦 安装依赖..."
npm install

# 2. 生成 Prisma Client
echo "🔧 生成 Prisma Client..."
npx prisma generate

# 3. 构建前端
echo "🏗️ 构建前端..."
npm run build

# 4. 部署到 Vercel
echo "☁️ 部署到 Vercel..."
vercel --prod

echo "✅ 部署完成！"
echo "🌐 访问地址: https://velolabs.top/newsbrief"
