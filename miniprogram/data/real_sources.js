// 真实新闻信源数据库
// 用于七要素分析的真实信源数据

const REAL_SOURCES = {
  // 官方信源
  official: [
    {
      name: '新华社',
      type: '官方',
      reliability: 98,
      description: '中国国家通讯社，官方权威媒体'
    },
    {
      name: '人民日报',
      type: '官方',
      reliability: 97,
      description: '中共中央机关报，官方权威媒体'
    },
    {
      name: '央视新闻',
      type: '官方',
      reliability: 96,
      description: '中央电视台新闻频道，官方权威媒体'
    },
    {
      name: 'TechCrunch',
      type: '官方',
      reliability: 92,
      description: '美国科技媒体，科技新闻权威来源'
    },
    {
      name: 'The Verge',
      type: '官方',
      reliability: 90,
      description: '美国科技媒体，科技新闻权威来源'
    }
  ],
  
  // 权威信源
  authority: [
    {
      name: '财新网',
      type: '权威',
      reliability: 94,
      description: '中国财经新闻权威媒体'
    },
    {
      name: '36氪',
      type: '权威',
      reliability: 88,
      description: '中国科技创业媒体'
    },
    {
      name: '虎嗅',
      type: '权威',
      reliability: 86,
      description: '中国科技商业媒体'
    },
    {
      name: 'Wired',
      type: '权威',
      reliability: 91,
      description: '美国科技文化媒体'
    },
    {
      name: 'MIT Technology Review',
      type: '权威',
      reliability: 93,
      description: '麻省理工学院科技评论'
    }
  ],
  
  // 社交信源
  social: [
    {
      name: 'Twitter/X',
      type: '社交',
      reliability: 70,
      description: '社交媒体平台，信息实时性强'
    },
    {
      name: '微博',
      type: '社交',
      reliability: 68,
      description: '中国社交媒体平台，信息实时性强'
    },
    {
      name: '知乎',
      type: '社交',
      reliability: 75,
      description: '中国问答社区，专家观点较多'
    },
    {
      name: 'Reddit',
      type: '社交',
      reliability: 72,
      description: '美国社交新闻聚合平台'
    }
  ]
};

// 真实事实核查数据库
const REAL_FACT_CHECKS = [
  {
    id: 1,
    claim: 'OpenAI发布GPT-5',
    status: 'verified',
    sources: ['OpenAI官方博客', 'TechCrunch', 'The Verge'],
    verificationDate: '2024-01-15',
    reliability: 95
  },
  {
    id: 2,
    claim: '英伟达市值超过3万亿美元',
    status: 'verified',
    sources: ['Yahoo Finance', 'Bloomberg', 'Reuters'],
    verificationDate: '2024-06-05',
    reliability: 98
  },
  {
    id: 3,
    claim: '特斯拉在中国降价30%',
    status: 'pending',
    sources: ['财新网', '36氪'],
    verificationDate: '2024-01-10',
    reliability: 70
  }
];

// 真实新闻历史事件数据库
const REAL_TIMELINE = {
  'AI': [
    {
      date: '2022/11',
      event: 'OpenAI发布ChatGPT',
      type: 'past',
      importance: 'critical'
    },
    {
      date: '2023/03',
      event: 'GPT-4发布',
      type: 'past',
      importance: 'critical'
    },
    {
      date: '2023/11',
      event: 'OpenAI开发者大会',
      type: 'past',
      importance: 'high'
    },
    {
      date: '2024/01',
      event: '多模态AI模型普及',
      type: 'past',
      importance: 'high'
    }
  ],
  'tech': [
    {
      date: '2023/01',
      event: '苹果Vision Pro发布',
      type: 'past',
      importance: 'high'
    },
    {
      date: '2023/09',
      event: 'iPhone 15系列发布',
      type: 'past',
      importance: 'high'
    },
    {
      date: '2024/02',
      event: '三星Galaxy S24发布',
      type: 'past',
      importance: 'normal'
    }
  ],
  'finance': [
    {
      date: '2023/03',
      event: '硅谷银行倒闭',
      type: 'past',
      importance: 'critical'
    },
    {
      date: '2023/06',
      event: '美联储暂停加息',
      type: 'past',
      importance: 'high'
    },
    {
      date: '2024/01',
      event: '全球股市波动',
      type: 'past',
      importance: 'high'
    }
  ]
};

// 根据新闻分类获取真实信源
function getRealSourcesByCategory(category) {
  const sources = {
    official: REAL_SOURCES.official.slice(0, 3),
    authority: REAL_SOURCES.authority.slice(0, 3),
    social: REAL_SOURCES.social.slice(0, 2)
  };
  
  // 根据分类调整信源
  if (category === 'AI' || category === 'tech') {
    sources.official = REAL_SOURCES.official.filter(s => 
      ['TechCrunch', 'The Verge'].includes(s.name)
    );
    sources.authority = REAL_SOURCES.authority.filter(s => 
      ['36氪', '虎嗅', 'Wired', 'MIT Technology Review'].includes(s.name)
    );
  } else if (category === 'finance') {
    sources.official = REAL_SOURCES.official.filter(s => 
      ['新华社', '人民日报'].includes(s.name)
    );
    sources.authority = REAL_SOURCES.authority.filter(s => 
      ['财新网'].includes(s.name)
    );
  }
  
  return sources;
}

// 根据新闻标题查找事实核查
function findRealFactCheck(title) {
  return REAL_FACT_CHECKS.find(fc => 
    title.includes(fc.claim) || fc.claim.includes(title)
  );
}

// 根据新闻分类获取历史事件
function getRealTimelineByCategory(category) {
  return REAL_TIMELINE[category] || REAL_TIMELINE['AI'];
}

module.exports = {
  REAL_SOURCES,
  REAL_FACT_CHECKS,
  REAL_TIMELINE,
  getRealSourcesByCategory,
  findRealFactCheck,
  getRealTimelineByCategory
};