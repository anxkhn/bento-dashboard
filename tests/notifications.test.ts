import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  MAX_REMINDERS_PER_CHECK,
  NOTIFICATION_FALLBACK_EVENT,
  buildPomodoroMessage,
  buildTaskReminderMessage,
  canNotify,
  getDueTaskReminders,
  getPermission,
  isNotificationSupported,
  notifyPomodoroComplete,
  notifyTaskDue,
  onNotificationFallback,
  reminderKey,
  requestNotificationPermission,
  resetTaskReminders,
  runTaskReminderCheck,
  showNotification,
} from '../src/utils/notifications'
import type { NotificationPreferences, Task } from '../src/types'

type NotificationCtor = {
  (title: string, options?: unknown): void
  permission: NotificationPermission
  requestPermission: (callback?: (permission: NotificationPermission) => void) => unknown
}

const notificationInstances: Array<{ title: string; options?: unknown }> = []

function installNotificationMock(permission: NotificationPermission = 'granted') {
  const ctor = vi.fn(function (this: unknown, title: string, options?: unknown) {
    notificationInstances.push({ title, options })
  }) as unknown as NotificationCtor
  ctor.permission = permission
  ctor.requestPermission = vi.fn(async () => permission)

  Object.defineProperty(window, 'Notification', {
    configurable: true,
    writable: true,
    value: ctor,
  })
  return ctor
}

function removeNotificationApi() {
  // @ts-expect-error - deliberately simulating a browser without the API
  delete window.Notification
}

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'Write tests',
    completed: false,
    priority: 'medium',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  }
}

const prefs = (overrides: Partial<NotificationPreferences> = {}): NotificationPreferences => ({
  ...DEFAULT_NOTIFICATION_PREFERENCES,
  ...overrides,
})

beforeEach(() => {
  notificationInstances.length = 0
  resetTaskReminders()
  vi.clearAllMocks()
})

afterEach(() => {
  removeNotificationApi()
})

describe('support and permission', () => {
  it('reports unsupported when the API is missing', () => {
    removeNotificationApi()

    expect(isNotificationSupported()).toBe(false)
    expect(getPermission()).toBe('unsupported')
  })

  it('reads the current browser permission', () => {
    installNotificationMock('denied')

    expect(isNotificationSupported()).toBe(true)
    expect(getPermission()).toBe('denied')
  })

  it('resolves to unsupported without prompting when the API is missing', async () => {
    removeNotificationApi()

    await expect(requestNotificationPermission()).resolves.toBe('unsupported')
  })

  it('does not re-prompt once a decision was made', async () => {
    const ctor = installNotificationMock('denied')

    await expect(requestNotificationPermission()).resolves.toBe('denied')
    expect(ctor.requestPermission).not.toHaveBeenCalled()
  })

  it('requests permission through the promise API', async () => {
    const ctor = installNotificationMock('default')
    ctor.requestPermission = vi.fn(async () => 'granted' as NotificationPermission)

    await expect(requestNotificationPermission()).resolves.toBe('granted')
    expect(ctor.requestPermission).toHaveBeenCalled()
  })

  it('requests permission through the legacy callback API', async () => {
    const ctor = installNotificationMock('default')
    ctor.requestPermission = vi.fn((callback?: (permission: NotificationPermission) => void) => {
      callback?.('granted')
      return undefined
    })

    await expect(requestNotificationPermission()).resolves.toBe('granted')
  })

  it('falls back to the current permission when the request throws', async () => {
    const ctor = installNotificationMock('default')
    ctor.requestPermission = vi.fn(() => {
      throw new Error('nope')
    })

    await expect(requestNotificationPermission()).resolves.toBe('default')
  })
})

describe('canNotify', () => {
  it('requires granted permission', () => {
    installNotificationMock('default')

    expect(canNotify(prefs(), 'pomodoro')).toBe(false)
  })

  it('respects the master switch', () => {
    installNotificationMock('granted')

    expect(canNotify(prefs({ enabled: false }), 'pomodoro')).toBe(false)
  })

  it('respects per-category switches', () => {
    installNotificationMock('granted')

    expect(canNotify(prefs({ tasks: false }), 'tasks')).toBe(false)
    expect(canNotify(prefs({ tasks: false }), 'pomodoro')).toBe(true)
  })

  it('applies defaults when preferences are missing', () => {
    installNotificationMock('granted')

    expect(canNotify(undefined, 'tasks')).toBe(true)
  })
})

describe('showNotification', () => {
  it('creates a browser notification when permission is granted', () => {
    const ctor = installNotificationMock('granted')

    const result = showNotification('Hello', { body: 'World' })

    expect(result).not.toBeNull()
    expect(ctor).toHaveBeenCalledWith('Hello', { body: 'World' })
  })

  it('falls back to an event when permission is denied', () => {
    installNotificationMock('denied')
    const listener = vi.fn()
    const unsubscribe = onNotificationFallback(listener)

    const result = showNotification('Hello', { body: 'World' })

    expect(result).toBeNull()
    expect(listener).toHaveBeenCalledWith({ title: 'Hello', body: 'World', reason: 'denied' })
    unsubscribe()
  })

  it('falls back to an event when the API is unsupported', () => {
    removeNotificationApi()
    const listener = vi.fn()
    const unsubscribe = onNotificationFallback(listener)

    expect(showNotification('Hello')).toBeNull()
    expect(listener).toHaveBeenCalledWith({
      title: 'Hello',
      body: undefined,
      reason: 'unsupported',
    })
    unsubscribe()
  })

  it('falls back when the constructor throws', () => {
    const ctor = installNotificationMock('granted')
    ;(ctor as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('Illegal constructor')
    })
    const listener = vi.fn()
    const unsubscribe = onNotificationFallback(listener)

    expect(showNotification('Hello')).toBeNull()
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'unsupported' })
    )
    unsubscribe()
  })

  it('stops delivering events after unsubscribing', () => {
    removeNotificationApi()
    const listener = vi.fn()
    const unsubscribe = onNotificationFallback(listener)
    unsubscribe()

    showNotification('Hello')

    expect(listener).not.toHaveBeenCalled()
  })
})

describe('pomodoro notifications', () => {
  it('describes the completed phase and the next one', () => {
    expect(buildPomodoroMessage('work', 'shortBreak')).toEqual({
      title: 'Focus session complete',
      body: expect.stringContaining('Up next: Short Break.'),
    })
    expect(buildPomodoroMessage('shortBreak', 'work').title).toBe('Short break over')
    expect(buildPomodoroMessage('longBreak', 'work').title).toBe('Long break over')
  })

  it('notifies when a focus session completes', () => {
    const ctor = installNotificationMock('granted')

    notifyPomodoroComplete('work', 'shortBreak', prefs())

    expect(ctor).toHaveBeenCalledWith(
      'Focus session complete',
      expect.objectContaining({ tag: 'bento-pomodoro' })
    )
  })

  it('notifies when a break ends', () => {
    const ctor = installNotificationMock('granted')

    notifyPomodoroComplete('longBreak', 'work', prefs())

    expect(ctor).toHaveBeenCalledWith('Long break over', expect.any(Object))
  })

  it('re-alerts on every completion instead of silently replacing the last one', () => {
    const ctor = installNotificationMock('granted')

    notifyPomodoroComplete('work', 'shortBreak', prefs())
    notifyPomodoroComplete('shortBreak', 'work', prefs())

    // A shared tag replaces the previous notification; without renotify the
    // browser swaps it in silently and the user never hears the second one.
    expect(ctor).toHaveBeenCalledTimes(2)
    for (const call of (ctor as unknown as ReturnType<typeof vi.fn>).mock.calls) {
      expect(call[1]).toMatchObject({ tag: 'bento-pomodoro', renotify: true })
    }
  })

  it('stays silent when the user switched pomodoro notifications off', () => {
    installNotificationMock('granted')
    const listener = vi.fn()
    const unsubscribe = onNotificationFallback(listener)

    expect(notifyPomodoroComplete('work', 'shortBreak', prefs({ pomodoro: false }))).toBeNull()
    expect(notifyPomodoroComplete('work', 'shortBreak', prefs({ enabled: false }))).toBeNull()

    // Opting out means no browser notification *and* no in-app fallback.
    expect(notificationInstances).toHaveLength(0)
    expect(listener).not.toHaveBeenCalled()
    unsubscribe()
  })

  it('falls back in-app when permission is missing', () => {
    installNotificationMock('denied')
    const listener = vi.fn()
    const unsubscribe = onNotificationFallback(listener)

    const result = notifyPomodoroComplete('work', 'shortBreak', prefs())

    expect(result).toBeNull()
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Focus session complete', reason: 'denied' })
    )
    unsubscribe()
  })
})

describe('getDueTaskReminders', () => {
  const now = new Date('2026-06-01T12:00:00Z').getTime()
  const minutes = (n: number) => new Date(now + n * 60 * 1000)

  it('returns tasks due inside the lead window', () => {
    const due = makeTask({ id: 'due', dueDate: minutes(10) })
    const later = makeTask({ id: 'later', dueDate: minutes(60) })

    const result = getDueTaskReminders([due, later], now, 15)

    expect(result.map((t) => t.id)).toEqual(['due'])
  })

  it('returns overdue tasks within the grace window', () => {
    const overdue = makeTask({ id: 'overdue', dueDate: minutes(-60) })

    expect(getDueTaskReminders([overdue], now, 15).map((t) => t.id)).toEqual(['overdue'])
  })

  it('ignores long-overdue tasks', () => {
    const stale = makeTask({ id: 'stale', dueDate: minutes(-60 * 48) })

    expect(getDueTaskReminders([stale], now, 15)).toEqual([])
  })

  it('ignores completed tasks and tasks without a due date', () => {
    const completed = makeTask({ id: 'done', completed: true, dueDate: minutes(1) })
    const noDue = makeTask({ id: 'no-due' })

    expect(getDueTaskReminders([completed, noDue], now, 15)).toEqual([])
  })

  it('ignores unparseable due dates', () => {
    const broken = makeTask({ id: 'broken', dueDate: new Date('not-a-date') })

    expect(getDueTaskReminders([broken], now, 15)).toEqual([])
  })

  it('honours a zero lead time by only reminding when due', () => {
    const soon = makeTask({ id: 'soon', dueDate: minutes(5) })
    const nowDue = makeTask({ id: 'now', dueDate: minutes(0) })

    expect(getDueTaskReminders([soon, nowDue], now, 0).map((t) => t.id)).toEqual(['now'])
  })

  it('sorts by due date and caps the batch size', () => {
    const tasks = Array.from({ length: MAX_REMINDERS_PER_CHECK + 2 }, (_, i) =>
      makeTask({ id: `task-${i}`, dueDate: minutes(-i) })
    )

    const result = getDueTaskReminders(tasks, now, 15)

    expect(result).toHaveLength(MAX_REMINDERS_PER_CHECK)
    expect(result[0].id).toBe(`task-${MAX_REMINDERS_PER_CHECK + 1}`)
  })

  it('does not repeat a reminder that was already delivered', () => {
    installNotificationMock('granted')
    const task = makeTask({ id: 'repeat', dueDate: minutes(1) })

    expect(getDueTaskReminders([task], now, 15)).toHaveLength(1)
    notifyTaskDue(task, prefs(), now)

    expect(getDueTaskReminders([task], now, 15)).toEqual([])
  })

  it('reminds again when the due date changes', () => {
    installNotificationMock('granted')
    const task = makeTask({ id: 'moved', dueDate: minutes(1) })
    notifyTaskDue(task, prefs(), now)

    const rescheduled = { ...task, dueDate: minutes(5) }

    expect(reminderKey(rescheduled)).not.toBe(reminderKey(task))
    expect(getDueTaskReminders([rescheduled], now, 15)).toHaveLength(1)
  })
})

describe('task reminder messages', () => {
  const now = new Date('2026-06-01T12:00:00Z').getTime()

  it('labels upcoming tasks', () => {
    const task = makeTask({ dueDate: new Date(now + 60_000), priority: 'high' })

    expect(buildTaskReminderMessage(task, now)).toEqual({
      title: 'Task due soon',
      body: 'Write tests (high priority)',
    })
  })

  it('labels overdue tasks', () => {
    const task = makeTask({ dueDate: new Date(now - 60_000) })

    expect(buildTaskReminderMessage(task, now).title).toBe('Task overdue')
  })
})

describe('runTaskReminderCheck', () => {
  const now = new Date('2026-06-01T12:00:00Z').getTime()

  it('notifies about due tasks once', () => {
    const ctor = installNotificationMock('granted')
    const task = makeTask({ id: 'sweep', dueDate: new Date(now + 60_000) })

    expect(runTaskReminderCheck([task], prefs(), now)).toHaveLength(1)
    expect(ctor).toHaveBeenCalledWith('Task due soon', expect.objectContaining({
      tag: 'bento-task-sweep',
      renotify: true,
    }))

    expect(runTaskReminderCheck([task], prefs(), now)).toEqual([])
    expect(ctor).toHaveBeenCalledTimes(1)
  })

  it('does nothing when notifications are off', () => {
    const ctor = installNotificationMock('granted')
    const listener = vi.fn()
    const unsubscribe = onNotificationFallback(listener)
    const task = makeTask({ dueDate: new Date(now) })

    expect(runTaskReminderCheck([task], prefs({ enabled: false }), now)).toEqual([])
    expect(runTaskReminderCheck([task], prefs({ tasks: false }), now)).toEqual([])
    expect(ctor).not.toHaveBeenCalled()
    expect(listener).not.toHaveBeenCalled()
    unsubscribe()
  })

  it('stays silent when notifyTaskDue is called for an opted-out category', () => {
    const ctor = installNotificationMock('granted')
    const listener = vi.fn()
    const unsubscribe = onNotificationFallback(listener)

    expect(notifyTaskDue(makeTask({ dueDate: new Date(now) }), prefs({ tasks: false }), now))
      .toBeNull()
    expect(ctor).not.toHaveBeenCalled()
    expect(listener).not.toHaveBeenCalled()
    unsubscribe()
  })

  it('falls back in-app when permission is denied', () => {
    installNotificationMock('denied')
    const listener = vi.fn()
    const unsubscribe = onNotificationFallback(listener)
    const task = makeTask({ dueDate: new Date(now) })

    const reminded = runTaskReminderCheck([task], prefs(), now)

    expect(reminded).toHaveLength(1)
    expect(notificationInstances).toHaveLength(0)
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Task overdue', reason: 'denied' })
    )
    unsubscribe()
  })

  it('uses the configured lead time', () => {
    installNotificationMock('granted')
    const task = makeTask({ dueDate: new Date(now + 45 * 60 * 1000) })

    expect(runTaskReminderCheck([task], prefs({ taskReminderLeadMinutes: 15 }), now)).toEqual([])
    expect(runTaskReminderCheck([task], prefs({ taskReminderLeadMinutes: 60 }), now)).toHaveLength(1)
  })
})

describe('fallback event name', () => {
  it('is namespaced to the dashboard', () => {
    expect(NOTIFICATION_FALLBACK_EVENT).toBe('bento:notification-fallback')
  })
})
