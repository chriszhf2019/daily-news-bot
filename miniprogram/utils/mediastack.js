/**
 * MediaStack API 集成模块
 * 用于获取真实的新闻数据
 */

// MediaStack API 配置
// 注意：MediaStack 免费版只支持 HTTP，付费版支持 HTTPS
// 微信小程序要求 HTTPS，所以免费版可能无法使用
const MEDIASTACK_CONFIG = {
  baseUrl: 'http://api.mediastack.com/v1',  // 免费版只支持 HTTP
  accessKey: '9d6bb2ef49afb2d3f6d4aeb199e8d3a0'
};

// ==================== MediaStack API 请求函数 ====================

// MediaStack API 请求封装
async function requestMediaStack(endpoint, options = {}) {
  try {
    const url = `${MEDIASTACK_CONFIG.baseUrl}${endpoint}`;
    
    const response = await new Promise((resolve, reject) => {
      wx.request({
        url: url,
        method: options.method || 'GET',
        data: options.data || {},
        timeout: 30000,
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          console.log('MediaStack API响应:', res);
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            console.error('MediaStack API错误:', res.statusCode, res.data);
            reject(new Error(`MediaStack API Error: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          console.error('MediaStack API请求失败:', err);
          reject(err);
        }
      });
    });
    
    return response;
  } catch (error) {
    console.error('MediaStack API请求异常:', error);
    throw error;
  }
}

// ==================== 新闻数据获取函数 ====================

// 从MediaStack API获取新闻数据
async function fetchNewsFromMediaStack(category = 'technology', count = 10) {
  try {
    console.log('开始从MediaStack API获取新闻数据，分类:', category, '数量:', count);
    
    const response = await requestMediaStack('/news', {
      method: 'GET',
      data: {
        access_key: MEDIASTACK_CONFIG.accessKey,
        categories: category,
        limit: count,
        sort: 'published_desc',
        languages: 'en'  // 免费版可能不支持中文，先用英文
      }
    });
    
    console.log('MediaStack API响应:', response);
    
    if (response && response.data && Array.isArray(response.data)) {
      const newsData = response.data.map((article, index) => ({
        id: `mediastack-${Date.now()}-${index}`,
        title: article.title || '无标题',
        summary: article.description || article.title || '无摘要',
        category: mapCategory(article.category),
        source: article.source || 'MediaStack',
        published_at: article.published_at || new Date().toISOString(),
        url: article.url || '',
        image: article.image || '',
        tags: extractTags(article.title, article.description)
      }));
      
      console.log('成功从MediaStack API获取新闻数据:', newsData.length, '条');
      return newsData;
    } else {
      console.error('MediaStack API响应格式错误:', response);
      throw new Error('MediaStack API响应格式错误');
    }
  } catch (error) {
    console.error('从MediaStack API获取新闻数据失败:', error);
    throw error;
  }
}

// 映射MediaStack分类到小程序分类
function mapCategory(mediaStackCategory) {
  const categoryMap = {
    'technology': 'AI',
    'business': 'finance',
    'science': 'tech',
    'health': 'tech',
    'entertainment': 'international',
    'sports': 'sports',
    'general': 'AI'
  };
  
  return categoryMap[mediaStackCategory] || 'AI';
}

// 从新闻内容提取标签
function extractTags(title, description) {
  const content = `${title} ${description || ''}`;
  const tags = [];
  
  // AI相关标签
  const aiKeywords = ['AI', '人工智能', 'GPT', 'Claude', 'ChatGPT', '大模型', '机器学习', '深度学习', 'OpenAI', 'DeepSeek'];
  aiKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      tags.push(keyword);
    }
  });
  
  // 科技相关标签
  const techKeywords = ['苹果', '华为', '特斯拉', '芯片', '5G', '6G', '手机', '电脑', '科技', '创新'];
  techKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      tags.push(keyword);
    }
  });
  
  // 财经相关标签
  const financeKeywords = ['股市', '美联储', '利率', '通胀', 'GDP', '经济', '金融', '投资', '股市'];
  financeKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      tags.push(keyword);
    }
  });
  
  return tags.length > 0 ? tags : ['新闻'];
}

// ==================== 导出模块 ====================

module.exports = {
  MEDIASTACK_CONFIG,
  requestMediaStack,
  fetchNewsFromMediaStack
};