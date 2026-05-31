import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  try {
    if (req.method === 'GET') {
      const { category, limit = 20, offset = 0 } = req.query
      const where = category && category !== 'all' ? { category } : {}
      
      const news = await prisma.news.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      })
      
      return res.json(news)
    }
    
    if (req.method === 'POST') {
      const { title, summary, content, source, category } = req.body
      
      if (!title) {
        return res.status(400).json({ error: '标题不能为空' })
      }
      
      const news = await prisma.news.create({
        data: {
          title,
          summary: summary || '',
          content: content || summary || '',
          source: source || '用户录入',
          category: category || 'AI',
          publishedAt: new Date()
        }
      })
      
      return res.json(news)
    }
    
    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: error.message })
  } finally {
    await prisma.$disconnect()
  }
}
