import { useState, useEffect } from 'react'
import {
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from 'react-router-dom'

import AuthPage from './AuthPage'
import { supabase } from './supabaseClient'
import Header from './Header'
import Posts from './Posts'
import CreatePost from './CreatePost'
import PostDetails from './PostDetails'



function App() {
  const location = useLocation()

const [session, setSession] = useState(null)
const [authLoading, setAuthLoading] = useState(true)
const [authError, setAuthError] = useState('')

useEffect(() => {
  if (!supabase) {
    setAuthError('Authentication is not configured.')
    setAuthLoading(false)
    return
  }

  let active = true
  let receivedAuthEvent = false

  const { data: { subscription } } =
    supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return

      receivedAuthEvent = true
      setSession(nextSession)
      setAuthLoading(false)
      setAuthError('')
    })

  async function restoreSession() {
    try {
      const { data, error } = await supabase.auth.getSession()

      if (!active || receivedAuthEvent) return
      if (error) throw error

      setSession(data.session)
    } catch {
      if (active && !receivedAuthEvent) {
        setAuthError(
          'Could not restore your login. Try refreshing the page.'
        )
      }
    } finally {
      if (active) setAuthLoading(false)
    }
  }

  restoreSession()

  return () => {
    active = false
    subscription.unsubscribe()
  }
}, [])

const user = session?.user ?? null
const userId = user?.id ?? null

const [authorityResult, setAuthorityResult] = useState(null)
const [authorityRetry, setAuthorityRetry] = useState(0)

useEffect(() => {
  if (!supabase || !userId) {
    setAuthorityResult(null)
    return
  }

  let active = true
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12000)

  setAuthorityResult(null)

  async function checkAuthority() {
    try {
      const { data, error } = await supabase
        .from('campus_authorities')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle()
        .abortSignal(controller.signal)

      if (error) throw error

      if (active) {
        setAuthorityResult({
          userId,
          allowed: Boolean(data),
          error: '',
        })
      }
    } catch {
      if (active) {
        setAuthorityResult({
          userId,
          allowed: false,
          error: 'Could not check authority access.',
        })
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  checkAuthority()

  return () => {
    active = false
    clearTimeout(timeoutId)
    controller.abort()
  }
}, [userId, authorityRetry])

const isAuthority = Boolean(
  userId &&
  authorityResult?.userId === userId &&
  authorityResult.allowed
)

const authorityError =
  userId && authorityResult?.userId === userId
    ? authorityResult.error
    : ''
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  function handlePostCreated(newPost) {
  setPosts((currentPosts) => [
    newPost,
    ...currentPosts.filter(
      (post) => String(post.id) !== String(newPost.id)
    ),
  ])
}
function handlePostDeleted(deletedId) {
  setPosts((currentPosts) =>
    currentPosts.filter(
      (post) => String(post.id) !== String(deletedId)
    )
  )
}
function handlePostUpdated(updatedPost) {
  setPosts((currentPosts) =>
    currentPosts.map((post) =>
      String(post.id) === String(updatedPost.id)
        ? updatedPost
        : post
    )
  )
}

  useEffect(() => {
    const controller = new AbortController()
    let ignoreResult = false
    let timedOut = false

    // Stop an actual request if it takes too long.
    // This does not simulate an API response.
    const timeoutId = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, 12000)

    async function fetchPosts() {
      setLoading(true)
      setError('')

      try {
        if (!supabase) {
  throw new Error('Supabase is not configured.')
}

const { data, error: fetchError } = await supabase
  .from('posts')
  .select('*')
  .order('created_at', { ascending: false })
  .abortSignal(controller.signal)

if (fetchError) {
  throw fetchError
}


        if (!Array.isArray(data)) {
          throw new Error('The API did not return a list of posts.')
        }

        // Ensure records can be displayed by our existing components.
        const validData = data.every((post) => {
          return (
            post !== null &&
            typeof post === 'object' &&
            (typeof post.id === 'string' ||
              typeof post.id === 'number') &&
            ['fix', 'reuse'].includes(post.type) &&
            [
              'title',
              'description',
              'location',
              'category',
              'status',
            ].every((field) => typeof post[field] === 'string')
          )
        })

        if (!validData) {
          throw new Error(
            'Some posts have invalid fields. Check the Supabase records.'
          )
        }

        if (!ignoreResult) {
          setPosts(data)
        }
      } catch (err) {
        if (ignoreResult) {
          return
        }

        if (timedOut) {
          setError(
            'The request took too long. Check your connection and retry.'
          )
        } else if (err instanceof TypeError) {
          setError(
            'Could not reach the server. Check your internet connection and retry.'
          )
        } else {
          setError(err.message || 'Something went wrong loading posts.')
        }
      } finally {
        clearTimeout(timeoutId)

        if (!ignoreResult) {
          setLoading(false)
        }
      }
    }

    fetchPosts()

    return () => {
      ignoreResult = true
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [retryCount])

  return (
    <>
      <Header
  user={user}
  authLoading={authLoading}
  isAuthority={isAuthority}
/>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {authorityError && (
  <div
    role="alert"
    className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
  >
    <p>{authorityError}</p>

    <button
      type="button"
      onClick={() => setAuthorityRetry((count) => count + 1)}
      className="mt-2 min-h-11 px-3 font-semibold underline"
    >
      Retry access check
    </button>
  </div>
)}
  {authError && (
    <p
      role="alert"
      className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
    >
      {authError}
    </p>
  )}
        {location.pathname === '/auth' ? (
  authLoading ? (
    <p role="status">Checking your session…</p>
  ) : user ? (
    <Navigate to="/" replace />
  ) : (
    <AuthPage />
  )
) : loading ? (
          <div
            role="status"
            className="flex items-center gap-3 rounded-xl border border-[#DEE5E0] bg-white p-6"
          >
            <span
              aria-hidden="true"
              className="loading loading-spinner loading-sm"
            />
            <p>Loading campus posts…</p>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-5"
          >
            <h1 className="text-lg font-bold text-red-900">
              We couldn’t load the board
            </h1>

            <p className="mt-2 break-words text-red-800">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                setLoading(true)
                setRetryCount((count) => count + 1)
              }}
              className="nav-link mt-4 min-h-11 rounded-lg bg-[#263F38] px-4 py-2 font-semibold text-white"
            >
              Retry
            </button>
          </div>
        ) : (
          <Routes>
            <Route
  path="/auth"
  element={
    authLoading ? (
      <p role="status">Checking your session…</p>
    ) : user ? (
      <Navigate to="/" replace />
    ) : (
      <AuthPage />
    )
  }
/>
            <Route path="/" element={<Posts posts={posts} />} />

          <Route
  path="/posts/:id"
  element={
    <PostDetails
      key={`${userId ?? 'visitor'}:${location.pathname}`}
      posts={posts}
      user={authLoading ? null : user}
      isAuthority={!authLoading && isAuthority}
      onDeleted={handlePostDeleted}
      onUpdated={handlePostUpdated}
    />
  }
/>

            <Route
  path="/create"
  element={
    authLoading ? (
      <p role="status">Checking your session…</p>
    ) : user ? (
      <CreatePost
        key={user.id}
        user={user}
        onCreated={handlePostCreated}
      />
    ) : (
      <Navigate to="/auth" replace />
    )
  }
/>

            <Route
              path="*"
              element={
                <section>
                  <h1 className="text-2xl font-bold">
                    Page not found
                  </h1>

                  <Link to="/" className="mt-4 inline-block underline">
                    Return to campus board
                  </Link>
                </section>
              }
            />
          </Routes>
        )}
      </main>
    </>
  )
}

export default App