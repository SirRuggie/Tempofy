import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, SafeAreaView, ScrollView, Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { VoiceRecorder } from './VoiceRecorder'
import { Colors, GlassMorphism, Typography } from '../../styles/colors'

interface Melody {
  id: string
  content: string
  isVoice: boolean
  processed: boolean
  timestamp: string
}

interface MelodyCaptureProps {
  visible: boolean
  onClose: () => void
  onCreateTasksFromMelodies: (melodies: Melody[]) => void
}

const STORAGE_KEY = '@tempofy_melodies'

export const MelodyCapture: React.FC<MelodyCaptureProps> = ({
  visible,
  onClose,
  onCreateTasksFromMelodies
}) => {
  const [melodies, setMelodies] = useState<Melody[]>([])
  const [newMelody, setNewMelody] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load melodies from storage
  useEffect(() => {
    if (visible) {
      loadMelodies()
    }
  }, [visible])

  const loadMelodies = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY)
      if (stored) {
        setMelodies(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load melodies:', error)
    }
  }

  const saveMelodies = async (updatedMelodies: Melody[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMelodies))
      setMelodies(updatedMelodies)
    } catch (error) {
      console.error('Failed to save melodies:', error)
    }
  }

  const handleAddMelody = async () => {
    if (!newMelody.trim()) return

    setIsLoading(true)
    
    const melody: Melody = {
      id: Date.now().toString(),
      content: newMelody.trim(),
      isVoice: false,
      processed: false,
      timestamp: new Date().toISOString()
    }

    const updatedMelodies = [melody, ...melodies]
    await saveMelodies(updatedMelodies)
    setNewMelody('')
    setIsLoading(false)
  }

  const handleDeleteMelody = async (id: string) => {
    const updatedMelodies = melodies.filter(m => m.id !== id)
    await saveMelodies(updatedMelodies)
  }

  const handleClearAll = () => {
    Alert.alert(
      'Clear the Stage? 🎭',
      'This will delete all your unfinished melodies. This action cannot be undone.',
      [
        { text: 'Keep Them', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await saveMelodies([])
          }
        }
      ]
    )
  }

  const handleVoiceCapture = async (audioText: string) => {
    const melody: Melody = {
      id: Date.now().toString(),
      content: audioText,
      isVoice: true,
      processed: false,
      timestamp: new Date().toISOString()
    }

    const updatedMelodies = [melody, ...melodies]
    await saveMelodies(updatedMelodies)

    // Intelligent task conversion detection
    const hasActionWords = /\b(call|buy|get|schedule|book|email|text|visit|make|do|finish|complete|start|begin|remember|check|review|update|send|plan|organize|clean|fix|repair|install|setup|meet|pay|order|write|read|study|practice|exercise|cook|prepare|attend|join|cancel|confirm)\b/i.test(audioText)
    
    if (hasActionWords) {
      Alert.alert(
        'Smart Task Detection! 🧠✨',
        `I detected actionable content in: "${audioText}"\n\nWould you like to convert this voice note directly into a task?`,
        [
          { text: 'Keep as Note', style: 'cancel' },
          {
            text: 'Make Task! 📋',
            onPress: () => {
              onCreateTasksFromMelodies([melody])
              // Remove from melodies since it's now a task
              saveMelodies(melodies)
            }
          }
        ]
      )
    }
  }

  const handleArrangeIntoTasks = () => {
    if (melodies.length === 0) {
      Alert.alert('No melodies to arrange', 'Capture some thoughts first!')
      return
    }

    Alert.alert(
      'Arrange into Playlist 🎼',
      `Convert your ${melodies.length} melodies into organized tasks?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Arrange',
          onPress: () => {
            onCreateTasksFromMelodies(melodies)
            // Clear melodies after converting them to tasks
            setMelodies([])
            saveMelodies([])
            onClose()
            Alert.alert(
              'Success! 🌟',
              `Converted ${melodies.length} melodies into tasks in your playlist!`
            )
          }
        }
      ]
    )
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitle}>
              <Text style={styles.title}>Melody Capture 🎵</Text>
              <Text style={styles.subtitle}>Capture your fleeting thoughts</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Capture */}
          <View style={styles.captureSection}>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                value={newMelody}
                onChangeText={setNewMelody}
                placeholder="What's on your mind? 🌟"
                placeholderTextColor={Colors.text.muted}
                multiline
                maxLength={500}
                returnKeyType="done"
                onSubmitEditing={handleAddMelody}
              />
              <TouchableOpacity
                style={[styles.captureButton, isLoading && styles.captureButtonDisabled]}
                onPress={handleAddMelody}
                disabled={isLoading || !newMelody.trim()}
                activeOpacity={0.8}
              >
                <Text style={styles.captureButtonText}>
                  {isLoading ? '🎼' : '🎵 Capture'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Voice Capture */}
          <View style={styles.voiceSection}>
            <VoiceRecorder onVoiceCapture={handleVoiceCapture} />
          </View>

          {/* Melodies List */}
          <View style={styles.melodiesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Unfinished Melodies ({melodies.length})
              </Text>
              {melodies.length > 0 && (
                <View style={styles.headerActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleArrangeIntoTasks}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionButtonText}>🎼 Arrange</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.clearButton]}
                    onPress={handleClearAll}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.clearButtonText}>🎭 Clear All</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <ScrollView 
              style={styles.melodiesList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.melodiesContent}
            >
              {melodies.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🎼</Text>
                  <Text style={styles.emptyTitle}>No melodies yet</Text>
                  <Text style={styles.emptyText}>
                    Capture your thoughts, ideas, and spontaneous tasks here. 
                    They'll wait patiently until you're ready to arrange them.
                  </Text>
                </View>
              ) : (
                melodies.map((melody) => (
                  <View key={melody.id} style={styles.melodyCard}>
                    <View style={styles.melodyHeader}>
                      <Text style={styles.melodyTimestamp}>
                        {formatTimestamp(melody.timestamp)}
                      </Text>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteMelody(melody.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.deleteButtonText}>×</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.melodyContent}>{melody.content}</Text>
                    {melody.isVoice && (
                      <View style={styles.voiceBadge}>
                        <Text style={styles.voiceBadgeText}>🎤 Voice</Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  safeArea: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  
  headerTitle: {
    flex: 1,
  },
  
  title: {
    ...Typography.heading2,
    fontSize: 24,
    marginBottom: 4,
  },
  
  subtitle: {
    ...Typography.caption,
    fontSize: 14,
    opacity: 0.8,
    fontStyle: 'italic',
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
  
  captureSection: {
    padding: 20,
  },
  
  voiceSection: {
    paddingHorizontal: 20,
  },
  
  inputCard: {
    ...GlassMorphism.card,
    borderRadius: 20,
    padding: 20,
  },
  
  input: {
    ...Typography.body,
    fontSize: 16,
    color: Colors.text.primary,
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  
  captureButton: {
    backgroundColor: Colors.tempo.moderato.primary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  
  captureButtonDisabled: {
    opacity: 0.6,
  },
  
  captureButtonText: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  
  melodiesSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  
  sectionTitle: {
    ...Typography.heading3,
    fontSize: 18,
    marginBottom: 8,
  },
  
  headerActions: {
    flexDirection: 'row',
  },
  
  actionButton: {
    ...GlassMorphism.button,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
    backgroundColor: Colors.tempo.moderato.primary + '20',
    borderColor: Colors.tempo.moderato.primary,
  },
  
  actionButtonText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.tempo.moderato.primary,
  },
  
  clearButton: {
    backgroundColor: Colors.accent.error + '20',
    borderColor: Colors.accent.error,
  },
  
  clearButtonText: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent.error,
  },
  
  melodiesList: {
    flex: 1,
  },
  
  melodiesContent: {
    paddingBottom: 100,
  },
  
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 24,
    opacity: 0.8,
  },
  
  emptyTitle: {
    ...Typography.heading3,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  
  emptyText: {
    ...Typography.body,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
    maxWidth: 280,
  },
  
  melodyCard: {
    ...GlassMorphism.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  
  melodyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  melodyTimestamp: {
    ...Typography.caption,
    fontSize: 11,
    opacity: 0.8,
  },
  
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  deleteButtonText: {
    color: Colors.accent.error,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  melodyContent: {
    ...Typography.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  
  voiceBadge: {
    backgroundColor: Colors.accent.golden + '20',
    borderColor: Colors.accent.golden,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  
  voiceBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accent.golden,
  },
})