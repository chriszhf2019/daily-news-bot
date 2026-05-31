import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'

const navItems = [
  { path: '/', label: '今日情报', icon: '📰' },
  { path: '/settings', label: '设置', icon: '⚙️' }
]

export default function Layout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* 侧边栏 */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-slate-800/50 border-r border-slate-700/50 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <span className="font-bold text-lg bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                NewsBrief
              </span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        
        {/* 导航 */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                ${isActive 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}
              `}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        
        {/* 底部信息 */}
        {sidebarOpen && (
          <div className="p-4 border-t border-slate-700/50">
            <div className="text-xs text-slate-500">
              <p>智能情报简报系统</p>
              <p className="mt-1">v1.0.0</p>
            </div>
          </div>
        )}
      </aside>
      
      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
