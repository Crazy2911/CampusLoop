import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

function AuthPage() {
  const navigate = useNavigate()
  const submitting = useRef(false)

  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    if (submitting.current) return

    setError('')
    setMessage('')

    if (!supabase) {
      setError('Authentication is not configured.')
      return
    }

    submitting.current = true
    setBusy(true)

    try {
      const credentials = {
        email: email.trim(),
        password,
      }

      const { data, error: authError } = isSignup
        ? await supabase.auth.signUp(credentials)
        : await supabase.auth.signInWithPassword(credentials)

      if (authError) throw authError

      setPassword('')

      if (data.session) {
        navigate('/', { replace: true })
      } else if (isSignup) {
        setMessage(
          'Check your email for a confirmation link. Confirm your email, then return here to sign in.'
        )
      } else {
        setError('No session was created. Please try signing in again.')
      }
    } catch (err) {
      setError(
        err.message || 'Unable to connect. Please try again.'
      )
    } finally {
      submitting.current = false
      setBusy(false)
    }
  }

  function switchMode() {
    setIsSignup((current) => !current)
    setPassword('')
    setError('')
    setMessage('')
  }

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-[#DEE5E0] bg-white p-5 sm:p-8">
      <h1 className="text-2xl font-bold">
        {isSignup ? 'Join CampusLoop' : 'Welcome back'}
      </h1>

      <p className="mt-2 text-sm leading-relaxed">
        Sign in to create posts and manage your own listings.
        Everyone can browse the campus board.
      </p>

      <form
        onSubmit={handleSubmit}
        aria-busy={busy}
        className="mt-6"
      >
        <fieldset disabled={busy} className="space-y-4">
          <div>
            <label
              htmlFor="auth-email"
              className="mb-2 block text-sm font-semibold"
            >
              Email address
            </label>

            <input
              id="auth-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input input-bordered min-h-11 w-full min-w-0"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="mb-2 block text-sm font-semibold"
            >
              Password
            </label>

            <input
              id="auth-password"
              name="password"
              type="password"
              autoComplete={
                isSignup ? 'new-password' : 'current-password'
              }
              required
              minLength={isSignup ? 8 : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-describedby={isSignup ? 'password-hint' : undefined}
              className="input input-bordered min-h-11 w-full min-w-0"
            />

            {isSignup && (
              <p id="password-hint" className="mt-2 text-sm">
                Use at least 8 characters.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="nav-link min-h-11 w-full rounded-lg bg-[#263F38] px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {busy
              ? 'Please wait…'
              : isSignup
                ? 'Create account'
                : 'Sign in'}
          </button>
        </fieldset>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-4 break-words rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="mt-4 rounded-lg border border-[#DEE5E0] p-3 text-sm"
        >
          {message}
        </p>
      )}

      <button
        type="button"
        disabled={busy}
        onClick={switchMode}
        className="mt-4 min-h-11 w-full rounded-lg px-3 py-2 text-sm font-semibold underline disabled:opacity-60"
      >
        {isSignup
          ? 'Already have an account? Sign in'
          : 'New here? Create an account'}
      </button>

      <Link
        to="/"
        className="mt-2 inline-flex min-h-11 items-center underline"
      >
        Continue browsing
      </Link>
    </section>
  )
}

export default AuthPage