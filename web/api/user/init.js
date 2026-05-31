import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const { visitorId } = req.body
    
    let user = await prisma.user.findFirst({
      where: { id: visitorId },
      include: { settings: true }
    })
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: visitorId || undefined,
          settings: { create: {} }
        },
        include: { settings: true }
      })
    }
    
    res.json(user)
  } catch (error) {
    console.error('初始化用户失败:', error)
    res.status(500).json({ error: '初始化用户失败' })
  } finally {
    await prisma.$disconnect()
  }
}
