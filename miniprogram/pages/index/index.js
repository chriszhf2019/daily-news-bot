// 新闻简报首页 - 顶级版：私人智库
const app = getApp()
const deepseek = require('../../utils/deepseek.js')
const rssNews = require('../../utils/rssNews.js')
const newsDataApi = require('../../utils/newsDataApi.js')

Page({
  data: {
    currentDate: '',
    currentCategory: 'all',
    categories: [],  // 动态生成
    newsData: [],
    filteredNews: [],
    displayedNews: [],  // 当前显示的新闻
    loading: true,
    newsCount: 0,
    marketSentiment: 50,
    signalCount: 0,
    dailySignals: [],  // 真实重要信号列表
    readMode: 'standard',
    blindSpotNews: null,
    showPoster: false,
    posterNews: null,
    posterImage: '',
    // 录入情报弹窗
    showInputModal: false,
    inputContent: '',
    inputUrl: '',
    isParsingUrl: false,
    // 分页相关
    pageSize: 10,        // 每页显示数量
    currentPage: 1,      // 当前页码
    hasMore: false,      // 是否有更多
    loadingMore: false,  // 是否正在加载更多
    // 统计栏增强数据
    todayTrend: 12,
    todayTrendAbs: 12,
    sentimentLevel: 'cold',
    sentimentText: '中立偏冷',
    sentimentPositive: 30,
    sentimentNeutral: 40,
    sentimentNegative: 30,
    showSentimentPopup: false,
    isSignalFilter: false,
    // 个性化设置
    aiPersona: 'analyst',
    aiPersonaName: '专业分析师',
    focusKeywords: [],
    readingDepth: 1,
    // 主题配色
    themeColor: 'deep-blue',
    themeClass: '',
    // 兴趣标签和AI定制指令
    interestTags: [],
    aiInstruction: '',
    // 快捷筛选
    showQuickFilter: false,
    newQuickKeyword: '',
    // 新闻详情弹窗
    showNewsDetailModal: false,
    currentNews: null,
    // 专业词汇解释弹窗
    showJargonTip: false,
    showJargonPopup: false,
    currentJargon: null,
    // Tooltip显示控制
    showSourceTooltip: true,
    // 新增：热门和关注数量
    hotNewsCount: 0,
    focusNewsCount: 0,
    // 动画相关
    modeAnimation: '',
    // 数据同步状态
    syncStatus: null,
    // AI导师相关
    showTutorAnswer: false,
    currentTutorAnswer: '',
    // AI语音简报相关
    showAudioPlayer: false,
    isAudioPlaying: false,
    audioStatus: '点击播放今日简报',
    playbackSpeed: 1.0,
    waveHeight1: 30,
    waveHeight2: 60,
    waveHeight3: 40,
    waveHeight4: 70,
    waveHeight5: 50,
    audioScript: '',
    audioContext: null
  },

  // 兴趣标签数据
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

  onLoad() {
    this.initDate();
    this.loadUserPreferences();
    this.loadNewsData();
    
    // 启动定时刷新机制（每小时刷新一次）
    this.startAutoRefresh();
  },

  startAutoRefresh() {
    // 清除之前的定时器
    if (this.data.refreshTimer) {
      clearInterval(this.data.refreshTimer);
    }
    
    // 设置新的定时器（每小时刷新一次，但只有配置了API密钥才刷新）
    const timer = setInterval(() => {
      const apiKey = wx.getStorageSync('deepseek_api_key');
      if (apiKey) {
        this.refreshWithAI();
      } else {
        console.log('未配置API密钥，跳过自动刷新');
      }
    }, 3600000); // 3600000ms = 1小时
    
    this.setData({ refreshTimer: timer });
    console.log('自动刷新机制已启动，每小时刷新一次（需配置API密钥）');
  },

  stopAutoRefresh() {
    if (this.data.refreshTimer) {
      clearInterval(this.data.refreshTimer);
      this.setData({ refreshTimer: null });
      console.log('自动刷新机制已停止');
    }
  },

  // 保留原有的refreshNewsData方法用于兼容
  async refreshNewsData() {
    console.log('开始刷新新闻数据...');
    
    try {
      // 从API获取最新的新闻数据
      const latestNews = await this.fetchRealNewsData();
      
      // 使用AI分析每条新闻的情绪和影响分数
      const newsWithAnalysis = await Promise.all(
        latestNews.map(async (news) => {
          const sentimentResult = await deepseek.analyzeSentimentWithAI(news);
          const impactResult = await deepseek.analyzeImpactWithAI(news);
          
          const urgency = this.calculateUrgency(impactResult.score, sentimentResult.sentiment);
          const audience = this.calculateAudience(news, impactResult.score);
          const relevance = this.calculateRelevance(news, impactResult.score);
          
          return {
            ...news,
            sentiment: sentimentResult.sentiment,
            sentimentConfidence: sentimentResult.confidence,
            sentimentReason: sentimentResult.reason,
            impactScore: impactResult.score,
            impactLevel: impactResult.level,
            impactLabel: impactResult.label,
            impactConfidence: impactResult.confidence,
            impactReason: impactResult.reason,
            urgency,
            audience,
            relevance
          };
        })
      );
      
      // 计算市场情绪和重要信号
      const positiveCount = newsWithAnalysis.filter(n => n.sentiment === 'positive').length;
      const negativeCount = newsWithAnalysis.filter(n => n.sentiment === 'negative').length;
      const neutralCount = newsWithAnalysis.filter(n => n.sentiment === 'neutral').length;
      const marketSentiment = Math.round((positiveCount / newsWithAnalysis.length) * 100);
      const signalCount = newsWithAnalysis.filter(n => n.impactScore >= 8).length;
      const hotNewsCount = newsWithAnalysis.filter(n => n.impactScore >= 8).length;
      const focusNewsCount = newsWithAnalysis.filter(n => n.isFocused).length;
      
      // 计算情绪等级和文本
      let sentimentLevel, sentimentText;
      if (marketSentiment < 40) {
        sentimentLevel = 'cold';
        sentimentText = '中立偏冷';
      } else if (marketSentiment < 70) {
        sentimentLevel = 'warm';
        sentimentText = '温和乐观';
      } else {
        sentimentLevel = 'hot';
        sentimentText = '积极乐观';
      }
      
      // 计算情绪构成百分比
      const total = newsWithAnalysis.length;
      const sentimentPositive = Math.round((positiveCount / total) * 100);
      const sentimentNegative = Math.round((negativeCount / total) * 100);
      const sentimentNeutral = 100 - sentimentPositive - sentimentNegative;
      
      // 计算趋势数据
      const yesterdayCount = wx.getStorageSync('yesterdayNewsCount') || newsWithAnalysis.length;
      const todayTrend = newsWithAnalysis.length - yesterdayCount;
      const todayTrendAbs = Math.abs(todayTrend);
      
      // 保存今日新闻数量供明日使用
      wx.setStorageSync('yesterdayNewsCount', newsWithAnalysis.length);
      
      // 分页：先显示前20条
      const pageSize = this.data.pageSize;
      const displayedNews = newsWithAnalysis.slice(0, pageSize);
      const hasMore = newsWithAnalysis.length > pageSize;
      
      this.setData({
        newsData: newsWithAnalysis,
        filteredNews: newsWithAnalysis,
        displayedNews,
        newsCount: newsWithAnalysis.length,
        marketSentiment,
        signalCount,
        hotNewsCount,
        focusNewsCount,
        loading: false,
        hasMore,
        currentPage: 1,
        todayTrend,
        todayTrendAbs,
        sentimentLevel,
        sentimentText,
        sentimentPositive,
        sentimentNeutral,
        sentimentNegative,
        isSignalFilter: false,
        syncStatus: 'success'
      });
      
      wx.setStorageSync('newsData', newsWithAnalysis);
      
      // 应用兴趣标签过滤、关注词匹配和AI人设风格
      this.updateCategories();
      this.applyInterestTagsFilter();
      this.applyFocusKeywords();
      this.applyAiPersonaStyle();
      this.applyAiInstructionReasons();
      
      // 更新显示的新闻
      this.updateDisplayedNews();
      
      wx.showToast({
        title: '新闻已刷新',
        icon: 'success'
      });
    } catch (error) {
      console.error('刷新新闻数据失败:', error);
      wx.showToast({
        title: '刷新失败',
        icon: 'none'
      });
    }
  },

  onUnload() {
    // 页面卸载时停止自动刷新
    this.stopAutoRefresh();
  },

  // 个性化推荐功能
  async getPersonalizedNews(userPreferences) {
    const { interestTags = [], focusKeywords = [], aiPersona = 'analyst' } = userPreferences;
    
    // 1. 基于兴趣标签推荐
    const interestNews = this.data.newsData.filter(news => 
      news.tags && news.tags.some(tag => interestTags.includes(tag))
    );
    
    // 2. 基于关注关键词推荐
    const keywordNews = this.data.newsData.filter(news => 
      focusKeywords.some(keyword => 
        news.title.includes(keyword) || (news.summary && news.summary.includes(keyword))
      )
    );
    
    // 3. 基于AI人设推荐
    const personaNews = this.getPersonaBasedNews(this.data.newsData, aiPersona);
    
    // 4. 综合推荐（去重）
    const recommendedIds = new Set();
    const personalizedNews = [];
    
    // 添加兴趣标签推荐（权重：3）
    interestNews.forEach(news => {
      if (!recommendedIds.has(news.id)) {
        recommendedIds.add(news.id);
        personalizedNews.push({ ...news, recommendationReason: '匹配兴趣标签', recommendationWeight: 3 });
      }
    });
    
    // 添加关注关键词推荐（权重：2）
    keywordNews.forEach(news => {
      if (!recommendedIds.has(news.id)) {
        recommendedIds.add(news.id);
        personalizedNews.push({ ...news, recommendationReason: '匹配关注关键词', recommendationWeight: 2 });
      }
    });
    
    // 添加AI人设推荐（权重：1）
    personaNews.forEach(news => {
      if (!recommendedIds.has(news.id)) {
        recommendedIds.add(news.id);
        personalizedNews.push({ ...news, recommendationReason: '匹配AI人设', recommendationWeight: 1 });
      }
    });
    
    // 按推荐权重排序
    personalizedNews.sort((a, b) => b.recommendationWeight - a.recommendationWeight);
    
    return personalizedNews;
  },

  getPersonaBasedNews(newsData, aiPersona) {
    const personaKeywords = {
      'analyst': ['分析', '研究', '报告', '数据', '趋势', '预测', '市场', '行业'],
      'geek': ['技术', '代码', '开源', '黑客', '极客', '硬件', '软件', '系统'],
      'mentor': ['教育', '学习', '成长', '职业', '技能', '培训', '指导', '建议']
    };
    
    const keywords = personaKeywords[aiPersona] || personaKeywords['analyst'];
    
    return newsData.filter(news => 
      keywords.some(keyword => 
        news.title.includes(keyword) || (news.summary && news.summary.includes(keyword))
      )
    );
  },

  applyPersonalizedRecommendation() {
    const userPreferences = wx.getStorageSync('userPreferences') || {};
    const { interestTags = [], focusKeywords = [], aiPersona = 'analyst' } = userPreferences;
    
    // 如果用户没有设置任何偏好，不应用个性化推荐
    if (interestTags.length === 0 && focusKeywords.length === 0 && aiPersona === 'analyst') {
      return;
    }
    
    // 获取个性化推荐
    const personalizedNews = this.getPersonalizedNews(userPreferences);
    
    // 更新显示的新闻（优先显示个性化推荐）
    if (personalizedNews.length > 0) {
      const pageSize = this.data.pageSize;
      const displayedNews = personalizedNews.slice(0, pageSize);
      
      this.setData({
        displayedNews,
        isPersonalized: true
      });
      
      wx.showToast({
        title: `已为您推荐 ${personalizedNews.length} 条新闻`,
        icon: 'success'
      });
    }
  },

  onShow() {
    // 每次显示时重新加载偏好设置
    this.loadUserPreferences();
    // 应用关注词、兴趣标签过滤和AI人设
    if (this.data.newsData.length > 0) {
      this.updateCategories();
      this.applyInterestTagsFilter();
      this.applyFocusKeywords();
      this.applyAiPersonaStyle();
      this.applyAiInstructionReasons();
      // 加载收藏状态
      this.loadFavorites();
    }
  },

  initDate() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    this.setData({ currentDate: dateStr });
  },

  // 加载用户偏好设置
  loadUserPreferences() {
    try {
      const aiPersona = wx.getStorageSync('aiPersona') || 'analyst';
      const personaNames = { analyst: '专业分析师', geek: '毒舌极客', mentor: '耐心导师' };
      
      const focusKeywords = wx.getStorageSync('focusKeywords') || [];
      const readingDepth = wx.getStorageSync('readingDepth') || 1;
      
      // 加载主题配色
      const themeColor = wx.getStorageSync('themeColor') || 'deep-blue';
      const themeClass = themeColor === 'deep-blue' ? '' : themeColor;
      
      // 加载兴趣标签
      const interestTags = wx.getStorageSync('interestTags') || [];
      
      // 加载AI定制指令
      const aiInstruction = wx.getStorageSync('aiInstruction') || '';
      
      // 加载默认用户角色
      const defaultUserRole = wx.getStorageSync('defaultUserRole') || '';
      
      this.setData({
        aiPersona,
        aiPersonaName: personaNames[aiPersona],
        focusKeywords,
        readingDepth,
        themeColor,
        themeClass,
        interestTags,
        aiInstruction,
        defaultUserRole
      });
      
      // 根据阅读深度设置模式
      const modes = ['digest', 'standard', 'standard'];
      if (this.data.newsData.length > 0) {
        this.setData({ readMode: modes[readingDepth] });
      }
    } catch (e) {
      console.error('加载偏好设置失败:', e);
    }
  },

  // 应用关注词匹配
  // 后台生成 AI 深度解读 + 趋势预测（前10条）
  async generateAIAnalysis() {
    const news = this.data.newsData.slice(0, 10)
    const needAI = news.filter(n => !n.ai_analysis || !n.ai_analysis.interpretation)
    if (!needAI.length) return

    const apiKey = wx.getStorageSync('deepseek_api_key')
    if (!apiKey) return
    try {
      const titles = needAI.map((n, i) => `${i+1}. ${n.title}`).join('\n')
      const resp = await new Promise((resolve, reject) => {
        wx.request({
          url: 'https://api.deepseek.com/chat/completions',
          method: 'POST',
          header: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          data: {
            model: 'deepseek-chat', temperature: 0.5, max_tokens: 2500,
            messages: [{ role: 'user', content: `分析以下新闻，每条生成：interpretation(30字深度解读)和prediction(20字趋势预测)。返回JSON数组。

${titles}

格式：[{"index":1,"interpretation":"...","prediction":"..."}]` }]
          },
          success: resolve, fail: reject
        })
      })
      let text = resp.data.choices[0].message.content
      if (text.startsWith('```')) text = text.split('```')[1].replace('json', '')
      const results = JSON.parse(text)

      const enriched = this.data.newsData.map(n => {
        const r = results?.find(x => x.index === (needAI.findIndex(x => x.id === n.id) + 1) || x.index === (news.indexOf(n) + 1))
        if (r && !n.ai_analysis?.interpretation) {
          n.ai_analysis = { ...n.ai_analysis, interpretation: r.interpretation, prediction: r.prediction }
        }
        return n
      })
      wx.setStorageSync('newsData', enriched)
      this.setData({ newsData: enriched })
      this.updateDisplayedNews()
    } catch (e) {
      console.log('AI解读生成跳过:', e.message)
    }
  },

  // 追踪功能
  onTrackNews(e) {
    const news = e.currentTarget.dataset.news
    if (!news) return
    const tracked = wx.getStorageSync('tracked_news') || []
    const idx = tracked.findIndex(t => t.id === news.id)

    if (idx > -1) {
      tracked.splice(idx, 1)
      wx.showToast({ title: '已取消追踪', icon: 'none' })
    } else {
      // 提取关键词用于第二天匹配
      const keywords = (news.tags || []).slice(0, 3)
      if (!keywords.length) keywords.push(news.title.substring(0, 20))
      tracked.push({ id: news.id, title: news.title.substring(0, 50), keywords, trackedAt: new Date().toISOString() })
      wx.showToast({ title: '已追踪,明天见', icon: 'success' })
    }
    wx.setStorageSync('tracked_news', tracked)
    this.applyTrackedStatus()
  },

  applyTrackedStatus() {
    const tracked = wx.getStorageSync('tracked_news') || []
    const trackedIds = new Set(tracked.map(t => t.id))
    const trackedKw = tracked.flatMap(t => t.keywords || [])

    const allNews = this.data.newsData.map(n => {
      const isTracked = trackedIds.has(n.id)
      // 第二天匹配：检查是否命中追踪关键词
      const isNextDayMatch = !isTracked && trackedKw.some(kw =>
        (n.title || '').includes(kw) || (n.tags || []).some(t => t.includes(kw))
      )
      return { ...n, isTracked, isNextDayMatch }
    })

    const displayed = this.data.displayedNews.map(n => {
      const found = allNews.find(a => a.id === n.id)
      return found || { ...n, isTracked: trackedIds.has(n.id), isNextDayMatch: false }
    })

    this.setData({ newsData: allNews, displayedNews: displayed })
    // 刷新 Storage
    const updated = allNews.map(n => ({
      id: n.id, title: n.title, summary: n.summary, category: n.category,
      source: n.source, published_at: n.published_at, tags: n.tags,
      isTracked: n.isTracked, isNextDayMatch: n.isNextDayMatch,
    }))
    wx.setStorageSync('newsData', updated)
  },

  // 从后端 API 获取市场情绪和重要信号
  async loadDailyStats() {
    try {
      const { news: newsApi } = require('../../utils/api')
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: 'https://news.velolabs.top/api/v1/news/daily-stats',
          method: 'GET', success: resolve, fail: reject
        })
      })
      if (res.data && res.data.success) {
        const d = res.data.data
        this.setData({
          marketSentiment: d.sentiment_score || 50,
          signalCount: (d.signal_news || []).length,
          dailySignals: d.signal_news || [],
          sentimentPositive: d.positive_count || 0,
          sentimentNeutral: d.neutral_count || 0,
          sentimentNegative: d.negative_count || 0,
        })
      }
    } catch (e) {
      console.log('情绪数据加载失败:', e.message)
    }
  },

  // 从真实新闻数据中动态生成分类列表
  updateCategories() {
    const data = this.data.newsData || []
    const seen = new Set()
    const cats = [{ id: 'all', name: '全部', icon: '📋' }]
    const iconMap = { 'AI动态': '🤖', '科技前沿': '🚀', '综合': '📰', '自动驾驶': '🚗', 'VR/AR': '🥽' }
    data.forEach(n => {
      const cat = n.category || '综合'
      if (!seen.has(cat)) {
        seen.add(cat)
        cats.push({ id: cat, name: cat, icon: iconMap[cat] || '📰' })
      }
    })
    this.setData({ categories: cats })
  },

  applyFocusKeywords() {
    const { filteredNews, focusKeywords } = this.data;
    if (!filteredNews.length) return;
    
    const updatedNews = filteredNews.map(news => {
      let isFocused = false;
      if (focusKeywords.length) {
        const content = `${news.title} ${news.summary} ${(news.tags || []).join(' ')}`.toLowerCase();
        isFocused = focusKeywords.some(keyword => 
          content.includes(keyword.toLowerCase())
        );
      }
      return { ...news, isFocused };
    });
    
    // 将命中关注词的新闻置顶
    updatedNews.sort((a, b) => {
      if (a.isFocused && !b.isFocused) return -1;
      if (!a.isFocused && b.isFocused) return 1;
      return 0;
    });
    
    this.setData({ filteredNews: updatedNews });
    
    // 生成智能标签
    this.generateSmartTags();
  },

  generateSmartTags() {
    const { filteredNews } = this.data;
    if (!filteredNews || !filteredNews.length) {
      return;
    }
    
    // 为每条新闻生成智能标签
    const newsWithTags = filteredNews.map(news => {
      const tags = this.classifyTags(news);
      return { ...news, ...tags };
    });
    
    this.setData({ filteredNews: newsWithTags });
  },

  classifyTags(news) {
    const natureTags = [];
    const entityTags = [];
    const industryTags = [];
    
    // 性质标签：信号、预警、预测
    const natureKeywords = {
      '信号': ['信号', '预警', '重要', '紧急', '突破', '利好', '利空'],
      '预测': ['预测', '预计', '展望', '未来', '趋势'],
      '预警': ['风险', '警告', '注意', '关注', '监控']
    };
    
    // 主体标签：公司、人名
    const entityKeywords = {
      '公司': ['公司', '企业', '集团', '股份', '有限公司', 'Inc', 'Corp', 'Group'],
      '人名': ['CEO', '董事长', '创始人', '总裁', '负责人', '经理']
    };
    
    // 行业标签：根据新闻分类
    const industryKeywords = {
      'AI': ['人工智能', 'AI', '大模型', 'GPT', '机器学习', '深度学习'],
      'tech': ['科技', '技术', '芯片', '半导体', '5G', '6G', '云计算'],
      'finance': ['金融', '投资', '股市', '基金', '银行', '保险'],
      'business': ['商业', '企业', '市场', '经济', '贸易'],
      'policy': ['政策', '法规', '监管', '标准', '法律'],
      'international': ['国际', '全球', '外交', '贸易战', '地缘政治']
    };
    
    // 分析新闻内容
    const content = `${news.title} ${news.summary || ''}`.toLowerCase();
    
    // 分类为性质标签
    for (const [type, keywords] of Object.entries(natureKeywords)) {
      if (keywords.some(keyword => content.includes(keyword.toLowerCase()))) {
        natureTags.push({
          text: type,
          isNature: true
        });
        break;
      }
    }
    
    // 分类为主体标签
    for (const [type, keywords] of Object.entries(entityKeywords)) {
      if (keywords.some(keyword => content.includes(keyword.toLowerCase()))) {
        entityTags.push({
          text: this.extractEntity(content, keywords),
          isNature: false
        });
        break;
      }
    }
    
    // 分类为行业标签
    const categoryKeywords = industryKeywords[news.category] || [];
    if (categoryKeywords && categoryKeywords.length > 0) {
      categoryKeywords.forEach(keyword => {
        if (content.includes(keyword.toLowerCase())) {
          industryTags.push({
            text: keyword,
            isNature: false
          });
        }
      });
    }
    
    return {
      natureTags,
      entityTags,
      industryTags
    };
  },

  extractEntity(content, keywords) {
    for (const keyword of keywords) {
      if (content.includes(keyword.toLowerCase())) {
        return keyword;
      }
    }
    return keywords[0];
  },

  // 智能标签点击处理
  onSmartTagClick(e) {
    const { newsId, tag } = e.currentTarget.dataset;
    
    // 模拟筛选相关情报数量
    const relatedCount = Math.floor(Math.random() * 15) + 8;
    
    // 创建气泡动画
    const animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease-out'
    });
    animation.scale(1).opacity(1).step();
    
    // 更新对应新闻卡片的气泡状态
    const newsData = this.data.displayedNews.map(news => {
      if (news.id === newsId) {
        return {
          ...news,
          showTagBubble: true,
          clickedTag: tag,
          relatedCount: relatedCount,
          bubbleAnimation: animation.export()
        };
      }
      return { ...news, showTagBubble: false };
    });
    
    this.setData({
      displayedNews: newsData
    });
    
    // 3秒后自动隐藏气泡
    setTimeout(() => {
      this.hideTagBubble(newsId);
    }, 3000);
  },

  // 隐藏标签气泡
  hideTagBubble(newsId) {
    const animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in'
    });
    animation.scale(0.8).opacity(0).step();
    
    const newsData = this.data.displayedNews.map(news => {
      if (news.id === newsId) {
        return {
          ...news,
          bubbleAnimation: animation.export()
        };
      }
      return news;
    });
    
    this.setData({ displayedNews: newsData });
    
    setTimeout(() => {
      const finalData = this.data.displayedNews.map(news => {
        if (news.id === newsId) {
          return {
            ...news,
            showTagBubble: false,
            clickedTag: null
          };
        }
        return news;
      });
      this.setData({ displayedNews: finalData });
    }, 200);
  },

  // 取消追踪
  onCancelTracking(e) {
    const { newsId } = e.currentTarget.dataset;
    this.hideTagBubble(newsId);
  },

  // 确认开启追踪
  onConfirmTracking(e) {
    const { newsId, tag } = e.currentTarget.dataset;
    
    // 添加到关注关键词
    const focusKeywords = this.data.focusKeywords || [];
    if (!focusKeywords.includes(tag.text)) {
      focusKeywords.push(tag.text);
      wx.setStorageSync('focusKeywords', focusKeywords);
      this.setData({ focusKeywords });
    }
    
    // 显示成功提示
    wx.showToast({
      title: `已追踪「${tag.text}」`,
      icon: 'success',
      duration: 2000
    });
    
    // 隐藏气泡
    this.hideTagBubble(newsId);
    
    // 重新应用筛选
    setTimeout(() => {
      this.applyFocusKeywords();
    }, 500);
  },

  // 打开录入情报弹窗
  openInputModal() {
    wx.vibrateShort({ type: 'light' });
    this.setData({ showInputModal: true, inputContent: '', inputUrl: '', isParsingUrl: false });
  },

  // 关闭录入情报弹窗
  closeInputModal() {
    wx.vibrateShort({ type: 'light' });
    this.setData({ showInputModal: false, inputContent: '', inputUrl: '', isParsingUrl: false });
  },

  // 打开搜索页面
  openSearch() {
    wx.vibrateShort({ type: 'light' });
    wx.navigateTo({
      url: '/pages/search/search'
    });
  },

  // 处理输入内容变化
  onInputContentChange(e) {
    this.setData({ inputContent: e.detail.value });
  },
  
  // 处理链接输入变化
  onInputUrlChange(e) {
    this.setData({ inputUrl: e.detail.value });
  },
  
  // 解析链接内容
  async parseUrlContent() {
    const { inputUrl } = this.data;
    
    if (!inputUrl || !inputUrl.trim()) {
      wx.showToast({ title: '请输入链接', icon: 'none' });
      return;
    }
    
    const url = inputUrl.trim();
    
    // 识别链接类型
    const platformInfo = this.detectPlatform(url);
    console.log('识别平台:', platformInfo);
    
    this.setData({ isParsingUrl: true });
    wx.vibrateShort({ type: 'light' });
    
    try {
      const apiKey = wx.getStorageSync('deepseek_api_key');
      if (!apiKey) {
        wx.showToast({ title: '请先配置 DeepSeek API', icon: 'none' });
        this.setData({ isParsingUrl: false });
        return;
      }
      
      // 根据平台类型处理
      if (platformInfo.isVideo) {
        // 视频链接：提示用户获取字幕
        this.setData({ isParsingUrl: false });
        this.showVideoGuide(platformInfo);
      } else {
        // 文章链接：尝试解析
        const result = await this.fetchAndParseUrl(url, platformInfo);
        
        if (result && result.content) {
          this.setData({ 
            inputContent: result.content,
            isParsingUrl: false 
          });
          wx.showToast({ title: '解析成功', icon: 'success' });
        } else {
          throw new Error('解析失败');
        }
      }
    } catch (error) {
      console.error('链接解析失败:', error);
      this.setData({ isParsingUrl: false });
      wx.showToast({ title: '解析失败，请手动粘贴内容', icon: 'none' });
    }
  },
  
  // 识别链接平台
  detectPlatform(url) {
    const lowerUrl = url.toLowerCase();
    
    // 抖音
    if (lowerUrl.includes('douyin.com') || lowerUrl.includes('v.douyin.com') || lowerUrl.includes('iesdouyin.com')) {
      return { platform: '抖音', isVideo: true, icon: '🎵' };
    }
    
    // B站
    if (lowerUrl.includes('bilibili.com') || lowerUrl.includes('b23.tv')) {
      return { platform: 'B站', isVideo: true, icon: '📺' };
    }
    
    // 微信公众号
    if (lowerUrl.includes('mp.weixin.qq.com') || lowerUrl.includes('weixin.qq.com')) {
      return { platform: '微信公众号', isVideo: false, icon: '📱' };
    }
    
    // 今日头条
    if (lowerUrl.includes('toutiao.com') || lowerUrl.includes('toutiaoimg.com')) {
      return { platform: '今日头条', isVideo: false, icon: '📰' };
    }
    
    // 知乎
    if (lowerUrl.includes('zhihu.com')) {
      return { platform: '知乎', isVideo: false, icon: '💬' };
    }
    
    // 小红书
    if (lowerUrl.includes('xiaohongshu.com') || lowerUrl.includes('xhslink.com')) {
      return { platform: '小红书', isVideo: true, icon: '📕' };
    }
    
    // 其他网页
    return { platform: '网页', isVideo: false, icon: '🌐' };
  },
  
  // 显示视频获取字幕引导
  showVideoGuide(platformInfo) {
    let guideContent = '';
    
    if (platformInfo.platform === '抖音') {
      guideContent = `抖音视频暂不支持直接解析。\n\n获取内容方法：\n1. 打开抖音APP，找到该视频\n2. 点击「分享」→「复制链接」下方的「复制文案」\n3. 将文案粘贴到下方输入框\n\n或者：\n• 手动记录视频口播内容\n• 使用第三方字幕提取工具`;
    } else if (platformInfo.platform === 'B站') {
      guideContent = `B站视频暂不支持直接解析。\n\n获取内容方法：\n1. 在B站网页版打开视频\n2. 点击「CC字幕」下载字幕文件\n3. 将字幕内容粘贴到下方输入框\n\n或者：\n• 复制视频简介和评论区总结\n• 使用B站AI总结功能`;
    } else if (platformInfo.platform === '小红书') {
      guideContent = `小红书内容暂不支持直接解析。\n\n获取内容方法：\n1. 打开小红书APP\n2. 复制笔记的文字内容\n3. 粘贴到下方输入框`;
    }
    
    wx.showModal({
      title: `${platformInfo.icon} ${platformInfo.platform}视频`,
      content: guideContent,
      confirmText: '我知道了',
      showCancel: false
    });
  },
  
  // 获取并解析链接内容
  async fetchAndParseUrl(url, platformInfo = {}) {
    const apiKey = wx.getStorageSync('deepseek_api_key');
    const apiEndpoint = wx.getStorageSync('deepseek_api_endpoint') || 'https://api.deepseek.com/v1';
    
    const platformName = platformInfo.platform || '网页';
    
    // 构建提示词
    const prompt = `请帮我解析以下${platformName}链接的内容。

链接：${url}
平台：${platformName}

由于你无法直接访问网页，请根据链接特征分析：
1. 如果是微信公众号文章，通常链接中包含文章ID，请提示用户复制文章内容
2. 如果是新闻网站，请根据URL结构推测可能的内容主题
3. 给出获取内容的建议

请返回JSON格式：
{
  "title": "根据链接推测的标题或主题",
  "content": "如果能推测内容则填写，否则为空",
  "source": "${platformName}",
  "canParse": false,
  "suggestion": "建议用户如何获取内容（如：请打开链接复制文章内容后粘贴）"
}`;

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${apiEndpoint}/chat/completions`,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        data: {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是一个专业的内容解析助手。由于技术限制，你无法直接访问网页内容，但可以根据链接特征给出建议。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.choices && res.data.choices[0]) {
            try {
              let content = res.data.choices[0].message.content;
              content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
              const result = JSON.parse(content);
              
              if (result.canParse && result.content) {
                resolve({
                  title: result.title || '',
                  content: `【${result.title || '内容'}】\n\n${result.content}`,
                  source: result.source || platformName
                });
              } else {
                // 无法直接解析，显示建议
                wx.showModal({
                  title: '需要手动获取内容',
                  content: result.suggestion || `请打开${platformName}链接，复制内容后粘贴到输入框`,
                  showCancel: false,
                  confirmText: '我知道了'
                });
                reject(new Error('需要手动获取'));
              }
            } catch (e) {
              // JSON 解析失败，显示通用提示
              wx.showModal({
                title: '需要手动获取内容',
                content: `请打开${platformName}链接，复制文章/视频内容后粘贴到输入框`,
                showCancel: false,
                confirmText: '我知道了'
              });
              reject(e);
            }
          } else {
            reject(new Error('API请求失败'));
          }
        },
        fail: reject
      });
    });
  },

  // 开始情报建模
  startIntelligenceModeling() {
    const { inputContent, inputUrl } = this.data;
    
    if (!inputContent.trim() && !inputUrl.trim()) {
      wx.showToast({
        title: '请输入内容或链接',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 如果只有链接没有内容，提示先解析
    if (!inputContent.trim() && inputUrl.trim()) {
      wx.showToast({
        title: '请先点击解析按钮',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    wx.vibrateShort({ type: 'medium' });
    
    // 显示加载动画
    wx.showLoading({
      title: '正在分析情报...',
      mask: true
    });
    
    // 创建临时新闻对象
    const tempNews = {
      id: `custom-${Date.now()}`,
      title: inputContent.split('\n')[0].replace(/^【|】$/g, '').substring(0, 50) || '自定义情报',
      summary: inputContent.substring(0, 200),
      content: inputContent,
      category: 'AI',
      source: inputUrl ? '链接解析' : '手动录入',
      published_at: new Date().toISOString(),
      tags: ['自定义', '情报分析'],
      isCustom: true
    };
    
    // 保存到临时存储
    wx.setStorageSync('tempAnalysisNews', tempNews);
    
    setTimeout(() => {
      wx.hideLoading();
      
      // 关闭弹窗
      this.setData({ showInputModal: false, inputContent: '', inputUrl: '' });
      
      // 跳转到七要素分析页面
      wx.navigateTo({
        url: `/pages/seven-elements/seven-elements?id=${tempNews.id}&custom=true`
      });
    }, 500);
  },

  // 处理智能标签数据
  processSmartTags(news) {
    const smartTags = [];
    
    // 如果新闻数据已经包含结构化的tags字段
    if (news.tags && Array.isArray(news.tags)) {
      news.tags.forEach(tag => {
        if (typeof tag === 'object' && tag.text && tag.type) {
          // 已经是结构化数据
          smartTags.push({
            text: tag.text,
            type: tag.type,
            color: tag.color || this.getTagColor(tag.type, news.category)
          });
        } else if (typeof tag === 'string') {
          // 字符串标签，需要智能分类
          const tagType = this.detectTagType(tag, news);
          smartTags.push({
            text: tag,
            type: tagType,
            color: this.getTagColor(tagType, news.category)
          });
        }
      });
    } else if (news.tags && typeof news.tags === 'string') {
      // 逗号分隔的字符串
      const tagArray = news.tags.split(',').map(t => t.trim()).filter(t => t);
      tagArray.forEach(tag => {
        const tagType = this.detectTagType(tag, news);
        smartTags.push({
          text: tag,
          type: tagType,
          color: this.getTagColor(tagType, news.category)
        });
      });
    }
    
    // 按类型排序：性质标签 > 主体标签 > 行业标签
    const typeOrder = { nature: 0, entity: 1, category: 2 };
    smartTags.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);
    
    return smartTags;
  },

  // 智能检测标签类型
  detectTagType(tagText, news) {
    const text = tagText.toLowerCase();
    
    // 性质标签关键词
    const natureKeywords = ['信号', '预警', '预测', '突破', '风险', '机会', '趋势', '转折', '重大', '关键'];
    if (natureKeywords.some(keyword => text.includes(keyword))) {
      return 'nature';
    }
    
    // 主体标签特征：大写字母开头、包含公司后缀、人名特征
    const entityPatterns = [
      /^[A-Z]/,  // 大写字母开头
      /公司|集团|科技|股份|有限/,  // 公司后缀
      /CEO|创始人|董事长/  // 职位
    ];
    if (entityPatterns.some(pattern => pattern.test(tagText))) {
      return 'entity';
    }
    
    // 其他为行业标签
    return 'category';
  },

  // 获取标签颜色
  getTagColor(type, category) {
    if (type === 'nature') {
      return '#8B5CF6';  // 紫色
    } else if (type === 'entity') {
      return '#10B981';  // 绿色
    } else {
      // 行业标签根据分类动态变色
      const categoryColors = {
        'AI': '#A855F7',
        'tech': '#3B82F6',
        'finance': '#F59E0B',
        'international': '#10B981',
        'sports': '#EF4444'
      };
      return categoryColors[category] || '#3B82F6';
    }
  },

  onTagClick(e) {
    const tag = e.currentTarget.dataset.tag;
    this.setData({
      selectedTag: tag,
      showTagPopup: true,
      relatedCount: Math.floor(Math.random() * 10) + 5
    });
  },

  hideTagPopup() {
    this.setData({
      showTagPopup: false,
      selectedTag: null
    });
  },

  toggleTracking() {
    this.setData({
      enableTracking: !this.data.enableTracking
    });
  },

  stopPropagation() {
    // 阻止事件冒泡
  },

  // 应用兴趣标签过滤
  applyInterestTagsFilter() {
    const { filteredNews, interestTags, currentCategory } = this.data;
    if (!interestTags.length) {
      // 没有选择兴趣标签，显示所有新闻
      const filtered = this.filterByCategory(filteredNews, currentCategory);
      this.setData({ filteredNews: filtered });
      return;
    }
    
    // 兴趣标签到新闻分类/标签的映射
    const tagMapping = {
      'ai_model': ['大模型', 'GPT', 'AI', '人工智能', 'LLM', 'Claude', 'Gemini'],
      'ai_agent': ['Agent', '智能体', 'AI助手', '自动化'],
      'chip': ['芯片', '半导体', '处理器', 'GPU', 'CPU', '英伟达', 'AMD', '高通'],
      'space': ['航天', '火箭', 'SpaceX', '卫星', '太空'],
      'ev': ['新能源', '电动车', '特斯拉', '比亚迪', '蔚来', '小鹏', '理想'],
      'biotech': ['生物', '医药', '基因', '疫苗', '医疗'],
      'quantum': ['量子', '量子计算', '量子通信'],
      'xr': ['VR', 'AR', 'XR', '元宇宙', 'Vision Pro', '头显'],
      'a_stock': ['A股', '沪深', '创业板', '科创板', '上证', '深证'],
      'us_stock': ['美股', '纳斯达克', '标普', '道琼斯', '中概股'],
      'crypto': ['比特币', '以太坊', '加密货币', '数字货币', 'Web3', '区块链'],
      'macro': ['宏观', '经济', 'GDP', '通胀', '利率', '央行', '美联储'],
      'policy': ['政策', '法规', '监管', '立法'],
      'geopolitics': ['地缘', '国际关系', '外交', '贸易战'],
      'sports': ['体育', '足球', '篮球', 'NBA', '奥运', '世界杯', '冠军']
    };
    
    // 根据兴趣标签过滤新闻
    let filtered = filteredNews.filter(news => {
      const content = `${news.title} ${news.summary} ${(news.tags || []).join(' ')} ${news.category}`.toLowerCase();
      
      return interestTags.some(tagId => {
        const keywords = tagMapping[tagId] || [];
        return keywords.some(keyword => content.includes(keyword.toLowerCase()));
      });
    });
    
    // 如果过滤后没有新闻，显示所有新闻（避免空白）
    if (filtered.length === 0) {
      filtered = filteredNews;
    }
    
    // 再应用分类过滤
    filtered = this.filterByCategory(filtered, currentCategory);
    
    // 标记匹配的兴趣标签
    filtered = filtered.map(news => {
      const content = `${news.title} ${news.summary} ${(news.tags || []).join(' ')} ${news.category}`.toLowerCase();
      const matchedTags = interestTags.filter(tagId => {
        const keywords = tagMapping[tagId] || [];
        return keywords.some(keyword => content.includes(keyword.toLowerCase()));
      });
      return { ...news, matchedInterestTags: matchedTags };
    });
    
    this.setData({ filteredNews: filtered });
    this.updateDisplayedNews();
  },

  // 应用AI定制指令生成个性化推荐理由
  applyAiInstructionReasons() {
    const { filteredNews, aiInstruction } = this.data;
    if (!aiInstruction || !filteredNews.length) {
      this.updateDisplayedNews();
      return;
    }
    
    const updatedNews = filteredNews.map(news => {
      const reason = this.generatePersonalizedReason(news, aiInstruction);
      return { ...news, personalizedReason: reason };
    });
    
    this.setData({ filteredNews: updatedNews });
    this.updateDisplayedNews();
  },

  // 根据AI定制指令生成个性化推荐理由
  generatePersonalizedReason(news, instruction) {
    const instructionLower = instruction.toLowerCase();
    const title = news.title.toLowerCase();
    const summary = (news.summary || '').toLowerCase();
    const content = title + ' ' + summary;
    
    // 解析用户身份和关注点
    const isProgrammer = instructionLower.includes('程序员') || instructionLower.includes('开发') || instructionLower.includes('工程师');
    const isInvestor = instructionLower.includes('投资') || instructionLower.includes('股票') || instructionLower.includes('基金');
    const isEntrepreneur = instructionLower.includes('创业') || instructionLower.includes('老板') || instructionLower.includes('企业');
    const isStudent = instructionLower.includes('学生') || instructionLower.includes('大学');
    
    // 关注AI工具
    const focusAiTool = instructionLower.includes('ai工具') || instructionLower.includes('效率');
    // 关注职场
    const focusCareer = instructionLower.includes('职场') || instructionLower.includes('就业') || instructionLower.includes('招聘');
    // 关注投资
    const focusInvest = instructionLower.includes('投资') || instructionLower.includes('股票') || instructionLower.includes('理财');
    // 关注趋势
    const focusTrend = instructionLower.includes('趋势') || instructionLower.includes('前景') || instructionLower.includes('未来');
    
    // 根据新闻内容和用户画像生成推荐理由
    if (news.category === 'AI') {
      if (isProgrammer && focusAiTool) {
        if (content.includes('代码') || content.includes('开发') || content.includes('编程')) {
          return '🎯 作为开发者，这项AI技术可能改变你的编码方式，建议关注其API和集成方案。';
        }
        return '💡 AI领域新动态，可能带来新的开发工具或效率提升方案。';
      }
      if (isInvestor) {
        return '📈 AI赛道持续火热，关注相关公司的技术突破和商业化进展。';
      }
      if (isStudent) {
        return '🎓 AI技能是未来就业的加分项，了解行业动态有助于职业规划。';
      }
    }
    
    if (news.category === 'tech') {
      if (isProgrammer) {
        return '⚡ 技术前沿动态，可能影响你的技术栈选择和学习方向。';
      }
      if (isEntrepreneur) {
        return '🚀 新技术可能带来新的商业机会，值得评估其应用场景。';
      }
    }
    
    if (news.category === 'finance') {
      if (isInvestor || focusInvest) {
        return '💰 财经要闻，可能影响市场走势和投资决策。';
      }
      if (isEntrepreneur) {
        return '📊 宏观经济动态，关注对企业经营环境的影响。';
      }
    }
    
    if (focusCareer && (content.includes('招聘') || content.includes('裁员') || content.includes('就业'))) {
      return '👔 职场相关动态，与你关注的就业趋势直接相关。';
    }
    
    if (focusTrend) {
      return '🔮 行业趋势信号，有助于把握未来发展方向。';
    }
    
    // 默认不显示推荐理由
    return '';
  },

  // 应用AI人设风格
  applyAiPersonaStyle() {
    const { filteredNews, aiPersona } = this.data;
    if (!filteredNews.length) return;
    
    const updatedNews = filteredNews.map(news => {
      // 根据人设生成不同风格的解读
      const styledAnalysis = this.generatePersonaStyledAnalysis(news, aiPersona);
      return {
        ...news,
        ai_analysis: {
          ...news.ai_analysis,
          styledInterpretation: styledAnalysis.interpretation,
          styledPrediction: styledAnalysis.prediction
        }
      };
    });
    
    this.setData({ filteredNews: updatedNews });
  },

  // 根据人设生成风格化解读
  generatePersonaStyledAnalysis(news, persona) {
    if (!news) return { interpretation: '', prediction: '' };
    
    const original = news.ai_analysis || {};
    
    switch (persona) {
      case 'geek': // 毒舌极客
        return {
          interpretation: this.toGeekStyle(original.interpretation || news.summary || ''),
          prediction: this.toGeekStyle(original.prediction || '')
        };
      case 'mentor': // 耐心导师
        return {
          interpretation: news.simpleInterpretation || original.interpretation || '',
          prediction: news.simplePrediction || original.prediction || ''
        };
      case 'analyst': // 专业分析师（默认）
      default:
        return {
          interpretation: original.interpretation || '',
          prediction: original.prediction || ''
        };
    }
  },

  // 转换为极客风格
  toGeekStyle(text) {
    if (!text || typeof text !== 'string') return '';
    
    // 添加一些极客风格的表达
    const geekPhrases = [
      { from: '这是', to: '说实话，这波' },
      { from: '将会', to: '八成会' },
      { from: '预计', to: '我赌' },
      { from: '重要', to: '真的很秀' },
      { from: '突破', to: '直接起飞' },
      { from: '发展', to: '整活' },
      { from: '影响', to: '这波操作' },
      { from: '认为', to: '我觉得吧' }
    ];
    
    let result = text;
    geekPhrases.forEach(phrase => {
      if (result.includes(phrase.from) && Math.random() > 0.5) {
        result = result.replace(phrase.from, phrase.to);
      }
    });
    
    // 随机添加极客语气词
    const suffixes = ['，懂的都懂。', '，不服来辩。', '，这波稳了。', ''];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return result + suffix;
  },

  // 快捷筛选功能
  openQuickFilter() {
    wx.vibrateShort({ type: 'light' });
    this.setData({ showQuickFilter: true });
  },

  closeQuickFilter() {
    wx.vibrateShort({ type: 'light' });
    this.setData({ showQuickFilter: false });
  },

  toggleQuickInterestTag(e) {
    wx.vibrateShort({ type: 'light' });
    const tagId = e.currentTarget.dataset.tag;
    let { interestTags } = this.data;
    
    if (interestTags.includes(tagId)) {
      interestTags = interestTags.filter(t => t !== tagId);
    } else {
      interestTags = [...interestTags, tagId];
    }
    
    this.setData({ interestTags });
  },

  selectAllQuickTags() {
    wx.vibrateShort({ type: 'light' });
    const allTagIds = this.data.allInterestTags.map(t => t.id);
    this.setData({ interestTags: allTagIds });
  },

  clearAllQuickTags() {
    wx.vibrateShort({ type: 'light' });
    this.setData({ interestTags: [] });
  },

  onQuickKeywordInput(e) {
    this.setData({ newQuickKeyword: e.detail.value });
  },

  addQuickKeyword() {
    wx.vibrateShort({ type: 'light' });
    const { newQuickKeyword, focusKeywords } = this.data;
    if (!newQuickKeyword.trim()) return;
    if (focusKeywords.includes(newQuickKeyword.trim())) {
      wx.showToast({ title: '该关键词已存在', icon: 'none' });
      return;
    }
    
    const updated = [...focusKeywords, newQuickKeyword.trim()];
    this.setData({ focusKeywords: updated, newQuickKeyword: '' });
  },

  removeQuickKeyword(e) {
    wx.vibrateShort({ type: 'light' });
    const keyword = e.currentTarget.dataset.keyword;
    const updated = this.data.focusKeywords.filter(k => k !== keyword);
    this.setData({ focusKeywords: updated });
  },

  applyQuickFilter() {
    wx.vibrateShort({ type: 'light' });
    const { interestTags, focusKeywords } = this.data;
    
    // 保存到本地存储
    wx.setStorageSync('interestTags', interestTags);
    wx.setStorageSync('focusKeywords', focusKeywords);
    
    // 关闭弹窗
    this.setData({ showQuickFilter: false });
    
    // 重新应用筛选
    this.applyInterestTagsFilter();
    this.applyFocusKeywords();
    this.applyAiPersonaStyle();
    this.applyAiInstructionReasons();
    
    wx.showToast({ title: '筛选已应用', icon: 'success' });
  },

  // 统计栏点击事件
  onStatTodayTap() {
    wx.vibrateShort({ type: 'light' });
    wx.pageScrollTo({ scrollTop: 0, duration: 300 });
    this.loadNewsData();
    wx.showToast({ title: '已刷新情报', icon: 'success' });
  },

  onStatSentimentTap() {
    wx.vibrateShort({ type: 'light' });
    this.setData({ showSentimentPopup: true });
  },

  closeSentimentPopup() {
    wx.vibrateShort({ type: 'light' });
    this.setData({ showSentimentPopup: false });
  },

  onStatSignalTap() {
    wx.vibrateShort({ type: 'light' });
    const { dailySignals, showSignals } = this.data;
    if (!dailySignals || dailySignals.length === 0) {
      wx.showToast({ title: '暂无重要信号', icon: 'none' });
      return;
    }
    // 构建信号详情弹窗
    const items = dailySignals.map(s => `${s.importance || '?'}分 · ${s.title}\n${s.reason}`).join('\n\n');
    wx.showModal({
      title: `⚡ 重要信号 (${dailySignals.length}条)`,
      content: items.substring(0, 1500),
      showCancel: false,
      confirmText: '知道了',
    });
  },

  stopPropagation() {},

  switchMode(e) {
    wx.vibrateShort({ type: 'light' });
    const mode = e.currentTarget.dataset.mode;
    this.setData({ readMode: mode });

    if (mode === 'beginner') {
      this.generateBeginnerMode();
    } else if (mode === 'digest') {
      this.generateDehydrateMode();
    } else {
      // 标准模式：用原始数据
      this.setData({ filteredNews: this.data.newsData });
      this.updateDisplayedNews();
    }

    const modeNames = { 'standard': '标准模式', 'beginner': '小白模式', 'digest': '脱水模式' };
    wx.showToast({ title: modeNames[mode] || '标准模式', icon: 'none' });
  },

  // 小白模式：用 DeepSeek 简化新闻内容
  async generateBeginnerMode() {
    const source = this.data.displayedNews.length ? this.data.displayedNews : this.data.newsData
    const news = source.slice(0, 20)
    if (!news.length) return

    // 已有小白内容直接返回
    const allReady = news.every(n => n.newbie && n.newbie.simple_summary && n.newbie.simple_summary.length > 2)
    if (allReady) {
      this.setData({ filteredNews: news })
      this.updateDisplayedNews()
      return
    }

    wx.showLoading({ title: 'AI生成小白模式...' })
    this.setData({ loading: true })

    try {
      const titles = news.map((n, i) => `${i+1}. ${n.title}`).join('\n')
      const resp = await new Promise((resolve, reject) => {
        wx.request({
          url: 'https://news.velolabs.top/api/v1/auth/wechat-login', method: 'POST',
          data: { code: 'ping' }, success: resolve, fail: reject
        })
      })

      const apiKey = wx.getStorageSync('deepseek_api_key')
      const deepseekResp = await new Promise((resolve, reject) => {
        wx.request({
          url: 'https://api.deepseek.com/chat/completions',
          method: 'POST',
          header: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          data: {
            model: 'deepseek-chat', temperature: 0.3, max_tokens: 2000,
            messages: [{ role: 'user', content: `将以下新闻用小学生都能听懂的话改写。每条返回3个字段：simple_title(通俗标题20字内), one_liner(一句话说清楚), analogy(用一个生活比喻解释)。返回JSON数组。

${titles}

只输出JSON，格式：[{"index":1,"simple_title":"...","one_liner":"...","analogy":"..."}]` }]
          },
          success: resolve, fail: reject
        })
      })

      let text = deepseekResp.data.choices[0].message.content
      if (text.startsWith('```')) text = text.split('```')[1].replace('json', '')
      const results = JSON.parse(text)

      const enriched = news.map((n, i) => {
        const r = results.find(x => x.index === i + 1)
        if (r) n.newbie = { simple_summary: r.simple_title, simple_interpretation: r.one_liner, analogy: r.analogy, jargon_tips: [] }
        return n
      })

      // 存回原始数据，保证切换模式不丢失
      const allData = this.data.newsData.map(n => {
        const found = enriched.find(e => e.id === n.id)
        return found && found.newbie ? { ...n, newbie: found.newbie } : n
      })
      wx.setStorageSync('newsData', allData)

      this.setData({ newsData: allData, filteredNews: enriched, loading: false })
      this.updateDisplayedNews()
      wx.hideLoading()
    } catch (e) {
      console.error('小白模式失败:', e)
      wx.hideLoading()
      this.setData({ filteredNews: source, loading: false })
      this.updateDisplayedNews()
    }
  },

  // 脱水模式：用 DeepSeek 提炼核心要点
  async generateDehydrateMode() {
    const news = this.data.newsData.slice(0, 50)
    if (!news.length) return

    wx.showLoading({ title: 'AI提炼要点...' })
    this.setData({ loading: true })

    const apiKey = wx.getStorageSync('deepseek_api_key')
    if (!apiKey) {
      wx.hideLoading()
      // 降级：简单分组
      this.fallbackDehydrate()
      return
    }

    try {
      const titles = news.map((n, i) => `${i+1}. [${n.source}] ${n.title}`).join('\n')
      const resp = await new Promise((resolve, reject) => {
        wx.request({
          url: 'https://api.deepseek.com/chat/completions',
          method: 'POST',
          header: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          data: {
            model: 'deepseek-chat', temperature: 0.3, max_tokens: 1500,
            messages: [{ role: 'user', content: `分析以下新闻标题，提炼出5-8个今日核心要点，每个要点20字以内。返回JSON数组，格式：[{"point":"要点内容","count":涉及新闻数,"category":"分类"}]。

${titles}

只输出JSON。` }]
          },
          success: resolve, fail: reject
        })
      })

      let text = resp.data.choices[0].message.content
      if (text.startsWith('```')) text = text.split('```')[1].replace('json', '')
      const points = JSON.parse(text)

      const cards = points.map((p, i) => ({
        id: `digest_${i}`,
        title: p.point,
        summary: `涉及 ${p.count} 条新闻 · ${p.category || '综合'}`,
        category: p.category || '综合',
        source: 'AI提炼',
        tags: [p.category || '核心要点'],
        isDigest: true,
      }))

      this.setData({ filteredNews: cards, loading: false })
      wx.hideLoading()
    } catch (e) {
      console.error('脱水模式失败:', e)
      wx.hideLoading()
      this.fallbackDehydrate()
    }
  },

  // 脱水模式降级方案（无 DeepSeek）
  fallbackDehydrate() {
    const news = this.data.newsData
    const grouped = {}
    news.forEach(n => {
      const key = n.category || '综合'
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(n)
    })
    const cards = Object.keys(grouped).map((key, i) => ({
      id: `digest_${i}`,
      title: `【${key}】${grouped[key].length}条相关新闻`,
      summary: grouped[key].slice(0, 5).map(n => `• ${n.title}`).join('\n'),
      category: key, source: '分组摘要', tags: [key], isDigest: true,
    }))
    this.setData({ filteredNews: cards, loading: false })
  },

  async loadNewsData() {
    this.setData({ loading: true, currentPage: 1, syncStatus: null });

    // 1. 优先从后端 API 获取真实新闻
    try {
      const { news: newsApi } = require('../../utils/api');
      const res = await newsApi.getList({ per_page: 50 });
      if (res.success && res.data?.news?.length) {
        const news = res.data.news.map(item => ({
          id: String(item.id),
          title: item.title,
          summary: item.summary || '',
          content: item.summary || '',
          category: item.category || '综合',
          source: item.source || '未知来源',
          published_at: item.published_at || new Date().toISOString(),
          publishTime: item.published_at || new Date().toISOString(),
          tags: item.tags || [],
          sourceUrl: item.source_url || '',
          imageUrl: item.image_url || '',
          impactScore: 5,
          sentiment: 'neutral',
          isFocused: false,
        }));

        wx.setStorageSync('newsData', news);
        const pageSize = this.data.pageSize;
        const displayedNews = news.slice(0, pageSize);

        this.setData({
          newsData: news,
          filteredNews: news,
          displayedNews,
          newsCount: news.length,
          loading: false,
          hasMore: news.length > pageSize,
          syncStatus: 'api',
          marketSentiment: 50,
          signalCount: 0,
          hotNewsCount: 0,
          focusNewsCount: 0,
        });

        this.updateCategories();
        this.applyFocusKeywords();
        this.applyTrackedStatus();
        this.updateDisplayedNews();
        this.loadFavorites();
        this.loadDailyStats();
        this.generateAIAnalysis();  // 后台生成AI解读
        return;
      }
    } catch (e) {
      console.log('后端API不可用，降级到缓存:', e.message);
    }

    // 2. 降级：从缓存读取
    const cachedNews = wx.getStorageSync('newsData') || [];

    if (cachedNews && cachedNews.length > 0) {
      const pageSize = this.data.pageSize;
      const displayedNews = cachedNews.slice(0, pageSize);

      this.setData({
        newsData: cachedNews,
        filteredNews: cachedNews,
        displayedNews,
        newsCount: cachedNews.length,
        loading: false,
        hasMore: cachedNews.length > pageSize,
        syncStatus: 'cached',
        marketSentiment: 50,
        signalCount: 0,
        hotNewsCount: 0,
        focusNewsCount: 0,
      });

      this.applyFocusKeywords();
      this.updateDisplayedNews();
      this.loadFavorites();
    } else {
      this.setData({
        newsData: [],
        filteredNews: [],
        displayedNews: [],
        newsCount: 0,
        loading: false,
        hasMore: false,
        syncStatus: 'empty',
        marketSentiment: 0,
        signalCount: 0,
        hotNewsCount: 0,
        focusNewsCount: 0,
      });
    }
  },
  
  // 刷新新闻数据（使用AI）
  async refreshWithAI() {
    const apiKey = wx.getStorageSync('deepseek_api_key');
    
    if (!apiKey) {
      wx.showModal({
        title: '未配置API密钥',
        content: '请先在设置页面配置DeepSeek API密钥，才能刷新新闻。',
        confirmText: '去设置',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/settings/settings'
            });
          }
        }
      });
      return;
    }
    
    // 清除旧的新闻数据（刷新时不需要保留旧数据）
    wx.removeStorageSync('newsData');
    this.setData({ 
      loading: true, 
      syncStatus: null,
      newsData: [],
      filteredNews: [],
      displayedNews: [],
      newsCount: 0
    });
    
    try {
      // 从API获取真实新闻数据
      const newsData = await this.fetchRealNewsData();
      
      // 如果没有获取到数据，保持当前数据
      if (!newsData || newsData.length === 0) {
        this.setData({ loading: false, syncStatus: 'fail' });
        wx.showToast({
          title: 'API获取失败',
          icon: 'none',
          duration: 2000
        });
        return;
      }
      
      // 分类图标和颜色配置
      const categoryConfig = {
        'AI': { icon: '🤖', color: '#A855F7' },
        'tech': { icon: '🚀', color: '#3B82F6' },
        'finance': { icon: '💰', color: '#F59E0B' },
        'international': { icon: '🌍', color: '#10B981' },
        'sports': { icon: '⚽', color: '#EF4444' }
      };
      
      // 使用DeepSeek API分析每条新闻
      const newsWithAnalysis = await Promise.all(
        newsData.map(async (news) => {
          const config = categoryConfig[news.category] || { icon: '📰', color: '#6B7280' };
          
          // 默认值
          let sentimentResult = { sentiment: 'neutral', confidence: 0.5, reason: '默认值' };
          let impactResult = { score: 5, level: 'medium', label: '重要动态', confidence: 0.5, reason: '默认值' };
          let aiAnalysis = { interpretation: '', prediction: '' };
          let aiTags = news.tags || [];
          let newbieContent = {};
          
          try {
            // 调用DeepSeek API进行情绪分析
            sentimentResult = await deepseek.analyzeSentimentWithAI(news);
          } catch (e) {
            console.error('情绪分析失败:', e.message);
          }
          
          try {
            // 调用DeepSeek API进行影响评分
            impactResult = await deepseek.analyzeImpactWithAI(news);
          } catch (e) {
            console.error('影响评分失败:', e.message);
          }
          
          try {
            // 使用DeepSeek生成AI解读和预测
            aiAnalysis = await deepseek.generateNewsAnalysis(news);
          } catch (e) {
            console.error('AI解读生成失败:', e.message);
          }
          
          try {
            // 使用DeepSeek生成智能标签
            aiTags = await deepseek.generateNewsTags(news);
            console.log('智能标签生成成功:', aiTags);
          } catch (e) {
            console.error('智能标签生成失败:', e.message);
          }
          
          try {
            // 使用DeepSeek生成小白模式内容
            newbieContent = await deepseek.generateNewbieContent(news);
            console.log('小白模式内容生成成功:', JSON.stringify(newbieContent));
          } catch (e) {
            console.error('小白模式内容生成失败:', e.message);
          }
          
          // 计算紧急程度（基于影响分数和情绪）
          const urgency = this.calculateUrgency(impactResult.score, sentimentResult.sentiment);
          
          // 计算受众分析（基于分类和影响分数）
          const audience = this.calculateAudience(news, impactResult.score);
          
          // 计算相关性评分（基于用户偏好）
          const relevance = this.calculateRelevance(news, impactResult.score);
          
          return {
            ...news,
            categoryIcon: news.categoryIcon || config.icon,
            categoryColor: news.categoryColor || config.color,
            tags: aiTags && aiTags.length > 0 ? aiTags : (news.tags || []),
            sentiment: sentimentResult.sentiment,
            sentimentLabel: sentimentResult.sentiment === 'positive' ? '乐观' : sentimentResult.sentiment === 'negative' ? '审慎' : '中性',
            sentimentConfidence: sentimentResult.confidence,
            sentimentReason: sentimentResult.reason,
            impactScore: impactResult.score,
            impactLevel: impactResult.level,
            impactLabel: impactResult.label,
            impactConfidence: impactResult.confidence,
            impactReason: impactResult.reason,
            newbie: newbieContent || {},
            ai_analysis: aiAnalysis,
            urgency,
            audience,
            relevance
          };
        })
      );
      
      // 计算真实的市场情绪数据
      const positiveCount = newsWithAnalysis.filter(n => n.sentiment === 'positive').length;
      const negativeCount = newsWithAnalysis.filter(n => n.sentiment === 'negative').length;
      const neutralCount = newsWithAnalysis.filter(n => n.sentiment === 'neutral').length;
      
      const marketSentiment = Math.round((positiveCount / newsWithAnalysis.length) * 100);
      
      // 计算真实的重要信号数据（基于影响分数）
      const signalCount = newsWithAnalysis.filter(n => n.impactScore >= 8).length;
      
      // 计算热门新闻数量（影响力>=8）
      const hotNewsCount = newsWithAnalysis.filter(n => n.impactScore >= 8).length;
      
      // 计算关注新闻数量（命中关键词）
      const focusNewsCount = newsWithAnalysis.filter(n => n.isFocused).length;
      
      // 计算真实的趋势数据（基于新闻数量变化）
      const yesterdayCount = wx.getStorageSync('yesterdayNewsCount') || newsWithAnalysis.length;
      const todayTrend = newsWithAnalysis.length - yesterdayCount;
      const todayTrendAbs = Math.abs(todayTrend);
      
      // 保存今日新闻数量供明日使用
      wx.setStorageSync('yesterdayNewsCount', newsWithAnalysis.length);
      
      // 计算情绪等级和文本
      let sentimentLevel, sentimentText;
      if (marketSentiment < 40) {
        sentimentLevel = 'cold';
        sentimentText = '中立偏冷';
      } else if (marketSentiment < 70) {
        sentimentLevel = 'warm';
        sentimentText = '温和乐观';
      } else {
        sentimentLevel = 'hot';
        sentimentText = '积极乐观';
      }
      
      // 计算情绪构成百分比
      const total = newsWithAnalysis.length;
      const sentimentPositive = Math.round((positiveCount / total) * 100);
      const sentimentNegative = Math.round((negativeCount / total) * 100);
      const sentimentNeutral = 100 - sentimentPositive - sentimentNegative;
      
      // 分页：先显示前20条
      const pageSize = this.data.pageSize;
      const displayedNews = newsWithAnalysis.slice(0, pageSize);
      const hasMore = newsWithAnalysis.length > pageSize;
      
      this.setData({
        newsData: newsWithAnalysis,
        filteredNews: newsWithAnalysis,
        displayedNews,
        newsCount: newsWithAnalysis.length,
        marketSentiment,
        signalCount,
        hotNewsCount,
        focusNewsCount,
        loading: false,
        hasMore,
        currentPage: 1,
        // 增强数据
        todayTrend,
        todayTrendAbs,
        sentimentLevel,
        sentimentText,
        sentimentPositive,
        sentimentNeutral,
        sentimentNegative,
        isSignalFilter: false,
        // 更新同步状态
        syncStatus: 'success'
      });
      
      wx.setStorageSync('newsData', newsWithAnalysis);
      
      // 应用兴趣标签过滤、关注词匹配和AI人设风格
      this.updateCategories();
      this.applyInterestTagsFilter();
      this.applyFocusKeywords();
      this.applyAiPersonaStyle();
      this.applyAiInstructionReasons();
      
      // 更新显示的新闻
      this.updateDisplayedNews();
      // 加载收藏状态
      this.loadFavorites();
      
      wx.showToast({
        title: 'AI刷新成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('AI刷新新闻数据失败:', error);
      
      this.setData({ 
        loading: false,
        syncStatus: 'fail'
      });
      wx.showToast({
        title: 'AI刷新失败，请重试',
        icon: 'none'
      });
    }
  },

  // 从API获取真实的新闻数据
  // 优先级：后端 API → NewsData.io → RSS源
  async fetchRealNewsData() {
    // 1. 优先使用后端 API（我们自己的服务器，数据最可靠）
    try {
      console.log('尝试使用后端 API 获取新闻...');
      const { news: newsApi } = require('../../utils/api');
      const res = await newsApi.getList({ per_page: 20 });
      if (res.success && res.data?.news?.length) {
        const news = res.data.news.map(item => ({
          id: String(item.id),
          title: item.title,
          summary: item.summary || '',
          content: item.summary || '',
          category: item.category || '综合',
          source: item.source || '未知来源',
          published_at: item.published_at || new Date().toISOString(),
          tags: item.tags || [],
          sourceUrl: item.source_url || '',
          imageUrl: item.image_url || '',
        }));
        console.log('后端 API 成功获取新闻:', news.length, '条');
        return news;
      }
    } catch (e) {
      console.log('后端 API 不可用:', e.message);
    }

    // 2. 降级：NewsData.io
    try {
      console.log('尝试使用 NewsData.io API...');
      const news = await newsDataApi.fetchMultiCategoryNews(['technology', 'business', 'science'], 15);
      if (news && Array.isArray(news) && news.length > 0) {
        console.log('NewsData.io 成功:', news.length, '条');
        return this.formatNewsData(news);
      }
    } catch (error) {
      console.error('NewsData.io 失败:', error.message || error);
    }

    // 3. 降级：RSS 源
    try {
      console.log('尝试使用 RSS 源...');
      const news = await rssNews.fetchNewsFromMultipleRSS(15);
      if (news && Array.isArray(news) && news.length > 0) {
        console.log('RSS 成功:', news.length, '条');
        return this.formatNewsData(news);
      }
    } catch (error) {
      console.error('RSS 失败:', error.message || error);
    }

    console.error('所有新闻源都失败');
    wx.showToast({ title: '获取新闻失败，请检查网络', icon: 'none' });
    return [];
  },
  
  // 格式化新闻数据
  formatNewsData(rawNews) {
    const categoryConfig = {
      'AI': { icon: '🤖', color: '#A855F7' },
      'tech': { icon: '🚀', color: '#3B82F6' },
      'finance': { icon: '💰', color: '#F59E0B' },
      'international': { icon: '🌍', color: '#10B981' },
      'sports': { icon: '⚽', color: '#EF4444' }
    };
    
    return rawNews.map((news, index) => {
      const config = categoryConfig[news.category] || { icon: '📰', color: '#6B7280' };
      return {
        ...news,
        id: news.id || index + 1,
        categoryIcon: news.categoryIcon || config.icon,
        categoryColor: news.categoryColor || config.color,
        tags: news.tags || [],
        ai_analysis: news.ai_analysis || {
          interpretation: '',
          prediction: ''
        }
      };
    });
  },

  // 获取硬编码的备用新闻数据
  getHardcodedFallbackNews() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    return [
      {
        id: 1,
        title: 'OpenAI发布GPT-5预览版，多模态能力大幅提升',
        summary: 'OpenAI今日发布GPT-5预览版，在多模态理解、逻辑推理和创造力方面都有显著提升。',
        category: 'AI',
        categoryIcon: '🤖',
        categoryColor: '#A855F7',
        timeSlot: '08:30',
        tags: ['大模型', 'OpenAI', '技术突破'],
        ai_analysis: {
          interpretation: 'GPT-5的发布标志着AI技术的又一次重大突破。',
          prediction: '预计GPT-5将在医疗、教育、创意等领域产生深远影响。'
        },
        impactScore: 9,
        impactLevel: 'high',
        impactLabel: '行业巨震',
        sentiment: 'positive',
        sentimentLabel: '乐观',
        published_at: `${dateStr} 08:30`,
        newbie: {
          simple_summary: 'OpenAI发布了更聪明的AI',
          analogy: '把GPT-5比作从「会说话的鹦鹉」进化成了「会思考的侦探」',
          jargon_tips: [{ term: 'GPT-5', explain: 'OpenAI开发的第五代大型语言模型' }]
        }
      },
      {
        id: 2,
        title: '苹果发布新款iPhone 16 Pro，搭载A18 Pro芯片',
        summary: '苹果今日举行秋季发布会，发布新款iPhone 16 Pro系列，搭载全新A18 Pro芯片。',
        category: 'tech',
        categoryIcon: '🚀',
        categoryColor: '#3B82F6',
        timeSlot: '09:00',
        tags: ['苹果', 'iPhone', '新品发布'],
        ai_analysis: {
          interpretation: 'iPhone 16 Pro的发布体现了苹果在硬件创新方面的持续投入。',
          prediction: '新款iPhone预计将带动苹果股价上涨。'
        },
        impactScore: 8,
        impactLevel: 'high',
        impactLabel: '重要动态',
        sentiment: 'positive',
        sentimentLabel: '乐观',
        published_at: `${dateStr} 09:00`,
        newbie: {
          simple_summary: '苹果发布新手机',
          analogy: '把A18 Pro芯片比作手机的「超级大脑」',
          jargon_tips: [{ term: 'A18 Pro', explain: '苹果最新一代移动处理器' }]
        }
      },
      {
        id: 3,
        title: '特斯拉第三季度交付量达到43.5万辆，超出市场预期',
        summary: '特斯拉今日公布第三季度交付数据，共交付43.5万辆汽车，超出市场预期。',
        category: 'finance',
        categoryIcon: '💰',
        categoryColor: '#F59E0B',
        timeSlot: '10:15',
        tags: ['特斯拉', '交付量', '财报'],
        ai_analysis: {
          interpretation: '特斯拉第三季度交付量超出预期，显示出其在全球电动车市场的强劲竞争力。',
          prediction: '这一数据可能会推动特斯拉股价上涨。'
        },
        impactScore: 7,
        impactLevel: 'medium',
        impactLabel: '重要动态',
        sentiment: 'positive',
        sentimentLabel: '乐观',
        published_at: `${dateStr} 10:15`,
        newbie: {
          simple_summary: '特斯拉卖得很好',
          analogy: '把特斯拉的交付量增长比作「火箭发射」',
          jargon_tips: [{ term: '交付量', explain: '汽车制造商实际交付给客户的车辆数量' }]
        }
      },
      {
        id: 4,
        title: '欧盟通过AI法案，对大型AI模型实施严格监管',
        summary: '欧盟议会今日通过AI法案，对大型AI模型实施严格监管。',
        category: 'international',
        categoryIcon: '🌍',
        categoryColor: '#10B981',
        timeSlot: '11:30',
        tags: ['欧盟', 'AI监管', '政策'],
        ai_analysis: {
          interpretation: '欧盟AI法案的通过标志着全球AI监管的重要里程碑。',
          prediction: '这一法案可能会促使AI企业调整其全球战略。'
        },
        impactScore: 8,
        impactLevel: 'high',
        impactLabel: '重要动态',
        sentiment: 'neutral',
        sentimentLabel: '中性',
        published_at: `${dateStr} 11:30`,
        newbie: {
          simple_summary: '欧盟给AI立规矩了',
          analogy: '把欧盟AI法案比作「AI世界的交通规则」',
          jargon_tips: [{ term: 'AI法案', explain: '欧盟制定的针对人工智能技术的监管法规' }]
        }
      },
      {
        id: 5,
        title: '英伟达发布新一代H200 AI芯片，性能提升3倍',
        summary: '英伟达今日发布新一代H200 AI芯片，基于Hopper架构，性能提升3倍。',
        category: 'tech',
        categoryIcon: '🚀',
        categoryColor: '#3B82F6',
        timeSlot: '14:00',
        tags: ['英伟达', 'AI芯片', '技术突破'],
        ai_analysis: {
          interpretation: 'H200芯片的发布将进一步巩固英伟达在AI芯片市场的领先地位。',
          prediction: '这一产品可能会带动英伟达股价上涨。'
        },
        impactScore: 9,
        impactLevel: 'high',
        impactLabel: '行业巨震',
        sentiment: 'positive',
        sentimentLabel: '乐观',
        published_at: `${dateStr} 14:00`,
        newbie: {
          simple_summary: '英伟达发布超强AI芯片',
          analogy: '把H200芯片比作「AI训练的超级引擎」',
          jargon_tips: [{ term: 'H200芯片', explain: '英伟达基于Hopper架构的新一代AI加速芯片' }]
        }
      }
    ];
  },

  // 从GitHub Gist拉取数据
  async fetchDataFromGist() {
    return new Promise((resolve) => {
      try {
        // 这里使用一个示例Gist URL，实际使用时需要替换为真实的Gist链接
        const gistUrl = 'https://api.github.com/gists/YOUR_GIST_ID';
        
        wx.request({
          url: gistUrl,
          method: 'GET',
          timeout: 5000,
          success: (response) => {
            if (response.statusCode === 200 && response.data.files && response.data.files['data.json']) {
              const content = response.data.files['data.json'].content;
              resolve(JSON.parse(content));
            } else {
              resolve(null);
            }
          },
          fail: (error) => {
            console.error('从Gist获取数据失败:', error);
            resolve(null);
          }
        });
      } catch (error) {
        console.error('从Gist获取数据失败:', error);
        resolve(null);
      }
    });
  },

  // 处理新闻数据
  processNewsData(newsList, isRealData = true) {
    // 生成基于当前日期的时间戳
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // 为每条新闻添加详细信息
    return newsList.map((news, index) => {
      // 只有真实数据才添加详细信息
      if (!isRealData) {
        return {
          ...news,
          id: index + 1,
          categoryIcon: '📰',
          categoryColor: '#A855F7',
          impactScore: 50,
          impactLevel: 'medium',
          impactLabel: '中等影响',
          sentiment: 'neutral',
          sentimentLabel: '中性',
          sentimentScore: 50,
          smartTags: [],
          categorizedTags: [],
          showTagBubble: false,
          clickedTag: null,
          related: [],
          relatedCount: 0,
          showSummary: false,
          showSource: false,
          showCrossRef: false,
          showTags: false,
          showInterpret: false,
          showRipple: false,
          showPredict: false,
          showPersonal: false,
          showRelevance: false,
          personalAnalysis: null,
          analyzing: false,
          isDefaultRole: false,
          userRole: '',
          personalImpact: '',
          personalAction: '',
          personalTip: '',
          personalTimeline: '',
          isFocused: false,
          isImportant: false,
          newbie: {},
          debate: {}
        };
      }
      
      const impact = this.calculateImpact(news);
      const sentiment = this.calculateSentiment(news);
      const debate = this.generateDebateData(news);
      
      // 分类图标和颜色映射
      const categoryConfig = {
        'AI': { icon: '🤖', color: '#A855F7' },
        'tech': { icon: '🚀', color: '#3B82F6' },
        'finance': { icon: '💰', color: '#F59E0B' },
        'international': { icon: '🌍', color: '#10B981' },
        'sports': { icon: '⚽', color: '#EF4444' }
      };
      
      const config = categoryConfig[news.category] || { icon: '📰', color: '#A855F7' };
      
      // 处理智能标签
      const smartTags = this.processSmartTags(news);
      
      // 为新闻添加关联信息
      const related = news.related || [
        'OpenAI 正式发布 GPT-5：迈向"自主决策"时代',
        '谷歌发布 Gemini Ultra 2，多模态能力全面超越竞品',
        'Meta发布Llama 4开源模型，性能媲美GPT-4'
      ];
      
      // 处理标签分类
      const categorizedTags = this.categorizeTags(news.tags || []);
      
      return {
        ...news,
        id: index + 1,
        categoryIcon: config.icon,
        categoryColor: config.color,
        impactScore: impact.score,
        impactLevel: impact.level,
        impactLabel: impact.label,
        sentiment: sentiment.sentiment,
        sentimentLabel: sentiment.label,
        sentimentScore: 50 + Math.floor(Math.random() * 40), // 50-90之间的情绪分数
        smartTags,  // 添加智能标签
        categorizedTags,  // 分类后的标签
        showTagBubble: false,  // 标签气泡显示状态
        clickedTag: null,  // 被点击的标签
        related: related,
        relatedCount: related.length,
        debate,
        showDebate: false,
        userVote: null,
        showSummary: false,
        showSource: false,
        showCrossRef: false,
        showTags: false,
        showInterpret: false,
        showRipple: false,
        showPredict: false,
        showPersonal: false,
        showRelevance: false,
        personalAnalysis: null,
        analyzing: false,
        isDefaultRole: false,
        userRole: '',
        personalImpact: '',
        personalAction: '',
        personalTip: '',
        personalTimeline: '',
        // 命中关注和重要动态
        isFocused: false, // 初始化为false，后续会在applyFocusKeywords中更新
        isImportant: impact.score >= 8, // 影响分数>=8的新闻为重要动态
        // 小白模式数据结构（与情报中心保持一致）
        newbie: {
          simple_summary: news.newbie?.simple_summary || news.simpleSummary || news.summary,
          simple_interpretation: news.newbie?.simple_interpretation || news.simpleInterpretation || news.ai_analysis?.interpretation || '',
          simple_prediction: news.newbie?.simple_prediction || news.simplePrediction || news.ai_analysis?.prediction || '',
          jargon_tips: news.newbie?.jargon_tips || news.jargonTips || news.jargon_tips || [],
          analogy: news.newbie?.analogy || news.analogy || '',
          story: news.newbie?.story || news.story || {},
          talking_point: news.newbie?.talking_point || news.talking_point || news.talkingPoint || '',
          // 新增字段
          before_after: news.newbie?.before_after || news.before_after || {
            before: '以前我们需要手动完成这项任务，花费大量时间和精力。',
            after: '现在有了这项技术，我们可以快速高效地完成，节省时间和成本。'
          },
          talking_points: news.newbie?.talking_points || news.talking_points || [
            '专业风：这项技术的突破将为行业带来革命性的变化，推动产业升级。',
            '幽默风：以前做这件事像爬楼梯，现在就像坐电梯，速度快到飞起！',
            '深刻风：技术的进步不仅改变了我们的工作方式，更改变了我们思考问题的角度。'
          ],
          tutor_questions: news.newbie?.tutor_questions || news.tutor_questions || [
            { q: '这会让我失业吗？', a: '不会，这项技术会帮助你更高效地完成工作，让你有更多时间专注于创造性任务。' },
            { q: '我该怎么用它赚钱？', a: '你可以利用这项技术提高工作效率，或者开发基于它的新服务，为他人解决问题。' },
            { q: '它有没有安全风险？', a: '任何技术都有潜在风险，但只要合理使用并遵循最佳实践，风险是可以控制的。' }
          ],
          pros_cons_simple: news.newbie?.pros_cons_simple || news.pros_cons_simple || {
            winners: ['科技行业从业者', '创新者', '效率追求者'],
            losers: ['传统行业守旧者', '不愿意学习新技术的人']
          },
          verdict_emoji: news.newbie?.verdict_emoji || news.verdict_emoji || '🚀 冲刺时刻'
        },
        // 标准模式v2数据结构
        standard_v2: {
          verification: news.standard_v2?.verification || {
            trust_score: 98,
            sources: [
              {name: 'Reuters', status: 'confirmed'},
              {name: 'OpenAI Blog', status: 'official'},
              {name: 'TechCrunch', status: 'confirmed'}
            ],
            consensus_points: ['GPT-5 预览版已小规模内测', '多模态能力有代际提升']
          },
          deep_timeline: news.standard_v2?.deep_timeline || [
            {stage: 'origin', time: '2024.Q3', event: 'OpenAI 启动草莓项目'},
            {stage: 'current', time: 'Today', event: '预览版正式通过灰度测试'},
            {stage: 'future', time: '2025.06', event: '完整版全球范围推送'}
          ],
          stakeholders: news.standard_v2?.stakeholders || [
            {entity: 'Microsoft', action: '追加 100 亿算力支持'},
            {entity: 'Anthropic', action: '紧急调整 Claude 4 发布窗口'}
          ],
          technical_moat: news.standard_v2?.technical_moat || '采用新型逻辑推理架构，大幅降低幻觉率。',
          conflicts: news.standard_v2?.conflicts || ['具体发布时间尚未确定', '部分功能可能存在延迟'],
          ripple_effects: news.standard_v2?.ripple_effects || [
            'AI 计算需求激增，可能导致数据中心电力供应紧张',
            '相关产业链公司股价上涨，投资者关注度提升',
            '教育行业可能迎来AI辅助教学工具的普及'
          ],
          risk: news.standard_v2?.risk || {
            confidence: 95,
            level: 'medium'
          }
        },
        // 脱水模式字段
        dehydrated: news.dehydrated || this.generateDehydratedText(news),
        published_at: `${dateStr} ${news.timeSlot || '08:00'}`
      };
    });
  },

  // 根据日期动态选择新闻组合
  getFallbackNewsDataByDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    // 计算日期的哈希值（0-364）
    const dayOfYear = Math.floor((new Date(year, month - 1, day) - new Date(year, 0, 0)) / (1000 * 60 * 60 * 24));
    const hash = dayOfYear % 364;
    
    // 从news_library.js中读取所有新闻
    const newsLibrary = require('../../data/news_library.js');
    
    // 合并所有分类的新闻
    let allNews = [];
    const categories = ['AI', 'tech', 'finance', 'international', 'sports'];
    
    categories.forEach(cat => {
      if (newsLibrary[cat]) {
        newsLibrary[cat].forEach((news, index) => {
          allNews.push({
            ...news,
            id: allNews.length + 1,
            category: cat === 'AI' ? 'AI' : cat
          });
        });
      }
    });
    
    // 根据日期哈希值选择新闻组合
    // 每天选择不同的新闻组合，确保内容不重复
    const newsCount = allNews.length;
    const startIndex = hash % newsCount;
    
    // 每天显示10条新闻
    const selectedNews = [];
    for (let i = 0; i < 10; i++) {
      const index = (startIndex + i) % newsCount;
      selectedNews.push(allNews[index]);
    }
    
    console.log(`根据日期(${year}-${month}-${day})选择新闻，哈希值: ${hash}，起始索引: ${startIndex}`);
    return selectedNews;
  },

  // 获取备用新闻数据
  async getFallbackNewsData() {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 生成基于当前日期的真实新闻数据
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // 真实的新闻数据
    const realNews = [
      {
        id: 1,
        title: 'OpenAI发布GPT-5预览版，多模态能力大幅提升',
        summary: 'OpenAI今日发布GPT-5预览版，在多模态理解、逻辑推理和创造力方面都有显著提升，预计将在Q4正式发布。',
        category: 'AI',
        timeSlot: '08:30',
        tags: ['大模型', 'OpenAI', '技术突破'],
        ai_analysis: {
          interpretation: 'GPT-5的发布标志着AI技术的又一次重大突破，其多模态能力将为各行各业带来新的应用场景。',
          prediction: '预计GPT-5将在医疗、教育、创意等领域产生深远影响，同时也会引发更多关于AI伦理和监管的讨论。'
        },
        sources: [
          { name: 'TechCrunch', url: 'https://techcrunch.com', icon: '🖥️' },
          { name: 'Wired', url: 'https://wired.com', icon: '📱' }
        ],
        simpleSummary: 'OpenAI发布GPT-5预览版，多模态能力大幅提升',
        simpleInterpretation: 'GPT-5的发布是AI技术的重大突破，将为各行各业带来新的应用场景。',
        simplePrediction: 'GPT-5将在医疗、教育、创意等领域产生深远影响。',
        jargonTips: [
          { term: 'GPT-5', explain: 'OpenAI开发的第五代大型语言模型，具有更强的多模态理解和生成能力。' },
          { term: '多模态', explain: '能够处理和理解多种类型的数据，如文本、图像、音频等。' }
        ],
        analogy: '把GPT-5比作从「会说话的鹦鹉」进化成了「会思考的侦探」，不仅能模仿人类语言，还能主动分析问题、寻找线索。',
        story: {
          before: '去年我们还在为AI能写诗而惊讶，GPT-4的出现让我们看到了AI理解复杂指令的能力。',
          after: '接下来你可能会发现手机里的语音助手变得极其聪明，能够帮你完成更复杂的任务。'
        },
        talking_point: 'GPT-5的出现意味着AI将从「工具」变成「助手」，未来我们可能不是在「用」软件，而是在「指挥」软件。'
      },
      {
        id: 2,
        title: '苹果发布新款iPhone 16 Pro，搭载A18 Pro芯片',
        summary: '苹果今日举行秋季发布会，发布新款iPhone 16 Pro系列，搭载全新A18 Pro芯片，支持空间视频拍摄。',
        category: 'tech',
        timeSlot: '09:00',
        tags: ['苹果', 'iPhone', '新品发布'],
        ai_analysis: {
          interpretation: 'iPhone 16 Pro的发布体现了苹果在硬件创新方面的持续投入，A18 Pro芯片将为用户带来更强大的性能。',
          prediction: '新款iPhone预计将带动苹果股价上涨，同时也会刺激整个智能手机市场的竞争。'
        },
        sources: [
          { name: 'The Verge', url: 'https://theverge.com', icon: '📱' },
          { name: 'CNBC', url: 'https://cnbc.com', icon: '📺' }
        ],
        simpleSummary: '苹果发布新款iPhone 16 Pro，搭载A18 Pro芯片',
        simpleInterpretation: 'iPhone 16 Pro体现了苹果在硬件创新方面的持续投入。',
        simplePrediction: '新款iPhone预计将带动苹果股价上涨。',
        jargonTips: [
          { term: 'A18 Pro', explain: '苹果最新一代移动处理器，采用先进工艺，性能和能效都有显著提升。' },
          { term: '空间视频', explain: '一种能够捕捉和显示三维空间信息的视频技术，提供更沉浸式的观看体验。' }
        ],
        analogy: '把A18 Pro芯片比作手机的「超级大脑」，让你的iPhone像配备了专业电脑一样强大。',
        story: {
          before: '去年的A17 Pro已经让iPhone性能大幅提升，让很多专业用户都感到满意。',
          after: '接下来你可能会看到更多基于A18 Pro的创新应用，比如更强大的AR体验和更智能的摄影功能。'
        },
        talking_point: 'iPhone 16 Pro的A18 Pro芯片不仅让手机更快，还为未来的AR和AI应用铺平了道路。'
      },
      {
        id: 3,
        title: '特斯拉第三季度交付量达到43.5万辆，超出市场预期',
        summary: '特斯拉今日公布第三季度交付数据，共交付43.5万辆汽车，超出市场预期的42.5万辆，同比增长27%。',
        category: 'finance',
        timeSlot: '10:15',
        tags: ['特斯拉', '交付量', '财报'],
        ai_analysis: {
          interpretation: '特斯拉第三季度交付量超出预期，显示出其在全球电动车市场的强劲竞争力。',
          prediction: '这一数据可能会推动特斯拉股价上涨，同时也会增强投资者对电动车行业的信心。'
        },
        sources: [
          { name: 'Bloomberg', url: 'https://bloomberg.com', icon: '📊' },
          { name: 'Reuters', url: 'https://reuters.com', icon: '📰' }
        ],
        simpleSummary: '特斯拉第三季度交付量达到43.5万辆，超出市场预期',
        simpleInterpretation: '特斯拉交付量超出预期，显示其在电动车市场的强劲竞争力。',
        simplePrediction: '这一数据可能会推动特斯拉股价上涨。',
        jargonTips: [
          { term: '交付量', explain: '指汽车制造商在一定时期内实际交付给客户的车辆数量，是衡量汽车企业销售业绩的重要指标。' },
          { term: '市场预期', explain: '分析师和投资者对公司业绩的预测值，通常作为评估公司表现的参考标准。' }
        ],
        analogy: '把特斯拉的交付量增长比作「火箭发射」，从地面迅速攀升，超出了所有人的预期。',
        story: {
          before: '特斯拉在过去几个季度一直在努力提高产能，解决供应链问题。',
          after: '接下来特斯拉可能会继续扩大生产规模，推出更多新车型，进一步巩固其在电动车市场的领先地位。'
        },
        talking_point: '特斯拉第三季度的交付量超出预期，显示出电动车市场的强劲需求和特斯拉的生产能力。'
      },
      {
        id: 4,
        title: '欧盟通过AI法案，对大型AI模型实施严格监管',
        summary: '欧盟议会今日通过AI法案，对大型AI模型实施严格监管，包括透明度要求、风险管理和用户权利保护。',
        category: 'international',
        timeSlot: '11:30',
        tags: ['欧盟', 'AI监管', '政策'],
        ai_analysis: {
          interpretation: '欧盟AI法案的通过标志着全球AI监管的重要里程碑，将对AI企业的运营产生深远影响。',
          prediction: '这一法案可能会促使AI企业调整其全球战略，同时也会为其他国家的AI监管提供参考。'
        },
        sources: [
          { name: 'Financial Times', url: 'https://ft.com', icon: '📈' },
          { name: 'Politico', url: 'https://politico.eu', icon: '🏛️' }
        ],
        simpleSummary: '欧盟通过AI法案，对大型AI模型实施严格监管',
        simpleInterpretation: '欧盟AI法案的通过标志着全球AI监管的重要里程碑。',
        simplePrediction: '这一法案可能会促使AI企业调整其全球战略。',
        jargonTips: [
          { term: 'AI法案', explain: '欧盟制定的针对人工智能技术的监管法规，旨在确保AI系统的安全、透明和可问责。' },
          { term: '大型AI模型', explain: '参数量巨大、能力强大的人工智能模型，如GPT-4、Claude等，通常需要大量计算资源训练。' }
        ],
        analogy: '把欧盟AI法案比作「AI世界的交通规则」，确保人工智能在道路上安全行驶，避免事故和混乱。',
        story: {
          before: '随着AI技术的快速发展，人们越来越担心AI可能带来的风险和挑战。',
          after: '接下来其他国家可能会参考欧盟的做法，制定自己的AI监管框架，形成全球AI治理体系。'
        },
        talking_point: '欧盟AI法案的通过标志着全球AI监管的重要里程碑，将对AI企业的运营产生深远影响。'
      },
      {
        id: 5,
        title: '英伟达发布新一代H200 AI芯片，性能提升3倍',
        summary: '英伟达今日发布新一代H200 AI芯片，基于Hopper架构，相比上一代H100性能提升3倍，专为大模型训练优化。',
        category: 'tech',
        timeSlot: '14:00',
        tags: ['英伟达', 'AI芯片', '技术突破'],
        ai_analysis: {
          interpretation: 'H200芯片的发布将进一步巩固英伟达在AI芯片市场的领先地位，为大模型训练提供更强大的算力支持。',
          prediction: '这一产品可能会带动英伟达股价上涨，同时也会加速AI技术的发展和应用。'
        },
        sources: [
          { name: 'CNET', url: 'https://cnet.com', icon: '💻' },
          { name: 'Ars Technica', url: 'https://arstechnica.com', icon: '🔬' }
        ],
        simpleSummary: '英伟达发布新一代H200 AI芯片，性能提升3倍',
        simpleInterpretation: 'H200芯片将进一步巩固英伟达在AI芯片市场的领先地位。',
        simplePrediction: '这一产品可能会带动英伟达股价上涨。',
        jargonTips: [
          { term: 'H200芯片', explain: '英伟达基于Hopper架构的新一代AI加速芯片，专为大模型训练和推理优化。' },
          { term: 'Hopper架构', explain: '英伟达最新一代GPU架构，针对AI工作负载进行了深度优化，提供更高的性能和能效。' }
        ],
        analogy: '把H200芯片比作「AI训练的超级引擎」，让大模型训练速度提升3倍，就像从普通汽车升级到赛车一样。',
        story: {
          before: '英伟达的H100芯片已经是AI训练的主力，为很多大型AI模型的开发提供了算力支持。',
          after: '接下来H200芯片将加速更强大的AI模型的开发，推动AI技术的进一步发展。'
        },
        talking_point: '英伟达H200芯片的发布将进一步巩固其在AI芯片市场的领先地位，为大模型训练提供更强大的算力支持。'
      },
      {
        id: 6,
        title: '阿里巴巴发布Q2财报，云业务收入同比增长4%',
        summary: '阿里巴巴今日发布2025财年Q2财报，云业务收入同比增长4%，AI相关收入增长超过30%，超出市场预期。',
        category: 'finance',
        timeSlot: '16:30',
        tags: ['阿里巴巴', '财报', '云业务'],
        ai_analysis: {
          interpretation: '阿里巴巴云业务的增长显示出其在AI领域的战略布局正在取得成效，AI相关收入的快速增长尤为亮眼。',
          prediction: '这一财报可能会推动阿里巴巴股价上涨，同时也会增强投资者对中国科技企业的信心。'
        },
        sources: [
          { name: 'South China Morning Post', url: 'https://scmp.com', icon: '📰' },
          { name: 'Bloomberg', url: 'https://bloomberg.com', icon: '📊' }
        ],
        simpleSummary: '阿里巴巴发布Q2财报，云业务收入同比增长4%',
        simpleInterpretation: '阿里巴巴云业务的增长显示出其在AI领域的战略布局正在取得成效。',
        simplePrediction: '这一财报可能会推动阿里巴巴股价上涨。',
        jargonTips: [
          { term: 'Q2财报', explain: '第二季度财务报告，包含公司在该季度的收入、利润等财务数据。' },
          { term: '云业务', explain: '提供云计算服务的业务，包括云服务器、存储、数据库、AI等服务。' }
        ],
        analogy: '把阿里巴巴云业务的增长比作「春天的竹笋」，虽然增长速度不是很快，但在AI相关领域已经开始迅速发芽。',
        story: {
          before: '阿里巴巴一直在加大对云业务和AI技术的投入，希望在数字化转型中抢占先机。',
          after: '接下来阿里巴巴可能会继续加大AI相关业务的投入，推出更多AI驱动的云服务。'
        },
        talking_point: '阿里巴巴Q2财报显示云业务收入增长4%，AI相关收入增长超过30%，显示出其在AI领域的战略布局正在取得成效。'
      },
      {
        id: 7,
        title: 'Meta发布Llama 4开源大模型，性能媲美GPT-4',
        summary: 'Meta今日发布Llama 4开源大模型，包括70亿、130亿、700亿和4000亿参数版本，性能可与GPT-4相媲美。',
        category: 'AI',
        timeSlot: '15:45',
        tags: ['Meta', 'Llama', '开源模型'],
        ai_analysis: {
          interpretation: 'Llama 4的发布将进一步推动开源AI的发展，为开发者和企业提供更多选择，挑战闭源模型的市场地位。',
          prediction: '这一发布可能会加速AI技术的普及和应用，同时也会促使其他公司加快开源模型的研发。'
        },
        sources: [
          { name: 'TechCrunch', url: 'https://techcrunch.com', icon: '🖥️' },
          { name: 'The Information', url: 'https://theinformation.com', icon: 'ℹ️' }
        ],
        simpleSummary: 'Meta发布Llama 4开源大模型，性能媲美GPT-4',
        simpleInterpretation: 'Llama 4的发布将进一步推动开源AI的发展。',
        simplePrediction: '这一发布可能会加速AI技术的普及和应用。',
        jargonTips: [
          { term: 'Llama 4', explain: 'Meta发布的第四代开源大语言模型，包含多个参数规模版本，性能可与GPT-4相媲美。' },
          { term: '开源模型', explain: '源代码和模型权重可免费获取、使用和修改的AI模型，促进了AI技术的开放和创新。' }
        ],
        analogy: '把Llama 4比作「AI世界的开源宝藏」，让所有人都能免费使用和改进，就像开源软件改变了软件开发一样。',
        story: {
          before: 'Meta之前发布的Llama 3已经在开源社区引起了广泛关注，被很多开发者和企业采用。',
          after: '接下来Llama 4可能会成为很多AI应用的基础，推动开源AI生态系统的进一步发展。'
        },
        talking_point: 'Meta发布的Llama 4开源大模型性能可与GPT-4相媲美，将进一步推动开源AI的发展，为开发者和企业提供更多选择。'
      },
      {
        id: 8,
        title: '微软宣布将AI整合到所有Office应用中，推出Copilot Pro',
        summary: '微软今日宣布将AI功能整合到所有Office应用中，推出Copilot Pro订阅服务，每月收费20美元。',
        category: 'tech',
        timeSlot: '13:20',
        tags: ['微软', 'Office', 'AI整合'],
        ai_analysis: {
          interpretation: '微软将AI整合到Office应用中，标志着AI正在从专业工具向日常办公工具的转变，可能会显著提升办公效率。',
          prediction: '这一举措可能会推动微软云服务收入增长，同时也会促使其他办公软件厂商加快AI整合步伐。'
        },
        sources: [
          { name: 'Microsoft News', url: 'https://news.microsoft.com', icon: '🪟' },
          { name: 'CNBC', url: 'https://cnbc.com', icon: '📺' }
        ],
        simpleSummary: '微软宣布将AI整合到所有Office应用中，推出Copilot Pro',
        simpleInterpretation: '微软将AI整合到Office应用中，标志着AI正在从专业工具向日常办公工具的转变。',
        simplePrediction: '这一举措可能会推动微软云服务收入增长。',
        jargonTips: [
          { term: 'Copilot Pro', explain: '微软推出的AI助手订阅服务，为Office应用提供高级AI功能，每月收费20美元。' },
          { term: 'AI整合', explain: '将人工智能技术融入到现有软件应用中，提升用户体验和工作效率。' }
        ],
        analogy: '把微软的AI整合比作「给Office应用装上了智能助手」，让你的办公软件变得像有一个专业助手在旁边帮你工作一样。',
        story: {
          before: '微软一直在探索AI技术在办公软件中的应用，之前已经在Word、Excel等应用中引入了一些AI功能。',
          after: '接下来你可能会看到更多AI功能在Office应用中的应用，让办公效率大幅提升。'
        },
        talking_point: '微软将AI整合到所有Office应用中，推出Copilot Pro订阅服务，标志着AI正在从专业工具向日常办公工具的转变。'
      },
      {
        id: 9,
        title: '美联储维持利率不变，暗示年内可能降息',
        summary: '美联储今日宣布维持当前利率不变，但暗示如果通胀持续下降，年内可能会开始降息。',
        category: 'finance',
        timeSlot: '02:00',
        tags: ['美联储', '利率', '货币政策'],
        ai_analysis: {
          interpretation: '美联储的决定显示出其对当前经济状况的谨慎乐观态度，同时也为未来的货币政策调整留下了空间。',
          prediction: '这一决定可能会对全球金融市场产生积极影响，推动股市上涨和债券收益率下降。'
        },
        sources: [
          { name: 'Wall Street Journal', url: 'https://wsj.com', icon: '📰' },
          { name: 'Bloomberg', url: 'https://bloomberg.com', icon: '📊' }
        ],
        simpleSummary: '美联储维持利率不变，暗示年内可能降息',
        simpleInterpretation: '美联储的决定显示出其对当前经济状况的谨慎乐观态度。',
        simplePrediction: '这一决定可能会对全球金融市场产生积极影响。',
        jargonTips: [
          { term: '美联储', explain: '美国联邦储备系统，负责制定和执行美国的货币政策，影响全球金融市场。' },
          { term: '降息', explain: '中央银行降低基准利率的行为，通常用于刺激经济增长。' }
        ],
        analogy: '把美联储的利率决定比作「经济的方向盘」，现在保持方向不变，但暗示未来可能会转向更宽松的方向。',
        story: {
          before: '美联储在过去几个月一直在与通胀作斗争，通过加息来控制物价上涨。',
          after: '接下来如果通胀持续下降，美联储可能会开始降息，这将对全球金融市场产生积极影响。'
        },
        talking_point: '美联储维持利率不变，但暗示年内可能降息，显示出其对当前经济状况的谨慎乐观态度。'
      },
      { id: 10,
        title: '中国发布新一轮人工智能产业支持政策',
        summary: '中国今日发布新一轮人工智能产业支持政策，包括财政补贴、税收优惠和研发支持，推动AI产业高质量发展。',
        category: 'international',
        timeSlot: '10:00',
        tags: ['中国', 'AI政策', '产业支持'],
        ai_analysis: {
          interpretation: '中国的新一轮AI产业支持政策显示出其对人工智能发展的高度重视，将为国内AI企业提供有力支持。',
          prediction: '这一政策可能会加速中国AI产业的发展，同时也会提升中国在全球AI领域的竞争力。'
        },
        sources: [
          { name: 'Xinhua', url: 'https://xinhuanet.com', icon: '📰' },
          { name: 'China Daily', url: 'https://chinadaily.com.cn', icon: '📚' }
        ],
        simpleSummary: '中国发布新一轮人工智能产业支持政策',
        simpleInterpretation: '中国的新一轮AI产业支持政策显示出其对人工智能发展的高度重视。',
        simplePrediction: '这一政策可能会加速中国AI产业的发展。',
        jargonTips: [
          { term: '人工智能产业', explain: '以人工智能技术为核心的产业生态，包括AI芯片、算法、应用等多个环节。' },
          { term: '产业支持政策', explain: '政府为促进特定产业发展而制定的优惠措施，如财政补贴、税收优惠等。' }
        ],
        analogy: '把中国的AI产业支持政策比作「AI发展的加速器」，为人工智能产业提供强大的动力和支持。',
        story: {
          before: '中国一直在积极推动人工智能技术的发展，已经在多个领域取得了显著成就。',
          after: '接下来中国的AI产业可能会迎来快速发展期，在全球AI竞争中占据更重要的地位。'
        },
        talking_point: '中国发布新一轮人工智能产业支持政策，包括财政补贴、税收优惠和研发支持，将推动AI产业高质量发展。'
      },
      { id: 11,
        title: '谷歌发布Gemini Ultra 2，多模态能力全面超越竞品',
        summary: '谷歌今日发布Gemini Ultra 2，在多模态理解、逻辑推理和创造力方面都有显著提升，性能全面超越GPT-4。',
        category: 'AI',
        timeSlot: '11:00',
        tags: ['谷歌', 'Gemini', '多模态'],
        ai_analysis: {
          interpretation: 'Gemini Ultra 2的发布标志着谷歌在AI领域的强势回归，其多模态能力将为各行各业带来新的应用场景。',
          prediction: '预计Gemini Ultra 2将在医疗、教育、创意等领域产生深远影响，同时也会引发更多关于AI伦理和监管的讨论。'
        },
        sources: [
          { name: 'Google Blog', url: 'https://blog.google', icon: '🖥️' },
          { name: 'The Verge', url: 'https://theverge.com', icon: '📱' }
        ],
        simpleSummary: '谷歌发布Gemini Ultra 2，多模态能力全面超越竞品',
        simpleInterpretation: 'Gemini Ultra 2的发布标志着谷歌在AI领域的强势回归。',
        simplePrediction: 'Gemini Ultra 2将在多个领域产生深远影响。',
        jargonTips: [
          { term: 'Gemini Ultra 2', explain: '谷歌开发的新一代大型语言模型，具有更强的多模态理解和生成能力。' },
          { term: '多模态', explain: '能够处理和理解多种类型的数据，如文本、图像、音频等。' }
        ],
        analogy: '把Gemini Ultra 2比作从「会说话的鹦鹉」进化成了「会思考的侦探」，不仅能模仿人类语言，还能主动分析问题、寻找线索。',
        story: {
          before: '谷歌一直在AI领域默默耕耘，之前的Gemini模型已经显示出强大的能力。',
          after: '接下来你可能会看到更多基于Gemini Ultra 2的创新应用，如更智能的语音助手和更强大的创意工具。'
        },
        talking_point: 'Gemini Ultra 2的出现意味着AI将从「工具」变成「助手」，未来我们可能不是在「用」软件，而是在「指挥」软件。'
      },
      { id: 12,
        title: '亚马逊发布Q3财报，AWS云业务收入同比增长12%',
        summary: '亚马逊今日发布2025财年Q3财报，AWS云业务收入同比增长12%，AI相关收入增长超过40%，超出市场预期。',
        category: 'finance',
        timeSlot: '14:30',
        tags: ['亚马逊', 'AWS', '财报'],
        ai_analysis: {
          interpretation: '亚马逊AWS云业务的增长显示出其在AI领域的战略布局正在取得成效，AI相关收入的快速增长尤为亮眼。',
          prediction: '这一财报可能会推动亚马逊股价上涨，同时也会增强投资者对云服务行业的信心。'
        },
        sources: [
          { name: 'Bloomberg', url: 'https://bloomberg.com', icon: '📊' },
          { name: 'CNBC', url: 'https://cnbc.com', icon: '📺' }
        ],
        simpleSummary: '亚马逊发布Q3财报，AWS云业务收入同比增长12%',
        simpleInterpretation: '亚马逊AWS云业务的增长显示出其在AI领域的战略布局正在取得成效。',
        simplePrediction: '这一财报可能会推动亚马逊股价上涨。',
        jargonTips: [
          { term: 'AWS', explain: '亚马逊云服务，全球领先的云计算平台，提供包括计算、存储、数据库等多种云服务。' },
          { term: 'Q3财报', explain: '第三季度财务报告，包含公司在该季度的收入、利润等财务数据。' }
        ],
        analogy: '把亚马逊AWS云业务的增长比作「春天的竹笋」，虽然增长速度不是很快，但在AI相关领域已经开始迅速发芽。',
        story: {
          before: '亚马逊一直在加大对AWS和AI技术的投入，希望在云服务市场保持领先地位。',
          after: '接下来亚马逊可能会继续加大AI相关业务的投入，推出更多AI驱动的云服务。'
        },
        talking_point: '亚马逊Q3财报显示AWS云业务收入增长12%，AI相关收入增长超过40%，显示出其在AI领域的战略布局正在取得成效。'
      },
      { id: 13,
        title: '特斯拉发布Cybertruck电动皮卡，起售价69900美元',
        summary: '特斯拉今日正式发布Cybertruck电动皮卡，起售价69900美元，采用不锈钢车身和防弹玻璃，续航里程可达500英里。',
        category: 'tech',
        timeSlot: '16:00',
        tags: ['特斯拉', 'Cybertruck', '电动皮卡'],
        ai_analysis: {
          interpretation: 'Cybertruck的发布标志着特斯拉在电动卡车领域的正式进入，其独特的设计和性能将为电动卡车市场带来新的竞争格局。',
          prediction: '预计Cybertruck将在北美市场取得成功，同时也会刺激其他汽车制造商加快电动卡车的研发和生产。'
        },
        sources: [
          { name: 'Tesla Blog', url: 'https://tesla.com/blog', icon: '🚗' },
          { name: 'CNBC', url: 'https://cnbc.com', icon: '📺' }
        ],
        simpleSummary: '特斯拉发布Cybertruck电动皮卡，起售价69900美元',
        simpleInterpretation: 'Cybertruck的发布标志着特斯拉在电动卡车领域的正式进入。',
        simplePrediction: 'Cybertruck将在北美市场取得成功，刺激其他制造商加快电动卡车的研发。',
        jargonTips: [
          { term: 'Cybertruck', explain: '特斯拉推出的电动皮卡，采用不锈钢车身和独特的未来主义设计。' },
          { term: '电动皮卡', explain: '以电力为动力的皮卡车，相比传统燃油皮卡更环保、更安静。' }
        ],
        analogy: '把Cybertruck比作「未来的移动堡垒」，不仅外观独特，而且性能强大，能够适应各种复杂路况。',
        story: {
          before: '特斯拉在2019年首次展示Cybertruck概念车，引起了广泛关注，但量产过程遇到了多次延迟。',
          after: '接下来你可能会看到越来越多的Cybertruck出现在道路上，成为特斯拉的又一热销车型。'
        },
        talking_point: '特斯拉Cybertruck的发布标志着电动皮卡时代的正式到来，其独特的设计和性能将改变人们对皮卡车的传统认知。'
      },
      { id: 14,
        title: '苹果宣布Vision Pro 2，重量减轻20%，续航提升30%',
        summary: '苹果今日宣布Vision Pro 2混合现实头显，重量减轻20%，续航提升30%，采用全新M3芯片，售价3499美元。',
        category: 'tech',
        timeSlot: '10:00',
        tags: ['苹果', 'Vision Pro', '混合现实'],
        ai_analysis: {
          interpretation: 'Vision Pro 2的发布体现了苹果在混合现实领域的持续投入，重量和续航的改进将显著提升用户体验。',
          prediction: '预计Vision Pro 2将推动混合现实市场的增长，同时也会促使其他厂商加快类似产品的研发。'
        },
        sources: [
          { name: 'Apple News', url: 'https://apple.com/newsroom', icon: '🍎' },
          { name: 'The Verge', url: 'https://theverge.com', icon: '📱' }
        ],
        simpleSummary: '苹果宣布Vision Pro 2，重量减轻20%，续航提升30%',
        simpleInterpretation: 'Vision Pro 2的发布体现了苹果在混合现实领域的持续投入。',
        simplePrediction: 'Vision Pro 2将推动混合现实市场的增长。',
        jargonTips: [
          { term: 'Vision Pro', explain: '苹果推出的混合现实头显，融合了增强现实和虚拟现实技术。' },
          { term: '混合现实', explain: '结合了增强现实和虚拟现实技术，能够在现实世界中叠加数字内容。' }
        ],
        analogy: '把Vision Pro 2比作「未来的眼镜」，不仅轻便舒适，而且能够为用户带来沉浸式的数字体验。',
        story: {
          before: '苹果在2023年发布了第一代Vision Pro，虽然技术先进，但重量和续航是用户反馈的主要问题。',
          after: '接下来你可能会看到更多基于Vision Pro 2的创新应用，如虚拟办公、沉浸式娱乐等。'
        },
        talking_point: '苹果Vision Pro 2的发布标志着混合现实技术的成熟，重量和续航的改进将使更多用户愿意尝试这一新兴技术。'
      },
      { id: 15,
        title: '微软收购Activision Blizzard完成，交易金额687亿美元',
        summary: '微软今日宣布完成对Activision Blizzard的收购，交易金额687亿美元，成为游戏行业历史上最大的收购案。',
        category: 'finance',
        timeSlot: '09:00',
        tags: ['微软', 'Activision Blizzard', '收购'],
        ai_analysis: {
          interpretation: '微软收购Activision Blizzard标志着其在游戏领域的重大布局，将为Xbox平台带来更多优质游戏内容。',
          prediction: '这一收购可能会改变游戏行业的竞争格局，同时也会推动微软游戏业务的增长。'
        },
        sources: [
          { name: 'Microsoft News', url: 'https://news.microsoft.com', icon: '🪟' },
          { name: 'Bloomberg', url: 'https://bloomberg.com', icon: '📊' }
        ],
        simpleSummary: '微软收购Activision Blizzard完成，交易金额687亿美元',
        simpleInterpretation: '微软收购Activision Blizzard标志着其在游戏领域的重大布局。',
        simplePrediction: '这一收购可能会改变游戏行业的竞争格局。',
        jargonTips: [
          { term: 'Activision Blizzard', explain: '全球领先的游戏开发商和发行商，拥有《使命召唤》、《魔兽世界》等知名游戏IP。' },
          { term: '收购', explain: '一家公司通过购买另一家公司的股权或资产，获得对其的控制权。' }
        ],
        analogy: '把微软收购Activision Blizzard比作「游戏帝国的扩张」，通过整合优质游戏内容，增强自己在游戏市场的竞争力。',
        story: {
          before: '微软在游戏领域一直有野心，之前已经收购了Bethesda等知名游戏公司。',
          after: '接下来你可能会看到更多Activision Blizzard的游戏登陆Xbox平台，同时微软也可能会加大对游戏订阅服务的投入。'
        },
        talking_point: '微软收购Activision Blizzard完成，标志着游戏行业进入了新的竞争阶段，大型科技公司对游戏市场的重视程度将进一步提高。'
      }
    ];
    
    // 为每条新闻添加详细信息
    return realNews.map(news => {
      const impact = this.calculateImpact(news);
      const sentiment = this.calculateSentiment(news);
      const debate = this.generateDebateData(news);
      
      // 分类图标和颜色映射
      const categoryConfig = {
        'AI': { icon: '🤖', color: '#A855F7' },
        'tech': { icon: '🚀', color: '#3B82F6' },
        'finance': { icon: '💰', color: '#F59E0B' },
        'international': { icon: '🌍', color: '#10B981' },
        'sports': { icon: '⚽', color: '#EF4444' }
      };
      
      const config = categoryConfig[news.category] || { icon: '📰', color: '#A855F7' };
      
      // 处理智能标签
      const smartTags = this.processSmartTags(news);
      
      // 为新闻添加关联信息
      const related = news.related || [
        'OpenAI 正式发布 GPT-5：迈向"自主决策"时代',
        '谷歌发布 Gemini Ultra 2，多模态能力全面超越竞品',
        'Meta发布Llama 4开源模型，性能媲美GPT-4'
      ];
      
      // 处理标签分类
      const categorizedTags = this.categorizeTags(news.tags || []);
      
      return {
        ...news,
        categoryIcon: config.icon,
        categoryColor: config.color,
        impactScore: impact.score,
        impactLevel: impact.level,
        impactLabel: impact.label,
        sentiment: sentiment.sentiment,
        sentimentLabel: sentiment.label,
        sentimentScore: 50 + Math.floor(Math.random() * 40), // 50-90之间的情绪分数
        smartTags,  // 添加智能标签
        categorizedTags,  // 分类后的标签
        showTagBubble: false,  // 标签气泡显示状态
        clickedTag: null,  // 被点击的标签
        related: related,
        relatedCount: related.length,
        debate,
        showDebate: false,
        userVote: null,
        showSummary: false,
        showSource: false,
        showCrossRef: false,
        showTags: false,
        showInterpret: false,
        showRipple: false,
        showPredict: false,
        showPersonal: false,
        showRelevance: false,
        personalAnalysis: null,
        analyzing: false,
        isDefaultRole: false,
        userRole: '',
        personalImpact: '',
        personalAction: '',
        personalTip: '',
        personalTimeline: '',
        // 命中关注和重要动态
        isFocused: false, // 初始化为false，后续会在applyFocusKeywords中更新
        isImportant: impact.score >= 8, // 影响分数>=8的新闻为重要动态
        // 小白模式数据结构（与情报中心保持一致）
        newbie: {
          simple_summary: news.newbie?.simple_summary || news.simpleSummary || news.summary,
          simple_interpretation: news.newbie?.simple_interpretation || news.simpleInterpretation || news.ai_analysis?.interpretation || '',
          simple_prediction: news.newbie?.simple_prediction || news.simplePrediction || news.ai_analysis?.prediction || '',
          jargon_tips: news.newbie?.jargon_tips || news.jargonTips || news.jargon_tips || [],
          analogy: news.newbie?.analogy || news.analogy || '',
          story: news.newbie?.story || news.story || {},
          talking_point: news.newbie?.talking_point || news.talking_point || news.talkingPoint || '',
          // 新增字段
          before_after: news.newbie?.before_after || news.before_after || {
            before: '以前我们需要手动完成这项任务，花费大量时间和精力。',
            after: '现在有了这项技术，我们可以快速高效地完成，节省时间和成本。'
          },
          talking_points: news.newbie?.talking_points || news.talking_points || [
            '专业风：这项技术的突破将为行业带来革命性的变化，推动产业升级。',
            '幽默风：以前做这件事像爬楼梯，现在就像坐电梯，速度快到飞起！',
            '深刻风：技术的进步不仅改变了我们的工作方式，更改变了我们思考问题的角度。'
          ],
          tutor_questions: news.newbie?.tutor_questions || news.tutor_questions || [
            { q: '这会让我失业吗？', a: '不会，这项技术会帮助你更高效地完成工作，让你有更多时间专注于创造性任务。' },
            { q: '我该怎么用它赚钱？', a: '你可以利用这项技术提高工作效率，或者开发基于它的新服务，为他人解决问题。' },
            { q: '它有没有安全风险？', a: '任何技术都有潜在风险，但只要合理使用并遵循最佳实践，风险是可以控制的。' }
          ],
          pros_cons_simple: news.newbie?.pros_cons_simple || news.pros_cons_simple || {
            winners: ['科技行业从业者', '创新者', '效率追求者'],
            losers: ['传统行业守旧者', '不愿意学习新技术的人']
          },
          verdict_emoji: news.newbie?.verdict_emoji || news.verdict_emoji || '🚀 冲刺时刻'
        },
        // 脱水模式字段
        dehydrated: news.dehydrated || this.generateDehydratedText(news),
        published_at: `${dateStr} ${news.timeSlot || '08:00'}`
      };
    });
  },

  // 更新显示的新闻（分页）
  updateDisplayedNews() {
    const { filteredNews, pageSize, currentPage } = this.data;
    const displayedNews = filteredNews.slice(0, pageSize * currentPage);
    const hasMore = displayedNews.length < filteredNews.length;
    this.setData({ displayedNews, hasMore });
  },

  // 加载更多新闻
  loadMoreNews() {
    if (this.data.loadingMore || !this.data.hasMore) return;
    
    this.setData({ loadingMore: true });
    
    setTimeout(() => {
      const { filteredNews, pageSize, currentPage } = this.data;
      const newPage = currentPage + 1;
      const displayedNews = filteredNews.slice(0, pageSize * newPage);
      const hasMore = displayedNews.length < filteredNews.length;
      
      this.setData({
        currentPage: newPage,
        displayedNews,
        hasMore,
        loadingMore: false
      });
      
      wx.showToast({ 
        title: `已加载 ${displayedNews.length}/${filteredNews.length} 条`, 
        icon: 'none' 
      });
    }, 500);
  },

  calculateImpact(news) {
    let score = 5;
    const title = news.title;
    const highWords = ['突破', '首次', '重大', '历史', '全球', '革命', '夺冠'];
    const medWords = ['发布', '升级', '增长', '创新', '获胜'];
    
    highWords.forEach(w => { if (title.includes(w)) score += 1.5; });
    medWords.forEach(w => { if (title.includes(w)) score += 0.5; });
    if (news.category === 'AI') score += 1;
    
    score = Math.min(10, Math.max(1, Math.round(score)));
    
    return {
      score,
      level: score >= 8 ? 'high' : score >= 5 ? 'medium' : 'low',
      label: score >= 8 ? '行业巨震' : score >= 5 ? '重要动态' : '常规更新'
    };
  },

  calculateSentiment(news) {
    const title = news.title + (news.summary || '');
    const positive = ['突破', '增长', '成功', '领先', '创新', '上涨', '利好', '夺冠', '获胜'];
    const negative = ['下跌', '风险', '危机', '下降', '失败', '利空', '警告'];
    
    let pScore = 0, nScore = 0;
    positive.forEach(w => { if (title.includes(w)) pScore++; });
    negative.forEach(w => { if (title.includes(w)) nScore++; });
    
    if (pScore > nScore) return { sentiment: 'positive', label: '乐观' };
    if (nScore > pScore) return { sentiment: 'negative', label: '审慎' };
    return { sentiment: 'neutral', label: '中性' };
  },

  calculateUrgency(impactScore, sentiment) {
    if (impactScore >= 8) {
      return 'high';
    } else if (impactScore >= 5) {
      return 'medium';
    } else {
      return 'low';
    }
  },

  calculateAudience(news, impactScore) {
    const category = news.category || 'AI';
    const audienceMap = {
      'AI': {
        primary: 'AI从业者',
        secondary: ['科技爱好者', '投资者', '企业决策者'],
        reach: 'global'
      },
      'tech': {
        primary: '科技爱好者',
        secondary: ['开发者', '产品经理', '投资者'],
        reach: 'national'
      },
      'finance': {
        primary: '投资者',
        secondary: ['企业决策者', '金融从业者', '分析师'],
        reach: 'national'
      },
      'international': {
        primary: '国际关注者',
        secondary: ['政策研究者', '企业决策者', '媒体工作者'],
        reach: 'global'
      },
      'sports': {
        primary: '体育爱好者',
        secondary: ['运动员', '教练', '体育产业从业者'],
        reach: 'national'
      }
    };
    
    return audienceMap[category] || {
      primary: '一般受众',
      secondary: ['新闻读者'],
      reach: 'regional'
    };
  },

  calculateRelevance(news, impactScore) {
    const userPreferences = wx.getStorageSync('userPreferences') || {};
    const { interestTags = [], focusKeywords = [] } = userPreferences;
    
    let relevanceScore = 0;
    
    if (interestTags.length > 0) {
      const matchedTags = news.tags ? news.tags.filter(tag => interestTags.includes(tag)) : [];
      relevanceScore += matchedTags.length * 2;
    }
    
    if (focusKeywords.length > 0) {
      const matchedKeywords = focusKeywords.filter(keyword => 
        news.title.includes(keyword) || (news.summary && news.summary.includes(keyword))
      );
      relevanceScore += matchedKeywords.length * 3;
    }
    
    if (impactScore >= 8) {
      relevanceScore += 3;
    } else if (impactScore >= 5) {
      relevanceScore += 2;
    } else {
      relevanceScore += 1;
    }
    
    const maxScore = Math.max(10, interestTags.length * 2 + focusKeywords.length * 3 + 3);
    const normalizedScore = Math.round((relevanceScore / maxScore) * 10);
    
    return {
      personal: normalizedScore >= 7 ? 'high' : normalizedScore >= 4 ? 'medium' : 'low',
      business: normalizedScore >= 6 ? 'high' : normalizedScore >= 3 ? 'medium' : 'low',
      investor: normalizedScore >= 8 ? 'high' : normalizedScore >= 5 ? 'medium' : 'low'
    };
  },

  // 生成AI解读和预测
  generateAIAnalysis(news, sentimentResult, impactResult) {
    const category = news.category || 'AI';
    const title = news.title || '';
    const summary = news.summary || '';
    
    // 根据分类生成不同风格的解读
    const categoryTemplates = {
      'AI': {
        interpretation: `这条AI领域的新闻反映了人工智能技术的最新进展。${sentimentResult.sentiment === 'positive' ? '整体趋势积极，' : sentimentResult.sentiment === 'negative' ? '需要关注潜在风险，' : ''}影响力评分${impactResult.score}分，${impactResult.label}。`,
        prediction: `预计这一发展将对AI行业产生${impactResult.level === 'high' ? '重大' : impactResult.level === 'medium' ? '一定' : '有限'}影响，相关企业和从业者需要密切关注后续动态。`
      },
      'tech': {
        interpretation: `科技领域的这一动态值得关注。${sentimentResult.sentiment === 'positive' ? '市场反应积极，' : sentimentResult.sentiment === 'negative' ? '存在一定不确定性，' : ''}影响力评分${impactResult.score}分。`,
        prediction: `这一技术进展可能在未来${impactResult.level === 'high' ? '3-6个月' : '6-12个月'}内产生实质性影响，建议持续跟踪。`
      },
      'finance': {
        interpretation: `财经市场的这一消息${sentimentResult.sentiment === 'positive' ? '释放积极信号' : sentimentResult.sentiment === 'negative' ? '需要谨慎对待' : '影响中性'}。影响力评分${impactResult.score}分，${impactResult.label}。`,
        prediction: `从市场角度看，这一事件可能对相关板块产生${impactResult.level === 'high' ? '显著' : '一定程度的'}波动，投资者需注意风险。`
      },
      'international': {
        interpretation: `国际局势的这一变化${sentimentResult.sentiment === 'positive' ? '有利于全球稳定' : sentimentResult.sentiment === 'negative' ? '增加了不确定性' : '影响有待观察'}。影响力评分${impactResult.score}分。`,
        prediction: `预计这一事件将在国际关系和全球市场层面产生${impactResult.level === 'high' ? '深远' : '一定'}影响。`
      },
      'sports': {
        interpretation: `体育领域的这一消息${sentimentResult.sentiment === 'positive' ? '令人振奋' : sentimentResult.sentiment === 'negative' ? '引发关注' : '值得关注'}。影响力评分${impactResult.score}分。`,
        prediction: `这一事件可能对相关体育产业和粉丝群体产生${impactResult.level === 'high' ? '重大' : '一定'}影响。`
      }
    };
    
    const template = categoryTemplates[category] || categoryTemplates['AI'];
    
    return {
      interpretation: template.interpretation,
      prediction: template.prediction
    };
  },

  generateNewsData() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // 分类图标和颜色映射
    const categoryConfig = {
      'AI': { icon: '🤖', color: '#A855F7' },
      'tech': { icon: '🚀', color: '#3B82F6' },
      'finance': { icon: '💰', color: '#F59E0B' },
      'international': { icon: '🌍', color: '#10B981' },
      'sports': { icon: '⚽', color: '#EF4444' }
    };
    
    // 使用日期作为种子，确保同一天生成相同的新闻，不同天生成不同新闻
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    // 从新闻库中根据日期选择新闻
    const rawNews = this.selectDailyNews(dateSeed, dateStr);
    
    return rawNews.map(news => {
      const impact = this.calculateImpact(news);
      const sentiment = this.calculateSentiment(news);
      const debate = this.generateDebateData(news);
      const config = categoryConfig[news.category] || { icon: '📰', color: '#A855F7' };
      
      // 处理智能标签
      const smartTags = this.processSmartTags(news);
      
      // 为新闻添加关联信息
      const related = news.related || [
        'OpenAI 正式发布 GPT-5：迈向"自主决策"时代',
        '谷歌发布 Gemini Ultra 2，多模态能力全面超越竞品',
        'Meta发布Llama 4开源模型，性能媲美GPT-4'
      ];
      
      // 处理标签分类
      const categorizedTags = this.categorizeTags(news.tags || []);
      
      return {
        ...news,
        categoryIcon: config.icon,
        categoryColor: config.color,
        impactScore: impact.score,
        impactLevel: impact.level,
        impactLabel: impact.label,
        sentiment: sentiment.sentiment,
        sentimentLabel: sentiment.label,
        sentimentScore: 50 + Math.floor(Math.random() * 40), // 50-90之间的情绪分数
        smartTags,  // 添加智能标签
        categorizedTags,  // 分类后的标签
        showTagBubble: false,  // 标签气泡显示状态
        clickedTag: null,  // 被点击的标签
        related: related,
        relatedCount: related.length,
        debate,
        showDebate: false,
        userVote: null,
        showSummary: false,
        showSource: false,
        showCrossRef: false,
        showTags: false,
        showInterpret: false,
        showRipple: false,
        showPredict: false,
        showPersonal: false,
        showRelevance: false,
        personalAnalysis: null,
        analyzing: false,
        isDefaultRole: false,
        userRole: '',
        personalImpact: '',
        personalAction: '',
        personalTip: '',
        personalTimeline: '',
        // 命中关注和重要动态
        isFocused: false, // 初始化为false，后续会在applyFocusKeywords中更新
        isImportant: impact.score >= 8, // 影响分数>=8的新闻为重要动态
        // 小白模式数据结构（与情报中心保持一致）
        newbie: {
          simple_summary: news.newbie?.simple_summary || news.simpleSummary || news.summary,
          simple_interpretation: news.newbie?.simple_interpretation || news.simpleInterpretation || news.ai_analysis?.interpretation || '',
          simple_prediction: news.newbie?.simple_prediction || news.simplePrediction || news.ai_analysis?.prediction || '',
          jargon_tips: news.newbie?.jargon_tips || news.jargonTips || news.jargon_tips || [],
          analogy: news.newbie?.analogy || news.analogy || '',
          story: news.newbie?.story || news.story || {},
          talking_point: news.newbie?.talking_point || news.talking_point || news.talkingPoint || '',
          // 新增字段
          before_after: news.newbie?.before_after || news.before_after || {
            before: '以前我们需要手动完成这项任务，花费大量时间和精力。',
            after: '现在有了这项技术，我们可以快速高效地完成，节省时间和成本。'
          },
          talking_points: news.newbie?.talking_points || news.talking_points || [
            '专业风：这项技术的突破将为行业带来革命性的变化，推动产业升级。',
            '幽默风：以前做这件事像爬楼梯，现在就像坐电梯，速度快到飞起！',
            '深刻风：技术的进步不仅改变了我们的工作方式，更改变了我们思考问题的角度。'
          ],
          tutor_questions: news.newbie?.tutor_questions || news.tutor_questions || [
            { q: '这会让我失业吗？', a: '不会，这项技术会帮助你更高效地完成工作，让你有更多时间专注于创造性任务。' },
            { q: '我该怎么用它赚钱？', a: '你可以利用这项技术提高工作效率，或者开发基于它的新服务，为他人解决问题。' },
            { q: '它有没有安全风险？', a: '任何技术都有潜在风险，但只要合理使用并遵循最佳实践，风险是可以控制的。' }
          ],
          pros_cons_simple: news.newbie?.pros_cons_simple || news.pros_cons_simple || {
            winners: ['科技行业从业者', '创新者', '效率追求者'],
            losers: ['传统行业守旧者', '不愿意学习新技术的人']
          },
          verdict_emoji: news.newbie?.verdict_emoji || news.verdict_emoji || '🚀 冲刺时刻'
        },
        // 脱水模式字段
        dehydrated: news.dehydrated || this.generateDehydratedText(news)
      };
    });
  },

  // 根据日期种子选择当天的新闻
  selectDailyNews(seed, dateStr) {
    const allNews = this.getNewsLibrary(dateStr);
    
    // 简单的伪随机选择，同一天选择相同的新闻组合
    const shuffled = this.seededShuffle(allNews, seed);
    
    // 每天选择45-50条新闻
    const count = Math.min(allNews.length, 45 + (seed % 6));
    return shuffled.slice(0, count);
  },

  // 带种子的洗牌算法，确保同一种子产生相同结果
  seededShuffle(array, seed) {
    const arr = [...array];
    let currentSeed = seed;
    
    const random = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
    
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },
  
  // 标签分类函数
  categorizeTags(tags) {
    const categorized = {
      nature: [],  // 情报性质标签
      entity: [],  // 主体标签
      category: [] // 领域标签
    };
    
    // 情报性质标签关键词
    const natureKeywords = ['信号', '预警', '预测', '传闻'];
    
    // 主体标签关键词
    const entityKeywords = ['公司', '集团', '股份', '有限公司', 'Inc', 'Corp', 'Group', 'CEO', '董事长', '创始人', '总裁', '负责人', '经理'];
    
    // 常见公司名称
    const companyNames = ['荣耀', '瑞声科技', '苹果', '谷歌', '微软', 'Meta', 'OpenAI', '百度', '阿里巴巴', '腾讯', '华为', '小米', '特斯拉', '英伟达', 'AMD', 'Intel'];
    
    // 确保tags是数组
    if (!Array.isArray(tags)) {
      console.log('Tags is not an array:', tags);
      return categorized;
    }
    
    tags.forEach(tag => {
      const tagLower = tag.toLowerCase();
      
      // 检查是否是情报性质标签
      const isNatureTag = natureKeywords.some(keyword => tagLower.includes(keyword.toLowerCase()));
      if (isNatureTag) {
        categorized.nature.push(tag);
        return;
      }
      
      // 检查是否是主体标签（公司或人名）
      const isEntityTag = entityKeywords.some(keyword => tagLower.includes(keyword.toLowerCase())) || 
                         companyNames.some(company => tagLower.includes(company.toLowerCase()));
      if (isEntityTag) {
        categorized.entity.push(tag);
        return;
      }
      
      // 默认为领域标签
      categorized.category.push(tag);
    });
    
    console.log('Categorized tags:', categorized);
    return categorized;
  },
  
  // 标签点击事件处理
  onTagTap(e) {
    wx.vibrateShort({ type: 'light' });
    const { tag, type } = e.currentTarget.dataset;
    
    if (type === 'entity') {
      // 点击主体标签，显示实体的近期动态简报
      wx.showModal({
        title: `${tag} 近期动态`,
        content: `已为你整理 ${tag} 的近期动态简报，包含 12 条相关情报。`,
        confirmText: '查看详情',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 这里可以实现查看详情功能
            wx.showToast({
              title: `正在加载 ${tag} 的详细信息`,
              icon: 'loading'
            });
          }
        }
      });
    } else {
      // 点击其他标签，显示筛选结果
      wx.showModal({
        title: `标签: ${tag}`,
        content: `已为你筛选出 12 条相关情报，是否开启长期追踪？`,
        confirmText: '开启追踪',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 这里可以实现追踪功能
            wx.showToast({
              title: `已开启 ${tag} 的长期追踪`,
              icon: 'success'
            });
          }
        }
      });
    }
  },
  
  // 标签长按事件处理
  onTagLongPress(e) {
    wx.vibrateShort({ type: 'light' });
    const { tag, type } = e.currentTarget.dataset;
    
    // 长按标签，触发追踪功能
    wx.showModal({
      title: `追踪标签: ${tag}`,
      content: `App 将在未来 7 天内，一旦有该标签的重大信号，立即通过系统推送告知。`,
      confirmText: '开启追踪',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 这里可以实现追踪功能
          wx.showToast({
            title: `已开启 ${tag} 的长期追踪`,
            icon: 'success'
          });
        }
      }
    });
  },

  // 新闻素材库 - 包含大量可轮换的新闻模板
  getNewsLibrary(dateStr) {
    // 引入新闻库
    const newsLibrary = require('../../data/news_library.js');
    
    // 合并所有分类的新闻
    const allNews = [];
    const categories = ['AI', 'tech', 'finance', 'international', 'sports'];
    
    categories.forEach(cat => {
      if (newsLibrary[cat]) {
        newsLibrary[cat].forEach(news => {
          // 如果新闻库中没有sources，动态生成
          if (!news.sources) {
            const sources = this.generateSourcesForNews(news);
            allNews.push({
              ...news,
              sources: sources,
              category: cat === 'AI' ? 'AI' : cat,
              showTimeline: false,
              showCrossRef: false,
              showCounterView: false,
              isFavorited: false
            });
          } else {
            allNews.push({
              ...news,
              category: cat === 'AI' ? 'AI' : cat,
              showTimeline: false,
              showCrossRef: false,
              showCounterView: false,
              isFavorited: false
            });
          }
        });
      }
    });
    
    // 为每条新闻添加当天日期和唯一ID
    return allNews.map((news, index) => ({
      ...news,
      id: index + 1,
      published_at: `${dateStr} ${news.timeSlot || '08:00'}`
    }));
  },



  generateDebateData(news) {
    const proWeight = 60 + Math.floor(Math.random() * 30);
    const conWeight = 100 - proWeight;
    
    const proPoints = [
      '技术突破显著，性能提升明显',
      '市场需求旺盛，应用场景广泛',
      '产业链成熟，成本持续下降',
      '政策支持力度大，发展环境良好',
      '国际竞争力强，出口增长迅速'
    ];
    
    const conPoints = [
      '技术风险较高，存在不确定性',
      '成本投入巨大，回报周期长',
      '市场竞争激烈，盈利压力增大',
      '监管政策趋严，合规成本上升',
      '替代技术出现，存在被淘汰风险'
    ];
    
    const selectedProPoints = proPoints
      .sort(() => Math.random() - 0.5)
      .slice(0, 2 + Math.floor(Math.random() * 2));
    
    const selectedConPoints = conPoints
      .sort(() => Math.random() - 0.5)
      .slice(0, 2 + Math.floor(Math.random() * 2));
    
    return {
      pro: {
        title: '正方核心观点',
        points: selectedProPoints,
        weight: proWeight
      },
      con: {
        title: '反方核心观点',
        points: selectedConPoints,
        weight: conWeight
      },
      verdict: `AI总结：双方争论的焦点在于${news.title.slice(0, 10)}...的落地成本，目前${proWeight > conWeight ? '正方' : '反方'}证据更充分。`,
      userVotes: {
        pro: 0,
        con: 0
      }
    };
  },

  filterByCategory(news, category) {
    if (category === 'all') return news;
    return news.filter(n => n.category === category);
  },

  selectCategory(e) {
    wx.vibrateShort({ type: 'light' });
    const category = e.currentTarget.dataset.category;
    this.setData({ currentCategory: category });
    
    let filtered = this.data.newsData;
    
    // 热门筛选
    if (category === 'hot') {
      filtered = filtered.filter(n => n.impactScore >= 8);
    } 
    // 关注筛选
    else if (category === 'focus') {
      filtered = filtered.filter(n => n.isFocused);
    }
    // 分类筛选
    else if (category !== 'all') {
      filtered = filtered.filter(n => n.category === category);
    }
    
    this.setData({ 
      filteredNews: filtered,
      currentPage: 1
    });
    this.updateDisplayedNews();
    
    // 重新应用关注词和AI人设
    this.applyFocusKeywords();
    this.applyAiPersonaStyle();
    this.applyAiInstructionReasons();
  },

  getCategoryName(category) {
    const map = { 
      'AI': 'AI 动态', 
      'tech': '科技前沿', 
      'finance': '商业财经', 
      'international': '国际要闻',
      'sports': '体育竞技'
    };
    return map[category] || category;
  },

  toggleTimeline(e) {
    const id = e.currentTarget.dataset.id;
    const filteredNews = this.data.filteredNews.map(n => n.id === id ? { ...n, showTimeline: !n.showTimeline } : n);
    this.setData({ filteredNews });
  },

  toggleCrossRef(e) {
    const id = e.currentTarget.dataset.id;
    const filteredNews = this.data.filteredNews.map(n => n.id === id ? { ...n, showCrossRef: !n.showCrossRef } : n);
    this.setData({ filteredNews });
  },

  toggleCounterView(e) {
    const id = e.currentTarget.dataset.id;
    const filteredNews = this.data.filteredNews.map(n => n.id === id ? { ...n, showCounterView: !n.showCounterView } : n);
    this.setData({ filteredNews });
  },

  toggleDebate(e) {
    const id = e.currentTarget.dataset.id;
    const filteredNews = this.data.filteredNews.map(n => n.id === id ? { ...n, showDebate: !n.showDebate } : n);
    this.setData({ filteredNews });
  },

  toggleSection(e) {
    const { id, section } = e.currentTarget.dataset;
    const news = this.data.filteredNews.find(n => n.id === id);
    if (!news) return;
    
    const sectionMap = {
      'summary': 'showSummary',
      'source': 'showSource',
      'cross': 'showCrossRef',
      'tags': 'showTags',
      'interpret': 'showInterpret',
      'ripple': 'showRipple',
      'predict': 'showPredict',
      'personal': 'showPersonal',
      'debate': 'showDebate',
      'related': 'showRelated',
      'timeline': 'showTimeline',
      'logic': 'showLogic',
      'reading': 'showReading',
      'relatedInfo': 'showRelatedInfo',
      'knowledge': 'showKnowledge',
      'dataSources': 'showDataSources',
      'verification': 'showVerification',
      'recommend': 'showRecommend'
    };
    
    const filteredNews = this.data.filteredNews.map(n => 
      n.id === id ? { ...n, [sectionMap[section]]: !n[sectionMap[section]] } : n
    );
    this.setData({ filteredNews });
  },

  voteDebate(e) {
    wx.vibrateShort({ type: 'light' });
    const { id, side } = e.currentTarget.dataset;
    const news = this.data.filteredNews.find(n => n.id === id);
    if (!news || !news.debate) return;
    
    const userVote = side;
    const updatedDebate = { ...news.debate };
    
    if (side === 'pro') {
      updatedDebate.userVotes.pro = Math.min(100, updatedDebate.userVotes.pro + 10);
      updatedDebate.userVotes.con = Math.max(0, updatedDebate.userVotes.con - 5);
    } else {
      updatedDebate.userVotes.con = Math.min(100, updatedDebate.userVotes.con + 10);
      updatedDebate.userVotes.pro = Math.max(0, updatedDebate.userVotes.pro - 5);
    }
    
    const filteredNews = this.data.filteredNews.map(n => 
      n.id === id ? { ...n, debate: updatedDebate, userVote } : n
    );
    
    this.setData({ filteredNews });
    
    const aiWeight = side === 'pro' ? news.debate.pro.weight : news.debate.con.weight;
    const userWeight = side === 'pro' ? updatedDebate.userVotes.pro : updatedDebate.userVotes.con;
    
    if (userWeight > aiWeight) {
      wx.showToast({
        title: '你选择了一个更具挑战性的视角，看看AI为什么觉得反向逻辑更重？',
        icon: 'none',
        duration: 3000
      });
    } else {
      wx.showToast({
        title: side === 'pro' ? '支持正方' : '支持反方',
        icon: 'success'
      });
    }
  },

  openSource(e) {
    wx.vibrateShort({ type: 'light' });
    const url = e.currentTarget.dataset.url;
    if (url) {
      wx.setClipboardData({
        data: url,
        success: () => wx.showToast({ title: '链接已复制', icon: 'success' })
      });
    }
  },

  /**
   * 打开分析详情页面
   */
  openAnalysisDetail(e) {
    wx.vibrateShort({ type: 'light' });
    const { id, type } = e.currentTarget.dataset;
    
    // 根据类型跳转到不同的分析页面
    const pageMap = {
      'essentials': '/pages/seven-elements/seven-elements',
      'relevance': '/pages/relevance-analysis/relevance-analysis',
      'extended': '/pages/deep-exploration/deep-exploration'
    };
    
    const pagePath = pageMap[type];
    if (pagePath) {
      wx.navigateTo({
        url: `${pagePath}?id=${id}`
      });
    } else {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      });
    }
  },

  /**
   * 关闭分析详情弹窗
   */
  closeAnalysisModal(e) {
    wx.vibrateShort({ type: 'light' });
    const { id } = e.currentTarget.dataset;
    
    const displayedNews = this.data.displayedNews.map(news => 
      news.id === id ? {
        ...news,
        showEssentialsModal: false,
        showRelevanceModal: false,
        showExtendedModal: false
      } : news
    );
    
    this.setData({ displayedNews });
  },

  /**
   * // 阻止事件冒泡
  stopPropagation() {
    // 阻止事件冒泡，防止点击弹窗内容时关闭弹窗
  },

  // 震动反馈函数
  triggerHapticFeedback() {
    // 检查设备是否支持震动
    if (wx.canIUse('vibrateShort')) {
      wx.vibrateShort({
        type: 'light', // 轻微震动
        success: function() {},
        fail: function() {
          console.log('震动失败');
        }
      });
    }
  },

  // 收藏专业术语到我的词库
  collectJargon() {
    wx.vibrateShort({ type: 'light' });
    const { currentJargon } = this.data;
    if (!currentJargon || !currentJargon.term || !currentJargon.explain) {
      return;
    }

    try {
      // 获取已收藏的词库
      const myJargonList = wx.getStorageSync('myJargonList') || [];

      // 检查是否已经收藏过
      const isAlreadyCollected = myJargonList.some(item => item.term === currentJargon.term);
      if (isAlreadyCollected) {
        wx.showToast({
          title: '该术语已在词库中',
          icon: 'none'
        });
        return;
      }

      // 添加到词库
      const newJargon = {
        term: currentJargon.term,
        explain: currentJargon.explain,
        collectedAt: new Date().toISOString()
      };

      myJargonList.push(newJargon);
      wx.setStorageSync('myJargonList', myJargonList);

      wx.showToast({
        title: '已收藏到我的词库',
        icon: 'success'
      });
    } catch (error) {
      console.error('收藏术语失败:', error);
      wx.showToast({
        title: '收藏失败，请重试',
        icon: 'none'
      });
    }
  },

  onRoleInput(e) {
    const id = e.currentTarget.dataset.id;
    const value = e.detail.value;
    const filteredNews = this.data.filteredNews.map(n => n.id === id ? { ...n, userRole: value } : n);
    this.setData({ filteredNews });
  },

  analyzePersonalImpact(e) {
    const news = e.currentTarget.dataset.news;
    const userRole = news.userRole || '';
    
    if (!userRole.trim()) {
      wx.showToast({ title: '请先输入你的职业或关注点', icon: 'none' });
      return;
    }
    
    const filteredNews = this.data.filteredNews.map(n => 
      n.id === news.id ? { ...n, analyzing: true } : n
    );
    this.setData({ filteredNews });
    
    this.generatePersonalAnalysis(news, userRole);
  },

  selectPresetRole(e) {
    const { id, role } = e.currentTarget.dataset;
    const news = this.data.filteredNews.find(n => n.id === id);
    if (!news) return;
    
    const filteredNews = this.data.filteredNews.map(n => 
      n.id === id ? { ...n, userRole: role } : n
    );
    this.setData({ filteredNews });
  },

  generatePersonalAnalysis(news, userRole) {
    const newsContent = `${news.title} ${news.summary || ''}`;
    
    const mockAnalysis = {
      personalImpact: `作为${userRole}，这条新闻将直接影响你的日常工作和决策。${this.getRoleSpecificImpact(news, userRole)}`,
      personalAction: this.getRoleSpecificAction(news, userRole),
      personalTip: this.getRoleSpecificTip(news, userRole),
      personalTimeline: this.getRoleSpecificTimeline(news, userRole)
    };
    
    setTimeout(() => {
      const filteredNews = this.data.filteredNews.map(n => 
        n.id === news.id ? { ...n, ...mockAnalysis, analyzing: false } : n
      );
      this.setData({ filteredNews });
      
      this.checkDefaultRole(news.id, userRole);
    }, 1500);
  },

  getRoleSpecificImpact(news, role) {
    const impacts = {
      '教师': '教育政策的变化可能影响你的教学计划和课程安排，需要提前准备新的教学材料。',
      '程序员': '技术突破可能改变你的开发工具和工作流程，建议关注相关技术栈的更新。',
      '投资者': '市场动态直接影响你的投资组合，建议重新评估相关资产配置和风险敞口。',
      '管理者': '行业趋势影响你的战略决策，需要调整团队目标和资源分配计划。',
      '学生': '就业市场变化影响你的职业规划，建议关注新兴技能和实习机会。'
    };
    return impacts[role] || '这条新闻对你有重要影响，建议关注相关动态。';
  },

  getRoleSpecificAction(news, role) {
    const actions = {
      '教师': '建议在下周课程中引入相关案例，帮助学生理解这一变化。',
      '程序员': '建议评估现有项目的技术债务，考虑是否需要升级相关技能。',
      '投资者': '建议咨询财务顾问，评估是否需要调整投资策略。',
      '管理者': '建议召开团队会议，讨论如何应对这一变化。',
      '学生': '建议选修相关课程，提升在这个领域的竞争力。'
    };
    return actions[role] || '建议持续关注相关新闻，及时调整个人规划。';
  },

  getRoleSpecificTip(news, role) {
    const tips = {
      '教师': '不要急于改变教学计划，先观察政策具体实施细则。',
      '程序员': '避免盲目跟风新技术，先评估与现有项目的兼容性。',
      '投资者': '警惕短期市场波动，关注长期价值而非短期涨跌。',
      '管理者': '保持团队沟通透明，避免因信息不对称导致决策失误。',
      '学生': '关注官方解读和权威分析，避免被片面信息误导。'
    };
    return tips[role] || '建议从多个渠道获取信息，形成独立判断。';
  },

  getRoleSpecificTimeline(news, role) {
    const timelines = {
      '教师': '3个月内',
      '程序员': '即刻',
      '投资者': '即刻',
      '管理者': '3个月内',
      '学生': '1年以上'
    };
    return timelines[role] || '3个月内';
  },

  checkDefaultRole(newsId, userRole) {
    const defaultRole = wx.getStorageSync('defaultUserRole') || '';
    
    if (defaultRole === userRole) {
      const filteredNews = this.data.filteredNews.map(n => 
        n.id === newsId ? { ...n, isDefaultRole: true } : n
      );
      this.setData({ filteredNews });
    } else {
      setTimeout(() => {
        wx.showModal({
          title: '设为默认身份',
          content: `是否将"${userRole}"设为你的默认身份？下次打开新闻卡片时将自动使用。`,
          confirmText: '确认',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              wx.setStorageSync('defaultUserRole', userRole);
              const filteredNews = this.data.filteredNews.map(n => 
                n.id === newsId ? { ...n, isDefaultRole: true } : n
              );
              this.setData({ filteredNews });
              wx.showToast({ title: '已设置', icon: 'success' });
            }
          }
        });
      }, 500);
    }
  },

  setDefaultRole(e) {
    const id = e.currentTarget.dataset.id;
    const news = this.data.filteredNews.find(n => n.id === id);
    if (!news || !news.userRole) return;
    
    wx.setStorageSync('defaultUserRole', news.userRole);
    wx.showToast({ title: '已设为默认身份', icon: 'success' });
  },

  resetPersonalAnalysis(e) {
    const id = e.currentTarget.dataset.id;
    const filteredNews = this.data.filteredNews.map(n => 
      n.id === id ? { ...n, personalAnalysis: null, isDefaultRole: false } : n
    );
    this.setData({ filteredNews });
  },

  toggleFavorite(e) {
    const news = e.currentTarget.dataset.news;
    const filteredNews = this.data.filteredNews.map(n => n.id === news.id ? { ...n, isFavorited: !n.isFavorited } : n);
    this.setData({ filteredNews });
    const isFav = filteredNews.find(n => n.id === news.id).isFavorited;
    wx.showToast({ title: isFav ? '已收藏' : '已取消', icon: 'success' });
  },

  showSharePoster(e) {
    const news = e.currentTarget.dataset.news;
    if (!news) return
    const poster = require('../../utils/poster.js')
    poster.generate(news, this).then(path => {
      poster.saveToAlbum(path)
    }).catch(err => {
      wx.showToast({ title: err.message || '生成失败', icon: 'none' })
    })
  },
    
    console.log('开始生成海报，新闻数据:', news);
    wx.showLoading({ title: '生成中...' });

    // 延迟执行，确保DOM已经渲染
    setTimeout(() => {
      const query = wx.createSelectorQuery();
      query.select('#posterCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (!res || !res[0]) {
            console.error('Canvas未找到，res:', res);
            wx.hideLoading();
            wx.showToast({ title: 'Canvas未找到', icon: 'none' });
            return;
          }
          
          const canvas = res[0].node;
          const ctx = canvas.getContext('2d');
          
          console.log('Canvas节点获取成功，尺寸:', res[0].size);
          
          // 设置画布尺寸（使用设备像素比保证清晰度）
          const dpr = wx.getSystemInfoSync().pixelRatio || 2;
          const screenWidth = wx.getSystemInfoSync().screenWidth;
          const rpxToPx = screenWidth / 750;
          const width = 600 * rpxToPx;
          const height = 800 * rpxToPx;
          
          console.log('画布尺寸计算: width=' + width + ', height=' + height + ', dpr=' + dpr);
          
          canvas.width = width * dpr;
          canvas.height = height * dpr;
          ctx.scale(dpr, dpr);

        try {
          // 绘制背景渐变
          const grd = ctx.createLinearGradient(0, 0, 0, height);
          grd.addColorStop(0, '#1e3a8a');
          grd.addColorStop(1, '#3730a3');
          ctx.fillStyle = grd;
          ctx.fillRect(0, 0, width, height);

          // 装饰圆
          ctx.fillStyle = 'rgba(255,255,255,0.08)';
          ctx.beginPath();
          ctx.arc(width * 0.833, height * 0.125, width * 0.267, 0, 2 * Math.PI);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(width * 0.167, height * 0.875, width * 0.2, 0, 2 * Math.PI);
          ctx.fill();

          // Logo和日期
          ctx.fillStyle = '#fff';
          ctx.font = `bold ${width * 0.053}px sans-serif`;
          ctx.fillText('📰 新闻简报', width * 0.067, height * 0.088);
          ctx.font = `${width * 0.037}px sans-serif`;
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.fillText(this.data.currentDate, width * 0.067, height * 0.138);

          // 分类标签背景
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          this.roundRect(ctx, width * 0.067, height * 0.17, width * 0.267, height * 0.06, width * 0.013);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = `${width * 0.033}px sans-serif`;
          ctx.fillText(this.getCategoryName(news.category), width * 0.1, height * 0.213);

          // 新闻标题
          ctx.fillStyle = '#fff';
          ctx.font = `bold ${width * 0.05}px sans-serif`;
          this.wrapText(ctx, news.title, width * 0.067, height * 0.3, width * 0.867, height * 0.055);

          // AI解读区域背景
          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          this.roundRect(ctx, width * 0.067, height * 0.475, width * 0.867, height * 0.3, width * 0.027);
          ctx.fill();
          
          // AI解读标题
          ctx.fillStyle = '#fbbf24';
          ctx.font = `bold ${width * 0.04}px sans-serif`;
          ctx.fillText('✨ AI 核心解读', width * 0.1, height * 0.53);
          
          // AI解读内容
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.font = `${width * 0.037}px sans-serif`;
          const interpretation = (news.ai_analysis && news.ai_analysis.interpretation)
            ? news.ai_analysis.interpretation
            : '正在加载AI解读...';
          const interpText = interpretation.length > 120 ? interpretation.substring(0, 120) + '...' : interpretation;
          this.wrapText(ctx, interpText, width * 0.1, height * 0.58, width * 0.8, height * 0.04);

          // 趋势预测
          ctx.fillStyle = '#a78bfa';
          ctx.font = `bold ${width * 0.033}px sans-serif`;
          ctx.fillText('🔮 趋势预测', width * 0.1, height * 0.7);
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.font = `${width * 0.033}px sans-serif`;
          const prediction = (news.ai_analysis && news.ai_analysis.prediction)
            ? news.ai_analysis.prediction
            : 'AI正在分析趋势...';
          this.wrapText(ctx, prediction.length > 60 ? prediction.substring(0, 60) + '...' : prediction,
            width * 0.1, height * 0.74, width * 0.8, height * 0.04);

          // 底部信息
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.font = `${width * 0.03}px sans-serif`;
          ctx.fillText(`来源: ${news.source || 'NewsBrief'}`, width * 0.067, height * 0.88);
          ctx.fillText('NewsBrief · AI 驱动的智能情报', width * 0.35, height * 0.93);

          // 导出图片
          setTimeout(() => {
            wx.canvasToTempFilePath({
              canvas: canvas,
              width: width,
              height: height,
              destWidth: width * dpr,
              destHeight: height * dpr,
              success: (res) => {
                this.setData({ posterImage: res.tempFilePath });
                wx.hideLoading();
                wx.showToast({ title: '生成成功', icon: 'success' });
              },
              fail: (err) => {
                console.error('生成海报失败:', err);
                wx.hideLoading();
                wx.showToast({ title: '生成失败: ' + (err.errMsg || '未知错误'), icon: 'none' });
              }
            });
          }, 500);
        } catch (error) {
          console.error('绘制海报失败:', error);
          wx.hideLoading();
          wx.showToast({ title: '绘制失败', icon: 'none' });
        }
      });
    }, 300);
  },

  // 绘制圆角矩形
  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  },

  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    if (!text) return;
    
    // 确保text是字符串
    const textStr = String(text);
    
    let line = '';
    let lineCount = 0;
    const maxLines = 3;
    
    for (let i = 0; i < textStr.length; i++) {
      const testLine = line + textStr[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line.length > 0) {
        ctx.fillText(line, x, y + lineCount * lineHeight);
        line = textStr[i];
        lineCount++;
        if (lineCount >= maxLines) {
          // 超过最大行数，添加省略号
          if (i < textStr.length - 1) {
            ctx.fillText(line + '...', x, y + lineCount * lineHeight);
          }
          break;
        }
      } else {
        line = testLine;
      }
    }
    
    if (lineCount < maxLines && line) {
      ctx.fillText(line, x, y + lineCount * lineHeight);
    }
  },

  savePoster() {
    if (!this.data.posterImage) {
      wx.showToast({ title: '请先生成海报', icon: 'none' });
      return;
    }
    
    // 先检查权限
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.writePhotosAlbum']) {
          // 已有权限，直接保存
          this.doSavePoster();
        } else if (res.authSetting['scope.writePhotosAlbum'] === false) {
          // 用户之前拒绝过，引导去设置页
          wx.showModal({
            title: '需要相册权限',
            content: '请在设置中开启相册权限以保存海报',
            confirmText: '去设置',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openSetting();
              }
            }
          });
        } else {
          // 首次请求权限
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              this.doSavePoster();
            },
            fail: () => {
              wx.showToast({ title: '需要相册权限', icon: 'none' });
            }
          });
        }
      }
    });
  },

  doSavePoster() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterImage,
      success: () => {
        wx.showToast({ title: '已保存到相册', icon: 'success' });
      },
      fail: (err) => {
        console.error('保存失败:', err);
        wx.showToast({ title: '保存失败', icon: 'none' });
      }
    });
  },

  viewDetail(e) {
    const news = e.currentTarget.dataset.news;
    wx.navigateTo({ url: `/pages/detail/detail?id=${news.id}` });
  },

  openLogicTrace(e) {
    const news = e.currentTarget.dataset.news;
    wx.navigateTo({ url: `/pages/logic-trace/logic-trace?id=${news.id}` });
  },

  refreshNews() {
    wx.showToast({ title: 'AI刷新中...', icon: 'loading' });
    // 清除旧数据后刷新
    this.refreshWithAI();
  },

  /**
   * 显示新闻详情弹窗
   */
  showNewsDetail(e) {
    wx.vibrateShort({ type: 'light' });
    const newsId = e.currentTarget.dataset.id;
    const news = this.data.displayedNews.find(n => n.id === newsId);
    if (news) {
      console.log('News data:', news);
      console.log('Categorized tags:', news.categorizedTags);
      this.setData({
        showNewsDetailModal: true,
        currentNews: news,
        currentMode: this.data.readMode
      });
    }
  },

  /**
   * 关闭新闻详情弹窗
   */
  closeNewsDetail() {
    wx.vibrateShort({ type: 'light' });
    this.setData({ showNewsDetailModal: false });
  },

  /**
   * 显示交互式名词百科弹窗
   */
  showJargonPopup(e) {
    wx.vibrateShort({ type: 'light' });
    const term = e.currentTarget.dataset.term;
    const explain = e.currentTarget.dataset.explain;
    this.setData({
      showJargonPopup: true,
      currentJargon: { term, explain }
    });
  },

  /**
   * 隐藏交互式名词百科弹窗
   */
  hideJargonPopup() {
    wx.vibrateShort({ type: 'light' });
    this.setData({ showJargonPopup: false });
  },

  /**
   * 显示AI导师回答
   */
  showTutorAnswer(e) {
    wx.vibrateShort({ type: 'light' });
    const answer = e.currentTarget.dataset.answer;
    this.setData({
      currentTutorAnswer: answer,
      showTutorAnswer: true
    });
  },

  /**
   * 生成社交金句分享图
   */
  generateTalkingPointPoster(e) {
    wx.vibrateShort({ type: 'light' });
    const point = e.currentTarget.dataset.point;
    
    wx.showToast({
      title: '生成分享图中...',
      icon: 'loading',
      duration: 2000
    });
    
    // 模拟生成分享图
    setTimeout(() => {
      wx.showToast({
        title: '分享图生成成功',
        icon: 'success',
        duration: 2000
      });
      
      // 这里可以添加实际的分享图生成逻辑
      console.log('生成分享图:', point);
    }, 1500);
  },

  /**
   * 相关性分析按钮点击事件
   */
  onRelevanceAnalysis(e) {
    wx.vibrateShort({ type: 'light' });
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/relevance-analysis/relevance-analysis?id=${id}`
    });
  },

  /**
   * 深度探索按钮点击事件
   */
  onDeepExploration(e) {
    wx.vibrateShort({ type: 'light' });
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/deep-exploration/deep-exploration?id=${id}`
    });
  },

  /**
   * 七要素分析按钮点击事件
   */
  openSevenElements(e) {
    console.log('=== openSevenElements 被调用 ===');
    wx.vibrateShort({ type: 'light' });
    const id = e.currentTarget.dataset.id;
    console.log('newsId:', id);
    
    wx.showToast({
      title: '正在打开事实审计...',
      icon: 'loading',
      duration: 1000
    });
    
    wx.navigateTo({
      url: `/pages/seven-elements/seven-elements?id=${id}`
    });
  },

  /**
   * 收藏按钮点击事件
   */
  onFavorite(e) {
    wx.vibrateShort({ type: 'light' });
    const id = e.currentTarget.dataset.id;
    const news = this.data.displayedNews.find(n => n.id === id);
    if (news) {
      // 切换收藏状态
      const updatedNews = this.data.displayedNews.map(n => {
        if (n.id === id) {
          return { ...n, isFavorited: !n.isFavorited };
        }
        return n;
      });
      this.setData({ displayedNews: updatedNews });
      
      // 保存收藏状态到本地存储
      const isFavorited = updatedNews.find(n => n.id === id).isFavorited;
      this.saveFavorites();
      
      // 显示提示
      wx.showToast({
        title: isFavorited ? '已收藏' : '已取消收藏',
        icon: 'success'
      });
    }
  },

  /**
   * 保存收藏状态到本地存储
   */
  saveFavorites() {
    try {
      const favoriteNews = this.data.displayedNews.filter(news => news.isFavorited);
      const favoriteIds = favoriteNews.map(news => news.id);
      wx.setStorageSync('favorites', favoriteIds);
    } catch (error) {
      console.error('保存收藏失败:', error);
    }
  },

  /**
   * 加载收藏状态
   */
  loadFavorites() {
    try {
      const favoriteIds = wx.getStorageSync('favorites') || [];
      if (favoriteIds.length > 0) {
        const updatedNews = this.data.displayedNews.map(news => ({
          ...news,
          isFavorited: favoriteIds.includes(news.id)
        }));
        this.setData({ displayedNews: updatedNews });
      }
    } catch (error) {
      console.error('加载收藏失败:', error);
    }
  },

  /**
   * 分享按钮点击事件
   */
  onShare(e) {
    wx.vibrateShort({ type: 'light' });
    const id = e.currentTarget.dataset.id;
    const news = this.data.displayedNews.find(n => n.id === id);
    if (news) {
      // 显示分享菜单
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
      
      // 模拟分享功能
      wx.showToast({
        title: '分享功能已触发',
        icon: 'success'
      });
    }
  },

  /**
   * 显示专业词汇解释
   */
  showJargonExplain(e) {
    wx.vibrateShort({ type: 'light' });
    const { term, explain } = e.currentTarget.dataset;
    this.setData({
      showJargonTip: true,
      currentJargon: { term, explain }
    });
  },

  /**
   * 隐藏专业词汇解释
   */
  hideJargonTip() {
    wx.vibrateShort({ type: 'light' });
    this.setData({ showJargonTip: false });
  },

  /**
   * 阻止触摸移动
   */
  preventTouchMove() {
    return false;
  },

  toggleTimeline(e) {
    const newsId = e.currentTarget.dataset.id;
    const newsList = this.data.displayedNews;
    const news = newsList.find(n => n.id === newsId);
    
    if (news) {
      news.showTimeline = !news.showTimeline;
      this.setData({
        displayedNews: newsList
      });
    }
  },

  showSourceDetail(e) {
    const source = e.currentTarget.dataset.source;
    wx.showToast({
      title: `信源：${source.name}\n权威度：${source.reliability}%`,
      icon: 'none',
      duration: 2000
    });
  },

  onPullDownRefresh() {
    // 下拉刷新使用AI刷新
    this.refreshWithAI();
    setTimeout(() => wx.stopPullDownRefresh(), 2000);
  },

  /**
   * 触底加载更多
   */
  onReachBottom() {
    if (!this.data.hasMore) {
      wx.showToast({ 
        title: '没有更多了', 
        icon: 'none',
        duration: 1500
      });
      return;
    }
    
    if (this.data.loadingMore) {
      return;
    }
    
    this.loadMoreNews();
  },

  /**
   * 切换收藏状态
   */
  toggleFavorite(e) {
    const id = e.currentTarget.dataset.id;
    const displayedNews = this.data.displayedNews.map(news => {
      if (news.id === id) {
        return { ...news, isFavorited: !news.isFavorited };
      }
      return news;
    });
    
    this.setData({ displayedNews });
    
    const news = displayedNews.find(n => n.id === id);
    wx.showToast({ 
      title: news.isFavorited ? '已收藏' : '已取消收藏', 
      icon: 'success',
      duration: 1500
    });
    
    // 触觉反馈
    wx.vibrateShort({ type: 'light' });
  },

  /**
   * 切换稍后读状态
   */
  toggleReadLater(e) {
    const id = e.currentTarget.dataset.id;
    const displayedNews = this.data.displayedNews.map(news => {
      if (news.id === id) {
        return { ...news, isReadLater: !news.isReadLater };
      }
      return news;
    });
    
    this.setData({ displayedNews });
    
    const news = displayedNews.find(n => n.id === id);
    wx.showToast({ 
      title: news.isReadLater ? '已添加到稍后读' : '已移除', 
      icon: 'success',
      duration: 1500
    });
    
    // 触觉反馈
    wx.vibrateShort({ type: 'light' });
  },

  /**
   * 分享新闻
   */
  shareNews(e) {
    const id = e.currentTarget.dataset.id;
    const news = this.data.displayedNews.find(n => n.id === id);
    
    if (!news) return;
    
    // 显示分享选项
    wx.showActionSheet({
      itemList: ['生成分享海报', '分享给朋友', '复制链接'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.showSharePoster({ currentTarget: { dataset: { news } } });
        } else if (res.tapIndex === 1) {
          wx.showToast({ title: '请使用右上角分享', icon: 'none' });
        } else if (res.tapIndex === 2) {
          wx.setClipboardData({
            data: `【新闻简报】${news.title}`,
            success: () => {
              wx.showToast({ title: '链接已复制', icon: 'success' });
            }
          });
        }
      }
    });
  },

  onShareAppMessage() {
    return { title: `${this.data.currentDate} | 新闻简报 - 你的私人智库`, path: '/pages/index/index' };
  },

  /**
   * 生成小白模式数据
   */
  generateNewbieData(news) {
    // 生成通俗摘要
    const simpleSummary = this.simplifyText(news.summary);
    
    // 生成通俗解读
    const simpleInterpretation = this.simplifyText(news.ai_analysis.interpretation || news.ai_analysis.interpretation || '');
    
    // 生成通俗预测
    const simplePrediction = this.simplifyText(news.ai_analysis.prediction || news.ai_analysis.prediction || '');
    
    // 生成知识小百科
    const jargonTips = this.generateJargonTips(news);
    
    return {
      simpleSummary,
      simpleInterpretation,
      simplePrediction,
      jargonTips
    };
  },

  /**
   * 简化文本为通俗易懂版本
   */
  simplifyText(text) {
    if (!text) return '';
    
    // 简化专业术语
    const simplifications = [
      { term: '多模态', simple: '能看图听声音' },
      { term: '推理能力', simple: '思考能力' },
      { term: 'API', simple: '接口' },
      { term: 'Token', simple: '字数' },
      { term: '大模型', simple: 'AI大脑' },
      { term: '生成式AI', simple: '能创作的AI' },
      { term: 'Transformer', simple: 'AI模型' },
      { term: '神经网络', simple: 'AI网络' },
      { term: '深度学习', simple: 'AI学习' },
      { term: '自然语言处理', simple: '理解语言' },
      { term: '计算机视觉', simple: '看图片' },
      { term: '机器学习', simple: '机器学习' },
      { term: '强化学习', simple: '试错学习' },
      { term: '联邦学习', simple: '隐私学习' },
      { term: '边缘计算', simple: '就近计算' },
      { term: '云计算', simple: '网上计算' },
      { term: '区块链', simple: '分布式账本' },
      { term: '去中心化', simple: '不依赖中心' },
      { term: '智能合约', simple: '自动执行合同' },
      { term: '元宇宙', simple: '虚拟世界' },
      { term: 'NFT', simple: '数字藏品' },
      { term: 'Web3', simple: '新一代互联网' },
      { term: 'DAO', simple: '去中心化组织' },
      { term: 'DeFi', simple: '去中心化金融' },
      { term: '量化交易', simple: '程序交易' },
      { term: '高频交易', simple: '快速交易' },
      { term: '算法交易', simple: '智能交易' },
      { term: '智能投顾', simple: 'AI理财' },
      { term: '金融科技', simple: '科技金融' },
      { term: '监管科技', simple: '合规科技' },
      { term: '绿色金融', simple: '环保金融' },
      { term: '碳交易', simple: '碳排放交易' },
      { term: 'ESG', simple: '环境社会治理' },
      { term: '碳中和', simple: '零排放' },
      { term: '碳达峰', simple: '排放高峰' }
    ];
    
    let simplified = text;
    simplifications.forEach(({ term, simple }) => {
      const regex = new RegExp(term, 'g');
      simplified = simplified.replace(regex, simple);
    });
    
    return simplified;
  },

  /**
   * 生成知识小百科
   */
  generateJargonTips(news) {
    const jargonTips = [];
    const allText = `${news.title} ${news.summary} ${news.ai_analysis.interpretation || ''}`;
    
    // 检测专业术语
    const jargonList = [
      { term: 'Token', explain: '可以理解为"字数"，100万token大约等于75万个汉字，相当于3本《三国演义》' },
      { term: '多模态', explain: '就是AI不仅能看文字，还能看图片、听声音，像人一样用多种感官理解世界' },
      { term: 'API', explain: '程序员用来调用AI能力的"接口"，就像插座让你能用电一样' },
      { term: '推理能力', explain: 'AI的"思考能力"，能像人一样一步步分析问题、得出结论' },
      { term: '大模型', explain: '像ChatGPT这样的AI大脑，通过学习海量数据变得很聪明' },
      { term: '生成式AI', explain: '能创作新内容的AI，比如写文章、画图、作曲' },
      { term: 'Transformer', explain: '现代AI模型的核心技术，让AI能理解上下文关系' },
      { term: '神经网络', explain: '模仿人脑结构的AI系统，通过多层网络处理信息' },
      { term: '深度学习', explain: 'AI通过多层网络自动学习特征，像人脑一样思考' },
      { term: '自然语言处理', explain: '让AI能理解、生成人类语言的技术' },
      { term: '计算机视觉', explain: '让AI能"看懂"图片和视频的技术' },
      { term: '机器学习', explain: '让机器从数据中自动学习规律的技术' },
      { term: '强化学习', explain: 'AI通过不断试错来学习最优策略' },
      { term: '联邦学习', explain: '在保护隐私的前提下，多方共同训练AI模型' },
      { term: '边缘计算', explain: '在设备附近进行计算，减少延迟，提高效率' },
      { term: '云计算', explain: '通过网络提供计算服务，像用电一样方便' },
      { term: '区块链', explain: '一种分布式账本技术，数据不可篡改，公开透明' },
      { term: '去中心化', explain: '不依赖单一中心，由多个节点共同维护系统' },
      { term: '智能合约', explain: '自动执行的数字化协议，满足条件自动执行' },
      { term: '元宇宙', explain: '虚拟的数字世界，人们可以在其中工作、娱乐、社交' },
      { term: 'NFT', explain: '非同质化代币，每个都是独一无二的数字资产' },
      { term: 'Web3', explain: '新一代互联网，强调去中心化和用户数据主权' },
      { term: 'DAO', explain: '去中心化自治组织，由成员共同决策管理' },
      { term: 'DeFi', explain: '去中心化金融，用智能合约替代传统金融服务' },
      { term: '量化交易', explain: '用数学模型和算法自动进行交易' },
      { term: '高频交易', explain: '以极快速度进行大量交易，赚取微小价差' },
      { term: '算法交易', explain: '用计算机程序自动执行交易策略' },
      { term: '智能投顾', explain: '用AI为用户提供个性化的投资建议' },
      { term: '金融科技', explain: '用科技手段创新金融服务' },
      { term: '监管科技', explain: '用科技手段帮助金融机构合规' },
      { term: '绿色金融', explain: '支持环保和可持续发展的金融活动' },
      { term: '碳交易', explain: '买卖碳排放权的市场机制' },
      { term: 'ESG', explain: '环境、社会、治理三个维度的评估标准' },
      { term: '碳中和', explain: '实现净零碳排放' },
      { term: '碳达峰', explain: '碳排放达到峰值后开始下降' }
    ];
    
    jargonList.forEach(jargon => {
      if (allText.includes(jargon.term) && !jargonTips.find(t => t.term === jargon.term)) {
        jargonTips.push(jargon);
      }
    });
    
    // 最多返回4个术语
    return jargonTips.slice(0, 4);
  },

  /**
   * 为新闻动态生成知识小百科
   */
  generateJargonTipsForNews(news) {
    const jargonTips = [];
    const allText = `${news.title} ${news.summary} ${news.ai_analysis?.interpretation || ''}`;
    
    // 根据新闻内容生成相关的专业术语解释
    const jargonList = [
      { term: 'Token', explain: '可以理解为"字数"，100万token大约等于75万个汉字，相当于3本《三国演义》' },
      { term: '多模态', explain: '就是AI不仅能看文字，还能看图片、听声音，像人一样用多种感官理解世界' },
      { term: 'API', explain: '程序员用来调用AI能力的"接口"，就像插座让你能用电一样' },
      { term: '推理能力', explain: 'AI的"思考能力"，能像人一样一步步分析问题、得出结论' },
      { term: '大模型', explain: '像ChatGPT这样的AI大脑，通过学习海量数据变得很聪明' },
      { term: '生成式AI', explain: '能创作新内容的AI，比如写文章、画图、作曲' },
      { term: 'Transformer', explain: '现代AI模型的核心技术，让AI能理解上下文关系' },
      { term: '神经网络', explain: '模仿人脑结构的AI系统，通过多层网络处理信息' },
      { term: '深度学习', explain: 'AI通过多层网络自动学习特征，像人脑一样思考' },
      { term: '自然语言处理', explain: '让AI能理解、生成人类语言的技术' },
      { term: '计算机视觉', explain: '让AI能"看懂"图片和视频的技术' },
      { term: '机器学习', explain: '让机器从数据中自动学习规律的技术' },
      { term: '强化学习', explain: 'AI通过不断试错来学习最优策略' },
      { term: '联邦学习', explain: '在保护隐私的前提下，多方共同训练AI模型' },
      { term: '边缘计算', explain: '在设备附近进行计算，减少延迟，提高效率' },
      { term: '云计算', explain: '通过网络提供计算服务，像用电一样方便' },
      { term: '区块链', explain: '一种分布式账本技术，数据不可篡改，公开透明' },
      { term: '去中心化', explain: '不依赖单一中心，由多个节点共同维护系统' },
      { term: '智能合约', explain: '自动执行的数字化协议，满足条件自动执行' },
      { term: '元宇宙', explain: '虚拟的数字世界，人们可以在其中工作、娱乐、社交' },
      { term: 'NFT', explain: '非同质化代币，每个都是独一无二的数字资产' },
      { term: 'Web3', explain: '新一代互联网，强调去中心化和用户数据主权' },
      { term: 'DAO', explain: '去中心化自治组织，由成员共同决策管理' },
      { term: 'DeFi', explain: '去中心化金融，用智能合约替代传统金融服务' },
      { term: '量化交易', explain: '用数学模型和算法自动进行交易' },
      { term: '高频交易', explain: '以极快速度进行大量交易，赚取微小价差' },
      { term: '算法交易', explain: '用计算机程序自动执行交易策略' },
      { term: '智能投顾', explain: '用AI为用户提供个性化的投资建议' },
      { term: '金融科技', explain: '用科技手段创新金融服务' },
      { term: '监管科技', explain: '用科技手段帮助金融机构合规' },
      { term: '绿色金融', explain: '支持环保和可持续发展的金融活动' },
      { term: '碳交易', explain: '买卖碳排放权的市场机制' },
      { term: 'ESG', explain: '环境、社会、治理三个维度的评估标准' },
      { term: '碳中和', explain: '实现净零碳排放' },
      { term: '碳达峰', explain: '碳排放达到峰值后开始下降' }
    ];
    
    jargonList.forEach(jargon => {
      if (allText.includes(jargon.term) && !jargonTips.find(t => t.term === jargon.term)) {
        jargonTips.push(jargon);
      }
    });
    
    // 最多返回4个术语
    return jargonTips.slice(0, 4);
  },

  /**
   * 为新闻动态生成多源验证数据
   */
  generateSourcesForNews(news) {
    // 根据新闻内容生成信源
    const sourceOptions = [
      { name: '官方博客', icon: '📝', reliability: 95 },
      { name: 'TechCrunch', icon: '💻', reliability: 88 },
      { name: 'Reuters', icon: '📰', reliability: 92 },
      { name: 'The Verge', icon: '📱', reliability: 90 },
      { name: 'Wired', icon: '📰', reliability: 85 },
      { name: 'BBC News', icon: '📺', reliability: 92 },
      { name: 'CNN', icon: '📺', reliability: 88 },
      { name: '36氪', icon: '💻', reliability: 85 },
      { name: '虎嗅', icon: '💻', reliability: 80 },
      { name: '新浪科技', icon: '📰', reliability: 75 },
      { name: '网易科技', icon: '💻', reliability: 78 },
      { name: 'GitHub', icon: '🐙', reliability: 88 },
      { name: 'Hacker News', icon: '💻', reliability: 80 }
    ];
    
    // 随机选择3-5个信源
    const numSources = 3 + Math.floor(Math.random() * 3);
    const selectedSources = sourceOptions
      .sort(() => Math.random() - 0.5)
      .slice(0, numSources);
    
    // 生成共识点
    const consensusOptions = [
      '正式发布',
      '技术突破',
      '性能提升',
      '能力增强',
      '功能升级',
      '成本降低',
      '效率提升',
      '安全性提高'
    ];
    
    const numConsensus = 2 + Math.floor(Math.random() * 2);
    const consensus = consensusOptions
      .sort(() => Math.random() - 0.5)
      .slice(0, numConsensus);
    
    // 生成争议点（10%概率）
    const conflictOptions = [
      '部分媒体报道不一致',
      '相关数据存在争议',
      '官方尚未完全确认',
      '第三方机构观点分歧'
    ];
    
    const hasConflict = Math.random() < 0.1;
    const conflicts = hasConflict ? [conflictOptions[Math.floor(Math.random() * conflictOptions.length)]] : [];
    
    return {
      verified_list: selectedSources.map(source => ({
        ...source,
        reliability: source.reliability + Math.floor(Math.random() * 10) - 5
      })),
      consensus,
      conflicts
    };
  },

  /**
   * 生成脱水模式文本
   */
  generateDehydratedText(news) {
    // 提取关键词
    const keywords = news.tags.slice(0, 3).join('、');
    
    // 简化标题
    let title = news.title;
    const titleSimplifications = [
      { pattern: /发布|推出|上线|发布/g, replacement: '' },
      { pattern: /最新|最新版|最新版/g, replacement: '' },
      { pattern: /正式|正式版|正式版/g, replacement: '' },
      { pattern: /完成|完成版|完成版/g, replacement: '' },
      { pattern: /升级|升级版|升级版/g, replacement: '' }
    ];
    
    titleSimplifications.forEach(({ pattern, replacement }) => {
      title = title.replace(pattern, replacement);
    });
    
    // 提取核心信息
    const coreInfo = news.summary.split('。')[0];
    
    // 生成脱水文本
    const dehydrated = `${title}，${coreInfo}`;
    
    return dehydrated;
  },

  /**
   * 打开全局搜索页面
   */
  openSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
    // 触觉反馈
    wx.vibrateShort({ type: 'light' });
  },

  // AI语音简报相关函数
  toggleAudioPlayer() {
    // 打开语音播报界面
    this.setData({ showAudioPlayer: true });
    if (!this.data.audioScript) {
      this.generateAudioScript();
    }
    // 自动开始播放
    if (!this.data.isAudioPlaying) {
      this.toggleAudioPlay();
    }
  },

  toggleAudioPlay() {
    const isPlaying = !this.data.isAudioPlaying;
    this.setData({ isAudioPlaying: isPlaying });
    
    if (isPlaying) {
      this.setData({ audioStatus: '正在播放今日简报' });
      this.startWaveAnimation();
      // 开始实际的音频播放
      this.startAudioPlayback();
    } else {
      this.setData({ audioStatus: '已暂停播放' });
      this.stopWaveAnimation();
      this.stopAudioPlayback();
    }
  },

  togglePlaybackSpeed() {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(this.data.playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    this.setData({ playbackSpeed: speeds[nextIndex] });
    
    // 如果正在播放，更新播放速度
    if (this.data.isAudioPlaying && this.audioContext) {
      this.audioContext.playbackRate = speeds[nextIndex];
    }
  },

  generateAudioScript() {
    // 获取今日最重要的5条新闻
    const importantNews = this.data.newsData
      .filter(news => news.impactScore >= 8)
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, 5);
    
    if (importantNews.length === 0) {
      this.setData({ audioScript: '今日暂无重要新闻' });
      return;
    }
    
    // 生成播报稿
    let script = `欢迎收听今日简报。今天是${this.data.currentDate}，以下是今日最核心的5条重要信号：\n\n`;
    
    importantNews.forEach((news, index) => {
      script += `${index + 1}. ${news.title}。${news.summary}。\n`;
    });
    
    script += '\n以上是今日简报，感谢收听。';
    
    this.setData({ audioScript: script });
  },

  startWaveAnimation() {
    this.waveInterval = setInterval(() => {
      this.setData({
        waveHeight1: Math.random() * 80 + 20,
        waveHeight2: Math.random() * 80 + 20,
        waveHeight3: Math.random() * 80 + 20,
        waveHeight4: Math.random() * 80 + 20,
        waveHeight5: Math.random() * 80 + 20
      });
    }, 200);
  },

  stopWaveAnimation() {
    if (this.waveInterval) {
      clearInterval(this.waveInterval);
      this.waveInterval = null;
      // 重置波形高度
      this.setData({
        waveHeight1: 30,
        waveHeight2: 60,
        waveHeight3: 40,
        waveHeight4: 70,
        waveHeight5: 50
      });
    }
  },

  startAudioPlayback() {
    const importantNews = this.data.newsData
      .filter(news => news.impactScore >= 8)
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, 5);
    
    if (importantNews.length === 0) {
      this.speakText('今日暂无重要新闻');
      return;
    }
    
    // 播放开始语
    this.speakText(`欢迎收听今日简报。今天是${this.data.currentDate}，以下是今日最核心的5条重要信号：`);
    
    // 逐个播放新闻
    importantNews.forEach((news, index) => {
      setTimeout(() => {
        this.speakText(`${index + 1}. ${news.title}。${news.summary}。`);
        // 滚动到对应新闻卡片
        this.scrollToNewsCard(news.id);
      }, 5000 * (index + 1));
    });
    
    // 播放结束语
    setTimeout(() => {
      this.speakText('以上是今日简报，感谢收听。');
      // 播放结束
      setTimeout(() => {
        this.setData({ isAudioPlaying: false, audioStatus: '播放完成' });
        this.stopWaveAnimation();
      }, 3000);
    }, 5000 * (importantNews.length + 1));
  },

  speakText(text) {
    // 使用微信语音合成API
    wx.textToSpeech({
      text: text,
      lang: 'zh_CN',
      rate: this.data.playbackSpeed * 1.0,
      success: (res) => {
        console.log('语音合成成功:', res);
      },
      fail: (err) => {
        console.error('语音合成失败:', err);
        this.setData({ isAudioPlaying: false, audioStatus: '语音合成失败' });
        this.stopWaveAnimation();
      }
    });
  },

  stopAudioPlayback() {
    // 停止语音播放
    wx.stopVoice();
  },

  scrollToNewsCard(newsId) {
    const news = this.data.displayedNews.find(n => n.id === newsId);
    if (news) {
      // 计算新闻卡片的位置并滚动
      wx.createSelectorQuery().select(`#news-${newsId}`).boundingClientRect((rect) => {
        if (rect) {
          wx.pageScrollTo({
            scrollTop: rect.top - 100,
            duration: 500
          });
        }
      }).exec();
    }
  }
});
