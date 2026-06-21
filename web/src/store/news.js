import { create } from 'zustand'
import { newsApi } from '../api/news.js'
import { MOCK_NEWS } from '../lib/mockNews.js'
import { resolveCategory } from '../lib/categories.js'
import useSettingsStore from '../store/settings.js'
// 延迟读取 settings 中的开关，避免初始化顺序问题
function readUseMockOnFallback() {
  try {
    if (useSettingsStore && typeof useSettingsStore.getState === 'function') {
      return useSettingsStore.getState().useMockOnFallback !== false
    }
  } catch (e) { /* ignore */ }
  return true
}

/**
 * 新闻 / 分析结果 / 收藏 状态
 *
 * - newsData: 完整列表
 * - currentCategory: 当前过滤分类（'all' 或 具体 category key）
 * - loading / error / source: 状态
 * - favorites: Set<newsId>，本地持久化
 * - init / fetchNews / refreshNews：数据生命周期
 * - addCustomNews: 用户手动录入新闻（InputModal 调用）
 */

var persistFavorites = {
  load: function () {
    try {
      var raw = localStorage.getItem('favorites') || '[]'
      return new Set(JSON.parse(raw))
    } catch (e) {
      return new Set()
    }
  },
  save: function (set) {
    try {
      localStorage.setItem('favorites', JSON.stringify(Array.from(set)))
    } catch (e) { /* noop */ }
  }
}

function normalizeNews(list) {
  if (!Array.isArray(list)) return []
  return list.map(function (item) {
    var resolved = resolveCategory(item.category)
    var importance = Number(item.importance != null ? item.importance : (item.impactScore != null ? item.impactScore : 50)) || 50
    var impactScore = Number(item.impactScore != null ? item.impactScore : Math.round(importance / 10))
    if (isNaN(impactScore)) impactScore = 0
    return {
      id: item.id || item.newsId || String(Date.now()) + Math.random().toString(36).slice(2, 7),
      title: String(item.title || '').trim(),
      summary: String(item.summary || item.description || '').trim(),
      content: String(item.content || item.summary || item.description || '').trim(),
      source: String(item.source || item.source_name || '未知').trim(),
      published_at: item.published_at || item.publishedAt || new Date().toISOString(),
      category: resolved.key,
      categoryLabel: resolved.label,
      tags: Array.isArray(item.tags) ? item.tags : [],
      url: item.url || '',
      image: item.image || item.image_url || '',
      importance: Math.min(100, Math.max(0, importance)),
      impactScore: Math.min(10, Math.max(0, impactScore)),
      isCustom: !!item.isCustom
    }
  }).filter(function (n) { return n.title.length > 0 })
}

var useNewsStore = create(function (set, get) {
  return {
    newsData: [],
    currentCategory: 'all',
    loading: false,
    error: null,
    source: null, // 'backend' | 'mock' | 'empty'
    refreshAt: null,
    favorites: persistFavorites.load(),

    setCurrentCategory: function (key) { set({ currentCategory: key }) },

    setNewsData: function (data, opts) {
      var source = (opts && opts.source) || 'backend'
      set({ newsData: normalizeNews(data), source: source, error: null })
    },

    addCustomNews: function (news) {
      var full = Object.assign({}, news, { isCustom: true })
      var list = normalizeNews([full].concat(get().newsData))
      set({ newsData: list })
      return list[0]
    },

    toggleFavorite: function (newsId) {
      var next = new Set(get().favorites)
      if (next.has(newsId)) { next.delete(newsId) } else { next.add(newsId) }
      persistFavorites.save(next)
      set({ favorites: next })
    },

    findNews: function (id) {
      var list = get().newsData
      for (var i = 0; i < list.length; i++) {
        if (String(list[i].id) === String(id)) return list[i]
      }
      return null
    },

    getFilteredNews: function () {
      var newsData = get().newsData
      var cat = get().currentCategory
      if (cat === 'all') return newsData
      return newsData.filter(function (n) { return n.category === cat })
    },

    getStats: function () {
      var newsData = get().newsData
      var favs = get().favorites
      var avg = 0
      if (newsData.length > 0) {
        var total = 0
        for (var i = 0; i < newsData.length; i++) { total += newsData[i].importance || 0 }
        avg = Math.round(total / newsData.length)
      }
      var highImpact = 0
      var favCount = 0
      for (var j = 0; j < newsData.length; j++) {
        var item = newsData[j]
        if ((item.importance || 0) >= 80 || (item.impactScore || 0) >= 8) highImpact++
        if (favs.has(String(item.id))) favCount++
      }
      return { total: newsData.length, highImpact: highImpact, avgImportance: avg, favorites: favCount, signals: highImpact }
    },

    fetchNews: async function (opts) {
      set({ loading: true, error: null })
      var options = opts || {}
      try {
        var params = (options.category && options.category !== 'all') ? { category: options.category } : {}
        var data = await newsApi.list(params)
        var list = Array.isArray(data) ? data : ((data && (data.news || data.data)) || [])
        set({ newsData: normalizeNews(list), source: 'backend', loading: false, refreshAt: new Date().toISOString() })
        return true
      } catch (err) {
        // 优雅降级：读取 settings 中的 useMockOnFallback
        var useMock = readUseMockOnFallback()
        if (options.useMock === false) useMock = false
        if (useMock) {
          set({
            newsData: normalizeNews(MOCK_NEWS),
            source: 'mock',
            loading: false,
            error: '后端不可达，已展示示例新闻'
          })
          return true
        }
        set({ loading: false, error: err && err.message ? err.message : '获取新闻失败' })
        throw err
      }
    },

    refreshNews: async function () {
      set({ loading: true, error: null })
      try {
        try { await newsApi.refresh() } catch (e) { /* 很多后端暂未实现 refresh 接口 */ }
        var data = await newsApi.list()
        var list = Array.isArray(data) ? data : ((data && (data.news || data.data)) || [])
        set({
          newsData: normalizeNews(list),
          source: 'backend',
          loading: false,
          refreshAt: new Date().toISOString()
        })
        return true
      } catch (err) {
        // 同样降级
        set({
          newsData: normalizeNews(MOCK_NEWS),
          source: 'mock',
          loading: false,
          error: '后端不可达，已展示示例新闻'
        })
        return false
      }
    },

    init: async function () {
      if (get().newsData.length > 0) return
      await get().fetchNews()
    }
  }
})

export default useNewsStore
