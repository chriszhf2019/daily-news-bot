import { Router } from 'express'

const router = Router()

// 获取或创建用户（简单的匿名用户系统）
router.post('/init', async (req, res) => {
  try {
    const prisma = req.app.get('prisma')
    const { visitorId } = req.body
    
    // 使用 visitorId 作为简单的用户标识
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
  }
})

// 获取用户设置
router.get('/:userId/settings', async (req, res) => {
  try {
    const prisma = req.app.get('prisma')
    const { userId } = req.params
    
    let settings = await prisma.userSettings.findUnique({
      where: { userId }
    })
    
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId }
      })
    }
    
    res.json(settings)
  } catch (error) {
    console.error('获取设置失败:', error)
    res.status(500).json({ error: '获取设置失败' })
  }
})

// 更新用户设置
router.put('/:userId/settings', async (req, res) => {
  try {
    const prisma = req.app.get('prisma')
    const { userId } = req.params
    const updates = req.body
    
    // 过滤允许更新的字段
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
    
    res.json(settings)
  } catch (error) {
    console.error('更新设置失败:', error)
    res.status(500).json({ error: '更新设置失败' })
  }
})

// 收藏新闻
router.post('/:userId/favorites', async (req, res) => {
  try {
    const prisma = req.app.get('prisma')
    const { userId } = req.params
    const { newsId } = req.body
    
    const favorite = await prisma.favorite.create({
      data: { userId, newsId }
    })
    
    res.json(favorite)
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: '已收藏' })
    }
    console.error('收藏失败:', error)
    res.status(500).json({ error: '收藏失败' })
  }
})

// 取消收藏
router.delete('/:userId/favorites/:newsId', async (req, res) => {
  try {
    const prisma = req.app.get('prisma')
    const { userId, newsId } = req.params
    
    await prisma.favorite.delete({
      where: { userId_newsId: { userId, newsId } }
    })
    
    res.json({ success: true })
  } catch (error) {
    console.error('取消收藏失败:', error)
    res.status(500).json({ error: '取消收藏失败' })
  }
})

// 获取收藏列表
router.get('/:userId/favorites', async (req, res) => {
  try {
    const prisma = req.app.get('prisma')
    const { userId } = req.params
    
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { news: true },
      orderBy: { createdAt: 'desc' }
    })
    
    res.json(favorites.map(f => f.news))
  } catch (error) {
    console.error('获取收藏失败:', error)
    res.status(500).json({ error: '获取收藏失败' })
  }
})

// 记录阅读历史
router.post('/:userId/history', async (req, res) => {
  try {
    const prisma = req.app.get('prisma')
    const { userId } = req.params
    const { newsId } = req.body
    
    const history = await prisma.readHistory.upsert({
      where: { userId_newsId: { userId, newsId } },
      update: { readAt: new Date() },
      create: { userId, newsId }
    })
    
    res.json(history)
  } catch (error) {
    console.error('记录历史失败:', error)
    res.status(500).json({ error: '记录历史失败' })
  }
})

// 获取阅读历史
router.get('/:userId/history', async (req, res) => {
  try {
    const prisma = req.app.get('prisma')
    const { userId } = req.params
    const { limit = 50 } = req.query
    
    const history = await prisma.readHistory.findMany({
      where: { userId },
      include: { news: true },
      orderBy: { readAt: 'desc' },
      take: parseInt(limit)
    })
    
    res.json(history.map(h => ({ ...h.news, readAt: h.readAt })))
  } catch (error) {
    console.error('获取历史失败:', error)
    res.status(500).json({ error: '获取历史失败' })
  }
})

export default router
