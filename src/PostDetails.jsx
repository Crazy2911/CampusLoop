import PostImage from './PostImage'
import EditPost from './EditPost'
import StatusEditor from './StatusEditor'
import { useState, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

function PostDetails({
  posts,
  user,
  isAuthority,
  onDeleted,
  onUpdated,
}) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [editing, setEditing] = useState(false)
  const submitting = useRef(false)

  const post = posts.find((item) => String(item.id) === id)

  const isOwner = Boolean(
    user && post && user.id === post.owner_id
  )

  const canChangeStatus = Boolean(
    user && post && (
      post.type === 'fix' ? isAuthority : isOwner
    )
  )

  async function handleDelete() {
    if (!post || !isOwner || submitting.current) return

    submitting.current = true
    setDeleting(true)
    setDeleteError('')

    const controller = new AbortController()
    let timedOut = false

    const timeoutId = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, 12000)

    try {
      if (!supabase) {
        throw new Error('Supabase is not configured.')
      }

      const { data, error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)
        .eq('owner_id', user.id)
        .select('id')
        .abortSignal(controller.signal)

      if (error) throw error

      if (!data || data.length !== 1 || data[0].id !== post.id) {
        throw new Error(
          'No deletion was confirmed. The post may already be removed, or your account may not have permission. Refresh the board.'
        )
      }

      onDeleted(post.id)
      navigate('/', { replace: true })
    } catch (error) {
      setDeleteError(
        timedOut
          ? 'Deletion was not confirmed before the timeout. Refresh the board before retrying.'
          : error.message || 'Could not confirm deletion. Please retry.'
      )
    } finally {
      clearTimeout(timeoutId)
      submitting.current = false
      setDeleting(false)
    }
  }

  if (!post) {
    return (
      <section>
        <h1 className="text-2xl font-bold">Post not found</h1>
        <p className="mt-2 text-[#596B62]">
          It may have been removed.
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex min-h-11 items-center text-[#147765] underline"
        >
          Return to campus board
        </Link>
      </section>
    )
  }

  const isFix = post.type === 'fix'

  return (
    <section className="mx-auto max-w-2xl">
      <Link
        to="/"
        className="inline-flex min-h-11 items-center rounded-md text-sm font-semibold text-[#147765] hover:underline"
      >
        ← Back to campus board
      </Link>

      <article className="mt-4 rounded-xl border border-[#DEE5E0] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              isFix
                ? 'bg-[#EEEEFC] text-[#484FC1]'
                : 'bg-[#E7F3EE] text-[#147765]'
            }`}
          >
            {isFix ? 'Fix my campus' : 'ReUse campus'}
          </span>

          <span className="rounded-full bg-[#F0F3F1] px-3 py-1 text-sm text-[#52645A]">
            {post.status}
          </span>

          {isOwner && (
            <span className="text-sm font-semibold">
              Your post
            </span>
          )}
        </div>

        <h1 className="mt-4 break-words text-2xl font-bold">
          {post.title}
        </h1>

        <PostImage
          src={post.imageUrl}
          alt={`Attached photo: ${post.title}`}
        />

        <p className="mt-4 whitespace-pre-wrap break-words leading-relaxed text-[#596B62]">
          {post.description}
        </p>

        <p className="mt-5 break-words text-sm">
          <strong>Location:</strong> {post.location}
        </p>

        <p className="mt-2 text-sm">
          <strong>Category:</strong> {post.category}
        </p>

        {isFix && (
          <p className="mt-4 text-sm text-[#596B62]">
            Maintenance status is managed by campus authorities.
          </p>
        )}

        {(isOwner || canChangeStatus) && (
          <section
            aria-labelledby="manage-heading"
            className="mt-6 border-t border-[#DEE5E0] pt-5"
          >
            <h2 id="manage-heading" className="font-semibold">
              Manage post
            </h2>

            {editing && isOwner ? (
              <EditPost
                key={post.id}
                post={post}
                user={user}
                onUpdated={onUpdated}
                onClose={() => setEditing(false)}
              />
            ) : (
              !confirmDelete && (
                <>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="nav-link mt-4 min-h-11 rounded-lg border border-[#BBCBC1] bg-white px-4 py-2 font-semibold text-[#263F38]"
                    >
                      Edit post
                    </button>
                  )}

                  {canChangeStatus && (
                    <StatusEditor
                      key={post.id}
                      post={post}
                      user={user}
                      isAuthority={isAuthority}
                      onUpdated={onUpdated}
                    />
                  )}
                </>
              )
            )}

            {isOwner && (
              !confirmDelete ? (
                <button
                  type="button"
                  disabled={editing}
                  title={editing ? 'Finish or cancel editing first' : undefined}
                  onClick={() => {
                    setDeleteError('')
                    setConfirmDelete(true)
                  }}
                  className="danger-button mt-4 min-h-11 rounded-lg border border-red-300 bg-white px-4 py-2 font-semibold text-red-800 disabled:opacity-50"
                >
                  Delete post
                </button>
              ) : (
                <div
                  aria-busy={deleting}
                  className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4"
                >
                  <p role="status" className="font-semibold text-red-900">
                    Delete this post permanently?
                  </p>

                  <p className="mt-1 text-sm text-red-800">
                    This action cannot be undone.
                  </p>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="danger-button danger-solid min-h-11 rounded-lg bg-red-700 px-4 py-2 font-semibold text-white disabled:opacity-60"
                    >
                      {deleting ? 'Deleting…' : 'Yes, delete post'}
                    </button>

                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => {
                        setConfirmDelete(false)
                        setDeleteError('')
                      }}
                      className="nav-link min-h-11 rounded-lg border border-[#BBCBC1] bg-white px-4 py-2 font-semibold text-[#263F38] disabled:opacity-60"
                    >
                      Keep post
                    </button>
                  </div>

                  {deleteError && (
                    <p
                      role="alert"
                      className="mt-4 text-sm leading-relaxed text-red-800"
                    >
                      {deleteError}
                    </p>
                  )}
                </div>
              )
            )}
          </section>
        )}
      </article>
    </section>
  )
}

export default PostDetails