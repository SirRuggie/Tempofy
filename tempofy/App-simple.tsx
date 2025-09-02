import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native'

export default function App() {
  const [currentTempo, setCurrentTempo] = useState<'allegro' | 'moderato' | 'adagio'>('moderato')
  const [tasks, setTasks] = useState<string[]>([])

  const tempoOptions = [
    { key: 'allegro', label: 'Fast & Energetic', emoji: '🎵', color: '#ff6b6b' },
    { key: 'moderato', label: 'Steady Rhythm', emoji: '🎶', color: '#4ecdc4' },
    { key: 'adagio', label: 'Gentle Pace', emoji: '🎼', color: '#95e1d3' }
  ] as const

  const addTask = () => {
    const newTask = `Task ${tasks.length + 1}`
    setTasks([...tasks, newTask])
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.titleMain}>Tempofy</Text>
        <Text style={styles.titleSub}>Find Your Rhythm</Text>
      </View>

      <View style={styles.tempoSelector}>
        <Text style={styles.sectionTitle}>What's your tempo today? 🎵</Text>
        {tempoOptions.map((tempo) => (
          <TouchableOpacity
            key={tempo.key}
            style={[
              styles.tempoButton,
              currentTempo === tempo.key && { backgroundColor: tempo.color + '30', borderColor: tempo.color }
            ]}
            onPress={() => setCurrentTempo(tempo.key)}
          >
            <Text style={styles.tempoEmoji}>{tempo.emoji}</Text>
            <Text style={[
              styles.tempoLabel,
              currentTempo === tempo.key && { color: tempo.color }
            ]}>
              {tempo.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.taskSection}>
        <Text style={styles.sectionTitle}>Your Musical Notes 🎼</Text>
        {tasks.length === 0 ? (
          <Text style={styles.emptyText}>No notes yet! Add your first one below.</Text>
        ) : (
          tasks.map((task, index) => (
            <View key={index} style={styles.taskItem}>
              <Text style={styles.taskText}>{task}</Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={addTask}>
        <Text style={styles.addButtonText}>🎵 Add Note</Text>
      </TouchableOpacity>
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
    paddingHorizontal: 20,
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
    fontSize: 16,
    color: '#8a8a8a',
    fontStyle: 'italic',
  },
  tempoSelector: {
    padding: 20,
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4a4a4a',
    marginBottom: 16,
    textAlign: 'center',
  },
  tempoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f4f0',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0d0c0',
    marginBottom: 8,
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
  taskSection: {
    flex: 1,
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8a8a8a',
    fontStyle: 'italic',
    marginTop: 20,
  },
  taskItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4ecdc4',
  },
  taskText: {
    fontSize: 16,
    color: '#4a4a4a',
  },
  addButton: {
    backgroundColor: '#4ecdc4',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
})