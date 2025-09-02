import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Tempo, TEMPO_CONFIG } from '../../lib/supabase'
import { Colors, GlassMorphism, Typography } from '../../styles/colors'

interface TempoScreenProps {
  currentTempo: Tempo
  onTempoChange: (tempo: Tempo) => void
}

export const TempoScreen: React.FC<TempoScreenProps> = ({
  currentTempo,
  onTempoChange
}) => {
  const getTempoColor = (tempo: Tempo): string => {
    switch (tempo) {
      case 'allegro': return Colors.tempo.allegro.primary
      case 'moderato': return Colors.tempo.moderato.primary
      case 'adagio': return Colors.tempo.adagio.primary
      default: return Colors.tempo.moderato.primary
    }
  }

  const getTempoDescription = (tempo: Tempo): string => {
    switch (tempo) {
      case 'allegro':
        return 'High energy, quick tasks. Perfect when you feel energized and want to tackle multiple items rapidly.'
      case 'moderato':
        return 'Steady pace, balanced focus. Ideal for sustained work sessions with moderate complexity.'
      case 'adagio':
        return 'Gentle pace, mindful tasks. Best when you need calm focus or feel overwhelmed.'
      default:
        return 'Balanced productivity'
    }
  }

  const tempoOptions: Tempo[] = ['allegro', 'moderato', 'adagio']

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Tempo</Text>
        <Text style={styles.subtitle}>
          How are you feeling today? Your tempo helps match tasks to your energy level.
        </Text>
      </View>

      <View style={styles.tempoContainer}>
        {tempoOptions.map((tempo) => {
          const config = TEMPO_CONFIG[tempo]
          const isSelected = currentTempo === tempo
          const tempoColor = getTempoColor(tempo)
          
          return (
            <TouchableOpacity
              key={tempo}
              style={[
                styles.tempoCard,
                isSelected && { 
                  borderColor: tempoColor, 
                  backgroundColor: tempoColor + '20' 
                }
              ]}
              onPress={() => onTempoChange(tempo)}
              activeOpacity={0.8}
            >
              <View style={styles.tempoHeader}>
                <Text style={styles.tempoEmoji}>{config.emoji}</Text>
                <View style={styles.tempoTitleContainer}>
                  <Text style={[
                    styles.tempoLabel,
                    isSelected && { color: tempoColor }
                  ]}>
                    {config.label}
                  </Text>
                  {isSelected && (
                    <Text style={styles.currentBadge}>Current</Text>
                  )}
                </View>
              </View>
              
              <Text style={styles.tempoDescription}>
                {getTempoDescription(tempo)}
              </Text>

              <View style={styles.tempoFeatures}>
                {tempo === 'allegro' && (
                  <>
                    <Text style={styles.feature}>• Quick wins & rapid completion</Text>
                    <Text style={styles.feature}>• Multiple small tasks</Text>
                    <Text style={styles.feature}>• High motivation periods</Text>
                  </>
                )}
                {tempo === 'moderato' && (
                  <>
                    <Text style={styles.feature}>• Balanced work sessions</Text>
                    <Text style={styles.feature}>• Medium complexity tasks</Text>
                    <Text style={styles.feature}>• Consistent productivity</Text>
                  </>
                )}
                {tempo === 'adagio' && (
                  <>
                    <Text style={styles.feature}>• Deep focus work</Text>
                    <Text style={styles.feature}>• Mindful task completion</Text>
                    <Text style={styles.feature}>• Gentle, sustainable pace</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          )
        })}
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Tempo Tips</Text>
          <Text style={styles.infoText}>
            Your tempo can change throughout the day. It's perfectly normal to switch between them based on your energy, mood, and the type of work you need to do.
          </Text>
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  header: {
    padding: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  
  title: {
    ...Typography.heading1,
    fontSize: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  
  subtitle: {
    ...Typography.body,
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
  },
  
  tempoContainer: {
    padding: 20,
    paddingTop: 8,
  },
  
  tempoCard: {
    ...GlassMorphism.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.ui.border,
  },
  
  tempoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  tempoEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  
  tempoTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  tempoLabel: {
    ...Typography.heading3,
    fontSize: 20,
  },
  
  currentBadge: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accent.success,
    backgroundColor: Colors.accent.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    textTransform: 'uppercase',
  },
  
  tempoDescription: {
    ...Typography.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.9,
  },
  
  tempoFeatures: {
    marginTop: 8,
  },
  
  feature: {
    ...Typography.caption,
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 16,
    marginBottom: 4,
  },
  
  infoSection: {
    padding: 20,
    paddingTop: 8,
  },
  
  infoCard: {
    ...GlassMorphism.card,
    borderRadius: 16,
    padding: 16,
    backgroundColor: Colors.accent.golden + '10',
    borderColor: Colors.accent.golden + '30',
  },
  
  infoTitle: {
    ...Typography.heading3,
    fontSize: 16,
    marginBottom: 8,
    color: Colors.accent.golden,
  },
  
  infoText: {
    ...Typography.caption,
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  
  bottomPadding: {
    height: 100,
  },
})