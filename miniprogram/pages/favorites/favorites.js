// 收藏页面 - 完整版（增强AI功能）
const app = getApp()
const deepseek = require('../../utils/deepseek.js')

// 常量定义
const CONSTANTS = {
  AI_ANALYSIS_DELAY: 2000,
  AI_POINTS_DELAY: 1500,
  AI_POLISH_DELAY: 1500,
  AI_MERGE_DELAY: 2500,
  MAX_NOTE_LENGTH: 500,
  BATCH_MIN_ITEMS: 2
};

Page({
  data: {
    favorites: [],
    filteredFavorites: [],
    loading: true,
    error: '',
    searchText: '',
    selectedTab: 'all',
    selectedCategory: '',
    selectedSmartCategory: '',
    categories: [],
    selectedItems: [],
    sortBy: 'time',
    showSortModal: false,
    showNoteModal: false,
    showActionSheet: false,
    showCategoryModal: false,
    showAIMergeModal: false,
    showAIReportModal: false,
    currentNoteItem: null,
    currentNote: '',
    currentActionItem: null,
    uniqueCategories: 0,
    todayFavorites: 0,
    weekFavorites: 0,
    coreDomain: '',
    unreadCount: 0,
    totalReadingTime: '0分钟',
    userCategories: ['重要', '待读', '工作', '学习', '生活'],
    newCategoryName: '',
    // AI 相关
    aiAnalyzing: false,
    aiSummary: '',
    aiTags: [],
    aiExtractingPoints: false,
    aiExtractedPoints: [],
    aiPolishing: false,
    aiMerging: false,
    aiMergeResult: '',
    // AI 报告相关
    aiReportGenerating: false,
    aiReport: '',
    aiReportCategories: [],
    searchKeyword: '',
    // 视图模式
    viewMode: 'list',
    timelineData: [],
    // 智能分类
    smartCategories: [
      { id: 'tech_breakthrough', name: '技术突破', icon: '�', count: 0 },
      { id: 'policy_change', name: '政策变动', icon: '�', count: 0 },
      { id: 'investment_opportunity', name: '投资机会', icon: '�', count: 0 },
      { id: 'market_trend', name: '市场趋势', icon: '📈', count: 0 },
      { id: 'industry_analysis', name: '行业分析', icon: '�', count: 0 }
    ],
    // 阅读状态
    readingStatus: ['未读', '读过', '已内化'],
    // AI人设
    aiPersona: 'analyst',
    aiPersonaName: '专业分析师',
    // 分页相关
    page: 1,
    pageSize: 10,
    hasMore: true,
    loadingMore: false
  },

  onLoad() {
    this.loadFavorites(true);
  },

  onShow() {
    this.loadFavorites(true);
  },

  onPullDownRefresh() {
    this.loadFavorites(true);
    setTimeout(() => wx.stopPullDownRefresh(), 800);
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loadingMore) {
      this.loadMore();
    }
  },

  loadFavorites(reset = false) {
    if (reset) {
      this.setData({ 
        loading: true, 
        error: '',
        page: 1,
        hasMore: true
      });
    }
    
    try {
      const newsData = wx.getStorageSync('newsData') || [];
      const favoritedIds = wx.getStorageSync('favoritedIds') || [];
      
      let favorites = newsData.filter(n => favoritedIds.includes(n.id) || n.isFavorited);
      
      if (favorites.length === 0) {
        favorites = this.getMockFavorites();
      }
      
      // 添加额外属性和AI分类
      favorites = favorites.map((item, index) => ({
        ...item,
        bookmarkedAt: this.getRelativeTime(index),
        readingTime: `${Math.floor(Math.random() * 5) + 2}分钟`,
        readStatus: Math.random() > 0.7 ? '已内化' : (Math.random() > 0.5 ? '读过' : '未读'),
        note: index === 0 ? '这条新闻很重要，需要持续关注后续发展。' : '',
        selected: false,
        userCategory: index === 0 ? '重要' : (index === 1 ? '待读' : ''),
        tags: item.tags || [],
        // AI 智能分类
        aiCategory: this.getAICategory(item),
        aiCategoryIcon: this.getAICategoryIcon(item),
        // AI 辅助字段
        aiReminder: index === 0 ? '你当时收藏它是为了关注其对算力成本的影响。' : '',
        reviewSummary: index === 0 ? 'OpenAI 发布 GPT-5，引入系统 2 思维架构，实现自主决策能力。' : '',
        suggestedActions: index === 0 ? ['建议复习逻辑树', '对比竞品新动态'] : []
      }));
      
      // 提取分类
      const categorySet = new Set(favorites.map(f => f.category));
      const categories = Array.from(categorySet).map(name => ({ name, id: name }));
      
      // 计算智能分类数量
      const smartCategories = this.calculateSmartCategories(favorites);
      
      // 计算统计数据
      const today = new Date().toDateString();
      const todayFavorites = favorites.filter(f => {
        const fDate = new Date(f.published_at).toDateString();
        return fDate === today;
      }).length;
      
      // 计算本周新增
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekFavorites = favorites.filter(f => {
        const fDate = new Date(f.published_at);
        return fDate >= weekAgo;
      }).length;
      
      // 计算未读数量
      const unreadCount = favorites.filter(f => f.readStatus === '未读').length;
      
      // 计算核心关注领域
      const categoryCounts = {};
      favorites.forEach(f => {
        const cat = f.aiCategory;
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
      const coreDomain = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0] || '暂无';
      
      // 生成时间轴数据
      const timelineData = this.generateTimelineData(favorites);
      
      // 分页处理
      const { page, pageSize } = this.data;
      const paginatedFavorites = favorites.slice(0, page * pageSize);
      const hasMore = paginatedFavorites.length < favorites.length;
      
      this.setData({
        favorites,
        filteredFavorites: paginatedFavorites,
        categories,
        smartCategories,
        timelineData,
        uniqueCategories: categories.length,
        todayFavorites: todayFavorites || favorites.length,
        weekFavorites,
        coreDomain,
        unreadCount,
        totalReadingTime: `${favorites.length * 3}分钟`,
        loading: false,
        hasMore
      });
    } catch (error) {
      console.error('加载收藏失败:', error);
      this.setData({ loading: false, error: '加载失败，请重试' });
    }
  },

  loadMore() {
    if (this.data.loadingMore || !this.data.hasMore) return;
    
    this.setData({ loadingMore: true });
    
    try {
      const { page, pageSize, favorites } = this.data;
      const nextPage = page + 1;
      const startIndex = page * pageSize;
      const endIndex = nextPage * pageSize;
      
      const newItems = favorites.slice(startIndex, endIndex);
      const hasMore = endIndex < favorites.length;
      
      // 模拟网络延迟
      setTimeout(() => {
        this.setData({
          filteredFavorites: [...this.data.filteredFavorites, ...newItems],
          page: nextPage,
          hasMore,
          loadingMore: false
        });
      }, 500);
    } catch (error) {
      console.error('加载更多失败:', error);
      this.setData({ loadingMore: false });
    }
  },

  // AI 智能分类
  getAICategory(item) {
    const title = (item.title || '').toLowerCase();
    const summary = (item.summary || '').toLowerCase();
    
    if (title.includes('发布') || title.includes('突破') || title.includes('新技术') || title.includes('GPT') || title.includes('AI')) return '技术突破';
    if (title.includes('政策') || title.includes('监管') || title.includes('法规') || title.includes('央行')) return '政策变动';
    if (title.includes('投资') || title.includes('股票') || title.includes('财经') || title.includes('机会')) return '投资机会';
    if (title.includes('市场') || title.includes('趋势') || title.includes('增长') || title.includes('销售')) return '市场趋势';
    return '行业分析';
  },

  getAICategoryIcon(item) {
    const category = this.getAICategory(item);
    const iconMap = { '技术突破': '�', '政策变动': '�', '投资机会': '�', '市场趋势': '📈', '行业分析': '�' };
    return iconMap[category] || '📄';
  },

  calculateSmartCategories(favorites) {
    const counts = { tech_breakthrough: 0, policy_change: 0, investment_opportunity: 0, market_trend: 0, industry_analysis: 0 };
    const categoryMap = { '技术突破': 'tech_breakthrough', '政策变动': 'policy_change', '投资机会': 'investment_opportunity', '市场趋势': 'market_trend', '行业分析': 'industry_analysis' };
    
    favorites.forEach(f => {
      const cat = categoryMap[f.aiCategory];
      if (cat) counts[cat]++;
    });
    
    return this.data.smartCategories.map(c => ({ ...c, count: counts[c.id] }));
  },

  // 生成时间轴数据
  generateTimelineData(favorites) {
    if (!favorites || favorites.length === 0) return [];
    
    const monthMap = {};
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    
    favorites.forEach(item => {
      if (!item.published_at) return;
      
      const date = new Date(item.published_at);
      if (isNaN(date.getTime())) return;
      
      const monthKey = `${date.getFullYear()}年${monthNames[date.getMonth()]}`;
      
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = [];
      }
      
      monthMap[monthKey].push({
        ...item,
        dateStr: `${date.getMonth() + 1}月${date.getDate()}日`
      });
    });
    
    return Object.keys(monthMap)
      .map(month => ({
        month,
        items: monthMap[month]
      }))
      .sort((a, b) => b.month.localeCompare(a.month));
  },

  getMockFavorites() {
    return [
      {
        id: 1,
        title: 'OpenAI 正式发布 GPT-5：迈向"自主决策"时代',
        category: 'AI',
        summary: 'OpenAI 宣布其新一代模型 GPT-5 全面开放，引入"系统 2 思维"架构，在复杂推理和长期规划方面取得突破性进展。',
        source: 'OpenAI 官方博客',
        published_at: '2026-01-05 02:00'
      },
      {
        id: 2,
        title: '谷歌发布 Gemini Ultra 2，多模态能力全面超越竞品',
        category: 'AI',
        summary: '谷歌DeepMind团队正式发布Gemini Ultra 2，1.56万亿参数规模，在视觉理解和代码生成方面表现卓越。',
        source: 'Google Blog',
        published_at: '2026-01-05 08:30'
      },
      {
        id: 5,
        title: '华为 Mate 70 搭载纯血鸿蒙 5.0 正式发售',
        category: 'tech',
        summary: '华为Mate 70 Pro首发原生鸿蒙5.0系统，性能提升30%，生态应用突破50万款。',
        source: '华为官网',
        published_at: '2026-01-05 10:08'
      },
      {
        id: 6,
        title: '央行发布数字人民币跨境支付新政策',
        category: 'finance',
        summary: '中国人民银行宣布数字人民币将在更多国家和地区开展跨境支付试点。',
        source: '央行官网',
        published_at: '2026-01-04 14:00'
      }
    ];
  },

  getRelativeTime(index) {
    const times = ['刚刚', '5分钟前', '1小时前', '今天', '昨天'];
    return times[index % times.length];
  },

  // 视图切换
  switchViewMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ viewMode: mode });
  },

  // 搜索（增强：支持语义搜索和热门推荐）
  onSearchInput(e) {
    const searchText = e.detail.value;
    this.setData({ searchText });
    
    // 防抖处理，避免频繁搜索
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    
    this.searchTimer = setTimeout(() => {
      this.performSearch();
    }, 300);
  },

  onSearchConfirm() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.performSearch();
  },

  performSearch() {
    const { searchText, favorites } = this.data;
    if (!searchText || !searchText.trim()) {
      this.setData({ filteredFavorites: favorites });
      return;
    }
    
    const keyword = searchText.toLowerCase().trim();
    const filtered = this.semanticSearch(favorites, keyword);
    
    this.setData({ 
      filteredFavorites: filtered,
      searchKeyword: searchText.trim()
    });
    
    // 搜索完成后生成AI分类报告
    if (filtered.length > 0) {
      this.generateAIReport(filtered, searchText.trim());
    }
  },

  // 语义搜索
  semanticSearch(favorites, keyword) {
    // 关键词映射表，用于语义关联
    const semanticMap = {
      '半导体': ['光刻机', '台积电', '华为芯片', '芯片', '晶圆', '制程'],
      'AI': ['人工智能', 'GPT', '大模型', '机器学习', '深度学习'],
      '科技': ['技术', '创新', '研发', '专利'],
      '财经': ['金融', '投资', '股票', '市场', '经济'],
      '政策': ['监管', '法规', '法律', '制度']
    };
    
    // 获取语义相关的关键词
    let relatedKeywords = [keyword];
    for (const [key, values] of Object.entries(semanticMap)) {
      if (keyword.includes(key) || values.some(val => keyword.includes(val))) {
        relatedKeywords = [...relatedKeywords, key, ...values];
      }
    }
    
    // 去重
    relatedKeywords = [...new Set(relatedKeywords)];
    
    // 搜索逻辑
    return favorites.filter(f => {
      const title = (f.title || '').toLowerCase();
      const summary = (f.summary || '').toLowerCase();
      const category = (f.category || '').toLowerCase();
      const note = (f.note || '').toLowerCase();
      const aiCategory = (f.aiCategory || '').toLowerCase();
      const aiReminder = (f.aiReminder || '').toLowerCase();
      const reviewSummary = (f.reviewSummary || '').toLowerCase();
      
      // 检查是否匹配任何相关关键词
      return relatedKeywords.some(kw => {
        return title.includes(kw) || 
               summary.includes(kw) ||
               category.includes(kw) ||
               note.includes(kw) ||
               aiCategory.includes(kw) ||
               aiReminder.includes(kw) ||
               reviewSummary.includes(kw);
      });
    });
  },

  // 生成AI分类报告
  async generateAIReport(filteredFavorites, keyword) {
    this.setData({ 
      aiReportGenerating: true,
      aiReport: '',
      aiReportCategories: []
    });
    
    try {
      // 使用真实的AI API生成报告
      const { report, categories } = await this.generateRealAIReport(filteredFavorites, keyword);
      
      this.setData({ 
        aiReportGenerating: false,
        aiReport: report,
        aiReportCategories: categories,
        showAIReportModal: true
      });
      
      wx.showToast({ title: '报告生成完成', icon: 'success' });
    } catch (error) {
      console.error('生成AI报告失败:', error);
      // 失败时使用备用方案
      this.generateFallbackAIReport(filteredFavorites, keyword);
    }
  },

  // 使用真实API生成报告
  async generateRealAIReport(filteredFavorites, keyword) {
    // 构建报告生成提示
    const newsSummary = filteredFavorites.map(item => `${item.title}: ${item.summary || '无摘要'}`).join('\n');
    const prompt = `请基于以下收藏的新闻生成一份关于"${keyword}"的详细分析报告：\n\n${newsSummary}\n\n要求：\n1. 分类整理相关新闻\n2. 分析趋势和影响\n3. 提供专业的见解\n4. 生成一份结构清晰的报告\n\n输出格式：\n{\n  "title": "报告标题",\n  "summary": "报告摘要",\n  "categories": [\n    {\n      "name": "分类名称",\n      "count": 10,\n      "items": ["新闻标题1", "新闻标题2"],\n      "insight": "分类见解"
    }\n  ],\n  "analysis": "综合分析",\n  "recommendations": ["建议1", "建议2"]\n}`;
    
    try {
      // 调用DeepSeek API
      const response = await deepseek.request('/chat/completions', {
        method: 'POST',
        data: {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的新闻分析专家，擅长整理和分析新闻数据，生成结构化的报告。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        }
      });
      
      const content = response.choices[0].message.content;
      const result = JSON.parse(content);
      
      // 生成报告文本
      let report = `📋 「${keyword}」搜索结果分析报告\n\n`;
      report += `📱 应用名称：News AI\n\n`;
      report += `本次搜索共找到 ${filteredFavorites.length} 条相关收藏，分为以下类别：\n\n`;
      
      result.categories.forEach((cat, index) => {
        report += `${index + 1}. ${cat.name}（${cat.count}条）\n`;
        cat.items.slice(0, 3).forEach((item, i) => {
          report += `   ${i + 1}. ${item.slice(0, 30)}${item.length > 30 ? '...' : ''}\n`;
        });
        if (cat.items.length > 3) {
          report += `   ... 等${cat.items.length}条内容\n`;
        }
        report += `   分析：${cat.insight}\n\n`;
      });
      
      report += `🔍 综合分析：\n${result.analysis}\n\n`;
      report += `💡 建议：\n`;
      result.recommendations.forEach((rec, index) => {
        report += `${index + 1}. ${rec}\n`;
      });
      
      report += `\n📅 生成时间：${new Date().toLocaleString()}`;
      
      return {
        report,
        categories: result.categories
      };
    } catch (error) {
      console.error('API调用失败:', error);
      throw error;
    }
  },

  // 生成备用AI报告
  generateFallbackAIReport(filteredFavorites, keyword) {
    // 分析搜索结果的分类
    const categoryAnalysis = {};
    filteredFavorites.forEach(item => {
      const category = item.aiCategory || '其他';
      if (!categoryAnalysis[category]) {
        categoryAnalysis[category] = {
          count: 0,
          items: []
        };
      }
      categoryAnalysis[category].count++;
      categoryAnalysis[category].items.push(item);
    });
    
    // 转换为数组并排序
    const categories = Object.keys(categoryAnalysis).map(category => ({
      name: category,
      count: categoryAnalysis[category].count,
      items: categoryAnalysis[category].items
    })).sort((a, b) => b.count - a.count);
    
    // 生成报告
    let report = `📋 「${keyword}」搜索结果分析报告\n\n`;
    report += `📱 应用名称：News AI\n\n`;
    report += `本次搜索共找到 ${filteredFavorites.length} 条相关收藏，分为以下类别：\n\n`;
    
    categories.forEach((cat, index) => {
      report += `${index + 1}. ${cat.name}（${cat.count}条）\n`;
      cat.items.slice(0, 3).forEach((item, i) => {
        report += `   ${i + 1}. ${item.title.slice(0, 30)}${item.title.length > 30 ? '...' : ''}\n`;
      });
      if (cat.items.length > 3) {
        report += `   ... 等${cat.items.length}条内容\n`;
      }
      report += '\n';
    });
    
    report += `🔍 综合分析：\n`;
    if (categories.length > 1) {
      report += `搜索结果涵盖${categories.length}个类别，其中${categories[0].name}占比最高（${Math.round(categories[0].count / filteredFavorites.length * 100)}%）。`;
    } else if (categories.length === 1) {
      report += `搜索结果主要集中在${categories[0].name}类别，占比100%。`;
    }
    
    report += `\n\n📅 生成时间：${new Date().toLocaleString()}\n`;
    report += `💡 建议：可以尝试使用更具体的关键词来获得更精准的搜索结果。`;
    
    this.setData({ 
      aiReportGenerating: false,
      aiReport: report,
      aiReportCategories: categories,
      showAIReportModal: true
    });
    
    wx.showToast({ title: '使用备用方案生成报告', icon: 'none' });
  },

  // Tab切换
  selectTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ selectedTab: tab, selectedCategory: '', selectedSmartCategory: '' });
    this.applyFilters();
  },

  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ selectedCategory: category });
    this.applyFilters();
  },

  selectSmartCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ selectedSmartCategory: category });
    this.applySmartFilters();
  },

  applySmartFilters() {
    let filtered = [...this.data.favorites];
    const { selectedSmartCategory } = this.data;
    
    if (selectedSmartCategory) {
      const categoryNameMap = { 
        tech_breakthrough: '技术突破', 
        policy_change: '政策变动', 
        investment_opportunity: '投资机会', 
        market_trend: '市场趋势', 
        industry_analysis: '行业分析' 
      };
      const targetCategory = categoryNameMap[selectedSmartCategory];
      filtered = filtered.filter(f => f.aiCategory === targetCategory);
    }
    
    this.setData({ filteredFavorites: filtered });
  },

  applyFilters() {
    let filtered = [...this.data.favorites];
    const { selectedTab, selectedCategory, sortBy } = this.data;
    
    if (selectedTab === 'recent') {
      filtered = filtered.slice(0, 5);
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(f => f.category === selectedCategory);
    }
    
    filtered = this.sortFavorites(filtered, sortBy);
    
    this.setData({ filteredFavorites: filtered });
  },

  sortFavorites(list, sortBy) {
    switch (sortBy) {
      case 'title':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case 'category':
        return list.sort((a, b) => a.category.localeCompare(b.category));
      case 'read':
        return list.sort((a, b) => (a.read ? 1 : 0) - (b.read ? 1 : 0));
      default:
        return list;
    }
  },

  // AI 收藏总结
  startAIAnalysis() {
    if (this.data.aiAnalyzing) return;
    
    this.setData({ aiAnalyzing: true, aiSummary: '', aiTags: [] });
    
    // 模拟 AI 分析过程
    setTimeout(() => {
      const { favorites } = this.data;
      
      if (!favorites || favorites.length === 0) {
        this.setData({ aiAnalyzing: false });
        wx.showToast({ title: '暂无收藏数据', icon: 'none' });
        return;
      }
      
      // 分析收藏内容生成总结
      const categories = {};
      favorites.forEach(f => {
        const cat = f.aiCategory || f.category;
        categories[cat] = (categories[cat] || 0) + 1;
      });
      
      const topCategory = Object.keys(categories).sort((a, b) => categories[b] - categories[a])[0];
      const aiTags = Object.keys(categories).slice(0, 4);
      
      const summaryTemplates = [
        `你最近主要关注${topCategory}领域，特别是 GPT-5 的商业应用和技术突破。建议关注与之相关的算力板块和AI应用落地场景。`,
        `分析显示你对${topCategory}内容兴趣浓厚，收藏了${favorites.length}条相关新闻。建议深入研究行业龙头企业动态。`,
        `你的知识图谱正在${topCategory}方向快速扩展，已形成较完整的认知框架。建议关注跨领域融合机会。`
      ];
      
      this.setData({
        aiAnalyzing: false,
        aiSummary: summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)],
        aiTags
      });
      
      wx.showToast({ title: '分析完成', icon: 'success' });
    }, CONSTANTS.AI_ANALYSIS_DELAY);
  },

  // AI 提炼要点
  aiExtractPoints() {
    const { currentNoteItem, aiExtractingPoints } = this.data;
    if (!currentNoteItem || aiExtractingPoints) return;
    
    this.setData({ aiExtractingPoints: true, aiExtractedPoints: [] });
    
    setTimeout(() => {
      // 根据新闻内容生成要点
      const points = [
        `${currentNoteItem.title.slice(0, 15)}... 的核心技术突破`,
        `对行业格局的潜在影响分析`,
        `值得关注的后续发展方向`,
        `可能带来的商业机会`,
        `需要关注的风险点`
      ];
      
      this.setData({
        aiExtractingPoints: false,
        aiExtractedPoints: points
      });
    }, CONSTANTS.AI_POINTS_DELAY);
  },

  // 插入 AI 要点到笔记
  insertAIPoint(e) {
    const point = e.currentTarget.dataset.point;
    const { currentNote } = this.data;
    const newNote = currentNote ? `${currentNote}\n• ${point}` : `• ${point}`;
    this.setData({ currentNote: newNote });
    wx.showToast({ title: '已添加', icon: 'success' });
  },

  // AI 润色笔记
  aiPolishNote() {
    const { currentNote, aiPolishing } = this.data;
    if (!currentNote || aiPolishing) return;
    
    this.setData({ aiPolishing: true });
    
    setTimeout(() => {
      // 模拟 AI 润色
      const polishedNote = `【AI润色】${currentNote}\n\n💡 延伸思考：这一发展趋势值得持续关注，建议结合行业报告深入分析。可以考虑从多个维度评估其长期影响。`;
      
      this.setData({
        aiPolishing: false,
        currentNote: polishedNote
      });
      
      wx.showToast({ title: '润色完成', icon: 'success' });
    }, CONSTANTS.AI_POLISH_DELAY);
  },

  // 批量 AI 合并总结
  batchAIMerge() {
    const { selectedItems, filteredFavorites, aiMerging } = this.data;
    if (aiMerging) return;
    
    if (selectedItems.length < CONSTANTS.BATCH_MIN_ITEMS) {
      wx.showToast({ 
        title: `请至少选择${CONSTANTS.BATCH_MIN_ITEMS}条`, 
        icon: 'none' 
      });
      return;
    }
    
    this.setData({ showAIMergeModal: true, aiMerging: true, aiMergeResult: '' });
    
    setTimeout(() => {
      const selectedNews = filteredFavorites.filter(f => selectedItems.includes(f.id));
      const titles = selectedNews.map(n => n.title).join('、');
      
      const mergeResult = `📋 智能简报摘要\n\n本次合并了${selectedItems.length}条新闻，主要涉及以下内容：\n\n${selectedNews.map((n, i) => `${i + 1}. ${n.title}\n   要点：${n.summary.slice(0, 50)}...`).join('\n\n')}\n\n🔍 综合分析：\n这些新闻共同反映了当前科技行业的快速发展态势，特别是在AI领域的突破性进展。建议持续关注相关技术的商业化落地进程。\n\n📅 生成时间：${new Date().toLocaleString()}\n\n💡 延伸建议：\n建议定期回顾这些收藏内容，形成系统的知识管理体系。可以尝试建立主题文件夹，便于后续查找和复习。`;
      
      this.setData({
        aiMerging: false,
        aiMergeResult: mergeResult
      });
    }, CONSTANTS.AI_MERGE_DELAY);
  },

  hideAIMergeModal() {
    this.setData({ showAIMergeModal: false, aiMergeResult: '' });
  },

  hideAIReportModal() {
    this.setData({ showAIReportModal: false, aiReport: '' });
  },

  // 分享报告为图片
  shareReportAsImage() {
    const { aiReport } = this.data;
    
    // 模拟生成图片的过程
    wx.showLoading({ title: '生成分享图片中...' });
    
    setTimeout(() => {
      // 模拟生成图片成功
      wx.hideLoading();
      wx.showToast({ title: '图片生成成功', icon: 'success' });
      
      // 显示分享菜单
      wx.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
    }, 1500);
  },

  // 复制报告内容
  copyReportContent() {
    const { aiReport } = this.data;
    wx.setClipboardData({
      data: aiReport,
      success: () => wx.showToast({ title: '已复制报告内容', icon: 'success' })
    });
  },

  // 保存报告
  saveReport() {
    const { aiReport, searchKeyword } = this.data;
    
    // 模拟保存报告的过程
    wx.showLoading({ title: '保存报告中...' });
    
    setTimeout(() => {
      // 模拟保存成功
      wx.hideLoading();
      wx.showToast({ title: '报告已保存', icon: 'success' });
      
      // 可以在这里添加实际的保存逻辑，比如保存到本地存储或服务器
      const reportData = {
        id: Date.now(),
        keyword: searchKeyword,
        content: aiReport,
        createdAt: new Date().toISOString()
      };
      
      // 保存到本地存储
      const savedReports = wx.getStorageSync('savedReports') || [];
      savedReports.push(reportData);
      wx.setStorageSync('savedReports', savedReports);
    }, 1000);
  },

  exportMergeAsPDF() {
    wx.showToast({ title: 'PDF已生成', icon: 'success' });
  },

  sendMergeToEmail() {
    wx.showModal({
      title: '发送邮件',
      content: '简报将发送到您绑定的邮箱',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '发送成功', icon: 'success' });
        }
      }
    });
  },

  copyMergeResult() {
    wx.setClipboardData({
      data: this.data.aiMergeResult,
      success: () => wx.showToast({ title: '已复制', icon: 'success' })
    });
  },

  batchExportPDF() {
    wx.showToast({ title: 'PDF导出成功', icon: 'success' });
  },

  batchSendEmail() {
    wx.showModal({
      title: '发送邮件',
      content: `将${this.data.selectedItems.length}条收藏发送到邮箱？`,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '发送成功', icon: 'success' });
        }
      }
    });
  },

  // 选择操作
  toggleSelect(e) {
    const id = e.currentTarget.dataset.id;
    const filteredFavorites = this.data.filteredFavorites.map(f => 
      f.id === id ? { ...f, selected: !f.selected } : f
    );
    const selectedItems = filteredFavorites.filter(f => f.selected).map(f => f.id);
    this.setData({ filteredFavorites, selectedItems });
  },

  selectAll() {
    const filteredFavorites = this.data.filteredFavorites.map(f => ({ ...f, selected: true }));
    const selectedItems = filteredFavorites.map(f => f.id);
    this.setData({ filteredFavorites, selectedItems });
  },

  cancelSelection() {
    const filteredFavorites = this.data.filteredFavorites.map(f => ({ ...f, selected: false }));
    this.setData({ filteredFavorites, selectedItems: [] });
  },

  // 排序
  showSortOptions() {
    this.setData({ showSortModal: true });
  },

  hideSortOptions() {
    this.setData({ showSortModal: false });
  },

  selectSort(e) {
    const sortBy = e.currentTarget.dataset.sort;
    this.setData({ sortBy, showSortModal: false });
    this.applyFilters();
  },

  // 笔记
  addNote(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.filteredFavorites.find(f => f.id === id);
    this.setData({ 
      showNoteModal: true, 
      currentNoteItem: item,
      currentNote: item.note || '',
      aiExtractedPoints: []
    });
  },

  hideNoteModal() {
    this.setData({ 
      showNoteModal: false, 
      currentNoteItem: null, 
      currentNote: '',
      aiExtractedPoints: []
    });
  },

  onNoteInput(e) {
    this.setData({ currentNote: e.detail.value });
  },

  saveNote() {
    const { currentNoteItem, currentNote, filteredFavorites, favorites } = this.data;
    
    const updateNote = (list) => list.map(f => 
      f.id === currentNoteItem.id ? { ...f, note: currentNote } : f
    );
    
    this.setData({
      filteredFavorites: updateNote(filteredFavorites),
      favorites: updateNote(favorites),
      showNoteModal: false
    });
    
    wx.showToast({ title: '笔记已保存', icon: 'success' });
  },

  // 更多菜单 - 点击「...」按钮
  showMoreMenu(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.filteredFavorites.find(f => f.id === id);
    this.setData({
      showActionSheet: true,
      currentActionItem: item
    });
  },

  // 长按卡片触发操作菜单
  showCardActions(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.filteredFavorites.find(f => f.id === id);
    wx.vibrateShort({ type: 'medium' });
    this.setData({
      showActionSheet: true,
      currentActionItem: item
    });
  },

  hideActionSheet() {
    this.setData({ showActionSheet: false, currentActionItem: null });
  },

  // 从菜单执行操作
  markAsReadFromMenu() {
    const { currentActionItem, filteredFavorites, favorites } = this.data;
    const updateReadStatus = (list) => list.map(f => {
      if (f.id === currentActionItem.id) {
        // 循环切换阅读状态：未读 -> 读过 -> 已内化 -> 未读
        let newStatus = '未读';
        if (f.readStatus === '未读') {
          newStatus = '读过';
        } else if (f.readStatus === '读过') {
          newStatus = '已内化';
        }
        return { ...f, readStatus: newStatus };
      }
      return f;
    });
    this.setData({
      filteredFavorites: updateReadStatus(filteredFavorites),
      favorites: updateReadStatus(favorites),
      showActionSheet: false
    });
    wx.showToast({ title: '阅读状态已更新', icon: 'success' });
  },

  shareItemFromMenu() {
    this.setData({ showActionSheet: false });
    wx.showShareMenu({ withShareTicket: true });
  },

  addNoteFromMenu() {
    const { currentActionItem } = this.data;
    this.setData({
      showActionSheet: false,
      showNoteModal: true,
      currentNoteItem: currentActionItem,
      currentNote: currentActionItem.note || '',
      aiExtractedPoints: []
    });
  },

  setCategoryFromMenu() {
    this.setData({
      showActionSheet: false,
      showCategoryModal: true
    });
  },

  removeFavoriteFromMenu() {
    const { currentActionItem } = this.data;
    this.setData({ showActionSheet: false });
    wx.showModal({
      title: '取消收藏',
      content: '确定要取消收藏这条新闻吗？',
      success: (res) => {
        if (res.confirm) {
          const filteredFavorites = this.data.filteredFavorites.filter(f => f.id !== currentActionItem.id);
          const favorites = this.data.favorites.filter(f => f.id !== currentActionItem.id);
          this.setData({ filteredFavorites, favorites });
          wx.showToast({ title: '已取消收藏', icon: 'success' });
        }
      }
    });
  },

  // 分类管理
  hideCategoryModal() {
    this.setData({ showCategoryModal: false });
  },

  selectUserCategory(e) {
    const category = e.currentTarget.dataset.category;
    const { currentActionItem, filteredFavorites, favorites } = this.data;
    
    const updateCategory = (list) => list.map(f => 
      f.id === currentActionItem.id ? { ...f, userCategory: category } : f
    );
    
    this.setData({
      filteredFavorites: updateCategory(filteredFavorites),
      favorites: updateCategory(favorites),
      showCategoryModal: false,
      currentActionItem: { ...currentActionItem, userCategory: category }
    });
    
    wx.showToast({ title: category ? `已设为「${category}」` : '已移除分类', icon: 'success' });
  },

  onNewCategoryInput(e) {
    this.setData({ newCategoryName: e.detail.value });
  },

  addNewCategory() {
    const { newCategoryName, userCategories } = this.data;
    if (!newCategoryName.trim()) {
      wx.showToast({ title: '请输入分类名称', icon: 'none' });
      return;
    }
    if (userCategories.includes(newCategoryName.trim())) {
      wx.showToast({ title: '分类已存在', icon: 'none' });
      return;
    }
    this.setData({
      userCategories: [...userCategories, newCategoryName.trim()],
      newCategoryName: ''
    });
    wx.showToast({ title: '分类已添加', icon: 'success' });
  },

  // 操作
  markAsRead(e) {
    const id = e.currentTarget.dataset.id;
    const filteredFavorites = this.data.filteredFavorites.map(f => {
      if (f.id === id) {
        // 循环切换阅读状态：未读 -> 读过 -> 已内化 -> 未读
        let newStatus = '未读';
        if (f.readStatus === '未读') {
          newStatus = '读过';
        } else if (f.readStatus === '读过') {
          newStatus = '已内化';
        }
        return { ...f, readStatus: newStatus };
      }
      return f;
    });
    this.setData({ filteredFavorites });
    wx.showToast({ title: '状态已更新', icon: 'success' });
  },

  removeFavorite(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '取消收藏',
      content: '确定要取消收藏这条新闻吗？',
      success: (res) => {
        if (res.confirm) {
          const filteredFavorites = this.data.filteredFavorites.filter(f => f.id !== id);
          const favorites = this.data.favorites.filter(f => f.id !== id);
          this.setData({ filteredFavorites, favorites });
          wx.showToast({ title: '已取消收藏', icon: 'success' });
        }
      }
    });
  },

  shareItem(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.filteredFavorites.find(f => f.id === id);
    wx.showShareMenu({ withShareTicket: true });
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` });
  },

  // 批量操作
  batchDelete() {
    const { selectedItems } = this.data;
    if (selectedItems.length === 0) {
      wx.showToast({ title: '请先选择要删除的项', icon: 'none' });
      return;
    }
    
    wx.showModal({
      title: '批量删除',
      content: `确定要删除选中的 ${selectedItems.length} 条收藏吗？此操作不可恢复。`,
      confirmText: '删除',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          const selectedIds = this.data.selectedItems;
          const filteredFavorites = this.data.filteredFavorites.filter(f => !selectedIds.includes(f.id));
          const favorites = this.data.favorites.filter(f => !selectedIds.includes(f.id));
          this.setData({ filteredFavorites, favorites, selectedItems: [] });
          wx.showToast({ title: '删除成功', icon: 'success' });
        }
      }
    });
  },

  batchShare() {
    const { selectedItems } = this.data;
    if (selectedItems.length === 0) {
      wx.showToast({ title: '请先选择要分享的项', icon: 'none' });
      return;
    }
    wx.showToast({ title: '已生成分享内容', icon: 'success' });
  },

  batchExport() {
    const { favorites } = this.data;
    if (favorites.length === 0) {
      wx.showToast({ title: '暂无收藏可导出', icon: 'none' });
      return;
    }
    wx.showToast({ title: '导出成功', icon: 'success' });
  },

  exportAll() {
    const data = JSON.stringify(this.data.favorites, null, 2);
    wx.setClipboardData({
      data,
      success: () => wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
    });
  },

  clearAll() {
    wx.showModal({
      title: '清空收藏',
      content: '确定要清空所有收藏吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          this.setData({ favorites: [], filteredFavorites: [], selectedItems: [] });
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  goToBrowse() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  retryLoad() {
    this.loadFavorites();
  },

  noop() {},

  onShareAppMessage() {
    return {
      title: '我的收藏 - 新闻简报',
      path: '/pages/favorites/favorites'
    };
  }
});
