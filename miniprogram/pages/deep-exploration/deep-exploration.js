// deep-exploration.js - 深度探索（战略智库版 15-21）
const deepseek = require('../../utils/deepseek.js');

Page({
  data: {
    newsData: {},
    loading: false,
    isEmpty: false,
    errorMessage: '',
    isRealData: false,
    expanded: false, // 默认折叠，点击展开（懒加载）
    
    // 20. 显微镜核查（逻辑起点）
    microAuditTarget: '',
    microAuditLogic: '',
    
    // 15. AI推理逻辑树
    reasoningSteps: [],
    
    // 16. 历史相似基因
    historyMatch: '',
    historyLesson: '',
    
    // 17. 隐秘利益图谱
    hiddenInterests: [],
    
    // 18. 生态位扩展
    ecosystemUpstream: [],
    ecosystemDownstream: [],
    ecosystemRivals: [],
    
    // 19. 黑天鹅触发点
    blackSwanTrigger: '',
    
    // 21. 战略终局预言
    strategicOutlook: ''
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
    
    this.setData({ newsData: news });
  },

  // 展开深度探源（懒加载）
  expandResearch() {
    if (this.data.expanded) return;
    this.setData({ expanded: true });
    this.generateResearchWithAI(this.data.newsData);
  },

  async generateResearchWithAI(news) {
    const apiKey = wx.getStorageSync('deepseek_api_key');
    
    if (!apiKey) {
      this.setData({ loading: false, errorMessage: '请先配置API密钥' });
      return;
    }
    
    try {
      this.setData({ loading: true });
      
      const data = await deepseek.generateDeepResearch(news);
      
      console.log('深度探源返回数据:', JSON.stringify(data).substring(0, 300));
      
      // 安全地提取数据，提供默认值
      const safeGet = (obj, key, defaultVal) => {
        return obj && obj[key] !== undefined && obj[key] !== null ? obj[key] : defaultVal;
      };
      
      this.setData({
        // 20 显微镜核查
        microAuditTarget: safeGet(data, 'micro_audit_target', ''),
        microAuditLogic: safeGet(data, 'micro_audit_logic', ''),
        
        // 15 推理链
        reasoningSteps: Array.isArray(data.reasoning_steps) ? data.reasoning_steps : [],
        
        // 16 历史相似
        historyMatch: safeGet(data, 'history_match', ''),
        historyLesson: safeGet(data, 'history_lesson', ''),
        
        // 17 利益图谱
        hiddenInterests: Array.isArray(data.hidden_interests) ? data.hidden_interests : [],
        
        // 18 生态位
        ecosystemUpstream: Array.isArray(data.ecosystem_upstream) ? data.ecosystem_upstream : [],
        ecosystemDownstream: Array.isArray(data.ecosystem_downstream) ? data.ecosystem_downstream : [],
        ecosystemRivals: Array.isArray(data.ecosystem_rivals) ? data.ecosystem_rivals : [],
        
        // 19 黑天鹅
        blackSwanTrigger: safeGet(data, 'black_swan_trigger', ''),
        
        // 21 战略终局
        strategicOutlook: safeGet(data, 'strategic_outlook', ''),
        
        loading: false,
        isRealData: true
      });
      
      wx.showToast({ title: '探源完成', icon: 'success' });
    } catch (error) {
      console.error('深度探源失败:', error);
      this.setData({
        loading: false,
        isRealData: false,
        errorMessage: error.message || 'AI分析失败'
      });
      wx.showToast({ title: 'AI分析失败', icon: 'none' });
    }
  },

  goBack() {
    wx.navigateBack();
  },

  shareAnalysis() {
    const outlook = this.data.strategicOutlook;
    wx.setClipboardData({
      data: `【战略研究】${this.data.newsData.title || ''}\n\n🔮 终局预言：${outlook}`,
      success: () => wx.showToast({ title: '已复制', icon: 'success' })
    });
  },

  onShareAppMessage() {
    return {
      title: `【战略研究】${this.data.newsData.title || ''}`,
      path: `/pages/deep-exploration/deep-exploration?id=${this.data.newsData.id || ''}`
    };
  }
});
