import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useDashboardStore } from '../src/store/dashboardStore'
import { Dashboard } from '../src/components/Dashboard'
import { getWidgetSizeClasses } from '../src/components/WidgetRegistry'

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
    
    const addButton = screen.getByText('Add Widget')
    await userEvent.click(addButton)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Add Widget')).toBeInTheDocument()
  })

  it('displays widget types in add modal', async () => {
    render(<Dashboard />)
    
    const addButton = screen.getByText('Add Widget')
    await userEvent.click(addButton)

    expect(screen.getByText('Clock')).toBeInTheDocument()
    expect(screen.getByText('Weather')).toBeInTheDocument()
    expect(screen.getByText('Sticky Notes')).toBeInTheDocument()
    expect(screen.getByText('Pomodoro Timer')).toBeInTheDocument()
    expect(screen.getByText('Tasks')).toBeInTheDocument()
  })

  it('closes add widget modal when cancel is clicked', async () => {
    render(<Dashboard />)
    
    const addButton = screen.getByText('Add Widget')
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
    })

    render(<Dashboard />)
    
    expect(screen.getByText('Focus Time')).toBeInTheDocument()
    expect(screen.getByText('Tasks')).toBeInTheDocument()
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
    
    const widgetCard = screen.getByText('Focus Time').closest('.relative')
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

  describe('mobile layout', () => {
    const renderWithWidget = (size: 'small' | 'medium' | 'large') => {
      ;(useDashboardStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        widgets: [{ id: '1', type: 'clock', position: { x: 0, y: 0 }, size }],
        preferences: { userName: 'Test User', theme: 'light', animationsEnabled: true },
        addWidget: mockAddWidget,
        removeWidget: mockRemoveWidget,
      })
      render(<Dashboard />)
    }

    it('large widgets span one column on mobile and two from md up', () => {
      const classes = getWidgetSizeClasses('large').split(' ')

      expect(classes).toContain('col-span-1')
      expect(classes).toContain('md:col-span-2')
      expect(classes).not.toContain('col-span-2')
    })

    it('no widget size spans more than one column without a breakpoint', () => {
      for (const size of ['small', 'medium', 'large'] as const) {
        const unprefixedSpans = getWidgetSizeClasses(size)
          .split(' ')
          .filter((cls) => cls.startsWith('col-span-'))

        expect(unprefixedSpans).toEqual(['col-span-1'])
      }
    })

    it('renders a large widget wrapper with responsive column span', () => {
      renderWithWidget('large')

      const wrapper = screen.getByLabelText('Remove Clock widget').parentElement

      expect(wrapper).toHaveClass('col-span-1', 'md:col-span-2')
      expect(wrapper).not.toHaveClass('col-span-2')
    })

    it('shows the remove button without hovering', async () => {
      renderWithWidget('medium')

      const removeButton = screen.getByLabelText('Remove Clock widget')
      await userEvent.click(removeButton)

      expect(mockRemoveWidget).toHaveBeenCalledWith('1')
    })

    it('only hides the remove button for fine pointers', () => {
      renderWithWidget('medium')

      const removeButton = screen.getByLabelText('Remove Clock widget')

      expect(removeButton).not.toHaveClass('opacity-0')
      expect(removeButton).toHaveClass('pointer-fine:opacity-0', 'focus-visible:opacity-100')
    })

    it('gives header and remove controls a 44px minimum touch target', () => {
      renderWithWidget('medium')

      const controls = [
        screen.getByLabelText('Remove Clock widget'),
        screen.getByLabelText('Switch to flex layout'),
        screen.getByLabelText('Open settings'),
        screen.getByLabelText('Add new widget'),
      ]

      for (const control of controls) {
        expect(control).toHaveClass('min-w-11', 'min-h-11')
      }
    })

    it('allows the header to wrap on narrow screens', () => {
      render(<Dashboard />)

      expect(screen.getByRole('banner')).toHaveClass('flex-wrap')
    })
  })
})