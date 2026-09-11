import { useState, useEffect } from 'react'

function readTheme() {
  try {
    return localStorage.getItem('campusloop-theme') === 'dark'
      ? 'dark'
      : 'light'
  } catch {
    return 'light'
  }
}

function ThemeToggle() {
  const [theme, setTheme] = useState(readTheme)
  const [storageError, setStorageError] = useState(false)

  const isDark = theme === 'dark'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)

    try {
      localStorage.setItem('campusloop-theme', theme)
      setStorageError(false)
    } catch {
      setStorageError(true)
    }
  }, [theme])

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() =>
          setTheme((current) =>
            current === 'light' ? 'dark' : 'light'
          )
        }
        aria-label="Dark mode"
        aria-pressed={isDark}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="theme-toggle"
      >
        {isDark ? (
          <svg
            aria-hidden="true"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.5 13.2A8.5 8.5 0 0 1 10.8 3.5a8.5 8.5 0 1 0 9.7 9.7Z" />
          </svg>
        )}
      </button>

      {storageError && (
        <span role="status" className="max-w-40 text-xs">
          Theme won’t be saved after refresh.
        </span>
      )}
    </div>
  )
}

export default ThemeToggle