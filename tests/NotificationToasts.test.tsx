import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationToasts } from '../src/components/NotificationToasts'
import { showNotification } from '../src/utils/notifications'

describe('NotificationToasts', () => {
  beforeEach(() => {
    // No Notification API - every notification takes the in-app fallback path.
    // @ts-expect-error - simulating a browser without the API
    delete window.Notification
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders nothing until a notification falls back', () => {
    const { container } = render(<NotificationToasts />)

    expect(container).toBeEmptyDOMElement()
  })

  it('shows a toast for a notification that could not be delivered', () => {
    render(<NotificationToasts />)

    act(() => {
      showNotification('Focus session complete', { body: 'Time for a break.' })
    })

    expect(screen.getByText('Focus session complete')).toBeInTheDocument()
    expect(screen.getByText('Time for a break.')).toBeInTheDocument()
  })

  it('lets the user dismiss a toast', async () => {
    render(<NotificationToasts />)

    act(() => {
      showNotification('Task overdue')
    })
    await userEvent.click(screen.getByLabelText('Dismiss notification'))

    expect(screen.queryByText('Task overdue')).not.toBeInTheDocument()
  })

  it('auto-dismisses toasts', () => {
    vi.useFakeTimers()
    render(<NotificationToasts />)

    act(() => {
      showNotification('Task overdue')
    })
    expect(screen.getByText('Task overdue')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(8000)
    })

    expect(screen.queryByText('Task overdue')).not.toBeInTheDocument()
  })

  it('keeps at most three toasts on screen', () => {
    render(<NotificationToasts />)

    act(() => {
      showNotification('First')
      showNotification('Second')
      showNotification('Third')
      showNotification('Fourth')
    })

    expect(screen.queryByText('First')).not.toBeInTheDocument()
    expect(screen.getAllByLabelText('Dismiss notification')).toHaveLength(3)
  })
})
