/**
 * ═══════════════════════════════════════════════════════════════
 * HOOK: useDebounce
 * Debounce de valores (útil para search, inputs, etc)
 * ═══════════════════════════════════════════════════════════════
 */

import { useEffect, useState } from 'react'

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clear timeout if value changes (or component unmounts)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook para debounce de callback
 */
export function useDebounceCallback(callback, delay = 500) {
  const [timeoutId, setTimeoutId] = useState(null)

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const id = setTimeout(() => {
      callback(...args)
    }, delay)

    setTimeoutId(id)
  }
}
