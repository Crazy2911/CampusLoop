import { useState, useEffect } from 'react'
import { Routes, Route, Link} from 'react-router-dom'
import Header from './Header'
import Posts from './Posts'
import CreatePost from './CreatePost'
import PostDetails from './PostDetails'

const API_URL =
  'https://6aa2d6b4ccb3db9689a7127d.mockapi.io/posts'



function App() {
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
        const response = await fetch(API_URL, {
          signal: controller.signal,
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error(
            `Could not load posts. Server returned ${response.status}.`
          )
        }

        const data = await response.json()

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
            'Some posts have invalid fields. Check the MockAPI records.'
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
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {loading ? (
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
            <Route path="/" element={<Posts posts={posts} />} />

          <Route
  path="/posts/:id"
  element={
    <PostDetails
      posts={posts}
      onDeleted={handlePostDeleted}
      onUpdated={handlePostUpdated}
    />
  }
/>

            <Route
  path="/create"
  element={<CreatePost onCreated={handlePostCreated} />}
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