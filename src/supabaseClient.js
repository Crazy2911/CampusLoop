import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const originalSignal = options.signal

  function cancelRequest() {
    controller.abort()
  }

  if (originalSignal?.aborted) {
    controller.abort()
  } else {
    originalSignal?.addEventListener('abort', cancelRequest, {
      once: true,
    })
  }

  const timeoutId = setTimeout(() => {
    controller.abort()
  }, 20000)

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
    originalSignal?.removeEventListener('abort', cancelRequest)
  }
}

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        global: {
          fetch: fetchWithTimeout,
        },
      })
    : null