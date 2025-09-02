import React, { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Colors, GlassMorphism, Typography } from '../../styles/colors'

interface VoiceRecorderProps {
  onVoiceCapture: (audioText: string) => void
  isVisible?: boolean
}

// For now, we'll simulate voice recording since Whisper API integration requires backend setup
export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onVoiceCapture,
  isVisible = true
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const pulseAnim = useRef(new Animated.Value(1)).current
  const waveAnim = useRef(new Animated.Value(0)).current
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRecording) {
      // Start pulse animation
      const pulseLoop = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => pulseLoop())
      }
      pulseLoop()

      // Start wave animation
      const waveLoop = () => {
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => waveLoop())
      }
      waveLoop()

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      pulseAnim.stopAnimation()
      waveAnim.stopAnimation()
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording, pulseAnim, waveAnim])

  const startRecording = async () => {
    try {
      // In a real implementation, you would:
      // 1. Request microphone permissions
      // 2. Start audio recording
      // 3. Send audio to Whisper API
      
      setIsRecording(true)
      setRecordingTime(0)
      
      // Haptic feedback on recording start
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      
      // Simulate recording feedback
      Alert.alert(
        'Voice Recording Started 🎤',
        'Recording your voice... (This is a simulation)',
        [{ text: 'Stop Recording', onPress: stopRecording }]
      )
    } catch (error) {
      Alert.alert('Recording Error', 'Failed to start voice recording')
    }
  }

  const stopRecording = async () => {
    try {
      setIsRecording(false)
      setRecordingTime(0)
      
      // Simulate voice-to-text conversion with intelligent processing
      const getIntelligentTranscription = (recordingDuration: number) => {
        // Categorize transcriptions by length/complexity based on recording time
        const shortTasks = [
          'Call Sarah back',
          'Buy milk',
          'Water plants',
          'Check email',
          'Take vitamins',
          'Walk the dog',
          'Pay bills'
        ]
        
        const mediumTasks = [
          'Schedule dentist appointment next week',
          'Buy birthday gift for Sarah',
          'Review project proposal by Friday',
          'Plan weekend hiking trip',
          'Update portfolio website',
          'Clean out garage this weekend'
        ]
        
        const longTasks = [
          'Finish writing the quarterly report and send it to the team for review',
          'Research vacation destinations for summer trip and create a budget spreadsheet',
          'Organize all family photos from last year and create digital albums',
          'Deep clean entire house including windows and organize all closets'
        ]
        
        // Select based on recording duration (3+ seconds = longer task)
        let selectedTasks = shortTasks
        if (recordingDuration >= 8) {
          selectedTasks = longTasks
        } else if (recordingDuration >= 4) {
          selectedTasks = mediumTasks
        }
        
        return selectedTasks[Math.floor(Math.random() * selectedTasks.length)]
      }
      
      const randomTranscription = getIntelligentTranscription(recordingTime)
      
      // Simulate realistic processing delay based on recording length
      const processingDelay = Math.min(1500 + (recordingTime * 200), 4000) // 1.5s base + 200ms per second
      
      setTimeout(async () => {
        onVoiceCapture(randomTranscription)
        
        // Play completion chime and show enhanced feedback
        const completionMessages = [
          'Voice perfectly captured! 🎤✨',
          'Transcription complete! 📝🔔',
          'Your voice has been decoded! 🎵💭',
          'Audio transformed to text! 🔊➡️📋'
        ]
        const randomMessage = completionMessages[Math.floor(Math.random() * completionMessages.length)]
        
        // Play completion haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        console.log('🎵 Playing completion chime and haptic feedback...')
        
        Alert.alert(
          randomMessage,
          `Transcribed: "${randomTranscription}"`,
          [{ text: 'Excellent! 🌟' }]
        )
      }, processingDelay)
      
    } catch (error) {
      Alert.alert('Processing Error', 'Failed to process voice recording')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isVisible) return null

  return (
    <View style={styles.container}>
      <View style={styles.voiceSection}>
        <View style={styles.titleContainer}>
          <Text style={styles.voiceTitle}>🎤 Voice Capture</Text>
          <View style={styles.demoBadge}>
            <Text style={styles.demoText}>DEMO MODE</Text>
          </View>
        </View>
        
        {isRecording ? (
          <View style={styles.recordingContainer}>
            <Animated.View 
              style={[
                styles.recordingButton,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopRecording}
                activeOpacity={0.8}
              >
                <View style={styles.stopIcon} />
              </TouchableOpacity>
            </Animated.View>
            
            <View style={styles.recordingInfo}>
              <Text style={styles.recordingText}>Recording...</Text>
              <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
              
              {/* Sound waves visualization */}
              <View style={styles.waveContainer}>
                {[0, 1, 2, 3, 4].map((index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.wave,
                      {
                        transform: [{
                          scaleY: waveAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 1.5],
                            extrapolate: 'clamp',
                          })
                        }],
                        opacity: waveAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.3, 0.8],
                        })
                      }
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={startRecording}
            activeOpacity={0.8}
          >
            <Text style={styles.voiceIcon}>🎤</Text>
            <Text style={styles.voiceButtonText}>Try Voice Demo</Text>
          </TouchableOpacity>
        )}
        
        <Text style={styles.voiceHint}>
          {isRecording 
            ? 'Demo recording... Tap stop when done'
            : 'Simulated voice-to-text • No real recording'
          }
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  
  voiceSection: {
    ...GlassMorphism.card,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    backgroundColor: Colors.accent.golden + '10',
    borderColor: Colors.accent.golden + '30',
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  demoBadge: {
    backgroundColor: Colors.accent.warning + '20',
    borderColor: Colors.accent.warning,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 12,
  },

  demoText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accent.warning,
    letterSpacing: 0.5,
  },
  
  voiceTitle: {
    ...Typography.heading3,
    fontSize: 16,
    color: Colors.accent.golden,
  },
  
  voiceButton: {
    ...GlassMorphism.button,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 25,
    backgroundColor: Colors.accent.golden + '20',
    borderColor: Colors.accent.golden,
    borderWidth: 2,
  },
  
  voiceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  
  voiceButtonText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.accent.golden,
  },
  
  voiceHint: {
    ...Typography.caption,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  
  recordingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  
  recordingButton: {
    marginBottom: 16,
  },
  
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent.error,
    justifyContent: 'center',
    alignItems: 'center',
    ...GlassMorphism.card,
    shadowColor: Colors.accent.error,
    shadowOpacity: 0.4,
  },
  
  stopIcon: {
    width: 20,
    height: 20,
    backgroundColor: Colors.text.primary,
    borderRadius: 4,
  },
  
  recordingInfo: {
    alignItems: 'center',
  },
  
  recordingText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.accent.error,
    marginBottom: 4,
  },
  
  recordingTime: {
    ...Typography.caption,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.accent.golden,
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  
  wave: {
    width: 4,
    height: 30,
    backgroundColor: Colors.accent.golden,
    borderRadius: 2,
    marginHorizontal: 3,
  },
})