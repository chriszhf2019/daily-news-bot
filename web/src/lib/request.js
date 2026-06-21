/**
 * 轻量 HTTP 客户端（浏览器端 · 无外部依赖）
 *
 * 使用示例：
 *   import http from './lib/request.js'
 *   http.get('/news', { category: 'tech' })
 *   http.post('/auth/login', { email, password })
 *   http.put('/user/1/profile', { name: 'A' })
 *   http.delete('/user/1/favorites/x', { reason: 'done' })
 *
 * 特性：
 *   · 自动使用 Vite 代理（开发期）或相对路径（生产/同域部署），无需显式 baseURL
 *   · 自动从 localStorage 读取 Bearer token 注入
 *   · 超时有 AbortController 中断
 *   · 响应同时接受 JSON / 纯文本；非 2xx 统一抛 RequestError
 */

var DEFAULT_TIMEOUT_MS = 15000
var TOKEN_KEY = 'auth_token'

function RequestError(message, status, body) {
  var err = new Error(message)
  err.name = 'RequestError'
  err.status = status || 0
  err.body = body || null
  return err
}

function readAuthToken() {
  try {
    var token = localStorage.getItem(TOKEN_KEY)
    return token || ''
  } catch (e) {
    return ''
  }
}

function appendQuery(url, params) {
  if (!params || typeof params !== 'object') return url
  var keys = Object.keys(params)
  if (keys.length === 0) return url
  var parts = []
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i]
    var v = params[k]
    if (v === undefined || v === null) continue
    parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(v)))
  }
  if (parts.length === 0) return url
  var sep = url.indexOf('?') >= 0 ? '&' : '?'
  return url + sep + parts.join('&')
}

async function parseResponse(resp) {
  var text = ''
  try {
    text = await resp.text()
  } catch (e) {
    text = ''
  }
  if (!text) return null
  var trimmed = text.trim()
  var first = trimmed.charCodeAt(0)
  // 尝试 JSON 解析：对象 {、数组 [、字符串 "、数字 0-9、布尔值 t/f、null
  if (
    first === 123 || first === 91 || first === 34 ||
    (first >= 48 && first <= 57) || first === 45 ||
    first === 116 || first === 102 || first === 110
  ) {
    try { return JSON.parse(trimmed) } catch (e) { /* 退回原始文本 */ }
  }
  return text
}

async function coreRequest(path, options) {
  var opts = options || {}
  var method = (opts.method || 'GET').toUpperCase()
  var url = path

  // query
  if (opts.params) url = appendQuery(url, opts.params)

  // headers
  var headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {})
  var token = readAuthToken()
  if (token) headers['Authorization'] = 'Bearer ' + token

  // body
  var body = undefined
  if (opts.body !== undefined && opts.body !== null) {
    if (typeof opts.body === 'string') {
      body = opts.body
    } else {
      try { body = JSON.stringify(opts.body) } catch (e) { body = '{}' }
    }
  }

  // timeout
  var timeoutMs = opts.timeoutMs || DEFAULT_TIMEOUT_MS
  var controller = typeof AbortController !== 'undefined' ? new AbortController() : null
  var timeoutId = null
  if (controller) {
    timeoutId = setTimeout(function () { controller.abort() }, timeoutMs)
  }

  var resp = null
  try {
    resp = await fetch(url, {
      method: method,
      headers: headers,
      body: body,
      signal: controller ? controller.signal : undefined,
      credentials: opts.credentials || 'same-origin'
    })
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId)
    var message = (err && err.name === 'AbortError') ? '请求超时' : (err && err.message ? err.message : '网络异常')
    throw RequestError(message, 0, null)
  }
  if (timeoutId) clearTimeout(timeoutId)

  var parsed = await parseResponse(resp)

  if (!resp.ok) {
    var message = '请求失败(' + resp.status + ')'
    if (parsed && typeof parsed === 'object' && parsed.message) message = parsed.message
    else if (typeof parsed === 'string' && parsed) message = parsed.slice(0, 120)
    throw RequestError(message, resp.status, parsed)
  }

  return parsed
}

var http = {
  get: function (path, params, options) { return coreRequest(path, Object.assign({}, options || {}, { method: 'GET', params: params })) },
  post: function (path, body, options) { return coreRequest(path, Object.assign({}, options || {}, { method: 'POST', body: body })) },
  put: function (path, body, options) { return coreRequest(path, Object.assign({}, options || {}, { method: 'PUT', body: body })) },
  delete: function (path, body, options) { return coreRequest(path, Object.assign({}, options || {}, { method: 'DELETE', body: body })) }
}

export default http
