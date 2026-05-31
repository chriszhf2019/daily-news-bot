#!/bin/sh
# 生产环境启动脚本 — 运行迁移，然后启动 gunicorn

set -e

echo "=== NewsBrief 后端启动 ==="
echo "DATABASE_URL=$DATABASE_URL"

# 等待数据库就绪
echo "等待数据库连接..."
for i in $(seq 1 30); do
    if python -c "
from sqlalchemy import create_engine, text
engine = create_engine('$DATABASE_URL')
with engine.connect() as conn:
    conn.execute(text('SELECT 1'))
" 2>/dev/null; then
        echo "数据库已就绪"
        break
    fi
    echo "  等待中... ($i/30)"
    sleep 2
done

# 运行数据库迁移
echo "运行数据库迁移..."
python -m alembic -c migrations/alembic.ini upgrade head

echo "启动应用 (gunicorn)..."
exec gunicorn -w ${WORKERS:-4} -b 0.0.0.0:5000 \
    --access-logfile - --error-logfile - \
    --timeout 60 --graceful-timeout 30 \
    app:app
