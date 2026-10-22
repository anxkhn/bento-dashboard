import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useDashboardStore } from '../src/store/dashboardStore'
import { NotificationSettings } from '../src/components/NotificationSettings'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../src/utils/notifications'

vi.mock('../src/store/dashboardStore', () => ({
  useDashboardStore: vi.fn(),
}))

const mockedStore = useDashboardStore as unknown as ReturnType<typeof vi.fn>

function installNotificationMock(permission: NotificationPermission) {
  const ctor = vi.fn() as unknown as {
    permission: NotificationPermission
    requestPermission: ReturnType<typeof vi.fn>
  }
  ctor.permission = permission
  ctor.requestPermission = vi.fn(async () => permission)
  Object.defineProperty(window, 'Notification', {
    configurable: true,
    writable: true,
    value: ctor,
  })
  return ctor
}

describe('NotificationSettings', () => {
  const mockUpdate = vi.fn()

  const setStore = (notifications = DEFAULT_NOTIFICATION_PREFERENCES) => {
    mockedStore.mockReturnValue({
      preferences: {
        theme: 'light',
        userName: 'Test User',
        dashboardLayout: 'grid',
        animationsEnabled: true,
        notifications,
      },
      updateNotificationPreferences: mockUpdate,
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setStore()
  })

  afterEach(() => {
    // @ts-expect-error - resetting the simulated browser API
    delete window.Notification
  })

  it('asks politely instead of prompting on render', () => {
    const ctor = installNotificationMock('default')

    render(<NotificationSettings />)

    expect(ctor.requestPermission).not.toHaveBeenCalled()
    expect(
      screen.getByText('Allow notifications to get alerted when a timer ends or a task is due.')
    ).toBeInTheDocument()
    expect(screen.getByText('Enable browser notifications')).toBeInTheDocument()
  })

  it('requests permission when the user asks for it', async () => {
    const ctor = installNotificationMock('default')
    ctor.requestPermission = vi.fn(async () => 'granted' as NotificationPermission)

    render(<NotificationSettings />)
    await userEvent.click(screen.getByText('Enable browser notifications'))

    expect(ctor.requestPermission).toHaveBeenCalled()
    await waitFor(() => expect(screen.getByText('Permission granted')).toBeInTheDocument())
    expect(mockUpdate).toHaveBeenCalledWith({ enabled: true })
  })

  it('explains the in-app fallback when permission is denied', () => {
    installNotificationMock('denied')

    render(<NotificationSettings />)

    expect(
      screen.getByText(/blocking notifications. Reminders will appear inside the dashboard/)
    ).toBeInTheDocument()
    expect(screen.queryByText('Enable browser notifications')).not.toBeInTheDocument()
  })

  it('explains the in-app fallback when the browser has no support', () => {
    render(<NotificationSettings />)

    expect(screen.getByText(/doesn't support notifications/)).toBeInTheDocument()
  })

  it('toggles the master switch', async () => {
    installNotificationMock('granted')

    render(<NotificationSettings />)
    await userEvent.click(screen.getByLabelText('Enable notifications'))

    expect(mockUpdate).toHaveBeenCalledWith({ enabled: false })
  })

  it('toggles each category', async () => {
    installNotificationMock('granted')

    render(<NotificationSettings />)
    await userEvent.click(screen.getByLabelText('Pomodoro session and break alerts'))
    await userEvent.click(screen.getByLabelText('Task due reminders'))

    expect(mockUpdate).toHaveBeenCalledWith({ pomodoro: false })
    expect(mockUpdate).toHaveBeenCalledWith({ tasks: false })
  })

  it('changes the task reminder lead time', async () => {
    installNotificationMock('granted')

    render(<NotificationSettings />)
    await userEvent.selectOptions(screen.getByLabelText('Remind me about tasks'), '30')

    expect(mockUpdate).toHaveBeenCalledWith({ taskReminderLeadMinutes: 30 })
  })

  it('disables category switches while notifications are off', () => {
    installNotificationMock('granted')
    setStore({ ...DEFAULT_NOTIFICATION_PREFERENCES, enabled: false })

    render(<NotificationSettings />)

    expect(screen.getByLabelText('Pomodoro session and break alerts')).toBeDisabled()
    expect(screen.getByLabelText('Task due reminders')).toBeDisabled()
    expect(screen.getByLabelText('Remind me about tasks')).toBeDisabled()
  })
})
