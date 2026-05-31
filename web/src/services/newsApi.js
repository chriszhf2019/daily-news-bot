// NewsData.io API
const NEWSDATA_BASE = 'https://newsdata.io/api/1'

// RSS 转 JSON 服务
const RSS2JSON_BASE = 'https://api.rss2json.com/v1/api.json'

// RSS 源配置
const RSS_SOURCES = {
  kr36: { name: '36氪', rssUrl: 'https://36kr.com/feed', category: 'tech' },
  huxiu: { name: '虎嗅', rssUrl: 'https://www.huxiu.com/rss/0.xml', category: 'tech' },
  sspai: { name: '少数派', rssUrl: 'https://sspai.com/feed', category: 'tech' },
  ifanr: { name: '爱范儿', rssUrl: 'https://www.ifanr.com/feed', category: 'tech' }
}

// 从 NewsData.io 获取新闻
export async function fetchFromNewsData(apiKey, options = {}) {
  const { country = 'cn', language = 'zh', category = '', size = 10 } = options
  
  const params = new URLSearchParams({
    apikey: apiKey,
    country,
    language,
    ...(category && { category })
  })
  
  try {
    const response = await fetch(`${NEWSDATA_BASE}/news?${params}`)
    const data = await response.json()
    
    if (data.status === 'success' && data.results) {
      return data.results.slice(0, size).map((article, index) => ({
        id: `newsdata-${Date.now()}-${index}`,
        title: article.title || '无标题',
        summary: article.description || article.content || '',
        content: article.content || article.description || '',
        category: mapCategory(article.category?.[0]),
        source: article.source_id || 'NewsData',
        published_at: article.pubDate || new Date().toISOString(),
        url: article.link || '',
        image: article.image_url || '',
        tags: article.keywords || extractTags(article.title, article.description)
      }))
    }
    return []
  } catch (error) {
    console.error('NewsData.io 获取失败:', error)
    throw error
  }
}

// 从 RSS 源获取新闻
export async function fetchFromRSS(sourceKey, count = 10) {
  const source = RSS_SOURCES[sourceKey]
  if (!source) throw new Error(`未知的 RSS 源: ${sourceKey}`)
  
  try {
    const response = await fetch(`${RSS2JSON_BASE}?rss_url=${encodeURIComponent(source.rssUrl)}`)
    const data = await response.json()
    
    if (data.status === 'ok' && data.items) {
      return data.items.slice(0, count).map((item, index) => ({
        id: `rss-${sourceKey}-${Date.now()}-${index}`,
        title: item.title || '无标题',
        summary: stripHtml(item.description || item.content || '').substring(0, 200),
        content: stripHtml(item.content || item.description || ''),
        category: source.category,
        source: source.name,
        published_at: item.pubDate || new Date().toISOString(),
        url: item.link || '',
        image: item.thumbnail || '',
        tags: extractTags(item.title, item.description)
      }))
    }
    return []
  } catch (error) {
    console.error(`RSS 源 ${sourceKey} 获取失败:`, error)
    throw error
  }
}

// 从多个 RSS 源获取新闻
export async function fetchFromMultipleRSS(count = 15) {
  const allNews = []
  const sourceKeys = Object.keys(RSS_SOURCES)
  const perSource = Math.ceil(count / sourceKeys.length) + 2
  
  const promises = sourceKeys.map(key =>
    fetchFromRSS(key, perSource).catch(() => [])
  )
  
  const results = await Promise.all(promises)
  results.forEach(news => allNews.push(...news))
  
  // 按时间排序并去重
  allNews.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
  const seen = new Set()
  const uniqueNews = allNews.filter(news => {
    if (seen.has(news.title)) return false
    seen.add(news.title)
    return true
  })
  
  return uniqueNews.slice(0, count)
}

// 获取所有新闻（优先 NewsData.io，备选 RSS）
export async function fetchAllNews(apiKey) {
  // 优先使用 NewsData.io
  if (apiKey) {
    try {
      const news = await fetchFromNewsData(apiKey, { size: 15 })
      if (news.length > 0) return news
    } catch (e) {
      console.warn('NewsData.io 失败，切换到 RSS')
    }
  }
  
  // 备选 RSS
  return fetchFromMultipleRSS(15)
}

// 辅助函数
function mapCategory(category) {
  const map = {
    technology: 'tech',
    business: 'finance',
    science: 'tech',
    sports: 'sports',
    entertainment: 'international'
  }
  return map[category] || 'AI'
}

function stripHtml(html) {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractTags(title, description) {
  const content = `${title || ''} ${description || ''}`
  const tags = []
  
  const keywords = {
    AI: ['AI', '人工智能', 'GPT', 'ChatGPT', '大模型', 'OpenAI', 'DeepSeek'],
    tech: ['苹果', 'Apple', '华为', '小米', '特斯拉', '芯片', '5G', 'iPhone'],
    finance: ['股市', '美联储', '利率', '经济', '金融', '投资']
  }
  
  Object.values(keywords).flat().forEach(kw => {
    if (content.includes(kw)) tags.push(kw)
  })
  
  return [...new Set(tags)].slice(0, 5) || ['新闻']
}
