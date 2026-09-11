import { Link, NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

function Header() {
  function navigationClass({ isActive }) {
    return `nav-link flex min-h-11 items-center justify-center
      rounded-lg px-3 py-2 text-sm font-semibold ${
        isActive
          ? 'bg-[#263F38] text-white'
          : 'bg-[#F3F6F4] text-[#435E50]'
      }`
  }

  return (
    <header className="border-b border-[#DEE5E0] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="min-w-0 text-2xl font-bold tracking-tight text-[#263F38]"
          >
            Campus<span className="text-[#147765]">Loop</span>
          </Link>

          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden rounded-full bg-[#EDF3EF] px-3 py-1 text-xs font-medium text-[#435E50] sm:inline">
              Campus community
            </span>

            <ThemeToggle />
          </div>
        </div>

        <nav
          aria-label="Main navigation"
          className="mt-4 grid grid-cols-2 gap-2"
        >
          <NavLink to="/" end className={navigationClass}>
            Campus board
          </NavLink>

          <NavLink to="/create" className={navigationClass}>
            Create post
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Header