import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal, SafeAreaView, Animated } from 'react-native'
import { Task, getGentlestTask } from '../../lib/supabase'
import { Colors, GlassMorphism, Typography } from '../../styles/colors'

interface FermataModeProps {
  visible: boolean
  onClose: () => void
  tasks: Task[]
  onTaskComplete: (taskId: string) => Promise<void>
}

export const FermataMode: React.FC<FermataModeProps> = ({
  visible,
  onClose,
  tasks,
  onTaskComplete
}) => {
  const [gentleTask, setGentleTask] = useState<Task | null>(null)
  const [breathingAnim] = useState(new Animated.Value(1))
  
  useEffect(() => {
    if (visible) {
      const task = getGentlestTask(tasks)
      setGentleTask(task)
      
      // Start breathing animation
      const breathingLoop = () => {
        Animated.sequence([
          Animated.timing(breathingAnim, {
            toValue: 1.1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(breathingAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]).start(() => breathingLoop())
      }
      breathingLoop()
    }
  }, [visible, tasks, breathingAnim])

  const handleCompleteTask = async () => {
    if (gentleTask) {
      try {
        await onTaskComplete(gentleTask.id)
        // Find next gentle task
        const remainingTasks = tasks.filter(t => t.id !== gentleTask.id)
        const nextTask = getGentlestTask(remainingTasks)
        setGentleTask(nextTask)
      } catch (error) {
        console.error('Failed to complete task:', error)
      }
    }
  }

  const handleClose = () => {
    breathingAnim.stopAnimation()
    onClose()
  }

  if (!visible) return null

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.fermataSymbol}>
              <Text style={styles.fermataText}>𝄐</Text>
            </View>
            <Text style={styles.title}>Take a Musical Pause</Text>
            <Text style={styles.subtitle}>Focus on just one gentle note</Text>
          </View>

          {/* Breathing Animation */}
          <View style={styles.breathingContainer}>
            <Animated.View 
              style={[
                styles.breathingCircle,
                { transform: [{ scale: breathingAnim }] }
              ]}
            >
              <Text style={styles.breathingText}>Breathe</Text>
              <Text style={styles.breathingSubtext}>In... and out...</Text>
            </Animated.View>
          </View>

          {/* Gentle Task */}
          <View style={styles.taskContainer}>
            {gentleTask ? (
              <View style={styles.gentleTaskCard}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskEmoji}>🌸</Text>
                  <Text style={styles.taskLabel}>Your gentlest task</Text>
                </View>
                
                <Text style={styles.taskTitle}>{gentleTask.title}</Text>
                
                {gentleTask.description && (
                  <Text style={styles.taskDescription}>{gentleTask.description}</Text>
                )}

                <View style={styles.taskMeta}>
                  <Text style={styles.taskTime}>⏱️ {gentleTask.estimated_minutes}m</Text>
                  <Text style={styles.taskTempo}>🎼 {gentleTask.tempo_required}</Text>
                </View>

                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={handleCompleteTask}
                  activeOpacity={0.8}
                >
                  <Text style={styles.completeButtonText}>🌟 Complete with Grace</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.noTasksCard}>
                <Text style={styles.noTasksEmoji}>✨</Text>
                <Text style={styles.noTasksTitle}>Perfect Silence</Text>
                <Text style={styles.noTasksText}>
                  You have no tasks right now. Take this moment to rest and breathe.
                </Text>
              </View>
            )}
          </View>

          {/* Exit Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.exitButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.exitButtonText}>🎵 Resume Your Rhythm</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9FF', // Light blue background for calm
  },
  
  safeArea: {
    flex: 1,
  },
  
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  fermataSymbol: {
    marginBottom: 16,
  },
  
  fermataText: {
    fontSize: 64,
    color: '#1E40AF', // Dark blue for contrast
    textAlign: 'center',
  },
  
  title: {
    ...Typography.heading1,
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 8,
    color: '#1F2937', // Dark gray for readability
  },
  
  subtitle: {
    ...Typography.body,
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280', // Medium gray
    fontStyle: 'italic',
  },
  
  breathingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  breathingCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#DBEAFE', // Light blue background
    borderWidth: 3,
    borderColor: '#3B82F6', // Medium blue border
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  breathingText: {
    ...Typography.heading3,
    fontSize: 24,
    color: '#1E40AF', // Dark blue for contrast
    marginBottom: 4,
  },
  
  breathingSubtext: {
    ...Typography.caption,
    fontSize: 12,
    color: '#6B7280', // Medium gray
    textAlign: 'center',
  },
  
  taskContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  gentleTaskCard: {
    backgroundColor: '#FFFFFF', // White card background
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Light gray border
  },
  
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  taskEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  
  taskLabel: {
    ...Typography.caption,
    fontSize: 12,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  
  taskTitle: {
    ...Typography.heading3,
    fontSize: 20,
    marginBottom: 12,
    lineHeight: 28,
    color: '#1F2937', // Dark gray for readability
  },
  
  taskDescription: {
    ...Typography.body,
    fontSize: 14,
    color: '#6B7280', // Medium gray
    marginBottom: 16,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  
  taskTime: {
    ...Typography.caption,
    fontSize: 12,
    opacity: 0.7,
  },
  
  taskTempo: {
    ...Typography.caption,
    fontSize: 12,
    opacity: 0.7,
  },
  
  completeButton: {
    backgroundColor: '#3B82F6', // Medium blue for action
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  
  completeButtonText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text on blue button
  },
  
  noTasksCard: {
    backgroundColor: '#FFFFFF', // White card background
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Light gray border
  },
  
  noTasksEmoji: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.8,
  },
  
  noTasksTitle: {
    ...Typography.heading3,
    fontSize: 22,
    marginBottom: 12,
    textAlign: 'center',
    color: '#1F2937', // Dark gray for readability
  },
  
  noTasksText: {
    ...Typography.body,
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280', // Medium gray
    lineHeight: 20,
    fontStyle: 'italic',
  },
  
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  
  exitButton: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderColor: '#9CA3AF', // Medium gray border
    borderWidth: 1,
    backgroundColor: '#F9FAFB', // Very light gray background
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  exitButtonText: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151', // Dark gray text
  },
})