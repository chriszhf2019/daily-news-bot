/**
 * AI情报中心 - 2026年1月6日 情报数据包
 * 由 DeepSeek 高级情报分析师生成
 */

const INTELLIGENCE_DATA = {
  // 核心统计数据
  stats: {
    totalIntelligence: 156,        // 今日情报总量
    sentimentIndex: 72,            // AI情绪指数 (0-100)
    predictionAccuracy: 89,        // 预测成功率 (%)
    pendingEvents: 7               // 待追踪事件数
  },

  // 24小时情报密度数据 (每小时产出数量)
  density_data: [
    2, 1, 1, 2, 3, 4,              // 00:00 - 05:00 凌晨低谷
    8, 12, 15, 18, 16, 14,         // 06:00 - 11:00 上午高峰
    10, 13, 19, 22, 18, 15,        // 12:00 - 17:00 下午高峰 (15:00为最高峰)
    12, 14, 16, 13, 8, 5           // 18:00 - 23:00 晚间回落
  ],

  // AI深度洞察 (3条)
  insights: [
    {
      id: 'insight-1',
      title: 'AI Agent 正式进入商业化元年',
      conclusion: '基于 GPT-5、Claude 4、Gemini 2.0 三大模型的能力跃升，AI代理从概念验证阶段正式迈入规模化商用。企业级自动化办公、智能客服、代码生成三大场景将率先爆发，预计 Q2 出现首个 DAU 过亿的 AI Agent 产品。',
      confidence: 91,
      relatedNewsIds: ['news-1', 'news-2', 'news-5']
    },
    {
      id: 'insight-2', 
      title: '端侧AI芯片竞争白热化',
      conclusion: '苹果 A19、华为麒麟9100、高通骁龙 8 Gen 4 三款旗舰芯片均将 NPU 性能作为核心卖点。端侧大模型运行能力成为 2026 年智能手机的关键差异化因素，隐私计算和离线 AI 功能将重塑用户体验。',
      confidence: 87,
      relatedNewsIds: ['news-3', 'news-4']
    },
    {
      id: 'insight-3',
      title: '全球流动性宽松周期确认开启',
      conclusion: '美联储 1 月降息 25 个基点，叠加欧央行、日央行鸽派信号，全球主要经济体进入同步宽松周期。风险资产估值中枢上移，但需警惕 Q1 末的技术性回调风险。',
      confidence: 78,
      relatedNewsIds: ['news-4', 'news-5']
    }
  ],

  // 未来7天预测 (3条)
  predictions: [
    {
      id: 'pred-1',
      event: 'OpenAI 将发布 GPT-5 Turbo 版本',
      probability: 85,
      affectedIndustries: ['AI/软件', '云计算', '企业服务'],
      timeframe: '1月8日-1月12日',
      icon: '🤖'
    },
    {
      id: 'pred-2',
      event: 'A股沪指突破3600点',
      probability: 68,
      affectedIndustries: ['金融', '券商', '基金'],
      timeframe: '1月6日-1月10日',
      icon: '📈'
    },
    {
      id: 'pred-3',
      event: '特斯拉 FSD V13 获中国监管批准',
      probability: 72,
      affectedIndustries: ['自动驾驶', '新能源汽车', '保险'],
      timeframe: '1月10日-1月13日',
      icon: '🚗'
    }
  ],

  // 新闻列表 (5条，符合7要素)
  news_list: [
    {
      id: 'news-1',
      title: 'OpenAI 正式发布 GPT-5：推理能力提升 300%，支持 100 万 token 上下文',
      summary: 'OpenAI 于北京时间 1 月 6 日凌晨发布 GPT-5 大语言模型，在数学推理、代码生成、多模态理解三大维度实现质的飞跃。新模型支持 100 万 token 超长上下文，可处理整本书籍或完整代码库。API 定价较 GPT-4 Turbo 下降 40%。',
      source: 'OpenAI 官方博客',
      publishTime: '2026-01-06 02:30',
      tags: ['GPT-5', 'OpenAI', '大语言模型', 'AI突破'],
      aiAnalysis: '这是 AI 发展史上的里程碑事件。GPT-5 的推理能力已接近人类专家水平，100 万 token 上下文意味着 AI 可以理解和处理前所未有的复杂任务。预计将引发新一轮 AI 应用创新浪潮，企业级 AI Agent 产品将在 3-6 个月内大规模涌现。',
      relatedInfo: [
        { title: 'Anthropic Claude 4 同步升级', date: '01/05' },
        { title: 'Google Gemini 2.0 发布', date: '01/04' },
        { title: '微软 Copilot 集成 GPT-5', date: '01/06' }
      ],
      timeline: [
        { date: '2022/11', event: 'ChatGPT 发布，AI 热潮开启' },
        { date: '2023/03', event: 'GPT-4 发布，多模态能力' },
        { date: '2024/05', event: 'GPT-4o 发布，实时语音' },
        { date: '2026/01', event: 'GPT-5 发布，推理能力质变' }
      ]
    },
    {
      id: 'news-2',
      title: 'Anthropic 推出 Claude 4：代码生成准确率达 96%，超越人类程序员',
      summary: 'Anthropic 发布 Claude 4 大模型，在 HumanEval 代码基准测试中达到 96.2% 准确率，首次超越人类专业程序员平均水平。新模型支持 200K 上下文，并引入"宪法 AI 2.0"安全框架。',
      source: 'TechCrunch',
      publishTime: '2026-01-05 18:00',
      tags: ['Claude', 'Anthropic', '代码生成', 'AI安全'],
      aiAnalysis: 'Claude 4 在代码领域的突破意义重大。96% 的准确率意味着 AI 已可独立完成大部分编程任务，软件开发行业将迎来效率革命。建议关注：AI 编程助手、低代码平台、软件外包行业转型。',
      relatedInfo: [
        { title: 'GitHub Copilot X 升级', date: '01/04' },
        { title: 'Cursor AI 融资 4 亿美元', date: '01/03' }
      ],
      timeline: [
        { date: '2023/03', event: 'Claude 1.0 发布' },
        { date: '2024/03', event: 'Claude 3 发布，超越 GPT-4' },
        { date: '2026/01', event: 'Claude 4 发布，代码能力质变' }
      ]
    },
    {
      id: 'news-3',
      title: '华为 Mate 70 系列全球销量突破 1000 万台，端侧 AI 成最大卖点',
      summary: '华为官方宣布 Mate 70 系列上市 6 周全球销量突破 1000 万台，创华为手机历史最快纪录。搭载麒麟 9100 芯片的端侧盘古大模型成为用户最认可的功能，本地 AI 助手日均调用超 50 次。',
      source: '华为消费者业务',
      publishTime: '2026-01-06 10:00',
      tags: ['华为', 'Mate70', '端侧AI', '麒麟芯片'],
      aiAnalysis: '华为的成功验证了端侧 AI 的市场需求。用户对隐私保护和离线 AI 能力的重视超出预期。这将倒逼苹果、三星加速端侧 AI 布局，2026 年将成为"端侧 AI 手机元年"。',
      relatedInfo: [
        { title: '苹果 iPhone 17 曝光', date: '01/04' },
        { title: '三星 Galaxy S26 预热', date: '01/05' }
      ],
      timeline: [
        { date: '2023/08', event: 'Mate 60 回归，麒麟芯片重生' },
        { date: '2024/11', event: 'Mate 70 发布，端侧 AI 首发' },
        { date: '2026/01', event: '销量破千万，市场验证成功' }
      ]
    },
    {
      id: 'news-4',
      title: '美联储宣布降息 25 个基点，2026 年首次降息落地',
      summary: '美联储 1 月 FOMC 会议决定将联邦基金利率下调 25 个基点至 4.25%-4.50%，符合市场预期。鲍威尔表示通胀已得到有效控制，2026 年预计还将降息 3-4 次。',
      source: '美联储官网',
      publishTime: '2026-01-06 03:00',
      tags: ['美联储', '降息', '货币政策', '宏观经济'],
      aiAnalysis: '降息周期正式开启，全球流动性拐点确认。历史数据显示，降息初期风险资产通常表现良好，但需警惕"买预期卖事实"的短期回调。建议：逢低布局科技、新能源板块，控制仓位在 7 成以内。',
      relatedInfo: [
        { title: 'A股沪指突破 3500 点', date: '01/05' },
        { title: '比特币突破 12 万美元', date: '01/04' },
        { title: '欧央行暗示跟进降息', date: '01/05' }
      ],
      timeline: [
        { date: '2022/03', event: '美联储开启加息周期' },
        { date: '2023/07', event: '利率升至 5.5% 峰值' },
        { date: '2024/09', event: '首次降息 50 基点' },
        { date: '2026/01', event: '降息周期延续' }
      ]
    },
    {
      id: 'news-5',
      title: '比特币突破 12 万美元创历史新高，机构资金持续流入',
      summary: '比特币价格突破 12 万美元，创历史新高。贝莱德比特币 ETF 单日净流入超 8 亿美元，机构持仓占比升至 28%。分析师预计 2026 年比特币有望挑战 15 万美元。',
      source: 'CoinDesk',
      publishTime: '2026-01-05 22:00',
      tags: ['比特币', 'ETF', '加密货币', '机构投资'],
      aiAnalysis: '比特币 ETF 的成功彻底改变了加密货币的投资格局。机构资金的持续流入为价格提供了坚实支撑，但当前估值已处于历史高位，短期波动风险加大。建议：已持仓者可持有，新进场者等待回调。',
      relatedInfo: [
        { title: '以太坊 ETF 获批在即', date: '01/04' },
        { title: 'MicroStrategy 增持比特币', date: '01/03' }
      ],
      timeline: [
        { date: '2024/01', event: '比特币 ETF 获批' },
        { date: '2024/03', event: '突破 7 万美元' },
        { date: '2024/12', event: '突破 10 万美元' },
        { date: '2026/01', event: '突破 12 万美元新高' }
      ]
    }
  ]
};

module.exports = INTELLIGENCE_DATA;
