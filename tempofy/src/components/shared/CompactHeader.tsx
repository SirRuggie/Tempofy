import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Tempo, TEMPO_CONFIG } from '../../lib/supabase'
import { Colors, GlassMorphism, Typography } from '../../styles/colors'
import { LogoHorizontal } from './Logo'

interface CompactHeaderProps {
  currentTempo: Tempo
  onTempoPress?: () => void
  onFermataPress?: () => void
  onMelodyCapturePress?: () => void
}

export const CompactHeader: React.FC<CompactHeaderProps> = ({
  currentTempo,
  onTempoPress,
  onFermataPress,
  onMelodyCapturePress
}) => {
  const tempoConfig = TEMPO_CONFIG[currentTempo]
  
  const getTempoColor = (tempo: Tempo): string => {
    switch (tempo) {
      case 'allegro': return Colors.tempo.allegro.primary
      case 'moderato': return Colors.tempo.moderato.primary
      case 'adagio': return Colors.tempo.adagio.primary
      default: return Colors.tempo.moderato.primary
    }
  }

  const tempoColor = getTempoColor(currentTempo)

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoWrapper}>
          <LogoHorizontal width={120} height={32} style={styles.logo} />
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.melodyButton}
          onPress={onMelodyCapturePress}
          activeOpacity={0.8}
        >
          <Text style={styles.melodyIcon}>💭</Text>
          <Text style={styles.melodyLabel}>Quick Note</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.fermataButton}
          onPress={onFermataPress}
          activeOpacity={0.8}
        >
          <Text style={styles.fermataIcon}>😌</Text>
          <Text style={styles.fermataLabel}>Pause</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tempoBadge, { borderColor: tempoColor }]}
          onPress={onTempoPress}
          activeOpacity={0.8}
        >
          <Text style={styles.tempoEmoji}>{tempoConfig.emoji}</Text>
          <View style={styles.tempoInfo}>
            <Text style={[styles.tempoLabel, { color: tempoColor }]}>
              {tempoConfig.label}
            </Text>
            <Text style={styles.tempoHint}>Tap to change</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  
  logoContainer: {
    flex: 1,
  },
  
  logoWrapper: {
    ...GlassMorphism.card,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  logo: {
    opacity: 0.95,
  },
  
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  melodyButton: {
    ...GlassMorphism.button,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    backgroundColor: Colors.accent.golden + '15',
    borderColor: Colors.accent.golden + '60',
    borderWidth: 1,
    minWidth: 60,
  },
  
  melodyIcon: {
    fontSize: 16,
    color: Colors.accent.golden,
    marginBottom: 2,
  },
  
  melodyLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.accent.golden,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  fermataButton: {
    ...GlassMorphism.button,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: Colors.accent.success + '15',
    borderColor: Colors.accent.success + '60',
    borderWidth: 1,
    minWidth: 50,
  },
  
  fermataIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  
  fermataLabel: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.accent.success,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  
  tempoBadge: {
    ...GlassMorphism.button,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    minWidth: 120,
  },
  
  tempoEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  
  tempoInfo: {
    flex: 1,
  },
  
  tempoLabel: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  
  tempoHint: {
    ...Typography.caption,
    fontSize: 10,
    opacity: 0.8,
    lineHeight: 12,
  },
})