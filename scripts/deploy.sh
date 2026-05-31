#!/bin/bash
# 腾讯云一键部署脚本
# 使用方法: chmod +x deploy.sh && sudo ./deploy.sh

set -e

echo "========================================="
echo "  NewsBrief 后端部署"
echo "========================================="

DOMAIN="118.25.141.173"  # 如果有域名请替换
PROJECT_DIR="/opt/newsbrief"

# ---- 1. 安装系统依赖 ----
echo "[1/6] 安装系统依赖..."
apt-get update -qq
apt-get install -y -qq nginx git python3-pip python3-venv certbot python3-certbot-nginx > /dev/null

# ---- 2. 克隆项目 ----
echo "[2/6] 克隆代码..."
if [ -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR" && git pull
else
    git clone https://github.com/chriszhf2019/daily-news-bot.git "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    git checkout feature/local-onboarding-verifications
fi

# ---- 3. 创建虚拟环境 ----
echo "[3/6] 创建虚拟环境..."
python3 -m venv "$PROJECT_DIR/venv"
source "$PROJECT_DIR/venv/bin/activate"
pip install -q -r "$PROJECT_DIR/backend/requirements.txt"
pip install -q gunicorn psycopg2-binary

# ---- 4. 配置环境变量 ----
echo "[4/6] 配置环境变量..."
cat > "$PROJECT_DIR/backend/.env" << 'EOF'
FLASK_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_6LASayRdbEf7@ep-silent-boat-aojju02l.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET_KEY=newsbrief-prod-jwt-secret-key-32bytes
SECRET_KEY=newsbrief-prod-secret-key-32bytes
CORS_ORIGINS=*
LOG_LEVEL=INFO
EOF

# ---- 5. 创建 systemd 服务 ----
echo "[5/6] 创建 systemd 服务..."
cat > /etc/systemd/system/newsbrief.service << 'EOF'
[Unit]
Description=NewsBrief API
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/newsbrief/backend
Environment=PATH=/opt/newsbrief/venv/bin
EnvironmentFile=/opt/newsbrief/backend/.env
ExecStart=/opt/newsbrief/venv/bin/gunicorn -w 2 -b 0.0.0.0:5000 --timeout 60 app:app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# ---- 6. 配置 Nginx ----
echo "[6/6] 配置 Nginx..."
cat > /etc/nginx/sites-available/newsbrief << 'EOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 10m;

    gzip on;
    gzip_types application/json text/plain;
    gzip_min_length 256;

    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    location /api/v1/health {
        proxy_pass http://127.0.0.1:5000;
        access_log off;
    }
}
EOF

ln -sf /etc/nginx/sites-available/newsbrief /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ---- 启动 ----
systemctl daemon-reload
systemctl enable newsbrief
systemctl restart newsbrief

echo ""
echo "========================================="
echo "  部署完成！"
echo "  验证: http://$DOMAIN/api/v1/health"
echo "========================================="
