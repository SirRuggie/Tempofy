import AsyncStorage from '@react-native-async-storage/async-storage'
import { Task, Tempo, User, Movement, Melody } from '../types'

const STORAGE_KEYS = {
  USER: 'tempofy_user',
  TASKS: 'tempofy_tasks', 
  CURRENT_TEMPO: 'tempofy_current_tempo',
  MOVEMENTS: 'tempofy_movements',
  MELODIES: 'tempofy_melodies',
  LAST_SYNC: 'tempofy_last_sync'
}

export class StorageModule {
  // User storage
  static async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
    } catch (error) {
      console.error('Failed to save user:', error)
    }
  }

  static async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER)
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Failed to get user:', error)
      return null
    }
  }

  // Task storage
  static async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks))
    } catch (error) {
      console.error('Failed to save tasks:', error)
    }
  }

  static async getTasks(): Promise<Task[]> {
    try {
      const tasksData = await AsyncStorage.getItem(STORAGE_KEYS.TASKS)
      return tasksData ? JSON.parse(tasksData) : []
    } catch (error) {
      console.error('Failed to get tasks:', error)
      return []
    }
  }

  static async addTask(task: Task): Promise<void> {
    try {
      const tasks = await this.getTasks()
      const updatedTasks = [...tasks, task]
      await this.saveTasks(updatedTasks)
    } catch (error) {
      console.error('Failed to add task:', error)
    }
  }

  static async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    try {
      const tasks = await this.getTasks()
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
      await this.saveTasks(updatedTasks)
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  static async deleteTask(taskId: string): Promise<void> {
    try {
      const tasks = await this.getTasks()
      const updatedTasks = tasks.filter(task => task.id !== taskId)
      await this.saveTasks(updatedTasks)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  // Movement storage methods
  static async addMovement(movement: Movement): Promise<void> {
    try {
      const movements = await this.getMovements()
      const updatedMovements = [...movements, movement]
      await this.saveMovements(updatedMovements)
    } catch (error) {
      console.error('Failed to add movement:', error)
    }
  }

  static async updateMovement(movementId: string, updates: Partial<Movement>): Promise<void> {
    try {
      const movements = await this.getMovements()
      const updatedMovements = movements.map(movement => 
        movement.id === movementId ? { ...movement, ...updates } : movement
      )
      await this.saveMovements(updatedMovements)
    } catch (error) {
      console.error('Failed to update movement:', error)
    }
  }

  static async deleteMovement(movementId: string): Promise<void> {
    try {
      const movements = await this.getMovements()
      const updatedMovements = movements.filter(movement => movement.id !== movementId)
      await this.saveMovements(updatedMovements)
    } catch (error) {
      console.error('Failed to delete movement:', error)
    }
  }

  // Tempo storage
  static async saveCurrentTempo(tempo: Tempo): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TEMPO, tempo)
    } catch (error) {
      console.error('Failed to save tempo:', error)
    }
  }

  static async getCurrentTempo(): Promise<Tempo> {
    try {
      const tempo = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TEMPO)
      return (tempo as Tempo) || 'moderato'
    } catch (error) {
      console.error('Failed to get tempo:', error)
      return 'moderato'
    }
  }

  // Movement storage
  static async saveMovements(movements: Movement[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements))
    } catch (error) {
      console.error('Failed to save movements:', error)
    }
  }

  static async getMovements(): Promise<Movement[]> {
    try {
      const movementsData = await AsyncStorage.getItem(STORAGE_KEYS.MOVEMENTS)
      return movementsData ? JSON.parse(movementsData) : []
    } catch (error) {
      console.error('Failed to get movements:', error)
      return []
    }
  }

  // Melody storage
  static async saveMelodies(melodies: Melody[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MELODIES, JSON.stringify(melodies))
    } catch (error) {
      console.error('Failed to save melodies:', error)
    }
  }

  static async getMelodies(): Promise<Melody[]> {
    try {
      const melodiesData = await AsyncStorage.getItem(STORAGE_KEYS.MELODIES)
      return melodiesData ? JSON.parse(melodiesData) : []
    } catch (error) {
      console.error('Failed to get melodies:', error)
      return []
    }
  }

  static async addMelody(melody: Melody): Promise<void> {
    try {
      const melodies = await this.getMelodies()
      const updatedMelodies = [...melodies, melody]
      await this.saveMelodies(updatedMelodies)
    } catch (error) {
      console.error('Failed to add melody:', error)
    }
  }

  // Sync metadata
  static async saveLastSyncTime(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString())
    } catch (error) {
      console.error('Failed to save sync time:', error)
    }
  }

  static async getLastSyncTime(): Promise<Date | null> {
    try {
      const syncTime = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC)
      return syncTime ? new Date(syncTime) : null
    } catch (error) {
      console.error('Failed to get sync time:', error)
      return null
    }
  }

  // Utility functions
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS))
    } catch (error) {
      console.error('Failed to clear storage:', error)
    }
  }

  static async exportData(): Promise<{
    user: User | null
    tasks: Task[]
    movements: Movement[]
    melodies: Melody[]
    currentTempo: Tempo
    lastSync: Date | null
  }> {
    return {
      user: await this.getUser(),
      tasks: await this.getTasks(),
      movements: await this.getMovements(),
      melodies: await this.getMelodies(),
      currentTempo: await this.getCurrentTempo(),
      lastSync: await this.getLastSyncTime()
    }
  }

  static async importData(data: {
    user?: User
    tasks?: Task[]
    movements?: Movement[]
    melodies?: Melody[]
    currentTempo?: Tempo
  }): Promise<void> {
    try {
      if (data.user) await this.saveUser(data.user)
      if (data.tasks) await this.saveTasks(data.tasks)
      if (data.movements) await this.saveMovements(data.movements)
      if (data.melodies) await this.saveMelodies(data.melodies)
      if (data.currentTempo) await this.saveCurrentTempo(data.currentTempo)
      await this.saveLastSyncTime()
    } catch (error) {
      console.error('Failed to import data:', error)
    }
  }
}