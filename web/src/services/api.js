// 统一 API 服务 — 连接后端 Flask API
const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1'

let authToken = localStorage.getItem('authToken') || null
export function setAuthToken(token) {
  authToken = token
  if (token) localStorage.setItem('authToken', token)
  else localStorage.removeItem('authToken')
}
export function getAuthToken() { return authToken }

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`

  const response = await fetch(url, { ...options, headers })
  const data = await response.json().catch(() => ({ success: false, message: '请求失败' }))

  if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`)
  return data
}

// Auth
export const authApi = {
  register: (username, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) }),
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  getProfile: () => request('/auth/profile'),
}

// News
export const newsApi = {
  getList: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/news${qs ? '?' + qs : ''}`)
  },
  getById: (id) => request(`/news/${id}`),
  search: (keyword, page = 1) =>
    request(`/news/search?keyword=${encodeURIComponent(keyword)}&page=${page}`),
  create: (data) =>
    request('/news', { method: 'POST', body: JSON.stringify(data) }),
}

// Favorites
export const favoritesApi = {
  add: (newsId) =>
    request('/news/favorite', { method: 'POST', body: JSON.stringify({ news_id: newsId }) }),
  remove: (newsId) =>
    request(`/news/favorite/${newsId}`, { method: 'DELETE' }),
  list: () => request('/user/favorites'),
}

// Focus points
export const focusApi = {
  list: () => request('/user/focus'),
  add: (keyword, category) =>
    request('/user/focus', { method: 'POST', body: JSON.stringify({ keyword, category }) }),
  remove: (id) => request(`/user/focus/${id}`, { method: 'DELETE' }),
}

// Analysis
export const analysisApi = {
  audit: (newsId) =>
    request('/analysis/audit', { method: 'POST', body: JSON.stringify({ news_id: newsId }) }),
  relevance: (newsId) =>
    request('/analysis/relevance', { method: 'POST', body: JSON.stringify({ news_id: newsId }) }),
  exploration: (newsId) =>
    request('/analysis/exploration', { method: 'POST', body: JSON.stringify({ news_id: newsId }) }),
  history: () => request('/analysis/history'),
  detail: (id) => request(`/analysis/${id}`),
}
