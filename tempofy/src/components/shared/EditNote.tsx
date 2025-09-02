import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native'
import { Task, Tempo, TEMPO_CONFIG } from '../../lib/supabase'
import { Colors, GlassMorphism, Typography } from '../../styles/colors'

interface EditNoteProps {
  task: Task
  onClose: () => void
  onUpdateTask: (taskData: {
    id: string
    title: string
    description?: string
    tempoRequired: Tempo
    priority: number
    estimatedMinutes: number
  }) => void
  onDeleteTask: (taskId: string) => void
}

export const EditNote: React.FC<EditNoteProps> = ({
  task,
  onClose,
  onUpdateTask,
  onDeleteTask
}) => {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [selectedTempo, setSelectedTempo] = useState<Tempo>(task.tempo_required)
  const [priority, setPriority] = useState(task.priority)
  const [estimatedMinutes, setEstimatedMinutes] = useState(task.estimated_minutes)
  const [isLoading, setIsLoading] = useState(false)

  const handleClose = () => {
    if (isLoading) return
    onClose()
  }

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Note', 'Every musical piece needs a title! 🎵')
      return
    }

    setIsLoading(true)
    try {
      onUpdateTask({
        id: task.id,
        title: title.trim(),
        description: description.trim() || undefined,
        tempoRequired: selectedTempo,
        priority,
        estimatedMinutes
      })
      
      handleClose()
    } catch (error) {
      Alert.alert('Orchestra Error', 'Failed to update your note. Please try again! 🎼')
      setIsLoading(false)
    }
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete This Note? 🗑️',
      `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDeleteTask(task.id)
            handleClose()
          }
        }
      ]
    )
  }

  const tempoOptions: Tempo[] = ['allegro', 'moderato', 'adagio']
  const priorityOptions = [
    { value: 1, label: 'High Priority', emoji: '🔥', color: Colors.priority.forte, description: 'Urgent or important tasks' },
    { value: 2, label: 'Medium Priority', emoji: '⭐', color: Colors.priority.mezzo, description: 'Normal everyday tasks' },
    { value: 3, label: 'Low Priority', emoji: '💚', color: Colors.priority.mezzoPiano, description: 'Can wait if needed' }
  ]
  
  const getTempoGradient = (tempo: Tempo): string => {
    switch (tempo) {
      case 'allegro':
        return Colors.tempo.allegro.primary
      case 'moderato':
        return Colors.tempo.moderato.primary
      case 'adagio':
        return Colors.tempo.adagio.primary
      default:
        return Colors.tempo.moderato.primary
    }
  }

  const timeOptions = [5, 15, 30, 45, 60, 90, 120]

  const renderContent = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Note 🎶</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Text style={styles.deleteText}>🗑️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>What would you like to accomplish?</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Write your musical note..."
              placeholderTextColor={Colors.text.muted}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Any additional details? (Optional)</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Add harmony to your note..."
              placeholderTextColor={Colors.text.muted}
              multiline
            />
          </View>
        </View>

        <View style={styles.selectorCard}>
          <Text style={styles.sectionTitle}>What tempo does this need?</Text>
          <View style={styles.tempoSelector}>
            {tempoOptions.map((tempo) => {
              const config = TEMPO_CONFIG[tempo]
              const isSelected = selectedTempo === tempo
              const tempoColor = getTempoGradient(tempo)
              
              return (
                <TouchableOpacity
                  key={tempo}
                  style={[
                    styles.tempoOption,
                    isSelected && { borderColor: tempoColor, backgroundColor: tempoColor + '20' }
                  ]}
                  onPress={() => setSelectedTempo(tempo)}
                  activeOpacity={0.8}
                >
                  <View style={styles.tempoOptionContent}>
                    <Text style={styles.tempoEmoji}>{config.emoji}</Text>
                    <Text style={[styles.tempoLabel, isSelected && { color: tempoColor }]}>
                      {config.label}
                    </Text>
                    {isSelected && <Text style={styles.selectedIndicator}>✓</Text>}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <View style={styles.selectorCard}>
          <Text style={styles.sectionTitle}>Priority Level</Text>
          <View style={styles.prioritySelector}>
            {priorityOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.priorityOption,
                  priority === option.value && { borderColor: option.color, backgroundColor: option.color + '20' }
                ]}
                onPress={() => setPriority(option.value)}
                activeOpacity={0.8}
              >
                <Text style={styles.priorityEmoji}>{option.emoji}</Text>
                <View style={styles.priorityTextContainer}>
                  <Text style={[
                    styles.priorityLabel,
                    priority === option.value && { color: option.color }
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={styles.priorityDescription}>
                    {option.description}
                  </Text>
                </View>
                {priority === option.value && <Text style={styles.selectedIndicator}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.selectorCard}>
          <Text style={styles.sectionTitle}>Estimated Time</Text>
          <View style={styles.timeSelector}>
            {timeOptions.map((minutes) => (
              <TouchableOpacity
                key={minutes}
                style={[
                  styles.timeOption,
                  estimatedMinutes === minutes && styles.timeSelected
                ]}
                onPress={() => setEstimatedMinutes(minutes)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.timeLabel,
                  estimatedMinutes === minutes && styles.timeLabelSelected
                ]}>
                  {minutes}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.updateButton, isLoading && styles.updateButtonDisabled]}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          <Text style={styles.updateButtonText}>
            {isLoading ? '🎵 Updating your symphony...' : '🎼 Update Note'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          {Platform.OS === 'ios' ? (
            <KeyboardAvoidingView 
              style={styles.keyboardView}
              behavior="padding"
            >
              {renderContent()}
            </KeyboardAvoidingView>
          ) : (
            <View style={styles.keyboardView}>
              {renderContent()}
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  safeArea: {
    flex: 1,
  },
  
  keyboardView: {
    flex: 1,
  },
  
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  scrollView: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  
  title: {
    ...Typography.heading2,
    fontSize: 24,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  deleteButton: {
    ...GlassMorphism.button,
    padding: 12,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: Colors.accent.error,
  },

  deleteText: {
    fontSize: 16,
  },
  
  closeButton: {
    ...GlassMorphism.button,
    padding: 12,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  closeText: {
    fontSize: 18,
    color: Colors.text.secondary,
    fontWeight: 'bold',
  },
  
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  
  formCard: {
    ...GlassMorphism.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  
  selectorCard: {
    ...GlassMorphism.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  
  inputGroup: {
    marginBottom: 20,
  },
  
  label: {
    ...Typography.label,
    color: Colors.text.secondary,
    marginBottom: 12,
  },
  
  sectionTitle: {
    ...Typography.heading3,
    fontSize: 18,
    marginBottom: 16,
    color: Colors.text.primary,
  },
  
  titleInput: {
    ...GlassMorphism.button,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  
  descriptionInput: {
    ...GlassMorphism.button,
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    color: Colors.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  
  tempoSelector: {
    // Using marginBottom on child elements
  },
  
  tempoOption: {
    ...GlassMorphism.button,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  
  tempoOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  
  tempoEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  
  tempoLabel: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  
  selectedIndicator: {
    fontSize: 18,
    color: Colors.accent.success,
    fontWeight: 'bold',
  },
  
  prioritySelector: {
    // Using marginBottom on child elements
  },
  
  priorityOption: {
    ...GlassMorphism.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  
  priorityEmoji: {
    fontSize: 18,
    marginRight: 12,
  },

  priorityTextContainer: {
    flex: 1,
  },
  
  priorityLabel: {
    ...Typography.caption,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },

  priorityDescription: {
    ...Typography.caption,
    fontSize: 11,
    opacity: 0.7,
    lineHeight: 14,
  },
  
  timeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  timeOption: {
    ...GlassMorphism.button,
    padding: 14,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
    margin: 4,
    flex: 1,
    maxWidth: '30%',
  },
  
  timeSelected: {
    backgroundColor: Colors.tempo.moderato.primary + '20',
    borderColor: Colors.tempo.moderato.primary,
  },
  
  timeLabel: {
    ...Typography.caption,
    fontSize: 14,
    fontWeight: '600',
  },
  
  timeLabelSelected: {
    color: Colors.tempo.moderato.primary,
    fontWeight: 'bold',
  },
  
  updateButton: {
    backgroundColor: Colors.tempo.moderato.primary,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    ...GlassMorphism.card,
    shadowColor: Colors.tempo.moderato.primary,
    shadowOpacity: 0.4,
  },
  
  updateButtonDisabled: {
    opacity: 0.6,
  },
  
  updateButtonText: {
    ...Typography.body,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
})