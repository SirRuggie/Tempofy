import { supabase, Movement, Task, User } from '../lib/supabase'

export class EnsembleModule {
  // Create a family orchestra
  static async createOrchestra(conductorId: string, orchestraName: string): Promise<Movement | null> {
    const { data, error } = await supabase
      .from('movements')
      .insert({
        user_id: conductorId,
        name: orchestraName,
        description: 'Family harmony workspace',
        type: 'ensemble',
        ensemble_members: [conductorId],
        color_theme: 'ensemble-gold'
      })
      .select()
      .single()
      
    if (error || !data) return null
    return data as Movement
  }
  
  // Invite family member to orchestra
  static async inviteMember(orchestraId: string, conductorId: string, memberEmail: string): Promise<{success: boolean, message: string}> {
    // Find the user by email
    const { data: member, error: findError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', memberEmail.toLowerCase())
      .single()
    
    if (findError || !member) {
      return { 
        success: false, 
        message: "That musician isn't in our orchestra yet. They'll need to join Tempofy first!" 
      }
    }
    
    // Get current orchestra
    const { data: orchestra, error: orchestraError } = await supabase
      .from('movements')
      .select('*')
      .eq('id', orchestraId)
      .eq('user_id', conductorId)
      .single()
    
    if (orchestraError || !orchestra) {
      return { success: false, message: "Orchestra not found or you don't have permission" }
    }
    
    // Check if already member
    if (orchestra.ensemble_members.includes(member.id)) {
      return { success: false, message: "They're already playing in this orchestra!" }
    }
    
    // Add member to orchestra
    const updatedMembers = [...orchestra.ensemble_members, member.id]
    const { error: updateError } = await supabase
      .from('movements')
      .update({ ensemble_members: updatedMembers })
      .eq('id', orchestraId)
    
    if (updateError) {
      return { success: false, message: "Failed to send invitation" }
    }
    
    return { 
      success: true, 
      message: `${memberEmail} has joined the orchestra! 🎵🎉` 
    }
  }
  
  // Get all orchestras user is part of
  static async getMyOrchestras(userId: string): Promise<Movement[]> {
    const { data, error } = await supabase
      .from('movements')
      .select('*')
      .eq('type', 'ensemble')
      .contains('ensemble_members', [userId])
      .order('created_at', { ascending: false })
    
    if (error || !data) return []
    return data as Movement[]
  }
  
  // Create a duet task (collaborative task)
  static async createDuetTask(orchestraId: string, taskData: {
    title: string
    description?: string
    assignedTo: string[]
    priority?: number
    estimatedMinutes?: number
  }): Promise<Task | null> {
    // Create task in the orchestra movement
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        // Use first assigned member as task owner (could be enhanced)
        user_id: taskData.assignedTo[0], 
        title: `🎭 ${taskData.title}`, // Mark as duet task
        description: `${taskData.description || ''}\n\nCollaborators: ${taskData.assignedTo.length} musicians`,
        movement_id: orchestraId,
        priority: taskData.priority || 3,
        estimated_minutes: taskData.estimatedMinutes || 30, // Collaborative tasks typically take longer
        tempo_required: 'moderato' // Default for collaboration
      })
      .select()
      .single()
    
    if (error || !data) return null
    return data as Task
  }
  
  // Pass the baton (delegate task)
  static async passTheBaton(taskId: string, fromUserId: string, toUserId: string): Promise<{success: boolean, message: string}> {
    // Verify task ownership
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', fromUserId)
      .single()
    
    if (taskError || !task) {
      return { success: false, message: "Task not found or you don't have permission" }
    }
    
    // Check if target user is in same orchestra
    if (task.movement_id) {
      const { data: movement } = await supabase
        .from('movements')
        .select('ensemble_members')
        .eq('id', task.movement_id)
        .single()
      
      if (movement && !movement.ensemble_members.includes(toUserId)) {
        return { success: false, message: "They're not in this orchestra" }
      }
    }
    
    // Transfer task
    const { error: transferError } = await supabase
      .from('tasks')
      .update({ 
        user_id: toUserId,
        title: `🎭 ${task.title}` // Mark as passed task if not already
      })
      .eq('id', taskId)
    
    if (transferError) {
      return { success: false, message: "Failed to pass the baton" }
    }
    
    return { 
      success: true, 
      message: "Baton passed successfully! The music continues! 🎼✨" 
    }
  }
  
  // Get orchestra harmony score (completion rate)
  static async getHarmonyScore(orchestraId: string): Promise<{
    score: number
    totalTasks: number
    completedTasks: number
    memberContributions: Record<string, number>
  }> {
    // Get all tasks in this orchestra
    const { data: tasks } = await supabase
      .from('tasks')
      .select('user_id, completed')
      .eq('movement_id', orchestraId)
    
    if (!tasks || tasks.length === 0) {
      return { score: 100, totalTasks: 0, completedTasks: 0, memberContributions: {} }
    }
    
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(task => task.completed).length
    const score = Math.round((completedTasks / totalTasks) * 100)
    
    // Calculate member contributions
    const memberContributions: Record<string, number> = {}
    for (const task of tasks.filter(t => t.completed)) {
      memberContributions[task.user_id] = (memberContributions[task.user_id] || 0) + 1
    }
    
    return { score, totalTasks, completedTasks, memberContributions }
  }
  
  // Get orchestra members with their current tempo
  static async getOrchestraMembers(orchestraId: string): Promise<Array<{
    id: string
    email: string
    currentTempo: string
    measuresCompleted: number
    isOnline: boolean
  }>> {
    const { data: orchestra } = await supabase
      .from('movements')
      .select('ensemble_members')
      .eq('id', orchestraId)
      .single()
    
    if (!orchestra || !orchestra.ensemble_members) return []
    
    const { data: members } = await supabase
      .from('users')
      .select('id, email, current_tempo, measures_completed')
      .in('id', orchestra.ensemble_members)
    
    if (!members) return []
    
    // In a real app, you'd check last activity for online status
    return members.map(member => ({
      id: member.id,
      email: member.email,
      currentTempo: member.current_tempo,
      measuresCompleted: member.measures_completed,
      isOnline: Math.random() > 0.3 // Mock online status
    }))
  }
  
  // Get ensemble activity feed
  static async getEnsembleActivity(orchestraId: string, limit: number = 10): Promise<Array<{
    type: 'task_completed' | 'task_created' | 'member_joined' | 'baton_passed'
    message: string
    timestamp: string
    memberEmail?: string
  }>> {
    // This would normally pull from an activity log table
    // For now, return recent task activity
    const { data: recentTasks } = await supabase
      .from('tasks')
      .select(`
        id, title, completed, completed_at, created_at, user_id,
        users!inner(email)
      `)
      .eq('movement_id', orchestraId)
      .order('updated_at', { ascending: false })
      .limit(limit)
    
    if (!recentTasks) return []
    
    const activities = recentTasks.map(task => {
      if (task.completed && task.completed_at) {
        return {
          type: 'task_completed' as const,
          message: `🎵 "${task.title}" completed`,
          timestamp: task.completed_at,
          memberEmail: (task as any).users.email
        }
      } else {
        return {
          type: 'task_created' as const, 
          message: `🎼 "${task.title}" added to playlist`,
          timestamp: task.created_at,
          memberEmail: (task as any).users.email
        }
      }
    })
    
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }
  
  // Leave orchestra
  static async leaveOrchestra(orchestraId: string, userId: string): Promise<{success: boolean, message: string}> {
    const { data: orchestra, error } = await supabase
      .from('movements')
      .select('user_id, ensemble_members')
      .eq('id', orchestraId)
      .single()
    
    if (error || !orchestra) {
      return { success: false, message: "Orchestra not found" }
    }
    
    // Can't leave if you're the conductor (owner)
    if (orchestra.user_id === userId) {
      return { success: false, message: "Conductors cannot abandon their orchestra! Transfer leadership first." }
    }
    
    // Remove from ensemble
    const updatedMembers = orchestra.ensemble_members.filter((id: string) => id !== userId)
    const { error: updateError } = await supabase
      .from('movements')
      .update({ ensemble_members: updatedMembers })
      .eq('id', orchestraId)
    
    if (updateError) {
      return { success: false, message: "Failed to leave orchestra" }
    }
    
    return { 
      success: true, 
      message: "You've gracefully exited the orchestra. Your music will be missed! 🎼💫" 
    }
  }
}