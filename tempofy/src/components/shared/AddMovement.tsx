import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native'
import { Movement } from '../../lib/supabase'
import { MovementModule, MovementTemplate } from '../../modules/MovementModule'
import { Colors, GlassMorphism, Typography } from '../../styles/colors'

interface AddMovementProps {
  onClose: () => void
  onAddMovement: (movement: Movement) => void
}

export const AddMovement: React.FC<AddMovementProps> = ({
  onClose,
  onAddMovement
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedType, setSelectedType] = useState<'symphony' | 'ensemble' | 'solo'>('solo')
  const [selectedColorTheme, setSelectedColorTheme] = useState('#4ecdc4')
  const [selectedTemplate, setSelectedTemplate] = useState<MovementTemplate | null>(null)
  const [showTemplates, setShowTemplates] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const templates = MovementModule.getMovementTemplates()
  
  const colorOptions = [
    { color: '#4ade80', name: 'Green' },
    { color: '#3b82f6', name: 'Blue' },
    { color: '#8b5cf6', name: 'Purple' },
    { color: '#f59e0b', name: 'Amber' },
    { color: '#6366f1', name: 'Indigo' },
    { color: '#10b981', name: 'Emerald' },
    { color: '#ef4444', name: 'Red' },
    { color: '#ec4899', name: 'Pink' }
  ]

  const typeOptions = [
    { 
      value: 'solo' as const, 
      label: 'Solo', 
      emoji: '🎵', 
      description: 'Personal tasks for individual focus' 
    },
    { 
      value: 'ensemble' as const, 
      label: 'Ensemble', 
      emoji: '🎭', 
      description: 'Collaborative tasks with others' 
    },
    { 
      value: 'symphony' as const, 
      label: 'Symphony', 
      emoji: '🎼', 
      description: 'Complex, multi-part projects' 
    }
  ]

  const resetForm = () => {
    setName('')
    setDescription('')
    setSelectedType('solo')
    setSelectedColorTheme('#4ecdc4')
    setSelectedTemplate(null)
    setShowTemplates(true)
    setIsLoading(false)
  }

  const handleClose = () => {
    if (isLoading) return
    resetForm()
    onClose()
  }

  const handleTemplateSelect = (template: MovementTemplate) => {
    setSelectedTemplate(template)
    setName(template.name)
    setDescription(template.description)
    setSelectedType(template.type)
    setSelectedColorTheme(template.color_theme)
    setShowTemplates(false)
  }

  const handleCustomMovement = () => {
    setSelectedTemplate(null)
    setShowTemplates(false)
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Every movement needs a beautiful name! 🎼')
      return
    }

    setIsLoading(true)
    try {
      const movement = await MovementModule.createMovement({
        name: name.trim(),
        description: description.trim() || undefined,
        type: selectedType,
        color_theme: selectedColorTheme,
        template_category: selectedTemplate?.template_category
      })
      
      if (movement) {
        onAddMovement(movement)
        handleClose()
      } else {
        Alert.alert('Orchestra Error', 'Failed to create your movement. Please try again! 🎭')
      }
    } catch (error) {
      Alert.alert('Orchestra Error', 'Failed to create your movement. Please try again! 🎭')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal visible={true} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Create Movement</Text>
            <TouchableOpacity 
              onPress={handleSubmit} 
              style={[styles.createButton, isLoading && styles.createButtonDisabled]}
              disabled={isLoading}
            >
              <Text style={styles.createButtonText}>
                {isLoading ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {showTemplates ? (
              <View style={styles.templatesSection}>
                <Text style={styles.sectionTitle}>🎭 Choose a Template</Text>
                <Text style={styles.sectionSubtitle}>
                  Start with a proven pattern or create your own
                </Text>
                
                <View style={styles.templateGrid}>
                  {templates.map((template) => (
                    <TouchableOpacity
                      key={template.name}
                      style={[styles.templateCard, { borderColor: template.color_theme }]}
                      onPress={() => handleTemplateSelect(template)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.templateEmoji}>{template.emoji}</Text>
                      <Text style={styles.templateName}>{template.name}</Text>
                      <Text style={styles.templateDescription}>{template.description}</Text>
                    </TouchableOpacity>
                  ))}
                  
                  <TouchableOpacity
                    style={styles.customCard}
                    onPress={handleCustomMovement}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.customEmoji}>✨</Text>
                    <Text style={styles.customName}>Custom Movement</Text>
                    <Text style={styles.customDescription}>Create your own unique movement</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.formSection}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => setShowTemplates(true)}
                >
                  <Text style={styles.backButtonText}>← Back to Templates</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Movement Details</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Your Beautiful Symphony"
                    placeholderTextColor={Colors.text.secondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="What makes this movement special?"
                    placeholderTextColor={Colors.text.secondary}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Movement Type</Text>
                  <View style={styles.optionsGrid}>
                    {typeOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.typeOption,
                          selectedType === option.value && styles.typeOptionSelected
                        ]}
                        onPress={() => setSelectedType(option.value)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.typeOptionEmoji}>{option.emoji}</Text>
                        <Text style={styles.typeOptionLabel}>{option.label}</Text>
                        <Text style={styles.typeOptionDescription}>{option.description}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Color Theme</Text>
                  <View style={styles.colorGrid}>
                    {colorOptions.map((option) => (
                      <TouchableOpacity
                        key={option.color}
                        style={[
                          styles.colorOption,
                          { backgroundColor: option.color },
                          selectedColorTheme === option.color && styles.colorOptionSelected
                        ]}
                        onPress={() => setSelectedColorTheme(option.color)}
                        activeOpacity={0.8}
                      >
                        {selectedColorTheme === option.color && (
                          <Text style={styles.colorCheckmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  keyboardView: {
    flex: 1,
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
  },
  
  closeButtonText: {
    ...Typography.body,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  
  title: {
    ...Typography.heading2,
    fontSize: 20,
    textAlign: 'center',
  },
  
  createButton: {
    backgroundColor: Colors.tempo.moderato.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  
  createButtonDisabled: {
    opacity: 0.6,
  },
  
  createButtonText: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  
  content: {
    flex: 1,
  },
  
  templatesSection: {
    padding: 20,
  },
  
  formSection: {
    padding: 20,
  },
  
  backButton: {
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  
  backButtonText: {
    ...Typography.body,
    fontSize: 16,
    color: Colors.tempo.moderato.primary,
  },
  
  sectionTitle: {
    ...Typography.heading2,
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  
  sectionSubtitle: {
    ...Typography.body,
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 24,
  },
  
  templateGrid: {
    gap: 16,
  },
  
  templateCard: {
    ...GlassMorphism.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    alignItems: 'center',
  },
  
  templateEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  
  templateName: {
    ...Typography.heading3,
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  
  templateDescription: {
    ...Typography.caption,
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  customCard: {
    ...GlassMorphism.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.ui.border,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  
  customEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  
  customName: {
    ...Typography.heading3,
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  
  customDescription: {
    ...Typography.caption,
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
  },
  
  inputGroup: {
    marginBottom: 24,
  },
  
  inputLabel: {
    ...Typography.label,
    fontSize: 16,
    marginBottom: 8,
  },
  
  textInput: {
    ...GlassMorphism.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  
  optionsGrid: {
    gap: 12,
  },
  
  typeOption: {
    ...GlassMorphism.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    alignItems: 'center',
  },
  
  typeOptionSelected: {
    borderColor: Colors.tempo.moderato.primary,
    backgroundColor: Colors.tempo.moderato.primary + '20',
  },
  
  typeOptionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  
  typeOptionLabel: {
    ...Typography.heading3,
    fontSize: 16,
    marginBottom: 4,
  },
  
  typeOptionDescription: {
    ...Typography.caption,
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'center',
  },
  
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: Colors.text.primary,
  },
  
  colorCheckmark: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
})