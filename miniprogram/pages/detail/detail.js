// detail.js - 深度阅读页面
Page({
  data: {
    newsData: {},
    loading: true,
    themeClass: '',
    categoryName: '',
    readTime: 0,
    viewCount: 0,
    favoriteCount: 0,
    shareCount: 0,
    isFavorited: false,
    contentSections: [],
    keyPoints: [],
    actionChecklist: [],
    aiPersonaName: 'AI助手',
    reliabilityStars: '★★★',
    reliabilityText: '高可靠',
    readProgress: 0
  },

  onLoad(options) {
    const newsId = options.id;
    this.setData({
      themeClass: wx.getStorageSync('themeColor') || '',
      aiPersonaName: wx.getStorageSync('aiPersonaName') || 'AI助手'
    });
    
    this.loadNewsDetail(newsId);
    this.trackPageView(newsId);
  },

  onPageScroll(e) {
    // 计算阅读进度
    const scrollTop = e.scrollTop;
    const scrollHeight = this.data.scrollHeight || 1000;
    const progress = Math.min(Math.round((scrollTop / scrollHeight) * 100), 100);
    
    if (progress !== this.data.readProgress) {
      this.setData({ readProgress: progress });
    }
  },

  onReady() {
    // 获取页面滚动高度
    wx.createSelectorQuery()
      .select('.article-scroll')
      .boundingClientRect(rect => {
        if (rect) {
          this.setData({ scrollHeight: rect.height });
        }
      })
      .exec();
  },

  loadNewsDetail(newsId) {
    wx.showLoading({ title: '加载中...' });

    // 1. 先从本地缓存查找
    const allNews = wx.getStorageSync('newsData') || [];
    const newsData = allNews.find(item => String(item.id) === String(newsId));

    if (newsData) {
      this.processNewsData(newsData);
      return;
    }

    // 2. 本地没有，尝试从后端 API 获取
    this.fetchNewsFromServer(newsId);
  },

  async fetchNewsFromServer(newsId) {
    try {
      const { news: newsApi } = require('../../utils/api');
      // 尝试搜索该新闻
      const res = await newsApi.search(newsId);
      if (res.success && res.data?.results?.length) {
        const item = res.data.results[0];
        this.processNewsData({
          id: String(item.id),
          title: item.title,
          summary: item.summary || '',
          content: item.summary || '',
          category: item.category || '综合',
          source: item.source || '未知来源',
          published_at: item.published_at || '',
          tags: item.tags || [],
          sourceUrl: item.source_url || '',
          imageUrl: item.image_url || '',
        });
        return;
      }
    } catch (e) {
      console.log('后端API详情获取失败:', e.message);
    }

    // 3. 都找不到
    wx.hideLoading();
    wx.showToast({ title: '新闻不存在', icon: 'none' });
    setTimeout(() => wx.navigateBack(), 1500);
  },

  processNewsData(newsData) {
    // 计算阅读时间（假设每分钟阅读300字）
    const wordCount = (newsData.summary || '').length + 
                     (newsData.ai_analysis?.interpretation || '').length +
                     (newsData.ai_analysis?.prediction || '').length;
    const readTime = Math.max(1, Math.ceil(wordCount / 300));

    // 生成内容分段
    const contentSections = this.generateContentSections(newsData);

    // 提取关键要点
    const keyPoints = this.extractKeyPoints(newsData);

    // 生成行动检查单
    const actionChecklist = this.generateActionChecklist(newsData);

    // 获取分类名称
    const categoryName = this.getCategoryName(newsData.category);

    // 获取可靠性信息
    const { reliabilityStars, reliabilityText } = this.getReliabilityInfo(newsData.sourceReliability);

    // 模拟统计数据
    const viewCount = Math.floor(Math.random() * 10000) + 100;
    const favoriteCount = Math.floor(viewCount * 0.1);
    const shareCount = Math.floor(viewCount * 0.05);

    // 检查是否已收藏
    const favorites = wx.getStorageSync('favorites') || [];
    const isFavorited = favorites.some(item => item.id === newsData.id);

    // 确保新闻数据有相关性分析
    if (!newsData.ai_analysis) {
      newsData.ai_analysis = {};
    }
    if (!newsData.ai_analysis.relevance) {
      newsData.ai_analysis.relevance = this.generateRelevanceAnalysis(newsData);
    }

    this.setData({
      newsData,
      loading: false,
      categoryName,
      readTime,
      viewCount,
      favoriteCount,
      shareCount,
      isFavorited,
      contentSections,
      keyPoints,
      actionChecklist,
      reliabilityStars,
      reliabilityText
    });

    wx.hideLoading();
  },

  // 生成相关性分析
  generateRelevanceAnalysis(newsData) {
    const category = newsData.category || '';
    const tags = newsData.tags || [];
    
    let analysis = '';
    
    if (category === 'AI' || category === 'tech') {
      analysis = '此新闻与您的技术领域高度相关，可能影响您的工作或投资决策。建议关注相关技术的发展趋势和应用场景。';
    } else if (category === 'finance') {
      analysis = '此财经新闻可能影响您的投资组合，建议评估相关行业的风险和机会。';
    } else {
      analysis = '此新闻与您的兴趣领域有一定关联，建议了解其潜在影响。';
    }
    
    return analysis;
  },

  // 生成行动检查单
  generateActionChecklist(newsData) {
    const category = newsData.category || '';
    const title = newsData.title || '';
    
    let checklist = [];
    
    if (category === 'AI' || category === 'tech') {
      checklist = [
        { text: '了解相关技术的最新发展', checked: false },
        { text: '评估该技术对工作的潜在影响', checked: false },
        { text: '更新技术储备文档', checked: false }
      ];
    } else if (category === 'finance') {
      checklist = [
        { text: '分析相关行业的投资机会', checked: false },
        { text: '调整相关仓位', checked: false },
        { text: '关注后续市场反应', checked: false }
      ];
    } else {
      checklist = [
        { text: '了解事件的背景和影响', checked: false },
        { text: '与相关人员讨论此事件', checked: false },
        { text: '跟踪事件的后续发展', checked: false }
      ];
    }
    
    return checklist;
  },

  // 切换检查项状态
  toggleChecklistItem(e) {
    const index = e.currentTarget.dataset.index;
    const actionChecklist = [...this.data.actionChecklist];
    actionChecklist[index].checked = !actionChecklist[index].checked;
    
    this.setData({ actionChecklist });
    
    // 同步到待办事项
    this.syncToTodoList(actionChecklist);
  },

  // 同步到待办事项
  syncToTodoList(checklist) {
    const todoList = wx.getStorageSync('todoList') || [];
    const newsId = this.data.newsData.id;
    const newsTitle = this.data.newsData.title;
    
    // 移除该新闻的旧待办事项
    const filteredTodoList = todoList.filter(item => item.newsId !== newsId);
    
    // 添加新的待办事项
    checklist.forEach(item => {
      if (item.checked) {
        filteredTodoList.push({
          id: Date.now() + Math.random(),
          newsId,
          newsTitle,
          text: item.text,
          completed: true,
          createdAt: new Date().toISOString()
        });
      } else {
        filteredTodoList.push({
          id: Date.now() + Math.random(),
          newsId,
          newsTitle,
          text: item.text,
          completed: false,
          createdAt: new Date().toISOString()
        });
      }
    });
    
    wx.setStorageSync('todoList', filteredTodoList);
  },

  generateContentSections(newsData) {
    // 根据新闻内容生成分段
    const sections = [];

    // 如果有完整内容，进行分段
    if (newsData.fullContent) {
      const paragraphs = newsData.fullContent.split('\n\n');
      paragraphs.forEach((para, index) => {
        if (para.trim()) {
          sections.push({
            id: `section-${index}`,
            content: para.trim()
          });
        }
      });
    } else {
      // 如果没有完整内容，使用摘要和AI分析生成内容
      sections.push({
        id: 'intro',
        title: '事件概述',
        content: newsData.summary || '暂无详细内容'
      });

      // 根据分类添加不同的分析维度
      if (newsData.category === 'AI' || newsData.category === 'tech') {
        sections.push({
          id: 'tech-analysis',
          title: '技术分析',
          content: '该事件涉及的核心技术包括：' + (newsData.tags || []).slice(0, 3).join('、') + '等领域。这些技术的发展将对行业产生深远影响。'
        });
      }

      if (newsData.category === 'finance') {
        sections.push({
          id: 'market-impact',
          title: '市场影响',
          content: `该事件对市场的影响力评分为${newsData.impactScore}/10，预计将对相关板块产生${newsData.sentiment === 'positive' ? '积极' : newsData.sentiment === 'negative' ? '负面' : '中性'}影响。`
        });
      }

      sections.push({
        id: 'background',
        title: '背景信息',
        content: `该新闻来自${newsData.source}，发布于${newsData.published_at}。信源可靠性评级为${newsData.sourceReliability || '中等'}。`
      });
    }

    return sections;
  },

  extractKeyPoints(newsData) {
    const keyPoints = [];

    // 从AI分析中提取要点
    if (newsData.ai_analysis?.interpretation) {
      const sentences = newsData.ai_analysis.interpretation.split('。');
      sentences.slice(0, 3).forEach(sentence => {
        if (sentence.trim()) {
          keyPoints.push(sentence.trim() + '。');
        }
      });
    }

    // 如果要点不足，添加一些通用要点
    if (keyPoints.length < 3) {
      keyPoints.push(`该事件的影响力评分为${newsData.impactScore}/10，属于${newsData.impactLabel || '中等影响'}事件。`);
      keyPoints.push(`市场情绪呈现${newsData.sentimentLabel || '中性'}态势，需要持续关注后续发展。`);
      if (newsData.tags && newsData.tags.length > 0) {
        keyPoints.push(`关键词包括：${newsData.tags.slice(0, 5).join('、')}等。`);
      }
    }

    return keyPoints.slice(0, 5);
  },

  getCategoryName(category) {
    const categoryMap = {
      'AI': 'AI动态',
      'tech': '科技前沿',
      'finance': '商业财经',
      'international': '国际要闻',
      'sports': '体育竞技'
    };
    return categoryMap[category] || '综合';
  },

  getReliabilityInfo(reliability) {
    const reliabilityMap = {
      'high': { stars: '★★★', text: '高可靠' },
      'medium': { stars: '★★☆', text: '较可靠' },
      'low': { stars: '★☆☆', text: '待证实' }
    };
    return reliabilityMap[reliability] || reliabilityMap['medium'];
  },

  trackPageView(newsId) {
    // 记录页面浏览
    const viewHistory = wx.getStorageSync('viewHistory') || [];
    const timestamp = new Date().getTime();
    
    viewHistory.unshift({
      newsId,
      timestamp,
      date: new Date().toLocaleDateString()
    });

    // 只保留最近100条记录
    wx.setStorageSync('viewHistory', viewHistory.slice(0, 100));
  },

  toggleFavorite() {
    const favorites = wx.getStorageSync('favorites') || [];
    const newsId = this.data.newsData.id;
    const index = favorites.findIndex(item => item.id === newsId);

    if (index > -1) {
      // 取消收藏
      favorites.splice(index, 1);
      wx.showToast({
        title: '已取消收藏',
        icon: 'success'
      });
      this.setData({ 
        isFavorited: false,
        favoriteCount: Math.max(0, this.data.favoriteCount - 1)
      });
    } else {
      // 添加收藏
      favorites.unshift({
        ...this.data.newsData,
        favoritedAt: new Date().getTime()
      });
      wx.showToast({
        title: '收藏成功',
        icon: 'success'
      });
      this.setData({ 
        isFavorited: true,
        favoriteCount: this.data.favoriteCount + 1
      });
    }

    wx.setStorageSync('favorites', favorites);
  },

  shareArticle() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });

    this.setData({
      shareCount: this.data.shareCount + 1
    });

    wx.showToast({
      title: '分享成功',
      icon: 'success'
    });
  },

  openComments() {
    wx.showToast({
      title: '评论功能开发中',
      icon: 'none'
    });
  },

  exploreTag(e) {
    const tag = e.currentTarget.dataset.tag;
    wx.navigateTo({
      url: `/pages/search/search?keyword=${encodeURIComponent(tag)}`
    });
  },

  openSourceUrl() {
    const url = this.data.newsData.sourceUrl;
    if (url) {
      wx.setClipboardData({
        data: url,
        success: () => {
          wx.showToast({
            title: '链接已复制',
            icon: 'success'
          });
        }
      });
    } else {
      wx.showToast({
        title: '暂无原文链接',
        icon: 'none'
      });
    }
  },

  goBack() {
    wx.navigateBack();
  },

  onShareAppMessage() {
    return {
      title: this.data.newsData.title,
      path: `/pages/detail/detail?id=${this.data.newsData.id}`,
      imageUrl: this.data.newsData.imageUrl || ''
    };
  },

  onShareTimeline() {
    return {
      title: this.data.newsData.title,
      query: `id=${this.data.newsData.id}`,
      imageUrl: this.data.newsData.imageUrl || ''
    };
  }
});
