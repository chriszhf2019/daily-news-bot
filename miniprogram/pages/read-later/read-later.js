// 稍后读页面
Page({
  data: {
    readLaterList: [],
    filteredList: [],
    loading: true,
    searchText: '',
    sortBy: 'time', // time, title, category
    showSortModal: false,
    selectedItems: [],
    totalReadingTime: 0,
    todayAdded: 0,
    categories: []
  },

  onLoad() {
    this.loadReadLaterList();
  },

  onShow() {
    this.loadReadLaterList();
  },

  onPullDownRefresh() {
    this.loadReadLaterList();
    setTimeout(() => wx.stopPullDownRefresh(), 800);
  },

  loadReadLaterList() {
    this.setData({ loading: true });
    
    try {
      // 从缓存获取新闻数据
      const newsData = wx.getStorageSync('newsData') || [];
      const readLaterIds = wx.getStorageSync('readLaterIds') || [];
      
      // 筛选出标记为稍后读的新闻
      let readLaterList = newsData.filter(n => 
        readLaterIds.includes(n.id) || n.isReadLater
      );
      
      // 如果没有数据，使用模拟数据
      if (readLaterList.length === 0) {
        readLaterList = this.getMockReadLaterList();
      }
      
      // 添加额外属性
      readLaterList = readLaterList.map((item, index) => ({
        ...item,
        addedAt: this.getRelativeTime(index),
        readingTime: '3分钟',
        read: false,
        selected: false,
        estimatedTime: 3
      }));
      
      // 提取分类
      const categorySet = new Set(readLaterList.map(n => n.category));
      const categories = Array.from(categorySet);
      
      // 计算统计数据
      const totalReadingTime = readLaterList.reduce((sum, item) => 
        sum + item.estimatedTime, 0
      );
      
      const today = new Date().toDateString();
      const todayAdded = readLaterList.filter(item => {
        const itemDate = new Date(item.published_at).toDateString();
        return itemDate === today;
      }).length;
      
      this.setData({
        readLaterList,
        filteredList: readLaterList,
        categories,
        totalReadingTime,
        todayAdded: todayAdded || readLaterList.length,
        loading: false
      });
    } catch (error) {
      console.error('加载稍后读列表失败:', error);
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  getMockReadLaterList() {
    return [
      {
        id: 101,
        title: 'DeepSeek-V3 开源：中国大模型的新里程碑',
        category: 'AI',
        summary: 'DeepSeek发布V3版本，671B参数规模，推理成本降低90%，性能媲美GPT-4。',
        source: 'DeepSeek官方',
        published_at: '2026-02-28 09:00',
        tags: ['AI', '大模型', '开源']
      },
      {
        id: 102,
        title: '苹果Vision Pro 2代曝光：更轻薄，价格更亲民',
        category: 'tech',
        summary: '苹果计划在2026年下半年发布Vision Pro二代，重量减轻30%，售价降至2499美元。',
        source: 'The Information',
        published_at: '2026-02-28 10:30',
        tags: ['苹果', 'VR', 'Vision Pro']
      },
      {
        id: 103,
        title: '比亚迪2月销量突破40万辆，同比增长120%',
        category: 'tech',
        summary: '比亚迪2月新能源汽车销量达40.2万辆，连续12个月保持全球第一。',
        source: '比亚迪官方',
        published_at: '2026-02-27 14:00',
        tags: ['比亚迪', '新能源', '汽车']
      }
    ];
  },

  getRelativeTime(index) {
    const times = ['刚刚', '10分钟前', '1小时前', '今天', '昨天', '2天前'];
    return times[index % times.length];
  },

  // 搜索
  onSearchInput(e) {
    const searchText = e.detail.value;
    this.setData({ searchText });
    this.performSearch();
  },

  performSearch() {
    const { searchText, readLaterList } = this.data;
    
    if (!searchText || !searchText.trim()) {
      this.setData({ filteredList: readLaterList });
      return;
    }
    
    const keyword = searchText.toLowerCase().trim();
    const filtered = readLaterList.filter(item => {
      const title = (item.title || '').toLowerCase();
      const summary = (item.summary || '').toLowerCase();
      const category = (item.category || '').toLowerCase();
      
      return title.includes(keyword) || 
             summary.includes(keyword) ||
             category.includes(keyword);
    });
    
    this.setData({ filteredList: filtered });
  },

  // 排序
  showSortOptions() {
    this.setData({ showSortModal: true });
  },

  hideSortOptions() {
    this.setData({ showSortModal: false });
  },

  selectSort(e) {
    const sortBy = e.currentTarget.dataset.sort;
    this.setData({ sortBy, showSortModal: false });
    this.applySorting();
  },

  applySorting() {
    let { filteredList, sortBy } = this.data;
    
    switch (sortBy) {
      case 'title':
        filteredList.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'category':
        filteredList.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'time':
      default:
        // 默认按时间排序（最新的在前）
        break;
    }
    
    this.setData({ filteredList });
  },

  // 选择操作
  toggleSelect(e) {
    const id = e.currentTarget.dataset.id;
    const filteredList = this.data.filteredList.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    );
    const selectedItems = filteredList.filter(item => item.selected).map(item => item.id);
    this.setData({ filteredList, selectedItems });
  },

  selectAll() {
    const filteredList = this.data.filteredList.map(item => ({ ...item, selected: true }));
    const selectedItems = filteredList.map(item => item.id);
    this.setData({ filteredList, selectedItems });
  },

  cancelSelection() {
    const filteredList = this.data.filteredList.map(item => ({ ...item, selected: false }));
    this.setData({ filteredList, selectedItems: [] });
  },

  // 标记为已读
  markAsRead(e) {
    const id = e.currentTarget.dataset.id;
    const filteredList = this.data.filteredList.map(item => 
      item.id === id ? { ...item, read: true } : item
    );
    this.setData({ filteredList });
    wx.showToast({ title: '已标记为已读', icon: 'success' });
  },

  // 移除
  removeItem(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '移除确认',
      content: '确定要从稍后读列表中移除这条新闻吗？',
      success: (res) => {
        if (res.confirm) {
          const filteredList = this.data.filteredList.filter(item => item.id !== id);
          const readLaterList = this.data.readLaterList.filter(item => item.id !== id);
          
          // 更新缓存
          const readLaterIds = readLaterList.map(item => item.id);
          wx.setStorageSync('readLaterIds', readLaterIds);
          
          this.setData({ filteredList, readLaterList });
          wx.showToast({ title: '已移除', icon: 'success' });
        }
      }
    });
  },

  // 批量操作
  batchMarkAsRead() {
    const { selectedItems } = this.data;
    
    if (selectedItems.length === 0) {
      wx.showToast({ title: '请先选择项目', icon: 'none' });
      return;
    }
    
    const filteredList = this.data.filteredList.map(item => 
      selectedItems.includes(item.id) ? { ...item, read: true } : item
    );
    
    this.setData({ filteredList, selectedItems: [] });
    wx.showToast({ title: `已标记${selectedItems.length}条为已读`, icon: 'success' });
  },

  batchRemove() {
    const { selectedItems } = this.data;
    
    if (selectedItems.length === 0) {
      wx.showToast({ title: '请先选择项目', icon: 'none' });
      return;
    }
    
    wx.showModal({
      title: '批量移除',
      content: `确定要移除选中的 ${selectedItems.length} 条新闻吗？`,
      success: (res) => {
        if (res.confirm) {
          const filteredList = this.data.filteredList.filter(item => 
            !selectedItems.includes(item.id)
          );
          const readLaterList = this.data.readLaterList.filter(item => 
            !selectedItems.includes(item.id)
          );
          
          // 更新缓存
          const readLaterIds = readLaterList.map(item => item.id);
          wx.setStorageSync('readLaterIds', readLaterIds);
          
          this.setData({ 
            filteredList, 
            readLaterList, 
            selectedItems: [] 
          });
          wx.showToast({ title: '已移除', icon: 'success' });
        }
      }
    });
  },

  // 查看详情
  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ 
      url: `/pages/seven-elements/seven-elements?id=${id}` 
    });
  },

  // 开始阅读（按顺序）
  startReading() {
    const unreadList = this.data.filteredList.filter(item => !item.read);
    
    if (unreadList.length === 0) {
      wx.showToast({ title: '没有未读内容', icon: 'none' });
      return;
    }
    
    // 跳转到第一条未读新闻
    const firstUnread = unreadList[0];
    wx.navigateTo({ 
      url: `/pages/seven-elements/seven-elements?id=${firstUnread.id}` 
    });
  },

  // 清空已读
  clearRead() {
    wx.showModal({
      title: '清空已读',
      content: '确定要清空所有已读内容吗？',
      success: (res) => {
        if (res.confirm) {
          const filteredList = this.data.filteredList.filter(item => !item.read);
          const readLaterList = this.data.readLaterList.filter(item => !item.read);
          
          // 更新缓存
          const readLaterIds = readLaterList.map(item => item.id);
          wx.setStorageSync('readLaterIds', readLaterIds);
          
          this.setData({ filteredList, readLaterList });
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  // 返回首页
  goToHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止事件冒泡，防止点击弹窗内容时关闭弹窗
  },

  onShareAppMessage() {
    return {
      title: '我的稍后读列表 - 新闻简报',
      path: '/pages/read-later/read-later'
    };
  }
});
