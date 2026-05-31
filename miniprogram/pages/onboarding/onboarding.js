// 新用户引导 — 3步定制 + 保存全局设置
Page({
  data: {
    currentStep: 1,
    totalSteps: 4,

    // 步骤2：AI风格（影响新闻解读的语气）
    selectedPersona: '',
    personas: [
      { id: 'analyst', name: '专业分析师', icon: '📊',
        desc: '数据驱动，冷静客观，侧重逻辑和趋势',
        style: '用冷静客观的语气，从数据和逻辑角度分析。' },
      { id: 'geek', name: '毒舌极客', icon: '🤓',
        desc: '犀利幽默，直击要害，不拐弯抹角',
        style: '用犀利幽默的语气，直接指出关键问题，不回避争议。' },
      { id: 'mentor', name: '耐心导师', icon: '👨‍🏫',
        desc: '通俗易懂，像老师一样耐心讲解',
        style: '用通俗易懂的语言解释，像老师教学生一样耐心，多用比喻。' },
    ],

    // 步骤3：兴趣标签（影响新闻推送优先级）
    selectedTags: [],
    interestTags: [
      { id: 'ai_model', name: '大模型', icon: '🤖', category: 'AI动态' },
      { id: 'ai_agent', name: 'AI Agent', icon: '🦾', category: 'AI动态' },
      { id: 'chip', name: '半导体/芯片', icon: '💾', category: '科技前沿' },
      { id: 'space', name: '商业航天', icon: '🚀', category: '科技前沿' },
      { id: 'ev', name: '新能源汽车', icon: '🚗', category: '科技前沿' },
      { id: 'biotech', name: '生物医药', icon: '💊', category: '科技前沿' },
      { id: 'quantum', name: '量子计算', icon: '⚛️', category: '科技前沿' },
      { id: 'xr', name: 'XR/元宇宙', icon: '🥽', category: '科技前沿' },
      { id: 'policy', name: '政策法规', icon: '📜', category: '科技前沿' },
      { id: 'geopolitics', name: '地缘政治', icon: '🗺️', category: '科技前沿' },
    ],

    // 步骤4：关键词 + AI指令
    radarKeywords: [],
    newKeyword: '',
    suggestedKeywords: ['华为', '特斯拉', '英伟达', 'OpenAI', '马斯克', '比亚迪', '苹果'],
    aiInstruction: '',
  },

  onLoad() {
    if (wx.getStorageSync('hasOnboarded')) {
      wx.switchTab({ url: '/pages/index/index' })
    }
  },

  // ===== 导航 =====
  nextStep() {
    const { currentStep, totalSteps, selectedPersona, selectedTags } = this.data
    if (currentStep === 2 && !selectedPersona) {
      wx.showToast({ title: '请选择一个AI风格', icon: 'none' }); return
    }
    if (currentStep === 3 && selectedTags.length === 0) {
      wx.showToast({ title: '请至少选一个兴趣领域', icon: 'none' }); return
    }
    if (currentStep < totalSteps) {
      this.setData({ currentStep: currentStep + 1 })
      wx.vibrateShort({ type: 'light' })
    }
  },

  prevStep() {
    if (this.data.currentStep > 1) {
      this.setData({ currentStep: this.data.currentStep - 1 })
    }
  },

  // ===== 步骤2：AI风格 =====
  selectPersona(e) {
    this.setData({ selectedPersona: e.currentTarget.dataset.persona })
    wx.vibrateShort({ type: 'light' })
  },

  // ===== 步骤3：兴趣标签 =====
  toggleTag(e) {
    const tagId = e.currentTarget.dataset.tag
    let tags = [...this.data.selectedTags]
    const idx = tags.indexOf(tagId)
    if (idx > -1) tags.splice(idx, 1)
    else tags.push(tagId)
    this.setData({ selectedTags: tags })
    wx.vibrateShort({ type: 'light' })
  },

  // ===== 步骤4：关键词 =====
  onKeywordInput(e) { this.setData({ newKeyword: e.detail.value }) },

  addKeyword() {
    const kw = this.data.newKeyword.trim()
    if (!kw) return
    if (this.data.radarKeywords.includes(kw)) {
      wx.showToast({ title: '已存在', icon: 'none' }); return
    }
    this.setData({ radarKeywords: [...this.data.radarKeywords, kw], newKeyword: '' })
  },

  addSuggested(e) {
    const kw = e.currentTarget.dataset.keyword
    if (!this.data.radarKeywords.includes(kw)) {
      this.setData({ radarKeywords: [...this.data.radarKeywords, kw] })
    }
  },

  removeKeyword(e) {
    const kw = e.currentTarget.dataset.keyword
    this.setData({ radarKeywords: this.data.radarKeywords.filter(k => k !== kw) })
  },

  onAiInstructionInput(e) { this.setData({ aiInstruction: e.detail.value }) },

  // ===== 完成 =====
  finish() {
    const { selectedPersona, selectedTags, radarKeywords, aiInstruction, interestTags, personas } = this.data

    // 获取选中风格的名字和提示词
    const persona = personas.find(p => p.id === selectedPersona) || personas[0]

    // 保存全局设置
    wx.setStorageSync('aiPersona', selectedPersona)
    wx.setStorageSync('aiPersonaName', persona.name)
    wx.setStorageSync('aiPersonaStyle', persona.style)
    wx.setStorageSync('interestTags', selectedTags)
    wx.setStorageSync('focusKeywords', radarKeywords)
    wx.setStorageSync('aiInstruction', aiInstruction)
    wx.setStorageSync('hasOnboarded', true)

    // 根据兴趣标签生成分类偏好
    const cats = [...new Set(selectedTags.map(id => {
      const tag = interestTags.find(t => t.id === id)
      return tag ? tag.category : null
    }).filter(Boolean))]
    wx.setStorageSync('preferredCategories', cats)

    wx.showToast({ title: '设置完成！', icon: 'success', duration: 1200 })
    setTimeout(() => wx.switchTab({ url: '/pages/index/index' }), 1200)
  },
})
