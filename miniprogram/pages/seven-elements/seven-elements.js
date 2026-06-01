// seven-elements.js - 七要素审计页面（极简版）
const deepseek = require('../../utils/deepseek.js');

Page({
  data: {
    newsData: {},
    categoryName: '',
    loading: false,
    isEmpty: false,
    errorMessage: '',
    isRealData: false,
    
    // 01. 证据链审计
    audit01: {
      score: 0,
      verifiedFacts: [],
      conflicts: [],
      verdict: ''
    },
    
    // 02. 共识与冲突审计
    audit02: {
      consensus: [],
      gaps: [],
      alignment: 0
    },
    
    // 03. 原子事实清单
    audit03: {
      keyData: [],
      summary: ''
    },
    
    // 04. 底层原理审计
    audit04: {
      logicPath: [],
      glossary: { term: '', explain: '' }
    },
    
    // 05. 逻辑证伪预警
    audit05: {
      redlines: [],
      impact: ''
    },
    
    // 06. 最终情报鉴定
    audit06: {
      finalScore: 0,
      verdictText: '',
      actionStar: 0
    },
    
    // 07. 情报演进时间轴
    audit07: []
  },

  onLoad(options) {
    console.log('=== 七要素页面加载 ===');
    const newsId = options.id;
    const isCustom = options.custom === 'true';
    
    let news = null;
    
    // 如果是自定义情报，从临时存储获取
    if (isCustom) {
      news = wx.getStorageSync('tempAnalysisNews');
      if (news) {
        console.log('加载自定义情报:', news.title);
      }
    } else {
      // 从新闻列表获取
      const newsData = wx.getStorageSync('newsData') || [];
      
      if (!newsData || newsData.length === 0) {
        this.setData({
          loading: false,
          isEmpty: true,
          errorMessage: '暂无新闻数据，请先在首页刷新'
        });
        return;
      }
      
      news = newsData.find(n => String(n.id) === String(newsId));
    }
    
    if (!news) {
      this.setData({
        loading: false,
        isEmpty: true,
        errorMessage: '新闻不存在，请返回首页'
      });
      return;
    }
    
    this.generateAuditWithAI(news);
  },

  async generateAuditWithAI(news) {
    const apiKey = wx.getStorageSync('deepseek_api_key') || 'sk-70dae237a40e444385e0856079829d35';
    
    if (!apiKey) {
      this.setData({
        newsData: news,
        categoryName: this.getCategoryName(news.category),
        ...this.getEmptyData(),
        loading: false,
        errorMessage: '请先配置API密钥'
      });
      return;
    }
    
    try {
      this.setData({ loading: true, newsData: news, categoryName: this.getCategoryName(news.category) });
      
      const auditData = await deepseek.generateSevenElementsAudit(news);
      const pageData = this.transformData(auditData);
      
      this.setData({
        ...pageData,
        loading: false,
        isRealData: true
      });
      
      wx.showToast({ title: '审计完成', icon: 'success' });
    } catch (error) {
      console.error('七要素审计失败:', error);
      this.setData({
        ...this.getEmptyData(),
        loading: false,
        isRealData: false,
        errorMessage: error.message || 'AI审计失败'
      });
      wx.showToast({ title: 'AI审计失败', icon: 'none' });
    }
  },
  
  getEmptyData() {
    return {
      audit01: { score: 0, verifiedFacts: [], conflicts: [], verdict: '' },
      audit02: { consensus: [], gaps: [], alignment: 0 },
      audit03: { keyData: [], summary: '' },
      audit04: { logicPath: [], glossary: { term: '', explain: '' } },
      audit05: { redlines: [], impact: '' },
      audit06: { finalScore: 0, verdictText: '', actionStar: 0 },
      audit07: []
    };
  },
  
  transformData(data) {
    const audit = data.audit || data;
    
    // 01 证据链
    const a01 = audit['01'] || audit.evidence_audit || {};
    const audit01 = {
      score: a01.score || 0,
      verifiedFacts: (a01.verified_facts || []).map(f => typeof f === 'string' ? f : (f.fact || '')),
      conflicts: a01.conflicts || [],
      verdict: a01.verdict || ''
    };
    
    // 02 共识冲突
    const a02 = audit['02'] || {};
    const audit02 = {
      consensus: a02.consensus || [],
      gaps: a02.gaps || [],
      alignment: a02.alignment || 0
    };
    
    // 03 原子事实
    const a03 = audit['03'] || {};
    const audit03 = {
      keyData: (a03.key_data || []).map(d => ({
        key: d.key || d.item || '',
        value: d.value || '',
        status: d.status || '待对证'
      })),
      summary: a03.summary || ''
    };
    
    // 04 底层原理
    const a04 = audit['04'] || {};
    const audit04 = {
      logicPath: a04.logic_path || [],
      glossary: a04.glossary || { term: '', explain: '' }
    };
    
    // 05 证伪预警
    const a05 = audit['05'] || {};
    const audit05 = {
      redlines: (a05.redlines || []).map(r => typeof r === 'string' ? { text: r, impact: '中' } : r),
      impact: a05.impact || '中'
    };
    
    // 06 最终鉴定
    const a06 = audit['06'] || {};
    const audit06 = {
      finalScore: a06.final_score || 0,
      verdictText: a06.verdict_text || '',
      actionStar: a06.action_star || 0
    };
    
    // 07 时间轴
    const a07 = audit['07'] || {};
    const audit07 = a07.steps || [];
    
    return { audit01, audit02, audit03, audit04, audit05, audit06, audit07 };
  },

  getCategoryName(category) {
    const map = { 'AI': 'AI动态', 'tech': '科技', 'finance': '财经', 'international': '国际', 'sports': '体育' };
    return map[category] || category || '资讯';
  },

  goBack() {
    wx.navigateBack();
  },

  shareAnalysis() {
    wx.setClipboardData({
      data: `【七要素审计】${this.data.newsData.title || ''}`,
      success: () => wx.showToast({ title: '已复制', icon: 'success' })
    });
  },

  onShareAppMessage() {
    return {
      title: `【七要素审计】${this.data.newsData.title || ''}`,
      path: `/pages/seven-elements/seven-elements?id=${this.data.newsData.id || ''}`
    };
  }
});
