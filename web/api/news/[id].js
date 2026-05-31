import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const { id } = req.query
    
    const news = await prisma.news.findUnique({
      where: { id }
    })
    
    if (!news) {
      return res.status(404).json({ error: '新闻不存在' })
    }
    
    res.json(news)
  } catch (error) {
    console.error('获取新闻失败:', error)
    res.status(500).json({ error: '获取新闻失败' })
  } finally {
    await prisma.$disconnect()
  }
}
