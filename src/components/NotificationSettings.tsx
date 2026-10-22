import { useCallback, useEffect, useState } from 'react'
import { Bell, BellOff, Check } from 'lucide-react'
import { useDashboardStore } from '../store/dashboardStore'
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getPermission,
  requestNotificationPermission,
  showNotification,
  type PermissionState,
} from '../utils/notifications'

const LEAD_TIME_OPTIONS = [0, 5, 15, 30, 60]

/**
 * Permission UX: nothing is requested on load. The browser prompt only appears
 * after the user explicitly asks for it here.
 */
export function NotificationSettings() {
  const { preferences, updateNotificationPreferences } = useDashboardStore()
  const settings = { ...DEFAULT_NOTIFICATION_PREFERENCES, ...(preferences?.notifications ?? {}) }
  const [permission, setPermission] = useState<PermissionState>(() => getPermission())
  const [isRequesting, setIsRequesting] = useState(false)

  useEffect(() => {
    setPermission(getPermission())
  }, [])

  const update = useCallback(
    (changes: Parameters<typeof updateNotificationPreferences>[0]) => {
      updateNotificationPreferences?.(changes)
    },
    [updateNotificationPreferences]
  )

  const handleRequestPermission = async () => {
    setIsRequesting(true)
    try {
      const result = await requestNotificationPermission()
      setPermission(result)
      if (result === 'granted') {
        update({ enabled: true })
        showNotification('Notifications enabled', {
          body: "You'll hear from your dashboard when a timer ends or a task is due.",
          tag: 'bento-permission',
        })
      }
    } finally {
      setIsRequesting(false)
    }
  }

  const permissionMessage = () => {
    switch (permission) {
      case 'granted':
        return 'Browser notifications are allowed.'
      case 'denied':
        return 'Your browser is blocking notifications. Reminders will appear inside the dashboard instead.'
      case 'unsupported':
        return "This browser doesn't support notifications. Reminders will appear inside the dashboard instead."
      default:
        return 'Allow notifications to get alerted when a timer ends or a task is due.'
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {settings.enabled && permission === 'granted' ? (
          <Bell className="w-4 h-4 text-primary-500" />
        ) : (
          <BellOff className="w-4 h-4 text-gray-400" />
        )}
        <span className="text-sm font-medium">Notifications</span>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{permissionMessage()}</p>

      {permission === 'default' && (
        <button
          onClick={handleRequestPermission}
          disabled={isRequesting}
          className="btn-primary text-xs mb-3 disabled:opacity-50"
        >
          {isRequesting ? 'Waiting for browser…' : 'Enable browser notifications'}
        </button>
      )}

      {permission === 'granted' && (
        <p className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mb-3">
          <Check className="w-3 h-3" /> Permission granted
        </p>
      )}

      <div className="space-y-2">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => update({ enabled: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm">Enable notifications</span>
        </label>

        <label className="flex items-center gap-3 pl-6">
          <input
            type="checkbox"
            checked={settings.pomodoro}
            disabled={!settings.enabled}
            onChange={(e) => update({ pomodoro: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 disabled:opacity-50"
          />
          <span className="text-sm">Pomodoro session and break alerts</span>
        </label>

        <label className="flex items-center gap-3 pl-6">
          <input
            type="checkbox"
            checked={settings.tasks}
            disabled={!settings.enabled}
            onChange={(e) => update({ tasks: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 disabled:opacity-50"
          />
          <span className="text-sm">Task due reminders</span>
        </label>

        <div className="pl-6">
          <label htmlFor="task-reminder-lead" className="block text-xs text-gray-500 mb-1">
            Remind me about tasks
          </label>
          <select
            id="task-reminder-lead"
            value={settings.taskReminderLeadMinutes}
            disabled={!settings.enabled || !settings.tasks}
            onChange={(e) => update({ taskReminderLeadMinutes: Number(e.target.value) })}
            className="input-field text-xs disabled:opacity-50"
          >
            {LEAD_TIME_OPTIONS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes === 0 ? 'When due' : `${minutes} minutes before`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
