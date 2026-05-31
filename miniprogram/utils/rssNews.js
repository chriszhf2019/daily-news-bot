/**
 * RSS 新闻源模块
 * 使用免费的 RSS 源获取中文新闻
 * 不需要 API Key，完全免费
 */

// RSS 转 JSON 服务配置
const RSS2JSON_BASE = 'https://api.rss2json.com/v1/api.json';

// RSS 源配置
const RSS_SOURCES = {
  // 36氪 - 科技创投
  kr36: {
    name: '36氪',
    rssUrl: 'https://36kr.com/feed',
    category: 'tech',
    priority: 1
  },
  // 虎嗅 - 科技商业
  huxiu: {
    name: '虎嗅',
    rssUrl: 'https://www.huxiu.com/rss/0.xml',
    category: 'tech',
    priority: 2
  },
  // 少数派 - 数字生活
  sspai: {
    name: '少数派',
    rssUrl: 'https://sspai.com/feed',
    category: 'tech',
    priority: 3
  },
  // 爱范儿 - 科技消费
  ifanr: {
    name: '爱范儿',
    rssUrl: 'https://www.ifanr.com/feed',
    category: 'tech',
    priority: 4
  },
  // 机器之心 - AI 专业
  jiqizhixin: {
    name: '机器之心',
    rssUrl: 'https://www.jiqizhixin.com/rss',
    category: 'AI',
    priority: 1
  },
  // 量子位 - AI 科技
  qbitai: {
    name: '量子位',
    rssUrl: 'https://www.qbitai.com/feed',
    category: 'AI',
    priority: 2
  }
};

// 从单个 RSS 源获取新闻
async function fetchNewsFromRSS(sourceKey, count = 10) {
  const source = RSS_SOURCES[sourceKey];
  if (!source) {
    throw new Error(`未知的 RSS 源: ${sourceKey}`);
  }
  
  try {
    console.log(`开始从 ${source.name} 获取新闻...`);
    
    const url = `${RSS2JSON_BASE}?rss_url=${encodeURIComponent(source.rssUrl)}`;
    
    const response = await new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: 'GET',
        timeout: 15000,  // 15秒超时
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(`RSS API Error: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
    
    if (response.status === 'ok' && response.items && Array.isArray(response.items)) {
      const newsData = response.items.slice(0, count).map((item, index) => ({
        id: `rss-${sourceKey}-${Date.now()}-${index}`,
        title: item.title || '无标题',
        summary: stripHtml(item.description || item.content || '').substring(0, 200),
        content: stripHtml(item.content || item.description || ''),
        category: source.category,
        source: source.name,
        published_at: item.pubDate || new Date().toISOString(),
        url: item.link || '',
        image: item.thumbnail || item.enclosure?.link || '',
        tags: extractTags(item.title, item.description),
        author: item.author || ''
      }));
      
      console.log(`${source.name} 成功获取新闻:`, newsData.length, '条');
      return newsData;
    } else {
      throw new Error(`${source.name} RSS 响应格式错误`);
    }
  } catch (error) {
    console.error(`${source.name} 获取新闻失败:`, error.message);
    throw error;
  }
}

// 从多个 RSS 源获取新闻（并行请求，提高速度）
async function fetchNewsFromMultipleRSS(count = 15) {
  const allNews = [];
  const sourceKeys = Object.keys(RSS_SOURCES);
  const perSource = Math.ceil(count / sourceKeys.length) + 2;  // 多取一些，防止某些源失败
  
  // 并行请求所有源
  const promises = sourceKeys.map(key => 
    fetchNewsFromRSS(key, perSource).catch(err => {
      console.warn(`RSS 源 ${key} 失败:`, err.message);
      return [];  // 失败返回空数组，不影响其他源
    })
  );
  
  const results = await Promise.all(promises);
  
  // 合并所有结果
  results.forEach(news => {
    if (Array.isArray(news)) {
      allNews.push(...news);
    }
  });
  
  if (allNews.length === 0) {
    throw new Error('所有 RSS 源都获取失败');
  }
  
  // 按发布时间排序（最新的在前）
  allNews.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  
  // 去重（根据标题）
  const seen = new Set();
  const uniqueNews = allNews.filter(news => {
    if (seen.has(news.title)) return false;
    seen.add(news.title);
    return true;
  });
  
  console.log(`RSS 源总共获取 ${uniqueNews.length} 条不重复新闻`);
  return uniqueNews.slice(0, count);
}

// 去除 HTML 标签
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// 从新闻内容提取标签
function extractTags(title, description) {
  const content = `${title || ''} ${description || ''}`;
  const tags = [];
  
  // AI 相关
  const aiKeywords = ['AI', '人工智能', 'GPT', 'Claude', 'ChatGPT', '大模型', '机器学习', '深度学习', 'OpenAI', 'DeepSeek', 'Anthropic', 'Gemini', 'Llama'];
  aiKeywords.forEach(keyword => {
    if (content.includes(keyword)) tags.push(keyword);
  });
  
  // 科技相关
  const techKeywords = ['苹果', 'Apple', '华为', '小米', 'OPPO', 'vivo', '特斯拉', 'Tesla', '芯片', '5G', '6G', '手机', 'iPhone', 'Android', '智能', '创新'];
  techKeywords.forEach(keyword => {
    if (content.includes(keyword)) tags.push(keyword);
  });
  
  // 财经相关
  const financeKeywords = ['股市', '美联储', '利率', '通胀', 'GDP', '经济', '金融', '投资', '融资', 'IPO', '上市'];
  financeKeywords.forEach(keyword => {
    if (content.includes(keyword)) tags.push(keyword);
  });
  
  // 去重并限制数量
  const uniqueTags = [...new Set(tags)];
  return uniqueTags.length > 0 ? uniqueTags.slice(0, 5) : ['科技', '新闻'];
}

// 测试 RSS 源连接
async function testRSSConnection() {
  try {
    const news = await fetchNewsFromRSS('kr36', 1);
    return { success: true, message: `连接成功，获取到 ${news.length} 条新闻` };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

module.exports = {
  RSS_SOURCES,
  fetchNewsFromRSS,
  fetchNewsFromMultipleRSS,
  testRSSConnection
};
