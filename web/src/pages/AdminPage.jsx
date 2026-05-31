import { useState, useEffect } from 'react'
import useStore from '../store/useStore'

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1'

export default function AdminPage() {
  const { isLoggedIn, login } = useStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const res = await fetch(`${API_BASE}/stats`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      const data = await res.json()
      if (data.success) setStats(data.data)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    const res = await login(username, password)
    if (!res.success) setError(res.message || '登录失败')
    else fetchStats()
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-sm">
          <h1 className="text-xl font-bold text-slate-100 mb-6">管理员登录</h1>
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}
          <input value={username} onChange={e => setUsername(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 mb-3 focus:outline-none focus:border-emerald-500"
            placeholder="用户名" autoFocus />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 mb-4 focus:outline-none focus:border-emerald-500"
            placeholder="密码" />
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-medium transition-colors">
            登录
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-100 mb-8">管理后台</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard label="新闻总数" value={stats?.news_count ?? '—'} color="emerald" />
          <StatCard label="注册用户" value={stats?.user_count ?? '—'} color="purple" />
          <StatCard label="分析记录" value={stats?.analysis_count ?? '—'} color="amber" />
          <StatCard label="数据库状态" value={stats?.database ?? '—'} color="sky" />
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-sm font-medium text-slate-400 mb-4">系统状态</h2>
          <div className="space-y-3 text-sm">
            <StatusRow label="API 版本" value="v1.0.0" />
            <StatusRow label="速率限制" value="已启用" />
            <StatusRow label="缓存" value="已启用 (Cache-Control + ETag)" />
            <StatusRow label="数据库" value={stats?.database || '检测中'} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  const colors = {
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
    sky: 'from-sky-500/20 to-sky-500/5 border-sky-500/30',
  }
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-6`}>
      <div className="text-3xl font-bold text-slate-100 font-mono">{value}</div>
      <div className="text-xs text-slate-400 mt-2">{label}</div>
    </div>
  )
}

function StatusRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-slate-400">{label}</span>
      <span className="text-slate-200 font-medium">{value}</span>
    </div>
  )
}
