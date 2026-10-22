import type { NotificationPreferences, Task } from '../types'

/**
 * Thin, test-friendly wrapper around the browser Notifications API.
 *
 * Every entry point degrades gracefully: when the API is missing or the user
 * denied permission, nothing throws - a fallback event is dispatched instead so
 * the UI can show an in-app message.
 */

export type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported'

export type NotificationCategory = 'pomodoro' | 'tasks'

export interface NotifyOptions {
  body?: string
  tag?: string
  icon?: string
  silent?: boolean
  requireInteraction?: boolean
  /** Re-alert when this replaces an earlier notification with the same tag. */
  renotify?: boolean
  data?: unknown
}

export interface NotificationFallbackDetail {
  title: string
  body?: string
  reason: 'unsupported' | 'denied'
}

export const NOTIFICATION_FALLBACK_EVENT = 'bento:notification-fallback'

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  pomodoro: true,
  tasks: true,
  taskReminderLeadMinutes: 15,
}

/** Tasks more than a day overdue no longer trigger a reminder on app start. */
export const OVERDUE_GRACE_MS = 24 * 60 * 60 * 1000

/** Never fire more than a handful of reminders in a single check. */
export const MAX_REMINDERS_PER_CHECK = 3

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getPermission(): PermissionState {
  if (!isNotificationSupported()) return 'unsupported'
  return window.Notification.permission as PermissionState
}

/**
 * Asks the browser for permission. Safe to call when unsupported, and handles
 * the legacy callback-only signature used by older Safari versions.
 */
export async function requestNotificationPermission(): Promise<PermissionState> {
  if (!isNotificationSupported()) return 'unsupported'
  if (window.Notification.permission !== 'default') {
    return window.Notification.permission as PermissionState
  }

  try {
    const result = await new Promise<NotificationPermission>((resolve, reject) => {
      const returned = window.Notification.requestPermission((permission) =>
        resolve(permission)
      )
      if (returned && typeof (returned as Promise<NotificationPermission>).then === 'function') {
        ;(returned as Promise<NotificationPermission>).then(resolve, reject)
      }
    })
    return result as PermissionState
  } catch {
    return getPermission()
  }
}

/** True when the user both allowed this category and granted browser permission. */
export function canNotify(
  preferences: NotificationPreferences | undefined,
  category: NotificationCategory
): boolean {
  const prefs = { ...DEFAULT_NOTIFICATION_PREFERENCES, ...(preferences ?? {}) }
  if (!prefs.enabled || !prefs[category]) return false
  return getPermission() === 'granted'
}

function emitFallback(detail: NotificationFallbackDetail) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(NOTIFICATION_FALLBACK_EVENT, { detail }))
}

/**
 * Shows a notification, or dispatches a fallback event when it cannot.
 * Returns the created Notification, or null when it fell back.
 */
export function showNotification(
  title: string,
  options: NotifyOptions = {}
): Notification | null {
  if (!isNotificationSupported()) {
    emitFallback({ title, body: options.body, reason: 'unsupported' })
    return null
  }

  if (window.Notification.permission !== 'granted') {
    emitFallback({ title, body: options.body, reason: 'denied' })
    return null
  }

  try {
    return new window.Notification(title, options)
  } catch {
    // Some browsers (notably Android Chrome) throw for non-service-worker
    // notifications - treat that like any other unavailable channel.
    emitFallback({ title, body: options.body, reason: 'unsupported' })
    return null
  }
}

/**
 * Delivers a notification for a category the user opted into: a browser
 * notification when permission allows, an in-app fallback when it does not,
 * and nothing at all when the user switched that category off.
 */
function deliver(
  title: string,
  body: string,
  category: NotificationCategory,
  preferences: NotificationPreferences | undefined,
  options: NotifyOptions = {}
): Notification | null {
  const prefs = { ...DEFAULT_NOTIFICATION_PREFERENCES, ...(preferences ?? {}) }
  if (!prefs.enabled || !prefs[category]) return null

  if (getPermission() !== 'granted') {
    emitFallback({
      title,
      body,
      reason: isNotificationSupported() ? 'denied' : 'unsupported',
    })
    return null
  }

  return showNotification(title, { ...options, body })
}

export function onNotificationFallback(
  listener: (detail: NotificationFallbackDetail) => void
): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = (event: Event) => {
    listener((event as CustomEvent<NotificationFallbackDetail>).detail)
  }
  window.addEventListener(NOTIFICATION_FALLBACK_EVENT, handler)
  return () => window.removeEventListener(NOTIFICATION_FALLBACK_EVENT, handler)
}

/* -------------------------------------------------------------------------- */
/* Pomodoro                                                                    */
/* -------------------------------------------------------------------------- */

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak'

const POMODORO_MESSAGES: Record<PomodoroMode, { title: string; body: string }> = {
  work: {
    title: 'Focus session complete',
    body: 'Nice work. Time to step away for a bit.',
  },
  shortBreak: {
    title: 'Short break over',
    body: 'Back to it - your next focus session is ready.',
  },
  longBreak: {
    title: 'Long break over',
    body: 'Recharged? Your next focus session is ready.',
  },
}

export function buildPomodoroMessage(completedMode: PomodoroMode, nextMode: PomodoroMode) {
  const message = POMODORO_MESSAGES[completedMode]
  const nextLabel =
    nextMode === 'work' ? 'Focus Time' : nextMode === 'shortBreak' ? 'Short Break' : 'Long Break'
  return { title: message.title, body: `${message.body} Up next: ${nextLabel}.` }
}

export function notifyPomodoroComplete(
  completedMode: PomodoroMode,
  nextMode: PomodoroMode,
  preferences?: NotificationPreferences
): Notification | null {
  const { title, body } = buildPomodoroMessage(completedMode, nextMode)
  // A stable tag keeps one timer notification in the tray instead of stacking
  // them up, and renotify makes each replacement alert again rather than
  // silently updating the previous one.
  return deliver(title, body, 'pomodoro', preferences, {
    tag: 'bento-pomodoro',
    renotify: true,
    requireInteraction: true,
  })
}

/* -------------------------------------------------------------------------- */
/* Task reminders                                                              */
/* -------------------------------------------------------------------------- */

/** Reminders already delivered this session, keyed by task id + due date. */
const remindedTasks = new Set<string>()

export function reminderKey(task: Pick<Task, 'id' | 'dueDate'>): string {
  const due = task.dueDate ? new Date(task.dueDate).getTime() : 'none'
  return `${task.id}:${due}`
}

export function resetTaskReminders(): void {
  remindedTasks.clear()
}

/**
 * Picks the tasks that should be reminded about right now: incomplete, due
 * within the lead window (or recently overdue), and not already reminded.
 */
export function getDueTaskReminders(
  tasks: Task[],
  now: number = Date.now(),
  leadMinutes: number = DEFAULT_NOTIFICATION_PREFERENCES.taskReminderLeadMinutes
): Task[] {
  const leadMs = Math.max(0, leadMinutes) * 60 * 1000

  return tasks
    .filter((task) => {
      if (task.completed || !task.dueDate) return false
      const dueTime = new Date(task.dueDate).getTime()
      if (Number.isNaN(dueTime)) return false
      if (remindedTasks.has(reminderKey(task))) return false
      const msUntilDue = dueTime - now
      return msUntilDue <= leadMs && msUntilDue > -OVERDUE_GRACE_MS
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, MAX_REMINDERS_PER_CHECK)
}

export function buildTaskReminderMessage(task: Task, now: number = Date.now()) {
  const dueTime = task.dueDate ? new Date(task.dueDate).getTime() : now
  const overdue = dueTime <= now
  return {
    title: overdue ? 'Task overdue' : 'Task due soon',
    body: `${task.title} (${task.priority} priority)`,
  }
}

export function notifyTaskDue(
  task: Task,
  preferences?: NotificationPreferences,
  now: number = Date.now()
): Notification | null {
  const { title, body } = buildTaskReminderMessage(task, now)
  remindedTasks.add(reminderKey(task))
  return deliver(title, body, 'tasks', preferences, {
    tag: `bento-task-${task.id}`,
    renotify: true,
  })
}

/** Runs one reminder sweep and returns the tasks that were notified about. */
export function runTaskReminderCheck(
  tasks: Task[],
  preferences?: NotificationPreferences,
  now: number = Date.now()
): Task[] {
  const prefs = { ...DEFAULT_NOTIFICATION_PREFERENCES, ...(preferences ?? {}) }
  if (!prefs.enabled || !prefs.tasks) return []

  const due = getDueTaskReminders(tasks, now, prefs.taskReminderLeadMinutes)
  due.forEach((task) => notifyTaskDue(task, prefs, now))
  return due
}
