import { useState, useEffect } from 'react'
import useStore from '../store/useStore'
import { adminApi } from '../services/api'

export default function AdminPage() {
  const { isLoggedIn, login, user } = useStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState('dashboard')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Dashboard
  const [dash, setDash] = useState(null)
  // Users
  const [users, setUsers] = useState([])
  // Usage
  const [usage, setUsage] = useState([])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [d, u, g] = await Promise.all([
        adminApi.dashboard().catch(() => null),
        adminApi.listUsers().catch(() => null),
        adminApi.usage().catch(() => null),
      ])
      if (d?.success) setDash(d.data)
      if (u?.success) setUsers(u.data.users)
      if (g?.success) setUsage(g.data.usage)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  useEffect(() => { if (isLoggedIn) { fetchAll(); const iv = setInterval(fetchAll, 30000); return () => clearInterval(iv) } }, [isLoggedIn])

  const handleLogin = async (e) => {
    e.preventDefault(); setError('')
    const res = await login(username, password)
    if (!res.success) setError(res.message || '登录失败')
    else fetchAll()
  }

  const handleApprove = async (userId) => {
    await adminApi.approveUser(userId)
    fetchAll()
  }

  const handleDelete = async (userId) => {
    if (!confirm('确定删除此用户？')) return
    await adminApi.deleteUser(userId)
    fetchAll()
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-sm">
          <h1 className="text-xl font-bold text-slate-100 mb-6">管理员登录</h1>
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">{error}</div>}
          <input value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 mb-3 focus:outline-none focus:border-emerald-500" placeholder="用户名" autoFocus />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 mb-4 focus:outline-none focus:border-emerald-500" placeholder="密码" />
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-medium transition-colors">登录</button>
        </form>
      </div>
    )
  }

  const tabs = [
    { id: 'dashboard', label: '概览', icon: '📊' },
    { id: 'users', label: '用户管理', icon: '👥' },
    { id: 'usage', label: '用量统计', icon: '📈' },
  ]
  const pendingCount = users.filter(u => !u.is_approved).length

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-100">管理后台</h1>
          <button onClick={() => useStore.getState().logout()} className="text-sm text-slate-400 hover:text-slate-200">退出</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700/50'}`}>
              {t.icon} {t.label}
              {t.id === 'users' && pendingCount > 0 && <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
            </button>
          ))}
          <button onClick={fetchAll} className="ml-auto px-4 py-2 bg-slate-800 text-slate-400 rounded-lg text-sm hover:bg-slate-700">{loading ? '刷新中...' : '🔄 刷新'}</button>
        </div>

        {/* Dashboard */}
        {tab === 'dashboard' && dash && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="总用户" value={dash.total_users} color="sky" />
              <StatCard label="已审核" value={dash.approved_users} color="emerald" />
              <StatCard label="待审核" value={dash.pending_users} color="amber" />
              <StatCard label="今日API调用" value={dash.today_api_calls} color="purple" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="累计Token" value={dash.total_tokens?.toLocaleString() || 0} color="amber" />
              <StatCard label="累计费用" value={`¥${(dash.total_cost || 0).toFixed(4)}`} color="rose" />
              <StatCard label="今日Token" value={dash.today_tokens?.toLocaleString() || 0} color="amber" />
              <StatCard label="今日费用" value={`¥${(dash.today_cost || 0).toFixed(4)}`} color="rose" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="新闻总数" value={dash.total_news} color="slate" />
              <StatCard label="分析记录" value={dash.total_analyses} color="slate" />
              <StatCard label="响应时间" value={`${dash.response_time_ms}ms`} color="slate" />
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">用户名</th>
                  <th className="text-left px-4 py-3">邮箱</th>
                  <th className="text-left px-4 py-3">状态</th>
                  <th className="text-left px-4 py-3">登录次数</th>
                  <th className="text-left px-4 py-3">最后登录</th>
                  <th className="text-left px-4 py-3">注册时间</th>
                  <th className="text-right px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-slate-300">{u.id}</td>
                    <td className="px-4 py-3 text-slate-200 font-medium">{u.username}{u.role === 'admin' && <span className="ml-1 text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">管理员</span>}</td>
                    <td className="px-4 py-3 text-slate-400">{u.email || '-'}</td>
                    <td className="px-4 py-3">{u.is_approved ? <span className="text-emerald-400">✓ 已审核</span> : <span className="text-amber-400">⏳ 待审核</span>}</td>
                    <td className="px-4 py-3 text-slate-400">{u.login_count}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{u.last_login ? new Date(u.last_login).toLocaleString('zh-CN') : '-'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString('zh-CN') : '-'}</td>
                    <td className="px-4 py-3 text-right">
                      {!u.is_approved && u.role !== 'admin' && (
                        <>
                          <button onClick={() => handleApprove(u.id)} className="text-emerald-400 hover:text-emerald-300 mr-2">通过</button>
                          <button onClick={() => handleDelete(u.id)} className="text-red-400 hover:text-red-300">删除</button>
                        </>
                      )}
                      {u.is_approved && u.role !== 'admin' && <span className="text-slate-600">—</span>}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-slate-500">暂无用户</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {/* Usage */}
        {tab === 'usage' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="text-left px-4 py-3">用户</th>
                  <th className="text-right px-4 py-3">调用次数</th>
                  <th className="text-right px-4 py-3">Token 消耗</th>
                  <th className="text-right px-4 py-3">费用 (元)</th>
                  <th className="text-right px-4 py-3">平均响应</th>
                  <th className="text-right px-4 py-3">最后调用</th>
                </tr>
              </thead>
              <tbody>
                {usage.map((u, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-slate-200">{u.username}</td>
                    <td className="px-4 py-3 text-right text-slate-300 font-mono">{u.total_calls}</td>
                    <td className="px-4 py-3 text-right text-amber-300 font-mono">{u.total_tokens?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3 text-right text-rose-300 font-mono">¥{(u.total_cost || 0).toFixed(4)}</td>
                    <td className="px-4 py-3 text-right text-slate-400 font-mono">{u.avg_time_ms}ms</td>
                    <td className="px-4 py-3 text-right text-slate-500 text-xs">{u.last_call ? new Date(u.last_call).toLocaleString('zh-CN') : '-'}</td>
                  </tr>
                ))}
                {usage.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-slate-500">暂无数据</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  const colors = {
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
    sky: 'from-sky-500/20 to-sky-500/5 border-sky-500/30',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
    rose: 'from-rose-500/20 to-rose-500/5 border-rose-500/30',
    slate: 'from-slate-500/20 to-slate-500/5 border-slate-500/30',
  }
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-5`}>
      <div className="text-2xl font-bold text-slate-100 font-mono">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  )
}
