import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const categoryConfig = {
  AI: { icon: '🤖', color: 'purple', bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
  tech: { icon: '🚀', color: 'blue', bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
  finance: { icon: '💰', color: 'amber', bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400' },
  international: { icon: '🌍', color: 'emerald', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  sports: { icon: '⚽', color: 'red', bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400' }
}

export default function NewsCard({ news, onAnalyze }) {
  const navigate = useNavigate()
  const config = categoryConfig[news.category] || categoryConfig.AI
  
  const handleAnalyze = (type) => {
    if (type === 'seven') {
      navigate(`/seven-elements/${news.id}`)
    } else if (type === 'relevance') {
      navigate(`/relevance/${news.id}`)
    } else if (type === 'deep') {
      navigate(`/deep-exploration/${news.id}`)
    }
  }
  
  return (
    <div className={`bg-slate-800/50 rounded-xl border ${config.border} p-5 card-hover animate-fadeIn`}>
      {/* 头部 */}
      <div className="flex items-start gap-3 mb-3">
        <span className={`text-2xl p-2 rounded-lg ${config.bg}`}>{config.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-100 line-clamp-2 leading-snug">
            {news.title_cn || news.title}
          </h3>
          {news.title_cn && (
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{news.title}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
            <span>{news.source}</span>
            <span>•</span>
            <span>{dayjs(news.published_at).format('MM-DD HH:mm')}</span>
          </div>
        </div>
      </div>
      
      {/* 摘要 */}
      <p className="text-sm text-slate-400 line-clamp-2 mb-3">
        {news.summary_cn || news.summary}
      </p>
      
      {/* 标签 */}
      {news.tags && news.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {news.tags.slice(0, 4).map((tag, i) => (
            <span 
              key={i} 
              className={`text-xs px-2 py-0.5 rounded ${config.bg} ${config.text}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* 操作按钮 */}
      <div className="flex gap-2 pt-3 border-t border-slate-700/50">
        <button
          onClick={() => handleAnalyze('seven')}
          className="flex-1 py-2 text-xs font-medium rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
        >
          🔍 七要素审计
        </button>
        <button
          onClick={() => handleAnalyze('relevance')}
          className="flex-1 py-2 text-xs font-medium rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
        >
          💡 相关性分析
        </button>
        <button
          onClick={() => handleAnalyze('deep')}
          className="flex-1 py-2 text-xs font-medium rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
        >
          🔮 深度探索
        </button>
      </div>
    </div>
  )
}
