'use client'

import { useEffect } from 'react'

export function DevErrorFilter() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      try {
        const filename = (event && (event as any).filename) || ''
        if (typeof filename === 'string' && filename.startsWith('chrome-extension://')) {
          // Prevent third-party extension errors from surfacing in the dev overlay
          event.preventDefault()
          event.stopImmediatePropagation()
          return
        }
      } catch (e) {
        // ignore
      }
    }

    const onRejection = (event: PromiseRejectionEvent) => {
      try {
        const reason = event.reason
        const stack = reason && reason.stack
        if (typeof stack === 'string' && stack.includes('chrome-extension://')) {
          event.preventDefault()
          event.stopImmediatePropagation()
          return
        }
      } catch (e) {
        // ignore
      }
    }

    window.addEventListener('error', onError, true)
    window.addEventListener('unhandledrejection', onRejection, true)

    return () => {
      window.removeEventListener('error', onError, true)
      window.removeEventListener('unhandledrejection', onRejection, true)
    }
  }, [])

  return null
}
