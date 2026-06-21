import http from '../lib/request.js'
import { buildPrompt, parseJsonResponse, validateAnalysisInput } from './deepseekPrompt.js'

/**
 * AI 分析 API（两种运行模式）
 *
 *   proxy  (推荐) -> 调自建后端 /api/analysis/proxy
 *                     API Key 只在服务端持有，避免泄漏，可限流/审计
 *
 *   direct          -> 浏览器直连 DeepSeek，仅在用户手动填写 API Key 时启用
 *
 * 调用方不需要关心模式选择，在 settings 中配置后，这里按优先级自动选择。
 */

export function resolveAnalysisMode(config) {
  var cfg = config || {}
  var useProxy = cfg.useProxy !== false
  var key = cfg.deepseekApiKey || ''
  if (useProxy) return 'proxy'
  if (key && String(key).indexOf('sk-') === 0) return 'direct'
  return 'proxy'
}

// ---------- 代理模式 ----------
async function proxyAnalyze(payload) {
  var body = {
    type: payload.type,
    newsItem: payload.newsItem,
    persona: payload.persona,
    apiKey: payload.apiKey || undefined,
    endpoint: payload.endpoint || undefined
  }
  return http.post('/analysis/analyze', body)
}

// ---------- 直连模式 ----------
async function directAnalyze(payload) {
  if (!payload.apiKey) {
    throw new Error('缺少 DeepSeek API Key，请先在设置中填写或启用代理模式')
  }
  var base = (payload.endpoint || 'https://api.deepseek.com/v1').replace(/\/+$/, '')
  var built = buildPrompt({ type: payload.type, newsItem: payload.newsItem, persona: payload.persona })
  var prompt = built.prompt

  var resp = await fetch(base + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + payload.apiKey
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 2500,
      response_format: { type: 'json_object' }
    })
  })

  if (!resp.ok) {
    var text = ''
    try { text = await resp.text() } catch (e) { text = '' }
    throw new Error('DeepSeek 请求失败 (HTTP ' + resp.status + '): ' + text.slice(0, 160))
  }

  var data = await resp.json()
  var content = ''
  if (data && data.choices && data.choices[0] && data.choices[0].message) {
    content = data.choices[0].message.content || ''
  }
  return parseJsonResponse(content, { shape: built.outputShape })
}

// ---------- 对外统一入口 ----------
var analysisApi = {
  analyze: async function (opts) {
    var validation = validateAnalysisInput({ type: opts.type, newsItem: opts.newsItem })
    if (validation.error) throw new Error(validation.error)

    var mode = resolveAnalysisMode(opts.config || {})
    var payload = {
      type: opts.type,
      newsItem: validation.value.newsItem,
      persona: opts.persona || 'investor',
      apiKey: opts.config && opts.config.deepseekApiKey,
      endpoint: opts.config && opts.config.deepseekEndpoint
    }

    if (mode === 'direct') return directAnalyze(payload)
    return proxyAnalyze(payload)
  },

  testConnection: async function (opts) {
    var apiKey = opts.apiKey
    if (!apiKey) return { success: false, message: '请先输入 API Key' }
    try {
      var base = (opts.endpoint || 'https://api.deepseek.com/v1').replace(/\/+$/, '')
      var resp = await fetch(base + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          max_tokens: 64,
          messages: [{ role: 'user', content: '请回复"连接成功"' }]
        })
      })
      if (!resp.ok) {
        var text = ''
        try { text = await resp.text() } catch (e) { text = '' }
        return { success: false, message: 'HTTP ' + resp.status + ': ' + text.slice(0, 120) }
      }
      var data = await resp.json()
      var content = ''
      if (data && data.choices && data.choices[0] && data.choices[0].message) {
        content = data.choices[0].message.content || ''
      }
      return { success: true, message: content || '连接成功' }
    } catch (err) {
      return { success: false, message: err && err.message ? err.message : '网络错误' }
    }
  }
}

export { analysisApi }
export default analysisApi
