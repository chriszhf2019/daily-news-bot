import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { analyzeRelevance } from '../services/deepseekApi'

const personas = [
  { id: 'investor', name: '投资者', icon: '💰' },
  { id: 'techie', name: '技术人', icon: '💻' },
  { id: 'manager', name: '管理者', icon: '👔' }
]

export default function RelevanceAnalysisPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { newsData, apiConfig } = useStore()
  
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState('')
  const [currentPersona, setCurrentPersona] = useState('investor')
  
  // 查找新闻
  useEffect(() => {
    const found = newsData.find(n => String(n.id) === String(id))
    if (found) {
      setNews(found)
      startAnalysis(found, currentPersona)
    } else {
      setError('新闻不存在')
      setLoading(false)
    }
  }, [id, newsData])
  
  // 切换身份
  const handlePersonaChange = (persona) => {
    setCurrentPersona(persona)
    if (news) {
      setLoading(true)
      startAnalysis(news, persona)
    }
  }
  
  // 开始分析
  const startAnalysis = async (newsItem, persona) => {
    if (!apiConfig.deepseekApiKey) {
      setError('请先在设置页面配置 DeepSeek API Key')
      setLoading(false)
      return
    }
    
    try {
      const result = await analyzeRelevance(
        apiConfig.deepseekApiKey,
        apiConfig.deepseekEndpoint,
        newsItem,
        persona
      )
      setAnalysis(result)
    } catch (e) {
      setError('分析失败: ' + e.message)
    } finally {
      setLoading(false)
    }
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-[#1E1B4B] flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl mb-4 block">⚠️</span>
          <p className="text-slate-400">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#1E1B4B]">
      {/* 头部 */}
      <header className="sticky top-0 z-40 bg-[#1E1B4B]/95 backdrop-blur border-b border-purple-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              ← 返回
            </button>
            <div>
              <h1 className="text-lg font-bold text-purple-400">💡 相关性分析</h1>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{news?.title}</p>
            </div>
          </div>
          
          {/* 身份切换 */}
          <div className="flex gap-2 mt-4">
            {personas.map(p => (
              <button
                key={p.id}
                onClick={() => handlePersonaChange(p.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPersona === p.id
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'
                }`}
              >
                <span>{p.icon}</span>
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </header>
      
      {/* 内容 */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 mt-4">AI 正在分析相关性...</p>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            {/* 08 量化影响 ROI */}
            <section className="bg-slate-800/30 rounded-xl border border-purple-500/20 overflow-hidden">
              <div className="px-5 py-3 bg-purple-500/10 border-b border-purple-500/20">
                <span className="text-xs font-mono text-purple-500">08</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">量化影响 (ROI)</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-4xl font-bold font-mono text-purple-400">
                    {analysis.roi?.score || 0}
                  </div>
                  <div className="text-xs text-slate-500">影响指数</div>
                </div>
                <p className="text-sm text-slate-300">{analysis.roi?.reason}</p>
              </div>
            </section>
            
            {/* 09 传导机制 */}
            <section className="bg-slate-800/30 rounded-xl border border-purple-500/20 overflow-hidden">
              <div className="px-5 py-3 bg-purple-500/10 border-b border-purple-500/20">
                <span className="text-xs font-mono text-purple-500">09</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">传导机制 (Ripple)</span>
              </div>
              <div className="p-5 grid grid-cols-3 gap-4">
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-xs text-purple-400 mb-2">⬆️ 上游</div>
                  <p className="text-sm text-slate-300">{analysis.ripple?.upstream}</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-xs text-purple-400 mb-2">⬇️ 下游</div>
                  <p className="text-sm text-slate-300">{analysis.ripple?.downstream}</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-xs text-purple-400 mb-2">⚔️ 竞争</div>
                  <p className="text-sm text-slate-300">{analysis.ripple?.rivals}</p>
                </div>
              </div>
            </section>
            
            {/* 11 博弈方案 */}
            <section className="bg-slate-800/30 rounded-xl border border-purple-500/20 overflow-hidden">
              <div className="px-5 py-3 bg-purple-500/10 border-b border-purple-500/20">
                <span className="text-xs font-mono text-purple-500">11</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">博弈方案 (Decision)</span>
              </div>
              <div className="p-5 space-y-3">
                {analysis.decision?.options?.map((opt, i) => (
                  <div key={i} className="p-3 bg-slate-700/30 rounded-lg">
                    <div className="font-medium text-purple-400 mb-2">{opt.name}</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-emerald-400">✓ 优势：</span>
                        <span className="text-slate-300">{opt.pros}</span>
                      </div>
                      <div>
                        <span className="text-amber-400">✗ 劣势：</span>
                        <span className="text-slate-300">{opt.cons}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* 13 避坑指南 */}
            <section className="bg-slate-800/30 rounded-xl border border-amber-500/20 overflow-hidden">
              <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20">
                <span className="text-xs font-mono text-amber-500">13</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">避坑指南 (Pitfall)</span>
              </div>
              <div className="p-5 space-y-3">
                {analysis.pitfall?.map((item, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-amber-500/5 rounded-lg border-l-2 border-amber-500">
                    <div>
                      <div className="text-sm text-amber-400 mb-1">⚠️ {item.trap}</div>
                      <div className="text-sm text-slate-400">→ {item.avoid}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* 10 具体行动 */}
            <section className="bg-slate-800/30 rounded-xl border border-emerald-500/20 overflow-hidden">
              <div className="px-5 py-3 bg-emerald-500/10 border-b border-emerald-500/20">
                <span className="text-xs font-mono text-emerald-500">10</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">具体行动 (Action)</span>
              </div>
              <div className="p-5 space-y-3">
                {analysis.action?.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold">
                      {item.step}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm text-slate-300">{item.action}</div>
                      <div className="text-xs text-slate-500 mt-1">⏰ {item.deadline}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            {/* 12 时间窗口 */}
            <section className="bg-slate-800/30 rounded-xl border border-purple-500/20 overflow-hidden">
              <div className="px-5 py-3 bg-purple-500/10 border-b border-purple-500/20">
                <span className="text-xs font-mono text-purple-500">12</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">时间窗口 (Timing)</span>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-200">{analysis.timing?.window}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  analysis.timing?.urgency === 'high' ? 'bg-red-500/20 text-red-400' :
                  analysis.timing?.urgency === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {analysis.timing?.urgency === 'high' ? '🔥 紧急' :
                   analysis.timing?.urgency === 'medium' ? '⚡ 适中' : '🌙 从容'}
                </span>
              </div>
            </section>
            
            {/* 14 认知溢价 */}
            <section className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/30 overflow-hidden">
              <div className="px-5 py-3 bg-purple-500/10 border-b border-purple-500/20">
                <span className="text-xs font-mono text-purple-500">14</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">认知溢价 (Gold Quote)</span>
              </div>
              <div className="p-8 text-center">
                <div className="text-3xl mb-4">💎</div>
                <p className="text-lg text-purple-300 italic font-medium">
                  "{analysis.goldQuote}"
                </p>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  )
}
