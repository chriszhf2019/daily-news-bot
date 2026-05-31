import { create } from 'zustand'
import { newsApi, authApi, favoritesApi, focusApi, analysisApi, setAuthToken } from '../services/api'

const useStore = create((set, get) => ({
  // Auth
  user: null,
  isLoggedIn: false,

  login: async (username, password) => {
    const res = await authApi.login(username, password)
    if (res.success && res.data?.access_token) {
      setAuthToken(res.data.access_token)
      set({ user: res.data, isLoggedIn: true })
    }
    return res
  },

  register: async (username, password) => {
    const res = await authApi.register(username, password)
    if (res.success && res.data?.access_token) {
      setAuthToken(res.data.access_token)
      set({ user: res.data, isLoggedIn: true })
    }
    return res
  },

  logout: () => {
    setAuthToken(null)
    set({ user: null, isLoggedIn: false })
  },

  phoneLogin: async (phone, code) => {
    const res = await authApi.phoneLogin(phone, code)
    if (res.success && res.data?.access_token) {
      setAuthToken(res.data.access_token)
      set({ user: res.data, isLoggedIn: true })
    }
    return res
  },

  sendCode: async (phone) => {
    return await authApi.sendCode(phone)
  },

  wechatLogin: async (code) => {
    const res = await authApi.wechatLogin(code)
    if (res.success && res.data?.access_token) {
      setAuthToken(res.data.access_token)
      set({ user: res.data, isLoggedIn: true })
    }
    return res
  },

  // API Config
  apiConfig: {
    deepseekApiKey: '',
    deepseekEndpoint: 'https://api.deepseek.com/v1',
    newsDataApiKey: '',
  },
  setApiConfig: (cfg) => set({ apiConfig: { ...get().apiConfig, ...cfg } }),

  // News
  newsData: [],
  loading: false,
  currentCategory: 'all',
  setLoading: (loading) => set({ loading }),
  setCurrentCategory: (cat) => set({ currentCategory: cat }),

  getFilteredNews: () => {
    const { newsData, currentCategory } = get()
    if (currentCategory === 'all') return newsData
    return newsData.filter(n => n.category === currentCategory)
  },

  initUser: async () => {
    // 向后兼容 — 无操作，仅触发首次数据加载
    const { newsData } = get()
    if (newsData.length === 0) {
      return get().fetchNews()
    }
  },

  fetchNews: async (category) => {
    set({ loading: true })
    try {
      const params = category && category !== 'all' ? { category } : {}
      const res = await newsApi.getList(params)
      const news = res.data?.news || []
      set({ newsData: news, loading: false })
      return news
    } catch (e) {
      console.error('获取新闻失败:', e)
      set({ loading: false })
      return []
    }
  },

  refreshNews: async () => {
    set({ loading: true })
    try {
      const res = await newsApi.getList()
      const news = res.data?.news || []
      set({ newsData: news, loading: false })
      return news
    } catch (e) {
      console.error('刷新新闻失败:', e)
      set({ loading: false })
      throw e
    }
  },

  searchNews: async (keyword) => {
    const res = await newsApi.search(keyword)
    return res.data?.results || []
  },

  // Favorites
  favorites: [],
  loadFavorites: async () => {
    const res = await favoritesApi.list()
    set({ favorites: res.data?.favorites || [] })
  },
  toggleFavorite: async (newsId) => {
    await favoritesApi.add(newsId)
    get().loadFavorites()
  },

  // Focus
  focusPoints: [],
  loadFocusPoints: async () => {
    const res = await focusApi.list()
    set({ focusPoints: res.data?.focus_points || [] })
  },
  addFocusPoint: async (keyword, category) => {
    await focusApi.add(keyword, category)
    get().loadFocusPoints()
  },
  removeFocusPoint: async (id) => {
    await focusApi.remove(id)
    get().loadFocusPoints()
  },

  // Analysis
  analysisHistory: [],
  loadAnalysisHistory: async () => {
    const res = await analysisApi.history()
    set({ analysisHistory: res.data?.analyses || [] })
  },
  runAudit: async (newsId) => {
    const res = await analysisApi.audit(newsId)
    get().loadAnalysisHistory()
    return res.data
  },
  runRelevance: async (newsId) => {
    const res = await analysisApi.relevance(newsId)
    get().loadAnalysisHistory()
    return res.data
  },
  runExploration: async (newsId) => {
    const res = await analysisApi.exploration(newsId)
    get().loadAnalysisHistory()
    return res.data
  },
}))

export default useStore
