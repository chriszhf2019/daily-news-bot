const deepseek = require('../../utils/deepseek.js');

Page({
  data: {
    particles: [],
    stars: [],
    logicTree: {
      root: {
        title: '',
        subtitle: ''
      },
      origins: [],
      impacts: [],
      variables: []
    },
    showDetail: false,
    selectedNode: {},
    showTransition: false,
    isLoading: false
  },

  onLoad(options) {
    const newsId = options.id;
    this.triggerTransition();
    this.loadLogicTree(newsId);
    this.initParticles();
    this.initStars();
  },

  triggerTransition() {
    this.setData({ showTransition: true });
    
    setTimeout(() => {
      this.setData({ showTransition: false });
    }, 1800);
  },

  initStars() {
    const stars = [];
    
    for (let i = 0; i < 50; i++) {
      const tx = (Math.random() - 0.5) * 400;
      const ty = (Math.random() - 0.5) * 400;
      
      stars.push({
        tx,
        ty,
        delay: Math.random() * 0.3
      });
    }
    
    this.setData({ stars });
  },

  async loadLogicTree(newsId) {
    const newsData = this.getNewsData(newsId);
    
    if (newsData && newsData.logic_tree) {
      this.setData({
        logicTree: newsData.logic_tree
      });
    } else if (newsData) {
      try {
        this.setData({ isLoading: true });
        wx.showLoading({
          title: 'AI分析中...',
          mask: true
        });

        const logicTree = await deepseek.generateLogicTree(newsData);
        
        this.setData({
          logicTree: logicTree,
          isLoading: false
        });

        wx.hideLoading();
        wx.showToast({
          title: '分析完成',
          icon: 'success',
          duration: 1500
        });
      } catch (error) {
        console.error('Failed to generate logic tree:', error);
        this.setData({ isLoading: false });
        wx.hideLoading();
        
        wx.showToast({
          title: '分析失败，使用默认数据',
          icon: 'none',
          duration: 2000
        });

        setTimeout(() => {
          this.generateMockData();
        }, 500);
      }
    } else {
      this.generateMockData();
    }
  },

  getNewsData(newsId) {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const app = getApp();
    
    if (app.globalData.newsList) {
      return app.globalData.newsList.find(item => item.id === newsId);
    }
    
    // 检查是否为全网搜索结果
    if (app.globalData.globalSearchResults) {
      return app.globalData.globalSearchResults.find(item => item.id === newsId);
    }
    
    return null;
  },

  generateMockData() {
    this.setData({
      logicTree: {
        root: {
          title: 'AI技术突破引发全球关注',
          subtitle: '深度分析核心逻辑链'
        },
        origins: [
          {
            id: 1,
            title: '开源模型性能提升',
            weight: 95,
            type: 'origin',
            description: '近期多个开源AI模型在性能上取得重大突破，特别是在自然语言处理和图像生成领域。这些突破降低了AI技术的使用门槛，使得更多企业和个人能够利用先进AI技术。'
          },
          {
            id: 2,
            title: '算力成本下降',
            weight: 88,
            type: 'origin',
            description: '随着芯片技术的进步和云计算的普及，AI算力成本在过去一年中下降了约40%。这使得AI应用的大规模部署成为可能，推动了各行各业的数字化转型。'
          },
          {
            id: 3,
            title: '政策支持力度加大',
            weight: 75,
            type: 'origin',
            description: '多个国家和地区出台了支持AI发展的政策，包括资金投入、人才培养和法规完善。这些政策为AI技术的健康发展提供了良好的环境。'
          }
        ],
        impacts: [
          {
            id: 4,
            title: '传统行业加速转型',
            weight: 92,
            type: 'impact',
            description: 'AI技术正在深刻改变传统行业的运营模式。制造业通过AI实现智能化生产，零售业利用AI优化供应链，金融业借助AI提升风控能力。这种转型正在重塑整个商业生态。'
          },
          {
            id: 5,
            title: '就业结构发生变化',
            weight: 85,
            type: 'impact',
            description: 'AI的普及正在改变就业市场的结构。一方面，一些重复性工作被自动化取代；另一方面，新的AI相关岗位不断涌现。这要求劳动者不断提升技能以适应新的就业环境。'
          },
          {
            id: 6,
            title: '创新速度加快',
            weight: 78,
            type: 'impact',
            description: 'AI技术大大加速了创新的速度。从药物研发到新材料发现，从产品设计到市场分析，AI都在发挥着重要作用，缩短了从创意到产品的周期。'
          }
        ],
        variables: [
          {
            id: 1,
            name: '技术成熟度',
            value: '高'
          },
          {
            id: 2,
            name: '市场接受度',
            value: '中'
          },
          {
            id: 3,
            name: '监管风险',
            value: '低'
          },
          {
            id: 4,
            name: '竞争激烈度',
            value: '高'
          }
        ]
      }
    });
  },

  initParticles() {
    const particles = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 20
      });
    }
    this.setData({ particles });
  },

  showNodeDetail(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      selectedNode: item,
      showDetail: true
    });
  },

  showVariableDetail(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      selectedNode: {
        title: item.name,
        description: `当前${item.name}的评估值为：${item.value}。这个变量对整体逻辑链有重要影响，需要持续关注其变化趋势。`,
        weight: 50,
        type: 'variable'
      },
      showDetail: true
    });
  },

  hideDetail() {
    this.setData({
      showDetail: false
    });
  },

  stopPropagation() {
    // 阻止事件冒泡
  },

  goBack() {
    wx.navigateBack();
  }
});
