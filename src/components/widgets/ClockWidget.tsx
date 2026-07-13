import { useState, useEffect } from 'react'
import { format } from 'date-fns'

export function ClockWidget() {
  const [time, setTime] = useState(new Date())
  const [is24Hour, setIs24Hour] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    if (is24Hour) {
      return format(date, 'HH:mm:ss')
    }
    return format(date, 'hh:mm:ss a')
  }

  const formatDate = (date: Date) => {
    return format(date, 'EEEE, MMMM do, yyyy')
  }

  const getGreeting = () => {
    const hour = time.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="widget-card p-6 h-full flex flex-col justify-center items-center text-center">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {getGreeting()}
      </p>
      <time 
        className="text-5xl font-bold tracking-tight mb-2"
        dateTime={time.toISOString()}
      >
        {formatTime(time)}
      </time>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {formatDate(time)}
      </p>
      <button
        onClick={() => setIs24Hour(!is24Hour)}
        className="mt-4 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        aria-label={`Switch to ${is24Hour ? '12-hour' : '24-hour'} format`}
      >
        {is24Hour ? 'Switch to 12-hour' : 'Switch to 24-hour'}
      </button>
    </div>
  )
}
