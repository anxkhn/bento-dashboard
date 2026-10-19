import { Component, type ErrorInfo, type ReactNode } from 'react'
import { WIDGET_REGISTRY } from './WidgetRegistry'
import type { WidgetType } from '../types'

interface ErrorBoundaryProps {
  children: ReactNode
  widgetType?: WidgetType
  onError?: (error: Error, info: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const label = this.props.widgetType
      ? WIDGET_REGISTRY[this.props.widgetType]?.name ?? this.props.widgetType
      : 'Widget'
    console.error(`[ErrorBoundary:${label}]`, error, info)
    this.props.onError?.(error, info)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const label = this.props.widgetType
      ? WIDGET_REGISTRY[this.props.widgetType]?.name ?? this.props.widgetType
      : 'Widget'

    return (
      <div className="widget-card p-6 h-full flex flex-col items-center justify-center text-center gap-3">
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          {label} failed to load
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 break-words max-w-full">
          {this.state.error?.message ?? 'An unexpected error occurred.'}
        </p>
        <button
          type="button"
          onClick={this.handleRetry}
          className="btn-primary text-xs"
        >
          Try again
        </button>
      </div>
    )
  }
}