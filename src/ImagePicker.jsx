import { useState, useRef } from 'react'
import { supabase } from './supabaseClient'
import PostImage from './PostImage'

const fileTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

function ImagePicker({
  imageUrl,
  onImageChange,
  onBusyChange,
  disabled,
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const uploadingRef = useRef(false)
  const inputRef = useRef(null)

  async function handleFileChange(event) {
    const file = event.target.files?.[0]

    // Allows selecting the same file again after an error.
    event.target.value = ''

    if (!file || uploadingRef.current || disabled) return

    setError('')
    setMessage('')

    if (!fileTypes[file.type]) {
      setError('Choose a JPEG, PNG, or WebP image.')
      return
    }

    if (file.size === 0 || file.size > 2 * 1024 * 1024) {
      setError('Choose a nonempty image no larger than 2 MB.')
      return
    }

    if (!supabase) {
      setError(
        'Image storage is not configured. You can still publish without a photo.'
      )
      return
    }

    uploadingRef.current = true
    setUploading(true)
    onBusyChange(true)

    try {
      const extension = fileTypes[file.type]
      const path = `posts/${crypto.randomUUID()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from('campus-images')
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('campus-images')
        .getPublicUrl(path)

      onImageChange({
        imageUrl: data.publicUrl,
        imagePath: path,
      })

      setMessage('Photo uploaded and attached.')
    } catch {
      setError(
        'Upload was not confirmed. Check your connection and choose the photo again, or continue without a new photo.'
      )
    } finally {
      uploadingRef.current = false
      setUploading(false)
      onBusyChange(false)
    }
  }

  function removeAttachment() {
    onImageChange({
      imageUrl: '',
      imagePath: '',
    })

    setError('')
    setMessage('Photo detached from this post.')

    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <div className="rounded-lg border border-[#DEE5E0] p-4">
      <label
        htmlFor="post-photo"
        className="block text-sm font-semibold"
      >
        Photo (optional)
      </label>

      <p id="photo-hint" className="mt-1 text-sm text-[#596B62]">
        JPEG, PNG, or WebP, up to 2 MB. Selecting a photo uploads
        it to public demo storage.
      </p>

      <input
        ref={inputRef}
        id="post-photo"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={disabled || uploading}
        onChange={handleFileChange}
        aria-describedby="photo-hint photo-feedback"
        className="file-input mt-3 w-full min-w-0 border-[#BBCBC1] bg-white text-sm"
      />

      <div id="photo-feedback">
        {uploading && (
          <p
            role="status"
            className="mt-3 flex items-center gap-2 text-sm"
          >
            <span
              aria-hidden="true"
              className="loading loading-spinner loading-sm"
            />
            Uploading photo…
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-3 text-sm leading-relaxed text-red-800"
          >
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="mt-3 text-sm text-[#147765]">
            {message}
          </p>
        )}
      </div>

      <PostImage src={imageUrl} alt="Photo attached to your post" />

      {imageUrl && (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={removeAttachment}
          className="nav-link mt-3 min-h-11 rounded-lg border border-[#BBCBC1] px-3 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Remove attachment
        </button>
      )}
    </div>
  )
}

export default ImagePicker