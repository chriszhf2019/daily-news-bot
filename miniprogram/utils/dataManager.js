// utils/dataManager.js
const { generateId, showError, showSuccess } = require('./util.js')

class DataManager {
  constructor() {
    this.storageKey = 'newsAppData'
    this.userPreferencesKey = 'userPreferences'
    this.readHistoryKey = 'readHistory'
  }

  // 初始化数据（不再生成模拟数据，由后端 API 提供真实新闻）
  init() {
    const defaultData = {
      news: [],
      categories: ['AI动态', '商业财经', '科技前沿', '国际要闻'],
      favorites: [],
      lastUpdate: Date.now()
    }

    const existingData = wx.getStorageSync(this.storageKey)
    if (!existingData || !existingData.news) {
      wx.setStorageSync(this.storageKey, defaultData)
    }
  }

  // 生成模拟新闻数据
  generateMockNews() {
    const mockNews = [
      {
        id: '1',
        title: 'OpenAI发布GPT-5：多模态能力突破，推理性能提升300%',
        summary: 'OpenAI今日发布GPT-5模型，在逻辑推理、数学计算、代码生成等领域表现卓越，推理性能相比GPT-4提升300%。新模型支持文本、图像、音频、视频的实时理解与生成，标志着人工智能向通用智能迈进的重要一步。',
        source: 'OpenAI官方',
        publishTime: new Date(),
        category: 'AI动态',
        tags: ['GPT-5', 'OpenAI', '多模态', '推理能力'],
        content: `
OpenAI今日正式发布GPT-5模型，这是继GPT-4之后的又一重大突破。新模型在多个方面实现了显著提升：

**核心能力突破：**
- 推理性能相比GPT-4提升300%
- 支持实时多模态理解（文本、图像、音频、视频）
- 代码生成准确率提升45%
- 数学推理能力接近人类专家水平

**技术创新：**
GPT-5采用了全新的Transformer架构，训练数据规模达到100万亿token，模型参数量达到1.8万亿。新模型还引入了"推理链"技术，能够进行更复杂的多步骤推理。

**应用前景：**
OpenAI表示，GPT-5将在教育、医疗、科研、金融等领域发挥重要作用。目前已与多家企业达成合作意向，预计2025年第一季度开始大规模商业应用。
        `,
        aiAnalysis: {
          interpretation: 'GPT-5的发布标志着AI技术进入新阶段。推理能力的突破将改变AI从"模式识别"到"真正理解"的转变，这将重新定义AI在各行业的应用边界。短期内可能引发AI基础设施投资热潮，中期将催生更多基于推理能力的新应用场景。',
          prediction: '短期内（1-3个月），各大科技公司将加速AI模型研发投入。中期（6-12个月），基于GPT-5的企业级应用将大规模涌现。长期（1-2年），AI推理能力将成为衡量技术竞争力的关键指标。'
        },
        relatedInfo: [
          '微软宣布将在Azure平台集成GPT-5服务',
          '谷歌紧急发布Gemini Ultra 2.0应对竞争',
          '百度文心一言4.0将于下月发布',
          'Anthropic发布Claude 3.5挑战GPT-5'
        ],
        timeline: [
          '2024.11：OpenAI开始GPT-5内部测试',
          '2024.12：GPT-5性能评测结果泄露',
          '2025.01：OpenAI正式发布GPT-5',
          '2025.02：GPT-5 API将向开发者开放'
        ]
      },
      {
        id: '2',
        title: '苹果Vision Pro 2代正式发布：显示效果提升50%，重量减轻30%',
        summary: '苹果发布Vision Pro 2代头显，采用全新Micro-OLED显示屏，显示效果相比前代提升50%，整机重量减轻30%至380克。续航时间延长至4小时，售价2999美元起。',
        source: 'Apple官方',
        publishTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        category: '科技前沿',
        tags: ['Vision Pro', 'AR/VR', '苹果', '头显设备'],
        content: `
苹果今日发布了备受期待的Vision Pro 2代头显设备，这是对初代产品的全面升级：

**硬件升级：**
- 全新Micro-OLED显示屏，分辨率达到8K per eye
- 显示效果相比初代提升50%
- 整机重量减轻至380克（减少30%）
- 续航时间延长至4小时

**性能提升：**
- 采用M3芯片，性能提升40%
- 散热系统优化，工作温度降低15°C
- 新增眼动追踪2.0技术，精准度提升25%

**软件生态：**
- visionOS 3.0系统，优化MR体验
- 新增实时翻译、AR导航等功能
- 支持更多第三方应用

**价格与上市：**
Vision Pro 2代售价2999美元起，2月15日开始预售，预计3月初正式发货。苹果同时宣布初代Vision Pro降价至1999美元。
        `,
        aiAnalysis: {
          interpretation: 'Vision Pro 2代的发布显示了苹果在AR/VR领域的持续投入。硬件优化解决了初代产品重量和续航问题，软件生态的完善将推动MR应用普及。预计这将加速整个XR行业的硬件升级周期。',
          prediction: '短期内（1-3个月），Vision Pro 2代预售情况将验证市场需求。中期（6-12个月），其他厂商将跟进硬件优化。长期（1-2年），MR设备可能成为苹果新的增长引擎。'
        },
        relatedInfo: [
          'Meta Quest 4将于下月发布，售价2499美元',
          '微软HoloLens 3开发中，预计2025年下半年发布',
          '字节跳动PICO 5支持8K显示，售价2299元',
          '索尼PSVR 2降价至2999元清库存'
        ],
        timeline: [
          '2024.12：苹果开始Vision Pro 2代量产',
          '2025.01：Vision Pro 2代正式发布',
          '2025.02：开启预售',
          '2025.03：正式发货'
        ]
      },
      {
        id: '3',
        title: '美联储暗示2025年可能降息3次，美股三大指数创历史新高',
        summary: '美联储主席鲍威尔在讲话中暗示2025年可能进行3次降息，幅度25个基点。受此消息刺激，美股三大指数均创历史新高，纳斯达克指数首次突破20000点大关。',
        source: '美联储',
        publishTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
        category: '商业财经',
        tags: ['美联储', '降息', '股市', '货币政策'],
        content: `
美联储主席杰罗姆·鲍威尔在今日的经济政策讲话中释放了重要信号：

**货币政策转向：**
- 2025年可能进行3次降息，每次25个基点
- 当前5.25%-5.50%的利率水平有望下调至4.50%-4.75%
- 通胀目标维持在2%，目前通胀率已回落至2.8%

**市场反应：**
消息公布后，美股市场出现强劲反弹：
- 道琼斯指数上涨2.1%，首次突破45000点
- 纳斯达克指数上涨2.8%，历史首次突破20000点
- 标普500指数上涨2.3%，创下历史新高

**经济前景：**
美联储表示，当前美国经济表现稳健，就业市场逐步降温但仍保持强劲。降息决策将基于实际经济数据，灵活调整政策节奏。

**全球影响：**
美联储政策转向可能影响全球货币政策走向，各国央行或将跟进调整利率政策。
        `,
        aiAnalysis: {
          interpretation: '美联储的降息信号标志着货币政策从紧缩转向宽松。这将刺激企业投资和消费者支出，对股市形成利好。但同时也可能重新推高资产泡沫风险。',
          prediction: '短期内（1-3个月），美股有望继续上涨，企业融资成本下降。中期（6-12个月），降息效果将传导至实体经济。长期（1-2年），需关注通胀回升风险。'
        },
        relatedInfo: [
          '欧洲央行表示可能跟随美联储降息',
          '中国央行维持LPR利率不变',
          '日本央行计划逐步退出负利率政策',
          '新兴市场国家或将面临资本外流压力'
        ],
        timeline: [
          '2024.12：美联储暗示降息可能',
          '2025.01：首次降息25个基点',
          '2025.03：第二次降息',
          '2025.06：第三次降息'
        ]
      },
      {
        id: '4',
        title: 'COP30气候峰会达成历史性协议：全球碳排放2030年减少50%',
        summary: '在巴西举行的COP30气候峰会达成历史性协议，全球195个国家承诺2030年将碳排放相比2019年减少50%，2050年实现碳中和。协议还包括发达国家向发展中国家提供1000亿美元气候资金支持。',
        source: '联合国气候变化框架公约',
        publishTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
        category: '国际要闻',
        tags: ['COP30', '气候变化', '碳排放', '国际协议'],
        content: `
第30届联合国气候变化大会（COP30）在巴西圣保罗落下帷幕，195个缔约方达成历史性协议：

**核心目标：**
- 2030年全球碳排放相比2019年减少50%
- 2050年实现全球碳中和
- 各国需每5年更新国家自主贡献目标

**资金支持：**
- 发达国家承诺到2025年向发展中国家提供1000亿美元气候资金
- 建立损失与损害基金，支持气候脆弱国家
- 私营部门投资达到2万亿美元规模

**技术合作：**
- 加快清洁能源技术转移
- 支持发展中国家可再生能源发展
- 建立全球碳市场机制

**监督机制：**
- 强化透明度和报告要求
- 建立国际气候法庭
- 对不履行承诺的国家实施制裁

**挑战与机遇：**
协议的实施面临各国经济发展阶段不同、技术水平差异等挑战，但也为清洁能源、绿色技术带来巨大市场机遇。
        `,
        aiAnalysis: {
          interpretation: 'COP30协议是全球气候治理的重要里程碑。50%的减排目标显示了国际社会的决心，但实现难度极大。这将重塑全球能源结构，推动绿色技术革命。',
          prediction: '短期内（1-3个月），各国将制定具体行动计划。中期（6-12个月），清洁能源投资将大幅增加。长期（1-2年），传统能源行业面临重大转型压力。'
        },
        relatedInfo: [
          '中国宣布2030年前碳排放达峰',
          '欧盟推进碳边境调节机制',
          '美国通过《清洁能源法案》',
          '印度承诺2070年实现净零排放'
        ],
        timeline: [
          '2024.12：COP30气候峰会开幕',
          '2025.01：达成最终协议',
          '2025.03：各国提交行动计划',
          '2025.06：启动资金支持机制'
        ]
      }
    ]

    const data = wx.getStorageSync(this.storageKey)
    data.news = mockNews
    data.lastUpdate = Date.now()
    wx.setStorageSync(this.storageKey, data)
  }

  // 获取新闻列表
  getNewsList(category = '', searchKeyword = '') {
    const data = wx.getStorageSync(this.storageKey)
    let newsList = data.news || []

    // 分类筛选
    if (category && category !== '全部') {
      newsList = newsList.filter(news => news.category === category)
    }

    // 关键词搜索
    if (searchKeyword) {
      newsList = newsList.filter(news => 
        news.title.includes(searchKeyword) || 
        news.summary.includes(searchKeyword) ||
        news.content.includes(searchKeyword)
      )
    }

    return newsList
  }

  // 根据ID获取新闻详情
  getNewsById(id) {
    const data = wx.getStorageSync(this.storageKey)
    return data.news.find(news => news.id === id)
  }

  // 切换收藏状态
  toggleFavorite(newsId) {
    const data = wx.getStorageSync(this.storageKey)
    const favorites = data.favorites || []
    
    const index = favorites.indexOf(newsId)
    if (index > -1) {
      favorites.splice(index, 1)
      showSuccess('已取消收藏')
    } else {
      favorites.push(newsId)
      showSuccess('已添加到收藏')
    }
    
    data.favorites = favorites
    wx.setStorageSync(this.storageKey, data)
    return favorites.includes(newsId)
  }

  // 检查是否收藏
  isFavorite(newsId) {
    const data = wx.getStorageSync(this.storageKey)
    const favorites = data.favorites || []
    return favorites.includes(newsId)
  }

  // 获取收藏列表
  getFavorites() {
    const data = wx.getStorageSync(this.storageKey)
    const favorites = data.favorites || []
    return data.news.filter(news => favorites.includes(news.id))
  }

  // 添加到阅读历史
  addToHistory(newsId) {
    const data = wx.getStorageSync(this.storageKey)
    const history = data.readHistory || []
    
    // 移除已存在的记录
    const existingIndex = history.indexOf(newsId)
    if (existingIndex > -1) {
      history.splice(existingIndex, 1)
    }
    
    // 添加到开头
    history.unshift(newsId)
    
    // 保持最多50条记录
    if (history.length > 50) {
      history.splice(50)
    }
    
    data.readHistory = history
    wx.setStorageSync(this.storageKey, data)
  }

  // 获取阅读历史
  getReadHistory() {
    const data = wx.getStorageSync(this.storageKey)
    const history = data.readHistory || []
    return data.news.filter(news => history.includes(news.id))
  }

  // 获取用户偏好设置
  getUserPreferences() {
    return wx.getStorageSync(this.userPreferencesKey) || {
      favoriteCategories: [],
      notificationEnabled: true,
      fontSize: 'medium',
      darkMode: false
    }
  }

  // 保存用户偏好设置
  saveUserPreferences(preferences) {
    wx.setStorageSync(this.userPreferencesKey, preferences)
  }

  // 获取统计数据
  getStatistics() {
    const data = wx.getStorageSync(this.storageKey)
    const news = data.news || []
    const favorites = data.favorites || []
    const history = data.readHistory || []
    
    return {
      totalNews: news.length,
      totalFavorites: favorites.length,
      totalRead: history.length,
      categoryStats: this.getCategoryStats(news),
      readStats: this.getReadStats(history)
    }
  }

  // 获取分类统计
  getCategoryStats(news) {
    const stats = {}
    news.forEach(item => {
      stats[item.category] = (stats[item.category] || 0) + 1
    })
    return stats
  }

  // 获取阅读统计
  getReadStats(history) {
    return {
      total: history.length,
      recent: history.slice(0, 10).length,
      categories: this.getReadCategoryStats()
    }
  }

  // 获取阅读分类统计
  getReadCategoryStats() {
    const history = this.getReadHistory()
    return this.getCategoryStats(history)
  }

  // 清除所有数据
  clearAllData() {
    wx.removeStorageSync(this.storageKey)
    wx.removeStorageSync(this.userPreferencesKey)
    wx.removeStorageSync(this.readHistoryKey)
    this.init()
  }

  // 导出数据
  exportData() {
    const data = wx.getStorageSync(this.storageKey)
    const preferences = this.getUserPreferences()
    const statistics = this.getStatistics()
    
    return {
      news: data.news || [],
      favorites: data.favorites || [],
      readHistory: data.readHistory || [],
      preferences: preferences,
      statistics: statistics,
      exportTime: new Date().toISOString()
    }
  }

  // 导入数据
  importData(importData) {
    try {
      if (importData.news) {
        const data = wx.getStorageSync(this.storageKey) || {}
        data.news = importData.news
        wx.setStorageSync(this.storageKey, data)
      }
      
      if (importData.preferences) {
        this.saveUserPreferences(importData.preferences)
      }
      
      showSuccess('数据导入成功')
      return true
    } catch (error) {
      showError('数据导入失败：' + error.message)
      return false
    }
  }
}

module.exports = new DataManager()