import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  const { userId } = req.query
  
  try {
    if (req.method === 'GET') {
      let settings = await prisma.userSettings.findUnique({
        where: { userId }
      })
      
      if (!settings) {
        settings = await prisma.userSettings.create({
          data: { userId }
        })
      }
      
      return res.json(settings)
    }
    
    if (req.method === 'PUT') {
      const updates = req.body
      
      const allowedFields = [
        'deepseekApiKey', 'deepseekEndpoint', 'newsDataApiKey',
        'aiPersona', 'theme', 'readingDepth', 'focusKeywords', 'interestTags'
      ]
      
      const data = {}
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          data[field] = updates[field]
        }
      }
      
      const settings = await prisma.userSettings.upsert({
        where: { userId },
        update: data,
        create: { userId, ...data }
      })
      
      return res.json(settings)
    }
    
    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('设置操作失败:', error)
    res.status(500).json({ error: '操作失败' })
  } finally {
    await prisma.$disconnect()
  }
}
