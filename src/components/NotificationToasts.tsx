import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { onNotificationFallback, type NotificationFallbackDetail } from '../utils/notifications'

interface Toast extends NotificationFallbackDetail {
  id: number
}

const TOAST_TIMEOUT_MS = 8000

let nextToastId = 0

/**
 * In-app fallback for when browser notifications are unavailable - denied
 * permission should never mean a silently missed reminder.
 */
export function NotificationToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    return onNotificationFallback((detail) => {
      const toast: Toast = { ...detail, id: nextToastId++ }
      setToasts((current) => [...current.slice(-2), toast])
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== toast.id))
      }, TOAST_TIMEOUT_MS)
    })
  }, [])

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-72"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="widget-card p-3 flex items-start gap-3 shadow-lg bg-white dark:bg-gray-800"
        >
          <Bell className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-500" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{toast.title}</p>
            {toast.body && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{toast.body}</p>
            )}
          </div>
          <button
            onClick={() => setToasts((current) => current.filter((t) => t.id !== toast.id))}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Dismiss notification"
          >
            <X className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      ))}
    </div>
  )
}
