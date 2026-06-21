import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/auth.js'

export default function AuthPage() {
  const navigate = useNavigate()
  const { user, login, register } = useAuthStore()

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (user) {
    return (
      <div className="min-h-full flex items-center justify-center px-6 py-10">
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-6 md:p-8 max-w-sm w-full text-center">
          <div className="text-3xl mb-3">👋</div>
          <h1 className="text-lg md:text-xl font-semibold text-white mb-2">
            {user.name ? `你好，${user.name}` : '已登录'}
          </h1>
          <p className="text-slate-400 text-sm mb-5">{user.email}</p>
          <Link to="/" className="touch-target inline-flex h-11 items-center justify-center px-5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold active:scale-[0.98] transition-transform">
            返回简报
          </Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') {
        await login(email.trim(), password)
      } else {
        await register(email.trim(), password, name.trim())
      }
      navigate('/', { replace: true })
    } catch (err) {
      setError(err?.message || (mode === 'login' ? '登录失败，请检查账号/密码' : '注册失败'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center px-5 py-10 animate-fadeIn">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xl font-bold shadow-lg shadow-purple-900/40 mb-3">
            点
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            {mode === 'login' ? '登录点透' : '创建账号'}
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">把海量信息变成你能判断的情报</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 md:p-6">
          {/* 模式切换 */}
          <div className="flex rounded-xl bg-slate-800/70 p-1">
            <button type="button" onClick={() => setMode('login')}
              className={`flex-1 touch-target h-10 rounded-lg text-sm font-medium transition-colors
                ${mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'}`}>
              登录
            </button>
            <button type="button" onClick={() => setMode('register')}
              className={`flex-1 touch-target h-10 rounded-lg text-sm font-medium transition-colors
                ${mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'}`}>
              注册
            </button>
          </div>

          {mode === 'register' && (
            <Field label="昵称" value={name} onChange={setName} placeholder="例如：小明" />
          )}
          <Field label="邮箱" value={email} onChange={setEmail} placeholder="name@example.com" type="email" />
          <Field label="密码" value={password} onChange={setPassword} placeholder="至少 6 位" secure />

          {error && (
            <div className="text-rose-200 text-sm bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
              {error}
            </div>
          )}

          <button type="submit" disabled={busy}
            className="touch-target w-full h-11 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60 shadow-lg shadow-purple-900/30">
            {busy && <span className="loader" />}
            <span>{busy ? '处理中…' : (mode === 'login' ? '登录' : '创建账号')}</span>
          </button>

          <div className="text-center text-xs text-slate-500 pt-1">
            {mode === 'login' ? '还没有账号？' : '已有账号？'}
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className="ml-1 text-blue-300 hover:text-blue-200 underline underline-offset-2">
              {mode === 'login' ? '注册' : '登录'}
            </button>
          </div>

          <Link to="/"
            className="touch-target block w-full h-11 rounded-2xl bg-slate-800/70 text-slate-200 text-sm font-medium flex items-center justify-center hover:bg-slate-800 active:scale-[0.98] transition-transform">
            返回首页
          </Link>
        </form>
      </div>
    </div>
  )
}

function Field({ label, placeholder, value, onChange, type = 'text', secure }) {
  const [show, setShow] = useState(false)
  const inputType = secure ? (show ? 'text' : 'password') : type
  return (
    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1.5">{label}</label>
      <div className="relative flex items-center">
        <input type={inputType} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
               className="w-full px-3 py-2.5 rounded-xl bg-slate-800/70 border border-slate-700/70 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500/70" />
        {secure && (
          <button type="button" onClick={() => setShow(!show)}
            className="touch-target absolute right-1 h-10 px-3 rounded-xl text-xs text-slate-400 hover:text-white">
            {show ? '隐藏' : '显示'}
          </button>
        )}
      </div>
    </div>
  )
}
