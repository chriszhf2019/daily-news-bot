import { Router } from 'express'

const router = Router()

// 获取新闻列表
router.get('/', async (req, res) => {
  try {
    const prisma = req.app.get('prisma')
    const { category, limit = 20, offset = 0 } = req.query
    
    const where = category && category !== 'all' ? { category } : {}
    
    const news = await prisma.news.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    })
    
    res.json(news)
  } catch (error) {
    console.error('获取新闻失败:', error)
    res.status(500).json({ error: '获取新闻失败' })
  }
})

// 获取单条新闻
router.get('/:id', async (req, res) => {
  try {
    const prisma = req.app.get('prisma')
    const { id } = req.params
    
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
  }
})

// 刷新新闻（从外部 API 获取）
router.post('/refresh', async (req, res) => {
  try {
    const prisma = req.app.get('prisma')
    const newsDataApiKey = process.env.NEWSDATA_API_KEY || 'pub_24e3e6b568bc4dc092f837de6c18ec39'
    
    // 从 NewsData.io 获取新闻
    const response = await fetch(
      `https://newsdata.io/api/1/news?apikey=${newsDataApiKey}&language=zh&category=technology`
    )
    
    if (!response.ok) {
      throw new Error('NewsData API 请求失败')
    }
    
    const data = await response.json()
    const articles = data.results || []
    
    // 批量插入新闻
    const newsItems = articles.map(article => ({
      title: article.title || '无标题',
      summary: article.description || '',
      content: article.content || article.description || '',
      source: article.source_id || '未知来源',
      sourceUrl: article.link || '',
      imageUrl: article.image_url || '',
      category: mapCategory(article.category?.[0]),
      publishedAt: article.pubDate ? new Date(article.pubDate) : new Date()
    }))
    
    // 使用 upsert 避免重复
    for (const item of newsItems) {
      await prisma.news.upsert({
        where: { sourceUrl: item.sourceUrl || `temp-${Date.now()}-${Math.random()}` },
        update: item,
        create: item
      })
    }
    
    res.json({ success: true, count: newsItems.length })
  } catch (error) {
    console.error('刷新新闻失败:', error)
    res.status(500).json({ error: '刷新新闻失败: ' + error.message })
  }
})

// 添加自定义新闻
router.post('/', async (req, res) => {
  try {
    const prisma = req.app.get('prisma')
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
    
    res.json(news)
  } catch (error) {
    console.error('添加新闻失败:', error)
    res.status(500).json({ error: '添加新闻失败' })
  }
})

// 分类映射
function mapCategory(category) {
  const map = {
    technology: 'AI动态',
    science: '科技前沿',
    business: '商业财经',
    world: '国际要闻',
    sports: '体育竞技'
  }
  return map[category] || 'AI动态'
}

export default router
