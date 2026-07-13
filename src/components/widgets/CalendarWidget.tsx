import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events] = useState<Record<string, string[]>>({})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentDate((prev) => subMonths(prev, 1))
      } else if (e.key === 'ArrowRight') {
        setCurrentDate((prev) => addMonths(prev, 1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startDay = monthStart.getDay()
  const emptyDays = Array(startDay).fill(null)

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const handlePrevMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1))
  }

  const dateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  const selectedEvents = selectedDate ? events[dateKey] || [] : []

  return (
    <div className="widget-card p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={goToToday}
            className="text-xs px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="text-xs text-gray-400 font-medium" aria-hidden="true">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 flex-1">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isTodayDate = isToday(day)
          const dayEvents = events[format(day, 'yyyy-MM-dd')] || []
          const hasEvents = dayEvents.length > 0

          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`aspect-square rounded-lg text-sm flex flex-col items-center justify-center transition-colors ${
                !isCurrentMonth
                  ? 'text-gray-300 dark:text-gray-600'
                  : isSelected
                  ? 'bg-primary-500 text-white'
                  : isTodayDate
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
              aria-label={format(day, 'MMMM d, yyyy')}
              aria-pressed={isSelected || undefined}
            >
              <span>{format(day, 'd')}</span>
              {hasEvents && (
                <span className={`w-1 h-1 rounded-full mt-0.5 ${
                  isSelected ? 'bg-white' : 'bg-primary-500'
                }`} />
              )}
            </button>
          )
        })}
      </div>

      {selectedDate && selectedEvents.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 mb-2">
            Events on {format(selectedDate, 'MMM d')}
          </p>
          <ul className="space-y-1">
            {selectedEvents.map((event, index) => (
              <li key={index} className="text-sm text-gray-700 dark:text-gray-200">
                {event}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
