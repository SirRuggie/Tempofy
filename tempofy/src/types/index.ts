// Re-export all types from Supabase lib for easy access
export * from '../lib/supabase'

// Additional UI-specific types
export interface ScreenProps {
  navigation?: any // React Navigation
  route?: any
}

export interface TempoSelectorProps {
  currentTempo: Tempo
  onTempoChange: (tempo: Tempo) => void
  showDescription?: boolean
}

export interface TaskCardProps {
  task: Task
  onComplete: (taskId: string) => void
  onEdit?: (task: Task) => void
  showTempo?: boolean
}

export interface PlaylistProps {
  tasks: Task[]
  currentTempo?: Tempo
  onTaskComplete: (taskId: string) => void
  onAddTask?: () => void
}

export interface MelodyCaptureProps {
  onCapture: (content: string, isVoice?: boolean) => void
  placeholder?: string
}

export interface MovementCardProps {
  movement: Movement
  onSelect: (movementId: string) => void
  showMemberCount?: boolean
}

export interface FermataViewProps {
  gentleTask?: Task
  onResume: () => void
  onCompleteTask?: (taskId: string) => void
}

// Theme and styling types
export interface TempoTheme {
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
  accent: string
}

export interface ColorThemes {
  'warm-amber': TempoTheme
  'fresh-green': TempoTheme
  'calm-blue': TempoTheme
  'focused-purple': TempoTheme
  'soft-pink': TempoTheme
  'ensemble-gold': TempoTheme
}

// State management types (for Zustand)
export interface UserState {
  user: User | null
  currentTempo: Tempo
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setCurrentTempo: (tempo: Tempo) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export interface TaskState {
  tasks: Task[]
  filteredTasks: Task[]
  currentFilter: Tempo | 'all'
  isLoading: boolean
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  completeTask: (taskId: string) => Promise<void>
  setFilter: (filter: Tempo | 'all') => void
}

export interface MovementState {
  movements: Movement[]
  currentMovement: Movement | null
  isLoading: boolean
  setMovements: (movements: Movement[]) => void
  setCurrentMovement: (movement: Movement | null) => void
  addMovement: (movement: Movement) => void
  updateMovement: (movementId: string, updates: Partial<Movement>) => void
  deleteMovement: (movementId: string) => void
}

export interface MelodyState {
  melodies: Melody[]
  isCapturing: boolean
  isProcessing: boolean
  setMelodies: (melodies: Melody[]) => void
  addMelody: (melody: Melody) => void
  processMelody: (melodyId: string) => Promise<string[]>
  clearProcessedMelodies: () => Promise<void>
  setCapturing: (capturing: boolean) => void
}

// API response types
export interface APIResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  page: number
  totalPages: number
  totalCount: number
}

// Form types
export interface CreateTaskForm {
  title: string
  description?: string
  tempoRequired: Tempo
  priority: number
  estimatedMinutes: number
  movementId?: string
}

export interface CreateMovementForm {
  name: string
  description?: string
  type: 'symphony' | 'ensemble' | 'solo'
  colorTheme: string
  isTemplate: boolean
  templateCategory?: string
}

export interface TempoCheckInForm {
  tempo: Tempo
  context?: string
  moodNote?: string
}

// Audio and voice types
export interface VoiceRecordingState {
  isRecording: boolean
  duration: number
  audioUri?: string
}

export interface AudioPlaybackState {
  isPlaying: boolean
  currentTrack?: string
  position: number
  duration: number
}