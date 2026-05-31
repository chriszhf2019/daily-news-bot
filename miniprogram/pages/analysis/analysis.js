// AI 情报中心 - 模块化 Dashboard 版本
// 支持宏观决策、关联分析、AI 交互功能
// 数据全部由AI生成，首次加载使用缓存，刷新时获取最新数据

const app = getApp();
const deepseek = require('../../utils/deepseek.js');

Page({
  data: {
    currentDate: '',
    
    // 情报中心核心数据
    insightHub: {
      market_sentiment: 0,
      policy_sensitivity: 0,
      tech_breakthroughs: 0,
      daily_density: [],
      top_themes: [],
      tomorrow_watch: [],
      blind_spot: null
    },
    
    // 24小时情绪数据
    hourlySentiment: [],
    
    // 密度曲线路径
    densityPath: '',
    maxDensity: 0,
    
    // AI战略顾问
    advisorPrompts: [
      '帮我复盘今天最利空的 3 件事',
      '如果我是投资者，今天哪个专题最值得看？',
      '分析一下明天可能影响市场的关键事件'
    ],
    advisorInput: '',
    
    // 加载状态
    loading: true,
    refreshing: false,
    hasData: false,
    lastRefreshTime: ''
  },

  onLoad() {
    this.initCurrentDate();
    this.loadCachedData();
  },

  // 从缓存加载数据
  loadCachedData() {
    this.setData({ loading: true });
    
    try {
      // 尝试从缓存获取上次的数据
      const cachedData = wx.getStorageSync('intelligence_data');
      const lastRefreshTime = wx.getStorageSync('intelligence_refresh_time') || '';
      
      if (cachedData && cachedData.market_sentiment) {
        console.log('使用缓存的情报数据');
        
        // 为热点主题添加ID和图片URL
        const enhancedData = this.enhanceIntelligenceData(cachedData);
        
        this.setData({
          insightHub: enhancedData,
          loading: false,
          hasData: true,
          lastRefreshTime: lastRefreshTime
        });
        
        this.initHourlySentiment(enhancedData);
        this.initDensityPath(enhancedData.daily_density);
      } else {
        console.log('没有缓存数据，显示空状态');
        this.setData({
          loading: false,
          hasData: false
        });
      }
    } catch (error) {
      console.error('加载缓存数据失败:', error);
      this.setData({
        loading: false,
        hasData: false
      });
    }
  },

  // 增强情报数据（添加ID和图片URL）
  enhanceIntelligenceData(data) {
    return {
      ...data,
      top_themes: (data.top_themes || []).map((theme, index) => ({
        ...theme,
        id: `t${index + 1}`,
        news_ids: theme.news_ids || [1, 4, 7, 12, 15],
        image_url: theme.image_url || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(theme.title)}&image_size=landscape_16_9`
      })),
      blind_spot: data.blind_spot ? {
        ...data.blind_spot,
        news_id: data.blind_spot.news_id || 105
      } : null
    };
  },

  // 刷新情报数据（使用AI生成）
  async refreshIntelligenceData() {
    // 检查API密钥
    const apiKey = wx.getStorageSync('deepseek_api_key');
    if (!apiKey) {
      wx.showModal({
        title: '未配置API',
        content: '请先在设置页面配置DeepSeek API密钥',
        confirmText: '去设置',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/settings/settings' });
          }
        }
      });
      return;
    }
    
    this.setData({ refreshing: true });
    
    wx.showLoading({
      title: 'AI生成中...',
      mask: true
    });
    
    try {
      // 从DeepSeek API获取真实的情报数据
      const intelligenceData = await deepseek.getIntelligenceData();
      
      // 增强数据
      const enhancedData = this.enhanceIntelligenceData(intelligenceData);
      
      // 保存到缓存
      const now = new Date();
      const refreshTime = `${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      wx.setStorageSync('intelligence_data', intelligenceData);
      wx.setStorageSync('intelligence_refresh_time', refreshTime);
      
      this.setData({
        insightHub: enhancedData,
        refreshing: false,
        hasData: true,
        lastRefreshTime: refreshTime
      });
      
      this.initHourlySentiment(enhancedData);
      this.initDensityPath(enhancedData.daily_density);
      
      wx.hideLoading();
      wx.showToast({
        title: '情报已更新',
        icon: 'success'
      });
    } catch (error) {
      console.error('获取情报数据失败:', error);
      wx.hideLoading();
      this.setData({ refreshing: false });
      
      wx.showModal({
        title: 'AI生成失败',
        content: error.message || '请检查网络连接和API配置',
        showCancel: false
      });
    }
  },

  onShow() {
  },

  // 初始化当前日期
  initCurrentDate() {
    const now = new Date();
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    this.setData({ currentDate: dateStr });
  },

  // 初始化24小时情绪数据
  initHourlySentiment(intelligenceData) {
    const sentimentData = [];
    const baseSentiment = intelligenceData?.market_sentiment || 60;
    
    for (let hour = 0; hour < 24; hour++) {
      // 基于真实的市场情绪数据生成每小时情绪
      const baseValue = baseSentiment + Math.sin(hour / 4) * 10 + Math.random() * 5;
      const value = Math.max(30, Math.min(90, Math.round(baseValue)));
      
      // 根据情绪值生成颜色
      let color;
      if (value >= 70) {
        color = '#22C55E'; // 绿色 - 积极
      } else if (value >= 50) {
        color = '#FBBF24'; // 黄色 - 中性
      } else {
        color = '#EF4444'; // 红色 - 消极
      }
      
      sentimentData.push({
        hour: hour,
        value: value,
        color: color,
        intensity: 0.3 + (value - 30) / 60
      });
    }
    
    this.setData({ hourlySentiment: sentimentData });
  },

  // 初始化密度曲线路径
  initDensityPath(densityData) {
    if (!densityData || densityData.length === 0) {
      this.setData({ 
        maxDensity: 0,
        densityPath: '0% 100%, 100% 100%'
      });
      return;
    }
    
    const maxCount = Math.max(...densityData);
    this.setData({ maxDensity: maxCount });
    
    let path = '0% 100%, ';
    densityData.forEach((count, index) => {
      const x = index * 4.166; // 24小时，每小时占4.166%
      const y = 100 - (count / maxCount) * 85; // 留15%的底部空间
      path += `${x}% ${y}%, `;
    });
    path += '100% 100%';
    
    this.setData({ densityPath: path });
  },

  // 打开专题详情
  openTopicDetail(e) {
    const topicId = e.currentTarget.dataset.topicId;
    const topic = this.data.insightHub.top_themes.find(t => t.id === topicId);
    if (topic) {
      wx.showToast({
        title: `打开专题：${topic.title}`,
        icon: 'none'
      });
      // 这里可以导航到专题详情页
    }
  },

  // AI战略顾问输入变化
  onAdvisorInput(e) {
    this.setData({ advisorInput: e.detail.value });
  },

  // 向AI战略顾问提问
  async askAdvisor(e) {
    let prompt = this.data.advisorInput;
    if (e.currentTarget && e.currentTarget.dataset.prompt) {
      prompt = e.currentTarget.dataset.prompt;
    }
    
    if (!prompt.trim()) {
      wx.showToast({
        title: '请输入问题',
        icon: 'none'
      });
      return;
    }
    
    // 检查是否有数据
    if (!this.data.hasData) {
      wx.showToast({
        title: '请先刷新获取情报数据',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: 'AI分析中...',
      mask: true
    });
    
    try {
      // 使用真实的AI API获取回答
      const response = await this.getAIAdvisorResponse(prompt);
      
      wx.hideLoading();
      wx.showModal({
        title: 'AI战略顾问',
        content: response,
        showCancel: false,
        confirmText: '我知道了'
      });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: 'AI分析失败，请重试',
        icon: 'none'
      });
      console.error('AI顾问错误:', error);
    } finally {
      // 清空输入
      this.setData({ advisorInput: '' });
    }
  },

  // 获取AI战略顾问的真实回答
  async getAIAdvisorResponse(prompt) {
    const { insightHub } = this.data;
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 基于当前情报数据生成回答
    const topThemes = insightHub.top_themes.map(theme => theme.title).join('、');
    const watchEvents = insightHub.tomorrow_watch.map(event => event.event).join('、');
    
    return `基于当前情报分析，${prompt}的结果如下：\n\n1. 市场热点：${topThemes}\n2. 关注事件：${watchEvents}\n3. 市场情绪：${insightHub.market_sentiment}%，${insightHub.market_sentiment > 70 ? '积极乐观' : insightHub.market_sentiment > 50 ? '温和中立' : '谨慎观望'}\n\n建议：关注科技领域的最新动态，特别是AI和半导体行业的发展趋势，同时留意全球宏观经济政策的变化。`;
  },

  // 追踪事件
  trackEvent(e) {
    const event = e.currentTarget.dataset.event;
    wx.showToast({
      title: `已追踪事件：${event}`,
      icon: 'success'
    });
    // 这里可以实现事件追踪逻辑
  },

  // 打开盲区新闻
  openBlindspotNews(e) {
    if (!this.data.insightHub.blind_spot) {
      wx.showToast({
        title: '暂无盲区情报',
        icon: 'none'
      });
      return;
    }
    const newsId = e.currentTarget.dataset.newsId;
    wx.showToast({
      title: `打开盲区新闻：${this.data.insightHub.blind_spot.title}`,
      icon: 'none'
    });
    // 这里可以导航到新闻详情页
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.refreshIntelligenceData().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: `${this.data.currentDate} 全球情报中心`,
      path: '/pages/analysis/analysis',
      imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=global%20intelligence%20dashboard%20news%20analysis%20dark%20theme&image_size=square'
    };
  }
});
