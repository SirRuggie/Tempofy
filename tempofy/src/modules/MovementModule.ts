import { Movement, Task, Tempo } from '../lib/supabase'
import { StorageModule } from '../utils/storage'

export interface MovementTemplate {
  name: string
  description: string
  type: 'symphony' | 'ensemble' | 'solo'
  color_theme: string
  template_category: string
  emoji: string
  suggested_tasks: string[]
}

export class MovementModule {
  
  static getMovementTemplates(): MovementTemplate[] {
    return [
      {
        name: 'Shopping Symphony',
        description: 'Organize your shopping lists and store visits',
        type: 'solo',
        color_theme: '#4ade80',
        template_category: 'daily_life',
        emoji: '🛒',
        suggested_tasks: [
          'Create grocery list',
          'Check store hours',
          'Gather reusable bags',
          'Review weekly meal plan'
        ]
      },
      {
        name: 'Errands Ensemble',
        description: 'Coordinate multiple errands and appointments',
        type: 'ensemble',
        color_theme: '#3b82f6',
        template_category: 'daily_life',
        emoji: '🚗',
        suggested_tasks: [
          'Schedule appointments',
          'Plan efficient route',
          'Gather required documents',
          'Check business hours'
        ]
      },
      {
        name: 'Project Concerto',
        description: 'Break down complex projects into manageable pieces',
        type: 'symphony',
        color_theme: '#8b5cf6',
        template_category: 'work',
        emoji: '💼',
        suggested_tasks: [
          'Define project scope',
          'Create timeline',
          'Identify key milestones',
          'Set up project files'
        ]
      },
      {
        name: 'Morning Overture',
        description: 'Start your day with a harmonious routine',
        type: 'solo',
        color_theme: '#f59e0b',
        template_category: 'routine',
        emoji: '☀️',
        suggested_tasks: [
          'Morning meditation',
          'Review daily priorities',
          'Check weather forecast',
          'Prepare healthy breakfast'
        ]
      },
      {
        name: 'Evening Sonata',
        description: 'Wind down peacefully with evening tasks',
        type: 'solo',
        color_theme: '#6366f1',
        template_category: 'routine',
        emoji: '🌙',
        suggested_tasks: [
          'Reflect on daily wins',
          'Prepare for tomorrow',
          'Relaxation activity',
          'Set sleep environment'
        ]
      },
      {
        name: 'Health Harmony',
        description: 'Keep your wellness activities in perfect rhythm',
        type: 'solo',
        color_theme: '#10b981',
        template_category: 'health',
        emoji: '🌱',
        suggested_tasks: [
          'Schedule health appointments',
          'Plan workout routine',
          'Track daily medications',
          'Meal prep planning'
        ]
      }
    ]
  }

  static async createMovement(movementData: {
    name: string
    description?: string
    type?: 'symphony' | 'ensemble' | 'solo'
    color_theme?: string
    template_category?: string
  }): Promise<Movement | null> {
    try {
      const newMovement: Movement = {
        id: Date.now().toString(),
        user_id: 'local-user',
        name: movementData.name,
        description: movementData.description,
        type: movementData.type || 'solo',
        ensemble_members: [],
        color_theme: movementData.color_theme || '#4ecdc4',
        is_template: false,
        template_category: movementData.template_category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const movements = await StorageModule.getMovements()
      const updatedMovements = [...movements, newMovement]
      await StorageModule.saveMovements(updatedMovements)
      
      return newMovement
    } catch (error) {
      console.error('Failed to create movement:', error)
      return null
    }
  }

  static async createMovementFromTemplate(template: MovementTemplate): Promise<Movement | null> {
    return await MovementModule.createMovement({
      name: template.name,
      description: template.description,
      type: template.type,
      color_theme: template.color_theme,
      template_category: template.template_category
    })
  }

  static async getUserMovements(): Promise<Movement[]> {
    try {
      return await StorageModule.getMovements()
    } catch (error) {
      console.error('Failed to get movements:', error)
      return []
    }
  }

  static async getMovementById(movementId: string): Promise<Movement | null> {
    try {
      const movements = await StorageModule.getMovements()
      return movements.find(movement => movement.id === movementId) || null
    } catch (error) {
      console.error('Failed to get movement:', error)
      return null
    }
  }

  static async updateMovement(movementId: string, updates: Partial<Movement>): Promise<boolean> {
    try {
      const movements = await StorageModule.getMovements()
      const updatedMovements = movements.map(movement => 
        movement.id === movementId 
          ? { ...movement, ...updates, updated_at: new Date().toISOString() }
          : movement
      )
      
      await StorageModule.saveMovements(updatedMovements)
      return true
    } catch (error) {
      console.error('Failed to update movement:', error)
      return false
    }
  }

  static async deleteMovement(movementId: string): Promise<boolean> {
    try {
      const movements = await StorageModule.getMovements()
      const updatedMovements = movements.filter(movement => movement.id !== movementId)
      
      await StorageModule.saveMovements(updatedMovements)

      const tasks = await StorageModule.getTasks()
      const updatedTasks = tasks.map(task => 
        task.movement_id === movementId 
          ? { ...task, movement_id: undefined, updated_at: new Date().toISOString() }
          : task
      )
      await StorageModule.saveTasks(updatedTasks)
      
      return true
    } catch (error) {
      console.error('Failed to delete movement:', error)
      return false
    }
  }

  static async getMovementTasks(movementId: string): Promise<Task[]> {
    try {
      const tasks = await StorageModule.getTasks()
      return tasks.filter(task => task.movement_id === movementId)
    } catch (error) {
      console.error('Failed to get movement tasks:', error)
      return []
    }
  }

  static async getMovementProgress(movementId: string): Promise<{
    total: number
    completed: number
    percentage: number
    remainingTasks: Task[]
  }> {
    try {
      const tasks = await MovementModule.getMovementTasks(movementId)
      const completed = tasks.filter(task => task.completed).length
      const total = tasks.length
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
      const remainingTasks = tasks.filter(task => !task.completed)
      
      return {
        total,
        completed,
        percentage,
        remainingTasks
      }
    } catch (error) {
      console.error('Failed to get movement progress:', error)
      return { total: 0, completed: 0, percentage: 0, remainingTasks: [] }
    }
  }

  static async addTaskToMovement(taskId: string, movementId: string): Promise<boolean> {
    try {
      await StorageModule.updateTask(taskId, { 
        movement_id: movementId,
        updated_at: new Date().toISOString()
      })
      return true
    } catch (error) {
      console.error('Failed to add task to movement:', error)
      return false
    }
  }

  static async removeTaskFromMovement(taskId: string): Promise<boolean> {
    try {
      await StorageModule.updateTask(taskId, { 
        movement_id: undefined,
        updated_at: new Date().toISOString()
      })
      return true
    } catch (error) {
      console.error('Failed to remove task from movement:', error)
      return false
    }
  }

  static async getMovementsWithProgress(): Promise<Array<Movement & {
    taskCount: number
    completedCount: number
    percentage: number
    dominantTempo: Tempo | null
  }>> {
    try {
      const movements = await MovementModule.getUserMovements()
      const allTasks = await StorageModule.getTasks()
      
      return await Promise.all(movements.map(async movement => {
        const movementTasks = allTasks.filter(task => task.movement_id === movement.id)
        const completedTasks = movementTasks.filter(task => task.completed)
        const percentage = movementTasks.length > 0 
          ? Math.round((completedTasks.length / movementTasks.length) * 100) 
          : 0

        const tempoCounts = movementTasks.reduce((acc, task) => {
          acc[task.tempo_required] = (acc[task.tempo_required] || 0) + 1
          return acc
        }, {} as Record<Tempo, number>)

        const dominantTempo = Object.entries(tempoCounts).length > 0
          ? Object.entries(tempoCounts).sort(([,a], [,b]) => b - a)[0][0] as Tempo
          : null

        return {
          ...movement,
          taskCount: movementTasks.length,
          completedCount: completedTasks.length,
          percentage,
          dominantTempo
        }
      }))
    } catch (error) {
      console.error('Failed to get movements with progress:', error)
      return []
    }
  }

  static async completeAllTasksInMovement(movementId: string): Promise<{
    success: boolean
    completedCount: number
    alreadyCompleted: number
  }> {
    try {
      const tasks = await MovementModule.getMovementTasks(movementId)
      const incompleteTasks = tasks.filter(task => !task.completed)
      const alreadyCompleted = tasks.filter(task => task.completed).length
      
      for (const task of incompleteTasks) {
        await StorageModule.updateTask(task.id, {
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
      
      return {
        success: true,
        completedCount: incompleteTasks.length,
        alreadyCompleted
      }
    } catch (error) {
      console.error('Failed to complete all tasks in movement:', error)
      return { success: false, completedCount: 0, alreadyCompleted: 0 }
    }
  }

  static getMovementEmoji(type: Movement['type']): string {
    switch (type) {
      case 'symphony': return '🎼'
      case 'ensemble': return '🎭'
      case 'solo': return '🎵'
      default: return '🎶'
    }
  }

  static getMovementTypeLabel(type: Movement['type']): string {
    switch (type) {
      case 'symphony': return 'Symphony'
      case 'ensemble': return 'Ensemble'
      case 'solo': return 'Solo'
      default: return 'Solo'
    }
  }
}