import { Audio } from 'expo-av'
import { Tempo } from '../lib/supabase'

export class SoundModule {
  private static sounds: { [key: string]: Audio.Sound } = {}

  // Initialize sound system
  static async initialize(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      })
    } catch (error) {
      console.log('Failed to initialize audio:', error)
    }
  }

  // Play completion sound based on tempo
  static async playCompletionSound(tempo: Tempo): Promise<void> {
    try {
      // For now, we'll use different patterns of the default system sound
      // In a full implementation, you'd have actual audio files
      
      const patterns = {
        allegro: [100, 50, 100], // Fast, energetic pattern
        moderato: [150, 75, 150], // Balanced pattern  
        adagio: [250, 125, 250] // Gentle, slow pattern
      }

      const pattern = patterns[tempo]
      
      // Create a simple sound pattern using vibration and haptics
      if (pattern) {
        for (let i = 0; i < pattern.length; i++) {
          setTimeout(() => {
            // This would trigger haptic feedback on device
            // For web, we could use the Web Audio API
            this.playNote(pattern[i])
          }, i * 200)
        }
      }
    } catch (error) {
      console.log('Failed to play completion sound:', error)
    }
  }

  // Play a simple note (placeholder - would use actual audio)
  private static async playNote(frequency: number): Promise<void> {
    try {
      // In a real implementation, this would play an actual audio note
      // For now, just log the intention
      console.log(`🎵 Playing note at ${frequency}Hz`)
      
      // You could use expo-haptics for tactile feedback:
      // import * as Haptics from 'expo-haptics'
      // await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } catch (error) {
      console.log('Failed to play note:', error)
    }
  }

  // Play celebratory sound for streaks/achievements
  static async playCelebration(): Promise<void> {
    try {
      // Play a celebratory melody
      const melody = [262, 294, 330, 349, 392, 440, 494, 523] // C major scale
      
      for (let i = 0; i < melody.length; i++) {
        setTimeout(() => {
          this.playNote(melody[i])
        }, i * 100)
      }
    } catch (error) {
      console.log('Failed to play celebration:', error)
    }
  }

  // Play gentle notification sound
  static async playNotification(): Promise<void> {
    try {
      // Gentle notification pattern
      await this.playNote(440) // A note
      setTimeout(() => this.playNote(523), 150) // C note
    } catch (error) {
      console.log('Failed to play notification:', error)
    }
  }

  // Get completion message with sound emoji
  static getCompletionFeedback(tempo: Tempo, measuresEarned: number): {
    sound: string
    message: string
    celebration?: boolean
  } {
    const feedback = {
      allegro: {
        sound: '🎵✨',
        message: `Lightning speed! +${measuresEarned} measures! Your energy is contagious! ⚡`,
        celebration: measuresEarned >= 5
      },
      moderato: {
        sound: '🎶🌟', 
        message: `Perfect rhythm! +${measuresEarned} measures! You're finding your flow! 🌊`,
        celebration: measuresEarned >= 3
      },
      adagio: {
        sound: '🎼💫',
        message: `Mindfully completed! +${measuresEarned} measures! Gentle steps count too! 🌸`,
        celebration: measuresEarned >= 2
      }
    }

    return feedback[tempo]
  }

  // Clean up sounds
  static async cleanup(): Promise<void> {
    try {
      for (const sound of Object.values(this.sounds)) {
        await sound.unloadAsync()
      }
      this.sounds = {}
    } catch (error) {
      console.log('Failed to cleanup sounds:', error)
    }
  }
}

// Haptic feedback patterns for different interactions
export const HapticPatterns = {
  taskComplete: 'impactMedium',
  taskAdd: 'impactLight', 
  tempoChange: 'impactHeavy',
  celebration: 'notificationSuccess',
  error: 'notificationError'
} as const