/**
 * 后端 API 服务 — 连接 Flask 后端
 */
const API_BASE = 'https://news.velolabs.top/api/v1' // 生产环境

let authToken = null

function setToken(token) {
  authToken = token
  if (token) wx.setStorageSync('authToken', token)
  else wx.removeStorageSync('authToken')
}

function getToken() {
  if (!authToken) authToken = wx.getStorageSync('authToken') || null
  return authToken
}

function request(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json', ...options.headers }
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`

    wx.request({
      url: `${API_BASE}${endpoint}`,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body) : undefined,
      header: headers,
      timeout: 15000,  // 15秒超时，避免冷启动长时间等待
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        } else {
          reject(new Error(res.data?.message || `HTTP ${res.statusCode}`))
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || '网络请求失败'))
      }
    })
  })
}

// Auth
const auth = {
  register: (username, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) }),
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  wechatLogin: (code) =>
    request('/auth/wechat-login', { method: 'POST', body: JSON.stringify({ code }) }),
  phoneLogin: (phone, code) =>
    request('/auth/phone-login', { method: 'POST', body: JSON.stringify({ phone, code }) }),
  sendCode: (phone) =>
    request('/auth/send-code', { method: 'POST', body: JSON.stringify({ phone }) }),
  getProfile: () => request('/auth/profile'),
}

// News
const news = {
  getList: (params = {}) => {
    const qs = Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join('&')
    return request(`/news${qs ? '?' + qs : ''}`)
  },
  search: (keyword, page = 1) =>
    request(`/news/search?keyword=${encodeURIComponent(keyword)}&page=${page}`),
}

// Analysis
const analysis = {
  audit: (newsId) =>
    request('/analysis/audit', { method: 'POST', body: JSON.stringify({ news_id: newsId }) }),
  relevance: (newsId) =>
    request('/analysis/relevance', { method: 'POST', body: JSON.stringify({ news_id: newsId }) }),
  exploration: (newsId) =>
    request('/analysis/exploration', { method: 'POST', body: JSON.stringify({ news_id: newsId }) }),
  history: () => request('/analysis/history'),
}

// Favorites
const favorites = {
  add: (newsId) =>
    request('/news/favorite', { method: 'POST', body: JSON.stringify({ news_id: newsId }) }),
  remove: (newsId) =>
    request(`/news/favorite/${newsId}`, { method: 'DELETE' }),
  list: () => request('/user/favorites'),
}

// Focus
const focus = {
  list: () => request('/user/focus'),
  add: (keyword, category) =>
    request('/user/focus', { method: 'POST', body: JSON.stringify({ keyword, category }) }),
  remove: (id) => request(`/user/focus/${id}`, { method: 'DELETE' }),
}

module.exports = { setToken, getToken, auth, news, analysis, favorites, focus }
