import { useState } from 'react'

/** 带折叠的卡片（移动端默认展开、小屏可点击折叠 / 桌面默认展开） */
export function CollapseCard({ title, subtitle, content, defaultOpen = true, icon, accent }) {
  const [open, setOpen] = useState(defaultOpen)
  const accentMap = {
    purple:  'from-purple-500/20 to-transparent border-purple-500/25',
    blue:    'from-blue-500/20 to-transparent border-blue-500/25',
    emerald: 'from-emerald-500/20 to-transparent border-emerald-500/25',
    amber:   'from-amber-500/20 to-transparent border-amber-500/25',
    rose:    'from-rose-500/20 to-transparent border-rose-500/25',
    indigo:  'from-indigo-500/20 to-transparent border-indigo-500/25'
  }
  return (
    <section className={`rounded-2xl border bg-gradient-to-b ${accentMap[accent] || accentMap.blue} overflow-hidden`}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-3 p-4 md:p-5 text-left">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-white font-semibold text-[15px] md:text-lg">
            {icon && <span className="text-base md:text-lg">{icon}</span>}
            <span className="line-clamp-2">{title}</span>
          </div>
          {subtitle && <p className="text-[12px] md:text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <span className={`text-slate-300 text-base transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="px-4 md:px-5 pb-4 md:pb-5 pt-0 border-t border-slate-800/50">
          <div className="text-[13.5px] md:text-[15px] leading-[1.75] text-slate-200 whitespace-pre-wrap">
            {content}
          </div>
        </div>
      )}
    </section>
  )
}

/** 通用 Loading 条 */
export function AnalyzingBanner({ label }) {
  return (
    <div className="rounded-2xl border border-purple-500/25 bg-purple-500/10 p-5 md:p-6 flex items-center gap-3 md:gap-4">
      <span className="loader loader--md" />
      <div>
        <div className="text-white font-semibold text-sm md:text-base">{label || 'AI 正在分析…'}</div>
        <div className="text-slate-400 text-[12px] md:text-sm">这通常需要 5-20 秒，请稍候</div>
      </div>
    </div>
  )
}

/** 错误横幅 */
export function ErrorBanner({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 md:p-5">
      <div className="flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div className="flex-1">
          <div className="text-white font-semibold text-sm md:text-base mb-1">分析失败</div>
          <div className="text-slate-300 text-[13px] md:text-sm leading-relaxed">{message}</div>
        </div>
        {onRetry && (
          <button onClick={onRetry}
            className="touch-target h-9 px-3 rounded-xl bg-white text-slate-900 text-xs md:text-sm font-medium hover:bg-slate-100 active:scale-[0.98] transition-transform">
            重试
          </button>
        )}
      </div>
    </div>
  )
}

/** 新闻摘要卡（用于分析页顶部的"当前情报"概览） */
export function NewsHeaderCard({ news }) {
  if (!news) return null
  return (
    <section className="rounded-3xl p-5 md:p-7 bg-slate-900/70 border border-slate-700/60">
      <div className="text-[11px] md:text-xs text-slate-400 uppercase tracking-widest mb-2">当前情报</div>
      <h1 className="text-xl md:text-3xl font-bold text-white leading-tight mb-3">{news.title}</h1>
      {news.summary && (
        <p className="text-slate-300 text-[13.5px] md:text-base leading-relaxed mb-4">{news.summary}</p>
      )}
      <div className="flex flex-wrap items-center gap-2 text-[11px] md:text-xs text-slate-400">
        {news.source && <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60">📎 {news.source}</span>}
        {news.published_at && <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60">🕒 {new Date(news.published_at).toLocaleDateString('zh-CN')}</span>}
        {news.url && <a href={news.url} target="_blank" rel="noreferrer"
          className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30 hover:bg-blue-500/20 transition-colors truncate max-w-[80vw]">🔗 查看原文</a>}
      </div>
    </section>
  )
}

/** 一条情报的占位（当 URL 参数里的 newsId 不在 store 中时显示） */
export function NewsMissingPrompt({ onGoHome }) {
  return (
    <div className="rounded-3xl border border-slate-700/60 bg-slate-900/60 p-6 md:p-10 text-center">
      <div className="text-5xl mb-3">🔍</div>
      <h2 className="text-lg md:text-xl font-semibold text-white mb-2">没找到这条情报</h2>
      <p className="text-slate-400 text-sm mb-5 max-w-sm mx-auto">可能已被刷新覆盖，或链接是通过外部分享的。可以回到简报列表，或手动录入一条再试。</p>
      <button onClick={onGoHome}
        className="touch-target h-11 px-5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium text-sm active:scale-[0.98] transition-transform">
        回到简报
      </button>
    </div>
  )
}
