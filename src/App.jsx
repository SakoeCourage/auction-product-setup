import { Routes, Route, Link, useLocation } from 'react-router-dom'
import {
  Squares2X2Icon,
  CubeIcon,
} from '@heroicons/react/24/outline'
import Categories from './pages/Categories'
import ProductTypes from './pages/ProductTypes'

function App() {
  const location = useLocation()

  const navLinks = [
    { to: '/', label: 'Categories', icon: Squares2X2Icon },
  ]

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <CubeIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-900 leading-tight">ADB Auction</h1>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-tight">Admin Panel</p>
                </div>
              </Link>

              {/* Divider */}
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />

              {/* Nav Links */}
              <div className="hidden sm:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon
                  const active = isActive(link.to)
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-violet-50 text-violet-700 shadow-sm shadow-violet-500/5'
                          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-violet-600' : ''}`} />
                      {link.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Categories />} />
          <Route path="/categories/:categoryId/types" element={<ProductTypes />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
