import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, SafeAreaView } from 'react-native'
import { Movement, Task, Tempo, TEMPO_CONFIG } from '../../lib/supabase'
import { MovementModule } from '../../modules/MovementModule'
import { Colors, GlassMorphism, Typography } from '../../styles/colors'

interface MovementDetailProps {
  movement: Movement
  onClose: () => void
  onMovementUpdate: (movement: Movement) => void
  onMovementDelete: (movementId: string) => void
  onTaskPress: (task: Task) => void
  onTaskComplete: (taskId: string) => void
  onAddTask: (movementId: string) => void
}

export const MovementDetail: React.FC<MovementDetailProps> = ({
  movement,
  onClose,
  onMovementUpdate,
  onMovementDelete,
  onTaskPress,
  onTaskComplete,
  onAddTask
}) => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [progress, setProgress] = useState({
    total: 0,
    completed: 0,
    percentage: 0,
    remainingTasks: [] as Task[]
  })
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    loadMovementData()
  }, [movement.id])

  const loadMovementData = async () => {
    try {
      setIsLoading(true)
      const [movementTasks, progressData] = await Promise.all([
        MovementModule.getMovementTasks(movement.id),
        MovementModule.getMovementProgress(movement.id)
      ])
      
      setTasks(movementTasks)
      setProgress(progressData)
    } catch (error) {
      console.error('Failed to load movement data:', error)
      Alert.alert('Orchestra Error', 'Failed to load movement details')
    } finally {
      setIsLoading(false)
    }
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
            await onTaskComplete(taskId)
            await loadMovementData()
          }
        }
      ]
    )
  }

  const handleCompleteAllTasks = async () => {
    if (progress.remainingTasks.length === 0) return

    Alert.alert(
      'Complete All Notes? 🎼',
      `Mark all ${progress.remainingTasks.length} remaining notes as complete?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete All! 🎉',
          onPress: async () => {
            try {
              const result = await MovementModule.completeAllTasksInMovement(movement.id)
              if (result.success) {
                Alert.alert(
                  'Movement Complete! 🎉',
                  `Completed ${result.completedCount} notes! Your movement is now finished!`
                )
                await loadMovementData()
              }
            } catch (error) {
              Alert.alert('Orchestra Error', 'Failed to complete all tasks')
            }
          }
        }
      ]
    )
  }

  const handleDeleteMovement = () => {
    setShowDeleteConfirm(false)
    onMovementDelete(movement.id)
    onClose()
  }

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return Colors.accent.success
    if (percentage >= 75) return Colors.accent.golden
    if (percentage >= 50) return movement.color_theme
    if (percentage >= 25) return Colors.tempo.moderato.primary
    return Colors.tempo.adagio.primary
  }

  const getTempoColor = (tempo: Tempo): string => {
    switch (tempo) {
      case 'allegro': return Colors.tempo.allegro.primary
      case 'moderato': return Colors.tempo.moderato.primary
      case 'adagio': return Colors.tempo.adagio.primary
      default: return Colors.tempo.moderato.primary
    }
  }

  const getTempoStats = () => {
    const tempoCount = tasks.reduce((acc, task) => {
      acc[task.tempo_required] = (acc[task.tempo_required] || 0) + 1
      return acc
    }, {} as Record<Tempo, number>)

    return Object.entries(tempoCount).map(([tempo, count]) => ({
      tempo: tempo as Tempo,
      count,
      config: TEMPO_CONFIG[tempo as Tempo]
    })).sort((a, b) => b.count - a.count)
  }

  if (isLoading) {
    return (
      <Modal visible={true} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>🎼 Loading movement...</Text>
          </View>
        </SafeAreaView>
      </Modal>
    )
  }

  const progressColor = getProgressColor(progress.percentage)
  const typeEmoji = MovementModule.getMovementEmoji(movement.type)
  const typeLabel = MovementModule.getMovementTypeLabel(movement.type)
  const tempoStats = getTempoStats()

  return (
    <Modal visible={true} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {movement.name}
          </Text>
          <TouchableOpacity 
            onPress={() => setShowDeleteConfirm(true)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.movementCard, { borderLeftColor: movement.color_theme }]}>
            <View style={styles.movementHeader}>
              <View style={styles.movementInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.movementEmoji}>{typeEmoji}</Text>
                  <View>
                    <Text style={styles.movementName}>{movement.name}</Text>
                    <Text style={styles.movementType}>{typeLabel}</Text>
                  </View>
                </View>
                {movement.description && (
                  <Text style={styles.movementDescription}>{movement.description}</Text>
                )}
              </View>

              <View style={styles.progressRing}>
                <View style={[styles.progressCircle, { borderColor: progressColor }]}>
                  <Text style={[styles.progressPercentage, { color: progressColor }]}>
                    {progress.percentage}%
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{progress.total}</Text>
                <Text style={styles.statLabel}>Total Notes</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: Colors.accent.success }]}>
                  {progress.completed}
                </Text>
                <Text style={styles.statLabel}>Complete</Text>
              </View>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: Colors.accent.golden }]}>
                  {progress.remainingTasks.length}
                </Text>
                <Text style={styles.statLabel}>Remaining</Text>
              </View>
            </View>

            {tempoStats.length > 0 && (
              <View style={styles.tempoBreakdown}>
                <Text style={styles.tempoTitle}>Tempo Distribution</Text>
                <View style={styles.tempoStats}>
                  {tempoStats.map(({ tempo, count, config }) => (
                    <View key={tempo} style={styles.tempoStat}>
                      <Text style={styles.tempoEmoji}>{config.emoji}</Text>
                      <Text style={styles.tempoCount}>{count}</Text>
                      <Text style={styles.tempoLabel}>{config.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {progress.percentage === 100 && (
              <View style={styles.completeBadge}>
                <Text style={styles.completeText}>🎉 Movement Complete!</Text>
              </View>
            )}
          </View>

          <View style={styles.actionsSection}>
            <TouchableOpacity 
              style={styles.addTaskButton}
              onPress={() => onAddTask(movement.id)}
            >
              <Text style={styles.addTaskButtonText}>🎵 Add Note to Movement</Text>
            </TouchableOpacity>

            {progress.remainingTasks.length > 0 && (
              <TouchableOpacity 
                style={styles.completeAllButton}
                onPress={handleCompleteAllTasks}
              >
                <Text style={styles.completeAllButtonText}>
                  ✨ Complete All Remaining ({progress.remainingTasks.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.tasksSection}>
            <Text style={styles.sectionTitle}>
              🎼 Notes in This Movement ({tasks.length})
            </Text>
            
            {tasks.length === 0 ? (
              <View style={styles.emptyTasksContainer}>
                <Text style={styles.emptyTasksEmoji}>🎵</Text>
                <Text style={styles.emptyTasksTitle}>No Notes Yet</Text>
                <Text style={styles.emptyTasksMessage}>
                  Add your first note to begin this movement!
                </Text>
              </View>
            ) : (
              <View style={styles.tasksList}>
                {tasks.map((task) => {
                  const tempoConfig = TEMPO_CONFIG[task.tempo_required]
                  const tempoColor = getTempoColor(task.tempo_required)
                  
                  return (
                    <TouchableOpacity
                      key={task.id}
                      style={[
                        styles.taskCard,
                        { borderLeftColor: tempoColor },
                        task.completed && styles.completedTaskCard
                      ]}
                      onPress={() => onTaskPress(task)}
                      activeOpacity={0.9}
                    >
                      <View style={styles.taskHeader}>
                        <View style={styles.taskMeta}>
                          <Text style={styles.taskTempoEmoji}>{tempoConfig.emoji}</Text>
                          <Text style={styles.taskTempoLabel}>{tempoConfig.label}</Text>
                        </View>
                        
                        {!task.completed && (
                          <TouchableOpacity
                            style={[styles.completeTaskButton, { backgroundColor: tempoColor }]}
                            onPress={() => handleCompleteTask(task.id, task.title)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.completeTaskButtonText}>✓</Text>
                          </TouchableOpacity>
                        )}
                        
                        {task.completed && (
                          <View style={styles.completedIndicator}>
                            <Text style={styles.completedText}>✓</Text>
                          </View>
                        )}
                      </View>

                      <Text style={[
                        styles.taskTitle,
                        task.completed && styles.completedTaskTitle
                      ]}>
                        {task.title}
                      </Text>
                      
                      {task.description && (
                        <Text style={[
                          styles.taskDescription,
                          task.completed && styles.completedTaskDescription
                        ]}>
                          {task.description}
                        </Text>
                      )}

                      <View style={styles.taskFooter}>
                        <View style={styles.taskTime}>
                          <Text style={styles.timeIcon}>⏱️</Text>
                          <Text style={styles.timeText}>{task.estimated_minutes}m</Text>
                        </View>
                        <View style={styles.taskEnergy}>
                          <Text style={styles.energyText}>🔋 +{task.energy_boost}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteConfirm}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDeleteConfirm(false)}
        >
          <View style={styles.deleteModalOverlay}>
            <View style={styles.deleteModal}>
              <Text style={styles.deleteModalTitle}>Delete Movement? 🗑️</Text>
              <Text style={styles.deleteModalMessage}>
                This will permanently delete "{movement.name}" and unlink all its tasks. 
                The tasks themselves will remain in your playlist.
              </Text>
              <View style={styles.deleteModalButtons}>
                <TouchableOpacity
                  style={styles.cancelDeleteButton}
                  onPress={() => setShowDeleteConfirm(false)}
                >
                  <Text style={styles.cancelDeleteText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmDeleteButton}
                  onPress={handleDeleteMovement}
                >
                  <Text style={styles.confirmDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  
  closeButton: {
    paddingVertical: 8,
    paddingRight: 8,
  },
  
  closeButtonText: {
    ...Typography.body,
    fontSize: 16,
    color: Colors.tempo.moderato.primary,
    fontWeight: '600',
  },
  
  headerTitle: {
    ...Typography.heading2,
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  
  deleteButton: {
    padding: 8,
  },
  
  deleteButtonText: {
    fontSize: 18,
  },
  
  content: {
    flex: 1,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    ...Typography.body,
    fontSize: 18,
    opacity: 0.8,
  },
  
  movementCard: {
    ...GlassMorphism.card,
    margin: 20,
    padding: 20,
    borderRadius: 20,
    borderLeftWidth: 6,
  },
  
  movementHeader: {
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
    fontSize: 32,
    marginRight: 12,
  },
  
  movementName: {
    ...Typography.heading1,
    fontSize: 24,
    lineHeight: 30,
    marginBottom: 4,
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
  
  progressRing: {
    alignItems: 'center',
  },
  
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.ui.border + '20',
  },
  
  progressPercentage: {
    ...Typography.heading3,
    fontSize: 16,
    fontWeight: '700',
  },
  
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  
  stat: {
    alignItems: 'center',
  },
  
  statValue: {
    ...Typography.heading2,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  
  statLabel: {
    ...Typography.caption,
    fontSize: 11,
    opacity: 0.8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  
  tempoBreakdown: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
  },
  
  tempoTitle: {
    ...Typography.heading3,
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  
  tempoStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  
  tempoStat: {
    alignItems: 'center',
  },
  
  tempoEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  
  tempoCount: {
    ...Typography.heading3,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  
  tempoLabel: {
    ...Typography.caption,
    fontSize: 10,
    opacity: 0.8,
    textAlign: 'center',
  },
  
  completeBadge: {
    backgroundColor: Colors.accent.success + '20',
    borderColor: Colors.accent.success,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 16,
  },
  
  completeText: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.accent.success,
    fontWeight: '700',
  },
  
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  addTaskButton: {
    ...GlassMorphism.card,
    backgroundColor: Colors.tempo.moderato.primary,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  
  addTaskButtonText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  
  completeAllButton: {
    ...GlassMorphism.card,
    backgroundColor: Colors.accent.golden,
    paddingVertical: 16,
    borderRadius: 16,
  },
  
  completeAllButtonText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  
  tasksSection: {
    paddingHorizontal: 20,
  },
  
  sectionTitle: {
    ...Typography.heading2,
    fontSize: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  
  emptyTasksContainer: {
    alignItems: 'center',
    padding: 40,
  },
  
  emptyTasksEmoji: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.8,
  },
  
  emptyTasksTitle: {
    ...Typography.heading2,
    fontSize: 20,
    marginBottom: 8,
  },
  
  emptyTasksMessage: {
    ...Typography.body,
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },
  
  tasksList: {
    gap: 12,
  },
  
  taskCard: {
    ...GlassMorphism.card,
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  
  completedTaskCard: {
    opacity: 0.7,
  },
  
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  taskTempoEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  
  taskTempoLabel: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  
  completeTaskButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  completeTaskButtonText: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  completedIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accent.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  completedText: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  taskTitle: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 8,
  },
  
  completedTaskTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  
  taskDescription: {
    ...Typography.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  
  completedTaskDescription: {
    opacity: 0.6,
  },
  
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  taskTime: {
    flexDirection: 'row',
    alignItems: 'center',
    ...GlassMorphism.button,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  
  timeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  
  timeText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
  },
  
  taskEnergy: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.accent.golden + '20',
    borderWidth: 1,
    borderColor: Colors.accent.golden,
  },
  
  energyText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accent.golden,
  },
  
  bottomPadding: {
    height: 100,
  },
  
  // Delete Modal Styles
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  deleteModal: {
    ...GlassMorphism.card,
    backgroundColor: Colors.background.primary,
    borderRadius: 20,
    padding: 24,
    maxWidth: 400,
    width: '100%',
  },
  
  deleteModalTitle: {
    ...Typography.heading2,
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  
  deleteModalMessage: {
    ...Typography.body,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.9,
  },
  
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  
  cancelDeleteButton: {
    flex: 1,
    ...GlassMorphism.button,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  cancelDeleteText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: Colors.ui.destructive,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  confirmDeleteText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
})