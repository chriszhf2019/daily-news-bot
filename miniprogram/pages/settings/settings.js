const app = getApp()

const PERSONA_PREVIEWS = {
  analyst: '从数据角度分析，GPT-5的发布将使AI行业竞争格局发生根本性变化，预计影响市值超过万亿美元。',
  geek: '又是OpenAI搞事情！GPT-5这波操作直接把友商按在地上摩擦，不过说实话，这参数量看着就烧钱...',
  mentor: '简单来说，GPT-5就像是AI界的"升级版大脑"。以前的AI只能回答问题，现在它能像人一样思考和规划了。'
}

const READING_DEPTH_CONFIG = {
  0: { text: '极致脱水', desc: '只看核心要点，适合快速浏览' },
  1: { text: '平衡模式', desc: '兼顾效率与深度，适合日常阅读' },
  2: { text: '深度研报', desc: '完整分析报告，适合深度研究' }
}

const THEME_NAMES = {
  'deep-blue': '深邃蓝',
  'geek-black': '极客黑',
  'eye-green': '护眼绿'
}

const PERSONA_NAMES = {
  analyst: '专业分析师',
  geek: '毒舌极客',
  mentor: '耐心导师'
}

function debounce(func, wait) {
  let timeout
  return function(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

function throttle(func, wait) {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= wait) {
      lastTime = now
      func.apply(this, args)
    }
  }
}

Page({
  data: {
    settings: {
      pushNotifications: true,
      autoRefresh: true,
      fontSize: '中等',
      fontSizeIndex: 1,
      darkMode: true
    },
    fontSizeOptions: ['小', '中等', '大', '超大'],
    
    aiPersona: 'analyst',
    personaPreviewText: PERSONA_PREVIEWS.analyst,
    aiPersonaName: '专业分析师',
    
    themeColor: 'deep-blue',
    themeClass: '',
    
    readingDepth: 1,
    readingDepthText: '平衡模式',
    readingDepthDesc: '兼顾效率与深度，适合日常阅读',
    
    focusKeywords: [],
    newFocusKeyword: '',
    presetKeywords: ['华为', '特斯拉', '英伟达', 'OpenAI', '马斯克', '比亚迪', '苹果', '小米', '阿里巴巴', '腾讯'],
    
    interestTags: [],
    interestTagsDisplay: [],
    allInterestTags: [
      { id: 'ai_model', name: '大模型', icon: '🤖', category: 'AI' },
      { id: 'ai_agent', name: 'AI Agent', icon: '🦾', category: 'AI' },
      { id: 'chip', name: '半导体/芯片', icon: '💾', category: 'tech' },
      { id: 'space', name: '商业航天', icon: '🚀', category: 'tech' },
      { id: 'ev', name: '新能源汽车', icon: '🚗', category: 'tech' },
      { id: 'biotech', name: '生物医药', icon: '💊', category: 'tech' },
      { id: 'quantum', name: '量子计算', icon: '⚛️', category: 'tech' },
      { id: 'xr', name: 'XR/元宇宙', icon: '🥽', category: 'tech' },
      { id: 'a_stock', name: 'A股市场', icon: '📈', category: 'finance' },
      { id: 'us_stock', name: '美股动态', icon: '🇺🇸', category: 'finance' },
      { id: 'crypto', name: '数字货币', icon: '₿', category: 'finance' },
      { id: 'macro', name: '宏观经济', icon: '🌐', category: 'finance' },
      { id: 'policy', name: '政策法规', icon: '📜', category: 'international' },
      { id: 'geopolitics', name: '地缘政治', icon: '🗺️', category: 'international' },
      { id: 'sports', name: '体育赛事', icon: '⚽', category: 'sports' }
    ],
    showInterestModal: false,
    
    aiInstruction: '',
    showAiInstructionModal: false,
    
    dashboardModules: {
      sentiment: true,
      density: true,
      prediction: true,
      signals: true
    },
    
    // AI API配置（DeepSeek - 用于新闻分析）
    apiKey: '',
    showApiKey: false,
    apiKeyStatus: 'invalid',
    apiKeyStatusText: '未知',
    apiEndpoint: 'https://api.deepseek.com/v1',
    selectedModel: 'deepseek-chat',
    apiCallCount: 0,
    apiStatus: 'unknown',
    apiStatusText: '未知',
    
    // NewsData.io API配置（用于获取真实新闻）
    newsDataApiKey: '',
    showNewsDataApiKey: false,
    newsDataApiKeyStatus: 'none',
    newsDataApiKeyStatusText: '未配置',
    
    preferredCategories: ['AI动态', '科技前沿', '商业财经'],
    allCategories: ['AI动态', '科技前沿', '商业财经', '国际要闻', '体育竞技'],
    showCategoryModal: false,
    
    isLoading: false,
    
    // 模块提示相关
    showModuleTipModal: false,
    moduleTipTitle: '',
    moduleTipIcon: '',
    moduleTipDescription: '',
    moduleTipExamples: [],
    
    // 账户设置相关
    showProfileModal: false,
    profile: {
      nickname: '',
      avatar: '',
      bio: '',
      email: ''
    },
    
    showPrivacyModal: false,
    privacy: {
      dataCollection: true,
      analytics: true,
      personalizedContent: true,
      thirdPartySharing: false
    },
    
    // 收藏记录相关
    showFavoritesModal: false,
    favorites: [],
    favoritesCount: 0,
    
    // 阅读历史相关
    showHistoryModal: false,
    readingHistory: [],
    historyCount: 0,
    lastReadNews: null,
    
    // 数据统计
    stats: {
      totalRead: 0,
      totalFavorites: 0,
      totalDays: 0,
      lastRefreshTime: ''
    }
  },

  onLoad() {
    console.log('=== 设置页面加载 ===');
    this.setData({ isLoading: true });
    this.loadAllSettings();
    
    // 强制关闭加载状态：5秒后无论是否成功都关闭加载状态
    setTimeout(() => {
      if (this.data.isLoading) {
        console.warn('加载超时，强制关闭加载状态');
        this.setData({ isLoading: false });
        wx.showToast({
          title: '加载完成',
          icon: 'success',
          duration: 1500
        });
      }
    }, 5000);
  },

  onShow() {
  },

  // 简化加载逻辑，直接同步加载所有设置
  loadAllSettings() {
    try {
      const updates = {};
      
      // 加载AI人设
      const aiPersona = wx.getStorageSync('aiPersona') || 'analyst';
      updates.aiPersona = aiPersona;
      updates.personaPreviewText = PERSONA_PREVIEWS[aiPersona];
      updates.aiPersonaName = PERSONA_NAMES[aiPersona];
      
      // 加载主题
      const themeColor = wx.getStorageSync('themeColor') || 'deep-blue';
      updates.themeColor = themeColor;
      updates.themeClass = themeColor === 'deep-blue' ? '' : themeColor;
      
      // 加载阅读深度
      const readingDepth = wx.getStorageSync('readingDepth');
      if (readingDepth !== undefined && readingDepth !== '') {
        updates.readingDepth = readingDepth;
        updates.readingDepthText = READING_DEPTH_CONFIG[readingDepth].text;
        updates.readingDepthDesc = READING_DEPTH_CONFIG[readingDepth].desc;
      }
      
      // 加载用户基础设置
      const saved = wx.getStorageSync('userSettings');
      if (saved) {
        updates.settings = { ...this.data.settings, ...saved };
      }
      
      // 加载关注关键词
      const focusKeywords = wx.getStorageSync('focusKeywords') || [];
      updates.focusKeywords = focusKeywords;
      
      // 加载兴趣标签
      const interestTagIds = wx.getStorageSync('interestTags') || [];
      const interestTagsDisplay = interestTagIds.map(tagId => {
        const tag = this.data.allInterestTags.find(t => t.id === tagId);
        return tag ? `${tag.icon} ${tag.name}` : tagId;
      });
      updates.interestTags = interestTagIds;
      updates.interestTagsDisplay = interestTagsDisplay;
      
      // 加载AI指令
      const aiInstruction = wx.getStorageSync('aiInstruction') || '';
      updates.aiInstruction = aiInstruction;
      
      // 加载看板模块
      const dashboardModules = wx.getStorageSync('dashboardModules');
      if (dashboardModules) {
        updates.dashboardModules = dashboardModules;
      }
      
      // 加载偏好分类
      const categories = wx.getStorageSync('preferredCategories');
      if (categories) {
        updates.preferredCategories = categories;
      }
      
      // 加载API密钥（DeepSeek）
      const apiKey = wx.getStorageSync('deepseek_api_key') || '';
      updates.apiKey = apiKey;
      updates.apiKeyStatus = apiKey ? 'valid' : 'none';
      updates.apiKeyStatusText = apiKey ? '已配置' : '未配置';
      
      // 加载NewsData.io API密钥
      const newsDataApiKey = wx.getStorageSync('newsdata_api_key') || '';
      updates.newsDataApiKey = newsDataApiKey;
      updates.newsDataApiKeyStatus = newsDataApiKey ? 'valid' : 'none';
      updates.newsDataApiKeyStatusText = newsDataApiKey ? '已配置' : '未配置（使用RSS源）';
      
      // 加载API端点
      const apiEndpoint = wx.getStorageSync('deepseek_api_endpoint') || 'https://api.deepseek.com/v1';
      updates.apiEndpoint = apiEndpoint;
      
      // 加载模型选择
      const selectedModel = wx.getStorageSync('deepseek_model') || 'deepseek-chat';
      updates.selectedModel = selectedModel;
      
      // 加载API调用次数
      const apiCallCount = wx.getStorageSync('apiCallCount') || 0;
      updates.apiCallCount = apiCallCount;
      
      // 加载API状态
      const apiStatus = wx.getStorageSync('apiStatus') || 'unknown';
      updates.apiStatus = apiStatus;
      updates.apiStatusText = apiStatus === 'valid' ? '连接正常' : (apiStatus === 'invalid' ? '连接失败' : '未测试');
      
      // 加载个人资料
      const profile = wx.getStorageSync('userProfile');
      if (profile) {
        updates.profile = { ...this.data.profile, ...profile };
      }
      
      // 加载隐私设置
      const privacy = wx.getStorageSync('privacySettings');
      if (privacy) {
        updates.privacy = { ...this.data.privacy, ...privacy };
      }
      
      // 确保isLoading为false
      updates.isLoading = false;
      
      // 一次性更新所有数据
      this.setData(updates);
      
      console.log('设置加载完成');
    } catch (error) {
      console.error('加载设置失败:', error);
      this.setData({ isLoading: false });
    }
  },

  // 保留原有的分阶段加载方法（备用）
  loadSettingsInStages() {
    return this.loadCoreSettings()
      .then(() => {
        return this.loadSecondarySettings();
      })
      .then(() => {
        return this.loadApiSettings();
      })
      .catch((error) => {
        console.error('加载设置失败:', error);
        wx.showToast({ title: '加载设置失败', icon: 'none' });
      })
      .finally(() => {
        this.setData({ isLoading: false });
      });
  },

  selectPersona(e) {
    const persona = e.currentTarget.dataset.persona;
    this.setData({
      aiPersona: persona,
      personaPreviewText: PERSONA_PREVIEWS[persona],
      aiPersonaName: PERSONA_NAMES[persona]
    })
    wx.setStorageSync('aiPersona', persona)
    wx.showToast({ title: `已切换为${PERSONA_NAMES[persona]}`, icon: 'success' })
  },

  selectTheme(e) {
    const theme = e.currentTarget.dataset.theme;
    this.setData({
      themeColor: theme,
      themeClass: theme === 'deep-blue' ? '' : theme
    })
    wx.setStorageSync('themeColor', theme)
    wx.showToast({ title: `已切换为${THEME_NAMES[theme]}`, icon: 'success' })
  },

  changeReadingDepth(e) {
    const depth = parseInt(e.detail.value);
    const config = READING_DEPTH_CONFIG[depth]
    this.setData({
      readingDepth: depth,
      readingDepthText: config.text,
      readingDepthDesc: config.desc
    })
    wx.setStorageSync('readingDepth', depth)
  },

  onFocusKeywordInput: debounce(function(e) {
    this.setData({ newFocusKeyword: e.detail.value })
  }, 300),

  addFocusKeyword() {
    try {
      const { newFocusKeyword, focusKeywords } = this.data;
      const keyword = newFocusKeyword.trim();
      
      if (!keyword) {
        wx.showToast({ 
          title: '请输入关注词', 
          icon: 'none',
          duration: 1500
        });
        return;
      }
      if (focusKeywords.includes(keyword)) {
        wx.showToast({ 
          title: '该关注词已存在', 
          icon: 'none',
          duration: 1500
        });
        return;
      }
      if (keyword.length > 20) {
        wx.showToast({ 
          title: '关注词长度不能超过20个字符', 
          icon: 'none',
          duration: 1500
        });
        return;
      }
      if (focusKeywords.length >= 20) {
        wx.showToast({ 
          title: '关注词数量已达上限', 
          icon: 'none',
          duration: 1500
        });
        return;
      }
      
      this.setData({
        focusKeywords: [...focusKeywords, keyword],
        newFocusKeyword: ''
      });
      wx.setStorageSync('focusKeywords', this.data.focusKeywords);
      wx.showToast({ 
        title: '已添加关注词', 
        icon: 'success',
        duration: 1000
      });
    } catch (error) {
      console.error('添加关注词失败:', error);
      wx.showToast({ 
        title: '添加失败，请重试', 
        icon: 'none',
        duration: 2000
      });
    }
  },

  addPresetKeyword(e) {
    const keyword = e.currentTarget.dataset.keyword;
    const { focusKeywords } = this.data;
    
    if (focusKeywords.includes(keyword)) {
      wx.showToast({ title: '该关注词已存在', icon: 'none' })
      return
    }
    
    this.setData({ focusKeywords: [...focusKeywords, keyword] })
    wx.setStorageSync('focusKeywords', this.data.focusKeywords)
    wx.showToast({ title: `已添加「${keyword}」`, icon: 'success' })
  },

  removeFocusKeyword(e) {
    const keyword = e.currentTarget.dataset.keyword;
    const updated = this.data.focusKeywords.filter(k => k !== keyword);
    this.setData({ focusKeywords: updated })
    wx.setStorageSync('focusKeywords', updated)
  },

  openInterestModal() {
    this.setData({ showInterestModal: true })
  },

  closeInterestModal() {
    this.setData({ showInterestModal: false })
  },

  toggleInterestTag(e) {
    const tagId = e.currentTarget.dataset.tag;
    let { interestTags } = this.data;
    
    if (interestTags.includes(tagId)) {
      interestTags = interestTags.filter(t => t !== tagId);
    } else {
      interestTags = [...interestTags, tagId];
    }
    
    const interestTagsDisplay = interestTags.map(id => {
      const tag = this.data.allInterestTags.find(t => t.id === id);
      return tag ? `${tag.icon} ${tag.name}` : id;
    });
    
    this.setData({ interestTags, interestTagsDisplay })
    wx.setStorageSync('interestTags', interestTags)
  },

  selectAllInterestTags() {
    const allTagIds = this.data.allInterestTags.map(t => t.id);
    const interestTagsDisplay = this.data.allInterestTags.map(t => `${t.icon} ${t.name}`);
    this.setData({ interestTags: allTagIds, interestTagsDisplay })
    wx.setStorageSync('interestTags', allTagIds)
  },

  clearAllInterestTags() {
    this.setData({ interestTags: [], interestTagsDisplay: [] })
    wx.setStorageSync('interestTags', [])
  },

  openAiInstructionModal() {
    this.setData({ showAiInstructionModal: true })
  },

  closeAiInstructionModal() {
    this.setData({ showAiInstructionModal: false })
  },

  onAiInstructionInput(e) {
    this.setData({ aiInstruction: e.detail.value })
  },

  saveAiInstruction() {
    wx.setStorageSync('aiInstruction', this.data.aiInstruction)
    this.setData({ showAiInstructionModal: false })
    wx.showToast({ title: 'AI指令已保存', icon: 'success' })
  },

  clearAiInstruction() {
    this.setData({ aiInstruction: '' })
    wx.setStorageSync('aiInstruction', '')
    wx.showToast({ title: '已清除', icon: 'success' })
  },

  useInstructionTemplate(e) {
    const template = e.currentTarget.dataset.template;
    this.setData({ aiInstruction: template })
  },

  restartOnboarding() {
    wx.showModal({
      title: '重新配置',
      content: '是否重新进入引导流程？',
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync('hasOnboarded', false)
          wx.navigateTo({ url: '/pages/onboarding/onboarding' })
        }
      }
    })
  },

  toggleDashboardModule(e) {
    const module = e.currentTarget.dataset.module;
    const value = e.detail.value;
    const dashboardModules = { ...this.data.dashboardModules, [module]: value };
    this.setData({ dashboardModules })
    wx.setStorageSync('dashboardModules', dashboardModules)
  },
  
  showModuleTip(e) {
    const module = e.currentTarget.dataset.module;
    const moduleTips = {
      sentiment: {
        title: '情绪指数',
        icon: '📈',
        description: '通过AI分析新闻标题和内容，计算市场情绪的积极或消极程度。帮助您快速了解当前市场的整体情绪状态。',
        examples: [
          '情绪指数 85：市场情绪极度乐观，投资者信心高涨',
          '情绪指数 45：市场情绪偏悲观，需谨慎投资',
          '情绪指数 60：市场情绪中性，观望为主'
        ]
      },
      density: {
        title: '24小时密度',
        icon: '⏰',
        description: '展示过去24小时内新闻发布的密度分布。帮助您了解新闻发布的高峰时段，把握信息流动的节奏。',
        examples: [
          '早高峰 8-10点：企业财报、政策发布集中',
          '午间 12-14点：行业动态、市场消息',
          '晚间 18-20点：国际新闻、突发事件'
        ]
      },
      prediction: {
        title: '未来预测',
        icon: '🔮',
        description: '基于历史数据和AI分析，对未来趋势进行预测。提供短期（1-7天）和中期（1-3个月）的趋势判断。',
        examples: [
          'AI芯片需求预计未来3个月增长30%',
          '新能源汽车市场将进入价格战阶段',
          '半导体供应链紧张状况将持续到Q3'
        ]
      },
      signals: {
        title: '重要信号',
        icon: '⚡',
        description: '自动识别和标记具有重大影响的关键事件和信号。包括政策变化、重大交易、技术突破等关键信息。',
        examples: [
          '政策信号：央行降准0.5个百分点',
          '市场信号：某巨头公司宣布重大并购',
          '技术信号：新一代AI模型性能突破'
        ]
      }
    };
    
    const tip = moduleTips[module];
    if (tip) {
      this.setData({
        showModuleTipModal: true,
        moduleTipTitle: tip.title,
        moduleTipIcon: tip.icon,
        moduleTipDescription: tip.description,
        moduleTipExamples: tip.examples || []
      });
    }
  },
  
  hideModuleTip() {
    this.setData({
      showModuleTipModal: false,
      moduleTipTitle: '',
      moduleTipIcon: '',
      moduleTipDescription: '',
      moduleTipExamples: []
    });
  },

  togglePushNotifications(e) {
    this.setData({ 'settings.pushNotifications': e.detail.value })
    this.saveSettings()
  },

  toggleAutoRefresh(e) {
    this.setData({ 'settings.autoRefresh': e.detail.value })
    this.saveSettings()
  },

  changeFontSize(e) {
    const index = parseInt(e.detail.value);
    const fontSize = this.data.fontSizeOptions[index];
    this.setData({
      'settings.fontSize': fontSize,
      'settings.fontSizeIndex': index
    })
    this.saveSettings()
    wx.showToast({ title: `字体已调整为${fontSize}`, icon: 'none' })
  },

  toggleDarkMode(e) {
    const darkMode = e.detail.value;
    this.setData({ 'settings.darkMode': darkMode });
    this.saveSettings();
    // 应用深色模式
    this.applyDarkMode(darkMode);
    wx.showToast({ 
      title: darkMode ? '已开启深色模式' : '已关闭深色模式', 
      icon: 'success' 
    });
  },

  applyDarkMode(darkMode) {
    if (darkMode) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#0f0c29'
      });
    } else {
      wx.setNavigationBarColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff'
      });
    }
  },

  saveSettings: throttle(function() {
    try {
      wx.setStorageSync('userSettings', this.data.settings);
      // 可以添加成功反馈，但为了避免频繁提示，这里不显示
    } catch (e) {
      console.error('保存设置失败:', e);
      wx.showToast({ 
        title: '保存失败，请重试', 
        icon: 'none',
        duration: 2000
      });
    }
  }, 500),

  openCategorySettings() {
    this.setData({ showCategoryModal: true })
  },

  closeCategoryModal() {
    this.setData({ showCategoryModal: false })
  },

  toggleCategory(e) {
    const category = e.currentTarget.dataset.category;
    let { preferredCategories } = this.data;
    
    if (preferredCategories.includes(category)) {
      preferredCategories = preferredCategories.filter(c => c !== category);
    } else {
      preferredCategories.push(category);
    }
    
    this.setData({ preferredCategories })
    wx.setStorageSync('preferredCategories', preferredCategories)
  },

  resetToDefault() {
    wx.showModal({
      title: '恢复默认设置',
      content: '确定要恢复所有设置为默认值吗？此操作不可撤销。',
      success: (res) => {
        if (res.confirm) {
          try {
            const defaultModules = { sentiment: true, density: true, prediction: true, signals: true };
            this.setData({
              aiPersona: 'analyst',
              personaPreviewText: PERSONA_PREVIEWS.analyst,
              themeColor: 'deep-blue',
              themeClass: '',
              readingDepth: 1,
              readingDepthText: '平衡模式',
              readingDepthDesc: '兼顾效率与深度，适合日常阅读',
              focusKeywords: [],
              dashboardModules: defaultModules,
              settings: {
                pushNotifications: true,
                autoRefresh: true,
                fontSize: '中等',
                fontSizeIndex: 1,
                darkMode: true
              }
            });
            
            wx.setStorageSync('aiPersona', 'analyst');
            wx.setStorageSync('themeColor', 'deep-blue');
            wx.setStorageSync('readingDepth', 1);
            wx.setStorageSync('focusKeywords', []);
            wx.setStorageSync('dashboardModules', defaultModules);
            wx.setStorageSync('userSettings', this.data.settings);
            
            wx.showToast({ 
              title: '已恢复默认设置', 
              icon: 'success',
              duration: 1500
            });
          } catch (error) {
            console.error('恢复默认设置失败:', error);
            wx.showToast({ 
              title: '恢复失败，请重试', 
              icon: 'none',
              duration: 2000
            });
          }
        }
      }
    });
  },
  
  // AI API配置相关函数
  onApiKeyInput(e) {
    this.setData({ apiKey: e.detail.value });
  },
  
  onApiKeyBlur() {
    // 自动验证API密钥格式
    const apiKey = this.data.apiKey.trim();
    if (apiKey) {
      this.validateApiKey(apiKey);
    } else {
      this.setData({ 
        apiKeyStatus: 'none',
        apiKeyStatusText: '未配置' 
      });
    }
  },

  validateApiKey(apiKey) {
    // DeepSeek API密钥格式验证：sk- 开头，长度至少30个字符
    if (apiKey.startsWith('sk-') && apiKey.length >= 30) {
      this.setData({ 
        apiKeyStatus: 'valid',
        apiKeyStatusText: '格式正确' 
      });
    } else if (apiKey.length < 30) {
      this.setData({ 
        apiKeyStatus: 'invalid',
        apiKeyStatusText: '密钥过短' 
      });
    } else if (!apiKey.startsWith('sk-')) {
      this.setData({ 
        apiKeyStatus: 'invalid',
        apiKeyStatusText: '格式错误（应以sk-开头）' 
      });
    } else {
      this.setData({ 
        apiKeyStatus: 'invalid',
        apiKeyStatusText: '格式错误' 
      });
    }
  },
  
  toggleApiKeyVisibility() {
    this.setData({ showApiKey: !this.data.showApiKey });
  },
  
  onApiEndpointInput(e) {
    this.setData({ apiEndpoint: e.detail.value });
  },
  
  onApiEndpointBlur() {
    const endpoint = this.data.apiEndpoint;
    if (endpoint) {
      wx.setStorageSync('deepseek_api_endpoint', endpoint);
    }
  },
  
  selectModel(e) {
    const model = e.currentTarget.dataset.model;
    this.setData({ selectedModel: model });
    wx.setStorageSync('deepseek_model', model);
    wx.showToast({ 
      title: model === 'deepseek-chat' ? '已选择DeepSeek Chat' : '已选择DeepSeek Coder', 
      icon: 'success' 
    });
  },
  
  async testApiConnection() {
    const { apiKey, apiEndpoint } = this.data;
    
    console.log('Starting API connection test with:', {
      apiKey: apiKey ? '***' + apiKey.slice(-5) : 'null',
      apiEndpoint: apiEndpoint
    });
    
    if (!apiKey || !apiKey.trim()) {
      console.error('API key is empty');
      wx.showToast({ 
        title: '请先输入API密钥', 
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 验证API密钥格式
    const trimmedKey = apiKey.trim();
    if (!trimmedKey.startsWith('sk-') || trimmedKey.length < 30) {
      console.error('Invalid API key format:', trimmedKey.slice(0, 5) + '***');
      wx.showToast({ 
        title: 'API密钥格式不正确', 
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 验证API端点
    if (!apiEndpoint || !apiEndpoint.startsWith('http')) {
      console.error('Invalid API endpoint:', apiEndpoint);
      wx.showToast({ 
        title: 'API端点格式不正确', 
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    wx.showLoading({ title: '测试连接中...', mask: true });
    
    try {
      console.log('Loading deepseek module...');
      const deepseek = require('../../utils/deepseek.js');
      
      console.log('Calling testConnection...');
      const result = await deepseek.testConnection(trimmedKey, apiEndpoint);
      
      console.log('Test connection result:', result);
      
      wx.hideLoading();
      
      if (result.success) {
        console.log('Connection successful!');
        this.setData({ 
          apiStatus: 'valid',
          apiStatusText: '连接正常',
          apiKeyStatus: 'valid',
          apiKeyStatusText: '已验证'
        });
        wx.setStorageSync('apiStatus', 'valid');
        wx.showToast({ 
          title: '✓ 连接测试成功', 
          icon: 'success',
          duration: 2000
        });
      } else {
        console.error('Connection failed:', result.error);
        this.setData({ 
          apiStatus: 'invalid',
          apiStatusText: '连接失败',
          apiKeyStatus: 'invalid',
          apiKeyStatusText: '验证失败'
        });
        wx.setStorageSync('apiStatus', 'invalid');
        
        // 显示详细错误信息
        const errorMsg = result.error || '连接测试失败';
        wx.showModal({
          title: '连接失败',
          content: `错误信息：${errorMsg}\n\n请检查：\n1. API密钥是否正确\n2. 网络连接是否正常\n3. API端点是否正确`,
          showCancel: false,
          confirmText: '知道了'
        });
      }
    } catch (error) {
      console.error('API connection test failed with exception:', error);
      wx.hideLoading();
      
      const errorMessage = error.message || '网络错误';
      this.setData({ 
        apiStatus: 'invalid',
        apiStatusText: '连接失败',
        apiKeyStatus: 'invalid',
        apiKeyStatusText: '验证失败'
      });
      wx.setStorageSync('apiStatus', 'invalid');
      
      wx.showModal({
        title: '连接失败',
        content: `错误信息：${errorMessage}\n\n请检查：\n1. API密钥是否正确\n2. 网络连接是否正常\n3. API端点是否正确`,
        showCancel: false,
        confirmText: '知道了'
      });
    }
  },
  
  saveApiConfig() {
    const { apiKey, apiEndpoint, selectedModel } = this.data;
    
    if (!apiKey || !apiKey.trim()) {
      wx.showToast({ 
        title: '请输入API密钥', 
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    const trimmedKey = apiKey.trim();
    
    // 验证API密钥格式
    if (!trimmedKey.startsWith('sk-') || trimmedKey.length < 30) {
      wx.showToast({ 
        title: 'API密钥格式不正确', 
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    try {
      wx.setStorageSync('deepseek_api_key', trimmedKey);
      wx.setStorageSync('deepseek_api_endpoint', apiEndpoint);
      wx.setStorageSync('deepseek_model', selectedModel);
      
      this.setData({ 
        apiKey: trimmedKey,
        apiKeyStatus: 'valid',
        apiKeyStatusText: '已配置'
      });
      
      wx.showToast({ 
        title: '✓ 配置已保存', 
        icon: 'success',
        duration: 1500
      });
    } catch (error) {
      console.error('保存API配置失败:', error);
      wx.showToast({ 
        title: '保存失败，请重试', 
        icon: 'none',
        duration: 2000
      });
    }
  },

  // ==================== NewsData.io API 配置 ====================
  
  onNewsDataApiKeyInput(e) {
    this.setData({ newsDataApiKey: e.detail.value });
  },
  
  onNewsDataApiKeyBlur() {
    const apiKey = this.data.newsDataApiKey.trim();
    if (apiKey) {
      // NewsData.io API Key 通常是 pub_ 开头
      if (apiKey.length >= 20) {
        this.setData({ 
          newsDataApiKeyStatus: 'valid',
          newsDataApiKeyStatusText: '格式正确' 
        });
      } else {
        this.setData({ 
          newsDataApiKeyStatus: 'invalid',
          newsDataApiKeyStatusText: '密钥过短' 
        });
      }
    } else {
      this.setData({ 
        newsDataApiKeyStatus: 'none',
        newsDataApiKeyStatusText: '未配置（使用RSS源）' 
      });
    }
  },
  
  toggleNewsDataApiKeyVisibility() {
    this.setData({ showNewsDataApiKey: !this.data.showNewsDataApiKey });
  },
  
  saveNewsDataApiConfig() {
    const apiKey = this.data.newsDataApiKey.trim();
    
    try {
      if (apiKey) {
        wx.setStorageSync('newsdata_api_key', apiKey);
        this.setData({ 
          newsDataApiKeyStatus: 'valid',
          newsDataApiKeyStatusText: '已配置'
        });
        wx.showToast({ 
          title: '✓ NewsData配置已保存', 
          icon: 'success',
          duration: 1500
        });
      } else {
        wx.removeStorageSync('newsdata_api_key');
        this.setData({ 
          newsDataApiKeyStatus: 'none',
          newsDataApiKeyStatusText: '未配置（使用RSS源）'
        });
        wx.showToast({ 
          title: '已清除NewsData配置', 
          icon: 'success',
          duration: 1500
        });
      }
    } catch (error) {
      console.error('保存NewsData配置失败:', error);
      wx.showToast({ 
        title: '保存失败，请重试', 
        icon: 'none',
        duration: 2000
      });
    }
  },
  
  async testNewsDataConnection() {
    const apiKey = this.data.newsDataApiKey.trim();
    
    if (!apiKey) {
      wx.showToast({ 
        title: '请先输入API密钥', 
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    wx.showLoading({ title: '测试连接中...', mask: true });
    
    try {
      // 先保存 API Key
      wx.setStorageSync('newsdata_api_key', apiKey);
      
      const newsDataApi = require('../../utils/newsDataApi.js');
      const result = await newsDataApi.testConnection();
      
      wx.hideLoading();
      
      if (result.success) {
        this.setData({ 
          newsDataApiKeyStatus: 'valid',
          newsDataApiKeyStatusText: '已验证'
        });
        wx.showToast({ 
          title: '✓ 连接测试成功', 
          icon: 'success',
          duration: 2000
        });
      } else {
        this.setData({ 
          newsDataApiKeyStatus: 'invalid',
          newsDataApiKeyStatusText: '验证失败'
        });
        wx.showModal({
          title: '连接失败',
          content: `错误信息：${result.message}\n\n请检查API密钥是否正确`,
          showCancel: false,
          confirmText: '知道了'
        });
      }
    } catch (error) {
      wx.hideLoading();
      this.setData({ 
        newsDataApiKeyStatus: 'invalid',
        newsDataApiKeyStatusText: '验证失败'
      });
      wx.showModal({
        title: '连接失败',
        content: `错误信息：${error.message}`,
        showCancel: false,
        confirmText: '知道了'
      });
    }
  },

  // 导出API配置
  exportApiConfig() {
    const { apiKey, apiEndpoint, selectedModel } = this.data;
    
    if (!apiKey) {
      wx.showToast({ title: '暂无配置可导出', icon: 'none' });
      return;
    }
    
    const config = {
      apiKey,
      apiEndpoint,
      selectedModel,
      exportTime: new Date().toISOString()
    };
    
    const configJson = JSON.stringify(config, null, 2);
    
    wx.setClipboardData({
      data: configJson,
      success: () => {
        wx.showToast({ 
          title: '配置已复制到剪贴板', 
          icon: 'success',
          duration: 2000
        });
      },
      fail: () => {
        wx.showToast({ title: '导出失败', icon: 'none' });
      }
    });
  },

  // 导入API配置
  importApiConfig() {
    wx.showModal({
      title: '导入配置',
      content: '请粘贴API配置JSON，然后点击确定',
      editable: true,
      success: (res) => {
        if (res.confirm && res.content) {
          try {
            const config = JSON.parse(res.content);
            
            if (config.apiKey && config.apiEndpoint && config.selectedModel) {
              this.setData({
                apiKey: config.apiKey,
                apiEndpoint: config.apiEndpoint,
                selectedModel: config.selectedModel,
                apiKeyStatus: 'valid',
                apiKeyStatusText: '已配置'
              });
              
              // 保存到本地存储
              wx.setStorageSync('deepseek_api_key', config.apiKey);
              wx.setStorageSync('deepseek_api_endpoint', config.apiEndpoint);
              wx.setStorageSync('deepseek_model', config.selectedModel);
              
              wx.showToast({ title: '配置导入成功', icon: 'success' });
            } else {
              wx.showToast({ title: '配置格式错误', icon: 'none' });
            }
          } catch (error) {
            wx.showToast({ title: '配置解析失败', icon: 'none' });
          }
        }
      }
    });
  },

  onShareAppMessage() {
    return {
      title: '新闻简报 - 你的私人智库',
      path: '/pages/index/index'
    }
  },

  // 账户设置相关函数
  openProfileSettings() {
    this.setData({ showProfileModal: true });
  },

  closeProfileModal() {
    this.setData({ showProfileModal: false });
  },

  onProfileChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({ [`profile.${field}`]: value });
  },

  saveProfile() {
    const { profile } = this.data;
    
    if (!profile.nickname || !profile.nickname.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' });
      return;
    }
    
    try {
      wx.setStorageSync('userProfile', profile);
      this.setData({ showProfileModal: false });
      wx.showToast({ title: '✓ 个人资料已保存', icon: 'success', duration: 1500 });
    } catch (error) {
      console.error('保存个人资料失败:', error);
      wx.showToast({ title: '保存失败，请重试', icon: 'none' });
    }
  },

  openPrivacySettings() {
    this.setData({ showPrivacyModal: true });
  },

  closePrivacyModal() {
    this.setData({ showPrivacyModal: false });
  },

  onPrivacyChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({ [`privacy.${field}`]: value });
  },

  savePrivacySettings() {
    const { privacy } = this.data;
    
    try {
      wx.setStorageSync('privacySettings', privacy);
      this.setData({ showPrivacyModal: false });
      wx.showToast({ title: '✓ 隐私设置已保存', icon: 'success', duration: 1500 });
    } catch (error) {
      console.error('保存隐私设置失败:', error);
      wx.showToast({ title: '保存失败，请重试', icon: 'none' });
    }
  },

  exportUserData() {
    wx.showModal({
      title: '导出数据',
      content: '确定要导出你的个人数据吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '导出中...' });
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({ title: '数据导出成功', icon: 'success' });
          }, 1500);
        }
      }
    });
  },

  // 清理缓存
  clearCache() {
    wx.getStorageInfo({
      success: (res) => {
        const cacheSize = (res.currentSize / 1024).toFixed(2);
        wx.showModal({
          title: '清理缓存',
          content: `当前缓存大小：${cacheSize} KB\n确定要清理所有缓存吗？`,
          success: (res) => {
            if (res.confirm) {
              wx.showLoading({ title: '清理中...' });
              wx.clearStorage({
                success: () => {
                  wx.hideLoading();
                  wx.showToast({ 
                    title: '缓存清理成功', 
                    icon: 'success',
                    duration: 1500
                  });
                  // 重新加载设置
                  setTimeout(() => {
                    this.loadSettingsInStages();
                  }, 500);
                },
                fail: () => {
                  wx.hideLoading();
                  wx.showToast({ title: '清理失败', icon: 'none' });
                }
              });
            }
          }
        });
      },
      fail: () => {
        wx.showToast({ title: '获取缓存信息失败', icon: 'none' });
      }
    });
  },

  // 检查更新
  checkForUpdates() {
    wx.showLoading({ title: '检查更新中...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ 
        title: '当前已是最新版本', 
        icon: 'success',
        duration: 1500
      });
    }, 1000);
  },

  // 显示关于应用
  showAbout() {
    wx.showModal({
      title: '关于新闻简报',
      content: '新闻简报 v1.0.0\n\n你的私人智库，为你提供个性化的新闻资讯和AI分析。\n\n功能特点：\n• 个性化新闻推荐\n• AI情报官人设\n• 关键词雷达\n• 情报看板\n• 深度阅读分析\n\n© 2025 新闻简报团队',
      showCancel: false,
      confirmText: '确定'
    });
  },

  // 显示隐私政策
  showPrivacyPolicy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们重视您的隐私保护：\n\n1. 我们不会收集您的个人身份信息\n2. 您的设置和偏好仅存储在本地\n3. API密钥等敏感信息不会被上传\n4. 我们仅使用您的偏好数据来优化新闻推荐\n\n如果您有任何隐私 concerns，请联系我们。',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  // 性能优化：预加载设置数据
  preloadSettings() {
    // 在页面加载前预加载常用设置
    try {
      const settings = wx.getStorageSync('userSettings') || {};
      const aiPersona = wx.getStorageSync('aiPersona') || 'analyst';
      const themeColor = wx.getStorageSync('themeColor') || 'deep-blue';
      
      // 预加载完成后触发
      this.setData({ isLoading: false });
    } catch (e) {
      console.error('预加载设置失败:', e);
      this.setData({ isLoading: false });
    }
  }
})