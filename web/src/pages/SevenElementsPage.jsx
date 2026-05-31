import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { analyzeSevenElements } from '../services/deepseekApi'

export default function SevenElementsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { newsData, apiConfig } = useStore()
  
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState('')
  
  // 查找新闻
  useEffect(() => {
    const found = newsData.find(n => String(n.id) === String(id))
    if (found) {
      setNews(found)
      startAnalysis(found)
    } else {
      setError('新闻不存在')
      setLoading(false)
    }
  }, [id, newsData])
  
  // 开始分析
  const startAnalysis = async (newsItem) => {
    if (!apiConfig.deepseekApiKey) {
      setError('请先在设置页面配置 DeepSeek API Key')
      setLoading(false)
      return
    }
    
    try {
      const result = await analyzeSevenElements(
        apiConfig.deepseekApiKey,
        apiConfig.deepseekEndpoint,
        newsItem
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
      <div className="min-h-screen bg-audit-bg flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl mb-4 block">⚠️</span>
          <p className="text-slate-400">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* 头部 */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur border-b border-emerald-500/20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              ← 返回
            </button>
            <div>
              <h1 className="text-lg font-bold text-emerald-400">🔍 七要素审计</h1>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{news?.title}</p>
            </div>
          </div>
        </div>
      </header>
      
      {/* 内容 */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 mt-4">AI 正在审计分析...</p>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            {/* 01 证据链审计 */}
            <section className="bg-slate-800/30 rounded-xl border border-emerald-500/20 overflow-hidden">
              <div className="px-5 py-3 bg-emerald-500/10 border-b border-emerald-500/20">
                <span className="text-xs font-mono text-emerald-500">01</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">证据链审计</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl font-bold font-mono text-emerald-400">
                    {analysis.audit01?.score || 0}
                  </div>
                  <div className="text-xs text-slate-500">一致性评分</div>
                </div>
                <div className="space-y-2">
                  {analysis.audit01?.verifiedFacts?.map((fact, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-emerald-400">✓</span>
                      <span className="text-slate-300">{fact}</span>
                    </div>
                  ))}
                  {analysis.audit01?.conflicts?.map((conflict, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-400">⚠</span>
                      <span className="text-slate-400">{conflict}</span>
                    </div>
                  ))}
                </div>
                {analysis.audit01?.verdict && (
                  <p className="mt-4 text-sm text-slate-400 italic border-l-2 border-emerald-500/50 pl-3">
                    {analysis.audit01.verdict}
                  </p>
                )}
              </div>
            </section>
            
            {/* 02 共识与冲突 */}
            <section className="bg-slate-800/30 rounded-xl border border-emerald-500/20 overflow-hidden">
              <div className="px-5 py-3 bg-emerald-500/10 border-b border-emerald-500/20">
                <span className="text-xs font-mono text-emerald-500">02</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">共识与冲突</span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-emerald-400 mb-2">✓ 共识</div>
                    {analysis.audit02?.consensus?.map((item, i) => (
                      <div key={i} className="text-sm text-slate-300 mb-1">• {item}</div>
                    ))}
                  </div>
                  <div>
                    <div className="text-xs text-amber-400 mb-2">⚠ 漏洞</div>
                    {analysis.audit02?.gaps?.map((item, i) => (
                      <div key={i} className="text-sm text-slate-400 mb-1">• {item}</div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${analysis.audit02?.alignment || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono text-emerald-400">
                    {analysis.audit02?.alignment || 0}%
                  </span>
                </div>
              </div>
            </section>
            
            {/* 03 原子事实清单 */}
            <section className="bg-slate-800/30 rounded-xl border border-emerald-500/20 overflow-hidden">
              <div className="px-5 py-3 bg-emerald-500/10 border-b border-emerald-500/20">
                <span className="text-xs font-mono text-emerald-500">03</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">原子事实清单</span>
              </div>
              <div className="p-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-500 border-b border-slate-700">
                      <th className="text-left py-2">项目</th>
                      <th className="text-left py-2">数据</th>
                      <th className="text-right py-2">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.audit03?.keyData?.map((item, i) => (
                      <tr key={i} className="border-b border-slate-700/50">
                        <td className="py-2 text-slate-300">{item.item}</td>
                        <td className="py-2 font-mono text-emerald-400">{item.value}</td>
                        <td className="py-2 text-right">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            item.status === 'verified' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {item.status === 'verified' ? '已核实' : '待核实'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            
            {/* 04 底层原理 */}
            <section className="bg-slate-800/30 rounded-xl border border-emerald-500/20 overflow-hidden">
              <div className="px-5 py-3 bg-emerald-500/10 border-b border-emerald-500/20">
                <span className="text-xs font-mono text-emerald-500">04</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">底层原理审计</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 flex-wrap">
                  {analysis.audit04?.logicPath?.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="px-3 py-1.5 bg-slate-700/50 rounded text-sm text-slate-300">
                        {step}
                      </span>
                      {i < (analysis.audit04?.logicPath?.length || 0) - 1 && (
                        <span className="text-emerald-500">→</span>
                      )}
                    </div>
                  ))}
                </div>
                {analysis.audit04?.glossary && (
                  <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-xs text-slate-500">术语解释：</span>
                    <span className="text-sm text-emerald-400 ml-2">{analysis.audit04.glossary.term}</span>
                    <span className="text-sm text-slate-400 ml-2">- {analysis.audit04.glossary.explain}</span>
                  </div>
                )}
              </div>
            </section>
            
            {/* 05 证伪预警 */}
            <section className="bg-slate-800/30 rounded-xl border border-red-500/20 overflow-hidden">
              <div className="px-5 py-3 bg-red-500/10 border-b border-red-500/20">
                <span className="text-xs font-mono text-red-500">05</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">证伪预警</span>
              </div>
              <div className="p-5">
                {analysis.audit05?.redlines?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      item.level === 'high' ? 'bg-red-500/20 text-red-400' :
                      item.level === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {item.level === 'high' ? '高危' : item.level === 'medium' ? '中危' : '低危'}
                    </span>
                    <span className="text-sm text-slate-300">{item.point}</span>
                  </div>
                ))}
                {analysis.audit05?.impact && (
                  <p className="mt-3 text-xs text-red-400/80">{analysis.audit05.impact}</p>
                )}
              </div>
            </section>
            
            {/* 06 最终鉴定 */}
            <section className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-xl border border-emerald-500/30 overflow-hidden">
              <div className="px-5 py-3 bg-emerald-500/10 border-b border-emerald-500/20">
                <span className="text-xs font-mono text-emerald-500">06</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">最终情报鉴定</span>
              </div>
              <div className="p-5 text-center">
                <div className="text-6xl font-bold font-mono text-emerald-400 mb-2">
                  {analysis.audit06?.finalScore || 0}
                </div>
                <div className="text-amber-400 text-lg mb-3">
                  {'★'.repeat(analysis.audit06?.actionStar || 0)}
                  {'☆'.repeat(5 - (analysis.audit06?.actionStar || 0))}
                </div>
                <p className="text-sm text-slate-300">{analysis.audit06?.verdictText}</p>
              </div>
            </section>
            
            {/* 07 时间轴 */}
            <section className="bg-slate-800/30 rounded-xl border border-emerald-500/20 overflow-hidden">
              <div className="px-5 py-3 bg-emerald-500/10 border-b border-emerald-500/20">
                <span className="text-xs font-mono text-emerald-500">07</span>
                <span className="ml-2 text-sm font-semibold text-slate-200">情报演进时间轴</span>
              </div>
              <div className="p-5">
                <div className="relative pl-6 border-l-2 border-emerald-500/30 space-y-6">
                  {analysis.audit07?.map((item, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[29px] w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#0F172A]"></div>
                      <div className="text-xs text-emerald-400 mb-1">{item.phase} · {item.time}</div>
                      <div className="text-sm text-slate-300">{item.event}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  )
}
