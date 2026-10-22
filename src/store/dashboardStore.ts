import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type { 
  WidgetConfig, 
  Note, 
  Task, 
  PomodoroState, 
  PomodoroCompletion,
  WeatherData, 
  UserPreferences,
  NotificationPreferences,
  WidgetType,
  Position,
  WidgetSize
} from '../types'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../utils/notifications'

interface DashboardStore {
  widgets: WidgetConfig[]
  notes: Note[]
  tasks: Task[]
  pomodoro: PomodoroState
  weather: WeatherData | null
  preferences: UserPreferences
  lastPomodoroCompletion: PomodoroCompletion | null
  
  addWidget: (type: WidgetType, position: Position, size: WidgetSize) => void
  removeWidget: (id: string) => void
  updateWidgetPosition: (id: string, position: Position) => void
  updateWidgetSize: (id: string, size: WidgetSize) => void
  
  addNote: (content: string, color: string) => void
  updateNote: (id: string, content: string) => void
  deleteNote: (id: string) => void
  
  addTask: (title: string, priority: Task['priority'], dueDate?: Date) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  updateTaskPriority: (id: string, priority: Task['priority']) => void
  
  startPomodoro: () => void
  pausePomodoro: () => void
  resetPomodoro: () => void
  tickPomodoro: (elapsedSeconds?: number) => void
  skipPomodoroPhase: () => void
  clearPomodoroCompletion: () => void
  
  setWeather: (data: WeatherData) => void
  
  setTheme: (theme: UserPreferences['theme']) => void
  setUserName: (name: string) => void
  toggleAnimations: () => void
  updateNotificationPreferences: (changes: Partial<NotificationPreferences>) => void
}

const defaultWidgets: WidgetConfig[] = [
  { id: uuidv4(), type: 'clock', position: { x: 0, y: 0 }, size: 'medium' },
  { id: uuidv4(), type: 'weather', position: { x: 1, y: 0 }, size: 'medium' },
  { id: uuidv4(), type: 'notes', position: { x: 0, y: 1 }, size: 'large' },
  { id: uuidv4(), type: 'pomodoro', position: { x: 2, y: 0 }, size: 'small' },
  { id: uuidv4(), type: 'tasks', position: { x: 2, y: 1 }, size: 'medium' },
]

const defaultPreferences: UserPreferences = {
  theme: 'system',
  userName: 'User',
  dashboardLayout: 'grid',
  animationsEnabled: true,
  notifications: DEFAULT_NOTIFICATION_PREFERENCES,
}

const PHASE_DURATIONS: Record<PomodoroState['mode'], number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
}

const defaultPomodoro: PomodoroState = {
  timeLeft: PHASE_DURATIONS.work,
  isRunning: false,
  mode: 'work',
  sessionsCompleted: 0,
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      widgets: defaultWidgets,
      notes: [],
      tasks: [],
      pomodoro: defaultPomodoro,
      weather: null,
      preferences: defaultPreferences,
      lastPomodoroCompletion: null,

      addWidget: (type, position, size) => {
        const newWidget: WidgetConfig = {
          id: uuidv4(),
          type,
          position,
          size,
        }
        set((state) => ({
          widgets: [...state.widgets, newWidget],
        }))
      },

      removeWidget: (id) => {
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
        }))
      },

      updateWidgetPosition: (id, position) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, position } : w
          ),
        }))
      },

      updateWidgetSize: (id, size) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, size } : w
          ),
        }))
      },

      addNote: (content, color) => {
        const newNote: Note = {
          id: uuidv4(),
          content,
          color,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          notes: [...state.notes, newNote],
        }))
      },

      updateNote: (id, content) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, content, updatedAt: new Date() } : n
          ),
        }))
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        }))
      },

      addTask: (title, priority, dueDate) => {
        const newTask: Task = {
          id: uuidv4(),
          title,
          completed: false,
          priority,
          dueDate,
          createdAt: new Date(),
        }
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }))
      },

      toggleTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        }))
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }))
      },

      updateTaskPriority: (id, priority) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, priority } : t
          ),
        }))
      },

      startPomodoro: () => {
        set((state) => ({
          pomodoro: { ...state.pomodoro, isRunning: true },
        }))
      },

      pausePomodoro: () => {
        set((state) => ({
          pomodoro: { ...state.pomodoro, isRunning: false },
        }))
      },

      resetPomodoro: () => {
        set((state) => ({
          pomodoro: {
            ...state.pomodoro,
            timeLeft: PHASE_DURATIONS.work,
            isRunning: false,
            mode: 'work',
          },
        }))
      },

      tickPomodoro: (elapsedSeconds = 1) => {
        const state = get()
        if (!state.pomodoro.isRunning) return
        
        // Background tabs throttle timers, so the widget reports how much real
        // time actually passed instead of assuming exactly one second.
        const elapsed = Math.max(1, Math.floor(elapsedSeconds))
        const newTimeLeft = state.pomodoro.timeLeft - elapsed
        
        if (newTimeLeft <= 0) {
          const completedMode = state.pomodoro.mode
          const nextMode = completedMode === 'work' 
            ? (state.pomodoro.sessionsCompleted % 4 === 3 ? 'longBreak' : 'shortBreak')
            : 'work'
          
          const sessionsCompleted = completedMode === 'work' 
            ? state.pomodoro.sessionsCompleted + 1 
            : state.pomodoro.sessionsCompleted
          
          set({
            pomodoro: {
              ...state.pomodoro,
              timeLeft: PHASE_DURATIONS[nextMode],
              mode: nextMode,
              sessionsCompleted,
              isRunning: false,
            },
            lastPomodoroCompletion: {
              completedMode,
              nextMode,
              at: Date.now(),
            },
          })
        } else {
          set({
            pomodoro: {
              ...state.pomodoro,
              timeLeft: newTimeLeft,
            },
          })
        }
      },

      skipPomodoroPhase: () => {
        const state = get()
        const nextMode = state.pomodoro.mode === 'work' 
          ? (state.pomodoro.sessionsCompleted % 4 === 3 ? 'longBreak' : 'shortBreak')
          : 'work'
        
        const sessionsCompleted = state.pomodoro.mode === 'work' 
          ? state.pomodoro.sessionsCompleted + 1 
          : state.pomodoro.sessionsCompleted
        
        // Skipping is an explicit user action - no notification for it.
        set({
          pomodoro: {
            ...state.pomodoro,
            timeLeft: PHASE_DURATIONS[nextMode],
            mode: nextMode,
            sessionsCompleted,
            isRunning: false,
          },
        })
      },

      clearPomodoroCompletion: () => {
        set({ lastPomodoroCompletion: null })
      },

      setWeather: (data) => {
        set({ weather: data })
      },

      setTheme: (theme) => {
        set((state) => ({
          preferences: { ...state.preferences, theme },
        }))
      },

      setUserName: (name) => {
        set((state) => ({
          preferences: { ...state.preferences, userName: name },
        }))
      },

      toggleAnimations: () => {
        set((state) => ({
          preferences: { 
            ...state.preferences, 
            animationsEnabled: !state.preferences.animationsEnabled 
          },
        }))
      },

      updateNotificationPreferences: (changes) => {
        set((state) => ({
          preferences: {
            ...state.preferences,
            notifications: {
              ...DEFAULT_NOTIFICATION_PREFERENCES,
              ...state.preferences.notifications,
              ...changes,
            },
          },
        }))
      },
    }),
    {
      name: 'bento-dashboard-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        widgets: state.widgets,
        notes: state.notes,
        tasks: state.tasks,
        pomodoro: state.pomodoro,
        preferences: state.preferences,
      }),
      // Persisted preferences from older versions predate notification
      // settings, so fill in the defaults instead of leaving them undefined.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<DashboardStore>
        return {
          ...current,
          ...saved,
          preferences: {
            ...current.preferences,
            ...(saved.preferences ?? {}),
            notifications: {
              ...DEFAULT_NOTIFICATION_PREFERENCES,
              ...(saved.preferences?.notifications ?? {}),
            },
          },
        }
      },
    }
  )
)
