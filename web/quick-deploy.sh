#!/bin/bash

# NewsBrief 快速部署脚本
# 使用方法: ./quick-deploy.sh

set -e

SERVER_HOST="118.25.141.173"
SERVER_USER="root"
DEPLOY_PATH="/var/www/newsbrief"

echo "================================================"
echo "🚀 NewsBrief 快速部署"
echo "================================================"
echo ""
echo "目标服务器: ${SERVER_USER}@${SERVER_HOST}"
echo "部署路径: ${DEPLOY_PATH}"
echo ""

# 检查 sshpass 是否安装
if ! command -v sshpass &> /dev/null; then
    echo "📦 安装 sshpass..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install hudochenkov/sshpass/sshpass 2>/dev/null || brew install esolitos/ipa/sshpass
    else
        sudo apt-get install -y sshpass
    fi
fi

# 获取密码
echo -n "请输入服务器密码: "
read -s SERVER_PASS
echo ""

# 本地构建
echo ""
echo "📦 步骤 1/5: 本地构建..."
npm install
npx prisma generate
npm run build

# 创建部署包
echo ""
echo "📦 步骤 2/5: 创建部署包..."
tar -czf /tmp/newsbrief-deploy.tar.gz dist api prisma server package.json package-lock.json nginx.conf

# 上传到服务器
echo ""
echo "📤 步骤 3/5: 上传到服务器..."
sshpass -p "$SERVER_PASS" scp /tmp/newsbrief-deploy.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/

# 在服务器上配置
echo ""
echo "🔧 步骤 4/5: 服务器配置..."
sshpass -p "$SERVER_PASS" ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e

# 创建目录
mkdir -p /var/www/newsbrief
cd /var/www/newsbrief

# 备份旧版本
if [ -d "dist" ]; then
    mv dist dist.bak.$(date +%Y%m%d%H%M%S) 2>/dev/null || true
fi

# 解压新版本
tar -xzf /tmp/newsbrief-deploy.tar.gz
rm /tmp/newsbrief-deploy.tar.gz

# 安装依赖
npm ci --production 2>/dev/null || npm install --production

# 生成 Prisma Client
npx prisma generate

# 检查 PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "安装 PostgreSQL..."
    apt-get update
    apt-get install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
fi

# 创建数据库（如果不存在）
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'newsbrief'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE newsbrief;"

sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname = 'newsbrief'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE USER newsbrief WITH PASSWORD 'newsbrief_2026_secure';"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE newsbrief TO newsbrief;" 2>/dev/null || true
sudo -u postgres psql -d newsbrief -c "GRANT ALL ON SCHEMA public TO newsbrief;" 2>/dev/null || true

# 创建环境变量文件
cat > .env << 'EOF'
DATABASE_URL="postgresql://newsbrief:newsbrief_2026_secure@localhost:5432/newsbrief"
NEWSDATA_API_KEY="pub_24e3e6b568bc4dc092f837de6c18ec39"
PORT=3001
NODE_ENV=production
EOF

# 推送数据库结构
npx prisma db push --accept-data-loss 2>/dev/null || npx prisma db push

# 创建 systemd 服务
cat > /etc/systemd/system/newsbrief.service << 'EOF'
[Unit]
Description=NewsBrief API Server
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/newsbrief
ExecStart=/usr/bin/node server/index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

# 启动服务
systemctl daemon-reload
systemctl enable newsbrief
systemctl restart newsbrief

# 检查服务状态
sleep 2
if systemctl is-active --quiet newsbrief; then
    echo "✅ NewsBrief 服务已启动"
else
    echo "⚠️ 服务启动可能有问题，请检查日志"
    journalctl -u newsbrief -n 20
fi

echo ""
echo "✅ 服务器配置完成"
ENDSSH

# 配置 Nginx
echo ""
echo "🌐 步骤 5/5: 配置 Nginx..."
sshpass -p "$SERVER_PASS" ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
# 检查 nginx 配置中是否已有 newsbrief
if ! grep -q "location /newsbrief" /etc/nginx/sites-available/default 2>/dev/null && \
   ! grep -q "location /newsbrief" /etc/nginx/nginx.conf 2>/dev/null; then
    
    # 查找主配置文件
    NGINX_CONF=""
    if [ -f "/etc/nginx/sites-available/velolabs.top" ]; then
        NGINX_CONF="/etc/nginx/sites-available/velolabs.top"
    elif [ -f "/etc/nginx/sites-available/default" ]; then
        NGINX_CONF="/etc/nginx/sites-available/default"
    fi
    
    if [ -n "$NGINX_CONF" ]; then
        # 在最后一个 } 之前插入配置
        sed -i '/^}$/i \
    # NewsBrief 静态文件\
    location /newsbrief {\
        alias /var/www/newsbrief/dist;\
        try_files $uri $uri/ /newsbrief/index.html;\
    }\
\
    # NewsBrief API\
    location /newsbrief/api {\
        rewrite ^/newsbrief/api(.*)$ /api$1 break;\
        proxy_pass http://127.0.0.1:3001;\
        proxy_http_version 1.1;\
        proxy_set_header Host $host;\
        proxy_set_header X-Real-IP $remote_addr;\
    }' "$NGINX_CONF"
        
        # 测试并重载
        nginx -t && systemctl reload nginx
        echo "✅ Nginx 配置已更新"
    else
        echo "⚠️ 未找到 Nginx 配置文件，请手动配置"
    fi
else
    echo "✅ Nginx 已配置 newsbrief"
    nginx -t && systemctl reload nginx
fi
ENDSSH

# 清理
rm /tmp/newsbrief-deploy.tar.gz 2>/dev/null || true

echo ""
echo "================================================"
echo "✅ 部署完成！"
echo "================================================"
echo ""
echo "🌐 访问地址: https://velolabs.top/newsbrief"
echo ""
echo "📝 验证命令:"
echo "   curl https://velolabs.top/newsbrief/api/health"
echo ""
