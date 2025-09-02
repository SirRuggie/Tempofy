import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { Task, Tempo, TEMPO_CONFIG, Movement } from '../../lib/supabase'
import { MovementModule } from '../../modules/MovementModule'
import { Colors, GlassMorphism, Typography } from '../../styles/colors'

interface PlaylistProps {
  tasks: Task[]
  currentTempo?: Tempo
  movements?: Movement[]
  onTaskComplete: (taskId: string) => Promise<void>
  onAddTask?: () => void
  onTaskPress?: (task: Task) => void
  filterByTempo?: boolean
  groupByMovement?: boolean
  onMovementPress?: (movement: Movement) => void
}

export const Playlist: React.FC<PlaylistProps> = ({
  tasks,
  currentTempo,
  movements = [],
  onTaskComplete,
  onAddTask,
  onTaskPress,
  filterByTempo = false,
  groupByMovement = false,
  onMovementPress
}) => {
  const filteredTasks = filterByTempo && currentTempo 
    ? tasks.filter(task => task.tempo_required === currentTempo && !task.completed)
    : tasks.filter(task => !task.completed)

  // Group tasks by movement if requested
  const groupedTasks = groupByMovement ? groupTasksByMovement(filteredTasks, movements) : null

  function groupTasksByMovement(tasks: Task[], movements: Movement[]) {
    const groups: Array<{
      movement: Movement | null
      tasks: Task[]
      count: number
    }> = []

    // Group tasks by movement
    const tasksWithMovement = tasks.filter(task => task.movement_id)
    const tasksWithoutMovement = tasks.filter(task => !task.movement_id)

    // Add movement groups
    movements.forEach(movement => {
      const movementTasks = tasksWithMovement.filter(task => task.movement_id === movement.id)
      if (movementTasks.length > 0) {
        groups.push({
          movement,
          tasks: movementTasks,
          count: movementTasks.length
        })
      }
    })

    // Add ungrouped tasks
    if (tasksWithoutMovement.length > 0) {
      groups.push({
        movement: null,
        tasks: tasksWithoutMovement,
        count: tasksWithoutMovement.length
      })
    }

    return groups
  }

  const renderTask = (task: Task) => {
    const tempoConfig = TEMPO_CONFIG[task.tempo_required]
    const priorityColor = getPriorityColor(task.priority)
    const tempoColor = getTempoColor(task.tempo_required)
    const taskMovement = task.movement_id 
      ? movements.find(m => m.id === task.movement_id) 
      : null
    
    return (
      <TouchableOpacity
        key={task.id}
        style={[styles.taskCard, { borderLeftColor: tempoColor }]}
        onPress={() => onTaskPress?.(task)}
        activeOpacity={0.9}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskMeta}>
            <View style={styles.tempoContainer}>
              <Text style={styles.tempoEmoji}>{tempoConfig.emoji}</Text>
              <Text style={styles.tempoMiniLabel}>{tempoConfig.label}</Text>
              {currentTempo === task.tempo_required && (
                <View style={styles.currentTempoIndicator}>
                  <Text style={styles.currentTempoText}>Perfect Match!</Text>
                </View>
              )}
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20', borderColor: priorityColor }]}>
              <Text style={[styles.priorityText, { color: priorityColor }]}>
                {getPriorityLabel(task.priority)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.completeButton, { backgroundColor: tempoColor }]}
            onPress={() => handleCompleteTask(task.id, task.title)}
            activeOpacity={0.8}
          >
            <Text style={styles.completeButtonText}>✓</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.taskTitle}>{task.title}</Text>
        
        {task.description && (
          <Text style={styles.taskDescription}>{task.description}</Text>
        )}

        {!groupByMovement && taskMovement && (
          <View style={styles.taskMovementBadge}>
            <Text style={styles.movementBadgeEmoji}>
              {MovementModule.getMovementEmoji(taskMovement.type)}
            </Text>
            <Text style={styles.movementBadgeText}>{taskMovement.name}</Text>
          </View>
        )}

        <View style={styles.taskFooter}>
          <View style={styles.estimatedTimeContainer}>
            <Text style={styles.timeIcon}>⏱️</Text>
            <Text style={styles.estimatedTime}>{task.estimated_minutes}m</Text>
          </View>
          <View style={[styles.energyBoost, { backgroundColor: Colors.accent.golden + '20' }]}>
            <Text style={styles.energyText}>🔋 +{task.energy_boost}</Text>
          </View>
        </View>
        
        <View style={[styles.taskGlow, { backgroundColor: tempoColor + '10' }]} />
      </TouchableOpacity>
    )
  }

  const handleCompleteTask = async (taskId: string, taskTitle: string) => {
    Alert.alert(
      'Complete this note? 🎵',
      `Mark "${taskTitle}" as complete?`,
      [
        { text: 'Not yet', style: 'cancel' },
        {
          text: 'Complete! 🎼',
          onPress: async () => {
            try {
              await onTaskComplete(taskId)
            } catch (error) {
              Alert.alert('Orchestra Error', 'Failed to complete task. Please try again!')
            }
          }
        }
      ]
    )
  }

  const getPriorityColor = (priority: number): string => {
    switch (priority) {
      case 1: return Colors.priority.forte
      case 2: return Colors.priority.mezzoForte
      case 3: return Colors.priority.mezzo
      case 4: return Colors.priority.mezzoPiano
      case 5: return Colors.priority.piano
      default: return Colors.priority.mezzo
    }
  }

  const getTempoColor = (tempo: Tempo): string => {
    switch (tempo) {
      case 'allegro': return Colors.tempo.allegro.primary
      case 'moderato': return Colors.tempo.moderato.primary
      case 'adagio': return Colors.tempo.adagio.primary
      default: return Colors.tempo.moderato.primary
    }
  }

  const getPriorityLabel = (priority: number): string => {
    switch (priority) {
      case 1: return 'High'
      case 2: return 'Medium'
      case 3: return 'Low'
      default: return 'Medium'
    }
  }

  if (filteredTasks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🎼</Text>
        <Text style={styles.emptyTitle}>
          {filterByTempo 
            ? `No ${currentTempo ? TEMPO_CONFIG[currentTempo].label.toLowerCase() : ''} notes yet` 
            : 'Your playlist is quiet'
          }
        </Text>
        <Text style={styles.emptyMessage}>
          {filterByTempo 
            ? `Create some notes that match your ${currentTempo} tempo!`
            : 'Add your first musical note to begin your symphony!'
          }
        </Text>
        {onAddTask && (
          <TouchableOpacity style={styles.addFirstButton} onPress={onAddTask}>
            <Text style={styles.addFirstButtonText}>🎵 Add Your First Note</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.playlistTitle}>
          {filterByTempo && currentTempo
            ? `${TEMPO_CONFIG[currentTempo].emoji} ${TEMPO_CONFIG[currentTempo].label} Playlist`
            : '🎼 Your Notes (Task List)'
          }
        </Text>
        <Text style={styles.playlistCount}>
          {filteredTasks.length} note{filteredTasks.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {groupByMovement && groupedTasks ? (
        // Grouped by movement rendering
        groupedTasks.map((group, groupIndex) => (
          <View key={group.movement?.id || 'ungrouped'} style={styles.movementGroup}>
            <TouchableOpacity 
              style={[
                styles.movementGroupHeader,
                group.movement && { borderLeftColor: group.movement.color_theme }
              ]}
              onPress={() => group.movement && onMovementPress?.(group.movement)}
              activeOpacity={group.movement ? 0.8 : 1}
              disabled={!group.movement}
            >
              <View style={styles.movementInfo}>
                <Text style={styles.movementEmoji}>
                  {group.movement 
                    ? MovementModule.getMovementEmoji(group.movement.type)
                    : '🎵'
                  }
                </Text>
                <View style={styles.movementTitleContainer}>
                  <Text style={styles.movementTitle}>
                    {group.movement?.name || 'Ungrouped Notes'}
                  </Text>
                  <Text style={styles.movementSubtitle}>
                    {group.count} note{group.count !== 1 ? 's' : ''}
                    {group.movement && ` • ${MovementModule.getMovementTypeLabel(group.movement.type)}`}
                  </Text>
                </View>
              </View>
              {group.movement && (
                <Text style={styles.movementArrow}>›</Text>
              )}
            </TouchableOpacity>
            
            {group.tasks.map((task) => renderTask(task))}
          </View>
        ))
      ) : (
        // Regular ungrouped rendering
        filteredTasks.map((task) => renderTask(task))
      )}

      {onAddTask && (
        <TouchableOpacity style={styles.addMoreButton} onPress={onAddTask}>
          <Text style={styles.addMoreButtonText}>🎵 Add Another Note</Text>
        </TouchableOpacity>
      )}

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
  },
  
  playlistTitle: {
    ...Typography.heading2,
    fontSize: 26,
    marginBottom: 6,
    textAlign: 'center',
  },
  
  playlistCount: {
    ...Typography.caption,
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
  
  taskCard: {
    ...GlassMorphism.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    borderLeftWidth: 6,
    borderLeftColor: Colors.tempo.moderato.primary,
    position: 'relative',
    overflow: 'hidden',
  },
  
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  
  taskMeta: {
    flexDirection: 'column',
    flex: 1,
    marginRight: 16,
  },
  
  tempoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  
  tempoEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  
  tempoMiniLabel: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  
  currentTempoIndicator: {
    backgroundColor: Colors.accent.success + '20',
    borderColor: Colors.accent.success,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
    marginTop: 4,
  },
  
  currentTempoText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '700',
    color: Colors.accent.success,
    textTransform: 'uppercase',
  },
  
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  
  priorityText: {
    ...Typography.label,
    fontSize: 10,
    fontWeight: '700',
  },
  
  completeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...GlassMorphism.button,
    backgroundColor: Colors.tempo.moderato.primary,
  },
  
  completeButtonText: {
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  taskTitle: {
    ...Typography.body,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 12,
    color: Colors.text.primary,
  },
  
  taskDescription: {
    ...Typography.body,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  
  estimatedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    ...GlassMorphism.button,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  
  timeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  
  estimatedTime: {
    ...Typography.caption,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  
  energyBoost: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.accent.golden,
  },
  
  energyText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent.golden,
  },
  
  taskGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    opacity: 0.1,
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
  
  bottomPadding: {
    height: 100,
  },

  // Movement grouping styles
  movementGroup: {
    marginBottom: 24,
  },

  movementGroupHeader: {
    ...GlassMorphism.card,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.tempo.moderato.primary,
  },

  movementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  movementEmoji: {
    fontSize: 24,
    marginRight: 12,
  },

  movementTitleContainer: {
    flex: 1,
  },

  movementTitle: {
    ...Typography.heading3,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },

  movementSubtitle: {
    ...Typography.caption,
    fontSize: 12,
    opacity: 0.8,
    fontWeight: '600',
  },

  movementArrow: {
    ...Typography.heading3,
    fontSize: 20,
    color: Colors.text.secondary,
    opacity: 0.7,
  },

  // Task movement badge styles (for ungrouped mode)
  taskMovementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.ui.surface + '40',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },

  movementBadgeEmoji: {
    fontSize: 14,
    marginRight: 6,
  },

  movementBadgeText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.9,
  },
})