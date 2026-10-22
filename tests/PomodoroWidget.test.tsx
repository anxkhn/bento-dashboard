import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useDashboardStore } from '../src/store/dashboardStore'
import { PomodoroWidget } from '../src/components/widgets/PomodoroWidget'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../src/utils/notifications'

vi.mock('../src/store/dashboardStore', () => ({
  useDashboardStore: vi.fn(),
}))

describe('PomodoroWidget', () => {
  const mockStartPomodoro = vi.fn()
  const mockPausePomodoro = vi.fn()
  const mockResetPomodoro = vi.fn()
  const mockTickPomodoro = vi.fn()
  const mockSkipPomodoroPhase = vi.fn()

  const defaultPomodoroState = {
    timeLeft: 25 * 60,
    isRunning: false,
    mode: 'work' as const,
    sessionsCompleted: 0,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useDashboardStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      pomodoro: defaultPomodoroState,
      startPomodoro: mockStartPomodoro,
      pausePomodoro: mockPausePomodoro,
      resetPomodoro: mockResetPomodoro,
      tickPomodoro: mockTickPomodoro,
      skipPomodoroPhase: mockSkipPomodoroPhase,
    })
  })

  it('renders with initial state', () => {
    render(<PomodoroWidget />)
    
    expect(screen.getByText('Focus Time')).toBeInTheDocument()
    expect(screen.getByText('25:00')).toBeInTheDocument()
    expect(screen.getByText('Sessions completed:')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('starts timer when play button is clicked', async () => {
    render(<PomodoroWidget />)
    
    const playButton = screen.getByLabelText('Start timer')
    await userEvent.click(playButton)

    expect(mockStartPomodoro).toHaveBeenCalled()
  })

  it('pauses timer when pause button is clicked', async () => {
    ;(useDashboardStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      pomodoro: { ...defaultPomodoroState, isRunning: true },
      startPomodoro: mockStartPomodoro,
      pausePomodoro: mockPausePomodoro,
      resetPomodoro: mockResetPomodoro,
      tickPomodoro: mockTickPomodoro,
      skipPomodoroPhase: mockSkipPomodoroPhase,
    })

    render(<PomodoroWidget />)
    
    const pauseButton = screen.getByLabelText('Pause timer')
    await userEvent.click(pauseButton)

    expect(mockPausePomodoro).toHaveBeenCalled()
  })

  it('resets timer when reset button is clicked', async () => {
    render(<PomodoroWidget />)
    
    const resetButton = screen.getByLabelText('Reset timer')
    await userEvent.click(resetButton)

    expect(mockResetPomodoro).toHaveBeenCalled()
  })

  it('skips to next phase when skip button is clicked', async () => {
    render(<PomodoroWidget />)
    
    const skipButton = screen.getByLabelText('Skip to next phase')
    await userEvent.click(skipButton)

    expect(mockSkipPomodoroPhase).toHaveBeenCalled()
  })

  it('displays short break time correctly', () => {
    ;(useDashboardStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      pomodoro: { ...defaultPomodoroState, mode: 'shortBreak', timeLeft: 5 * 60 },
      startPomodoro: mockStartPomodoro,
      pausePomodoro: mockPausePomodoro,
      resetPomodoro: mockResetPomodoro,
      tickPomodoro: mockTickPomodoro,
      skipPomodoroPhase: mockSkipPomodoroPhase,
    })

    render(<PomodoroWidget />)
    
    expect(screen.getByText('Short Break')).toBeInTheDocument()
    expect(screen.getByText('05:00')).toBeInTheDocument()
  })

  it('displays long break time correctly', () => {
    ;(useDashboardStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      pomodoro: { ...defaultPomodoroState, mode: 'longBreak', timeLeft: 15 * 60 },
      startPomodoro: mockStartPomodoro,
      pausePomodoro: mockPausePomodoro,
      resetPomodoro: mockResetPomodoro,
      tickPomodoro: mockTickPomodoro,
      skipPomodoroPhase: mockSkipPomodoroPhase,
    })

    render(<PomodoroWidget />)
    
    expect(screen.getByText('Long Break')).toBeInTheDocument()
    expect(screen.getByText('15:00')).toBeInTheDocument()
  })

  it('displays sessions completed count', () => {
    ;(useDashboardStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      pomodoro: { ...defaultPomodoroState, sessionsCompleted: 3 },
      startPomodoro: mockStartPomodoro,
      pausePomodoro: mockPausePomodoro,
      resetPomodoro: mockResetPomodoro,
      tickPomodoro: mockTickPomodoro,
      skipPomodoroPhase: mockSkipPomodoroPhase,
    })

    render(<PomodoroWidget />)
    
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows settings panel when settings button is clicked', async () => {
    render(<PomodoroWidget />)
    
    const settingsButton = screen.getByText('Settings')
    await userEvent.click(settingsButton)

    expect(screen.getByText('Work Duration (minutes)')).toBeInTheDocument()
  })

  it('toggles settings visibility', async () => {
    render(<PomodoroWidget />)
    
    const settingsButton = screen.getByText('Settings')
    await userEvent.click(settingsButton)
    expect(screen.getByText('Hide Settings')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Hide Settings'))
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })
})

describe('PomodoroWidget notifications', () => {
  const mockClearPomodoroCompletion = vi.fn()
  const notificationCtor = vi.fn() as unknown as {
    permission: NotificationPermission
    requestPermission: ReturnType<typeof vi.fn>
  }

  const defaultPomodoroState = {
    timeLeft: 25 * 60,
    isRunning: false,
    mode: 'work' as const,
    sessionsCompleted: 0,
  }

  const renderWith = (
    completion: { completedMode: string; nextMode: string; at: number } | null,
    notifications = DEFAULT_NOTIFICATION_PREFERENCES
  ) => {
    ;(useDashboardStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      pomodoro: defaultPomodoroState,
      startPomodoro: vi.fn(),
      pausePomodoro: vi.fn(),
      resetPomodoro: vi.fn(),
      tickPomodoro: vi.fn(),
      skipPomodoroPhase: vi.fn(),
      preferences: { notifications },
      lastPomodoroCompletion: completion,
      clearPomodoroCompletion: mockClearPomodoroCompletion,
    })
    return render(<PomodoroWidget />)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    notificationCtor.permission = 'granted'
    notificationCtor.requestPermission = vi.fn(async () => 'granted' as NotificationPermission)
    Object.defineProperty(window, 'Notification', {
      configurable: true,
      writable: true,
      value: notificationCtor,
    })
  })

  afterEach(() => {
    // @ts-expect-error - resetting the simulated browser API
    delete window.Notification
  })

  it('notifies when a focus session completes', () => {
    renderWith({ completedMode: 'work', nextMode: 'shortBreak', at: Date.now() })

    expect(notificationCtor).toHaveBeenCalledWith(
      'Focus session complete',
      expect.objectContaining({ tag: 'bento-pomodoro' })
    )
    expect(mockClearPomodoroCompletion).toHaveBeenCalled()
  })

  it('notifies when a break ends', () => {
    renderWith({ completedMode: 'shortBreak', nextMode: 'work', at: Date.now() })

    expect(notificationCtor).toHaveBeenCalledWith('Short break over', expect.any(Object))
  })

  it('stays quiet when no phase completed', () => {
    renderWith(null)

    expect(notificationCtor).not.toHaveBeenCalled()
    expect(mockClearPomodoroCompletion).not.toHaveBeenCalled()
  })

  it('respects the pomodoro notification setting', () => {
    renderWith({ completedMode: 'work', nextMode: 'shortBreak', at: Date.now() }, {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      pomodoro: false,
    })

    expect(notificationCtor).not.toHaveBeenCalled()
  })
})
