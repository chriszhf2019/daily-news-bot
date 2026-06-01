// relevance-analysis.js - 私人顾问（决策导向版 08-14）
const deepseek = require('../../utils/deepseek.js');

Page({
  data: {
    newsData: {},
    categoryName: '',
    loading: false,
    isEmpty: false,
    errorMessage: '',
    isRealData: false,
    
    // 身份切换
    personas: [
      { id: 'investor', name: '投资者', icon: '📈' },
      { id: 'coder', name: '技术人', icon: '💻' },
      { id: 'manager', name: '管理者', icon: '👔' }
    ],
    currentPersona: 'investor',
    
    // 08 量化影响 ROI
    impactIdx: 0,
    gainDetail: '',
    riskDetail: '',
    
    // 09 传导机制
    moneyFlow: [],
    winner: '',
    
    // 11 博弈方案
    bullCase: '',
    bearCase: '',
    
    // 13 避坑指南
    pitfall: '',
    
    // 10 具体行动
    actionsList: [],
    
    // 12 时间窗口
    timingHorizon: '',
    timingTrigger: '',
    
    // 14 认知溢价（金句）
    goldQuote: '',
    
    // 多身份数据缓存
    personaData: {}
  },

  onLoad(options) {
    const newsId = options.id;
    const newsData = wx.getStorageSync('newsData') || [];
    
    if (!newsData || newsData.length === 0) {
      this.setData({ isEmpty: true, errorMessage: '暂无新闻数据' });
      return;
    }
    
    const news = newsData.find(n => String(n.id) === String(newsId));
    
    if (!news) {
      this.setData({ isEmpty: true, errorMessage: '新闻不存在' });
      return;
    }
    
    this.setData({ 
      newsData: news,
      categoryName: this.getCategoryName(news.category)
    });
    this.generateAdvisoryWithAI(news);
  },
  
  getCategoryName(category) {
    const map = { 'AI': 'AI动态', 'tech': '科技', 'finance': '财经', 'international': '国际', 'sports': '体育' };
    return map[category] || category || '资讯';
  },

  async generateAdvisoryWithAI(news) {
    const apiKey = wx.getStorageSync('deepseek_api_key') || 'sk-70dae237a40e444385e0856079829d35';
    
    if (!apiKey) {
      this.setData({ loading: false, errorMessage: '请先配置API密钥' });
      return;
    }
    
    try {
      this.setData({ loading: true });
      
      const data = await deepseek.generatePersonalAdvisory(news);
      
      console.log('私人顾问返回数据:', JSON.stringify(data).substring(0, 300));
      
      // 缓存所有身份数据
      const personaData = {
        investor: data.investor || {},
        coder: data.coder || {},
        manager: data.manager || {}
      };
      
      this.setData({ personaData });
      
      // 应用当前身份数据
      this.applyPersonaData('investor');
      
      this.setData({
        loading: false,
        isRealData: true
      });
      
      wx.showToast({ title: '分析完成', icon: 'success' });
    } catch (error) {
      console.error('私人顾问分析失败:', error);
      this.setData({
        loading: false,
        isRealData: false,
        errorMessage: error.message || 'AI分析失败'
      });
      wx.showToast({ title: 'AI分析失败', icon: 'none' });
    }
  },
  
  // 应用指定身份的数据
  applyPersonaData(personaId) {
    const d = this.data.personaData[personaId] || {};
    
    console.log('应用身份数据:', personaId, JSON.stringify(d).substring(0, 200));
    
    // 安全获取数据
    const safeGet = (obj, key, defaultVal) => {
      return obj && obj[key] !== undefined && obj[key] !== null ? obj[key] : defaultVal;
    };
    
    // 处理actions_list，添加checked状态
    const rawActions = safeGet(d, 'actions_list', []);
    const actionsList = (Array.isArray(rawActions) ? rawActions : []).map((text, index) => ({
      id: index,
      text: typeof text === 'string' ? text : String(text),
      checked: false
    }));
    
    this.setData({
      currentPersona: personaId,
      impactIdx: safeGet(d, 'impact_idx', 0),
      gainDetail: safeGet(d, 'gain_detail', ''),
      riskDetail: safeGet(d, 'risk_detail', ''),
      moneyFlow: Array.isArray(d.money_flow) ? d.money_flow : [],
      winner: safeGet(d, 'winner', ''),
      bullCase: safeGet(d, 'bull_case', ''),
      bearCase: safeGet(d, 'bear_case', ''),
      pitfall: safeGet(d, 'pitfall', ''),
      actionsList: actionsList,
      timingHorizon: safeGet(d, 'timing_horizon', ''),
      timingTrigger: safeGet(d, 'timing_trigger', ''),
      goldQuote: safeGet(d, 'gold_quote', '')
    });
  },

  // 切换身份（仅更新局部状态，不重新请求）
  switchPersona(e) {
    const personaId = e.currentTarget.dataset.id;
    if (personaId === this.data.currentPersona) return;
    this.applyPersonaData(personaId);
  },

  // 勾选行动项
  toggleAction(e) {
    const index = e.currentTarget.dataset.index;
    const key = `actionsList[${index}].checked`;
    const currentValue = this.data.actionsList[index].checked;
    this.setData({ [key]: !currentValue });
  },

  goBack() {
    wx.navigateBack();
  },

  shareAnalysis() {
    wx.setClipboardData({
      data: `【私人顾问】${this.data.newsData.title || ''}\n\n💡 金句：${this.data.goldQuote}`,
      success: () => wx.showToast({ title: '已复制', icon: 'success' })
    });
  },

  onShareAppMessage() {
    return {
      title: `【私人顾问】${this.data.newsData.title || ''}`,
      path: `/pages/relevance-analysis/relevance-analysis?id=${this.data.newsData.id || ''}`
    };
  }
});
