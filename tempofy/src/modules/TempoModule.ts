import { supabase, Tempo, getTempoInfo, getTempoForEnergy } from '../lib/supabase'

export class TempoModule {
  // Get user's current tempo
  static async getCurrentTempo(userId: string): Promise<Tempo> {
    const { data, error } = await supabase
      .from('users')
      .select('current_tempo')
      .eq('id', userId)
      .single()
      
    if (error || !data) {
      return 'moderato' // Default tempo
    }
    
    return data.current_tempo as Tempo
  }
  
  // Update user's current tempo
  static async setCurrentTempo(userId: string, tempo: Tempo): Promise<void> {
    // Save to tempo history
    await supabase.from('tempo_history').insert({
      user_id: userId,
      tempo,
      context: 'user_selection'
    })
    
    // Update user's current tempo
    await supabase
      .from('users')
      .update({ current_tempo: tempo })
      .eq('id', userId)
  }
  
  // Get tempo suggestions based on time of day and user patterns
  static async suggestTempo(userId: string): Promise<Tempo> {
    const hour = new Date().getHours()
    
    // Get user's historical patterns
    const { data: history } = await supabase
      .from('tempo_history')
      .select('tempo, timestamp')
      .eq('user_id', userId)
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order('timestamp', { ascending: false })
      .limit(50)
    
    if (history && history.length > 0) {
      // Find most common tempo for this time of day
      const hourlyPatterns = history.filter(entry => {
        const entryHour = new Date(entry.timestamp).getHours()
        return Math.abs(entryHour - hour) <= 2 // Within 2 hours
      })
      
      if (hourlyPatterns.length > 0) {
        const tempoCount = hourlyPatterns.reduce((acc, entry) => {
          acc[entry.tempo] = (acc[entry.tempo] || 0) + 1
          return acc
        }, {} as Record<Tempo, number>)
        
        const mostCommon = Object.entries(tempoCount).sort(([,a], [,b]) => b - a)[0]
        return mostCommon[0] as Tempo
      }
    }
    
    // Default time-of-day suggestions
    if (hour >= 6 && hour <= 10) return 'moderato' // Morning
    if (hour >= 11 && hour <= 14) return 'allegro' // Midday energy
    if (hour >= 15 && hour <= 18) return 'moderato' // Afternoon
    return 'adagio' // Evening/night
  }
  
  // Get tempo check-in prompt
  static getTempoPrompt(): string {
    const prompts = [
      "What's your tempo today? 🎵",
      "How's your rhythm feeling? 🎶",
      "What pace feels right now? 🎼",
      "Which tempo matches your energy? ✨",
      "How would you like to move today? 🌟"
    ]
    
    return prompts[Math.floor(Math.random() * prompts.length)]
  }
  
  // Get tempo-based encouragement
  static getTempoEncouragement(tempo: Tempo): string {
    const encouragements = {
      allegro: [
        "You're in the zone! Ride that energy wave! 🎵",
        "Fast and focused - you've got this rhythm! ⚡",
        "Your energy is electric today! ✨"
      ],
      moderato: [
        "Steady and strong - the perfect pace! 🎶", 
        "You're finding your groove beautifully! 🌟",
        "Balanced rhythm, balanced mind! 💫"
      ],
      adagio: [
        "Gentle steps still move mountains! 🎼",
        "Slow and mindful - that's courage too! 🌸",
        "Taking it easy shows self-compassion! 💝"
      ]
    }
    
    const messages = encouragements[tempo]
    return messages[Math.floor(Math.random() * messages.length)]
  }
  
  // Check if it's time for a tempo check-in
  static async shouldPromptTempoCheck(userId: string): Promise<boolean> {
    const { data: lastEntry } = await supabase
      .from('tempo_history')
      .select('timestamp')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()
    
    if (!lastEntry) return true
    
    const hoursSinceLastCheck = (Date.now() - new Date(lastEntry.timestamp).getTime()) / (1000 * 60 * 60)
    return hoursSinceLastCheck >= 4 // Prompt every 4 hours
  }
}