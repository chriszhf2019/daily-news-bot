import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  const handleSendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) { setError('请输入有效的手机号'); return }
    setError(''); setLoading(true)
    try {
      const res = await authApi.sendCode(phone)
      if (res.success) {
        setCodeSent(true)
        alert('演示验证码：123456')
        let n = 60; setCountdown(n)
        const t = setInterval(() => { n--; setCountdown(n); if (n <= 0) clearInterval(t) }, 1000)
      } else setError(res.message || '发送失败')
    } catch (e) { setError(e.message || '网络错误') }
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!phone || !code) { setError('请填写完整'); return }
    setError(''); setLoading(true)
    try {
      const res = await authApi.phoneLogin(phone, code)
      if (res.success) {
        if (res.data?.access_token) {
          const { setAuthToken } = await import('../services/api')
          setAuthToken(res.data.access_token)
        }
        navigate('/')
      } else setError(res.message || '登录失败')
    } catch (e) { setError(e.message || '网络错误') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 w-full max-w-md backdrop-blur">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-100">NewsBrief</h1>
          <p className="text-slate-500 text-sm mt-2">智能情报简报 · 登录</p>
        </div>
        <div className="flex gap-2 mb-6">
          <button onClick={() => setMode('phone')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${mode === 'phone' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'}`}>手机号登录</button>
          <button onClick={() => setMode('wechat')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${mode === 'wechat' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'}`}>微信登录</button>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
        {mode === 'phone' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">手机号</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500" placeholder="输入手机号" type="tel" maxLength={11} />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">验证码</label>
              <div className="flex gap-2">
                <input value={code} onChange={e => setCode(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500" placeholder="输入验证码" maxLength={6} />
                <button type="button" onClick={handleSendCode} disabled={loading || countdown > 0} className="px-4 py-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-medium whitespace-nowrap disabled:opacity-50">
                  {countdown > 0 ? `${countdown}s` : codeSent ? '重新发送' : '获取验证码'}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">演示验证码：123456</p>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-medium disabled:opacity-50">
              {loading ? '登录中...' : '登录 / 注册'}
            </button>
          </form>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">微信登录需在微信内打开</p>
          </div>
        )}
      </div>
    </div>
  )
}
