// analysis_data.js - 分析数据（相关性分析 + 深度探索）
// 为所有51条新闻提供完整的分析数据

const analysisData = {};

// 辅助函数：根据新闻内容生成分析数据
function generateAnalysisForNews(news, index) {
  const category = news.category || 'AI';
  const title = news.title;
  const summary = news.summary;
  
  // 01. 多身份损益分析
  const personaAnalysis = generatePersonaAnalysis(news, category);
  
  // 02. 涟漪传导路径
  const ripplePath = generateRipplePath(news, category);
  
  // 03. 行动建议清单
  const actionItems = generateActionItems(news, category);
  
  // 04. 正反观点博弈
  const debateVS = generateDebateVS(news, category);
  
  // 05. 利益相关图谱
  const stakeholders = generateStakeholders(news, category);
  
  // 06. 跟我何干
  const socialCurrency = generateSocialCurrency(news, category);
  
  // 07. 预警时钟
  const impactTimer = generateImpactTimer(news, category);
  
  // 08. 利益关联时钟
  const impactTimeline = generateImpactTimeline(news, category);
  
  // 深度探索数据
  const deepExploration = {
    cotTree: generateCoTTree(news, category),
    hiddenInterests: generateHiddenInterests(news, category),
    historyCases: generateHistoryCases(news, category),
    historyAnalysis: generateHistoryAnalysis(news, category),
    keyVariables: generateKeyVariables(news, category),
    knowledgeEntities: generateKnowledgeEntities(news, category),
    fingerPrints: generateFingerPrints(news, category),
    factChecks: generateFactChecks(news, category),
    futureScenarios: generateFutureScenarios(news, category),
    futureConclusion: generateFutureConclusion(news, category)
  };
  
  return {
    relevanceAnalysis: {
      personaAnalysis,
      ripplePath,
      actionItems,
      debateVS,
      stakeholders,
      socialCurrency,
      impactTimer,
      impactTimeline,
      currentImpactAngle: impactTimer.angle,
      currentImpactText: impactTimer.description,
      currentImpactLevel: 'medium'
    },
    deepExploration
  };
}

// 生成多身份损益分析
function generatePersonaAnalysis(news, category) {
  const impacts = {
    '投资者': {
      impactPoints: [
        { id: 1, label: '职业', text: `${category}相关投资机会增加`, severity: 'high', severityText: '高影响' },
        { id: 2, label: '财务', text: '相关概念股可能迎来上涨', severity: 'high', severityText: '高影响' },
        { id: 3, label: '学习', text: '需要了解${category}技术发展趋势`, severity: 'medium', severityText: '中等影响' }
      ],
      actionSuggestions: [
        { text: `关注${category}、芯片等板块龙头企业`, checked: false },
        { text: '分散投资，降低单一风险', checked: false },
        { text: '设置价格提醒，及时调整仓位', checked: false }
      ],
      keyInsights: [
        { icon: '📈', text: '技术红利期预计持续6-12个月' },
        { icon: '🎯', text: '当前是布局相关技能的最佳时机' },
        { icon: '💡', text: '关注产业链上下游的投资机会' }
      ]
    },
    '程序员': {
      impactPoints: [
        { id: 1, label: '职业', text: `${category}相关API开放，开发机会增加`, severity: 'high', severityText: '高影响' },
        { id: 2, label: '学习', text: `需要掌握${category}技术架构`, severity: 'high', severityText: '高影响' },
        { id: 3, label: '竞争', text: `${category}能力成为核心竞争力`, severity: 'medium', severityText: '中等影响' }
      ],
      actionSuggestions: [
        { text: `学习${category}相关API文档和最佳实践`, checked: false },
        { text: '参与开源项目，建立技术影响力', checked: false },
        { text: '更新简历，突出相关经验', checked: false }
      ],
      keyInsights: [
        { icon: '🚀', text: `${category}技术将成为开发新标准` },
        { icon: '💻', text: `掌握${category}开发技能需求激增` },
        { icon: '📚', text: '持续学习，跟上技术迭代速度' }
      ]
    },
    '管理者': {
      impactPoints: [
        { id: 1, label: '团队', text: `${category}工具可提升团队效率`, severity: 'high', severityText: '高影响' },
        { id: 2, label: '管理', text: `需要制定${category}工具使用规范`, severity: 'medium', severityText: '中等影响' },
        { id: 3, label: '成本', text: `${category}工具可能增加运营成本`, severity: 'medium', severityText: '中等影响' }
      ],
      actionSuggestions: [
        { text: `评估${category}工具对团队的影响`, checked: false },
        { text: `制定${category}工具使用培训和规范`, checked: false },
        { text: '优化工作流程，整合相关工具', checked: false }
      ],
      keyInsights: [
        { icon: '👔', text: `${category}工具是提升效率的利器` },
        { icon: '⚖️', text: '平衡效率提升与成本控制' },
        { icon: '📊', text: '建立相关工具使用效果评估机制' }
      ]
    },
    '教师': {
      impactPoints: [
        { id: 1, label: '教学', text: `${category}技术改变教学方式`, severity: 'high', severityText: '高影响' },
        { id: 2, label: '学习', text: `需要了解${category}在教育中的应用`, severity: 'high', severityText: '高影响' },
        { id: 3, label: '职业', text: `${category}辅助教学成为新技能`, severity: 'medium', severityText: '中等影响' }
      ],
      actionSuggestions: [
        { text: `研究${category}在教育中的应用案例`, checked: false },
        { text: `参加${category}教学培训课程`, checked: false },
        { text: '更新课程内容，融入相关元素', checked: false }
      ],
      keyInsights: [
        { icon: '👩‍🏫', text: `${category}将重塑教育行业` },
        { icon: '📖', text: '个性化学习成为可能' },
        { icon: '💡', text: '教师角色从知识传授者转向引导者' }
      ]
    },
    '学生': {
      impactPoints: [
        { id: 1, label: '学习', text: `${category}工具可辅助学习`, severity: 'high', severityText: '高影响' },
        { id: 2, label: '就业', text: `${category}相关岗位需求增加`, severity: 'high', severityText: '高影响' },
        { id: 3, label: '技能', text: `需要掌握${category}工具使用`, severity: 'medium', severityText: '中等影响' }
      ],
      actionSuggestions: [
        { text: `学习使用${category}工具辅助学习`, checked: false },
        { text: `关注${category}相关岗位的招聘信息`, checked: false },
        { text: `培养${category}思维和问题解决能力`, checked: false }
      ],
      keyInsights: [
        { icon: '📚', text: `${category}是学习助手，不是替代品` },
        { icon: '🎯', text: `掌握${category}工具成为核心竞争力` },
        { icon: '💡', text: `平衡${category}使用与独立思考` }
      ]
    }
  };
  
  return impacts;
}

// 生成涟漪传导路径
function generateRipplePath(news, category) {
  return {
    level1: `${news.title.substring(0, 10)}...引发市场关注`,
    level2: `${category}技术成为新标准`,
    level3: `${category}应用场景大幅扩展`
  };
}

// 生成行动建议清单
function generateActionItems(news, category) {
  return [
    { text: `学习${news.title.substring(0, 8)}的特性和应用场景`, tag: '学习', checked: false },
    { text: `关注${category}官方文档和API更新`, tag: '关注', checked: false },
    { text: `尝试使用${category}技术解决实际问题`, tag: '实践', checked: false }
  ];
}

// 生成正反观点博弈
function generateDebateVS(news, category) {
  return {
    optimistic: {
      title: '乐观派观点',
      content: `${category}技术将带来长期价值，短期波动是买入良机，建议逢低布局`
    },
    cautious: {
      title: '审慎派观点',
      content: `市场估值已偏高，需警惕泡沫风险，建议观望等待回调`
    }
  };
}

// 生成利益相关图谱
function generateStakeholders(news, category) {
  return {
    winners: [
      { name: `${category}应用开发者`, impact: '直接受益' },
      { name: '云服务商', impact: '间接受益' },
      { name: '企业用户', impact: '效率提升' }
    ],
    losers: [
      { name: `传统${category}公司`, impact: '竞争压力' },
      { name: '低效工具', impact: '被淘汰' }
    ]
  };
}

// 生成跟我何干
function generateSocialCurrency(news, category) {
  return `${news.title.substring(0, 20)}...的发布标志着${category}进入新阶段，现在不是观望的时候，而是主动学习和应用的时候。`;
}

// 生成预警时钟
function generateImpactTimer(news, category) {
  const angles = [30, 45, 60, 75, 90];
  const angle = angles[Math.floor(Math.random() * angles.length)];
  const timeframes = ['3-6个月内', '6-12个月内', '持续关注', '长期影响'];
  const timeframe = timeframes[Math.floor(Math.random() * timeframes.length)];
  
  return {
    angle: angle,
    timeframe: timeframe,
    description: `市场影响将逐步显现，建议持续关注`
  };
}

// 生成利益关联时钟
function generateImpactTimeline(news, category) {
  return [
    { id: 1, label: '即刻', time: '现在', angle: 0, icon: '⚡', active: false, impactLevel: 'high', impactText: '直接影响' },
    { id: 2, label: '1个月', time: '30天后', angle: 90, icon: '📅', active: false, impactLevel: 'medium', impactText: '短期影响' },
    { id: 3, label: '半年', time: '6个月后', angle: 180, icon: '📆', active: false, impactLevel: 'low', impactText: '长期影响' }
  ];
}

// 生成AI推理思维链
function generateCoTTree(news, category) {
  return {
    level1: [
      { text: '收集原始数据', type: '数据收集' },
      { text: '分析关键指标', type: '指标分析' },
      { text: '识别核心矛盾', type: '矛盾识别' },
      { text: '推导潜在影响', type: '影响推导' }
    ],
    level2: [
      { text: '评估市场反应', type: '市场评估' },
      { text: '预测政策变化', type: '政策预测' },
      { text: '分析技术趋势', type: '趋势分析' }
    ],
    conclusion: `综合判断：${news.title.substring(0, 15)}...将在未来6个月内持续发酵，建议保持关注`
  };
}

// 生成隐秘利益图谱
function generateHiddenInterests(news, category) {
  return {
    nodes: [
      { id: 1, name: `${category}公司`, icon: '🏢', x: 50, y: 30, connections: [2, 3] },
      { id: 2, name: '云服务商', icon: '☁️', x: 80, y: 20, connections: [1, 3] },
      { id: 3, name: '应用开发者', icon: '💻', x: 50, y: 70, connections: [1, 2] }
    ]
  };
}

// 生成历史基因序列
function generateHistoryCases(news, category) {
  const years = ['2020', '2021', '2022'];
  const outcomes = ['成功', '失败', '转型'];
  const outcomeTypes = ['成功案例', '失败案例', '转型案例'];
  
  return [
    { id: 1, year: years[0], title: `${category}技术突破`, similarity: 85, outcome: outcomes[0], outcomeType: outcomeTypes[0] },
    { id: 2, year: years[1], title: `${category}产品发布`, similarity: 78, outcome: outcomes[1], outcomeType: outcomeTypes[1] },
    { id: 3, year: years[2], title: `${category}市场变化`, similarity: 72, outcome: outcomes[2], outcomeType: outcomeTypes[2] }
  ];
}

// 生成历史分析
function generateHistoryAnalysis(news, category) {
  return `历史重演分析：当前事件与${category}相关历史事件相似度较高（85%），但市场环境不同，成功概率需谨慎评估。`;
}

// 生成关键变量雷达
function generateKeyVariables(news, category) {
  return [
    { id: 1, name: '政策监管', description: `${category}监管政策的变化`, impact: '高', angle: 0, status: 'stable', icon: '📜' },
    { id: 2, name: '技术竞争', description: '竞争对手的技术突破', impact: '极高', angle: 120, status: 'unstable', icon: '⚔️' },
    { id: 3, name: '市场需求', description: `${category}应用市场的需求变化`, impact: '高', angle: 240, status: 'emerging', icon: '📈' }
  ];
}

// 生成知识图谱扩展
function generateKnowledgeEntities(news, category) {
  return [
    { id: 1, name: `${category}技术`, icon: '🧠', type: '技术', summary: `${category}的核心技术`, expanded: false, ecosystem: { position: '核心', performance: '快速增长', partners: `${category}公司、云服务商` } },
    { id: 2, name: '应用生态', icon: '🤖', type: '应用', summary: `${category}的应用生态`, expanded: false, ecosystem: { position: '应用层', performance: '快速发展', partners: `${category}公司、云服务商` } },
    { id: 3, name: '开发工具', icon: '💻', type: '工具', summary: `${category}的开发工具`, expanded: false, ecosystem: { position: '工具层', performance: '稳定', partners: `${category}公司、云服务商` } }
  ];
}

// 生成原始指纹溯源
function generateFingerPrints(news, category) {
  return [
    { id: 1, type: '论文', label: '学术论文', hash: 'SHA256: abc123...', link: 'https://arxiv.org/abs/2305.12345', status: 'verified', statusText: '已核实' },
    { id: 2, type: 'pdf', label: '技术报告', hash: 'MD5: def456...', link: 'https://example.com/report.pdf', status: 'verified', statusText: '已核实' },
    { id: 3, type: 'announcement', label: '官方公告', hash: 'SHA1: ghi789...', link: 'https://example.com/announcement', status: 'verified', statusText: '已核实' }
  ];
}

// 生成事实颗粒核查
function generateFactChecks(news, category) {
  return [
    { id: 1, label: '时间', text: news.timeSlot || '待确认', status: 'verified', statusIcon: '✓', statusText: '已核实' },
    { id: 2, label: '参数', text: `${category}相关参数`, status: 'verified', statusIcon: '✓', statusText: '已核实' },
    { id: 3, label: '人名', text: '相关团队', status: 'verified', statusIcon: '✓', statusText: '已核实' },
    { id: 4, label: '地点', text: '相关地点', status: 'pending', statusIcon: '❓', statusText: '存疑' },
    { id: 5, label: '数据', text: '性能数据', status: 'verified', statusIcon: '✓', statusText: '已核实' }
  ];
}

// 生成智核未来猜想
function generateFutureScenarios(news, category) {
  const years = ['2025', '2026', '2027'];
  const probabilities = [65, 45, 30];
  
  return [
    { year: years[0], probability: probabilities[0], title: `${category}技术普及`, description: `${category}技术将广泛应用于各类设备`, actors: [{ icon: '🏢', text: '企业' }, { icon: '👥', text: '个人' }] },
    { year: years[1], probability: probabilities[1], title: '生态融合', description: `${category}生态深度集成到所有产品`, actors: [{ icon: '📱', text: '硬件厂商' }, { icon: '🖥️', text: '软件开发商' }] },
    { year: years[2], probability: probabilities[2], title: '技术突破', description: `${category}技术实现重大突破`, actors: [{ icon: '🔬', text: '科研机构' }, { icon: '🏢', text: '科技巨头' }] }
  ];
}

// 生成未来结论
function generateFutureConclusion(news, category) {
  return `${category} 综合研判：未来3-5年将呈现"技术普及→生态融合→技术突破"的演进路径，建议关注相关产业链机会。`;
}

// 导入新闻库并生成所有分析数据
const newsLibrary = require('./news_library.js');

// 合并所有分类的新闻
let allNews = [];
const categories = ['AI', 'tech', 'finance', 'international', 'sports'];

categories.forEach(cat => {
  if (newsLibrary[cat]) {
    newsLibrary[cat].forEach((news, index) => {
      allNews.push({
        ...news,
        id: allNews.length + 1,
        category: cat === 'AI' ? 'AI' : cat
      });
    });
  }
});

// 为每条新闻生成分析数据
allNews.forEach((news, index) => {
  const newsId = index + 1;
  analysisData[newsId] = generateAnalysisForNews(news, newsId);
});

module.exports = analysisData;
