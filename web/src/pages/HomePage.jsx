import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import useStore from '../store/useStore'
import NewsCard from '../components/NewsCard'
import InputModal from '../components/InputModal'

const categories = [
  { id: 'all', name: '全部', icon: '📊' },
  { id: 'AI', name: 'AI', icon: '🤖' },
  { id: 'tech', name: '科技', icon: '🚀' },
  { id: 'finance', name: '财经', icon: '💰' },
  { id: 'international', name: '国际', icon: '🌍' }
]

export default function HomePage() {
  const { 
    newsData, 
    loading, setLoading,
    currentCategory, setCurrentCategory,
    getFilteredNews,
    initUser,
    fetchNews,
    refreshNews
  } = useStore()
  
  const [showInputModal, setShowInputModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  // 初始化
  useEffect(() => {
    initUser()
    if (newsData.length === 0) {
      fetchNews()
    }
  }, [])
  
  // 刷新新闻
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshNews()
    } catch (error) {
      console.error('刷新失败:', error)
      alert('刷新失败: ' + error.message)
    } finally {
      setRefreshing(false)
    }
  }
  
  const filteredNews = getFilteredNews()
  
  // 统计数据
  const stats = {
    total: newsData.length,
    positive: newsData.filter(n => n.sentiment === 'positive' || n.category === 'AI动态').length,
    signals: newsData.filter(n => (n.impactScore >= 8) || n.isBreaking).length,
  }
  
  return (
    <div className="min-h-screen">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-100">今日情报</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {dayjs().format('YYYY年MM月DD日 dddd')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowInputModal(true)}
                className="px-4 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors"
              >
                ➕ 录入情报
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-medium hover:bg-emerald-500/30 disabled:opacity-50 transition-colors"
              >
                {refreshing ? '刷新中...' : '🔄 刷新'}
              </button>
            </div>
          </div>
          
          {/* 统计卡片 */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-emerald-400 font-mono">{stats.total}</div>
              <div className="text-xs text-slate-500 mt-1">今日情报</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-amber-400 font-mono">{stats.signals}</div>
              <div className="text-xs text-slate-500 mt-1">重要信号</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="text-2xl font-bold text-purple-400 font-mono">
                {stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0}%
              </div>
              <div className="text-xs text-slate-500 mt-1">市场情绪</div>
            </div>
          </div>
          
          {/* 分类筛选 */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCurrentCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  currentCategory === cat.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </header>
      
      {/* 新闻列表 */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading && newsData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 mt-4">正在获取最新情报...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="text-5xl mb-4">📭</span>
            <p className="text-slate-500">暂无情报，点击刷新获取</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNews.map(news => (
              <NewsCard key={news.id} news={news} />
            ))}
          </div>
        )}
      </div>
      
      {/* 录入弹窗 */}
      <InputModal 
        isOpen={showInputModal} 
        onClose={() => setShowInputModal(false)} 
      />
    </div>
  )
}
