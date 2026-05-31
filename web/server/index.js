import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import newsRoutes from './routes/news.js'
import userRoutes from './routes/user.js'
import analysisRoutes from './routes/analysis.js'

const prisma = new PrismaClient()
const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(express.json())

// 将 prisma 实例挂载到 app
app.set('prisma', prisma)

// 路由
app.use('/api/news', newsRoutes)
app.use('/api/user', userRoutes)
app.use('/api/analysis', analysisRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: '服务器内部错误' })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

// 优雅关闭
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

export default app
