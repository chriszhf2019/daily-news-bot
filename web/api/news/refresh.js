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
    
    // 分类映射
    const mapCategory = (cat) => {
      const map = {
        technology: 'AI动态',
        science: '科技前沿',
        business: '商业财经',
        world: '国际要闻',
        sports: '体育竞技'
      }
      return map[cat] || 'AI动态'
    }
    
    // 批量插入新闻
    let count = 0
    for (const article of articles) {
      const sourceUrl = article.link || `temp-${Date.now()}-${Math.random()}`
      
      await prisma.news.upsert({
        where: { sourceUrl },
        update: {
          title: article.title || '无标题',
          summary: article.description || '',
          content: article.content || article.description || '',
          source: article.source_id || '未知来源',
          imageUrl: article.image_url || '',
          category: mapCategory(article.category?.[0]),
          publishedAt: article.pubDate ? new Date(article.pubDate) : new Date()
        },
        create: {
          title: article.title || '无标题',
          summary: article.description || '',
          content: article.content || article.description || '',
          source: article.source_id || '未知来源',
          sourceUrl,
          imageUrl: article.image_url || '',
          category: mapCategory(article.category?.[0]),
          publishedAt: article.pubDate ? new Date(article.pubDate) : new Date()
        }
      })
      count++
    }
    
    res.json({ success: true, count })
  } catch (error) {
    console.error('刷新新闻失败:', error)
    res.status(500).json({ error: '刷新新闻失败: ' + error.message })
  } finally {
    await prisma.$disconnect()
  }
}
