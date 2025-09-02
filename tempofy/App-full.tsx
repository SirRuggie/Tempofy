import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native'
import { AddNote } from './src/components/shared/AddNote'
import { Playlist } from './src/components/shared/Playlist'
import { Task, Tempo, TEMPO_CONFIG } from './src/lib/supabase'

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentTempo, setCurrentTempo] = useState<Tempo>('moderato')
  const [showAddNote, setShowAddNote] = useState(false)

  const handleAddNote = async (noteData: {
    title: string
    description?: string
    tempoRequired: Tempo
    priority: number
    estimatedMinutes: number
  }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      user_id: 'local-user',
      title: noteData.title,
      description: noteData.description,
      tempo_required: noteData.tempoRequired,
      completed: false,
      priority: noteData.priority,
      estimated_minutes: noteData.estimatedMinutes,
      energy_boost: Math.ceil(noteData.estimatedMinutes / 15),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setTasks([...tasks, newTask])
  }

  const handleCompleteTask = async (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId 
        ? { ...t, completed: true, completed_at: new Date().toISOString() }
        : t
    ))
  }

  const handleTempoChange = (tempo: Tempo) => {
    setCurrentTempo(tempo)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.titleMain}>Tempofy</Text>
        <Text style={styles.titleSub}>Find Your Rhythm</Text>
      </View>

      <View style={styles.tempoSelector}>
        <Text style={styles.tempoPrompt}>What's your tempo today?</Text>
        <View style={styles.tempoOptions}>
          {(['allegro', 'moderato', 'adagio'] as Tempo[]).map(tempo => {
            const config = TEMPO_CONFIG[tempo]
            const isSelected = currentTempo === tempo
            return (
              <TouchableOpacity
                key={tempo}
                style={[
                  styles.tempoOption,
                  isSelected && { backgroundColor: config.color + '20', borderColor: config.color }
                ]}
                onPress={() => handleTempoChange(tempo)}
              >
                <Text style={styles.tempoEmoji}>{config.emoji}</Text>
                <Text style={[styles.tempoLabel, isSelected && { color: config.color }]}>
                  {config.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      <View style={styles.playlistContainer}>
        <Playlist
          tasks={tasks}
          currentTempo={currentTempo}
          onTaskComplete={handleCompleteTask}
          onAddTask={() => setShowAddNote(true)}
          filterByTempo={true}
        />
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddNote(true)}
      >
        <Text style={styles.addButtonText}>🎵 Add Note</Text>
      </TouchableOpacity>

      <AddNote
        isVisible={showAddNote}
        onClose={() => setShowAddNote(false)}
        onAddNote={handleAddNote}
        currentTempo={currentTempo}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4f0',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0d0c0',
  },
  titleMain: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4a4a4a',
    marginBottom: 4,
  },
  titleSub: {
    fontSize: 14,
    color: '#8a8a8a',
    fontStyle: 'italic',
  },
  tempoSelector: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 1,
  },
  tempoPrompt: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a4a4a',
    marginBottom: 16,
    textAlign: 'center',
  },
  tempoOptions: {
    // No gap - using marginBottom on children
  },
  tempoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f4f0',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0d0c0',
    marginBottom: 12,
  },
  tempoEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  tempoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b6b6b',
  },
  playlistContainer: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#4ecdc4',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
})