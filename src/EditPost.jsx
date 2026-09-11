import { useState, useRef } from 'react'

const API_URL =
  'https://6aa2d6b4ccb3db9689a7127d.mockapi.io/posts'

function EditPost({ post, onUpdated, onClose }) {
  const [form, setForm] = useState({
    title: post.title,
    description: post.description,
    location: post.location,
    category: post.category,
  })

  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const submitting = useRef(false)

  const categories =
    post.type === 'fix'
      ? ['Electrical', 'Plumbing', 'Furniture']
      : ['Books', 'Electronics', 'Supplies']

  function handleChange(event) {
    const { name, value } = event.target

    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    setErrors((current) => ({
      ...current,
      [name]: '',
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (submitting.current) return

    const cleaned = {
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      category: form.category,
    }

    const nextErrors = {}

    for (const [field, limit] of [
      ['title', 60],
      ['description', 600],
      ['location', 100],
    ]) {
      if (!cleaned[field]) {
        nextErrors[field] = 'This field is required.'
      } else if (cleaned[field].length > limit) {
        nextErrors[field] = `Use ${limit} characters or fewer.`
      }
    }

    if (!categories.includes(cleaned.category)) {
      nextErrors.category = 'Choose a valid category.'
    }

    setErrors(nextErrors)
    setSaveError('')

    if (Object.keys(nextErrors).length > 0) return

    submitting.current = true
    setSaving(true)

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
          body: JSON.stringify(cleaned),
        }
      )

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? 'This post no longer exists. Return to the board.'
            : `The server returned ${response.status}.`
        )
      }

      const savedPost = await response.json()

      const confirmed =
        savedPost &&
        String(savedPost.id) === String(post.id) &&
        Object.keys(cleaned).every(
          (field) => savedPost[field] === cleaned[field]
        )

      if (!confirmed) {
        throw new Error('The server did not confirm your changes.')
      }

      onUpdated({
        ...post,
        ...cleaned,
      })

      onClose()
    } catch (error) {
      setSaveError(
        error.name === 'AbortError'
          ? 'The request timed out. Your changes were not confirmed. Your inputs are still here; retry to save the same changes.'
          : error instanceof TypeError
            ? 'Could not confirm saving. Check your connection and retry.'
            : error.message
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
      noValidate
      aria-busy={saving}
      className="mt-5 rounded-xl border border-[#BBCBC1] bg-[#F6F8F7] p-4"
    >
      <h3 className="text-lg font-bold">Edit post</h3>

      <p className="mt-1 text-sm text-[#596B62]">
        Changes are applied only after the server confirms saving.
      </p>

      <fieldset
        disabled={saving}
        className="mt-4 min-w-0 space-y-4"
      >
        <legend className="sr-only">Post information</legend>

        {[
          ['title', 'Title', 60],
          ['location', 'Location', 100],
          ['description', 'Description', 600],
        ].map(([name, label, limit]) => (
          <div key={name}>
            <label
              htmlFor={`edit-${name}`}
              className="mb-2 block text-sm font-semibold"
            >
              {label} (required)
            </label>

            {name === 'description' ? (
              <textarea
                id={`edit-${name}`}
                name={name}
                value={form[name]}
                onChange={handleChange}
                maxLength={limit}
                required
                aria-invalid={Boolean(errors[name])}
                aria-describedby={`edit-${name}-hint`}
                className="textarea min-h-32 w-full min-w-0 rounded-lg border-[#BBCBC1] bg-white text-base"
              />
            ) : (
              <input
                id={`edit-${name}`}
                name={name}
                value={form[name]}
                onChange={handleChange}
                maxLength={limit}
                required
                aria-invalid={Boolean(errors[name])}
                aria-describedby={`edit-${name}-hint`}
                className="input min-h-11 w-full min-w-0 rounded-lg border-[#BBCBC1] bg-white text-base"
              />
            )}

            <div
              id={`edit-${name}-hint`}
              className="mt-1 flex flex-wrap justify-between gap-2 text-sm"
            >
              <span className="text-red-700">{errors[name]}</span>
              <span className="text-[#596B62]">
                {form[name].length}/{limit}
              </span>
            </div>
          </div>
        ))}

        <div>
          <label
            htmlFor="edit-category"
            className="mb-2 block text-sm font-semibold"
          >
            Category
          </label>

          <select
            id="edit-category"
            name="category"
            value={form.category}
            onChange={handleChange}
            aria-invalid={Boolean(errors.category)}
            aria-describedby="edit-category-error"
            className="select min-h-11 w-full rounded-lg border-[#BBCBC1] bg-white text-base"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <p
            id="edit-category-error"
            className="mt-1 text-sm text-red-700"
          >
            {errors.category}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={saving}
            className="nav-link flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#263F38] px-4 py-2 font-semibold text-white disabled:opacity-50"
          >
            {saving && (
              <span
                aria-hidden="true"
                className="loading loading-spinner loading-sm"
              />
            )}
            {saving ? 'Saving…' : 'Save changes'}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="nav-link min-h-11 rounded-lg border border-[#BBCBC1] bg-white px-4 py-2 font-semibold text-[#263F38]"
          >
            Cancel editing
          </button>
        </div>
      </fieldset>

      {saveError && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm leading-relaxed text-red-800"
        >
          {saveError}
        </p>
      )}
    </form>
  )
}

export default EditPost