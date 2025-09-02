import React, { useState, useCallback, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AddNote } from './src/components/shared/AddNote'
import { EditNote } from './src/components/shared/EditNote'
import { Celebration } from './src/components/shared/Celebration'
import { Playlist } from './src/components/shared/Playlist'
import { FermataMode } from './src/components/shared/FermataMode'
import { MelodyCapture } from './src/components/shared/MelodyCapture'
import { MovementList } from './src/components/shared/MovementList'
import { AddMovement } from './src/components/shared/AddMovement'
import { MovementDetail } from './src/components/shared/MovementDetail'
import { TabNavigator, TabType } from './src/components/shared/TabNavigator'
import { CompactHeader } from './src/components/shared/CompactHeader'
import { TempoScreen } from './src/components/screens/TempoScreen'
import { FilterBar, SortType } from './src/components/shared/FilterBar'
import { LogoIcon } from './src/components/shared/Logo'
import { Task, Tempo, TEMPO_CONFIG, Movement } from './src/lib/supabase'
import { MovementModule } from './src/modules/MovementModule'
import { Colors, GlassMorphism, Typography } from './src/styles/colors'

const STORAGE_KEYS = {
  TASKS: '@tempofy_tasks',
  CURRENT_TEMPO: '@tempofy_current_tempo',
  TEMPO_HISTORY: '@tempofy_tempo_history',
  MOVEMENTS: '@tempofy_movements'
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [movements, setMovements] = useState<Movement[]>([])
  const [currentTempo, setCurrentTempo] = useState<Tempo>('moderato')
  const [showAddNote, setShowAddNote] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [celebrationData, setCelebrationData] = useState<{ visible: boolean; taskTitle: string }>({
    visible: false,
    taskTitle: ''
  })
  const [sortBy, setSortBy] = useState<SortType>('newest')
  const [filterTempo, setFilterTempo] = useState<Tempo | 'all'>('all')
  const [activeTab, setActiveTab] = useState<TabType>('tasks')
  const [showFermataMode, setShowFermataMode] = useState(false)
  const [showMelodyCapture, setShowMelodyCapture] = useState(false)
  const [showAddMovement, setShowAddMovement] = useState(false)
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null)
  const [selectedMovementId, setSelectedMovementId] = useState<string | null>(null)
  const [movementsWithProgress, setMovementsWithProgress] = useState<Array<Movement & {
    taskCount: number
    completedCount: number
    percentage: number
    dominantTempo: string | null
  }>>([])

  // Load data from AsyncStorage on app start
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedTasks, savedTempo, savedMovements] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.TASKS),
          AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TEMPO),
          AsyncStorage.getItem(STORAGE_KEYS.MOVEMENTS)
        ])
        
        if (savedTasks) {
          const parsedTasks = JSON.parse(savedTasks)
          setTasks(parsedTasks)
        }
        
        if (savedTempo) {
          setCurrentTempo(savedTempo as Tempo)
        }

        if (savedMovements) {
          const parsedMovements = JSON.parse(savedMovements)
          setMovements(parsedMovements)
        } else {
          // Load from MovementModule if no saved movements
          const loadedMovements = await MovementModule.getUserMovements()
          setMovements(loadedMovements)
        }
      } catch (error) {
        console.error('Failed to load data from storage:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Save tasks to AsyncStorage whenever tasks change
  useEffect(() => {
    if (!isLoading) {
      const saveTasks = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
        } catch (error) {
          console.error('Failed to save tasks to storage:', error)
        }
      }
      
      saveTasks()
    }
  }, [tasks, isLoading])

  // Save current tempo to AsyncStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      const saveTempo = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TEMPO, currentTempo)
        } catch (error) {
          console.error('Failed to save current tempo to storage:', error)
        }
      }
      
      saveTempo()
    }
  }, [currentTempo, isLoading])

  // Save movements to AsyncStorage whenever movements change
  useEffect(() => {
    if (!isLoading) {
      const saveMovements = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements))
        } catch (error) {
          console.error('Failed to save movements to storage:', error)
        }
      }
      
      saveMovements()
    }
  }, [movements, isLoading])

  // Load movements with progress data whenever movements or tasks change
  useEffect(() => {
    const loadMovementsWithProgress = async () => {
      const movementsData = await MovementModule.getMovementsWithProgress()
      setMovementsWithProgress(movementsData)
    }
    
    loadMovementsWithProgress()
  }, [movements, tasks])

  const handleAddNote = useCallback((noteData: {
    title: string
    description?: string
    tempoRequired: Tempo
    priority: number
    estimatedMinutes: number
    movementId?: string
  }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      user_id: 'local-user',
      title: noteData.title,
      description: noteData.description,
      tempo_required: noteData.tempoRequired,
      completed: false,
      movement_id: noteData.movementId,
      priority: noteData.priority,
      estimated_minutes: noteData.estimatedMinutes,
      energy_boost: Math.ceil(noteData.estimatedMinutes / 15),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setTasks(prevTasks => [...prevTasks, newTask])
  }, [])

  const handleCompleteTask = useCallback((taskId: string) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(t => 
        t.id === taskId 
          ? { ...t, completed: true, completed_at: new Date().toISOString() }
          : t
      )
      
      // Find the completed task to show celebration
      const completedTask = updatedTasks.find(t => t.id === taskId)
      if (completedTask) {
        setCelebrationData({
          visible: true,
          taskTitle: completedTask.title
        })
      }
      
      return updatedTasks
    })
  }, [])

  const handleTempoChange = useCallback(async (tempo: Tempo) => {
    const previousTempo = currentTempo
    setCurrentTempo(tempo)
    
    // Track tempo change in history
    if (previousTempo !== tempo) {
      try {
        const existingHistory = await AsyncStorage.getItem(STORAGE_KEYS.TEMPO_HISTORY)
        const history = existingHistory ? JSON.parse(existingHistory) : []
        
        const newEntry = {
          id: Date.now().toString(),
          tempo,
          previousTempo,
          timestamp: new Date().toISOString(),
          context: 'manual_change'
        }
        
        const updatedHistory = [newEntry, ...history].slice(0, 100) // Keep last 100 entries
        await AsyncStorage.setItem(STORAGE_KEYS.TEMPO_HISTORY, JSON.stringify(updatedHistory))
      } catch (error) {
        console.error('Failed to save tempo history:', error)
      }
    }
  }, [currentTempo])

  const handleCloseModal = useCallback(() => {
    setShowAddNote(false)
  }, [])

  const handleShowModal = useCallback(() => {
    setShowAddNote(true)
  }, [])

  const handleTaskPress = useCallback((task: Task) => {
    setEditingTask(task)
  }, [])

  const handleUpdateTask = useCallback((taskData: {
    id: string
    title: string
    description?: string
    tempoRequired: Tempo
    priority: number
    estimatedMinutes: number
  }) => {
    setTasks(prevTasks => prevTasks.map(t => 
      t.id === taskData.id 
        ? { 
            ...t, 
            title: taskData.title,
            description: taskData.description,
            tempo_required: taskData.tempoRequired,
            priority: taskData.priority,
            estimated_minutes: taskData.estimatedMinutes,
            energy_boost: Math.ceil(taskData.estimatedMinutes / 15),
            updated_at: new Date().toISOString()
          }
        : t
    ))
  }, [])

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId))
  }, [])

  const handleCloseEditModal = useCallback(() => {
    setEditingTask(null)
  }, [])

  const handleCelebrationComplete = useCallback(() => {
    setCelebrationData({ visible: false, taskTitle: '' })
  }, [])

  const handleOpenFermataMode = useCallback(() => {
    setShowFermataMode(true)
  }, [])

  const handleCloseFermataMode = useCallback(() => {
    setShowFermataMode(false)
  }, [])

  const handleOpenMelodyCapture = useCallback(() => {
    setShowMelodyCapture(true)
  }, [])

  const handleCloseMelodyCapture = useCallback(() => {
    setShowMelodyCapture(false)
  }, [])

  const handleCreateTasksFromMelodies = useCallback((melodies: any[]) => {
    const newTasks = melodies.map(melody => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      user_id: 'local-user', 
      title: melody.content.length > 50 ? melody.content.substring(0, 50) + '...' : melody.content,
      description: melody.content,
      tempo_required: currentTempo,
      completed: false,
      movement_id: selectedMovementId || undefined,
      priority: 3, // Default medium priority
      estimated_minutes: 15, // Default 15 minutes
      energy_boost: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    setTasks(prevTasks => [...prevTasks, ...newTasks])
  }, [currentTempo, selectedMovementId])

  // Movement-related handlers
  const handleShowAddMovement = useCallback(() => {
    setShowAddMovement(true)
  }, [])

  const handleCloseAddMovement = useCallback(() => {
    setShowAddMovement(false)
  }, [])

  const handleAddMovement = useCallback((movement: Movement) => {
    setMovements(prevMovements => [...prevMovements, movement])
    setShowAddMovement(false)
  }, [])

  const handleMovementPress = useCallback((movement: Movement) => {
    setSelectedMovement(movement)
  }, [])

  const handleCloseMovementDetail = useCallback(() => {
    setSelectedMovement(null)
  }, [])

  const handleMovementUpdate = useCallback((updatedMovement: Movement) => {
    setMovements(prevMovements => 
      prevMovements.map(m => m.id === updatedMovement.id ? updatedMovement : m)
    )
  }, [])

  const handleMovementDelete = useCallback(async (movementId: string) => {
    // Remove the movement
    setMovements(prevMovements => prevMovements.filter(m => m.id !== movementId))
    
    // Unlink tasks from the deleted movement
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.movement_id === movementId 
          ? { ...task, movement_id: undefined, updated_at: new Date().toISOString() }
          : task
      )
    )
  }, [])

  const handleAddTaskToMovement = useCallback((movementId: string) => {
    setSelectedMovementId(movementId)
    setShowAddNote(true)
  }, [])

  const getTempoGradient = (tempo: Tempo): string[] => {
    switch (tempo) {
      case 'allegro':
        return [Colors.tempo.allegro.primary, '#F7931E']
      case 'moderato':
        return [Colors.tempo.moderato.primary, '#0891B2']
      case 'adagio':
        return [Colors.tempo.adagio.primary, '#8B5CF6']
      default:
        return [Colors.tempo.moderato.primary, '#0891B2']
    }
  }

  const getTempoDescription = (tempo: Tempo): string => {
    switch (tempo) {
      case 'allegro':
        return 'High energy, quick tasks'
      case 'moderato':
        return 'Steady pace, balanced focus'
      case 'adagio':
        return 'Gentle pace, mindful tasks'
      default:
        return 'Balanced productivity'
    }
  }

  const getFilteredAndSortedTasks = useCallback(() => {
    let filteredTasks = tasks.filter(task => !task.completed)
    
    // Apply tempo filter
    if (filterTempo !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.tempo_required === filterTempo)
    }
    
    // Apply sorting
    filteredTasks.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'priority':
          return a.priority - b.priority // Lower numbers = higher priority
        case 'time':
          return a.estimated_minutes - b.estimated_minutes
        default:
          return 0
      }
    })
    
    return filteredTasks
  }, [tasks, filterTempo, sortBy])

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LogoIcon width={96} height={96} style={styles.loadingLogo} />
        <Text style={styles.loadingText}>Loading your symphony...</Text>
      </View>
    )
  }

  const renderTasksScreen = () => (
    <View style={styles.screenContainer}>
      <FilterBar
        filterTempo={filterTempo}
        sortBy={sortBy}
        onFilterChange={setFilterTempo}
        onSortChange={setSortBy}
        taskCount={getFilteredAndSortedTasks().length}
      />
      
      <Playlist
        tasks={getFilteredAndSortedTasks()}
        movements={movements}
        currentTempo={currentTempo}
        onTaskComplete={handleCompleteTask}
        onTaskPress={handleTaskPress}
        onAddTask={handleShowModal}
        filterByTempo={false}
        groupByMovement={false}
        onMovementPress={handleMovementPress}
      />
    </View>
  )

  const renderTempoScreen = () => (
    <TempoScreen
      currentTempo={currentTempo}
      onTempoChange={handleTempoChange}
    />
  )

  const renderMovementsScreen = () => (
    <View style={styles.screenContainer}>
      <MovementList
        movements={movementsWithProgress}
        onRefresh={async () => {
          const movementsData = await MovementModule.getMovementsWithProgress()
          setMovementsWithProgress(movementsData)
        }}
        onAddMovement={handleShowAddMovement}
        onMovementPress={handleMovementPress}
        onMovementDelete={handleMovementDelete}
      />
    </View>
  )

  const renderProfileScreen = () => (
    <View style={styles.screenContainer}>
      <View style={styles.profileContainer}>
        <Text style={styles.profileEmoji}>👤</Text>
        <Text style={styles.profileTitle}>Profile</Text>
        <Text style={styles.profileMessage}>Your profile features are coming soon!</Text>
        
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Stats</Text>
          <Text style={styles.statItem}>📝 Total Tasks: {tasks.length}</Text>
          <Text style={styles.statItem}>✅ Completed: {tasks.filter(t => t.completed).length}</Text>
          <Text style={styles.statItem}>🎭 Movements: {movements.length}</Text>
          <Text style={styles.statItem}>🎵 Current Tempo: {TEMPO_CONFIG[currentTempo].label}</Text>
        </View>
      </View>
    </View>
  )

  const renderCurrentScreen = () => {
    switch (activeTab) {
      case 'tasks':
        return renderTasksScreen()
      case 'movements':
        return renderMovementsScreen()
      case 'tempo':
        return renderTempoScreen()
      case 'profile':
        return renderProfileScreen()
      default:
        return renderTasksScreen()
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.backgroundGradient}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.statusBarSpacer} />
          
          <CompactHeader
            currentTempo={currentTempo}
            onTempoPress={() => setActiveTab('tempo')}
            onFermataPress={handleOpenFermataMode}
            onMelodyCapturePress={handleOpenMelodyCapture}
          />

          <View style={styles.contentContainer}>
            {renderCurrentScreen()}
          </View>

          <TabNavigator
            activeTab={activeTab}
            onTabChange={setActiveTab}
            taskCount={getFilteredAndSortedTasks().length}
            movementCount={movements.length}
            completedToday={tasks.filter(t => 
              t.completed && 
              new Date(t.completed_at!).toDateString() === new Date().toDateString()
            ).length}
          />

          {activeTab === 'tasks' && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleShowModal}
              activeOpacity={0.9}
            >
              <Text style={styles.addButtonIcon}>🎼</Text>
            </TouchableOpacity>
          )}

          {showAddNote && (
            <AddNote
              onClose={() => {
                handleCloseModal()
                setSelectedMovementId(null) // Clear selected movement when closing
              }}
              onAddNote={handleAddNote}
              currentTempo={currentTempo}
              movements={movements}
              selectedMovementId={selectedMovementId}
            />
          )}

          {editingTask && (
            <EditNote
              task={editingTask}
              onClose={handleCloseEditModal}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          <Celebration
            visible={celebrationData.visible}
            taskTitle={celebrationData.taskTitle}
            onComplete={handleCelebrationComplete}
            tempo={currentTempo}
          />

          <FermataMode
            visible={showFermataMode}
            onClose={handleCloseFermataMode}
            tasks={tasks}
            onTaskComplete={handleCompleteTask}
          />

          <MelodyCapture
            visible={showMelodyCapture}
            onClose={handleCloseMelodyCapture}
            onCreateTasksFromMelodies={handleCreateTasksFromMelodies}
          />

          {showAddMovement && (
            <AddMovement
              onClose={handleCloseAddMovement}
              onAddMovement={handleAddMovement}
            />
          )}

          {selectedMovement && (
            <MovementDetail
              movement={selectedMovement}
              onClose={handleCloseMovementDetail}
              onMovementUpdate={handleMovementUpdate}
              onMovementDelete={handleMovementDelete}
              onTaskPress={handleTaskPress}
              onTaskComplete={handleCompleteTask}
              onAddTask={handleAddTaskToMovement}
            />
          )}
        </SafeAreaView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  backgroundGradient: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  safeArea: {
    flex: 1,
  },
  
  statusBarSpacer: {
    height: Platform.OS === 'android' ? 40 : 0,
  },
  
  contentContainer: {
    flex: 1,
  },
  
  screenContainer: {
    flex: 1,
  },
  
  profileContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  
  profileEmoji: {
    fontSize: 64,
    marginBottom: 24,
    opacity: 0.8,
  },
  
  profileTitle: {
    ...Typography.heading1,
    fontSize: 28,
    marginBottom: 16,
    textAlign: 'center',
  },
  
  profileMessage: {
    ...Typography.body,
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
    lineHeight: 22,
  },
  
  statsCard: {
    ...GlassMorphism.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    minWidth: 280,
  },
  
  statsTitle: {
    ...Typography.heading3,
    fontSize: 18,
    marginBottom: 16,
    color: Colors.accent.golden,
  },
  
  statItem: {
    ...Typography.body,
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.9,
    textAlign: 'center',
  },
  
  addButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    ...GlassMorphism.card,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.3)',
    borderColor: Colors.tempo.moderato.primary,
    shadowColor: Colors.tempo.moderato.primary,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  
  addButtonIcon: {
    fontSize: 28,
    textAlign: 'center',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingLogo: {
    marginBottom: 24,
    opacity: 0.9,
  },

  loadingText: {
    ...Typography.body,
    fontSize: 18,
    opacity: 0.7,
  },

})