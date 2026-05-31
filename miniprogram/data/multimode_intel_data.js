/**
 * AI情报中心 - 2026年1月6日 多模态情报数据包
 * 支持标准模式、小白模式、脱水模式三种阅读体验
 */

const MULTIMODE_INTEL_DATA = {
  // 元数据
  meta: {
    date: '2026-01-06',
    version: '2.0',
    totalCount: 5
  },

  // 情报列表 - 每条包含三种模式的内容
  news: [
    {
      id: 'intel-001',
      title: 'OpenAI 正式发布 GPT-5：推理能力提升 300%',
      tags: ['GPT-5', 'OpenAI', '大语言模型', 'AI突破'],
      category: 'AI',
      categoryColor: '#A855F7',
      icon: '🤖',
      
      // 标准模式 - 完整7要素
      standard: {
        summary: 'OpenAI 于北京时间 1 月 6 日凌晨发布 GPT-5 大语言模型，在数学推理、代码生成、多模态理解三大维度实现质的飞跃。新模型支持 100 万 token 超长上下文，可处理整本书籍或完整代码库。API 定价较 GPT-4 Turbo 下降 40%。',
        source: 'OpenAI 官方博客、TechCrunch、The Verge',
        time: '2026-01-06 02:30 (北京时间)',
        ai_analysis: '这是 AI 发展史上的里程碑事件。GPT-5 的推理能力已接近人类专家水平，100 万 token 上下文意味着 AI 可以理解和处理前所未有的复杂任务。预计将引发新一轮 AI 应用创新浪潮，企业级 AI Agent 产品将在 3-6 个月内大规模涌现。',
        prediction: '预计 GPT-5 将在 Q1 推出 Turbo 版本，API 成本进一步下降 30%。企业级 AI Agent 产品将在 6 个月内大规模涌现，首个 DAU 过亿的 AI Agent 应用可能在 Q2 出现。',
        related: ['Anthropic Claude 4 同步升级', 'Google Gemini 2.0 发布', '微软 Copilot 集成 GPT-5'],
        timeline: [
          { date: '2022/11', event: 'ChatGPT 发布，AI 热潮开启' },
          { date: '2023/03', event: 'GPT-4 发布，多模态能力' },
          { date: '2024/05', event: 'GPT-4o 发布，实时语音' },
          { date: '2026/01', event: 'GPT-5 发布，推理能力质变' }
        ]
      },
      
      // 小白模式 - 通俗易懂
      newbie: {
        simple_summary: '想象一下，你有一个超级聪明的助手，以前它只能帮你写写邮件、回答简单问题。现在升级后，它变得像一个博士生一样聪明，能帮你分析整本书、写复杂的程序代码，而且收费还便宜了将近一半！这就是 GPT-5 带来的变化。',
        jargon_tips: [
          { term: 'Token', explain: '可以理解为"字数"，100万token大约等于75万个汉字，相当于3本《三国演义》' },
          { term: '多模态', explain: '就是AI不仅能看文字，还能看图片、听声音，像人一样用多种感官理解世界' },
          { term: 'API', explain: '程序员用来调用AI能力的"接口"，就像插座让你能用电一样' },
          { term: '推理能力', explain: 'AI的"思考能力"，能像人一样一步步分析问题、得出结论' }
        ]
      },
      
      // 脱水模式 - 极致精简
      dehydrated: 'GPT-5发布，AI思考力提升3倍',
      
      // 情绪指数和信号标记
      sentiment: 85,
      is_signal: true,
      sourceReliability: 'high',
      
      // 涟漪效应
      rippleEffects: [
        { industry: 'AI应用开发', impact: '开发效率提升50%，成本降低40%' },
        { industry: '教育行业', impact: '个性化教学成为可能，传统教育模式受冲击' },
        { industry: '内容创作', impact: 'AI生成内容质量提升，版权争议加剧' },
        { industry: '企业服务', impact: 'AI Agent产品爆发，客服、营销自动化' }
      ],
      
      // 正反观点
      debate: {
        pro: {
          title: '支持观点',
          weight: 75,
          points: [
            'AI能力大幅提升，将推动生产力革命',
            'API成本下降，让更多企业能用得起AI',
            '长上下文支持，可处理更复杂的任务'
          ]
        },
        con: {
          title: '担忧观点',
          weight: 25,
          points: [
            'AI可能取代更多工作岗位，失业风险增加',
            '数据隐私和安全问题更加突出',
            'AI幻觉问题仍需解决，可靠性待验证'
          ]
        },
        verdict: 'GPT-5的技术突破不可否认，但需要在推动创新和防范风险之间找到平衡。建议积极拥抱AI提升效率，同时关注AI伦理和监管政策。'
      }
    },
    
    {
      id: 'intel-002',
      title: 'Claude 4 代码能力超越人类程序员，准确率达 96%',
      tags: ['Claude', 'Anthropic', '代码生成', 'AI安全'],
      category: '科技',
      categoryColor: '#06B6D4',
      icon: '💻',
      
      standard: {
        summary: 'Anthropic 发布 Claude 4 大模型，在 HumanEval 代码基准测试中达到 96.2% 准确率，首次超越人类专业程序员平均水平。新模型支持 200K 上下文，并引入"宪法 AI 2.0"安全框架。',
        source: 'TechCrunch、Anthropic 官方博客',
        time: '2026-01-05 18:00',
        ai_analysis: 'Claude 4 在代码领域的突破意义重大。96% 的准确率意味着 AI 已可独立完成大部分编程任务，软件开发行业将迎来效率革命。建议关注：AI 编程助手、低代码平台、软件外包行业转型。',
        prediction: '预计 2026 年底，50% 以上的代码将由 AI 辅助生成。程序员角色将从"写代码"转向"审代码"和"设计架构"。',
        related: ['GitHub Copilot X 升级', 'Cursor AI 融资 4 亿美元'],
        timeline: [
          { date: '2023/03', event: 'Claude 1.0 发布' },
          { date: '2024/03', event: 'Claude 3 发布，超越 GPT-4' },
          { date: '2026/01', event: 'Claude 4 发布，代码能力质变' }
        ]
      },
      
      newbie: {
        simple_summary: '以前程序员写代码要一行一行敲，现在有了 Claude 4，你只需要告诉它"我想做一个购物网站"，它就能自动帮你写出来，而且写得比大多数程序员还好！这意味着以后做软件会变得更快更便宜。',
        jargon_tips: [
          { term: 'HumanEval', explain: '一个测试AI写代码能力的"考试"，满分100分，人类程序员平均约90分' },
          { term: '上下文', explain: 'AI能"记住"的内容长度，200K相当于能记住一整本小说的内容' },
          { term: '宪法AI', explain: 'Anthropic发明的安全技术，让AI学会自我约束，不做坏事' }
        ]
      },
      
      dehydrated: 'AI写代码超越人类，准确率96%',
      sentiment: 78,
      is_signal: true,
      sourceReliability: 'high',
      
      rippleEffects: [
        { industry: '软件开发', impact: '编程效率提升5-10倍，开发周期缩短' },
        { industry: 'IT培训', impact: '编程教育需求下降，转向AI辅助编程' },
        { industry: '软件外包', impact: '低端外包业务萎缩，向高端咨询转型' },
        { industry: '低代码平台', impact: 'AI+低代码平台崛起，非程序员也能开发应用' }
      ],
      
      debate: {
        pro: {
          title: '支持观点',
          weight: 70,
          points: [
            '大幅提升开发效率，降低软件开发成本',
            '让更多人能够参与软件开发，降低门槛',
            'AI辅助编程可以减少人为错误'
          ]
        },
        con: {
          title: '担忧观点',
          weight: 30,
          points: [
            '程序员可能失业，就业市场受冲击',
            'AI生成的代码可能存在安全隐患',
            '过度依赖AI可能降低人类编程能力'
          ]
        },
        verdict: 'Claude 4的代码能力突破是技术进步的体现，但程序员的角色将从"写代码"转向"设计架构"和"审代码"。建议程序员积极学习AI工具，提升核心竞争力。'
      }
    },

    {
      id: 'intel-003',
      title: '华为 Mate 70 销量破千万，端侧 AI 成最大卖点',
      tags: ['华为', 'Mate70', '端侧AI', '麒麟芯片'],
      category: '手机',
      categoryColor: '#EF4444',
      icon: '📱',
      
      standard: {
        summary: '华为官方宣布 Mate 70 系列上市 6 周全球销量突破 1000 万台，创华为手机历史最快纪录。搭载麒麟 9100 芯片的端侧盘古大模型成为用户最认可的功能，本地 AI 助手日均调用超 50 次。',
        source: '华为消费者业务、第一财经',
        time: '2026-01-06 10:00',
        ai_analysis: '华为的成功验证了端侧 AI 的市场需求。用户对隐私保护和离线 AI 能力的重视超出预期。这将倒逼苹果、三星加速端侧 AI 布局，2026 年将成为"端侧 AI 手机元年"。',
        prediction: '预计华为 2026 年手机出货量将突破 8000 万台，端侧 AI 将成为国产手机标配功能。苹果 iPhone 17 预计也将大幅强化端侧 AI 能力。',
        related: ['苹果 iPhone 17 曝光', '三星 Galaxy S26 预热'],
        timeline: [
          { date: '2023/08', event: 'Mate 60 回归，麒麟芯片重生' },
          { date: '2024/11', event: 'Mate 70 发布，端侧 AI 首发' },
          { date: '2026/01', event: '销量破千万，市场验证成功' }
        ]
      },
      
      newbie: {
        simple_summary: '华为新手机卖爆了！6周卖了1000万台，创下历史纪录。最受欢迎的功能是手机里内置的AI助手——不用联网就能用，你的聊天记录、照片都不会上传到云端，隐私特别安全。每个用户平均每天用50多次！',
        jargon_tips: [
          { term: '端侧AI', explain: 'AI直接在手机里运行，不需要联网，速度快、隐私好，就像请了个住家助理' },
          { term: '麒麟芯片', explain: '华为自己研发的手机"大脑"，被美国制裁后一度中断，现在重新回归' },
          { term: '盘古大模型', explain: '华为自己训练的AI，类似于ChatGPT，但可以在手机上离线运行' }
        ]
      },
      
      dehydrated: '华为Mate70六周破千万，端侧AI爆火',
      sentiment: 82,
      is_signal: true,
      sourceReliability: 'high',
      
      rippleEffects: [
        { industry: '手机芯片', impact: '国产芯片需求激增，供应链受益' },
        { industry: 'AI应用', impact: '端侧AI应用开发加速，隐私保护成卖点' },
        { industry: '手机制造', impact: '国产手机品牌竞争力提升，市场份额扩大' },
        { industry: '云服务', impact: '端云协同成为趋势，混合云方案受关注' }
      ],
      
      debate: {
        pro: {
          title: '支持观点',
          weight: 80,
          points: [
            '端侧AI保护隐私，数据不上传更安全',
            '离线使用，不依赖网络，体验更好',
            '华为突破技术封锁，国产化意义重大'
          ]
        },
        con: {
          title: '担忧观点',
          weight: 20,
          points: [
            '端侧AI算力有限，能力不如云端',
            '手机成本增加，价格可能上涨',
            '生态建设仍需时间，应用数量有限'
          ]
        },
        verdict: '华为Mate70的成功证明了端侧AI的市场需求。虽然目前算力有限，但随着芯片技术进步，端侧AI将成为手机标配。建议关注国产芯片产业链和端侧AI应用开发。'
      }
    },
    
    {
      id: 'intel-004',
      title: '美联储降息 25 基点，全球宽松周期开启',
      tags: ['美联储', '降息', '货币政策', '宏观经济'],
      category: '财经',
      categoryColor: '#F59E0B',
      icon: '💰',
      
      standard: {
        summary: '美联储 1 月 FOMC 会议决定将联邦基金利率下调 25 个基点至 4.25%-4.50%，符合市场预期。鲍威尔表示通胀已得到有效控制，2026 年预计还将降息 3-4 次。',
        source: '美联储官网、Bloomberg、华尔街日报',
        time: '2026-01-06 03:00',
        ai_analysis: '降息周期正式开启，全球流动性拐点确认。历史数据显示，降息初期风险资产通常表现良好，但需警惕"买预期卖事实"的短期回调。建议：逢低布局科技、新能源板块，控制仓位在 7 成以内。',
        prediction: '预计 2026 年美联储将降息 3-4 次，全年降息幅度约 100 个基点。欧央行、日央行预计跟进，全球进入同步宽松周期。',
        related: ['A股沪指突破 3500 点', '比特币突破 12 万美元', '欧央行暗示跟进降息'],
        timeline: [
          { date: '2022/03', event: '美联储开启加息周期' },
          { date: '2023/07', event: '利率升至 5.5% 峰值' },
          { date: '2024/09', event: '首次降息 50 基点' },
          { date: '2026/01', event: '降息周期延续' }
        ]
      },
      
      newbie: {
        simple_summary: '美国的"央行"（美联储）决定降低利率了。这意味着什么？简单说：借钱变便宜了！企业更愿意投资，老百姓更愿意消费，股市、房市通常会涨。但也要小心，涨太快可能会有泡沫。',
        jargon_tips: [
          { term: '基点', explain: '利率的计量单位，1个基点=0.01%，25个基点就是0.25%' },
          { term: 'FOMC', explain: '美联储的"决策会议"，每年开8次，决定美国的利率政策' },
          { term: '流动性', explain: '市场上"钱多不多"，降息会让市场上的钱变多，资产价格容易涨' },
          { term: '风险资产', explain: '股票、比特币这类价格波动大的投资品，和"安全资产"（如国债）相对' }
        ]
      },
      
      dehydrated: '美联储降息，借钱变便宜，股市利好',
      sentiment: 72,
      is_signal: true,
      sourceReliability: 'high',
      
      rippleEffects: [
        { industry: '股市', impact: '流动性增加，风险资产上涨' },
        { industry: '房地产', impact: '房贷利率下降，购房成本降低' },
        { industry: '债券市场', impact: '债券收益率下降，价格上升' },
        { industry: '新兴市场', impact: '美元走弱，新兴市场货币升值' }
      ],
      
      debate: {
        pro: {
          title: '支持观点',
          weight: 65,
          points: [
            '降息刺激经济，降低企业融资成本',
            '消费者借贷成本下降，促进消费',
            '股市、房市等资产价格上涨，财富效应显现'
          ]
        },
        con: {
          title: '担忧观点',
          weight: 35,
          points: [
            '降息可能引发通胀反弹',
            '资产价格泡沫风险增加',
            '美元走弱可能影响国际地位'
          ]
        },
        verdict: '美联储降息是经济软着陆的必要手段，但需要警惕资产泡沫和通胀反弹。建议投资者保持理性，不要盲目追高，关注基本面良好的优质资产。'
      }
    },
    
    {
      id: 'intel-005',
      title: '比特币突破 12 万美元创历史新高',
      tags: ['比特币', 'ETF', '加密货币', '机构投资'],
      category: '加密',
      categoryColor: '#F97316',
      icon: '₿',
      
      standard: {
        summary: '比特币价格突破 12 万美元，创历史新高。贝莱德比特币 ETF 单日净流入超 8 亿美元，机构持仓占比升至 28%。分析师预计 2026 年比特币有望挑战 15 万美元。',
        source: 'CoinDesk、Bloomberg、贝莱德官网',
        time: '2026-01-05 22:00',
        ai_analysis: '比特币 ETF 的成功彻底改变了加密货币的投资格局。机构资金的持续流入为价格提供了坚实支撑，但当前估值已处于历史高位，短期波动风险加大。建议：已持仓者可持有，新进场者等待回调。',
        prediction: '预计比特币 2026 年有望挑战 15 万美元，但波动性将加大。以太坊 ETF 获批后可能带来新一轮上涨。建议控制仓位，分批建仓。',
        related: ['以太坊 ETF 获批在即', 'MicroStrategy 增持比特币'],
        timeline: [
          { date: '2024/01', event: '比特币 ETF 获批' },
          { date: '2024/03', event: '突破 7 万美元' },
          { date: '2024/12', event: '突破 10 万美元' },
          { date: '2026/01', event: '突破 12 万美元新高' }
        ]
      },
      
      newbie: {
        simple_summary: '比特币又创新高了，一枚值12万美元（约87万人民币）！为什么涨这么猛？因为华尔街的大机构现在可以通过"基金"的方式买比特币了，大量资金涌入。但要注意：涨得快也可能跌得快，普通人投资要谨慎。',
        jargon_tips: [
          { term: 'ETF', explain: '一种可以在股票市场买卖的基金，比特币ETF让普通人可以像买股票一样买比特币' },
          { term: '机构持仓', explain: '大公司、基金持有的比例，机构越多说明"正规军"越认可' },
          { term: '贝莱德', explain: '全球最大的资产管理公司，管理超过10万亿美元，它入场说明主流金融认可了比特币' }
        ]
      },
      
      dehydrated: '比特币破12万美元，机构疯狂买入',
      sentiment: 68,
      is_signal: false,
      sourceReliability: 'medium',
      
      rippleEffects: [
        { industry: '传统金融', impact: '加密货币ETF推动传统金融机构入场' },
        { industry: '支付行业', impact: '加密支付逐渐普及，跨境支付成本降低' },
        { industry: '能源行业', impact: '挖矿需求增加，清洁能源需求上升' },
        { industry: '监管机构', impact: '加密货币监管框架加速完善' }
      ],
      
      debate: {
        pro: {
          title: '支持观点',
          weight: 60,
          points: [
            '比特币ETF获批，机构资金持续流入',
            '比特币作为数字黄金，抗通胀属性凸显',
            '区块链技术具有革命性，长期看好'
          ]
        },
        con: {
          title: '担忧观点',
          weight: 40,
          points: [
            '比特币价格波动极大，投资风险高',
            '监管政策不确定性大，可能面临打压',
            '缺乏内在价值，泡沫风险存在'
          ]
        },
        verdict: '比特币突破12万美元反映了机构资金的认可，但当前估值已处于历史高位，短期波动风险加大。建议已持仓者可持有，新进场者等待回调，控制仓位。'
      }
    }
  ],

  // 24小时情报密度数据
  density_data: [2, 1, 1, 2, 3, 4, 8, 12, 15, 18, 16, 14, 10, 13, 19, 22, 18, 15, 12, 14, 16, 13, 8, 5]
};

module.exports = MULTIMODE_INTEL_DATA;
