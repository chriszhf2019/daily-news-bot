/**
 * DeepSeek 提示词生成 + 结果验证
 *
 * - 与 API 调用解耦，便于单元测试
 * - 所有 JSON schema 在这里定义，后端/前端可复用
 */

// ---------- 基础校验 ----------
export function validateAnalysisInput(opts) {
  if (!opts || !opts.newsItem) return { error: '缺少 newsItem' }
  var newsItem = opts.newsItem
  var title = String(newsItem.title || '').trim()
  var summary = String(newsItem.summary || '').trim()
  var content = String(newsItem.content || '').trim()
  if (!title && !summary && !content) return { error: '新闻内容为空，无法分析' }

  var allowed = { 'seven-elements': true, 'relevance': true, 'deep-exploration': true }
  if (!allowed[opts.type]) return { error: '不支持的分析类型: ' + opts.type }

  return {
    value: {
      type: opts.type,
      newsItem: {
        id: newsItem.id || 'anonymous',
        title: title,
        summary: summary,
        content: content,
        source: newsItem.source || '未知',
        category: newsItem.category || 'news',
        url: newsItem.url || '',
        published_at: newsItem.published_at || new Date().toISOString(),
        tags: newsItem.tags || []
      }
    }
  }
}

// ---------- Prompt 构造 ----------
var JSON_HINT = '\n\n输出必须是合法 JSON。不要输出解释、不要输出代码块标记。'

function substringSafe(s, n) {
  try {
    return s.substring(0, n)
  } catch (e) {
    return ''
  }
}

function buildSevenElementsPrompt(newsItem) {
  var title = newsItem.title
  var summary = newsItem.summary
  var content = substringSafe(newsItem.content, 3000)
  var source = newsItem.source
  var published_at = newsItem.published_at
  var prompt =
    '你是一名资深情报分析师。请对以下新闻做多维度审计，并返回指定 JSON 结构。\n\n' +
    '新闻标题：' + title + '\n' +
    '新闻摘要：' + summary + '\n' +
    '新闻正文：' + content + '\n' +
    '来源：' + source + '\n' +
    '发布时间：' + published_at + '\n' +
    '\n请输出以下 JSON 结构：\n{\n' +
    '  "who": "是谁触发或推动了这条新闻的关键人物/组织",\n' +
    '  "what": "核心事实，一句话描述新闻内容",\n' +
    '  "when": "关键时间节点和节奏",\n' +
    '  "where": "事件发生的地理位置/产业/领域",\n' +
    '  "why": "深层原因（结构/动机/政策）",\n' +
    '  "how": "事件的发生过程与机制",\n' +
    '  "impact": "影响与后果，短期 + 中长期"\n' +
    '}\n' + JSON_HINT
  return {
    prompt: prompt,
    outputShape: { who: '', what: '', when: '', where: '', why: '', how: '', impact: '' }
  }
}

function buildRelevancePrompt(newsItem, persona) {
  var personaMap = {
    investor: '投资人（关注 ROI、传导链、时间窗口）',
    engineer: '技术人员（关注技术演进、工具链、学习成本）',
    manager: '管理者（关注组织成本、协作效率、风险管控）',
    citizen: '普通读者（关注对日常生活与长期趋势的影响）'
  }
  var personaText = personaMap[persona] || personaMap.investor
  var title = newsItem.title
  var summary = newsItem.summary
  var content = substringSafe(newsItem.content, 2000)

  var prompt =
    '你是一位【' + personaText + '】的私人情报顾问。请针对以下新闻，从你的职业身份出发做相关性分析。\n\n' +
    '新闻标题：' + title + '\n' +
    '新闻摘要：' + summary + '\n' +
    '新闻正文：' + content + '\n' +
    '\n请输出 JSON：\n{\n' +
    '  "summary": "一句话总结这则新闻对你的意义（10-30字）",\n' +
    '  "risks": "可能带来的风险（分条 2-4 条，换行分隔）",\n' +
    '  "opportunities": "潜在机会（分条 2-4 条）",\n' +
    '  "actionPlan": "推荐的行动计划（分条，有优先级）"\n' +
    '}\n' + JSON_HINT
  return {
    prompt: prompt,
    outputShape: { summary: '', risks: '', opportunities: '', actionPlan: '' }
  }
}

function buildDeepExplorationPrompt(newsItem) {
  var title = newsItem.title
  var summary = newsItem.summary
  var content = substringSafe(newsItem.content, 3000)
  var source = newsItem.source

  var prompt =
    '你是一名战略智库研究员。请对以下新闻做深度因果溯源与终局预测。\n\n' +
    '新闻标题：' + title + '\n' +
    '新闻摘要：' + summary + '\n' +
    '新闻正文：' + content + '\n' +
    '来源：' + source + '\n' +
    '\n请输出 JSON：\n{\n' +
    '  "context": "背景与上下文（200字以内）",\n' +
    '  "timeline": "关键时间线（分条）",\n' +
    '  "stakeholders": "关键方与利益关系",\n' +
    '  "deeper": "还需要追问的问题（3-5 条）"\n' +
    '}\n' + JSON_HINT
  return {
    prompt: prompt,
    outputShape: { context: '', timeline: '', stakeholders: '', deeper: '' }
  }
}

export function buildPrompt(opts) {
  var type = opts.type
  var newsItem = opts.newsItem
  var persona = opts.persona || 'investor'
  if (type === 'seven-elements') return buildSevenElementsPrompt(newsItem)
  if (type === 'relevance') return buildRelevancePrompt(newsItem, persona)
  if (type === 'deep-exploration') return buildDeepExplorationPrompt(newsItem)
  throw new Error('未知的分析类型: ' + type)
}

// ---------- 结果解析 ----------
export function parseJsonResponse(content, opts) {
  if (!content) throw new Error('模型返回空内容')
  var cleaned = String(content).trim()

  // 去掉 ```json ... ``` 包裹
  if (cleaned.indexOf('```') === 0) {
    cleaned = cleaned.replace(/^\`\`\`(?:json)?\s*/i, '').replace(/\s*\`\`\`$/, '')
  }

  // 截取从第一个 { 到最后一个 } 的范围
  var firstBrace = cleaned.indexOf('{')
  var lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1)
  }

  var parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch (e) {
    // 再尝试一次：逐行扫描
    var lines = content.split('\n')
    var found = false
    for (var i = 0; i < lines.length; i++) {
      var candidate = lines.slice(i).join('\n')
      var f = candidate.indexOf('{')
      var l = candidate.lastIndexOf('}')
      if (f !== -1 && l > f) {
        try {
          parsed = JSON.parse(candidate.substring(f, l + 1))
          found = true
          break
        } catch (e2) {
          // 继续尝试
        }
      }
    }
    if (!found || !parsed) throw new Error('JSON 解析失败')
  }

  // 与预期 shape 合并（确保所有 key 存在）
  var optsObj = opts || {}
  if (optsObj.shape) return mergeShape(parsed, optsObj.shape)
  return parsed
}

// 确保 outputShape 中定义的 key 都有默认值
function mergeShape(data, shape) {
  if (Array.isArray(shape)) {
    return Array.isArray(data) ? data : []
  }
  if (shape && typeof shape === 'object' && shape !== null) {
    var out = {}
    var src = (data && typeof data === 'object' && !Array.isArray(data)) ? data : null
    var keys = Object.keys(shape)
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]
      out[key] = mergeShape(src ? src[key] : undefined, shape[key])
    }
    return out
  }
  if (data === undefined || data === null) return shape
  return data
}
