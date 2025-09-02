import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { Movement } from '../../lib/supabase'
import { MovementModule } from '../../modules/MovementModule'
import { Colors, GlassMorphism, Typography } from '../../styles/colors'

interface MovementWithProgress extends Movement {
  taskCount: number
  completedCount: number
  percentage: number
  dominantTempo: string | null
}

interface MovementListProps {
  movements: MovementWithProgress[]
  onRefresh: () => void
  onAddMovement: () => void
  onMovementPress: (movement: Movement) => void
  onMovementDelete?: (movementId: string) => void
}

export const MovementList: React.FC<MovementListProps> = ({
  movements,
  onRefresh,
  onAddMovement,
  onMovementPress,
  onMovementDelete
}) => {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setRefreshing(false)
    }
  }

  const handleDeleteMovement = (movement: Movement) => {
    Alert.alert(
      'Delete Movement?',
      `Remove "${movement.name}" and unlink all its tasks?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onMovementDelete?.(movement.id)
        }
      ]
    )
  }

  const getProgressRingStyle = (percentage: number, color: string) => {
    const circumference = 2 * Math.PI * 20
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference
    
    return {
      strokeDasharray,
      strokeDashoffset,
      stroke: color
    }
  }

  const getTempoEmoji = (tempo: string | null) => {
    switch (tempo) {
      case 'allegro': return '🎵'
      case 'moderato': return '🎶'
      case 'adagio': return '🎼'
      default: return '🎭'
    }
  }

  if (movements.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🎭</Text>
        <Text style={styles.emptyTitle}>No Movements Yet</Text>
        <Text style={styles.emptyMessage}>
          Create your first movement to organize related tasks into beautiful harmonies!
        </Text>
        <TouchableOpacity style={styles.addFirstButton} onPress={onAddMovement}>
          <Text style={styles.addFirstButtonText}>🎼 Create Your First Movement</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      <View style={styles.header}>
        <Text style={styles.title}>🎭 Your Movements</Text>
        <Text style={styles.subtitle}>
          {movements.length} movement{movements.length !== 1 ? 's' : ''} in your orchestra
        </Text>
      </View>

      <View style={styles.movementsContainer}>
        {movements.map((movement) => {
          const typeEmoji = MovementModule.getMovementEmoji(movement.type)
          const typeLabel = MovementModule.getMovementTypeLabel(movement.type)
          
          return (
            <TouchableOpacity
              key={movement.id}
              style={[styles.movementCard, { borderLeftColor: movement.color_theme }]}
              onPress={() => onMovementPress(movement)}
              activeOpacity={0.9}
            >
              <View style={styles.cardHeader}>
                <View style={styles.movementInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.movementEmoji}>{typeEmoji}</Text>
                    <View style={styles.titleContainer}>
                      <Text style={styles.movementName}>{movement.name}</Text>
                      <Text style={styles.movementType}>{typeLabel}</Text>
                    </View>
                  </View>
                  {movement.description && (
                    <Text style={styles.movementDescription}>{movement.description}</Text>
                  )}
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressRing}>
                    <Text style={styles.progressPercentage}>{movement.percentage}%</Text>
                    <View style={styles.progressCircle}>
                      <View 
                        style={[
                          styles.progressFill,
                          { 
                            backgroundColor: movement.color_theme,
                            transform: [{ 
                              rotate: `${(movement.percentage / 100) * 360}deg` 
                            }]
                          }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.cardStats}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{movement.taskCount}</Text>
                  <Text style={styles.statLabel}>Notes</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{movement.completedCount}</Text>
                  <Text style={styles.statLabel}>Complete</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statEmoji}>{getTempoEmoji(movement.dominantTempo)}</Text>
                  <Text style={styles.statLabel}>Tempo</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {movement.taskCount - movement.completedCount}
                  </Text>
                  <Text style={styles.statLabel}>Remaining</Text>
                </View>
              </View>

              {movement.percentage === 100 && (
                <View style={styles.completeBadge}>
                  <Text style={styles.completeText}>🎉 Movement Complete!</Text>
                </View>
              )}

              <View style={[styles.movementGlow, { backgroundColor: movement.color_theme + '10' }]} />

              {onMovementDelete && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteMovement(movement)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          )
        })}
      </View>

      <TouchableOpacity style={styles.addMoreButton} onPress={onAddMovement}>
        <Text style={styles.addMoreButtonText}>🎼 Create Another Movement</Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
  },
  
  subtitle: {
    ...Typography.body,
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
  
  movementsContainer: {
    padding: 16,
    gap: 16,
  },
  
  movementCard: {
    ...GlassMorphism.card,
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  
  movementInfo: {
    flex: 1,
    marginRight: 16,
  },
  
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  movementEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  
  titleContainer: {
    flex: 1,
  },
  
  movementName: {
    ...Typography.heading2,
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 2,
  },
  
  movementType: {
    ...Typography.caption,
    fontSize: 12,
    opacity: 0.8,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  
  movementDescription: {
    ...Typography.body,
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  
  progressContainer: {
    alignItems: 'center',
  },
  
  progressRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.ui.border + '30',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  progressPercentage: {
    ...Typography.label,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  
  progressCircle: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    transformOrigin: 'right center',
  },
  
  cardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  
  stat: {
    alignItems: 'center',
  },
  
  statValue: {
    ...Typography.heading3,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  
  statEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  
  statLabel: {
    ...Typography.caption,
    fontSize: 11,
    opacity: 0.8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  
  completeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.accent.success + '20',
    borderColor: Colors.accent.success,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  
  completeText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.accent.success,
    fontWeight: '700',
  },
  
  movementGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    opacity: 0.1,
  },
  
  deleteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.ui.destructive + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  deleteButtonText: {
    color: Colors.ui.destructive,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  addMoreButton: {
    ...GlassMorphism.card,
    backgroundColor: 'transparent',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.tempo.moderato.primary,
    borderStyle: 'dashed',
  },
  
  addMoreButtonText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.tempo.moderato.primary,
    textAlign: 'center',
  },
  
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 24,
    opacity: 0.8,
  },
  
  emptyTitle: {
    ...Typography.heading2,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  
  emptyMessage: {
    ...Typography.body,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    opacity: 0.8,
  },
  
  addFirstButton: {
    ...GlassMorphism.card,
    backgroundColor: Colors.tempo.moderato.primary,
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 28,
  },
  
  addFirstButtonText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  
  bottomPadding: {
    height: 100,
  },
})