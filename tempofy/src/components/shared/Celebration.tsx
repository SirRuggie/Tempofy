import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { Colors, Typography } from '../../styles/colors'
import { Tempo } from '../../lib/supabase'

interface CelebrationProps {
  visible: boolean
  onComplete: () => void
  taskTitle: string
  tempo?: Tempo
}

export const Celebration: React.FC<CelebrationProps> = ({
  visible,
  onComplete,
  taskTitle,
  tempo = 'moderato'
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.5)).current
  const moveAnim = useRef(new Animated.Value(50)).current

  const getCelebrationMessage = (tempo: Tempo) => {
    const messages = {
      allegro: [
        "Lightning fast! ⚡",
        "Speed demon! 🚀",
        "Blazing through! 🔥",
        "On fire today! ✨"
      ],
      moderato: [
        "Perfect rhythm! 🎵",
        "Steady progress! ⭐", 
        "Great pace! 🌟",
        "In the zone! 🎼"
      ],
      adagio: [
        "Mindful completion! 🌸",
        "Gentle progress! 🕊️",
        "Thoughtful work! 🌺", 
        "Peaceful achievement! 🍃"
      ]
    }
    const tempoMessages = messages[tempo]
    return tempoMessages[Math.floor(Math.random() * tempoMessages.length)]
  }

  useEffect(() => {
    if (visible) {
      // Start the celebration animation
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(moveAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(3000), // Show for 3 seconds - more time to read
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(moveAnim, {
            toValue: -30,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ]).start(() => {
        onComplete()
      })
    }
  }, [visible, fadeAnim, scaleAnim, moveAnim, onComplete])

  if (!visible) return null

  const celebrationEmojis = ['🎉', '✨', '🎵', '🌟', '🎊', '💫']
  
  return (
    <View style={styles.overlay}>
      <Animated.View 
        style={[
          styles.celebrationContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: moveAnim }
            ]
          }
        ]}
      >
        <View style={styles.emojiContainer}>
          {celebrationEmojis.map((emoji, index) => (
            <Text key={index} style={[styles.emoji, { 
              transform: [{ 
                rotate: `${(index - 2.5) * 20}deg` 
              }] 
            }]}>
              {emoji}
            </Text>
          ))}
        </View>
        
        <Text style={styles.celebrationTitle}>{getCelebrationMessage(tempo)}</Text>
        <Text style={styles.celebrationMessage}>
          You completed: "{taskTitle.length > 40 ? taskTitle.slice(0, 40) + '...' : taskTitle}"
        </Text>
        <Text style={styles.motivationalText}>
          Keep up the rhythm! 🎵
        </Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1000,
  },
  
  celebrationContainer: {
    backgroundColor: Colors.background.glass,
    backdropFilter: 'blur(20px)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.ui.border,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 16,
    minWidth: 300,
    maxWidth: '90%',
  },
  
  emojiContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    height: 60,
  },
  
  emoji: {
    fontSize: 32,
    marginHorizontal: 4,
  },
  
  celebrationTitle: {
    ...Typography.heading2,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 12,
    color: Colors.accent.golden,
  },
  
  celebrationMessage: {
    ...Typography.body,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
  
  motivationalText: {
    ...Typography.caption,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
  },
})