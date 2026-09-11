import ImagePicker from './ImagePicker'
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_URL =
  'https://6aa2d6b4ccb3db9689a7127d.mockapi.io/posts'

const DRAFT_KEY = 'campusloop-post-draft'

const categories = {
  fix: ['Electrical', 'Plumbing', 'Furniture'],
  reuse: ['Books', 'Electronics', 'Supplies'],
}

const emptyForm = {
  type: 'fix',
  title: '',
  description: '',
  location: '',
  category: 'Electrical',
  imageUrl: '',
  imagePath: '',
}

function readDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY))

    if (!saved || typeof saved !== 'object') {
      return { ...emptyForm }
    }

    const type = saved.type === 'reuse' ? 'reuse' : 'fix'

    return {
      type,
      title:
        typeof saved.title === 'string'
          ? saved.title.slice(0, 60)
          : '',
      description:
        typeof saved.description === 'string'
          ? saved.description.slice(0, 600)
          : '',
      location:
        typeof saved.location === 'string'
          ? saved.location.slice(0, 100)
          : '',
      category: categories[type].includes(saved.category)
        ? saved.category
        : categories[type][0],
        imageUrl:
  typeof saved.imageUrl === 'string' ? saved.imageUrl : '',
imagePath:
  typeof saved.imagePath === 'string' ? saved.imagePath : '',
    }
  } catch {
    return { ...emptyForm }
  }
}

function CreatePost({ onCreated }) {
  const navigate = useNavigate()

  const [form, setForm] = useState(readDraft)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [storageError, setStorageError] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
const imageBusyRef = useRef(false)

function handleImageBusy(busy) {
  imageBusyRef.current = busy
  setImageUploading(busy)
}

function handleImageChange(image) {
  setForm((current) => ({
    ...current,
    ...image,
  }))
}

  // Immediate guard against two submissions starting together.
  const submitting = useRef(false)

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
      setStorageError('')
    } catch {
      setStorageError(
        'Draft saving is unavailable. Keep this page open until you submit.'
      )
    }
  }, [form])

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

  function changeType(type) {
    setForm((current) => ({
      ...current,
      type,
      category: categories[type][0],
    }))

    setErrors({})
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (submitting.current || imageBusyRef.current) return

    const cleanedForm = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
    }

    const nextErrors = {}

    if (!cleanedForm.title) {
      nextErrors.title = 'Enter a title.'
    } else if (cleanedForm.title.length > 60) {
      nextErrors.title = 'Use 60 characters or fewer.'
    }

    if (!cleanedForm.description) {
      nextErrors.description = 'Describe the issue or item.'
    } else if (cleanedForm.description.length > 600) {
      nextErrors.description = 'Use 600 characters or fewer.'
    }

    if (!cleanedForm.location) {
      nextErrors.location = 'Enter a campus location.'
    } else if (cleanedForm.location.length > 100) {
      nextErrors.location = 'Use 100 characters or fewer.'
    }

    if (!categories[cleanedForm.type]?.includes(cleanedForm.category)) {
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
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          ...cleanedForm,
          status: cleanedForm.type === 'fix'
            ? 'Reported'
            : 'Available',
        }),
      })

      if (!response.ok) {
        throw new Error(
          `The server returned ${response.status}.`
        )
      }

      const savedPost = await response.json()

      if (
        !savedPost ||
        !['string', 'number'].includes(typeof savedPost.id)
      ) {
        throw new Error('The server did not return a valid post ID.')
      }

      // Use validated form values and the server-generated ID.
      const createdPost = {
        ...cleanedForm,
        id: String(savedPost.id),
        status: cleanedForm.type === 'fix'
          ? 'Reported'
          : 'Available',
      }

      try {
        localStorage.removeItem(DRAFT_KEY)
      } catch {
        // The post was saved even if local draft cleanup failed.
      }

      onCreated(createdPost)
      navigate(`/posts/${createdPost.id}`, { replace: true })
    } catch (error) {
      setSaveError(
        `We couldn’t confirm that your post was saved. ${
          error.name === 'AbortError'
            ? 'The request timed out.'
            : error instanceof TypeError
              ? 'Check your connection.'
              : error.message
        } Your draft is kept. Check the board before submitting again to avoid a duplicate.`
      )
    } finally {
      clearTimeout(timeoutId)
      submitting.current = false
      setSaving(false)
    }
  }

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-[#263F38]">
        Create a campus post
      </h1>

      <p className="mt-2 leading-relaxed text-[#596B62]">
        Give enough detail for someone to take the next step.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-busy={saving}
        className="mt-6 rounded-xl border border-[#DEE5E0] bg-white p-4 sm:p-6"
      >
        {storageError && (
          <p
            role="status"
            className="mb-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-900"
          >
            {storageError}
          </p>
        )}

        <fieldset disabled={saving} className="min-w-0 space-y-5">
          <legend className="mb-3 text-sm font-semibold">
            What would you like to post?
          </legend>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              ['fix', 'Report an issue'],
              ['reuse', 'Offer an item'],
            ].map(([type, label]) => (
              <button
                key={type}
                type="button"
                aria-pressed={form.type === type}
                onClick={() => changeType(type)}
                className={`board-tab min-h-11 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  form.type === type
                    ? 'border-[#263F38] bg-[#263F38] text-white'
                    : 'border-[#BBCBC1] bg-white text-[#435E50]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {[
            ['title', 'Title', 'A short, clear title', 60],
            ['location', 'Location', 'Building, floor or room', 100],
            [
              'description',
              'Description',
              'Describe the issue or item',
              600,
            ],
          ].map(([name, label, placeholder, limit]) => (
            <div key={name}>
              <label
                htmlFor={name}
                className="mb-2 block text-sm font-semibold"
              >
                {label} (required)
              </label>

              {name === 'description' ? (
                <textarea
                  id={name}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  maxLength={limit}
                  required
                  aria-invalid={Boolean(errors[name])}
                  aria-describedby={`${name}-hint`}
                  className="textarea min-h-32 w-full min-w-0 rounded-lg border-[#BBCBC1] bg-white text-base"
                />
              ) : (
                <input
                  id={name}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  maxLength={limit}
                  required
                  aria-invalid={Boolean(errors[name])}
                  aria-describedby={`${name}-hint`}
                  className="input min-h-11 w-full min-w-0 rounded-lg border-[#BBCBC1] bg-white text-base"
                />
              )}

              <div
                id={`${name}-hint`}
                className="mt-1 flex flex-wrap justify-between gap-2 text-sm"
              >
                <span className="text-red-700">
                  {errors[name]}
                </span>

                <span className="text-[#596B62]">
                  {form[name].length}/{limit}
                </span>
              </div>
            </div>
          ))}

          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-semibold"
            >
              Category (required)
            </label>

            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              aria-invalid={Boolean(errors.category)}
              aria-describedby="category-error"
              className="select min-h-11 w-full rounded-lg border-[#BBCBC1] bg-white text-base"
            >
              {categories[form.type].map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <p id="category-error" className="mt-1 text-sm text-red-700">
              {errors.category}
            </p>
          </div>
          <ImagePicker
  imageUrl={form.imageUrl}
  onImageChange={handleImageChange}
  onBusyChange={handleImageBusy}
  disabled={saving}
/>

          <button
            type="submit"
            disabled={saving || imageUploading}
            className="nav-link flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#263F38] px-4 py-3 font-semibold text-white disabled:cursor-wait disabled:opacity-60"
          >
            {saving && (
              <span
                aria-hidden="true"
                className="loading loading-spinner loading-sm"
              />
            )}
            {imageUploading
  ? 'Wait for photo upload…'
  : saving
    ? 'Saving post…'
    : 'Publish post'}
          </button>
        </fieldset>

        {saveError && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-relaxed text-red-800"
          >
            <p>{saveError}</p>

            <Link
              to="/"
              className="mt-2 inline-flex min-h-11 items-center rounded-md font-semibold underline"
            >
              Check campus board
            </Link>
          </div>
        )}
      </form>
    </section>
  )
}

export default CreatePost