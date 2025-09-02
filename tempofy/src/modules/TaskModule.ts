import { supabase, Task, Tempo, getTasksForTempo, getGentlestTask } from '../lib/supabase'

export class TaskModule {
  // Create a new musical note (task)
  static async createNote(userId: string, noteData: {
    title: string
    description?: string
    tempoRequired?: Tempo
    priority?: number
    estimatedMinutes?: number
    movementId?: string
  }): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: noteData.title,
        description: noteData.description,
        tempo_required: noteData.tempoRequired || 'moderato',
        priority: noteData.priority || 3,
        estimated_minutes: noteData.estimatedMinutes || 15,
        movement_id: noteData.movementId,
        energy_boost: TaskModule.calculateEnergyBoost(noteData.priority || 3, noteData.estimatedMinutes || 15)
      })
      .select()
      .single()
    
    if (error || !data) return null
    return data as Task
  }
  
  // Get user's playlist (task list) filtered by tempo
  static async getPlaylist(userId: string, tempo?: Tempo, movementId?: string): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (tempo) {
      query = query.eq('tempo_required', tempo)
    }
    
    if (movementId) {
      query = query.eq('movement_id', movementId)
    }
    
    const { data, error } = await query
    
    if (error || !data) return []
    return data as Task[]
  }
  
  // Complete a musical note with celebration
  static async completeNote(taskId: string, userId: string): Promise<{success: boolean, measuresEarned: number}> {
    const { data: task, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single()
    
    if (fetchError || !task) {
      return { success: false, measuresEarned: 0 }
    }
    
    // Mark task as completed
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ 
        completed: true, 
        completed_at: new Date().toISOString() 
      })
      .eq('id', taskId)
    
    if (updateError) {
      return { success: false, measuresEarned: 0 }
    }
    
    // Award measures (XP) to user
    const measuresEarned = task.energy_boost || 1
    await TaskModule.awardMeasures(userId, measuresEarned)
    
    // Update daily composition
    await TaskModule.updateDailyComposition(userId)
    
    return { success: true, measuresEarned }
  }
  
  // Find the gentlest incomplete note for Fermata mode
  static async getGentlestNote(userId: string): Promise<Task | null> {
    const tasks = await TaskModule.getPlaylist(userId)
    return getGentlestTask(tasks)
  }
  
  // Get tasks that match current tempo
  static async getTempoTasks(userId: string, tempo: Tempo): Promise<Task[]> {
    const tasks = await TaskModule.getPlaylist(userId)
    return getTasksForTempo(tasks, tempo)
  }
  
  // Calculate energy boost based on task difficulty
  private static calculateEnergyBoost(priority: number, estimatedMinutes: number): number {
    // Higher priority and longer tasks give more measures
    const priorityBoost = Math.max(1, 6 - priority) // Priority 1 = 5 points, Priority 5 = 1 point
    const timeBoost = Math.ceil(estimatedMinutes / 15) // 1 point per 15 minutes
    return Math.min(priorityBoost + timeBoost, 10) // Cap at 10 measures
  }
  
  // Award measures to user
  private static async awardMeasures(userId: string, measures: number): Promise<void> {
    await supabase.rpc('increment_measures', {
      user_id: userId,
      amount: measures
    })
    
    // Also update rhythm streak
    await TaskModule.updateRhythmStreak(userId)
  }
  
  // Update user's rhythm streak
  private static async updateRhythmStreak(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    // Check if user completed tasks yesterday and today
    const { data: todayTasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('completed_at', today)
      .limit(1)
    
    const { data: yesterdayTasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('completed_at', yesterday)
      .lt('completed_at', today)
      .limit(1)
    
    const { data: user } = await supabase
      .from('users')
      .select('rhythm_streak')
      .eq('id', userId)
      .single()
    
    let newStreak = 1
    
    if (user && yesterdayTasks && yesterdayTasks.length > 0) {
      // Continue streak if they completed tasks yesterday
      newStreak = user.rhythm_streak + 1
    } else if (user && user.rhythm_streak > 0) {
      // Reset streak if they missed yesterday
      newStreak = 1
    }
    
    await supabase
      .from('users')
      .update({ rhythm_streak: newStreak })
      .eq('id', userId)
  }
  
  // Update daily composition tracking
  private static async updateDailyComposition(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0]
    
    // Get today's completed tasks
    const { data: todayTasks } = await supabase
      .from('tasks')
      .select('tempo_required, energy_boost')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('completed_at', today)
    
    if (!todayTasks || todayTasks.length === 0) return
    
    // Calculate dominant tempo and total measures
    const tempoCount = todayTasks.reduce((acc, task) => {
      acc[task.tempo_required] = (acc[task.tempo_required] || 0) + 1
      return acc
    }, {} as Record<Tempo, number>)
    
    const dominantTempo = Object.entries(tempoCount).sort(([,a], [,b]) => b - a)[0][0] as Tempo
    const measuresEarned = todayTasks.reduce((sum, task) => sum + (task.energy_boost || 1), 0)
    
    // Upsert daily composition
    await supabase
      .from('daily_compositions')
      .upsert({
        user_id: userId,
        date: today,
        measures_earned: measuresEarned,
        notes_completed: todayTasks.length,
        dominant_tempo: dominantTempo
      }, { onConflict: 'user_id,date' })
  }
  
  // Get task completion sound based on tempo
  static getCompletionSound(tempo: Tempo): string {
    const sounds = {
      allegro: '🎵✨', // Fast, energetic
      moderato: '🎶🌟', // Balanced, harmonious
      adagio: '🎼💫' // Gentle, peaceful
    }
    return sounds[tempo]
  }
  
  // Get encouraging completion message
  static getCompletionMessage(tempo: Tempo, measuresEarned: number): string {
    const messages = {
      allegro: [
        `Brilliant! ${measuresEarned} measures earned! Your energy is contagious! 🎵✨`,
        `Lightning speed! +${measuresEarned} measures! You're on fire today! ⚡🎵`,
        `Amazing tempo! ${measuresEarned} measures closer to your symphony! 🚀🎶`
      ],
      moderato: [
        `Well done! +${measuresEarned} measures! Steady progress builds symphonies! 🎶⭐`,
        `Perfect rhythm! ${measuresEarned} measures earned! You're finding your flow! 🌊🎵`,
        `Beautiful pace! +${measuresEarned} measures! Consistency is your strength! 💪🎼`
      ],
      adagio: [
        `Mindfully completed! +${measuresEarned} measures! Gentle steps count too! 🎼🌸`,
        `Thoughtful work! ${measuresEarned} measures earned! You're being kind to yourself! 💝🎵`,
        `Peaceful progress! +${measuresEarned} measures! Taking care of yourself is beautiful! ✨🎶`
      ]
    }
    
    const tempoMessages = messages[tempo]
    return tempoMessages[Math.floor(Math.random() * tempoMessages.length)]
  }
}