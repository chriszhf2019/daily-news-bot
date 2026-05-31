import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { phoneLogin, sendCode } = useStore()
  const [mode, setMode] = useState('phone') // phone | wechat
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
      const res = await sendCode(phone)
      if (res.success) {
        setCodeSent(true)
        // 演示版：显示验证码
        if (res.data?.code) alert(`验证码: ${res.data.code}`)
        let sec = 60; setCountdown(sec)
        const timer = setInterval(() => { sec--; setCountdown(sec); if (sec <= 0) clearInterval(timer) }, 1000)
      } else setError(res.message)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!phone || !code) { setError('请填写完整'); return }
    setError(''); setLoading(true)
    try {
      const res = await phoneLogin(phone, code)
      if (res.success) { navigate('/') }
      else setError(res.message)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950">
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 w-full max-w-md backdrop-blur">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-100">NewsBrief</h1>
          <p className="text-slate-500 text-sm mt-2">智能情报简报 · 登录</p>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setMode('phone')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${mode === 'phone' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'}`}>
            📱 手机号登录
          </button>
          <button onClick={() => setMode('wechat')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${mode === 'wechat' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'}`}>
            💬 微信登录
          </button>
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
                <button type="button" onClick={handleSendCode} disabled={loading || countdown > 0} className="px-4 py-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-medium whitespace-nowrap disabled:opacity-50 transition-colors">
                  {countdown > 0 ? `${countdown}s` : codeSent ? '重新发送' : '获取验证码'}
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-1">演示验证码：123456</p>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50">
              {loading ? '登录中...' : '登录 / 注册'}
            </button>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-slate-400 text-sm mb-4">请使用微信扫码登录</p>
            <div className="bg-white w-48 h-48 mx-auto rounded-lg flex items-center justify-center">
              <p className="text-gray-400 text-xs">微信二维码<br/>（需配置微信开放平台）</p>
            </div>
            <p className="text-slate-600 text-xs mt-4">微信登录需在微信开放平台注册应用并配置 OAuth</p>
          </div>
        )}

        <p className="text-center text-slate-600 text-xs mt-6">登录即表示同意服务条款和隐私政策</p>
      </div>
    </div>
  )
}
