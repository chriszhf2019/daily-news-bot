import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import useStore from '../store/useStore'
import NewsCard from '../components/NewsCard'

export default function HomePage() {
  const { newsData, loading, setNewsData, fetchNews } = useStore()
  const [showAll, setShowAll] = useState(false)
  const [dailyStats, setDailyStats] = useState(null)
  const [signals, setSignals] = useState([])
  const [showSignals, setShowSignals] = useState(false)
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    fetch('https://news.velolabs.top/api/v1/news/top')
      .then(r => r.json())
      .then(d => { if (d.success) setNewsData(d.data.news) })
      .catch(() => fetchNews())

    fetch('https://news.velolabs.top/api/v1/news/daily-stats')
      .then(r => r.json())
      .then(d => {
        if (d.success) { setDailyStats(d.data); setSignals(d.data.signal_news || []) }
      })
      .catch(() => {})
  }, [])

  const loadAllNews = async () => { setShowAll(true); await fetchNews() }

  const handleSearch = async () => {
    const kw = searchText.trim(); if (!kw) return
    try {
      const r = await fetch(`https://news.velolabs.top/api/v1/news/search?keyword=${encodeURIComponent(kw)}&per_page=20`)
      const d = await r.json()
      if (d.success) { setNewsData(d.data.results); setShowAll(true) }
    } catch (e) {}
  }

  const sentiment = dailyStats?.sentiment_score || 50
  const sentimentColor = sentiment >= 60 ? 'text-[#7ec8a0]' : sentiment <= 40 ? 'text-[#e05555]' : 'text-[#c4a144]'

  return (
    <div className="min-h-screen relative z-10">
      {/* Masthead */}
      <header className="border-b border-white/[0.06] px-6 py-6 max-w-5xl mx-auto">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[#e8e4dc] italic" style={{ fontFamily: "'Playfair Display', serif" }}>
              NewsBrief
            </h1>
            <p className="text-xs tracking-[0.2em] uppercase mt-1" style={{ color: 'rgba(232,228,220,0.35)' }}>
              Intelligence Briefing
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.href='/login'} className="text-xs tracking-wider uppercase px-4 py-2 border border-white/[0.08] rounded-lg hover:border-[#c4a144]/30 hover:text-[#c4a144] transition-all" style={{ color: 'rgba(232,228,220,0.5)' }}>
              Sign In
            </button>
            <a href="/settings" className="text-xs tracking-wider uppercase px-4 py-2 border border-white/[0.08] rounded-lg hover:border-white/[0.15] transition-all" style={{ color: 'rgba(232,228,220,0.5)' }}>
              Settings
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Dashboard row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="border border-white/[0.06] rounded-xl p-5 text-center hover:border-[#c4a144]/20 transition-all" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="text-2xl font-bold text-[#7ec8a0] font-mono">{newsData.length}</div>
            <div className="text-[10px] tracking-[0.15em] uppercase mt-1" style={{ color: 'rgba(232,228,220,0.35)' }}>Top Stories</div>
          </div>
          <div className={`border border-white/[0.06] rounded-xl p-5 text-center hover:border-${sentiment >= 60 ? '[#7ec8a0]' : sentiment <= 40 ? '[#e05555]' : '[#c4a144]'}/20 transition-all`} style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className={`text-2xl font-bold font-mono ${sentimentColor}`}>{sentiment}</div>
            <div className="text-[10px] tracking-[0.15em] uppercase mt-1" style={{ color: 'rgba(232,228,220,0.35)' }}>Sentiment</div>
          </div>
          <button onClick={() => setShowSignals(!showSignals)} className="border border-white/[0.06] rounded-xl p-5 text-center hover:border-[#c4a144]/20 transition-all text-left w-full" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className={`text-2xl font-bold font-mono ${signals.length > 0 ? 'text-[#c4a144]' : ''}`}>{signals.length}</div>
            <div className="text-[10px] tracking-[0.15em] uppercase mt-1" style={{ color: 'rgba(232,228,220,0.35)' }}>Signals {showSignals ? '▲' : '▼'}</div>
          </button>
          <div className="border border-white/[0.06] rounded-xl p-5 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="text-2xl font-bold text-[#8b9dc3] font-mono">{dailyStats?.analyzed_count || '--'}</div>
            <div className="text-[10px] tracking-[0.15em] uppercase mt-1" style={{ color: 'rgba(232,228,220,0.35)' }}>Analyzed</div>
          </div>
        </div>

        {/* Signal detail */}
        {showSignals && signals.length > 0 && (
          <div className="mb-8 p-6 rounded-xl border border-[#c4a144]/10" style={{ background: 'rgba(196,161,68,0.03)' }}>
            <h3 className="text-xs tracking-[0.15em] uppercase mb-4 text-[#c4a144]">Today's Signals</h3>
            {signals.map((s, i) => (
              <div key={i} className="flex gap-3 py-2 border-b border-white/[0.04] last:border-0">
                <span className="text-xs font-mono text-[#c4a144] mt-0.5">{s.importance || '?'}</span>
                <div>
                  <p className="text-sm text-[#e8e4dc]">{s.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(232,228,220,0.4)' }}>{s.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search bar */}
        <div className="flex gap-2 mb-8">
          <input value={searchText} onChange={e => setSearchText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search by keyword..."
            className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-5 py-3 text-sm text-[#e8e4dc] placeholder:text-white/20 outline-none focus:border-[#c4a144]/30 transition-all" />
          <button onClick={handleSearch} className="px-6 py-3 border border-[#c4a144]/20 text-[#c4a144] text-xs tracking-wider uppercase rounded-lg hover:bg-[#c4a144]/10 transition-all">Search</button>
        </div>

        {/* News grid */}
        {loading ? (
          <div className="text-center py-20 text-sm" style={{ color: 'rgba(232,228,220,0.3)' }}>Loading intelligence...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {newsData.map((news, i) => (
              <div key={news.id} style={{ animationDelay: `${i * 0.05}s` }} className="animate-in">
                <NewsCard news={news} />
              </div>
            ))}
          </div>
        )}

        {/* Load more */}
        {!showAll && (
          <div className="text-center py-12">
            <button onClick={loadAllNews} className="px-8 py-3 border border-white/[0.08] rounded-lg text-xs tracking-[0.15em] uppercase hover:border-[#c4a144]/30 hover:text-[#c4a144] transition-all" style={{ color: 'rgba(232,228,220,0.4)' }}>
              View All Stories →
            </button>
            <p className="text-xs mt-4" style={{ color: 'rgba(232,228,220,0.2)' }}>Configure interests in Settings for personalized briefing</p>
          </div>
        )}
      </main>

      <footer className="border-t border-white/[0.04] text-center py-8 mt-12">
        <p className="text-xs tracking-[0.1em] uppercase" style={{ color: 'rgba(232,228,220,0.2)' }}>
          NewsBrief &middot; AI-Powered Intelligence &middot; {newsData.length} Sources Analyzed
        </p>
      </footer>
    </div>
  )
}
