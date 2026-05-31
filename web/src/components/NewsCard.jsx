import { useNavigate } from 'react-router-dom'

export default function NewsCard({ news }) {
  const navigate = useNavigate()
  const isSignal = news.is_signal
  const title = news.title_cn || news.title
  const summary = news.summary_cn || news.summary || ''

  return (
    <div className={`border rounded-r-lg p-5 transition-all duration-300 hover:translate-x-1 cursor-pointer group ${isSignal ? 'border-l-[3px] border-l-[#7ec8a0] border-l-[#7ec8a0]/30' : 'border-l-[3px] border-l-[#c4a144]/20'}`}
      style={{
        background: 'rgba(255,255,255,0.02)',
        borderColor: isSignal ? 'rgba(126,200,160,0.2)' : 'rgba(255,255,255,0.06)',
        borderLeftColor: isSignal ? '#7ec8a0' : 'rgba(196,161,68,0.3)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
        e.currentTarget.style.borderLeftColor = isSignal ? '#7ec8a0' : '#c4a144'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
        e.currentTarget.style.borderLeftColor = isSignal ? '#7ec8a0' : 'rgba(196,161,68,0.3)'
      }}
    >
      {/* Source + time */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] tracking-[0.1em] uppercase font-mono text-[#8b9dc3]">{news.source || 'NewsBrief'}</span>
        <span className="text-[10px] opacity-30">-</span>
        <span className="text-[10px] opacity-30">
          {news.published_at ? new Date(news.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
        </span>
        {isSignal && <span className="ml-auto text-[10px] text-[#7ec8a0] tracking-[0.1em] uppercase">Signal</span>}
      </div>

      {/* Title */}
      <h3 className="text-base font-bold leading-snug mb-2 text-[#e8e4dc] group-hover:text-[#c4a144] transition-colors"
        style={{ fontFamily: "'Playfair Display', 'Noto Serif SC', serif" }}>
        {title}
      </h3>

      {/* English original */}
      {news.title_cn && news.title !== news.title_cn && (
        <p className="text-xs mb-2 line-clamp-1" style={{ color: 'rgba(232,228,220,0.3)' }}>{news.title}</p>
      )}

      {/* Summary */}
      {summary && <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'rgba(232,228,220,0.5)' }}>{summary}</p>}

      {/* Tags */}
      {news.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {news.tags.slice(0, 4).map((t, i) => (
            <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded"
              style={{ background: 'rgba(196,161,68,0.1)', color: '#c4a144' }}>{t}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-white/[0.04]">
        <button onClick={() => navigate(`/seven-elements/${news.id}`)} className="text-[10px] tracking-[0.08em] uppercase px-3 py-1.5 rounded border border-white/[0.08] hover:border-[#7ec8a0]/30 hover:text-[#7ec8a0] transition-all" style={{ color: 'rgba(232,228,220,0.5)' }}>
          Audit
        </button>
        <button onClick={() => navigate(`/relevance/${news.id}`)} className="text-[10px] tracking-[0.08em] uppercase px-3 py-1.5 rounded border border-white/[0.08] hover:border-[#8b9dc3]/30 hover:text-[#8b9dc3] transition-all" style={{ color: 'rgba(232,228,220,0.5)' }}>
          Relevance
        </button>
        <button onClick={() => navigate(`/deep-exploration/${news.id}`)} className="text-[10px] tracking-[0.08em] uppercase px-3 py-1.5 rounded border border-white/[0.08] hover:border-[#c4a144]/30 hover:text-[#c4a144] transition-all" style={{ color: 'rgba(232,228,220,0.5)' }}>
          Explore
        </button>
      </div>
    </div>
  )
}
