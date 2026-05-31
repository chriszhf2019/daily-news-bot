import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { testConnection } from '../services/deepseekApi'

const PERSONA_OPTIONS = [
  { id: 'analyst', name: '专业分析师', icon: '📊', desc: '数据驱动，理性分析' },
  { id: 'geek', name: '毒舌极客', icon: '🤓', desc: '犀利点评，直击要害' },
  { id: 'mentor', name: '耐心导师', icon: '👨‍🏫', desc: '通俗易懂，循循善诱' }
]

const THEME_OPTIONS = [
  { id: 'deep-blue', name: '深邃蓝', color: '#0F172A' },
  { id: 'geek-black', name: '极客黑', color: '#020617' },
  { id: 'eye-green', name: '护眼绿', color: '#064E3B' }
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const { apiConfig, setApiConfig } = useStore()
  
  const [deepseekKey, setDeepseekKey] = useState(apiConfig.deepseekApiKey || '')
  const [deepseekEndpoint, setDeepseekEndpoint] = useState(apiConfig.deepseekEndpoint || 'https://api.deepseek.com/v1')
  const [newsDataKey, setNewsDataKey] = useState(apiConfig.newsDataApiKey || '')
  const [showDeepseekKey, setShowDeepseekKey] = useState(false)
  const [showNewsDataKey, setShowNewsDataKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  
  const [persona, setPersona] = useState('analyst')
  const [theme, setTheme] = useState('deep-blue')
  
  const handleSaveDeepseek = () => {
    setApiConfig({
      deepseekApiKey: deepseekKey.trim(),
      deepseekEndpoint: deepseekEndpoint.trim()
    })
    alert('DeepSeek 配置已保存')
  }
  
  const handleSaveNewsData = () => {
    setApiConfig({
      newsDataApiKey: newsDataKey.trim()
    })
    alert('NewsData.io 配置已保存')
  }
  
  const handleTestConnection = async () => {
    if (!deepseekKey.trim()) {
      alert('请先输入 API Key')
      return
    }
    
    setTesting(true)
    setTestResult(null)
    
    try {
      const result = await testConnection(deepseekKey.trim(), deepseekEndpoint.trim())
      setTestResult(result)
    } catch (e) {
      setTestResult({ success: false, message: e.message })
    } finally {
      setTesting(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* 头部 */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
            >
              ← 返回
            </button>
            <h1 className="text-lg font-bold text-slate-200">⚙️ 设置</h1>
          </div>
        </div>
      </header>
      
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* DeepSeek API 配置 */}
        <section className="bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-3 bg-slate-800/50 border-b border-slate-700">
            <h2 className="text-sm font-semibold text-slate-200">🤖 DeepSeek API 配置</h2>
            <p className="text-xs text-slate-500 mt-0.5">用于新闻分析和智能解读</p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">API Key</label>
              <div className="flex gap-2">
                <input
                  type={showDeepseekKey ? 'text' : 'password'}
                  value={deepseekKey}
                  onChange={(e) => setDeepseekKey(e.target.value)}
                  placeholder="sk-..."
                  className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => setShowDeepseekKey(!showDeepseekKey)}
                  className="px-3 py-2 bg-slate-700 rounded-lg text-slate-400 hover:bg-slate-600 transition-colors"
                >
                  {showDeepseekKey ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">API Endpoint</label>
              <input
                type="text"
                value={deepseekEndpoint}
                onChange={(e) => setDeepseekEndpoint(e.target.value)}
                placeholder="https://api.deepseek.com/v1"
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                {testing ? '测试中...' : '🔗 测试连接'}
              </button>
              <button
                onClick={handleSaveDeepseek}
                className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors"
              >
                💾 保存配置
              </button>
            </div>
            
            {testResult && (
              <div className={`p-3 rounded-lg text-sm ${
                testResult.success 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}>
                {testResult.success ? '✓ 连接成功' : `✗ ${testResult.message}`}
              </div>
            )}
          </div>
        </section>

        {/* NewsData.io API 配置 */}
        <section className="bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-3 bg-slate-800/50 border-b border-slate-700">
            <h2 className="text-sm font-semibold text-slate-200">📰 NewsData.io API 配置</h2>
            <p className="text-xs text-slate-500 mt-0.5">用于获取真实新闻数据</p>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">API Key</label>
              <div className="flex gap-2">
                <input
                  type={showNewsDataKey ? 'text' : 'password'}
                  value={newsDataKey}
                  onChange={(e) => setNewsDataKey(e.target.value)}
                  placeholder="pub_..."
                  className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => setShowNewsDataKey(!showNewsDataKey)}
                  className="px-3 py-2 bg-slate-700 rounded-lg text-slate-400 hover:bg-slate-600 transition-colors"
                >
                  {showNewsDataKey ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            
            <button
              onClick={handleSaveNewsData}
              className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
            >
              💾 保存配置
            </button>
            
            <p className="text-xs text-slate-500">
              💡 如未配置，将使用 RSS 源获取新闻
            </p>
          </div>
        </section>
        
        {/* AI 人设选择 */}
        <section className="bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-3 bg-slate-800/50 border-b border-slate-700">
            <h2 className="text-sm font-semibold text-slate-200">🎭 AI 人设</h2>
            <p className="text-xs text-slate-500 mt-0.5">选择 AI 的解读风格</p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 gap-3">
              {PERSONA_OPTIONS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPersona(p.id)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    persona === p.id
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span className="text-2xl block mb-1">{p.icon}</span>
                  <span className="text-xs font-medium block">{p.name}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
        
        {/* 主题选择 */}
        <section className="bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-3 bg-slate-800/50 border-b border-slate-700">
            <h2 className="text-sm font-semibold text-slate-200">🎨 主题颜色</h2>
          </div>
          <div className="p-5">
            <div className="flex gap-3">
              {THEME_OPTIONS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    theme === t.id
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <span 
                    className="w-4 h-4 rounded-full border border-slate-600"
                    style={{ backgroundColor: t.color }}
                  />
                  <span className="text-sm text-slate-300">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
        
        {/* 关于 */}
        <section className="bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-3 bg-slate-800/50 border-b border-slate-700">
            <h2 className="text-sm font-semibold text-slate-200">ℹ️ 关于</h2>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">版本</span>
              <span className="text-slate-300">1.0.0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">技术栈</span>
              <span className="text-slate-300">React + Vite + TailwindCSS</span>
            </div>
            <div className="pt-3 border-t border-slate-700">
              <p className="text-xs text-slate-500 text-center">
                📰 新闻简报 - 让信息更有价值
              </p>
            </div>
          </div>
        </section>
        
        {/* 危险操作 */}
        <section className="bg-red-500/5 rounded-xl border border-red-500/20 overflow-hidden">
          <div className="px-5 py-3 bg-red-500/10 border-b border-red-500/20">
            <h2 className="text-sm font-semibold text-red-400">⚠️ 危险操作</h2>
          </div>
          <div className="p-5">
            <button
              onClick={() => {
                if (confirm('确定要清除所有本地数据吗？此操作不可撤销。')) {
                  localStorage.clear()
                  window.location.reload()
                }
              }}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
            >
              🗑️ 清除所有数据
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
