import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native'
import { VoiceRecorder } from './VoiceRecorder'
import { Tempo, TEMPO_CONFIG, Movement } from '../../lib/supabase'
import { MovementModule } from '../../modules/MovementModule'
import { Colors, GlassMorphism, Typography } from '../../styles/colors'

interface AddNoteProps {
  onClose: () => void
  onAddNote: (noteData: {
    title: string
    description?: string
    tempoRequired: Tempo
    priority: number
    estimatedMinutes: number
    movementId?: string
  }) => void
  currentTempo: Tempo
  movements?: Movement[]
  selectedMovementId?: string
}

export const AddNote: React.FC<AddNoteProps> = ({
  onClose,
  onAddNote,
  currentTempo,
  movements = [],
  selectedMovementId
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTempo, setSelectedTempo] = useState<Tempo>(currentTempo)
  const [priority, setPriority] = useState(2)
  const [estimatedMinutes, setEstimatedMinutes] = useState(15)
  const [customTime, setCustomTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMovement, setSelectedMovement] = useState<string | null>(selectedMovementId || null)
  const [availableMovements, setAvailableMovements] = useState<Movement[]>(movements)

  useEffect(() => {
    const loadMovements = async () => {
      if (movements.length === 0) {
        const loadedMovements = await MovementModule.getUserMovements()
        setAvailableMovements(loadedMovements)
      }
    }
    
    loadMovements()
  }, [movements])

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setSelectedTempo(currentTempo)
    setPriority(2)
    setEstimatedMinutes(15)
    setCustomTime('')
    setSelectedMovement(selectedMovementId || null)
    setIsLoading(false)
  }

  const handleClose = () => {
    if (isLoading) return // Prevent closing while loading
    resetForm()
    onClose() // Direct call, no delay needed
  }

  const handleVoiceCapture = (audioText: string) => {
    // Set the captured text as the title if title is empty, otherwise add to description
    if (!title.trim()) {
      setTitle(audioText)
    } else {
      const currentDesc = description.trim()
      const newDesc = currentDesc ? `${currentDesc}\n\n${audioText}` : audioText
      setDescription(newDesc)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Note', 'Every musical piece needs a title! 🎵')
      return
    }

    // Use custom time if provided and valid
    const finalEstimatedMinutes = customTime ? 
      Math.max(1, parseInt(customTime) || estimatedMinutes) : 
      estimatedMinutes

    setIsLoading(true)
    try {
      onAddNote({
        title: title.trim(),
        description: description.trim() || undefined,
        tempoRequired: selectedTempo,
        priority,
        estimatedMinutes: finalEstimatedMinutes,
        movementId: selectedMovement || undefined
      })
      
      handleClose()
    } catch (error) {
      Alert.alert('Orchestra Error', 'Failed to add your note. Please try again! 🎼')
      setIsLoading(false)
    }
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

  const timeOptions = [15, 30, 60, 120] // Quick picks only
  
  const handleTimeSelection = (minutes: number) => {
    setEstimatedMinutes(minutes)
    setCustomTime('') // Clear custom input when selecting preset
  }

  const handleCustomTimeChange = (text: string) => {
    setCustomTime(text)
    // Don't update estimatedMinutes until submit for better UX
  }

  const renderContent = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add a New Note 🎵</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
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
          <Text style={styles.timeHint}>How long will this take?</Text>
          
          <View style={styles.quickTimeRow}>
            <Text style={styles.quickTimeLabel}>Quick picks:</Text>
            <View style={styles.timeSelector}>
              {timeOptions.map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.timeOption,
                    estimatedMinutes === minutes && !customTime && styles.timeSelected
                  ]}
                  onPress={() => handleTimeSelection(minutes)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.timeLabel,
                    estimatedMinutes === minutes && !customTime && styles.timeLabelSelected
                  ]}>
                    {minutes < 60 ? `${minutes}m` : `${minutes/60}h`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.customTimeContainer}>
            <Text style={styles.customTimeLabel}>Or enter custom time:</Text>
            <View style={styles.customTimeInput}>
              <TextInput
                style={styles.customTimeField}
                value={customTime}
                onChangeText={handleCustomTimeChange}
                placeholder="Enter minutes"
                placeholderTextColor={Colors.text.muted}
                keyboardType="numeric"
                maxLength={4}
              />
              <Text style={styles.customTimeUnit}>minutes</Text>
            </View>
            {customTime && (
              <Text style={styles.customTimePreview}>
                Duration: {customTime ? `${customTime} minutes` : 'Invalid'}
              </Text>
            )}
          </View>
        </View>

        {/* Movement Selector */}
        {availableMovements.length > 0 && (
          <View style={styles.selectorCard}>
            <Text style={styles.sectionTitle}>Add to Movement (Optional)</Text>
            <Text style={styles.movementHint}>
              Group this note with related tasks in a movement
            </Text>
            
            <View style={styles.movementSelector}>
              <TouchableOpacity
                style={[
                  styles.movementOption,
                  !selectedMovement && styles.movementOptionSelected
                ]}
                onPress={() => setSelectedMovement(null)}
                activeOpacity={0.8}
              >
                <View style={styles.movementOptionContent}>
                  <Text style={styles.movementEmoji}>🎵</Text>
                  <Text style={[
                    styles.movementLabel,
                    !selectedMovement && styles.movementLabelSelected
                  ]}>
                    No Movement
                  </Text>
                  {!selectedMovement && <Text style={styles.selectedIndicator}>✓</Text>}
                </View>
              </TouchableOpacity>
              
              {availableMovements.map((movement) => {
                const isSelected = selectedMovement === movement.id
                
                return (
                  <TouchableOpacity
                    key={movement.id}
                    style={[
                      styles.movementOption,
                      isSelected && [
                        styles.movementOptionSelected, 
                        { borderColor: movement.color_theme }
                      ]
                    ]}
                    onPress={() => setSelectedMovement(movement.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.movementOptionContent}>
                      <Text style={styles.movementEmoji}>
                        {MovementModule.getMovementEmoji(movement.type)}
                      </Text>
                      <View style={styles.movementInfo}>
                        <Text style={[
                          styles.movementLabel,
                          isSelected && { color: movement.color_theme }
                        ]}>
                          {movement.name}
                        </Text>
                        <Text style={styles.movementType}>
                          {MovementModule.getMovementTypeLabel(movement.type)}
                        </Text>
                      </View>
                      {isSelected && <Text style={styles.selectedIndicator}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        )}

        {/* Voice Capture */}
        <View style={styles.voiceSection}>
          <VoiceRecorder onVoiceCapture={handleVoiceCapture} />
        </View>

        <TouchableOpacity
          style={[styles.addButton, isLoading && styles.addButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.addButtonText}>
            {isLoading ? '🎵 Adding to your symphony...' : '🎼 Add to Playlist'}
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

  timeHint: {
    ...Typography.caption,
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 16,
    fontStyle: 'italic',
  },

  quickTimeRow: {
    marginBottom: 20,
  },

  quickTimeLabel: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },

  customTimeContainer: {
    marginTop: 8,
  },

  customTimeLabel: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },

  customTimeInput: {
    ...GlassMorphism.button,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  customTimeField: {
    ...Typography.body,
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
    minHeight: 40,
  },

  customTimeUnit: {
    ...Typography.caption,
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 8,
  },

  customTimePreview: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.accent.success,
    marginTop: 4,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  voiceSection: {
    paddingHorizontal: 0,
    marginBottom: 20,
  },
  
  addButton: {
    backgroundColor: Colors.tempo.moderato.primary,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    ...GlassMorphism.card,
    shadowColor: Colors.tempo.moderato.primary,
    shadowOpacity: 0.4,
  },
  
  addButtonDisabled: {
    opacity: 0.6,
  },
  
  addButtonText: {
    ...Typography.body,
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },

  // Movement selector styles
  movementHint: {
    ...Typography.caption,
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 16,
    fontStyle: 'italic',
  },

  movementSelector: {
    // Using marginBottom on child elements
  },

  movementOption: {
    ...GlassMorphism.button,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },

  movementOptionSelected: {
    backgroundColor: Colors.tempo.moderato.primary + '20',
    borderWidth: 2,
    borderColor: Colors.tempo.moderato.primary,
  },

  movementOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },

  movementEmoji: {
    fontSize: 24,
    marginRight: 12,
  },

  movementInfo: {
    flex: 1,
  },

  movementLabel: {
    ...Typography.body,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },

  movementLabelSelected: {
    color: Colors.tempo.moderato.primary,
  },

  movementType: {
    ...Typography.caption,
    fontSize: 11,
    opacity: 0.7,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
})