import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import useStore from '../store/useStore'
import NewsCard from '../components/NewsCard'
import InputModal from '../components/InputModal'

const CATEGORY_ICONS = { 'AI动态': '🤖', '科技前沿': '🚀', '综合': '📰', '自动驾驶': '🚗', '量子计算': '⚛️', 'VR/AR': '🥽' }

export default function HomePage() {
  const {
    newsData, 
    loading, setLoading,
    currentCategory, setCurrentCategory,
    getFilteredNews,
    initUser,
    fetchNews,
    refreshNews,
    setNewsData
  } = useStore()
  
  const [showInputModal, setShowInputModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  
  const [showAll, setShowAll] = useState(false)

  // 初始化 — 只加载 Top 10
  useEffect(() => {
    initUser()
    fetch('https://news.velolabs.top/api/v1/news/top')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.news) {
          setNewsData(d.data.news)
        }
      })
      .catch(() => fetchNews())
  }, [])

  // 加载全部新闻
  const loadAllNews = async () => {
    setShowAll(true)
    await fetchNews()
  }
  
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
  
  // 从真实数据动态生成分类列表
  const realCategories = [{ id: 'all', name: '全部', icon: '📊' }]
  const seenCats = new Set()
  newsData.forEach(n => {
    const cat = n.category || '综合'
    if (!seenCats.has(cat)) {
      seenCats.add(cat)
      realCategories.push({ id: cat, name: cat, icon: CATEGORY_ICONS[cat] || '📰' })
    }
  })
  const categories = realCategories

  const [dailyStats, setDailyStats] = useState(null)
  const [signals, setSignals] = useState([])
  const [showSignals, setShowSignals] = useState(false)
  const [searchText, setSearchText] = useState('')
  const handleSearch = async () => {
    const kw = searchText.trim()
    if (!kw) return
    setLoading(true)
    try {
      const r = await fetch(`https://news.velolabs.top/api/v1/news/search?keyword=${encodeURIComponent(kw)}&per_page=20`)
      const d = await r.json()
      if (d.success) { setNewsData(d.data.results); setShowAll(true) }
    } catch (e) {}
    setLoading(false)
  }

  useEffect(() => {
    fetch('https://news.velolabs.top/api/v1/news/daily-stats')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setDailyStats(d.data)
          setSignals(d.data.signal_news || [])
        }
      })
      .catch(() => {})
  }, [newsData.length])

  // 统计数据（基于真实 API 数据）
  const uniqueSources = [...new Set(newsData.map(n => n.source).filter(Boolean))]
  const uniqueCategories = [...new Set(newsData.map(n => n.category).filter(Boolean))]
  const todayNews = newsData.filter(n => {
    if (!n.published_at) return false
    const d = new Date(n.published_at)
    const t = new Date()
    return d.toDateString() === t.toDateString()
  })
  const stats = {
    total: newsData.length,
    sources: uniqueSources.length,
    categories: uniqueCategories.length,
    today: todayNews.length,
  }
  
  return (
    <div className="min-h-screen">
      {/* 顶部栏 */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-100">NewsBrief</h1>
              <p className="text-xs text-slate-500">AI驱动的智能情报</p>
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
              <div className="text-2xl font-bold text-emerald-400 font-mono">{stats.today}</div>
              <div className="text-xs text-slate-500 mt-1">今日更新</div>
            </div>
            <button onClick={() => setShowSignals(!showSignals)} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-amber-500/30 transition-colors relative group text-left w-full">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-amber-400 font-mono">{signals.length}</div>
                  <div className="text-xs text-slate-500 mt-1">重要信号 {showSignals ? '▲' : '▼'}</div>
                </div>
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 border border-slate-600 rounded-lg p-3 text-xs text-slate-300 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="font-medium text-amber-400 mb-1">⚡ 重要信号</div>
                DeepSeek AI 从最近 100 条新闻中自动识别 3-5 条最具有影响力的重要新闻。点击卡片展开查看详情。
              </div>
            </button>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 relative group cursor-help">
              <div className={`text-2xl font-bold font-mono ${(dailyStats?.sentiment_score || 50) >= 60 ? 'text-emerald-400' : (dailyStats?.sentiment_score || 50) <= 40 ? 'text-red-400' : 'text-amber-400'}`}>
                {dailyStats?.sentiment_score || '--'}
              </div>
              <div className="text-xs text-slate-500 mt-1">市场情绪指数</div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 border border-slate-600 rounded-lg p-3 text-xs text-slate-300 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="font-medium text-purple-400 mb-1">📊 市场情绪指数</div>
                DeepSeek AI 分析最近 100 条新闻标题的情绪倾向。0-100 分，50 为中性，越高越积极，越低越消极。当前分析中 😊{dailyStats?.positive_count || 0} 条积极、😐{dailyStats?.neutral_count || 0} 条中性、😟{dailyStats?.negative_count || 0} 条消极。
              </div>
            </div>
          </div>
          {showSignals && signals.length > 0 && (
            <div className="mt-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <div className="text-xs text-amber-400 font-medium mb-2">⚡ 重要信号</div>
              {signals.map((s, i) => (
                <div key={i} className="flex items-start gap-2 py-1.5 border-b border-slate-800/50 last:border-0">
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-mono">{s.importance || '?'}</span>
                  <div>
                    <div className="text-sm text-slate-200">{s.title}</div>
                    <div className="text-xs text-slate-500">{s.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
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
        {/* 搜索栏 — 突出 */}
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchText || ''}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索你关心的关键词..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-5 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
            />
            <button onClick={handleSearch} className="px-5 py-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl text-sm font-medium hover:bg-purple-500/30">
              🔍 搜索
            </button>
          </div>
        </div>

        {/* 加载更多按钮 */}
        {!showAll && newsData.length > 0 && (
          <div className="flex flex-col items-center gap-3 py-8 mb-4 bg-slate-800/20 rounded-xl border border-slate-700/30">
            <p className="text-slate-400 text-sm">以上为今日 Top 10 精选</p>
            <button onClick={loadAllNews} className="px-6 py-3 bg-slate-700/50 text-slate-200 border border-slate-600 rounded-xl text-sm hover:bg-slate-700 transition-colors">
              查看更多新闻 →
            </button>
            <p className="text-slate-600 text-xs">去 设置 配置你关注的领域，只看你关心的</p>
          </div>
        )}

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
