// app.js — 新闻情报小程序入口
const { news, favorites } = require('./utils/api')

App({
  onLaunch() {
    // 恢复登录 token
    const token = wx.getStorageSync('authToken')
    if (token) {
      const { setToken } = require('./utils/api')
      setToken(token)
    }

    // 初始化基础缓存
    if (!wx.getStorageSync('favorites')) wx.setStorageSync('favorites', [])
    if (!wx.getStorageSync('readHistory')) wx.setStorageSync('readHistory', [])
    this.globalData.favorites = wx.getStorageSync('favorites') || []

    // 微信自动登录
    this.wechatLogin()

    // 从后端加载真实新闻（不再生成模拟数据）
    this.loadRemoteNews()
  },

  // 微信登录：wx.login 获取 code → 后端换取 token
  async wechatLogin() {
    // 已有 token 则跳过
    if (wx.getStorageSync('authToken')) return

    try {
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({ success: resolve, fail: reject })
      })
      if (!loginRes.code) return

      const { auth } = require('./utils/api')
      const res = await auth.wechatLogin(loginRes.code)
      if (res.success && res.data?.access_token) {
        const { setToken } = require('./utils/api')
        setToken(res.data.access_token)
        this.globalData.userInfo = res.data
        console.log('微信登录成功:', res.data.username)
      }
    } catch (e) {
      console.log('微信登录失败（游客模式）:', e.message)
    }
  },

  // 从后端加载新闻，同步到 Storage 供页面读取
  async loadRemoteNews() {
    try {
      const res = await news.getList({ per_page: 50 })
      if (res.success && res.data?.news?.length) {
        const formatted = res.data.news.map(item => ({
          id: String(item.id),
          title: item.title,
          summary: item.summary || '',
          category: item.category || '综合',
          source: item.source || '未知来源',
          published_at: item.published_at || new Date().toISOString(),
          publishTime: item.published_at || new Date().toISOString(),
          tags: item.tags || [],
          content: item.summary || '',
          sourceUrl: item.source_url || '',
          imageUrl: item.image_url || '',
        }))
        this.globalData.newsData = formatted
        wx.setStorageSync('newsData', formatted)
        console.log(`已从后端加载 ${formatted.length} 条新闻并同步到 Storage`)
      }
    } catch (e) {
      console.log('后端不可用，使用缓存数据:', e.message)
      // 降级：使用 Storage 缓存
      const cached = wx.getStorageSync('newsData') || []
      this.globalData.newsData = cached
    }
  },

  globalData: {
    userInfo: null,
    newsData: [],
    favorites: [],
    currentDate: new Date().toISOString().split('T')[0],
  },

  // 收藏功能
  toggleFavorite(newsItem) {
    const favs = this.globalData.favorites
    const idx = favs.findIndex(item => item.id === newsItem.id)

    if (idx > -1) {
      favs.splice(idx, 1)
      wx.showToast({ title: '已取消收藏', icon: 'success' })
      // 同步到后端
      favorites.remove(newsItem.id).catch(() => {})
    } else {
      favs.push({ ...newsItem, favoriteTime: Date.now() })
      wx.showToast({ title: '收藏成功', icon: 'success' })
      // 同步到后端
      favorites.add(newsItem.id).catch(() => {})
    }

    this.globalData.favorites = favs
    wx.setStorageSync('favorites', favs)
    return favs.length
  },

  isFavorite(newsId) {
    return this.globalData.favorites.some(item => String(item.id) === String(newsId))
  },

  getFavorites() {
    return this.globalData.favorites
  },

  getNewsData() {
    return this.globalData.newsData
  },
})
