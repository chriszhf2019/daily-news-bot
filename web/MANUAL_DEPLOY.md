# NewsBrief 手动部署指南

## 部署到 velolabs.top/newsbrief

### 方案 A: 本地构建 + 手动上传

#### 1. 本地构建

```bash
cd web

# 安装依赖
npm install

# 生成 Prisma Client
npx prisma generate

# 构建前端
npm run build

# 创建部署包
tar -czf newsbrief-deploy.tar.gz dist api prisma server package.json package-lock.json
```

#### 2. 上传到服务器

使用 FTP/SFTP 工具（如 FileZilla）或 scp 命令：

```bash
scp newsbrief-deploy.tar.gz root@118.25.141.173:/tmp/
```

#### 3. 在服务器上配置

SSH 登录服务器后执行：

```bash
# 创建目录
mkdir -p /var/www/newsbrief
cd /var/www/newsbrief

# 解压
tar -xzf /tmp/newsbrief-deploy.tar.gz

# 安装依赖
npm ci --production

# 生成 Prisma Client
npx prisma generate
```

#### 4. 配置 PostgreSQL 数据库

```bash
# 安装 PostgreSQL（如果未安装）
sudo apt update
sudo apt install postgresql postgresql-contrib

# 创建数据库和用户
sudo -u postgres psql << EOF
CREATE DATABASE newsbrief;
CREATE USER newsbrief WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE newsbrief TO newsbrief;
\c newsbrief
GRANT ALL ON SCHEMA public TO newsbrief;
EOF
```

#### 5. 配置环境变量

```bash
cat > /var/www/newsbrief/.env << EOF
DATABASE_URL="postgresql://newsbrief:your_secure_password@localhost:5432/newsbrief"
NEWSDATA_API_KEY="pub_24e3e6b568bc4dc092f837de6c18ec39"
PORT=3001
NODE_ENV=production
EOF
```

#### 6. 初始化数据库

```bash
cd /var/www/newsbrief
npx prisma db push
```

#### 7. 创建 systemd 服务

```bash
sudo cat > /etc/systemd/system/newsbrief.service << EOF
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
EnvironmentFile=/var/www/newsbrief/.env

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable newsbrief
sudo systemctl start newsbrief
```

#### 8. 配置 Nginx

编辑 nginx 配置文件（通常在 `/etc/nginx/sites-available/velolabs.top`）：

```nginx
# 在 server 块内添加：

# NewsBrief 静态文件
location /newsbrief {
    alias /var/www/newsbrief/dist;
    try_files $uri $uri/ /newsbrief/index.html;
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# NewsBrief API
location /newsbrief/api {
    rewrite ^/newsbrief/api(.*)$ /api$1 break;
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
}
```

重载 Nginx：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### 方案 B: Docker 部署

#### 1. 上传文件到服务器

```bash
scp -r web root@118.25.141.173:/var/www/newsbrief
```

#### 2. 在服务器上启动

```bash
cd /var/www/newsbrief
docker-compose up -d
```

#### 3. 配置 Nginx 代理

同方案 A 的步骤 8。

---

### 方案 C: GitHub Actions 自动部署

1. 在 GitHub 仓库设置中添加 Secrets：
   - `SERVER_HOST`: 118.25.141.173
   - `SERVER_USER`: root
   - `SSH_PRIVATE_KEY`: 你的 SSH 私钥

2. 推送代码到 main 分支，自动触发部署

---

## 验证部署

```bash
# 检查服务状态
sudo systemctl status newsbrief

# 查看日志
sudo journalctl -u newsbrief -f

# 测试 API
curl http://localhost:3001/api/health

# 测试外部访问
curl https://velolabs.top/newsbrief/api/health
```

---

## 常见问题

### Q: 数据库连接失败
```bash
# 检查 PostgreSQL 状态
sudo systemctl status postgresql

# 检查连接
psql -U newsbrief -d newsbrief -h localhost
```

### Q: 服务启动失败
```bash
# 查看详细日志
sudo journalctl -u newsbrief -n 50

# 手动启动测试
cd /var/www/newsbrief
node server/index.js
```

### Q: Nginx 502 错误
```bash
# 检查后端服务是否运行
curl http://localhost:3001/api/health

# 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```
