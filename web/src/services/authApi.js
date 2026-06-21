const API_BASE = import.meta.env.PROD ? '/newsbrief/api' : '/api'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  }
  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || '请求失败')
  return data
}

export const authApi = {
  register: (email, password, name) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  getMe: () => request('/auth/me'),

  updateProfile: (data) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
}

export default authApi
