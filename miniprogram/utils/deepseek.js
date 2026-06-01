// ==================== DeepSeek API 配置相关函数 ====================

// API基础URL
const API_BASE_URL = 'https://api.deepseek.com/v1';

// 从本地存储获取API密钥
function getApiKey() {
  return wx.getStorageSync('deepseek_api_key') || 'sk-70dae237a40e444385e0856079829d35' || '';
}

// 从本地存储获取API端点
function getApiEndpoint() {
  return wx.getStorageSync('deepseek_api_endpoint') || API_BASE_URL;
}

// 从本地存储获取模型名称
function getModel() {
  return wx.getStorageSync('deepseek_model') || 'deepseek-chat';
}

// 增加API调用次数计数
function incrementApiCallCount() {
  const count = wx.getStorageSync('apiCallCount') || 0;
  const newCount = count + 1;
  wx.setStorageSync('apiCallCount', newCount);
  return newCount;
}

// ==================== DeepSeek API 请求相关函数 ====================

// 发送API请求（核心函数）
async function request(url, options = {}) {
  const apiKey = getApiKey();
  const apiEndpoint = getApiEndpoint();
  
  const defaultOptions = {
    method: 'GET',
    header: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    timeout: 60000
  };

  const finalOptions = { ...defaultOptions, ...options };

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${apiEndpoint}${url}`,
      ...finalOptions,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(`API Error: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

// ==================== AI分析相关函数 ====================

// 生成逻辑树提示词
function generateLogicTreePrompt(newsContent) {
  return `请针对这条新闻分析其逻辑树。

新闻内容：
${newsContent}

输出格式（必须是纯JSON，不要有任何其他文字）：
{
  "root": {
    "title": "新闻核心内容",
    "subtitle": "深度分析核心逻辑链"
  },
  "origins": [
    {
      "id": 1,
      "title": "原因1",
      "weight": 85,
      "type": "origin",
      "description": "深度解释..."
    }
  ],
  "impacts": [
    {
      "id": 4,
      "title": "影响1",
      "weight": 90,
      "type": "impact",
      "description": "深度解释..."
    }
  ],
  "variables": [
    {
      "id": 1,
      "name": "变量1",
      "value": "高/中/低"
    }
  ]
}

要求：
1. origins 包含 2-3 个原因节点，每个节点要有 title, weight (1-100), type, description
2. impacts 包含 3 个影响节点，每个节点要有 title, weight (1-100), type, description
3. variables 包含 3-4 个关键变量，每个变量要有 name, value
4. 权重分值必须体现真实的影响力对比（高权重表示更重要）
5. 所有描述要详细、有深度，不少于50字
6. 确保输出的是有效的JSON格式`;
}

// ==================== AI情绪分析相关函数 ====================

// 生成情绪分析提示词
function generateSentimentPrompt(newsContent) {
  return `分析以下新闻的情绪（积极/中性/消极），只返回一个词：positive/neutral/negative

新闻内容：
标题：${newsContent.title}
摘要：${newsContent.summary}

分析要求：
1. 基于新闻内容的整体语义分析情绪
2. 考虑标题和摘要的综合情绪倾向
3. 识别讽刺、反语等复杂情绪表达
4. 如果新闻包含积极关键词（如突破、增长、成功、创新等），倾向于positive
5. 如果新闻包含消极关键词（如下跌、风险、危机、失败等），倾向于negative
6. 如果新闻内容平衡或无明显情绪倾向，倾向于neutral
7. 只返回一个词：positive/neutral/negative`;
}

// ==================== AI影响评分相关函数 ====================

// 生成影响评分提示词
function generateImpactPrompt(newsContent) {
  return `评估以下新闻的影响力（1-10分），考虑以下因素：

新闻内容：
标题：${newsContent.title}
摘要：${newsContent.summary}
分类：${newsContent.category || 'AI'}

评估维度：
1. 行业影响（是否影响整个行业）：0-10分
2. 社会影响（是否影响大量人群）：0-10分
3. 经济影响（是否影响市场或经济）：0-10分
4. 政策影响（是否影响政策或法规）：0-10分

评分标准：
- 8-10分：行业巨震级（如重大技术突破、政策重大变化）
- 5-7分：重要动态（如重要产品发布、市场重大变化）
- 2-4分：常规更新（如日常新闻、一般更新）
- 1分：普通信息（如一般资讯）

只返回一个数字（1-10分）：`;
}

// AI情绪分析（使用DeepSeek API）
async function analyzeSentimentWithAI(newsContent) {
  try {
    const prompt = generateSentimentPrompt(newsContent);
    const response = await request('/chat/completions', {
      method: 'POST',
      data: {
        model: getModel(),
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 50
      }
    });
    
    // DeepSeek API直接返回choices数组
    if (response && response.choices && response.choices[0] && response.choices[0].message) {
      const sentiment = response.choices[0].message.content.trim().toLowerCase();
      const confidence = 0.85;
      
      return {
        sentiment: sentiment === 'positive' ? 'positive' : sentiment === 'negative' ? 'negative' : 'neutral',
        confidence: confidence,
        reason: 'AI基于内容语义分析'
      };
    }
    
    console.warn('AI情绪分析响应格式异常，使用备用方法');
    return fallbackSentimentAnalysis(newsContent);
  } catch (error) {
    console.error('AI情绪分析失败:', error);
    return fallbackSentimentAnalysis(newsContent);
  }
}

// 备用情绪分析（关键词匹配）
function fallbackSentimentAnalysis(newsContent) {
  const title = newsContent.title + (newsContent.summary || '');
  const positive = ['突破', '增长', '成功', '领先', '创新', '上涨', '利好', '夺冠', '获胜'];
  const negative = ['下跌', '风险', '危机', '下降', '失败', '利空', '警告'];
  
  let pScore = 0, nScore = 0;
  positive.forEach(w => { if (title.includes(w)) pScore++; });
  negative.forEach(w => { if (title.includes(w)) nScore++; });
  
  if (pScore > nScore) return { sentiment: 'positive', confidence: 0.6, reason: '关键词匹配' };
  if (nScore > pScore) return { sentiment: 'negative', confidence: 0.6, reason: '关键词匹配' };
  return { sentiment: 'neutral', confidence: 0.5, reason: '无明确情绪' };
}

// AI影响评分（使用DeepSeek API）
async function analyzeImpactWithAI(newsContent) {
  try {
    const prompt = generateImpactPrompt(newsContent);
    const response = await request('/chat/completions', {
      method: 'POST',
      data: {
        model: getModel(),
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 50
      }
    });
    
    if (response && response.choices && response.choices[0] && response.choices[0].message) {
      const score = parseInt(response.choices[0].message.content.trim());
      const validScore = Math.min(10, Math.max(1, isNaN(score) ? 5 : score));
      
      return {
        score: validScore,
        level: validScore >= 8 ? 'high' : validScore >= 5 ? 'medium' : 'low',
        label: validScore >= 8 ? '行业巨震' : validScore >= 5 ? '重要动态' : '常规更新',
        confidence: 0.85,
        reason: 'AI基于多维度评估'
      };
    }
    
    console.warn('AI影响评分响应格式异常，使用备用方法');
    return fallbackImpactAnalysis(newsContent);
  } catch (error) {
    console.error('AI影响评分失败:', error);
    return fallbackImpactAnalysis(newsContent);
  }
}

// 备用影响分析（关键词匹配）
function fallbackImpactAnalysis(newsContent) {
  let score = 5;
  const title = newsContent.title;
  const highWords = ['突破', '首次', '重大', '历史', '全球', '革命', '夺冠'];
  const medWords = ['发布', '升级', '增长', '创新', '获胜'];
  
  highWords.forEach(w => { if (title.includes(w)) score += 1.5; });
  medWords.forEach(w => { if (title.includes(w)) score += 0.5; });
  if (newsContent.category === 'AI') score += 1;
  
  score = Math.min(10, Math.max(1, Math.round(score)));
  
  return {
    score: score,
    level: score >= 8 ? 'high' : score >= 5 ? 'medium' : 'low',
    label: score >= 8 ? '行业巨震' : score >= 5 ? '重要动态' : '常规更新',
    confidence: 0.7,
    reason: '关键词匹配'
  };
}

// ==================== 阅读辅助相关函数 ====================

// 生成阅读辅助提示词
function generateReadingAssistancePrompt(newsContent) {
  return `请针对这条新闻生成阅读辅助内容。

新闻内容：
${newsContent}

输出格式（必须是纯JSON，不要有任何其他文字）：
{
  "keyPoints": [
    {
      "title": "核心观点",
      "description": "详细解释..."
    },
    {
      "title": "关键数据",
      "description": "详细解释..."
    },
    {
      "title": "相关背景",
      "description": "详细解释..."
    }
  ],
  "tips": "阅读建议...",
  "summary": "一句话总结...",
  "digestPoints": ["要点1", "要点2", "要点3", "要点4"]
}

要求：
1. keyPoints 包含 3-5 个关键要点，每个要点要有 title 和 description
2. tips 提供具体的阅读建议，帮助读者更好地理解文章
3. summary 用一句话概括文章核心内容
4. digestPoints 包含 4-6 个核心要点，每个要点不超过 10 个字
5. 所有描述要详细、有深度，不少于 30 字
6. 确保输出的是有效的JSON格式`;
}

// 生成逻辑树（使用DeepSeek API）
async function generateLogicTree(news) {
  const prompt = generateLogicTreePrompt(
    `标题：${news.title}\n摘要：${news.summary}\n内容：${news.content || ''}`
  );

  try {
    incrementApiCallCount();
    const response = await request('/chat/completions', {
      method: 'POST',
      data: {
        model: getModel(),
        messages: [
          {
            role: 'system',
            content: '你是一个专业的新闻分析专家，擅长分析新闻的因果逻辑链。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }
    });

    const content = response.choices[0].message.content;
    
    try {
      const logicTree = JSON.parse(content);
      return logicTree;
    } catch (parseError) {
      console.error('Failed to parse DeepSeek response:', parseError);
      throw new Error('AI生成的数据格式错误');
    }
  } catch (error) {
    console.error('DeepSeek API error:', error);
    throw error;
  }
}

// 生成阅读辅助（使用DeepSeek API）
async function generateReadingAssistance(news) {
  const prompt = generateReadingAssistancePrompt(
    `标题：${news.title}\n摘要：${news.summary}\n内容：${news.content || ''}`
  );

  try {
    incrementApiCallCount();
    const response = await request('/chat/completions', {
      method: 'POST',
      data: {
        model: getModel(),
        messages: [
          {
            role: 'system',
            content: '你是一个专业的阅读辅助专家，擅长提炼文章核心要点和提供阅读建议。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }
    });

    const content = response.choices[0].message.content;
    
    try {
      const assistance = JSON.parse(content);
      return assistance;
    } catch (parseError) {
      console.error('Failed to parse DeepSeek response:', parseError);
      throw new Error('AI生成的数据格式错误');
    }
  } catch (error) {
    console.error('DeepSeek API error:', error);
    throw error;
  }
}

// ==================== 新闻验证相关函数 ====================

// 生成新闻验证（使用DeepSeek API）
async function generateVerification(news) {
  const prompt = generateVerificationPrompt(
    `标题：${news.title}\n摘要：${news.summary}\n内容：${news.content || ''}`
  );

  try {
    incrementApiCallCount();
    const response = await request('/chat/completions', {
      method: 'POST',
      data: {
        model: getModel(),
        messages: [
          {
            role: 'system',
            content: '你是一个专业的新闻验证专家，擅长分析多个信源的一致性和识别信息冲突。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }
    });

    const content = response.choices[0].message.content;
    
    try {
      const verification = JSON.parse(content);
      return verification;
    } catch (parseError) {
      console.error('Failed to parse DeepSeek response:', parseError);
      throw new Error('AI生成的数据格式错误');
    }
  } catch (error) {
    console.error('DeepSeek API error:', error);
    throw error;
  }
}

// ==================== 时间轴相关函数 ====================

// 生成时间轴提示词
function generateTimelinePrompt(newsContent) {
  return `请针对这条新闻生成事件时间轴。

新闻内容：
${newsContent}

输出格式（必须是纯JSON，不要有任何其他文字）：
{
  "nodes": [
    {
      "type": "past/current/future",
      "date": "YYYY-MM-DD",
      "title": "事件标题",
      "description": "详细描述",
      "importance": "critical/regular"
    }
  ],
  "duration": 15,
  "nextEventDays": 3
}

要求：
1. nodes 包含 4-6 个时间节点，每个节点要有 type, date, title, description, importance
2. type 可以是 past（过去）、current（当前）、future（未来）
3. 必须包含一个 current 类型的节点，代表当前新闻
4. 至少包含 2 个 past 类型的节点，代表事件的起源
5. 至少包含 2 个 future 类型的节点，代表未来的影响
6. importance 可以是 critical（关键）或 regular（常规）
7. duration 是事件持续的天数
8. nextEventDays 是下一个关键节点的预计天数
9. 所有描述要详细、有深度，不少于 30 字
10. 确保输出的是有效的JSON格式`;
}

// 生成时间轴（使用DeepSeek API）
async function generateTimeline(news) {
  const prompt = generateTimelinePrompt(
    `标题：${news.title}\n摘要：${news.summary}\n内容：${news.content || ''}`
  );

  try {
    incrementApiCallCount();
    const response = await request('/chat/completions', {
      method: 'POST',
      data: {
        model: getModel(),
        messages: [
          {
            role: 'system',
            content: '你是一个专业的事件分析专家，擅长分析新闻的时间脉络和未来影响。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }
    });

    const content = response.choices[0].message.content;
    
    try {
      const timeline = JSON.parse(content);
      return timeline;
    } catch (parseError) {
      console.error('Failed to parse DeepSeek response:', parseError);
      throw new Error('AI生成的数据格式错误');
    }
  } catch (error) {
    console.error('DeepSeek API error:', error);
    throw error;
  }
}

// 生成新闻验证提示词
function generateVerificationPrompt(newsContent) {
  return `请针对这条新闻进行多源验证分析。

新闻内容：
${newsContent}

输出格式（必须是纯JSON，不要有任何其他文字）：
{
  "verifiedSources": [
    {
      "id": 1,
      "name": "媒体名",
      "icon": "emoji",
      "reliability": 95,
      "verified": true
    }
  ],
  "consensus": [
    {
      "text": "所有媒体一致确认的事实点1",
      "confirmed": true
    }
  ],
  "conflicts": ["目前尚存争议或各方说法不一的点"],
  "conflictSummary": "争议点：XX事实尚未完全同步",
  "overallReliability": 78
}

要求：
1. verifiedSources 包含 3-5 个核心信源，每个信源要有 id, name, icon, reliability (1-100), verified (true/false)
2. consensus 包含 3-5 个所有媒体一致确认的事实点，每个要点要有 text, confirmed (true/false)
3. conflicts 是一个数组，包含所有存在争议或各方说法不一的点
4. conflictSummary 是一句话，概括主要的争议点
5. overallReliability 是整体可信度评分 (1-100)
6. 所有描述要详细、有深度，不少于 30 字
7. 确保输出的是有效的JSON格式`;
}

// ==================== API连接测试相关函数 ====================

// 测试API连接
async function testConnection(apiKey, apiEndpoint) {
  try {
    console.log('Testing API connection with:', {
      apiKey: apiKey ? '***' + apiKey.slice(-5) : 'null',
      apiEndpoint: apiEndpoint
    });
    
    // 验证API端点格式
    if (!apiEndpoint || !apiEndpoint.startsWith('http')) {
      console.error('Invalid API endpoint format:', apiEndpoint);
      return { success: false, error: 'API端点格式不正确' };
    }
    
    // 验证API密钥格式
    if (!apiKey || !apiKey.trim() || !apiKey.startsWith('sk-') || apiKey.length < 30) {
      console.error('Invalid API key format:', apiKey ? apiKey.slice(0, 5) + '***' : 'null');
      return { success: false, error: 'API密钥格式不正确' };
    }
    
    const trimmedApiKey = apiKey.trim();
    const fullUrl = `${apiEndpoint}/models`;
    console.log('Making request to:', fullUrl);
    
    const response = await new Promise((resolve) => {
      wx.request({
        url: fullUrl,
        method: 'GET',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${trimmedApiKey}`
        },
        timeout: 20000,
        success: (res) => {
          console.log('API response status:', res.statusCode);
          console.log('API response data:', res.data);
          
          if (res.statusCode === 200) {
            resolve({ success: true });
          } else if (res.statusCode === 401) {
            resolve({ success: false, error: 'API密钥无效或已过期' });
          } else if (res.statusCode === 429) {
            resolve({ success: false, error: 'API调用次数超限' });
          } else if (res.statusCode === 500) {
            resolve({ success: false, error: 'API服务内部错误' });
          } else {
            resolve({ success: false, error: `HTTP错误: ${res.statusCode} - ${res.errMsg || '未知错误'}` });
          }
        },
        fail: (err) => {
          console.error('API request failed:', err);
          if (err.errType === 'network') {
            resolve({ success: false, error: '网络连接失败，请检查网络设置' });
          } else if (err.errType === 'timeout') {
            resolve({ success: false, error: '连接超时，请检查网络速度' });
          } else if (err.errMsg.includes('invalid url')) {
            resolve({ success: false, error: 'API端点地址无效' });
          } else {
            resolve({ success: false, error: `网络错误: ${err.errMsg || '未知错误'}` });
          }
        }
      });
    });
    
    console.log('Connection test result:', response);
    return response;
  } catch (error) {
    console.error('Connection test failed with exception:', error);
    return { success: false, error: `异常错误: ${error.message || '未知错误'}` };
  }
}

// 生成情报中心数据的提示
// ==================== 情报中心数据获取相关函数 ====================

// 生成情报中心数据提示词
function generateIntelligencePrompt() {
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  
  return `请基于${dateStr}的全球市场情况，生成一份完整的情报中心数据。

【输出要求】
必须是纯JSON格式，不要有任何markdown标记、代码块或其他文字。

【数据结构】
{
  "market_sentiment": 数字(0-100，市场乐观度),
  "policy_sensitivity": 数字(0-100，政策敏感度),
  "tech_breakthroughs": 数字(1-15，技术突破数量),
  "daily_density": [24个数字，代表每小时的新闻密度，范围10-60],
  "top_themes": [
    {
      "title": "热点主题标题",
      "insight": "50-100字的深度洞察分析",
      "color": "#A855F7或#06B6D4或#F97316",
      "logic_chain": ["原因1", "原因2", "结果"]
    }
  ],
  "tomorrow_watch": [
    {
      "event": "明日关注事件名称",
      "probability": 数字(0-100，发生概率),
      "reason": "30-50字的原因说明"
    }
  ],
  "blind_spot": {
    "title": "盲区情报标题",
    "reason": "简短原因",
    "message": "50字左右的提醒信息"
  }
}

【内容要求】
1. top_themes 包含3个当前最热门的科技/财经主题
2. tomorrow_watch 包含3个明日值得关注的事件
3. blind_spot 提供1个用户可能忽略但重要的信息
4. 所有内容要基于真实的市场趋势和科技动态
5. 数据要有参考价值，不要使用示例中的具体数值

直接输出JSON，不要有任何其他内容：`;
}

// 生成新闻数据的提示
// ==================== 新闻数据获取相关函数 ====================

// 生成新闻数据提示词
function generateNewsPrompt() {
  // 获取当前日期
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const dateStr = `${year}年${month}月${day}日`;
  
  return `你是一个专业的新闻编辑。请基于你的知识，生成10条与当前时事相关的新闻数据。

当前日期：${dateStr}

要求：
1. 新闻要基于真实的事件和趋势（可以是近期发生的重要事件）
2. 涵盖AI、科技、财经、国际、体育等领域
3. 每条新闻要有具体的数据和细节
4. 标签要精准概括新闻核心
5. AI分析要专业、有深度

每条新闻包含：
1. 标题（简洁有力，20-40字）
2. 摘要（100-150字，包含关键数据）
3. 分类（AI、tech、finance、international、sports）
4. 发布时间（今天的时间，24小时制如08:30）
5. 标签（3-5个精准标签）
6. AI分析（解读和预测）
7. 新闻来源（2-3个真实媒体名称）
8. 小白模式数据（形象比喻、术语解释）

输出格式（必须是纯JSON数组，不要有任何其他文字）：
[
  {
    "title": "新闻标题",
    "summary": "新闻摘要，包含具体数据和细节",
    "category": "AI",
    "timeSlot": "08:30",
    "tags": ["标签1", "标签2", "标签3"],
    "ai_analysis": {
      "interpretation": "专业的AI深度解读，100-150字",
      "prediction": "趋势预测，80-100字"
    },
    "sources": [
      { "name": "媒体名称", "url": "https://example.com", "icon": "🖥️" }
    ],
    "simpleSummary": "一句话简单总结",
    "simpleInterpretation": "通俗易懂的解读",
    "simplePrediction": "简单的预测",
    "analogy": "形象的比喻，帮助理解",
    "story": {
      "before": "之前发生了什么",
      "after": "接下来可能发生什么"
    },
    "talking_point": "社交金句",
    "jargonTips": [
      { "term": "术语", "explain": "通俗解释" }
    ]
  }
]

注意：只返回JSON数组，不要有任何其他文字或解释。`;
}

// ==================== 真实数据获取相关函数 ====================

// 获取真实新闻数据（使用免费API）
async function getRealNewsData(newsId) {
  try {
    // 方案1：从本地存储获取新闻数据
    const newsData = wx.getStorageSync('newsData') || [];
    const news = newsData.find(n => n.id === newsId);
    
    if (!news) {
      throw new Error('新闻数据不存在');
    }
    
    // 方案2：调用真实新闻API（需要API密钥）
    // 示例：使用NewsAPI.org
    // const apiKey = wx.getStorageSync('news_api_key') || '';
    // const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(news.title)}&apiKey=${apiKey}`);
    // const data = await response.json();
    
    return news;
  } catch (error) {
    console.error('获取真实新闻数据失败:', error);
    throw error;
  }
}

// 获取真实信源数据（从本地数据库或API）
async function getRealSources(newsTitle) {
  try {
    // 方案1：从本地存储获取信源数据
    const sources = wx.getStorageSync('news_sources') || [];
    
    // 方案2：调用真实信源API
    // 示例：使用Media Bias/Fact Check API
    // const response = await fetch(`https://mediabiasfactcheck.com/api/v1/search?q=${encodeURIComponent(newsTitle)}`);
    // const data = await response.json();
    
    return sources;
  } catch (error) {
    console.error('获取真实信源数据失败:', error);
    throw error;
  }
}

// 获取真实事实核查数据（从本地数据库或API）
async function getRealFactCheck(newsTitle) {
  try {
    // 方案1：从本地存储获取事实核查数据
    const factChecks = wx.getStorageSync('fact_checks') || [];
    
    // 方案2：调用真实事实核查API
    // 示例：使用Google Fact Check Tools API
    // const apiKey = wx.getStorageSync('google_api_key') || '';
    // const response = await fetch(`https://factchecktools.googleapis.com/v1alpha1/claims:search?key=${apiKey}&query=${encodeURIComponent(newsTitle)}`);
    // const data = await response.json();
    
    return factChecks;
  } catch (error) {
    console.error('获取真实事实核查数据失败:', error);
    throw error;
  }
}

// ==================== 七要素分析相关函数 ====================

// 导入真实数据模块
const realSources = require('../data/real_sources.js');

// 生成七要素分析提示词（使用真实数据版）
function generateAuditMatrixPrompt(newsContent) {
  // 获取真实信源数据
  const realSourcesData = realSources.getRealSourcesByCategory(newsContent.category || 'AI');
  
  // 获取真实事实核查数据
  const realFactCheck = realSources.findRealFactCheck(newsContent.title);
  
  // 获取真实历史事件
  const realTimeline = realSources.getRealTimelineByCategory(newsContent.category || 'AI');
  
  return `你是一位专业的新闻事实审计专家，请针对这条新闻进行深度的七要素分析。

新闻内容：
标题：${newsContent.title}
摘要：${newsContent.summary}
分类：${newsContent.category || 'AI'}
发布时间：${newsContent.published_at || '未知'}
来源：${newsContent.source || '未知'}

真实信源数据：
官方信源：${realSourcesData.official.map(s => s.name).join('、')}
权威信源：${realSourcesData.authority.map(s => s.name).join('、')}
社交信源：${realSourcesData.social.map(s => s.name).join('、')}

真实历史事件：
${realTimeline.map(t => `${t.date} - ${t.event}`).join('\n')}

请严格按照以下JSON格式输出，不要包含任何其他文字：
{
  "evidence_audit": {
    "score": 95,
    "verified_facts": [
      {"fact": "被多家媒体共同确认的关键事实1（如：时间、参数、主体动作）", "source_count": 5},
      {"fact": "被多家媒体共同确认的关键事实2", "source_count": 4},
      {"fact": "被多家媒体共同确认的关键事实3", "source_count": 3}
    ],
    "conflicts": ["仅由一家媒体提及或各方说法不一的点1", "各方说法不一的点2"],
    "verdict": "用一句话总结证据的硬度，如：核心事实经5家权威媒体交叉验证，证据链完整可信。"
  },
  "consensus": [
    {
      "title": "基于新闻内容推断的共识点标题",
      "description": "基于新闻内容详细描述该共识点，说明各信源如何确认这一事实。"
    }
  ],
  "conflicts": [
    {
      "title": "基于新闻内容推断的冲突点标题",
      "description": "基于新闻内容详细描述该冲突点，说明各信源的说法差异。",
      "risk": "high/medium/low",
      "sideA": "官方说法",
      "sideB": "其他说法",
      "sourceA": "官方来源",
      "sourceB": "其他来源",
      "verdict": "AI诊断结论"
    }
  ],
  "fact_check": [
    {
      "item": "核查项名称（如：事件发生时间、涉及金额等）",
      "value": "具体核查结果",
      "status": "verified/pending/unverified",
      "source": "信源说明"
    }
  ],
  "base_logic": {
    "text": "基于新闻内容分析事件发生的逻辑链，要求逻辑清晰、论证充分。",
    "glossary": [
      {"term": "专业术语", "def": "术语的详细解释"}
    ]
  },
  "falsification_points": [
    "证伪预警点1：描述如果出现什么情况，新闻可能为假。",
    "证伪预警点2：描述如果出现什么情况，部分内容可能不属实。"
  ],
  "trust_score": 85,
  "origin_timeline": [
    {"date": "YYYY/MM", "event": "相关历史事件", "type": "past/current/future", "importance": "normal/high/critical"}
  ]
}

【01 证据链审计】分析要求：
1. score（一致性评分）：分析不同媒体对核心事实描述的重合度（0-100%），若核心要素完全吻合则为95%以上
2. verified_facts（已核实事实）：提取3个被多家媒体共同确认的关键物理量（时间、参数、主体动作）
3. conflicts（孤证/冲突预警）：识别仅由一家媒体提及或各方说法不一的点
4. verdict（审计判词）：用一句话总结证据的"硬度"

其他模块分析要求：
5. consensus：根据新闻内容推断3-5个各信源一致确认的事实点
6. conflicts：根据新闻内容推断2-3个各信源可能存在争议或说法不一的点
7. fact_check：根据新闻内容推断4-6个关键事实核查项
8. base_logic：根据新闻内容分析事件的技术原理、市场逻辑、政策逻辑等
9. falsification_points：根据新闻内容推断3-5个可能的证伪预警点
10. trust_score：根据新闻内容综合评估可信度（0-100）
11. origin_timeline：从提供的真实历史事件中选择相关事件
12. 所有描述必须基于新闻内容，不能使用通用的模板
13. 确保输出的是有效的JSON格式`;
}

// 七要素分析（带重试机制，无备用数据）
async function generateAuditMatrixWithRetry(newsContent, maxRetries = 3) {
  let lastError = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await generateAuditMatrix(newsContent);
      console.log(`第${i + 1}次尝试成功`);
      return result;
    } catch (error) {
      console.error(`第${i + 1}次尝试失败:`, error);
      lastError = error;
      
      if (i === maxRetries - 1) {
        console.error('所有重试失败');
        throw lastError;
      }
      
      const delay = Math.pow(2, i) * 1000;
      console.log(`等待${delay}ms后重试...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 七要素分析（使用DeepSeek API）
async function generateAuditMatrix(newsContent) {
  try {
    const prompt = generateAuditMatrixPrompt(newsContent);
    const response = await request('/chat/completions', {
      method: 'POST',
      data: {
        model: getModel(),
        messages: [
          {
            role: 'system',
            content: '你是一位专业的新闻事实审计专家，擅长多源验证和事实核查。请根据新闻内容进行深入分析，生成具体、详细、有针对性的分析结果，不要使用通用的模板。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        top_p: 0.9,
        max_tokens: 3500
      }
    });
    
    if (response && response.choices && response.choices[0]) {
      const content = response.choices[0].message.content;
      
      const cleanedContent = content.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
      
      try {
        const auditData = JSON.parse(cleanedContent);
        
        // 验证01证据链审计数据（核心模块）
        if (!auditData.evidence_audit) {
          console.warn('evidence_audit字段缺失，使用默认值');
          auditData.evidence_audit = {
            score: 0,
            verified_facts: [],
            conflicts: [],
            verdict: ''
          };
        }
        
        // 验证其他必要字段，缺失时使用默认值
        if (!Array.isArray(auditData.consensus)) {
          auditData.consensus = [];
        }
        
        if (!Array.isArray(auditData.conflicts)) {
          auditData.conflicts = [];
        }
        
        if (!Array.isArray(auditData.fact_check)) {
          auditData.fact_check = [];
        }
        
        if (!auditData.base_logic) {
          auditData.base_logic = { text: '', glossary: [] };
        }
        
        if (!Array.isArray(auditData.falsification_points)) {
          auditData.falsification_points = [];
        }
        
        if (typeof auditData.trust_score !== 'number') {
          auditData.trust_score = 0;
        }
        
        if (!Array.isArray(auditData.origin_timeline)) {
          auditData.origin_timeline = [];
        }
        
        console.log('七要素分析数据验证通过');
        return auditData;
      } catch (parseError) {
        console.error('Failed to parse audit matrix:', parseError);
        console.error('Raw content:', content);
        console.error('Cleaned content:', cleanedContent);
        throw new Error('AI生成的数据格式错误: ' + parseError.message);
      }
    }
    
    throw new Error('API返回数据格式错误');
  } catch (error) {
    console.error('AI审计矩阵生成失败:', error);
    throw error;
  }
}

// ==================== 深度探索相关函数 ====================

// 生成深度探索提示词
function generateDeepExplorationPrompt(newsContent) {
  return `你是一位专业的战略分析师。请仔细阅读以下新闻，生成深度探索分析数据。

【新闻内容】
标题：${newsContent.title}
摘要：${newsContent.summary || newsContent.title}
分类：${newsContent.category || 'AI'}
来源：${newsContent.source || '未知'}

【分析要求】
请针对这条具体新闻，生成10个维度的深度探索分析。所有内容必须与新闻直接相关，不要使用通用模板。

请严格按照以下JSON格式输出（不要有任何其他文字）：
{
  "cotTree": {
    "root": {
      "title": "基于新闻的核心问题",
      "description": "对核心问题的详细描述"
    },
    "level1": [
      {
        "id": 1,
        "title": "第一层推理节点1",
        "description": "详细推理过程",
        "expanded": false
      },
      {
        "id": 2,
        "title": "第一层推理节点2",
        "description": "详细推理过程",
        "expanded": false
      }
    ],
    "level2": [
      {
        "id": 1,
        "title": "第二层推理节点1",
        "description": "更深层的推理",
        "expanded": false
      }
    ],
    "conclusion": "基于推理链的最终结论"
  },
  "hiddenInterests": {
    "parties": [
      {
        "name": "利益方1",
        "icon": "emoji",
        "interest": "隐藏利益描述",
        "motivation": "动机分析"
      },
      {
        "name": "利益方2",
        "icon": "emoji",
        "interest": "隐藏利益描述",
        "motivation": "动机分析"
      }
    ],
    "analysis": "利益格局综合分析"
  },
  "historyCases": [
    {
      "id": 1,
      "title": "历史相似案例1",
      "date": "YYYY年MM月",
      "similarity": 85,
      "outcome": "案例结果",
      "lesson": "经验教训"
    },
    {
      "id": 2,
      "title": "历史相似案例2",
      "date": "YYYY年MM月",
      "similarity": 70,
      "outcome": "案例结果",
      "lesson": "经验教训"
    }
  ],
  "historyAnalysis": "基于历史案例的综合分析和启示",
  "keyVariables": [
    {
      "id": 1,
      "name": "关键变量1",
      "currentValue": "当前状态",
      "trend": "up/down/stable",
      "impact": "对事件的影响"
    },
    {
      "id": 2,
      "name": "关键变量2",
      "currentValue": "当前状态",
      "trend": "up/down/stable",
      "impact": "对事件的影响"
    }
  ],
  "knowledgeEntities": [
    {
      "id": 1,
      "name": "核心实体1",
      "type": "company/person/technology/policy",
      "description": "实体描述",
      "relations": ["关联实体1", "关联实体2"],
      "expanded": false
    },
    {
      "id": 2,
      "name": "核心实体2",
      "type": "company/person/technology/policy",
      "description": "实体描述",
      "relations": ["关联实体1"],
      "expanded": false
    }
  ],
  "fingerPrints": [
    {
      "id": 1,
      "type": "信息指纹类型",
      "content": "指纹内容",
      "source": "来源",
      "reliability": "high/medium/low"
    }
  ],
  "factChecks": [
    {
      "id": 1,
      "claim": "待核实的声明1",
      "status": "verified/pending/false",
      "statusIcon": "✓/❓/✗",
      "statusText": "已核实/待核实/已证伪",
      "evidence": "核实依据"
    },
    {
      "id": 2,
      "claim": "待核实的声明2",
      "status": "verified/pending/false",
      "statusIcon": "✓/❓/✗",
      "statusText": "已核实/待核实/已证伪",
      "evidence": "核实依据"
    }
  ],
  "futureScenarios": [
    {
      "id": 1,
      "name": "乐观情景",
      "probability": 30,
      "description": "情景描述",
      "triggers": ["触发条件1", "触发条件2"],
      "impact": "影响分析"
    },
    {
      "id": 2,
      "name": "基准情景",
      "probability": 50,
      "description": "情景描述",
      "triggers": ["触发条件1"],
      "impact": "影响分析"
    },
    {
      "id": 3,
      "name": "悲观情景",
      "probability": 20,
      "description": "情景描述",
      "triggers": ["触发条件1"],
      "impact": "影响分析"
    }
  ],
  "futureConclusion": "基于情景分析的综合结论和建议"
}

【重要提醒】
1. 所有分析必须紧密围绕新闻标题"${newsContent.title}"展开
2. 不要使用通用模板，每个字段都要与新闻内容直接相关
3. 如果某项分析与新闻无关，请填写"无"
4. 确保输出的是有效的JSON格式，不要有任何额外文字`;
}

// 生成深度探索（使用DeepSeek API）
async function generateDeepExploration(newsContent) {
  try {
    const prompt = generateDeepExplorationPrompt(newsContent);
    incrementApiCallCount();
    
    const response = await request('/chat/completions', {
      method: 'POST',
      data: {
        model: getModel(),
        messages: [
          {
            role: 'system',
            content: '你是一位专业的战略分析师，擅长深度分析新闻事件的因果关系、利益格局和未来走向。请根据新闻内容生成具体、详细、有针对性的分析结果。只返回JSON，不要有其他文字。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 4000
      }
    });
    
    if (response && response.choices && response.choices[0]) {
      let content = response.choices[0].message.content;
      content = content.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
      
      try {
        const explorationData = JSON.parse(content);
        console.log('深度探索数据生成成功');
        return explorationData;
      } catch (parseError) {
        console.error('解析深度探索数据失败:', parseError);
        throw new Error('AI生成的数据格式错误');
      }
    }
    
    throw new Error('API返回数据格式错误');
  } catch (error) {
    console.error('生成深度探索数据失败:', error);
    throw error;
  }
}

// 获取情报中心数据
// 获取情报中心数据（使用DeepSeek API）
async function getIntelligenceData() {
  const prompt = generateIntelligencePrompt();

  try {
    incrementApiCallCount();
    const response = await request('/chat/completions', {
      method: 'POST',
      data: {
        model: getModel(),
        messages: [
          {
            role: 'system',
            content: '你是一个专业的情报分析专家，擅长分析全球市场动态和科技趋势。请只返回JSON格式数据，不要有任何其他文字或markdown标记。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500
      }
    });

    if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
      console.error('API响应格式错误:', response);
      throw new Error('API响应格式错误');
    }

    let content = response.choices[0].message.content;
    console.log('情报中心原始返回长度:', content.length);
    
    // 移除可能的markdown代码块标记
    content = content.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    
    // 尝试找到JSON对象的开始和结束
    const startIndex = content.indexOf('{');
    const endIndex = content.lastIndexOf('}');
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      content = content.substring(startIndex, endIndex + 1);
    }
    
    try {
      const intelligenceData = JSON.parse(content);
      
      // 验证必要字段
      if (typeof intelligenceData.market_sentiment !== 'number') {
        intelligenceData.market_sentiment = 60;
      }
      if (typeof intelligenceData.policy_sensitivity !== 'number') {
        intelligenceData.policy_sensitivity = 50;
      }
      if (typeof intelligenceData.tech_breakthroughs !== 'number') {
        intelligenceData.tech_breakthroughs = 5;
      }
      if (!Array.isArray(intelligenceData.daily_density) || intelligenceData.daily_density.length !== 24) {
        // 生成默认的24小时密度数据
        intelligenceData.daily_density = Array.from({length: 24}, () => Math.floor(Math.random() * 40) + 10);
      }
      if (!Array.isArray(intelligenceData.top_themes)) {
        intelligenceData.top_themes = [];
      }
      if (!Array.isArray(intelligenceData.tomorrow_watch)) {
        intelligenceData.tomorrow_watch = [];
      }
      if (!intelligenceData.blind_spot) {
        intelligenceData.blind_spot = {
          title: '暂无盲区情报',
          reason: '数据不足',
          message: '请稍后刷新获取更多情报'
        };
      }
      
      console.log('情报中心数据解析成功');
      return intelligenceData;
    } catch (parseError) {
      console.error('JSON解析失败:', parseError.message);
      console.error('清理后的内容:', content.substring(0, 500));
      throw new Error('AI生成的数据格式错误');
    }
  } catch (error) {
    console.error('Get intelligence data error:', error.message || error);
    throw error;
  }
}

// 获取新闻数据
// 获取新闻数据（使用DeepSeek API）
async function getNewsData() {
  const prompt = generateNewsPrompt();

  try {
    incrementApiCallCount();
    const response = await request('/chat/completions', {
      method: 'POST',
      data: {
        model: getModel(),
        messages: [
          {
            role: 'system',
            content: '你是一个专业的新闻编辑。请只返回JSON数组，不要有任何其他文字。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }
    });

    if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
      console.error('DeepSeek API响应格式错误:', response);
      throw new Error('API响应格式错误');
    }

    let content = response.choices[0].message.content;
    console.log('DeepSeek返回内容长度:', content.length);
    
    // 尝试提取JSON数组
    try {
      // 移除可能的markdown代码块标记
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // 尝试找到JSON数组的开始和结束
      const startIndex = content.indexOf('[');
      const endIndex = content.lastIndexOf(']');
      
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        content = content.substring(startIndex, endIndex + 1);
      }
      
      const newsData = JSON.parse(content);
      
      if (!Array.isArray(newsData)) {
        throw new Error('返回的不是数组');
      }
      
      console.log('成功解析新闻数据:', newsData.length, '条');
      return newsData;
    } catch (parseError) {
      console.error('JSON解析失败:', parseError.message);
      console.error('原始内容:', content.substring(0, 500));
      throw new Error('AI生成的数据格式错误');
    }
  } catch (error) {
    console.error('Get news data error:', error.message || error);
    throw error;
  }
}

// 生成新闻AI解读和预测
async function generateNewsAnalysis(news) {
  const prompt = `请为以下新闻生成专业的AI解读和趋势预测。

新闻标题：${news.title}
新闻摘要：${news.summary || ''}
新闻分类：${news.category || 'AI'}

请返回JSON格式（不要有其他文字）：
{
  "interpretation": "专业的AI深度解读，100-150字，分析新闻的核心意义和影响",
  "prediction": "趋势预测，80-100字，预测未来可能的发展方向"
}`;

  try {
    const response = await request('/chat/completions', {
      method: 'POST',
      data: {
        model: getModel(),
        messages: [
          {
            role: 'system',
            content: '你是专业的新闻分析师，擅长深度解读新闻并预测趋势。只返回JSON，不要有其他文字。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }
    });

    if (response && response.choices && response.choices[0] && response.choices[0].message) {
      let content = response.choices[0].message.content.trim();
      // 移除可能的markdown标记
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      try {
        const result = JSON.parse(content);
        return {
          interpretation: result.interpretation || '',
          prediction: result.prediction || ''
        };
      } catch (e) {
        console.error('解析AI解读失败:', e);
      }
    }
  } catch (error) {
    console.error('生成AI解读失败:', error);
  }
  
  // 失败时返回空
  return {
    interpretation: '',
    prediction: ''
  };
}

// 生成新闻标签
async function generateNewsTags(news) {
  const prompt = `请为以下新闻生成3-5个精准的标签。

新闻标题：${news.title}
新闻摘要：${news.summary || ''}
新闻分类：${news.category || 'AI'}

要求：
1. 标签要精准概括新闻核心内容
2. 包含关键实体（公司名、人名、技术名等）
3. 包含行业/领域标签
4. 每个标签2-6个字

请返回JSON数组格式（不要有其他文字）：
["标签1", "标签2", "标签3"]`;

  try {
    const response = await request('/chat/completions', {
      method: 'POST',
      data: {
        model: getModel(),
        messages: [
          {
            role: 'system',
            content: '你是专业的新闻编辑，擅长提取新闻关键标签。只返回JSON数组，不要有其他文字。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 100
      }
    });

    if (response && response.choices && response.choices[0] && response.choices[0].message) {
      let content = response.choices[0].message.content.trim();
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      try {
        const tags = JSON.parse(content);
        if (Array.isArray(tags) && tags.length > 0) {
          return tags.slice(0, 5);
        }
      } catch (e) {
        console.error('解析标签失败:', e);
      }
    }
  } catch (error) {
    console.error('生成标签失败:', error);
  }
  
  // 失败时返回空数组
  return [];
}

// 生成小白模式内容（形象比喻、知识小百科、导师点评）
async function generateNewbieContent(news) {
  const prompt = `请为以下新闻生成小白模式的解读内容，让普通人也能轻松理解。

新闻标题：${news.title}
新闻摘要：${news.summary || ''}
新闻分类：${news.category || 'AI'}

请返回JSON格式（不要有其他文字）：
{
  "simple_summary": "用最简单的话概括这条新闻，50字以内",
  "analogy": "用生动形象的比喻解释这条新闻的核心内容，让小白也能秒懂，80字以内",
  "talking_point": "导师点评/社交金句，用通俗易懂的语言分析这条新闻对普通人的影响，80字以内",
  "story": {
    "before": "这件事发生之前是什么情况，30字以内",
    "after": "这件事之后会怎样发展，30字以内"
  },
  "jargon_tips": [
    {"term": "专业术语1", "explain": "通俗解释"},
    {"term": "专业术语2", "explain": "通俗解释"}
  ]
}`;

  try {
    const response = await request('/chat/completions', {
      method: 'POST',
      data: {
        model: getModel(),
        messages: [
          {
            role: 'system',
            content: '你是一位善于用通俗语言解释复杂概念的科普作家。只返回JSON，不要有其他文字。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      }
    });

    if (response && response.choices && response.choices[0] && response.choices[0].message) {
      let content = response.choices[0].message.content.trim();
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      try {
        const result = JSON.parse(content);
        return {
          simple_summary: result.simple_summary || '',
          analogy: result.analogy || '',
          talking_point: result.talking_point || '',
          story: result.story || { before: '', after: '' },
          jargon_tips: result.jargon_tips || []
        };
      } catch (e) {
        console.error('解析小白内容失败:', e);
      }
    }
  } catch (error) {
    console.error('生成小白内容失败:', error);
  }
  
  // 失败时返回空对象
  return {
    simple_summary: '',
    analogy: '',
    talking_point: '',
    story: { before: '', after: '' },
    jargon_tips: []
  };
}

// ==================== 相关性分析相关函数 ====================

// 生成相关性分析提示词
function generateRelevanceAnalysisPrompt(newsContent, persona) {
  const personaName = persona || '通用';
  const personaIcons = {
    '投资者': '💰',
    '程序员': '💻',
    '管理者': '👔',
    '教师': '👩‍🏫',
    '学生': '📚',
    '通用': '👤'
  };
  const icon = personaIcons[personaName] || '👤';
  
  return `你是一位专业的个人影响分析师。请仔细阅读以下新闻，为"${personaName}"身份的用户生成深度个性化的相关性分析。

【新闻内容】
标题：${newsContent.title}
摘要：${newsContent.summary || newsContent.title}
分类：${newsContent.category || 'AI'}
来源：${newsContent.source || '未知'}

【分析要求】
请针对这条具体新闻，生成8个维度的深度分析。所有内容必须与新闻直接相关，不要使用通用模板。

请严格按照以下JSON格式输出（不要有任何其他文字）：
{
  "roiAnalysis": [
    {
      "identity": "${personaName}",
      "icon": "${icon}",
      "gain": "基于新闻内容，分析对${personaName}的具体潜在收益",
      "risk": "基于新闻内容，分析对${personaName}的具体潜在风险",
      "net": "综合评估净收益"
    },
    {
      "identity": "与新闻相关的身份1",
      "icon": "emoji",
      "gain": "具体潜在收益",
      "risk": "具体潜在风险",
      "net": "净收益评估"
    },
    {
      "identity": "与新闻相关的身份2",
      "icon": "emoji",
      "gain": "具体潜在收益",
      "risk": "具体潜在风险",
      "net": "净收益评估"
    }
  ],
  "ripplePath": {
    "level1": "基于新闻的直接冲击（第一层影响）",
    "level2": "由此引发的传导影响（第二层连锁反应）",
    "level3": "最终产生的长期效应（第三层深远影响）"
  },
  "actionItems": [
    { "text": "针对这条新闻的具体行动建议1", "tag": "行动类型", "checked": false },
    { "text": "针对这条新闻的具体行动建议2", "tag": "行动类型", "checked": false },
    { "text": "针对这条新闻的具体行动建议3", "tag": "行动类型", "checked": false }
  ],
  "debateVS": {
    "optimistic": {
      "title": "乐观派观点",
      "content": "基于新闻内容的积极解读，说明为什么这是好消息（60-80字）"
    },
    "cautious": {
      "title": "审慎派观点",
      "content": "基于新闻内容的谨慎解读，说明需要警惕什么（60-80字）"
    }
  },
  "stakeholders": [
    {
      "type": "赢家",
      "icon": "🏆",
      "list": [
        { "name": "基于新闻的受益方1", "impact": "具体如何受益" },
        { "name": "基于新闻的受益方2", "impact": "具体如何受益" }
      ]
    },
    {
      "type": "输家",
      "icon": "⚠️",
      "list": [
        { "name": "基于新闻的受损方1", "impact": "具体如何受损" },
        { "name": "基于新闻的受损方2", "impact": "具体如何受损" }
      ]
    }
  ],
  "socialCurrency": "基于这条新闻提炼的社交金句，可用于聊天讨论（20-30字）",
  "impactTimer": {
    "angle": 0-180之间的数字,
    "timeframe": "预计影响显现时间（如：即刻/1周内/1个月内/3个月内/半年内）",
    "description": "为什么是这个时间节点的说明"
  },
  "impactPoints": [
    { "id": 1, "label": "职业", "text": "对职业发展的具体影响", "severity": "high/medium/low", "severityText": "高影响/中等影响/低影响" },
    { "id": 2, "label": "财务", "text": "对财务状况的具体影响", "severity": "high/medium/low", "severityText": "高影响/中等影响/低影响" },
    { "id": 3, "label": "学习", "text": "对学习成长的具体影响", "severity": "high/medium/low", "severityText": "高影响/中等影响/低影响" }
  ],
  "actionSuggestions": [
    { "text": "立即可做的事情1", "checked": false },
    { "text": "立即可做的事情2", "checked": false },
    { "text": "立即可做的事情3", "checked": false }
  ],
  "keyInsights": [
    { "icon": "📈", "text": "关键洞察1：基于新闻的核心发现" },
    { "icon": "🎯", "text": "关键洞察2：对${personaName}的启示" },
    { "icon": "💡", "text": "关键洞察3：值得关注的趋势" }
  ],
  "impactTimeline": [
    { "id": 1, "label": "即刻", "time": "现在", "angle": 0, "icon": "⚡", "active": true, "impactLevel": "high/medium/low", "impactText": "直接影响", "description": "当前阶段的具体影响" },
    { "id": 2, "label": "1个月", "time": "30天后", "angle": 90, "icon": "📅", "active": false, "impactLevel": "high/medium/low", "impactText": "短期影响", "description": "一个月后的预期影响" },
    { "id": 3, "label": "半年", "time": "6个月后", "angle": 180, "icon": "📆", "active": false, "impactLevel": "high/medium/low", "impactText": "长期影响", "description": "半年后的预期影响" }
  ],
  "currentImpactAngle": 0-180之间的数字,
  "currentImpactText": "综合评估：这条新闻对${personaName}的整体影响程度和建议",
  "currentImpactLevel": "high/medium/low"
}

【重要提醒】
1. 所有分析必须紧密围绕新闻标题"${newsContent.title}"展开
2. 不要使用通用模板，每个字段都要与新闻内容直接相关
3. 如果某项分析与新闻无关，请填写"无"
4. 确保输出的是有效的JSON格式，不要有任何额外文字`;
}

// 生成相关性分析（使用DeepSeek API）
async function generateRelevanceAnalysis(newsContent, persona) {
  try {
    const prompt = generateRelevanceAnalysisPrompt(newsContent, persona);
    incrementApiCallCount();
    
    const response = await request('/chat/completions', {
      method: 'POST',
      data: {
        model: getModel(),
        messages: [
          {
            role: 'system',
            content: '你是一位专业的个人影响分析师，擅长分析新闻对不同身份人群的影响。请根据新闻内容生成具体、详细、有针对性的分析结果。只返回JSON，不要有其他文字。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 3000
      }
    });
    
    if (response && response.choices && response.choices[0]) {
      let content = response.choices[0].message.content;
      content = content.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
      
      try {
        const analysisData = JSON.parse(content);
        console.log('相关性分析生成成功');
        return analysisData;
      } catch (parseError) {
        console.error('解析相关性分析失败:', parseError);
        throw new Error('AI生成的数据格式错误');
      }
    }
    
    throw new Error('API返回数据格式错误');
  } catch (error) {
    console.error('生成相关性分析失败:', error);
    throw error;
  }
}

// ==================== 七要素审计（极简版）====================

// 生成七要素审计提示词
function generateSevenElementsPrompt(newsContent) {
  return `请作为首席情报审计官，分析以下新闻内容。

【新闻内容】
标题：${newsContent.title}
摘要：${newsContent.summary || newsContent.title}
分类：${newsContent.category || 'AI'}
来源：${newsContent.source || '未知'}

【任务】生成7要素审计JSON，要求：
01 证据链：分析报道的一致性，提取已核实事实。
02 共识冲突：对比报道中的重合点与尚未披露的漏洞。
03 原子事实：提取具体的数值、时间、地点数据。
04 底层逻辑：解释物理/技术底层原理，拒绝空话。
05 证伪预警：设定具体的证伪观测红线。
06 最终鉴定：给出置信分、星级和50字定性。
07 时间轴：梳理[起源-现状-下一步]逻辑。

【约束】拒绝修饰，内容必须互补，不要重复。

【输出格式】纯JSON，不要有任何其他文字：
{
  "audit": {
    "01": {
      "score": 95,
      "verified_facts": ["已核实事实1", "已核实事实2"],
      "conflicts": ["存疑点1"],
      "verdict": "一句话判词"
    },
    "02": {
      "consensus": ["共识1", "共识2"],
      "gaps": ["漏洞1"],
      "alignment": 85
    },
    "03": {
      "key_data": [
        {"key": "发布时间", "value": "2026-03-05", "status": "已对证"},
        {"key": "涉及金额", "value": "100亿美元", "status": "待对证"}
      ]
    },
    "04": {
      "logic_path": ["原因A", "过程B", "结果C"],
      "glossary": {"term": "核心术语", "explain": "大白话解释"}
    },
    "05": {
      "redlines": [
        {"text": "若24小时内官网未更新，可信度下降", "impact": "高"}
      ],
      "impact": "中"
    },
    "06": {
      "final_score": 88,
      "verdict_text": "50字以内的专业点评",
      "action_star": 4
    },
    "07": {
      "steps": [
        {"date": "2026-03-01", "event": "起源事件", "type": "past"},
        {"date": "2026-03-05", "event": "当前爆发", "type": "current"},
        {"date": "2026-03-15", "event": "预期发展", "type": "future"}
      ]
    }
  }
}`;
}

// 七要素审计（使用DeepSeek API）
async function generateSevenElementsAudit(newsContent) {
  try {
    const prompt = generateSevenElementsPrompt(newsContent);
    incrementApiCallCount();
    
    const response = await request('/chat/completions', {
      method: 'POST',
      data: {
        model: getModel(),
        messages: [
          {
            role: 'system',
            content: '你是首席情报审计官，擅长多源验证和事实核查。只返回JSON，不要有其他文字。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500
      }
    });
    
    if (response && response.choices && response.choices[0]) {
      let content = response.choices[0].message.content;
      content = content.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
      
      // 提取JSON
      const startIdx = content.indexOf('{');
      const endIdx = content.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        content = content.substring(startIdx, endIdx + 1);
      }
      
      try {
        const auditData = JSON.parse(content);
        console.log('七要素审计生成成功');
        return auditData;
      } catch (parseError) {
        console.error('解析七要素审计失败:', parseError);
        throw new Error('AI生成的数据格式错误');
      }
    }
    
    throw new Error('API返回数据格式错误');
  } catch (error) {
    console.error('七要素审计失败:', error);
    throw error;
  }
}

// ==================== 私人顾问分析（决策导向版 08-14）====================

// 生成私人顾问提示词（简化版）
function generatePersonalAdvisoryPrompt(newsContent) {
  return `请作为私人情报顾问，针对以下新闻为三种身份生成个性化建议。

【新闻内容】
标题：${newsContent.title}
摘要：${newsContent.summary || newsContent.title}
分类：${newsContent.category || 'AI'}

【分析要求】
为投资者、技术人、管理者三种身份分别生成：
1. 影响指数（-100到100的数字）
2. 增益点和风险点
3. 资金/机会传导路径（3-4个节点）
4. 看多和看空策略
5. 避坑提醒
6. 3个具体行动
7. 时间窗口和触发事件
8. 一句专业金句

【输出格式】纯JSON：
{
  "investor": {
    "impact_idx": 50,
    "gain_detail": "投资增益点",
    "risk_detail": "投资风险点",
    "money_flow": ["源头", "中游", "下游"],
    "winner": "最终获益者",
    "bull_case": "看多策略",
    "bear_case": "看空策略",
    "pitfall": "避坑提醒",
    "actions_list": ["行动1", "行动2", "行动3"],
    "timing_horizon": "1周内",
    "timing_trigger": "触发事件",
    "gold_quote": "专业金句"
  },
  "coder": {
    "impact_idx": 30,
    "gain_detail": "技术增益点",
    "risk_detail": "技术风险点",
    "money_flow": ["技术源头", "工具链", "应用层"],
    "winner": "技术红利获益者",
    "bull_case": "进取策略",
    "bear_case": "防御策略",
    "pitfall": "避坑提醒",
    "actions_list": ["行动1", "行动2", "行动3"],
    "timing_horizon": "1个月内",
    "timing_trigger": "触发事件",
    "gold_quote": "专业金句"
  },
  "manager": {
    "impact_idx": 40,
    "gain_detail": "管理增益点",
    "risk_detail": "管理风险点",
    "money_flow": ["战略源头", "组织变革", "人才流动"],
    "winner": "组织红利获益者",
    "bull_case": "进取策略",
    "bear_case": "防御策略",
    "pitfall": "避坑提醒",
    "actions_list": ["行动1", "行动2", "行动3"],
    "timing_horizon": "3个月内",
    "timing_trigger": "触发事件",
    "gold_quote": "专业金句"
  }
}`;
}

// 私人顾问分析（使用DeepSeek API）
async function generatePersonalAdvisory(newsContent) {
  try {
    const prompt = generatePersonalAdvisoryPrompt(newsContent);
    incrementApiCallCount();
    
    const response = await request('/chat/completions', {
      method: 'POST',
      data: {
        model: getModel(),
        messages: [
          {
            role: 'system',
            content: '你是私人情报顾问，擅长将新闻转化为个人决策建议。只返回JSON，不要有其他文字。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      }
    });
    
    if (response && response.choices && response.choices[0]) {
      let content = response.choices[0].message.content;
      console.log('私人顾问原始返回:', content.substring(0, 200));
      
      // 清理内容
      content = content.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
      
      // 提取JSON
      const startIdx = content.indexOf('{');
      const endIdx = content.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        content = content.substring(startIdx, endIdx + 1);
      }
      
      try {
        const rawData = JSON.parse(content);
        
        // 标准化数据结构
        const advisoryData = normalizePersonalAdvisoryData(rawData);
        
        console.log('私人顾问分析生成成功');
        return advisoryData;
      } catch (parseError) {
        console.error('解析私人顾问分析失败:', parseError);
        console.error('清理后内容:', content.substring(0, 500));
        throw new Error('AI生成的数据格式错误');
      }
    }
    
    throw new Error('API返回数据格式错误');
  } catch (error) {
    console.error('私人顾问分析失败:', error);
    throw error;
  }
}

// 标准化私人顾问数据结构
function normalizePersonalAdvisoryData(raw) {
  const normalizePersona = (data) => {
    if (!data) return getDefaultPersonaData();
    
    return {
      impact_idx: typeof data.impact_idx === 'number' ? data.impact_idx : 0,
      gain_detail: data.gain_detail || data.gain || '',
      risk_detail: data.risk_detail || data.risk || '',
      money_flow: Array.isArray(data.money_flow) ? data.money_flow : [],
      winner: data.winner || '',
      bull_case: data.bull_case || data.bullCase || '',
      bear_case: data.bear_case || data.bearCase || '',
      pitfall: data.pitfall || '',
      actions_list: Array.isArray(data.actions_list) ? data.actions_list : 
                    Array.isArray(data.actionsList) ? data.actionsList : [],
      timing_horizon: data.timing_horizon || data.timingHorizon || '',
      timing_trigger: data.timing_trigger || data.timingTrigger || '',
      gold_quote: data.gold_quote || data.goldQuote || ''
    };
  };
  
  const getDefaultPersonaData = () => ({
    impact_idx: 0,
    gain_detail: '',
    risk_detail: '',
    money_flow: [],
    winner: '',
    bull_case: '',
    bear_case: '',
    pitfall: '',
    actions_list: [],
    timing_horizon: '',
    timing_trigger: '',
    gold_quote: ''
  });
  
  // 如果返回的是单一身份数据（没有investor/coder/manager结构）
  if (!raw.investor && !raw.coder && !raw.manager) {
    const singleData = normalizePersona(raw);
    return {
      investor: singleData,
      coder: singleData,
      manager: singleData
    };
  }
  
  return {
    investor: normalizePersona(raw.investor),
    coder: normalizePersona(raw.coder),
    manager: normalizePersona(raw.manager)
  };
}

// ==================== 深度探源分析（因果溯源版 15-21）====================

// 生成深度探源提示词（因果溯源版）
function generateDeepResearchPrompt(newsContent) {
  return `请作为战略智库研究员，针对以下新闻进行深度因果溯源分析。

【新闻内容】
标题：${newsContent.title}
摘要：${newsContent.summary || newsContent.title}
分类：${newsContent.category || 'AI'}

【分析要求】
1. 显微镜核查：找出新闻中最关键的一个数字或结论，进行逻辑验证
2. 推理链：用3-4步展示从事实到洞察的推导过程
3. 历史对标：找一个历史上相似的案例，提取教训
4. 利益图谱：分析2-3个幕后主体及其真实动机
5. 生态位：列出上游、下游、竞争方
6. 黑天鹅：指出可能导致逻辑失效的触发条件
7. 战略预言：给出1-3年的终极预测（80字内）

【输出格式】纯JSON：
{
  "micro_audit_target": "被核查的关键数字或结论",
  "micro_audit_logic": "核实理由",
  "reasoning_steps": ["步骤1", "步骤2", "步骤3"],
  "history_match": "历史相似案例",
  "history_lesson": "历史教训",
  "hidden_interests": [
    {"entity": "主体1", "motivation": "动机1"},
    {"entity": "主体2", "motivation": "动机2"}
  ],
  "ecosystem_upstream": ["上游1", "上游2"],
  "ecosystem_downstream": ["下游1", "下游2"],
  "ecosystem_rivals": ["竞争1", "竞争2"],
  "black_swan_trigger": "黑天鹅触发条件",
  "strategic_outlook": "1-3年战略预言"
}`;
}

// 深度探源分析（使用DeepSeek API）
async function generateDeepResearch(newsContent) {
  try {
    const prompt = generateDeepResearchPrompt(newsContent);
    incrementApiCallCount();
    
    const response = await request('/chat/completions', {
      method: 'POST',
      data: {
        model: getModel(),
        messages: [
          {
            role: 'system',
            content: '你是顶级战略智库研究员，擅长因果溯源与战略建模。所有分析必须从微观锚点出发，层层递进到宏观推演，形成闭环的情报链条。内容要透彻、硬核，敢于揭露普通媒体不敢写的深层逻辑。只返回JSON，不要有其他文字。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3500
      }
    });
    
    if (response && response.choices && response.choices[0]) {
      let content = response.choices[0].message.content;
      console.log('深度探源原始返回:', content.substring(0, 200));
      
      // 清理内容
      content = content.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
      
      // 提取JSON
      const startIdx = content.indexOf('{');
      const endIdx = content.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        content = content.substring(startIdx, endIdx + 1);
      }
      
      try {
        const rawData = JSON.parse(content);
        
        // 标准化数据结构，兼容多种返回格式
        const researchData = normalizeDeepResearchData(rawData);
        
        console.log('深度探源分析生成成功');
        return researchData;
      } catch (parseError) {
        console.error('解析深度探源分析失败:', parseError);
        console.error('清理后内容:', content.substring(0, 500));
        throw new Error('AI生成的数据格式错误');
      }
    }
    
    throw new Error('API返回数据格式错误');
  } catch (error) {
    console.error('深度探源分析失败:', error);
    throw error;
  }
}

// 标准化深度探源数据结构
function normalizeDeepResearchData(raw) {
  // 兼容新旧两种数据格式
  const data = {};
  
  // 20 显微镜核查
  if (raw.micro_audit_target) {
    data.micro_audit_target = raw.micro_audit_target;
    data.micro_audit_logic = raw.micro_audit_logic || '';
  } else if (raw.micro_audit) {
    data.micro_audit_target = raw.micro_audit.target || '';
    data.micro_audit_logic = raw.micro_audit.check_logic || raw.micro_audit.logic || '';
  } else {
    data.micro_audit_target = '';
    data.micro_audit_logic = '';
  }
  
  // 15 推理链
  if (Array.isArray(raw.reasoning_steps)) {
    data.reasoning_steps = raw.reasoning_steps;
  } else if (Array.isArray(raw.reasoning)) {
    data.reasoning_steps = raw.reasoning;
  } else {
    data.reasoning_steps = [];
  }
  
  // 16 历史相似
  if (raw.history_match) {
    data.history_match = raw.history_match;
    data.history_lesson = raw.history_lesson || '';
  } else if (raw.history) {
    data.history_match = raw.history.event || raw.history.match || '';
    data.history_lesson = raw.history.lesson || '';
  } else {
    data.history_match = '';
    data.history_lesson = '';
  }
  
  // 17 利益图谱
  if (Array.isArray(raw.hidden_interests)) {
    data.hidden_interests = raw.hidden_interests;
  } else if (Array.isArray(raw.interest_map)) {
    data.hidden_interests = raw.interest_map;
  } else {
    data.hidden_interests = [];
  }
  
  // 18 生态位
  if (Array.isArray(raw.ecosystem_upstream)) {
    data.ecosystem_upstream = raw.ecosystem_upstream;
    data.ecosystem_downstream = raw.ecosystem_downstream || [];
    data.ecosystem_rivals = raw.ecosystem_rivals || [];
  } else if (raw.graph_ext) {
    data.ecosystem_upstream = raw.graph_ext.upstream || [];
    data.ecosystem_downstream = raw.graph_ext.downstream || [];
    data.ecosystem_rivals = raw.graph_ext.rivals || [];
  } else {
    data.ecosystem_upstream = [];
    data.ecosystem_downstream = [];
    data.ecosystem_rivals = [];
  }
  
  // 19 黑天鹅
  if (raw.black_swan_trigger) {
    data.black_swan_trigger = raw.black_swan_trigger;
  } else if (Array.isArray(raw.variables) && raw.variables.length > 0) {
    // 从变量数组中提取第一个作为黑天鹅触发点
    const v = raw.variables[0];
    data.black_swan_trigger = v.name ? `${v.name}：${v.threshold || ''}` : '';
  } else {
    data.black_swan_trigger = '';
  }
  
  // 21 战略终局
  data.strategic_outlook = raw.strategic_outlook || raw.outlook || '';
  
  return data;
}

// ==================== 导出函数 ====================

module.exports = {
  generateLogicTree,
  generateReadingAssistance,
  generateVerification,
  generateTimeline,
  testConnection,
  getIntelligenceData,
  getNewsData,
  analyzeSentimentWithAI,
  analyzeImpactWithAI,
  fallbackSentimentAnalysis,
  fallbackImpactAnalysis,
  generateAuditMatrix,
  generateAuditMatrixWithRetry,
  generateNewsAnalysis,
  generateNewsTags,
  generateNewbieContent,
  generateRelevanceAnalysis,
  generateDeepExploration,
  generateSevenElementsAudit,
  generatePersonalAdvisory,
  generateDeepResearch
};
