/**
 * 示例新闻数据（用于后端不可达时的优雅降级）
 *
 * 数据结构与 normalizeNews 兼容：
 *   id / title / summary / content / source / published_at /
 *   category / importance / impactScore / tags
 */

var MOCK_NEWS = [
  {
    id: 'demo-1',
    title: 'DeepSeek 开源全新推理模型，中文基准刷新榜单',
    summary: 'DeepSeek 发布新版开源大模型，在多项中文与代码基准中超过 Llama 家族，社区关注其可商用许可与推理成本。',
    content: 'DeepSeek 近期发布了新版开源大模型，在中文理解、代码生成与长文本推理方面刷新多项公开基准。社区对其可商用许可与较低推理成本给予积极评价。与此同时，多家云厂商宣布支持其推理 API，降低了中小企业接入的门槛。',
    source: '点透 News · 示例',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    category: 'tech',
    importance: 85,
    impactScore: 9,
    tags: ['DeepSeek', '大模型', '开源']
  },
  {
    id: 'demo-2',
    title: '央行再度下调 LPR，小微企业贷款利率进入新低',
    summary: '央行宣布 1 年期 LPR 下调 10bp，5 年期以上下调 25bp；分析认为将进一步降低融资成本，利好科技与制造业投资。',
    content: '央行最新公布贷款市场报价利率（LPR）下调：1 年期下调 10bp，5 年期以上下调 25bp。多位分析师认为此举旨在降低实体融资成本，引导长期利率下行，对制造业与中小科技企业融资环境具有正面作用。',
    source: '点透 News · 示例',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    category: 'finance',
    importance: 78,
    impactScore: 8,
    tags: ['LPR', '货币政策', '小微企业']
  },
  {
    id: 'demo-3',
    title: '欧盟《AI 法案》正式实施，分级监管框架落地',
    summary: '欧盟 AI 法案完成立法进程，将按风险等级对 AI 系统实施分级监管，对通用模型增加透明度与安全测试要求。',
    content: '欧盟《AI 法案》正式进入实施阶段。法案将 AI 系统按风险分为 4 档：不可接受风险、高风险、中风险、低/无风险。高风险系统须在欧盟数据库登记并通过符合性评估；通用大模型须披露训练数据摘要与安全测试结果。',
    source: '点透 News · 示例',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    category: 'international',
    importance: 74,
    impactScore: 8,
    tags: ['欧盟', 'AI 法案', '监管']
  },
  {
    id: 'demo-4',
    title: '头部国产厂商联合发布新一代 AI 芯片，训练能效提升显著',
    summary: '多家国产芯片厂商联合披露下一代通用 AI 加速器，训练能效对比上一代提升 40%，兼容主流训练框架。',
    content: '多家国产芯片厂商联合披露新一代通用 AI 加速器，在 7B、70B 规模模型训练中，能效对比上一代产品提升约 40%，并支持主流训练框架与数据类型。业内人士认为其将缓解大模型训练成本压力，并为国产化替代提供更多选项。',
    source: '点透 News · 示例',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    category: 'tech',
    importance: 80,
    impactScore: 8,
    tags: ['芯片', '国产', '训练']
  },
  {
    id: 'demo-5',
    title: '世界杯小组赛爆冷：传统强队首战告负',
    summary: '在最新一轮世界杯小组赛中，一支传统强队首战爆冷落败，赛后主教练在发布会上对战术安排表达反思。',
    content: '世界杯小组赛爆出冷门：一支传统强队在首轮比赛中以一球之差落败。赛后，主教练在发布会上对球队的节奏控制与边路防守表达反思，承诺将在后续比赛中调整首发与战术体系。',
    source: '点透 News · 示例',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    category: 'sports',
    importance: 60,
    impactScore: 5,
    tags: ['世界杯', '爆冷']
  },
  {
    id: 'demo-6',
    title: '半导体行业协会：2025 全球资本支出增速放缓',
    summary: '行业协会最新报告显示，2025 年全球半导体资本支出增速较此前预期下调，主要受终端需求恢复节奏不确定影响。',
    content: '半导体行业协会最新发布报告，下调 2025 年全球半导体资本支出增速。报告指出，终端消费电子与服务器需求恢复节奏不确定，是主要原因；车用与工业芯片投资则保持相对稳健。',
    source: '点透 News · 示例',
    published_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    category: 'finance',
    importance: 70,
    impactScore: 7,
    tags: ['半导体', '资本支出']
  }
]

export { MOCK_NEWS }
export default MOCK_NEWS
