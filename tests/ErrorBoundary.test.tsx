import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from '../src/components/ErrorBoundary'

function Boom({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('kaboom')
  return <div>all good</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <Boom shouldThrow={false} />
      </ErrorBoundary>
    )
    expect(screen.getByText('all good')).toBeInTheDocument()
  })

  it('renders fallback with widget name and error message when a child throws', () => {
    render(
      <ErrorBoundary widgetType="tasks">
        <Boom shouldThrow />
      </ErrorBoundary>
    )
    expect(screen.getByText(/Tasks failed to load/i)).toBeInTheDocument()
    expect(screen.getByText(/kaboom/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('calls onError when a child throws', () => {
    const onError = vi.fn()
    render(
      <ErrorBoundary onError={onError}>
        <Boom shouldThrow />
      </ErrorBoundary>
    )
    expect(onError).toHaveBeenCalledOnce()
  })

  it('recovers when the user clicks Try again and the child no longer throws', async () => {
    const user = userEvent.setup()
    let shouldThrow = true
    function Flaky() {
      if (shouldThrow) throw new Error('kaboom')
      return <div>recovered</div>
    }

    render(
      <ErrorBoundary>
        <Flaky />
      </ErrorBoundary>
    )
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument()

    shouldThrow = false
    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(screen.getByText('recovered')).toBeInTheDocument()
  })
})