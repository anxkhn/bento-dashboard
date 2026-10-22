export type WidgetType = 
  | 'clock'
  | 'weather'
  | 'notes'
  | 'pomodoro'
  | 'tasks'
  | 'quote'
  | 'calendar'
  | 'search';

export type WidgetSize = 'small' | 'medium' | 'large';

export interface Position {
  x: number;
  y: number;
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  position: Position;
  size: WidgetSize;
  settings?: Record<string, unknown>;
}

export interface Note {
  id: string;
  content: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
}

export interface PomodoroState {
  timeLeft: number;
  isRunning: boolean;
  mode: 'work' | 'shortBreak' | 'longBreak';
  sessionsCompleted: number;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  icon: string;
}

export interface Quote {
  text: string;
  author: string;
  category: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface NotificationPreferences {
  /** Master switch for every notification the dashboard sends. */
  enabled: boolean;
  /** Notify when a focus session or break finishes. */
  pomodoro: boolean;
  /** Remind about tasks that are due. */
  tasks: boolean;
  /** How long before the due date a task reminder fires. */
  taskReminderLeadMinutes: number;
}

export interface UserPreferences {
  theme: ThemeMode;
  userName: string;
  dashboardLayout: 'grid' | 'flex';
  animationsEnabled: boolean;
  notifications: NotificationPreferences;
}

export interface PomodoroCompletion {
  completedMode: PomodoroState['mode'];
  nextMode: PomodoroState['mode'];
  at: number;
}

export interface DashboardState {
  widgets: WidgetConfig[];
  notes: Note[];
  tasks: Task[];
  pomodoro: PomodoroState;
  weather: WeatherData | null;
  preferences: UserPreferences;
  lastPomodoroCompletion: PomodoroCompletion | null;
}
