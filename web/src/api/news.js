import http from '../lib/request.js'

/**
 * 新闻 / 用户数据 API
 *   /api/news/*        -> server/routes/news.js
 *   /api/user/*        -> server/routes/user.js
 */

export const newsApi = {
  list: (params) => http.get('/news', params),
  get: (id) => http.get(`/news/${id}`),
  refresh: () => http.post('/news/refresh'),
  create: (data) => http.post('/news', data)
}

export const userApi = {
  init: (visitorId) => http.post('/user/init', { visitorId }),
  getSettings: (userId) => http.get(`/user/${userId}/settings`),
  updateSettings: (userId, data) => http.put(`/user/${userId}/settings`, data),
  addFavorite: (userId, newsId) => http.post(`/user/${userId}/favorites`, { newsId }),
  removeFavorite: (userId, newsId) => http.delete(`/user/${userId}/favorites/${newsId}`),
  getFavorites: (userId) => http.get(`/user/${userId}/favorites`),
  addHistory: (userId, newsId) => http.post(`/user/${userId}/history`, { newsId }),
  getHistory: (userId, limit) => http.get(`/user/${userId}/history`, { limit })
}

export default { newsApi, userApi }
