import { Outlet, NavLink } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen relative z-10" style={{ background: 'var(--ink)' }}>
      <nav className="border-b border-white/[0.04] px-6 py-3 flex items-center gap-6 max-w-5xl mx-auto">
        <NavLink to="/" className="text-sm font-black italic tracking-tight text-[#e8e4dc]" style={{ fontFamily: "'Playfair Display', serif" }}>
          NB
        </NavLink>
        <NavLink to="/" className={({ isActive }) => `text-[10px] tracking-[0.15em] uppercase transition-colors ${isActive ? 'text-[#c4a144]' : 'text-white/40 hover:text-white/70'}`}>Briefing</NavLink>
        <NavLink to="/settings" className={({ isActive }) => `text-[10px] tracking-[0.15em] uppercase transition-colors ${isActive ? 'text-[#c4a144]' : 'text-white/40 hover:text-white/70'}`}>Settings</NavLink>
        <div className="ml-auto">
          <a href="/admin" className="text-[10px] tracking-[0.15em] uppercase text-white/25 hover:text-white/50 transition-colors">Admin</a>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}
