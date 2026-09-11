import { useState, useRef } from 'react'

const API_URL =
  'https://6aa2d6b4ccb3db9689a7127d.mockapi.io/posts'

function StatusEditor({ post, onUpdated }) {
  const [selectedStatus, setSelectedStatus] = useState(post.status)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const submitting = useRef(false)

  const statuses =
    post.type === 'fix'
      ? ['Reported', 'In progress', 'Resolved']
      : ['Available', 'Reserved', 'Collected']

  const hasChanged = selectedStatus !== post.status

  async function handleSubmit(event) {
    event.preventDefault()

    if (submitting.current || !hasChanged) return

    if (!statuses.includes(selectedStatus)) {
      setError('Choose a valid status.')
      return
    }

    submitting.current = true
    setSaving(true)
    setError('')
    setSuccess('')

    const controller = new AbortController()

    const timeoutId = setTimeout(() => {
      controller.abort()
    }, 12000)

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(post.id)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            status: selectedStatus,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? 'This post no longer exists. Refresh the board.'
            : `The server returned ${response.status}.`
        )
      }

      const savedPost = await response.json()

      if (
        !savedPost ||
        String(savedPost.id) !== String(post.id) ||
        savedPost.status !== selectedStatus
      ) {
        throw new Error(
          'The server did not confirm the requested status.'
        )
      }

      onUpdated({
        ...post,
        status: savedPost.status,
      })

      setSuccess('Status updated.')
    } catch (err) {
      setError(
        err.name === 'AbortError'
          ? 'The request timed out. The update was not confirmed. Retry to set the same status.'
          : err instanceof TypeError
            ? 'Could not confirm the update. Check your connection and retry.'
            : err.message
      )
    } finally {
      clearTimeout(timeoutId)
      submitting.current = false
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={saving}
      className="mt-5 rounded-lg border border-[#DEE5E0] bg-[#F6F8F7] p-4"
    >
      <label
        htmlFor="post-status"
        className="block text-sm font-semibold"
      >
        Update status
      </label>

      <p className="mt-1 text-sm text-[#596B62]">
        Current status: {post.status}
      </p>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <select
          id="post-status"
          value={selectedStatus}
          disabled={saving}
          onChange={(event) => {
            setSelectedStatus(event.target.value)
            setError('')
            setSuccess('')
          }}
          className="select min-h-11 w-full min-w-0 rounded-lg border-[#BBCBC1] bg-white text-base sm:flex-1"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={saving || !hasChanged}
          className="nav-link flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#263F38] px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving && (
            <span
              aria-hidden="true"
              className="loading loading-spinner loading-sm"
            />
          )}

          {saving ? 'Saving…' : 'Save status'}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 text-sm leading-relaxed text-red-800"
        >
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="mt-3 text-sm text-[#147765]">
          {success}
        </p>
      )}
    </form>
  )
}

export default StatusEditor