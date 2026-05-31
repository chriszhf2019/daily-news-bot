# News Analysis Backend

基于Flask + PostgreSQL的新闻分析后端服务

## 📋 项目简介

这是一个提供RESTful API接口的后端服务，支持多平台访问（微信小程序、iOS应用），提供新闻分析、用户管理等功能。

## 🎯 技术栈

- **后端框架**：Flask 3.0.0
- **数据库**：PostgreSQL
- **ORM**：SQLAlchemy
- **认证**：JWT (Flask-JWT-Extended)
- **API文档**：Swagger/OpenAPI
- **缓存**：Redis
- **任务队列**：Celery

## 🚀 快速开始

### **1. 安装依赖**

```bash
# 创建虚拟环境
python -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
```

### **2. 配置环境**

```bash
# 复制环境配置示例
cp .env.example .env

# 编辑.env文件，配置以下变量：
# - JWT_SECRET_KEY
# - DEEPSEEK_API_KEY
# - DEEPSEEK_API_ENDPOINT
# - DATABASE_URL
```

### **3. 初始化数据库**

```bash
# 运行数据库初始化脚本
python init_db.py
```

### **4. 启动应用**

```bash
# 开发环境
FLASK_ENV=development python app.py

# 生产环境
FLASK_ENV=production python app.py
```

## 📊 API接口

### **用户认证**
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/logout` - 用户登出
- `POST /api/v1/auth/refresh` - 刷新Token
- `GET /api/v1/auth/profile` - 获取用户信息
- `PUT /api/v1/auth/profile` - 更新用户信息

### **新闻分析**
- `POST /api/v1/analysis/audit` - 七要素分析
- `POST /api/v1/analysis/relevance` - 相关性分析
- `POST /api/v1/analysis/exploration` - 深度探索
- `GET /api/v1/analysis/history` - 获取分析历史
- `GET /api/v1/analysis/<id>` - 获取分析详情

### **新闻数据**
- `GET /api/v1/news` - 获取新闻列表
- `GET /api/v1/news/<id>` - 获取新闻详情
- `GET /api/v1/news/category/<category>` - 按分类获取
- `GET /api/v1/news/search` - 搜索新闻
- `POST /api/v1/news/favorite` - 收藏新闻
- `DELETE /api/v1/news/favorite/<id>` - 取消收藏

### **用户管理**
- `GET /api/v1/user/focus` - 获取关注点
- `POST /api/v1/user/focus` - 添加关注点
- `DELETE /api/v1/user/focus/<id>` - 删除关注点
- `GET /api/v1/user/history` - 获取阅读历史
- `GET /api/v1/user/favorites` - 获取收藏列表

### **健康检查**
- `GET /api/v1/health` - 服务健康检查

## 🔧 开发指南

### **1. 代码结构**

```
backend/
├── app.py                  # Flask应用入口
├── config.py               # 配置文件
├── models.py               # 数据模型
├── init_db.py             # 数据库初始化
├── requirements.txt        # Python依赖
├── .env.example            # 环境配置示例
└── services/               # 业务逻辑
    ├── deepseek_client.py  # DeepSeek API客户端
    └── business_logic.py   # 业务逻辑服务
```

### **2. 开发规范**

#### **命名规范**
- 类名：PascalCase（如：`AuthService`）
- 函数名：snake_case（如：`register_user()`）
- 常量：UPPER_CASE（如：`DEEPSEEK_API_KEY`）

#### **错误处理**
- 所有API接口都要使用try-except捕获异常
- 使用`APIError`统一错误处理
- 返回标准的JSON格式：
  ```json
  {
    "success": false,
    "message": "错误描述",
    "error_code": "ERROR_CODE"
  }
  ```

#### **日志记录**
- 使用`logger.error()`记录错误
- 使用`logger.info()`记录重要信息
- 日志要包含足够的上下文信息

### **3. 测试指南**

#### **单元测试**
```bash
# 运行单元测试
python -m pytest tests/
```

#### **集成测试**
```bash
# 运行集成测试
python -m pytest tests/integration/
```

## 🚀 部署指南

### **1. 开发环境**

```bash
# 安装依赖
pip install -r requirements.txt

# 配置环境
cp .env.example .env
vim .env

# 初始化数据库
python init_db.py

# 启动应用
python app.py
```

### **2. 生产环境**

#### **使用Gunicorn**
```bash
# 安装Gunicorn
pip install gunicorn

# 启动应用
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### **使用Docker**
```bash
# 构建镜像
docker build -t news-analysis-backend .

# 运行容器
docker run -p 5000:5000 news-analysis-backend
```

#### **使用Docker Compose**
```bash
# 启动所有服务
docker-compose up -d
```

### **3. 环境变量**

#### **必需变量**
- `FLASK_ENV` - Flask环境（development/production）
- `JWT_SECRET_KEY` - JWT密钥
- `DEEPSEEK_API_KEY` - DeepSeek API密钥
- `DEEPSEEK_API_ENDPOINT` - DeepSeek API端点
- `DATABASE_URL` - 数据库连接URL

#### **可选变量**
- `PORT` - 应用端口（默认：5000）
- `DEBUG` - 调试模式（默认：False）
- `LOG_LEVEL` - 日志级别（默认：INFO）

## 📊 性能优化

### **1. 数据库优化**
- 使用索引优化查询
- 使用连接池管理连接
- 使用缓存减少查询

### **2. API优化**
- 使用Redis缓存热点数据
- 使用Celery异步处理耗时任务
- 使用分页减少数据传输

### **3. 监控和日志**
- 使用日志记录关键操作
- 使用监控跟踪API性能
- 使用告警及时发现问题

## 🔒 安全指南

### **1. 认证安全**
- 使用JWT进行用户认证
- 使用HTTPS传输数据
- 定期刷新Token

### **2. 数据安全**
- 使用参数化查询防止SQL注入
- 使用HTTPS传输敏感数据
- 加密存储用户密码

### **3. API安全**
- 使用CORS限制跨域访问
- 使用限流防止滥用
- 使用输入验证防止攻击

## 📝 维护指南

### **1. 日常维护**
- 定期备份数据库
- 定期清理过期数据
- 定期更新依赖包

### **2. 故障处理**
- 查看日志定位问题
- 使用监控发现异常
- 及时修复已知问题

### **3. 版本更新**
- 遵循语义化版本控制
- 编写详细的更新日志
- 测试新版本后再发布

## 🤔 常见问题

### **1. 安装问题**
**Q: 安装依赖失败**
A: 使用国内镜像源
```bash
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

**Q: 数据库连接失败**
A: 检查数据库配置和连接
```bash
# 检查PostgreSQL是否运行
psql -U postgres -h localhost -p 5432 -c "SELECT version();"
```

### **2. 运行问题**
**Q: 应用启动失败**
A: 检查端口占用和配置
```bash
# 检查端口占用
lsof -i :5000
```

**Q: API调用失败**
A: 检查API密钥和网络连接
```bash
# 测试API连接
curl -X GET http://localhost:5000/api/v1/health
```

## 📞 联系方式

- **项目地址**：[GitHub Repository](https://github.com/your-repo)
- **问题反馈**：[GitHub Issues](https://github.com/your-repo/issues)
- **技术支持**：support@example.com

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有贡献者的支持！

---

**最后更新**：2025-03-20