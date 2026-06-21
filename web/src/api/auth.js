import http from '../lib/request.js'

/**
 * 认证 API
 * 后端: server/routes/auth.js
 */

export const authApi = {
  register: (email, password, name) =>
    http.post('/auth/register', { email, password, name }),

  login: (email, password) =>
    http.post('/auth/login', { email, password }),

  me: () => http.get('/auth/me'),

  updateProfile: (data) => http.put('/auth/profile', data)
}

export default authApi
