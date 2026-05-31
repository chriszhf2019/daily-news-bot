/**
 * NewsData.io API 模块
 * 免费额度：每天 200 次请求
 * 支持中文新闻
 * https://newsdata.io/
 */

// API 配置
const NEWSDATA_CONFIG = {
  baseUrl: 'https://newsdata.io/api/1',
  // 默认 API Key（免费版每天200次请求）
  apiKey: 'pub_24e3e6b568bc4dc092f837de6c18ec39'
};

// 获取 API Key（优先使用用户配置，否则使用默认）
function getApiKey() {
  return wx.getStorageSync('newsdata_api_key') || NEWSDATA_CONFIG.apiKey;
}

// 从 NewsData.io 获取新闻
async function fetchNews(options = {}) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('未配置 NewsData.io API Key');
  }
  
  const {
    country = 'cn',      // 中国新闻
    language = 'zh',     // 中文
    category = '',       // 分类：business, entertainment, environment, food, health, politics, science, sports, technology, top, world
    q = '',              // 搜索关键词
    size = 10            // 返回数量（免费版最多10条）
  } = options;
  
  try {
    console.log('开始从 NewsData.io 获取新闻...');
    
    // 构建请求参数
    const params = {
      apikey: apiKey,
      country: country,
      language: language
    };
    
    if (category) params.category = category;
    if (q) params.q = q;
    
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    
    const url = `${NEWSDATA_CONFIG.baseUrl}/news?${queryString}`;
    
    const response = await new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: 'GET',
        timeout: 30000,
        success: (res) => {
          console.log('NewsData.io 响应:', res.statusCode);
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(`NewsData.io API Error: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          console.error('NewsData.io 请求失败:', err);
          reject(err);
        }
      });
    });
    
    if (response.status === 'success' && response.results && Array.isArray(response.results)) {
      const newsData = response.results.slice(0, size).map((article, index) => ({
        id: `newsdata-${Date.now()}-${index}`,
        title: article.title || '无标题',
        summary: article.description || article.content || article.title || '无摘要',
        content: article.content || article.description || '',
        category: mapCategory(article.category?.[0]),
        source: article.source_id || article.source_name || 'NewsData',
        published_at: article.pubDate || new Date().toISOString(),
        url: article.link || '',
        image: article.image_url || '',
        tags: extractTags(article.title, article.description, article.keywords),
        author: article.creator?.[0] || ''
      }));
      
      console.log('NewsData.io 成功获取新闻:', newsData.length, '条');
      return newsData;
    } else {
      console.error('NewsData.io 响应格式错误:', response);
      throw new Error(response.message || 'NewsData.io 响应格式错误');
    }
  } catch (error) {
    console.error('NewsData.io 获取新闻失败:', error);
    throw error;
  }
}

// 获取多个分类的新闻
async function fetchMultiCategoryNews(categories = ['technology', 'business', 'science'], size = 15) {
  const allNews = [];
  const perCategory = Math.ceil(size / categories.length);
  
  for (const category of categories) {
    try {
      const news = await fetchNews({ category, size: perCategory });
      allNews.push(...news);
    } catch (error) {
      console.error(`获取 ${category} 分类新闻失败:`, error.message);
    }
  }
  
  // 按发布时间排序
  allNews.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  
  return allNews.slice(0, size);
}

// 映射分类
function mapCategory(newsDataCategory) {
  const categoryMap = {
    'technology': 'tech',
    'business': 'finance',
    'science': 'tech',
    'health': 'tech',
    'entertainment': 'international',
    'sports': 'sports',
    'politics': 'international',
    'world': 'international',
    'top': 'AI'
  };
  
  return categoryMap[newsDataCategory] || 'AI';
}

// 提取标签
function extractTags(title, description, keywords) {
  // 优先使用 API 返回的关键词
  if (keywords && Array.isArray(keywords) && keywords.length > 0) {
    return keywords.slice(0, 5);
  }
  
  const content = `${title || ''} ${description || ''}`;
  const tags = [];
  
  // AI 相关
  const aiKeywords = ['AI', '人工智能', 'GPT', 'Claude', 'ChatGPT', '大模型', '机器学习', 'OpenAI', 'DeepSeek'];
  aiKeywords.forEach(keyword => {
    if (content.includes(keyword)) tags.push(keyword);
  });
  
  // 科技相关
  const techKeywords = ['苹果', 'Apple', '华为', '小米', '特斯拉', '芯片', '5G', '手机', 'iPhone'];
  techKeywords.forEach(keyword => {
    if (content.includes(keyword)) tags.push(keyword);
  });
  
  // 财经相关
  const financeKeywords = ['股市', '美联储', '利率', '经济', '金融', '投资', 'IPO'];
  financeKeywords.forEach(keyword => {
    if (content.includes(keyword)) tags.push(keyword);
  });
  
  const uniqueTags = [...new Set(tags)];
  return uniqueTags.length > 0 ? uniqueTags.slice(0, 5) : ['新闻'];
}

// 测试 API 连接
async function testConnection() {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { success: false, message: '未配置 API Key' };
  }
  
  try {
    const news = await fetchNews({ size: 1 });
    return { success: true, message: `连接成功，获取到 ${news.length} 条新闻` };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

module.exports = {
  NEWSDATA_CONFIG,
  getApiKey,
  fetchNews,
  fetchMultiCategoryNews,
  testConnection
};
