import { useState, useEffect } from 'react'
import { useDashboardStore } from '../store/dashboardStore'

export function ThemeToggle() {
  const { preferences, setTheme } = useDashboardStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const root = document.documentElement
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    
    const effectiveTheme = preferences.theme === 'system' 
      ? systemTheme 
      : preferences.theme
    
    if (effectiveTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [preferences.theme, mounted])

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setTheme(theme)
  }

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
      <button
        onClick={() => handleThemeChange('light')}
        className={`p-2 rounded-md transition-colors ${
          preferences.theme === 'light'
            ? 'bg-white dark:bg-gray-700 shadow-sm'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="Switch to light theme"
        aria-pressed={preferences.theme === 'light'}
      >
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
          />
        </svg>
      </button>
      <button
        onClick={() => handleThemeChange('dark')}
        className={`p-2 rounded-md transition-colors ${
          preferences.theme === 'dark'
            ? 'bg-white dark:bg-gray-700 shadow-sm'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="Switch to dark theme"
        aria-pressed={preferences.theme === 'dark'}
      >
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
          />
        </svg>
      </button>
      <button
        onClick={() => handleThemeChange('system')}
        className={`p-2 rounded-md transition-colors ${
          preferences.theme === 'system'
            ? 'bg-white dark:bg-gray-700 shadow-sm'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="Use system theme"
        aria-pressed={preferences.theme === 'system'}
      >
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
          />
        </svg>
      </button>
    </div>
  )
}
