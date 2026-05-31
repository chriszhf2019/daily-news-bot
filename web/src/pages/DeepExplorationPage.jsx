import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { analyzeDeepExploration } from '../services/deepseekApi'

export default function DeepExplorationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { newsData, apiConfig } = useStore()
  
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(false)
  
  useEffect(() => {
    const found = newsData.find(n => String(n.id) === String(id))
    if (found) {
      setNews(found)
    } else {
      setError('新闻不存在')
    }
  }, [id, newsData])
  
  const startAnalysis = async () => {
    if (!apiConfig.deepseekApiKey) {
      setError('请先在设置页面配置 DeepSeek API Key')
      return
    }
    
    setExpanded(true)
    setLoading(true)
    
    try {
      const result = await analyzeDeepExploration(
        apiConfig.deepseekApiKey,
        apiConfig.deepseekEndpoint,
        news
      )
      setAnalysis(result)
    } catch (e) {
      setError('分析失败: ' + e.message)
    } finally {
      setLoading(false)
    }
  }
  
  if (error && !news) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl mb-4 block">⚠️</span>
          <p className="text-slate-400">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#020617]">
      {/* 头部 */}
      <header className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
            >
              ← 返回
            </button>
            <div>
              <h1 className="text-lg font-bold text-amber-400">🔮 战略研究</h1>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{news?.title}</p>
            </div>
          </div>
        </div>
      </header>
      
      {/* 内容 */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* 新闻摘要卡片 */}
        <div className="bg-slate-900/50 rounded-xl border border-amber-500/20 p-5 mb-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-2">{news?.title}</h2>
          <p className="text-sm text-slate-400 line-clamp-3">{news?.summary}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span>{news?.source}</span>
            <span>{news?.category}</span>
          </div>
        </div>
        
        {/* 展开按钮 */}
        {!expanded && (
          <button
            onClick={startAnalysis}
            className="w-full py-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-amber-400 font-semibold hover:from-amber-500/30 hover:to-orange-500/30 transition-all"
          >
            🔍 启动深度探源
          </button>
        )}
        
        {/* 加载状态 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 mt-4">战略智库正在深度分析...</p>
          </div>
        )}
        
        {/* 分析结果 */}
        {analysis && !loading && (
          <div className="space-y-6">
            {/* 20 显微镜核查 */}
            <section className="bg-slate-900/50 rounded-xl border border-amber-500/20 overflow-hidden">
              <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20">
                <span className="text-xs font-mono text-amber-500">20</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">显微镜核查</span>
              </div>
              <div className="p-5">
                <div className="mb-3">
                  <span className="text-xs text-slate-500">核查目标</span>
                  <p className="text-sm text-amber-400 mt-1">{analysis.microAudit?.target}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500">核查逻辑</span>
                  <p className="text-sm text-slate-300 mt-1">{analysis.microAudit?.logic}</p>
                </div>
              </div>
            </section>
            
            {/* 15 AI推理逻辑树 */}
            <section className="bg-slate-900/50 rounded-xl border border-amber-500/20 overflow-hidden">
              <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20">
                <span className="text-xs font-mono text-amber-500">15</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">AI推理逻辑树</span>
              </div>
              <div className="p-5">
                <div className="relative pl-6 border-l-2 border-amber-500/30 space-y-4">
                  {analysis.reasoningChain?.map((step, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[29px] w-4 h-4 bg-amber-500 rounded-full border-4 border-[#020617] flex items-center justify-center">
                        <span className="text-[8px] text-black font-bold">{i + 1}</span>
                      </div>
                      <p className="text-sm text-slate-300">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            
            {/* 16 历史相似基因 */}
            <section className="bg-slate-900/50 rounded-xl border border-amber-500/20 overflow-hidden">
              <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20">
                <span className="text-xs font-mono text-amber-500">16</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">历史相似基因</span>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">📜</span>
                  <div>
                    <p className="text-sm text-amber-400 font-medium">{analysis.historyMatch?.event}</p>
                    <p className="text-sm text-slate-400 mt-2">{analysis.historyMatch?.lesson}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 17 隐秘利益图谱 */}
            <section className="bg-slate-900/50 rounded-xl border border-amber-500/20 overflow-hidden">
              <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20">
                <span className="text-xs font-mono text-amber-500">17</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">隐秘利益图谱</span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.interestsMap?.map((item, i) => (
                    <div key={i} className="bg-slate-800/50 rounded-lg p-3">
                      <div className="text-sm text-amber-400 font-medium">{item.entity}</div>
                      <div className="text-xs text-slate-400 mt-1">{item.motivation}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            
            {/* 18 生态位扩展 */}
            <section className="bg-slate-900/50 rounded-xl border border-amber-500/20 overflow-hidden">
              <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20">
                <span className="text-xs font-mono text-amber-500">18</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">生态位扩展</span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-2">⬆️ 上游</div>
                    {analysis.ecosystem?.upstream?.map((item, i) => (
                      <div key={i} className="text-sm text-slate-300 mb-1">• {item}</div>
                    ))}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-2">⬇️ 下游</div>
                    {analysis.ecosystem?.downstream?.map((item, i) => (
                      <div key={i} className="text-sm text-slate-300 mb-1">• {item}</div>
                    ))}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-2">⚔️ 竞争者</div>
                    {analysis.ecosystem?.rivals?.map((item, i) => (
                      <div key={i} className="text-sm text-slate-300 mb-1">• {item}</div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            
            {/* 19 黑天鹅触发点 */}
            <section className="bg-slate-900/50 rounded-xl border border-red-500/20 overflow-hidden">
              <div className="px-5 py-3 bg-red-500/10 border-b border-red-500/20">
                <span className="text-xs font-mono text-red-500">19</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">黑天鹅触发点</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🦢</span>
                  <div>
                    <span className="text-xs text-slate-500">触发条件</span>
                    <p className="text-sm text-red-400">{analysis.blackSwan?.trigger}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">发生概率：</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    analysis.blackSwan?.probability === 'high' ? 'bg-red-500/20 text-red-400' :
                    analysis.blackSwan?.probability === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {analysis.blackSwan?.probability === 'high' ? '高' : 
                     analysis.blackSwan?.probability === 'medium' ? '中' : '低'}
                  </span>
                </div>
              </div>
            </section>
            
            {/* 21 战略终局预言 */}
            <section className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/30 overflow-hidden">
              <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20">
                <span className="text-xs font-mono text-amber-500">21</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">战略终局预言</span>
              </div>
              <div className="p-6 text-center">
                <span className="text-4xl mb-4 block">🔮</span>
                <p className="text-lg text-amber-400 font-medium leading-relaxed">
                  {analysis.strategicOutlook}
                </p>
              </div>
            </section>
            
            {/* 分享按钮 */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `【战略研究】${news?.title}\n\n🔮 终局预言：${analysis.strategicOutlook}`
                )
                alert('已复制到剪贴板')
              }}
              className="w-full py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 hover:bg-slate-800 transition-colors"
            >
              📋 复制分享
            </button>
          </div>
        )}
        
        {/* 错误提示 */}
        {error && expanded && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => navigate('/settings')}
              className="mt-3 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm"
            >
              前往设置
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
