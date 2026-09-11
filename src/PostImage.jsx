import { useState } from 'react'

function PostImage({ src, alt }) {
  const [failedSource, setFailedSource] = useState(null)

  if (!src) return null

  // Display only ordinary HTTPS image URLs.
  try {
    if (new URL(src).protocol !== 'https:') return null
  } catch {
    return null
  }

  return (
    <div className="mt-4 aspect-video overflow-hidden rounded-lg border border-[#DEE5E0] bg-[#F3F6F4]">
      {failedSource === src ? (
        <div
          role="status"
          className="flex h-full items-center justify-center p-4 text-center text-sm text-[#596B62]"
        >
          Photo could not be loaded.
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailedSource(src)}
          className="h-full w-full object-contain"
        />
      )}
    </div>
  )
}

export default PostImage