export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const { apiKey, endpoint, newsItem, type } = req.body
    
    if (!apiKey) {
      return res.status(400).json({ error: '缺少 API Key' })
    }
    
    const prompts = {
      'seven-elements': getSevenElementsPrompt(newsItem),
      'relevance': getRelevancePrompt(newsItem),
      'deep-exploration': getDeepExplorationPrompt(newsItem)
    }
    
    const systemPrompts = {
      'seven-elements': '你是专业的情报审计分析师，擅长对新闻进行多维度审计。只返回JSON，不要有其他文字。',
      'relevance': '你是专业的私人顾问，正在为用户提供决策建议。只返回JSON。',
      'deep-exploration': '你是顶级战略智库研究员，擅长因果溯源和战略建模。只返回JSON。'
    }
    
    const response = await fetch(`${endpoint || 'https://api.deepseek.com/v1'}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompts[type] },
          { role: 'user', content: prompts[type] }
        ],
        temperature: 0.5,
        max_tokens: 2000
      })
    })
    
    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`)
    }
    
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const result = JSON.parse(cleaned)
    
    res.json(result)
  } catch (error) {
    console.error('分析失败:', error)
    res.status(500).json({ error: '分析失败: ' + error.message })
  }
}

function getSevenElementsPrompt(news) {
  return `请对以下新闻进行七要素审计分析。

新闻标题：${news.title}
新闻摘要：${news.summary || ''}

请返回JSON格式：
{
  "audit01": { "score": 85, "verifiedFacts": ["事实1"], "conflicts": ["疑点1"], "verdict": "判词" },
  "audit02": { "consensus": ["共识1"], "gaps": ["漏洞1"], "alignment": 78 },
  "audit03": { "keyData": [{"item": "指标", "value": "数值", "status": "verified"}] },
  "audit04": { "logicPath": ["A", "B", "C"], "glossary": {"term": "术语", "explain": "解释"} },
  "audit05": { "redlines": [{"point": "风险点", "level": "high"}], "impact": "影响" },
  "audit06": { "finalScore": 82, "verdictText": "点评", "actionStar": 4 },
  "audit07": [{"phase": "起源", "time": "时间", "event": "事件"}]
}`
}

function getRelevancePrompt(news) {
  return `请对以下新闻进行相关性分析。

新闻标题：${news.title}
新闻摘要：${news.summary || ''}

请返回JSON格式：
{
  "roi": {"score": 85, "reason": "影响说明"},
  "ripple": {"upstream": "上游影响", "downstream": "下游影响", "rivals": "竞争格局"},
  "decision": {"options": [{"name": "方案A", "pros": "优势", "cons": "劣势"}]},
  "pitfall": [{"trap": "陷阱", "avoid": "规避方法"}],
  "action": [{"step": 1, "action": "行动", "deadline": "时间"}],
  "timing": {"window": "时间窗口", "urgency": "high"},
  "goldQuote": "金句"
}`
}

function getDeepExplorationPrompt(news) {
  return `请对以下新闻进行深度因果溯源分析。

新闻标题：${news.title}
新闻摘要：${news.summary || ''}

请返回JSON格式：
{
  "microAudit": {"target": "核查目标", "logic": "核查逻辑"},
  "reasoningChain": ["推理步骤1", "推理步骤2"],
  "historyMatch": {"event": "历史事件", "lesson": "教训"},
  "interestsMap": [{"entity": "利益方", "motivation": "动机"}],
  "ecosystem": {"upstream": ["上游"], "downstream": ["下游"], "rivals": ["竞争者"]},
  "blackSwan": {"trigger": "触发条件", "probability": "low"},
  "strategicOutlook": "战略预言"
}`
}
