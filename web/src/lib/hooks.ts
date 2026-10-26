import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initial: T): [T, (val: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initial
    } catch {
      return initial
    }
  })

  const set = (val: T) => {
    setValue(val)
    try {
      window.localStorage.setItem(key, JSON.stringify(val))
    } catch {
      // localStorage not available
    }
  }

  return [value, set]
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prev = document.title
    document.title = `${title} | Secure Gen`
    return () => { document.title = prev }
  }, [title])
}

export function useKeyPress(key: string, handler: () => void) {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === key) handler()
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [key, handler])
}
