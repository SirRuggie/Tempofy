import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Musical tempo type definitions
export type Tempo = 'allegro' | 'moderato' | 'adagio'

export interface TempoConfig {
  allegro: {
    label: 'Fast & Energetic'
    emoji: '🎵'
    color: '#ff6b6b'
    description: 'High energy, quick tasks'
  }
  moderato: {
    label: 'Steady Rhythm'
    emoji: '🎶'  
    color: '#4ecdc4'
    description: 'Balanced pace, moderate focus'
  }
  adagio: {
    label: 'Gentle Pace'
    emoji: '🎼'
    color: '#95e1d3'  
    description: 'Calm energy, mindful approach'
  }
}

export const TEMPO_CONFIG: TempoConfig = {
  allegro: {
    label: 'Fast & Energetic',
    emoji: '🎵',
    color: '#ff6b6b',
    description: 'High energy, quick tasks'
  },
  moderato: {
    label: 'Steady Rhythm', 
    emoji: '🎶',
    color: '#4ecdc4',
    description: 'Balanced pace, moderate focus'
  },
  adagio: {
    label: 'Gentle Pace',
    emoji: '🎼', 
    color: '#95e1d3',
    description: 'Calm energy, mindful approach'
  }
}

// Database type definitions
export interface User {
  id: string
  email: string
  current_tempo: Tempo
  measures_completed: number
  rhythm_streak: number
  preferred_start_tempo: Tempo
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  tempo_required: Tempo
  completed: boolean
  movement_id?: string
  priority: number
  estimated_minutes: number
  energy_boost: number
  created_at: string
  completed_at?: string
  due_at?: string
  updated_at: string
}

export interface Movement {
  id: string
  user_id: string
  name: string
  description?: string
  type: 'symphony' | 'ensemble' | 'solo'
  ensemble_members: string[]
  color_theme: string
  is_template: boolean
  template_category?: string
  created_at: string
  updated_at: string
}

export interface Melody {
  id: string
  user_id: string
  content: string
  is_voice: boolean
  processed: boolean
  processing_notes?: string
  created_at: string
  processed_at?: string
}

export interface TempoHistoryEntry {
  id: string
  user_id: string
  tempo: Tempo
  context?: string
  mood_note?: string
  timestamp: string
}

export interface DailyComposition {
  id: string
  user_id: string
  date: string
  measures_earned: number
  notes_completed: number
  dominant_tempo: Tempo
  fermata_used: boolean
  created_at: string
}

// Helper functions
export const getTempoInfo = (tempo: Tempo) => TEMPO_CONFIG[tempo]

export const getTempoForEnergy = (energyLevel: number): Tempo => {
  if (energyLevel >= 7) return 'allegro'
  if (energyLevel >= 4) return 'moderato' 
  return 'adagio'
}

export const getTasksForTempo = (tasks: Task[], tempo: Tempo): Task[] => {
  return tasks.filter(task => !task.completed && task.tempo_required === tempo)
}

export const getGentlestTask = (tasks: Task[]): Task | null => {
  const incompleteTasks = tasks.filter(task => !task.completed)
  if (incompleteTasks.length === 0) return null
  
  // Sort by tempo (adagio first), then by priority, then by estimated time
  return incompleteTasks.sort((a, b) => {
    const tempoOrder = { adagio: 0, moderato: 1, allegro: 2 }
    if (tempoOrder[a.tempo_required] !== tempoOrder[b.tempo_required]) {
      return tempoOrder[a.tempo_required] - tempoOrder[b.tempo_required]
    }
    if (a.priority !== b.priority) {
      return a.priority - b.priority // lower number = higher priority
    }
    return a.estimated_minutes - b.estimated_minutes
  })[0]
}