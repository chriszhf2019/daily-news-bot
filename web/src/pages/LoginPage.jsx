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
    if (!/^1[3-9]\d{9}$/.test(phone)) { setError('Valid phone number required'); return }
    setError(''); setLoading(true)
    try {
      const res = await authApi.sendCode(phone)
      if (res.success) { setCodeSent(true); alert(`Demo code: 123456`); let n = 60; setCountdown(n); const t = setInterval(() => { n--; setCountdown(n); if (n <= 0) clearInterval(t) }, 1000) }
      else setError(res.message || 'Failed')
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!phone || !code) { setError('Complete all fields'); return }
    setError(''); setLoading(true)
    try {
      const res = await authApi.phoneLogin(phone, code)
      if (res.success) { if (res.data?.access_token) { const { setAuthToken } = await import('../services/api'); setAuthToken(res.data.access_token) }; navigate('/') }
      else setError(res.message || 'Login failed')
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: 'var(--ink)' }}>
      <div className="w-full max-w-md mx-4 relative z-10">
        {/* Brand mark */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black italic tracking-tight text-[#e8e4dc]" style={{ fontFamily: "'Playfair Display', serif" }}>
            NewsBrief
          </h1>
          <p className="text-xs tracking-[0.25em] uppercase mt-3" style={{ color: 'rgba(232,228,220,0.3)' }}>
            Intelligence Platform
          </p>
        </div>

        {/* Card */}
        <div className="border border-white/[0.06] rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.02)' }}>
          {/* Mode tabs */}
          <div className="flex mb-8 border-b border-white/[0.06]">
            <button onClick={() => setMode('phone')}
              className={`flex-1 pb-3 text-xs tracking-[0.15em] uppercase transition-all ${mode === 'phone' ? 'text-[#c4a144] border-b-2 border-[#c4a144]' : 'text-white/30 hover:text-white/50'}`}>
              Phone
            </button>
            <button onClick={() => setMode('wechat')}
              className={`flex-1 pb-3 text-xs tracking-[0.15em] uppercase transition-all ${mode === 'wechat' ? 'text-[#c4a144] border-b-2 border-[#c4a144]' : 'text-white/30 hover:text-white/50'}`}>
              WeChat
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg text-xs border border-[#e05555]/20 text-[#e05555]" style={{ background: 'rgba(224,85,85,0.06)' }}>{error}</div>
          )}

          {mode === 'phone' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase block mb-2" style={{ color: 'rgba(232,228,220,0.35)' }}>Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-[#e8e4dc] outline-none focus:border-[#c4a144]/30 transition-all placeholder:text-white/15"
                  placeholder="+86" type="tel" maxLength={11} />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase block mb-2" style={{ color: 'rgba(232,228,220,0.35)' }}>Verification Code</label>
                <div className="flex gap-2">
                  <input value={code} onChange={e => setCode(e.target.value)}
                    className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-[#e8e4dc] outline-none focus:border-[#c4a144]/30 transition-all placeholder:text-white/15"
                    placeholder="······" maxLength={6} />
                  <button type="button" onClick={handleSendCode} disabled={loading || countdown > 0}
                    className="px-4 py-3 border border-[#c4a144]/20 text-[#c4a144] text-xs tracking-wider uppercase rounded-lg hover:bg-[#c4a144]/10 disabled:opacity-30 transition-all whitespace-nowrap">
                    {countdown > 0 ? `${countdown}s` : codeSent ? 'Resend' : 'Send'}
                  </button>
                </div>
                <p className="text-[10px] mt-2" style={{ color: 'rgba(232,228,220,0.2)' }}>Demo code: 123456</p>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-lg text-sm tracking-[0.15em] uppercase font-medium transition-all"
                style={{ background: '#c4a144', color: 'var(--ink)' }}>
                {loading ? 'Signing in...' : 'Sign In / Register'}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: 'rgba(232,228,220,0.4)' }}>WeChat login requires the app to be registered on WeChat Open Platform.</p>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] mt-6 tracking-[0.1em]" style={{ color: 'rgba(232,228,220,0.2)' }}>
          By continuing, you agree to our Terms and Privacy Policy
        </p>
      </div>
    </div>
  )
}
