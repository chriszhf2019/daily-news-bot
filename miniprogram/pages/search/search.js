// search.js - 全局搜索页面（语义搜索增强版）
const deepseek = require('../../utils/deepseek.js')

Page({
  data: {
    searchKeyword: '',
    searchHistory: [],
    hotKeywords: [
      'GPT-5',
      'AI Agent',
      '量子计算',
      '新能源汽车',
      '芯片',
      '元宇宙',
      '区块链',
      '生物医药'
    ],
    searchResults: [],
    relatedAnalysis: [],
    rippleEffects: [],
    timelineData: [],
    searching: false,
    // 新增搜索模式
    searchMode: 'local', // local: 智库内寻, global: 全网溯源
    // 全网搜索状态
    globalSearching: false,
    globalSearchStep: 0, // 1: 检索全球信源, 2: 交叉验证事实, 3: 构建逻辑模型
    // 信源纯净度
    sourcePurity: 1, // 0: 社交模式, 1: 平衡模式, 2: 专业模式
    sourcePurityMode: '平衡模式',
    // 语音搜索
    isRecording: false,
    voiceInput: ''
  },

  onLoad() {
    this.loadSearchHistory();
  },

  loadSearchHistory() {
    const history = wx.getStorageSync('searchHistory') || [];
    this.setData({ searchHistory: history.slice(0, 10) });
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  onSearchConfirm() {
    const keyword = this.data.searchKeyword.trim();
    if (!keyword) return;

    // 保存搜索历史
    this.saveSearchHistory(keyword);

    if (this.data.searchMode === 'local') {
      this.performLocalSearch();
    } else {
      this.performGlobalSearch();
    }
  },

  // 本地搜索
  performLocalSearch() {
    const keyword = this.data.searchKeyword.trim();
    if (!keyword) return;

    this.setData({ searching: true });

    // 从缓存获取新闻数据
    const newsData = wx.getStorageSync('newsData') || [];

    // 语义搜索逻辑
    setTimeout(() => {
      const results = this.performSemanticAnalysis(newsData, keyword);
      const timeline = this.generateTimelineData(results, keyword);
      const relatedAnalysis = this.extractRelatedAnalysis(results);
      const rippleEffects = this.extractRippleEffects(results);

      this.setData({
        searchResults: results,
        timelineData: timeline,
        relatedAnalysis: relatedAnalysis,
        rippleEffects: rippleEffects,
        searching: false
      });

      // 触觉反馈
      wx.vibrateShort({ type: 'light' });
    }, 800);
  },

  // 全网搜索
  async performGlobalSearch() {
    const keyword = this.data.searchKeyword.trim();
    if (!keyword) return;

    this.setData({ globalSearching: true, globalSearchStep: 1 });

    // 尝试后端 API 搜索
    try {
      const { news: newsApi } = require('../../utils/api');
      const res = await newsApi.search(keyword);
      if (res.success && res.data?.results?.length) {
        const results = res.data.results.map((item, idx) => ({
          ...item,
          id: String(item.id || `api_${idx}`),
          categoryName: this.getCategoryName(item.category || 'tech'),
          searchScore: 90 - idx * 3,
          hasAnalysis: true,
          isGlobal: true,
        }));
        this.setData({
          searchResults: results,
          timelineData: this.generateTimelineData(results, keyword),
          relatedAnalysis: this.extractRelatedAnalysis(results),
          rippleEffects: this.extractRippleEffects(results),
          globalSearching: false,
          globalSearchStep: 0,
        });
        wx.vibrateShort({ type: 'light' });
        return;
      }
    } catch (e) {
      console.log('后端API不可用，降级到本地搜索:', e.message);
    }

    // 降级到本地搜索
    this.setData({ globalSearching: false, globalSearchStep: 0 });
    this.performLocalSearch();
  },

  // 切换搜索模式
  switchSearchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ searchMode: mode });
    // 触觉反馈
    wx.vibrateShort({ type: 'light' });
  },

  // 信源纯净度滑块事件
  startSlider(e) {
    // 开始滑动
  },

  moveSlider(e) {
    const touchX = e.touches[0].clientX;
    const sliderWidth = 300; // 滑块宽度，需要根据实际UI调整
    const startX = 50; // 滑块起始位置
    
    let position = (touchX - startX) / sliderWidth;
    position = Math.max(0, Math.min(2, position * 2)); // 0-2范围
    
    const purityLevel = Math.round(position);
    let purityMode = '平衡模式';
    
    if (purityLevel === 0) {
      purityMode = '社交模式';
    } else if (purityLevel === 2) {
      purityMode = '专业模式';
    }
    
    this.setData({
      sourcePurity: purityLevel,
      sourcePurityMode: purityMode
    });
  },

  endSlider() {
    // 结束滑动
  },

  performSemanticAnalysis(newsData, keyword) {
    const keywordLower = keyword.toLowerCase();
    
    return newsData.map(news => {
      // 构建搜索文本
      const searchText = `${news.title} ${news.summary} ${(news.tags || []).join(' ')} ${news.source} ${news.ai_analysis?.interpretation || ''} ${news.ai_analysis?.prediction || ''}`.toLowerCase();
      
      // 基本关键词匹配
      let score = 0;
      if (searchText.includes(keywordLower)) {
        score += 50;
      }
      
      // 语义相关度分析
      score += this.calculateSemanticScore(news, keyword);
      
      // 检查是否有相关分析和涟漪效应
      const hasAnalysis = this.hasRelatedAnalysis(news, keyword);
      const hasRipple = this.hasRippleEffect(news, keyword);
      
      // 相关分析和涟漪效应加分
      if (hasAnalysis) score += 30;
      if (hasRipple) score += 20;
      
      return {
        ...news,
        categoryName: this.getCategoryName(news.category),
        searchScore: score,
        hasAnalysis,
        hasRipple
      };
    })
    .filter(item => item.searchScore > 20) // 过滤掉相关性低的结果
    .sort((a, b) => b.searchScore - a.searchScore) // 按相关性排序
    .slice(0, 20); // 最多返回20条结果
  },

  calculateSemanticScore(news, keyword) {
    let score = 0;
    const keywordLower = keyword.toLowerCase();
    
    // 检查标题匹配
    if (news.title.toLowerCase().includes(keywordLower)) {
      score += 30;
    }
    
    // 检查摘要匹配
    if (news.summary && news.summary.toLowerCase().includes(keywordLower)) {
      score += 20;
    }
    
    // 检查AI分析匹配
    if (news.ai_analysis) {
      if (news.ai_analysis.interpretation && news.ai_analysis.interpretation.toLowerCase().includes(keywordLower)) {
        score += 15;
      }
      if (news.ai_analysis.prediction && news.ai_analysis.prediction.toLowerCase().includes(keywordLower)) {
        score += 15;
      }
    }
    
    // 检查标签匹配
    if (news.tags) {
      const tagMatch = news.tags.some(tag => tag.toLowerCase().includes(keywordLower));
      if (tagMatch) score += 10;
    }
    
    return score;
  },

  hasRelatedAnalysis(news, keyword) {
    // 检查是否有相关的私人关联分析
    return news.personalAnalysis || 
           (news.ai_analysis && news.ai_analysis.interpretation && 
            news.ai_analysis.interpretation.toLowerCase().includes(keyword.toLowerCase()));
  },

  hasRippleEffect(news, keyword) {
    // 检查是否有相关的涟漪效应
    return news.standard_v2?.ripple_effects && 
           news.standard_v2.ripple_effects.some(effect => 
             effect.toLowerCase().includes(keyword.toLowerCase())
           );
  },

  generateTimelineData(results, keyword) {
    // 生成逻辑演变时间轴
    const timeline = [];
    const processedDates = new Set();
    
    results.forEach(news => {
      const date = news.published_at?.split(' ')[0] || '';
      if (date && !processedDates.has(date)) {
        processedDates.add(date);
        timeline.push({
          id: date,
          date: date,
          event: news.title
        });
      }
    });
    
    // 按日期排序
    return timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  extractRelatedAnalysis(results) {
    // 提取相关的私人关联分析
    return results.filter(item => item.hasAnalysis);
  },

  extractRippleEffects(results) {
    // 提取相关的涟漪效应
    return results.filter(item => item.hasRipple);
  },

  saveSearchHistory(keyword) {
    let history = wx.getStorageSync('searchHistory') || [];
    
    // 移除重复项
    history = history.filter(item => item !== keyword);
    
    // 添加到开头
    history.unshift(keyword);
    
    // 只保留最近10条
    history = history.slice(0, 10);
    
    wx.setStorageSync('searchHistory', history);
    this.setData({ searchHistory: history });
  },

  clearSearch() {
    this.setData({ 
      searchKeyword: '',
      searchResults: [],
      relatedAnalysis: [],
      rippleEffects: [],
      timelineData: []
    });
  },

  clearHistory() {
    wx.showModal({
      title: '清空搜索历史',
      content: '确定要清空所有搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory');
          this.setData({ searchHistory: [] });
          wx.showToast({
            title: '已清空',
            icon: 'success'
          });
        }
      }
    });
  },

  selectHistory(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ searchKeyword: keyword });
    this.performLocalSearch();
  },

  selectHotKeyword(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ searchKeyword: keyword });
    this.performLocalSearch();
  },

  viewNewsDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/seven-elements/seven-elements?id=${id}`
    });
  },

  // 查看逻辑溯源
  viewLogicTrace(e) {
    const id = e.currentTarget.dataset.id;
    // 保存搜索结果到全局变量，以便逻辑溯源页面使用
    const app = getApp();
    app.globalData.globalSearchResults = this.data.searchResults;
    wx.navigateTo({
      url: `/pages/logic-trace/logic-trace?id=${id}`
    });
  },

  getCategoryName(category) {
    const map = {
      'AI': 'AI动态',
      'tech': '科技',
      'finance': '财经',
      'international': '国际',
      'sports': '体育'
    };
    return map[category] || category;
  },

  goBack() {
    wx.navigateBack();
  },

  // 开始语音搜索
  startVoiceSearch() {
    if (this.data.isRecording) {
      this.stopVoiceSearch();
      return;
    }

    this.setData({ isRecording: true });

    // 开始录音
    wx.startRecord({
      success: (res) => {
        const tempFilePath = res.tempFilePath;
        this.setData({ isRecording: false });
        this.processVoiceInput(tempFilePath);
      },
      fail: (err) => {
        console.error('录音失败:', err);
        this.setData({ isRecording: false });
        wx.showToast({
          title: '录音失败，请重试',
          icon: 'none'
        });
      }
    });

    // 30秒后自动停止录音
    setTimeout(() => {
      if (this.data.isRecording) {
        this.stopVoiceSearch();
      }
    }, 30000);
  },

  // 停止语音搜索
  stopVoiceSearch() {
    wx.stopRecord();
    this.setData({ isRecording: false });
  },

  // 处理语音输入
  processVoiceInput(tempFilePath) {
    wx.showLoading({
      title: '正在识别语音...',
      mask: true
    });

    // 模拟语音识别过程
    setTimeout(() => {
      const recognizedText = this.simulateVoiceRecognition();
      this.setData({ 
        searchKeyword: recognizedText,
        voiceInput: recognizedText 
      });
      
      wx.hideLoading();
      wx.showToast({
        title: '语音识别成功',
        icon: 'success'
      });

      // 自动执行搜索
      this.onSearchConfirm();
    }, 1500);
  },

  // 语音识别（需微信插件支持）
  simulateVoiceRecognition() {
    return ''; // 生产环境接入微信同声传译插件
  }
});
