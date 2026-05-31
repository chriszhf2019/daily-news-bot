/**
 * 真实新闻数据获取模块
 * 用于获取真实的新闻数据，支持三种表达模式（标准、小白、脱水）
 */

// 导入真实信源数据
const realSources = require('../data/real_sources.js');

// ==================== 真实新闻API配置 ====================

// 免费新闻API列表
const NEWS_APIS = {
  gnews: {
    name: 'GNews',
    baseUrl: 'https://gnews.io/api/v4',
    apiKey: '',
    isFree: true,
    description: '免费新闻API，每日100次请求'
  },
  mediastack: {
    name: 'MediaStack',
    baseUrl: 'http://api.mediastack.com/v1',
    apiKey: '',
    isFree: true,
    description: '免费新闻API，每月1000次请求'
  }
};

// ==================== 真实新闻数据获取函数 ====================

// 从真实API获取新闻数据
async function fetchRealNewsFromAPI(category = 'AI', count = 10) {
  try {
    const apiKey = wx.getStorageSync('news_api_key') || '';
    
    if (!apiKey) {
      console.warn('未配置新闻API密钥，使用备用数据');
      return null;
    }
    
    // 使用GNews API（免费）
    const apiUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(category)}&lang=zh&country=cn&max=${count}&apikey=${apiKey}`;
    
    const response = await new Promise((resolve, reject) => {
      wx.request({
        url: apiUrl,
        method: 'GET',
        timeout: 30000,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(`API Error: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
    
    // 转换为标准格式
    const newsData = response.articles.map((article, index) => ({
      id: `real-${Date.now()}-${index}`,
      title: article.title,
      summary: article.description,
      category: category,
      source: article.source.name,
      published_at: article.publishedAt,
      url: article.url,
      image: article.image,
      tags: extractTags(article.title, article.description)
    }));
    
    console.log('成功获取真实新闻数据:', newsData.length, '条');
    return newsData;
  } catch (error) {
    console.error('获取真实新闻数据失败:', error);
    return null;
  }
}

// 从新闻内容提取标签
function extractTags(title, description) {
  const content = `${title} ${description}`;
  const tags = [];
  
  // AI相关标签
  const aiKeywords = ['AI', '人工智能', 'GPT', 'Claude', 'ChatGPT', '大模型', '机器学习', '深度学习'];
  aiKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      tags.push(keyword);
    }
  });
  
  // 科技相关标签
  const techKeywords = ['苹果', '华为', '特斯拉', '芯片', '5G', '6G', '手机', '电脑'];
  techKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      tags.push(keyword);
    }
  });
  
  // 财经相关标签
  const financeKeywords = ['股市', '美联储', '利率', '通胀', 'GDP', '经济', '金融'];
  financeKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      tags.push(keyword);
    }
  });
  
  return tags.length > 0 ? tags : ['新闻'];
}

// ==================== 三种表达模式生成函数 ====================

// 生成标准模式数据（专业、详细）
function generateStandardModeData(news) {
  const realSourcesData = realSources.getRealSourcesByCategory(news.category || 'AI');
  const realFactCheck = realSources.findRealFactCheck(news.title);
  const realTimeline = realSources.getRealTimelineByCategory(news.category || 'AI');
  
  return {
    summary: news.summary,
    source: news.source,
    time: formatTime(news.published_at),
    ai_analysis: `基于真实新闻"${news.title}"的AI分析：该事件在${news.category}领域具有重要意义。从多个信源的报道来看，事件的核心信息是${news.summary.substring(0, 50)}...。建议关注：${news.tags.join('、')}等相关话题。`,
    prediction: `基于当前趋势，预计${news.category}领域将持续发展。相关企业可能推出新的产品或服务，市场竞争将加剧。建议持续关注后续报道。`,
    related: news.tags.slice(0, 3),
    timeline: realTimeline.slice(0, 4)
  };
}

// 生成小白模式数据（通俗易懂、形象比喻）
function generateNewbieModeData(news) {
  const category = news.category || 'AI';
  
  // 根据分类选择不同的模板
  const templates = {
    AI: {
      simple_summary: `${news.title}。简单说，就是AI变得更聪明了，能做的事情更多了。`,
      jargon_tips: [
        { term: '大模型', explain: '就是AI的"大脑"，参数越多越聪明' },
        { term: '推理能力', explain: 'AI的"思考能力"，能像人一样分析问题' },
        { term: 'API', explain: '程序员调用AI能力的"接口"' }
      ]
    },
    tech: {
      simple_summary: `${news.title}。简单说，就是科技产品更新了，功能更强大了。`,
      jargon_tips: [
        { term: '芯片', explain: '手机的"大脑"，决定手机的速度和性能' },
        { term: '5G/6G', explain: '手机网络技术，5G比4G快，6G比5G更快' },
        { term: '端侧AI', explain: 'AI直接在手机上运行，不用联网，速度快、隐私好' }
      ]
    },
    finance: {
      simple_summary: `${news.title}。简单说，就是央行调整政策了，会影响大家的钱袋子。`,
      jargon_tips: [
        { term: '基点', explain: '利率的计量单位，1个基点=0.01%' },
        { term: '降息', explain: '降低利率，借钱变便宜了' },
        { term: '流动性', explain: '市场上"钱多不多"，钱多资产价格容易涨' }
      ]
    }
  };
  
  const template = templates[category] || templates.AI;
  
  return {
    simple_summary: template.simple_summary,
    jargon_tips: template.jargon_tips
  };
}

// 为真实新闻生成脱水模式数据
function generateDehydratedModeData(news) {
  const keywords = ['发布', '突破', '增长', '下降', '上涨', '下跌', '创新', '升级'];
  let summary = news.title;
  
  keywords.forEach(keyword => {
    if (summary.includes(keyword)) {
      summary = summary.replace(keyword, '');
    }
  });
  
  return {
    dehydrated: summary.trim().substring(0, 20)
  };
}

// 为真实新闻生成情绪指数
function generateSentimentData(news) {
  const title = news.title + (news.summary || '');
  const positive = ['突破', '增长', '上涨', '成功', '创新', '升级', '发布'];
  const negative = ['下跌', '下降', '风险', '危机', '失败', '警告'];
  
  let score = 50;
  positive.forEach(word => { if (title.includes(word)) score += 5; });
  negative.forEach(word => { if (title.includes(word)) score -= 5; });
  
  score = Math.min(100, Math.max(0, score));
  
  return {
    sentiment: score,
    is_signal: score >= 75
  };
}

// 为真实新闻生成涟漪效应
function generateRippleEffects(news) {
  const category = news.category || 'AI';
  
  const effects = {
    AI: [
      { industry: 'AI应用开发', impact: '开发效率提升，成本降低' },
      { industry: '教育行业', impact: '个性化教学成为可能' },
      { industry: '内容创作', impact: 'AI生成内容质量提升' }
    ],
    tech: [
      { industry: '手机制造', impact: '产业链受益' },
      { industry: '软件开发', impact: '开发工具升级' },
      { industry: '消费者', impact: '用户体验提升' }
    ],
    finance: [
      { industry: '股市', impact: '流动性变化' },
      { industry: '房地产', impact: '房贷成本变化' },
      { industry: '消费', impact: '购买力变化' }
    ]
  };
  
  return effects[category] || effects.AI;
}

// 为真实新闻生成正反观点
function generateDebateData(news) {
  const category = news.category || 'AI';
  
  const debates = {
    AI: {
      pro: {
        title: '支持观点',
        weight: 70,
        points: [
          'AI能力大幅提升，推动生产力革命',
          '降低成本，让更多企业用得起AI',
          '长上下文支持，可处理更复杂任务'
        ]
      },
      con: {
        title: '担忧观点',
        weight: 30,
        points: [
          'AI可能取代更多工作岗位',
          '数据隐私和安全问题突出',
          'AI幻觉问题仍需解决'
        ]
      },
      verdict: 'AI技术突破不可否认，但需要在推动创新和防范风险之间找到平衡。'
    },
    tech: {
      pro: {
        title: '支持观点',
        weight: 75,
        points: [
          '技术进步推动产业发展',
          '用户体验不断提升',
          '创新带来新机遇'
        ]
      },
      con: {
        title: '担忧观点',
        weight: 25,
        points: [
          '技术更新换代快，旧设备淘汰',
          '价格可能上涨',
          '隐私和安全问题'
        ]
      },
      verdict: '技术进步是必然趋势，建议积极拥抱新技术，同时关注潜在风险。'
    },
    finance: {
      pro: {
        title: '支持观点',
        weight: 65,
        points: [
          '刺激经济增长',
          '降低企业融资成本',
          '促进消费和投资'
        ]
      },
      con: {
        title: '担忧观点',
        weight: 35,
        points: [
          '可能引发通胀',
          '资产价格泡沫风险',
          '政策不确定性'
        ]
      },
      verdict: '政策调整是经济调控的必要手段，建议理性应对，关注长期影响。'
    }
  };
  
  return debates[category] || debates.AI;
}

// 格式化时间
function formatTime(timeStr) {
  if (!timeStr) return '未知时间';
  
  try {
    const date = new Date(timeStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    
    return `${month}月${day}日 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  } catch (error) {
    return timeStr;
  }
}

// ==================== 组合所有模式数据 ====================

// 为真实新闻生成完整的三种模式数据
function generateCompleteNewsData(news) {
  return {
    ...news,
    
    // 标准模式数据（真实新闻 + 专业分析）
    standard: generateStandardModeData(news),
    
    // 小白模式数据（真实新闻 + 通俗解释）
    newbie: generateNewbieModeData(news),
    
    // 脱水模式数据
    dehydrated: generateDehydratedModeData(news),
    
    // 情绪和信号
    sentiment: generateSentimentData(news).sentiment,
    is_signal: generateSentimentData(news).is_signal,
    sourceReliability: 'high',
    
    // 涟漪效应
    rippleEffects: generateRippleEffects(news),
    
    // 正反观点
    debate: generateDebateData(news)
  };
}

// 批量生成新闻数据
async function generateNewsDataList(newsList) {
  return newsList.map(news => generateCompleteNewsData(news));
}

module.exports = {
  NEWS_APIS,
  fetchRealNewsFromAPI,
  generateStandardModeData,
  generateNewbieModeData,
  generateDehydratedModeData,
  generateSentimentData,
  generateRippleEffects,
  generateDebateData,
  generateCompleteNewsData,
  generateNewsDataList
};