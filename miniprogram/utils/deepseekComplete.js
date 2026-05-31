/**
 * DeepSeek API 完整集成模块
 * 使用DeepSeek API实现所有功能，无需真实新闻API
 */

const deepseek = require('./deepseek.js');

// ==================== 完整新闻数据生成 ====================

// 使用DeepSeek API生成完整的新闻数据
async function generateCompleteNewsData(category = 'AI', count = 5) {
  try {
    const prompt = `请生成${count}条真实的新闻数据，包括：

每条新闻包含：
1. 标题（真实、具体）
2. 摘要（详细、准确）
3. 分类（AI、tech、finance、international、sports）
4. 发布时间（24小时制，如：08:30）
5. 标签（3-5个相关标签）
6. 新闻来源（2-3个真实媒体名称）
7. 简单解读和预测

输出格式（必须是纯JSON，不要有任何其他文字）：
[
  {
    "title": "真实新闻标题",
    "summary": "详细准确的新闻摘要",
    "category": "AI",
    "timeSlot": "08:30",
    "tags": ["标签1", "标签2", "标签3"],
    "sources": [
      { "name": "媒体名称", "url": "https://example.com", "icon": "🖥️" }
    ],
    "simpleSummary": "一句话总结",
    "simpleInterpretation": "通俗解读",
    "simplePrediction": "简单预测",
    "analogy": "形象比喻",
    "story": {
      "before": "之前的情况",
      "after": "之后的变化"
    },
    "talking_point": "社交金句",
    "jargonTips": [
      { "term": "术语", "explain": "解释" }
    ]
  }
]

要求：
1. 新闻标题要真实、具体、有新闻价值
2. 摘要要详细、准确，不少于50字
3. 分类要准确
4. 发布时间要合理（24小时制）
5. 标签要相关、准确
6. 新闻来源要是真实的媒体名称
7. 简单解读要通俗易懂
8. 形象比喻要生动形象
9. 社交金句要简洁有力
10. 术语解释要准确易懂
11. 确保输出的是有效的JSON格式`;

    const response = await deepseek.request('/chat/completions', {
      method: 'POST',
      data: {
        model: deepseek.getModel(),
        messages: [
          {
            role: 'system',
            content: '你是一位专业的新闻编辑，擅长收集和分析全球最新的科技、金融和国际新闻。'
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

    const content = response.choices[0].message.content;
    const cleanedContent = content.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    
    const newsData = JSON.parse(cleanedContent);
    
    // 为每条新闻添加ID和额外数据
    const completeNewsData = newsData.map((news, index) => ({
      id: `deepseek-${Date.now()}-${index}`,
      ...news,
      published_at: `2026-01-06 ${news.timeSlot}`
    }));
    
    console.log('成功生成新闻数据:', completeNewsData.length, '条');
    return completeNewsData;
  } catch (error) {
    console.error('生成新闻数据失败:', error);
    throw error;
  }
}

// ==================== 三种表达模式生成 ====================

// 为新闻生成标准模式数据（使用DeepSeek API）
async function generateStandardModeData(news) {
  try {
    const prompt = `请针对这条新闻生成标准模式的分析数据。

新闻内容：
标题：${news.title}
摘要：${news.summary}
分类：${news.category}

输出格式（必须是纯JSON，不要有任何其他文字）：
{
  "summary": "详细的新闻摘要",
  "source": "新闻来源",
  "time": "发布时间",
  "ai_analysis": "AI分析：从技术、市场、政策等角度深入分析",
  "prediction": "预测：基于当前趋势的短期和中期预测",
  "related": ["相关新闻1", "相关新闻2", "相关新闻3"],
  "timeline": [
    { "date": "2022/11", "event": "历史事件1", "type": "past", "importance": "normal" },
    { "date": "2023/03", "event": "历史事件2", "type": "past", "importance": "high" },
    { "date": "2024/05", "event": "历史事件3", "type": "past", "importance": "normal" }
  ]
}

要求：
1. 摘要要详细、准确，不少于50字
2. AI分析要从技术、市场、政策等角度深入分析
3. 预测要基于当前趋势，有理有据
4. 相关新闻要真实、相关
5. 时间轴要准确、相关
6. 所有描述要详细、有深度，不少于30字
7. 确保输出的是有效的JSON格式`;

    const response = await deepseek.request('/chat/completions', {
      method: 'POST',
      data: {
        model: deepseek.getModel(),
        messages: [
          {
            role: 'system',
            content: '你是一位专业的新闻分析师，擅长从技术、市场、政策等角度深入分析新闻。'
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
    const cleanedContent = content.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('生成标准模式数据失败:', error);
    throw error;
  }
}

// 为新闻生成小白模式数据（使用DeepSeek API）
async function generateNewbieModeData(news) {
  try {
    const prompt = `请针对这条新闻生成小白模式的分析数据。

新闻内容：
标题：${news.title}
摘要：${news.summary}
分类：${news.category}

输出格式（必须是纯JSON，不要有任何其他文字）：
{
  "simple_summary": "通俗易懂的一句话总结，不超过50字",
  "jargon_tips": [
    { "term": "专业术语1", "explain": "用生活化的语言解释，不少于20字" },
    { "term": "专业术语2", "explain: "用生活化的语言解释，不少于20字" },
    { "term": "专业术语3", "explain": "用生活化的语言解释，不少于20字" }
  ]
}

要求：
1. 简单总结要通俗易懂，不超过50字
2. 术语解释要用生活化的语言，形象生动
3. 每个术语解释不少于20字
4. 避免使用专业术语，如果必须使用要解释
5. 确保输出的是有效的JSON格式`;

    const response = await deepseek.request('/chat/completions', {
      method: 'POST',
      data: {
        model: deepseek.getModel(),
        messages: [
          {
            role: 'system',
            content: '你是一位擅长用通俗易懂的语言解释复杂概念的科普专家。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      }
    });

    const content = response.choices[0].message.content;
    const cleanedContent = content.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('生成小白模式数据失败:', error);
    throw error;
  }
}

// 为新闻生成脱水模式数据（使用DeepSeek API）
async function generateDehydratedModeData(news) {
  try {
    const prompt = `请针对这条新闻生成脱水模式的分析数据。

新闻内容：
标题：${news.title}
摘要：${news.summary}

输出格式（必须是纯JSON，不要有任何其他文字）：
{
  "dehydrated": "极致精简的标题，不超过20字"
}

要求：
1. 提取新闻的核心信息
2. 去除所有修饰词和冗余信息
3. 保留最关键的核心内容
4. 不超过20字
5. 确保输出的是有效的JSON格式`;

    const response = await deepseek.request('/chat/completions', {
      method: 'POST',
      data: {
        model: deepseek.getModel(),
        messages: [
          {
            role: 'system',
            content: '你是一位擅长提炼核心信息的编辑，能够快速提取新闻的关键内容。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 200
      }
    });

    const content = response.choices[0].message.content;
    const cleanedContent = content.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('生成脱水模式数据失败:', error);
    throw error;
  }
}

// ==================== 情报中心数据生成 ====================

// 使用DeepSeek API生成完整的情报中心数据
async function generateIntelligenceCenterData() {
  try {
    const prompt = `请生成一份完整的情报中心数据，包括：

1. 市场情绪数据（0-100）
2. 政策敏感度（0-100）
3. 技术突破数量
4. 24小时新闻密度数据（24个数值）
5. 3个热点主题，每个主题包含：
   - 标题
   - 洞察
   - 颜色代码
   - 逻辑链
6. 3个明日关注事件，每个事件包含：
   - 事件名称
   - 发生概率（0-100）
   - 原因
7. 1个盲区情报

输出格式（必须是纯JSON，不要有任何其他文字）：
{
  "market_sentiment": 72,
  "policy_sensitivity": 65,
  "tech_breakthroughs": 8,
  "daily_density": [12, 15, 8, 20, 25, 30, 28, 35, 40, 38, 45, 50, 48, 42, 35, 30, 25, 20, 18, 15, 12, 10, 8, 10],
  "top_themes": [
    {
      "id": "t1",
      "title": "热点主题标题",
      "insight": "深度洞察，不少于50字",
      "color": "#A855F7",
      "logic_chain": ["逻辑点1", "逻辑点2", "逻辑点3"]
    }
  ],
  "tomorrow_watch": [
    {
      "event": "事件名称",
      "probability": 85,
      "reason": "原因说明，不少于30字"
    }
  ],
  "blind_spot": {
    "title": "盲区情报标题",
    "reason": "原因说明",
    "message": "警示信息，不少于50字"
  }
}

要求：
1. 数据要基于当前真实的市场情况
2. 热点主题要反映当前的科技和经济趋势
3. 明日关注事件要具有实际的发生概率
4. 盲区情报要具有启发性
5. 所有描述要详细、有深度
6. 确保输出的是有效的JSON格式`;

    const response = await deepseek.request('/chat/completions', {
      method: 'POST',
      data: {
        model: deepseek.getModel(),
        messages: [
          {
            role: 'system',
            content: '你是一位专业的情报分析专家，擅长分析全球市场动态和科技趋势。'
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

    const content = response.choices[0].message.content;
    const cleanedContent = content.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('生成情报中心数据失败:', error);
    throw error;
  }
}

// ==================== 情绪指数生成 ====================

// 使用DeepSeek API生成情绪指数
async function generateSentimentIndex(news) {
  try {
    const prompt = `分析以下新闻的情绪（积极/中性/消极），只返回一个词：positive/neutral/negative

新闻内容：
标题：${news.title}
摘要：${news.summary}

分析要求：
1. 基于新闻内容的整体语义分析情绪
2. 考虑标题和摘要的综合情绪倾向
3. 识别讽刺、反语等复杂情绪表达
4. 如果新闻包含积极关键词（如突破、增长、成功、创新等），倾向于positive
5. 如果新闻包含消极关键词（如下跌、风险、危机、失败等），倾向于negative
6. 如果新闻内容平衡或无明显情绪倾向，倾向于neutral
7. 只返回一个词：positive/neutral/negative`;

    const response = await deepseek.request('/chat/completions', {
      method: 'POST',
      data: {
        model: deepseek.getModel(),
        messages: [
          {
            role: 'system',
            content: '你是一位专业的情绪分析专家，擅长分析文本的情绪倾向。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 50
      }
    });

    const sentiment = response.choices[0].message.content.trim().toLowerCase();
    
    const sentimentMap = {
      positive: { value: 75, label: '积极' },
      neutral: { value: 50, label: '中性' },
      negative: { value: 25, label: '消极' }
    };
    
    return {
      sentiment: sentiment,
      score: sentimentMap[sentiment]?.value || 50,
      label: sentimentMap[sentiment]?.label || '中性',
      confidence: 0.85
    };
  } catch (error) {
    console.error('生成情绪指数失败:', error);
    return { sentiment: 'neutral', score: 50, label: '中性', confidence: 0.7 };
  }
}

// ==================== 涟漪效应生成 ====================

// 使用DeepSeek API生成涟漪效应
async function generateRippleEffects(news) {
  try {
    const prompt = `请针对这条新闻生成涟漪效应数据。

新闻内容：
标题：${news.title}
摘要：${news.summary}
分类：${news.category}

输出格式（必须是纯JSON，不要有任何其他文字）：
{
  "rippleEffects": [
    {
      "industry": "行业名称",
      "impact": "影响描述，不少于20字"
    },
    {
      "industry": "行业名称",
      "impact": "影响描述，不少于20字"
    },
    {
      "industry": "行业名称",
      "impact": "影响描述，不少于20字"
    }
  ]
}

要求：
1. 分析新闻对相关行业的影响
2. 每个影响描述不少于20字
3. 至少生成3个相关行业
4. 影响要具体、有针对性
5. 确保输出的是有效的JSON格式`;

    const response = await deepseek.request('/chat/completions', {
      method: 'POST',
      data: {
        model: deepseek.getModel(),
        messages: [
          {
            role: 'system',
            content: '你是一位专业的行业分析师，擅长分析新闻对相关行业的影响。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }
    });

    const content = response.choices[0].message.content;
    const cleanedContent = content.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('生成涟漪效应失败:', error);
    throw error;
  }
}

// ==================== 正反观点生成 ====================

// 使用DeepSeek API生成正反观点
async function generateDebateData(news) {
  try {
    const prompt = `请针对这条新闻生成正反观点数据。

新闻内容：
标题：${news.title}
摘要：${news.summary}
分类：${news.category}

输出格式（必须是纯JSON，不要有任何其他文字）：
{
  "debate": {
    "pro": {
      "title": "支持观点",
      "weight": 75,
      "points": [
        "支持点1，不少于20字",
        "支持点2，不少于20字",
        "支持点3，不少于20字"
      ]
    },
    "con": {
      "title": "担忧观点",
      "weight": 25,
      "points": [
        "担忧点1，不少于20字",
        "担忧点2，不少于20字",
        "担忧点3，不少于20字"
      ]
    },
    "verdict": "综合判断结论，不少于50字"
  }
}

要求：
1. 支持观点要基于新闻的积极面
2. 担忧观点要基于新闻的消极面
3. 每个观点不少于20字
4. 权重要合理分配（支持观点权重更高）
5. 综合判断要客观、平衡
6. 确保输出的是有效的JSON格式`;

    const response = await deepseek.request('/chat/completions', {
      method: 'POST',
      data: {
        model: deepseek.getModel(),
        messages: [
          {
            role: 'system',
            content: '你是一位专业的辩论分析师，擅长从多个角度分析新闻的正反两面。'
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
    const cleanedContent = content.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('生成正反观点失败:', error);
    throw error;
  }
}

// ==================== 完整新闻数据生成 ====================

// 为新闻生成完整的三种模式数据
async function generateCompleteNewsModes(news) {
  try {
    // 并行生成所有模式数据
    const [standardData, newbieData, dehydratedData, sentimentData, rippleEffects, debateData] = await Promise.all([
      generateStandardModeData(news),
      generateNewbieModeData(news),
      generateDehydratedModeData(news),
      generateSentimentIndex(news),
      generateRippleEffects(news),
      generateDebateData(news)
    ]);
    
    return {
      ...news,
      standard: standardData,
      newbie: newbieData,
      dehydrated: dehydratedData,
      sentiment: sentimentData.score,
      is_signal: sentimentData.score >= 75,
      sourceReliability: 'high',
      rippleEffects: rippleEffects.rippleEffects,
      debate: debateData.debate
    };
  } catch (error) {
    console.error('生成完整新闻模式数据失败:', error);
    throw error;
  }
}

// 批量生成新闻数据
async function generateNewsDataList(newsList) {
  try {
    const results = [];
    
    for (const news of newsList) {
      const completeData = await generateCompleteNewsModes(news);
      results.push(completeData);
    }
    
    return results;
  } catch (error) {
    console.error('批量生成新闻数据失败:', error);
    throw error;
  }
}

module.exports = {
  generateCompleteNewsData,
  generateStandardModeData,
  generateNewbieModeData,
  generateDehydratedModeData,
  generateIntelligenceCenterData,
  generateSentimentIndex,
  generateRippleEffects,
  generateDebateData,
  generateCompleteNewsModes,
  generateNewsDataList
};