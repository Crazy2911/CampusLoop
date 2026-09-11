import { useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { supabase } from './supabaseClient'

function Header({ user, authLoading ,isAuthority }) {
  const navigate = useNavigate()
  const signingOut = useRef(false)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function navigationClass({ isActive }) {
    return `nav-link flex min-h-11 items-center justify-center
      rounded-lg px-3 py-2 text-sm font-semibold ${
        isActive
          ? 'bg-[#263F38] text-white'
          : 'bg-[#F3F6F4] text-[#435E50]'
      }`
  }

  async function handleSignOut() {
    if (signingOut.current || !supabase) return

    signingOut.current = true
    setBusy(true)
    setError('')

    try {
      const { error: signOutError } =
        await supabase.auth.signOut({ scope: 'local' })

      if (signOutError) throw signOutError

      navigate('/', { replace: true })
    } catch {
      setError('Could not sign out. Please try again.')
    } finally {
      signingOut.current = false
      setBusy(false)
    }
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

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {authLoading ? (
            <p role="status" className="text-sm">
              Checking session…
            </p>
          ) : user ? (
            <>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
  <p className="min-w-0 break-all text-sm">
    Signed in as {user.email}
  </p>

  {isAuthority && (
    <span className="rounded-full bg-[#E7F3EE] px-3 py-1 text-xs font-semibold text-[#147765]">
      Campus authority
    </span>
  )}
</div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={busy}
                className="nav-link min-h-11 rounded-lg bg-[#F3F6F4] px-3 py-2 text-sm font-semibold text-[#435E50] disabled:opacity-60"
              >
                {busy ? 'Signing out…' : 'Sign out'}
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="nav-link inline-flex min-h-11 items-center rounded-lg bg-[#F3F6F4] px-3 py-2 text-sm font-semibold text-[#435E50]"
            >
              Sign in / Join
            </Link>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}

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