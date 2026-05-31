// 新用户引导页 - 私人智库初始化
Page({
  data: {
    currentStep: 1,
    totalSteps: 4,
    
    // 第二步：AI人设选择
    selectedPersona: '',
    personas: [
      { id: 'analyst', name: '专业分析师', icon: '📊', desc: '冷峻客观，侧重数据和逻辑' },
      { id: 'geek', name: '毒舌极客', icon: '🤓', desc: '幽默辛辣，侧重技术吐槽' },
      { id: 'mentor', name: '耐心导师', icon: '👨‍🏫', desc: '通俗易懂，侧重科普解释' }
    ],
    
    // 第三步：兴趣标签
    selectedTags: [],
    interestTags: [
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
    
    // 第四步：关键词雷达
    radarKeywords: [],
    newKeyword: '',
    suggestedKeywords: ['华为', '特斯拉', '英伟达', 'OpenAI', '马斯克', '比亚迪', '苹果', '小米'],
    
    // AI定制指令
    aiInstruction: '',
    aiInstructionPlaceholder: '例如：我是一个大厂程序员，关心能提升开发效率的AI工具，以及程序员的职场变动。'
  },

  onLoad() {
    // 检查是否已完成引导
    const hasOnboarded = wx.getStorageSync('hasOnboarded');
    if (hasOnboarded) {
      wx.switchTab({ url: '/pages/index/index' });
    }
  },

  // 步骤导航
  nextStep() {
    const { currentStep, totalSteps, selectedPersona, selectedTags } = this.data;
    
    // 验证当前步骤
    if (currentStep === 2 && !selectedPersona) {
      wx.showToast({ title: '请选择一个AI人设', icon: 'none' });
      return;
    }
    if (currentStep === 3 && selectedTags.length === 0) {
      wx.showToast({ title: '请至少选择一个兴趣标签', icon: 'none' });
      return;
    }
    
    if (currentStep < totalSteps) {
      this.setData({ currentStep: currentStep + 1 });
    }
  },

  prevStep() {
    if (this.data.currentStep > 1) {
      this.setData({ currentStep: this.data.currentStep - 1 });
    }
  },

  // 选择AI人设
  selectPersona(e) {
    const persona = e.currentTarget.dataset.persona;
    this.setData({ selectedPersona: persona });
  },

  // 兴趣标签操作
  toggleTag(e) {
    const tagId = e.currentTarget.dataset.tag;
    let { selectedTags } = this.data;
    
    if (selectedTags.includes(tagId)) {
      selectedTags = selectedTags.filter(t => t !== tagId);
    } else {
      selectedTags = [...selectedTags, tagId];
    }
    
    this.setData({ selectedTags });
  },

  selectAllTags() {
    const allTagIds = this.data.interestTags.map(t => t.id);
    this.setData({ selectedTags: allTagIds });
  },

  clearAllTags() {
    this.setData({ selectedTags: [] });
  },

  // 关键词雷达操作
  onKeywordInput(e) {
    this.setData({ newKeyword: e.detail.value });
  },

  addKeyword() {
    const { newKeyword, radarKeywords } = this.data;
    if (!newKeyword.trim()) return;
    if (radarKeywords.includes(newKeyword.trim())) {
      wx.showToast({ title: '该关键词已存在', icon: 'none' });
      return;
    }
    
    this.setData({
      radarKeywords: [...radarKeywords, newKeyword.trim()],
      newKeyword: ''
    });
  },

  addSuggestedKeyword(e) {
    const keyword = e.currentTarget.dataset.keyword;
    const { radarKeywords } = this.data;
    
    if (!radarKeywords.includes(keyword)) {
      this.setData({ radarKeywords: [...radarKeywords, keyword] });
    }
  },

  removeKeyword(e) {
    const keyword = e.currentTarget.dataset.keyword;
    const radarKeywords = this.data.radarKeywords.filter(k => k !== keyword);
    this.setData({ radarKeywords });
  },

  // AI定制指令
  onAiInstructionInput(e) {
    this.setData({ aiInstruction: e.detail.value });
  },

  // 完成引导
  finish() {
    this.finishOnboarding()
  },

  finishOnboarding() {
    const { selectedPersona, selectedTags, radarKeywords, aiInstruction, interestTags } = this.data;
    
    // 保存所有设置
    wx.setStorageSync('aiPersona', selectedPersona);
    wx.setStorageSync('interestTags', selectedTags);
    wx.setStorageSync('focusKeywords', radarKeywords);
    wx.setStorageSync('aiInstruction', aiInstruction);
    wx.setStorageSync('hasOnboarded', true);
    
    // 根据兴趣标签生成分类偏好
    const tagCategories = selectedTags.map(tagId => {
      const tag = interestTags.find(t => t.id === tagId);
      return tag ? tag.category : null;
    }).filter(Boolean);
    const uniqueCategories = [...new Set(tagCategories)];
    wx.setStorageSync('preferredCategories', uniqueCategories);
    
    wx.showToast({ 
      title: '智库初始化完成！', 
      icon: 'success',
      duration: 1500
    });
    
    setTimeout(() => {
      wx.switchTab({ url: '/pages/index/index' });
    }, 1500);
  },

  // 跳过引导
  skipOnboarding() {
    wx.showModal({
      title: '跳过引导',
      content: '你可以稍后在设置中配置个性化选项',
      confirmText: '跳过',
      cancelText: '继续',
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync('hasOnboarded', true);
          wx.switchTab({ url: '/pages/index/index' });
        }
      }
    });
  }
});
