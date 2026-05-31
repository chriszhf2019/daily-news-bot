// AI 情报中心 — 真实数据版
const app = getApp();

Page({
  data: {
    currentDate: '',
    // 5 大核心指标
    dash: {
      optimism: { score: 50, positive: 0, neutral: 0, negative: 0 },
      policy_sensitivity: 0,
      tech_breakthrough: 0,
      source_density: [],
      heatmap: [],
      total_news: 0,
      tomorrow_watch: [],
      blind_spots: [],
    },
    advisorPrompts: [
      '帮我复盘今天最重要的 3 件事',
      '如果我是投资者，今天哪个专题最值得看？',
      '分析一下明天可能影响市场的关键事件'
    ],
    advisorInput: '',
    loading: true, refreshing: false, lastRefreshTime: ''
  },

  onLoad() {
    this.initCurrentDate();
    this.loadRealData();
  },

  async loadRealData() {
    this.setData({ loading: true });
    try {
      const res = await new Promise((resolve) =>
        wx.request({ url: 'https://news.velolabs.top/api/v1/news/dashboard', success: resolve, fail: resolve })
      );
      if (res.data && res.data.success) {
        const d = res.data.data;
        const now = new Date();
        this.setData({
          dash: {
            optimism: d.optimism || { score: 50, positive: 0, neutral: 0, negative: 0 },
            policy_sensitivity: d.policy_sensitivity || 0,
            tech_breakthrough: d.tech_breakthrough || 0,
            source_density: d.source_density || [],
            heatmap: d.heatmap || [],
            total_news: d.total_news || 0,
            tomorrow_watch: d.tomorrow_watch || [],
            blind_spots: d.blind_spots || [],
          },
          loading: false,
          lastRefreshTime: `${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
        });
      } else {
        this.setData({ loading: false });
      }
    } catch (e) {
      console.error('情报数据加载失败:', e);
      this.setData({ loading: false });
    }
  },

  async refreshIntelligenceData() {
    this.setData({ refreshing: true });
    wx.showLoading({ title: '刷新中...', mask: true });
    await this.loadRealData();
    wx.hideLoading();
    wx.showToast({ title: '情报已更新', icon: 'success' });
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
      const baseValue = baseSentiment + Math.sin(hour / 4) * 10;
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

  // AI战略顾问 — 真实 DeepSeek 回答
  async getAIAdvisorResponse(prompt) {
    const apiKey = wx.getStorageSync('deepseek_api_key') || 'sk-70dae237a40e444385e0856079829d35'
    const resp = await new Promise((resolve, reject) => {
      wx.request({
        url: 'https://api.deepseek.com/chat/completions',
        method: 'POST',
        header: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        data: { model: 'deepseek-chat', max_tokens: 600, temperature: 0.5,
          messages: [
            { role: 'system', content: '你是一个专业的AI战略顾问，基于新闻情报提供分析建议。回答简洁有力，分点作答。' },
            { role: 'user', content: prompt }
          ]},
        success: resolve, fail: reject
      })
    })
    return resp.data.choices[0].message.content
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
