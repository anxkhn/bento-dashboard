import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useDashboardStore } from '../src/store/dashboardStore'
import { Dashboard } from '../src/components/Dashboard'

vi.mock('../src/store/dashboardStore', () => ({
  useDashboardStore: vi.fn(),
}))

describe('Dashboard', () => {
  const mockAddWidget = vi.fn()
  const mockRemoveWidget = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useDashboardStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      widgets: [],
      preferences: { userName: 'Test User', theme: 'light', animationsEnabled: true },
      addWidget: mockAddWidget,
      removeWidget: mockRemoveWidget,
    })
  })

  it('renders empty state when no widgets exist', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('No widgets yet')).toBeInTheDocument()
    expect(screen.getByText('Add your first widget to get started')).toBeInTheDocument()
  })

  it('displays welcome message with user name', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Welcome back, Test User')).toBeInTheDocument()
  })

  it('opens add widget modal when button is clicked', async () => {
    render(<Dashboard />)
    
    const addButton = screen.getByLabelText('Add new widget')
    await userEvent.click(addButton)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Add Widget' })).toBeInTheDocument()
  })

  it('displays widget types in add modal', async () => {
    render(<Dashboard />)
    
    const addButton = screen.getByLabelText('Add new widget')
    await userEvent.click(addButton)

    expect(screen.getByText('Clock')).toBeInTheDocument()
    expect(screen.getByText('Weather')).toBeInTheDocument()
    expect(screen.getByText('Sticky Notes')).toBeInTheDocument()
    expect(screen.getByText('Pomodoro Timer')).toBeInTheDocument()
    expect(screen.getByText('Tasks')).toBeInTheDocument()
  })

  it('closes add widget modal when cancel is clicked', async () => {
    render(<Dashboard />)
    
    const addButton = screen.getByLabelText('Add new widget')
    await userEvent.click(addButton)

    const cancelButton = screen.getByText('Cancel')
    await userEvent.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('opens settings panel when settings button is clicked', async () => {
    render(<Dashboard />)
    
    const settingsButton = screen.getByLabelText('Open settings')
    await userEvent.click(settingsButton)

    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByLabelText('Display Name')).toBeInTheDocument()
  })

  it('displays existing widgets', () => {
    ;(useDashboardStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      widgets: [
        { id: '1', type: 'clock', position: { x: 0, y: 0 }, size: 'medium' },
        { id: '2', type: 'tasks', position: { x: 1, y: 0 }, size: 'medium' },
      ],
      preferences: { userName: 'Test User', theme: 'light', animationsEnabled: true },
      addWidget: mockAddWidget,
      removeWidget: mockRemoveWidget,
      tasks: [],
      addTask: vi.fn(),
      toggleTask: vi.fn(),
      deleteTask: vi.fn(),
      updateTaskPriority: vi.fn(),
    })

    render(<Dashboard />)
    
    expect(screen.getByRole('button', { name: /Switch to 1[22]-hour format/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Tasks' })).toBeInTheDocument()
  })

  it('removes widget when remove button is clicked', async () => {
    ;(useDashboardStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      widgets: [
        { id: '1', type: 'clock', position: { x: 0, y: 0 }, size: 'medium' },
      ],
      preferences: { userName: 'Test User', theme: 'light', animationsEnabled: true },
      addWidget: mockAddWidget,
      removeWidget: mockRemoveWidget,
    })

    render(<Dashboard />)
    
    const widgetCard = screen
      .getByRole('button', { name: /Switch to 1[22]-hour format/ })
      .closest('.relative')
    if (widgetCard) {
      fireEvent.mouseEnter(widgetCard)
    }

    const removeButton = screen.getByLabelText('Remove Clock widget')
    await userEvent.click(removeButton)

    expect(mockRemoveWidget).toHaveBeenCalledWith('1')
  })

  it('toggles layout mode', async () => {
    render(<Dashboard />)
    
    const layoutButton = screen.getByLabelText('Switch to flex layout')
    await userEvent.click(layoutButton)

    expect(screen.getByLabelText('Switch to grid layout')).toBeInTheDocument()
  })
})