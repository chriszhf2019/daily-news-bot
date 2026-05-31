// DeepSeek API 服务

// 调用 DeepSeek API
export async function callDeepSeek(apiKey, endpoint, messages, options = {}) {
  const { temperature = 0.7, maxTokens = 2000 } = options
  
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature,
      max_tokens: maxTokens
    })
  })
  
  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status}`)
  }
  
  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

// 解析 JSON 响应
function parseJsonResponse(content) {
  try {
    const cleaned = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    return JSON.parse(cleaned)
  } catch (e) {
    console.error('JSON 解析失败:', e)
    return null
  }
}

// 七要素审计分析
export async function analyzeSevenElements(apiKey, endpoint, news) {
  const prompt = `请对以下新闻进行七要素审计分析。

新闻标题：${news.title}
新闻摘要：${news.summary || ''}
新闻内容：${news.content || news.summary || ''}
新闻分类：${news.category || 'AI'}
新闻来源：${news.source || '未知'}

请返回JSON格式：
{
  "audit01": {
    "score": 85,
    "verifiedFacts": ["事实1", "事实2"],
    "conflicts": ["疑点1"],
    "verdict": "一句话判词"
  },
  "audit02": {
    "consensus": ["共识1", "共识2"],
    "gaps": ["漏洞1"],
    "alignment": 78
  },
  "audit03": {
    "keyData": [
      {"item": "指标名", "value": "数值", "status": "verified/unverified"}
    ],
    "summary": "数据总结"
  },
  "audit04": {
    "logicPath": ["A", "B", "C"],
    "glossary": {"term": "术语", "explain": "解释"}
  },
  "audit05": {
    "redlines": [{"point": "风险点", "level": "high/medium/low"}],
    "impact": "破坏力说明"
  },
  "audit06": {
    "finalScore": 82,
    "verdictText": "50字点评",
    "actionStar": 4
  },
  "audit07": [
    {"phase": "起源", "time": "时间", "event": "事件"},
    {"phase": "现状", "time": "时间", "event": "事件"},
    {"phase": "下一步", "time": "时间", "event": "事件"}
  ]
}`

  const content = await callDeepSeek(apiKey, endpoint, [
    { role: 'system', content: '你是专业的情报审计分析师，擅长对新闻进行多维度审计。只返回JSON，不要有其他文字。' },
    { role: 'user', content: prompt }
  ], { temperature: 0.5 })
  
  return parseJsonResponse(content)
}

// 相关性分析（私人顾问）
export async function analyzeRelevance(apiKey, endpoint, news, persona = 'investor') {
  const personaMap = {
    investor: '投资者',
    techie: '技术人',
    manager: '管理者'
  }
  
  const prompt = `请以${personaMap[persona]}的视角，对以下新闻进行相关性分析。

新闻标题：${news.title}
新闻摘要：${news.summary || ''}
新闻内容：${news.content || news.summary || ''}

请返回JSON格式：
{
  "roi": {"score": 85, "reason": "量化影响说明"},
  "ripple": {"upstream": "上游影响", "downstream": "下游影响", "rivals": "竞争格局"},
  "decision": {"options": [{"name": "方案A", "pros": "优势", "cons": "劣势"}]},
  "pitfall": [{"trap": "陷阱", "avoid": "规避方法"}],
  "action": [{"step": 1, "action": "具体行动", "deadline": "时间"}],
  "timing": {"window": "时间窗口", "urgency": "high/medium/low"},
  "goldQuote": "一句认知溢价金句"
}`

  const content = await callDeepSeek(apiKey, endpoint, [
    { role: 'system', content: `你是专业的私人顾问，正在为${personaMap[persona]}提供决策建议。只返回JSON。` },
    { role: 'user', content: prompt }
  ], { temperature: 0.6 })
  
  return parseJsonResponse(content)
}

// 深度探索分析
export async function analyzeDeepExploration(apiKey, endpoint, news) {
  const prompt = `请对以下新闻进行深度因果溯源分析。

新闻标题：${news.title}
新闻摘要：${news.summary || ''}
新闻内容：${news.content || news.summary || ''}

请返回JSON格式：
{
  "microAudit": {"target": "核查目标", "logic": "核查逻辑"},
  "reasoningChain": ["推理步骤1", "推理步骤2", "推理步骤3"],
  "historyMatch": {"event": "历史事件", "lesson": "历史教训"},
  "interestsMap": [{"entity": "利益方", "motivation": "动机"}],
  "ecosystem": {"upstream": ["上游"], "downstream": ["下游"], "rivals": ["竞争者"]},
  "blackSwan": {"trigger": "触发条件", "probability": "low/medium/high"},
  "strategicOutlook": "战略终局预言"
}`

  const content = await callDeepSeek(apiKey, endpoint, [
    { role: 'system', content: '你是顶级战略智库研究员，擅长因果溯源和战略建模。只返回JSON。' },
    { role: 'user', content: prompt }
  ], { temperature: 0.5 })
  
  return parseJsonResponse(content)
}

// 测试 API 连接
export async function testConnection(apiKey, endpoint) {
  try {
    const content = await callDeepSeek(apiKey, endpoint, [
      { role: 'user', content: '请回复"连接成功"' }
    ], { maxTokens: 50 })
    return { success: content.includes('成功'), message: content }
  } catch (error) {
    return { success: false, message: error.message }
  }
}
