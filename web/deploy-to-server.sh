#!/bin/bash

# NewsBrief 服务器部署脚本
# 部署到 velolabs.top/newsbrief

set -e

# 配置
SERVER_USER="root"
SERVER_HOST="118.25.141.173"
DEPLOY_PATH="/var/www/newsbrief"
DB_NAME="newsbrief"
DB_USER="newsbrief"
DB_PASS="newsbrief_secure_password_2026"

echo "================================================"
echo "🚀 NewsBrief 服务器部署脚本"
echo "================================================"
echo ""

# 本地构建
echo "📦 步骤 1/6: 安装依赖..."
npm install

echo ""
echo "🔧 步骤 2/6: 生成 Prisma Client..."
npx prisma generate

echo ""
echo "🏗️ 步骤 3/6: 构建前端..."
npm run build

echo ""
echo "📤 步骤 4/6: 上传文件到服务器..."
# 创建部署包
tar -czf deploy.tar.gz dist api prisma server package.json package-lock.json

# 上传到服务器
scp deploy.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/

# 清理本地部署包
rm deploy.tar.gz

echo ""
echo "🔧 步骤 5/6: 在服务器上配置..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e

# 创建目录
mkdir -p /var/www/newsbrief
cd /var/www/newsbrief

# 解压文件
tar -xzf /tmp/deploy.tar.gz
rm /tmp/deploy.tar.gz

# 安装生产依赖
npm ci --production

# 生成 Prisma Client
npx prisma generate

# 创建 PostgreSQL 数据库（如果不存在）
sudo -u postgres psql -c "CREATE DATABASE newsbrief;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE USER newsbrief WITH PASSWORD 'newsbrief_secure_password_2026';" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE newsbrief TO newsbrief;" 2>/dev/null || true

# 设置环境变量
cat > .env << 'EOF'
DATABASE_URL="postgresql://newsbrief:newsbrief_secure_password_2026@localhost:5432/newsbrief"
NEWSDATA_API_KEY="pub_24e3e6b568bc4dc092f837de6c18ec39"
PORT=3001
EOF

# 推送数据库结构
npx prisma db push

# 创建 systemd 服务
cat > /etc/systemd/system/newsbrief.service << 'EOF'
[Unit]
Description=NewsBrief API Server
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/newsbrief
ExecStart=/usr/bin/node server/index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 重载 systemd 并启动服务
systemctl daemon-reload
systemctl enable newsbrief
systemctl restart newsbrief

echo "✅ 服务已启动"
ENDSSH

echo ""
echo "🌐 步骤 6/6: 配置 Nginx..."
echo ""
echo "请手动将以下配置添加到 nginx 配置文件："
echo ""
cat nginx.conf
echo ""
echo "然后执行: sudo nginx -t && sudo systemctl reload nginx"

echo ""
echo "================================================"
echo "✅ 部署完成！"
echo "================================================"
echo ""
echo "🌐 访问地址: https://velolabs.top/newsbrief"
echo ""
