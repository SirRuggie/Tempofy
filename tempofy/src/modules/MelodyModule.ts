import { supabase, Melody } from '../lib/supabase'

export class MelodyModule {
  // Capture a fleeting melody (brain dump)
  static async captureMelody(userId: string, content: string, isVoice: boolean = false): Promise<Melody | null> {
    const { data, error } = await supabase
      .from('melodies')
      .insert({
        user_id: userId,
        content: content.trim(),
        is_voice: isVoice,
        processed: false
      })
      .select()
      .single()
    
    if (error || !data) return null
    return data as Melody
  }
  
  // Get all unfinished melodies (brain dump inbox)
  static async getUnfinishedMelodies(userId: string): Promise<Melody[]> {
    const { data, error } = await supabase
      .from('melodies')
      .select('*')
      .eq('user_id', userId)
      .eq('processed', false)
      .order('created_at', { ascending: false })
    
    if (error || !data) return []
    return data as Melody[]
  }
  
  // Process melody into structured tasks
  static async processMelody(melodyId: string, userId: string): Promise<string[]> {
    const { data: melody, error } = await supabase
      .from('melodies')
      .select('*')
      .eq('id', melodyId)
      .eq('user_id', userId)
      .single()
    
    if (error || !melody) return []
    
    // Simple task extraction (could be enhanced with AI)
    const suggestions = MelodyModule.extractTasks(melody.content)
    
    // Mark melody as processed
    await supabase
      .from('melodies')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString(),
        processing_notes: `Extracted ${suggestions.length} potential tasks`
      })
      .eq('id', melodyId)
    
    return suggestions
  }
  
  // Extract potential tasks from melody content
  private static extractTasks(content: string): string[] {
    const lines = content.split('\n').filter(line => line.trim().length > 0)
    const tasks: string[] = []
    
    // Look for action words and patterns
    const actionPatterns = [
      /^(.*?)(?:need to|have to|should|must|want to|plan to)\s+(.+)$/i,
      /^(buy|get|call|email|text|visit|schedule|book|make|do|finish|complete|start|begin)\s+(.+)$/i,
      /^(.+?)\s+(?:by|before|until)\s+(.+)$/i,
      /^\s*[-•*]\s*(.+)$/  // Bullet points
    ]
    
    for (const line of lines) {
      let taskExtracted = false
      
      // Try pattern matching
      for (const pattern of actionPatterns) {
        const match = line.match(pattern)
        if (match) {
          if (pattern.source.includes('[-•*]')) {
            // Bullet point
            tasks.push(match[1].trim())
          } else if (match[2]) {
            // Action + object
            tasks.push(`${match[1]} ${match[2]}`.trim())
          }
          taskExtracted = true
          break
        }
      }
      
      // If no pattern matched, but it looks like a task (short, actionable)
      if (!taskExtracted && line.length < 100 && line.length > 5) {
        // Check if it contains task-like words
        const taskWords = /\b(buy|get|call|email|text|visit|schedule|book|make|do|finish|complete|start|begin|remember|check|review|update|send|plan|organize|clean|fix|repair|install|setup|download|upload|print|scan|write|read|study|practice|exercise|cook|prepare|wash|fold|vacuum|mop|water|feed|walk|drive|pick up|drop off|return|exchange|cancel|confirm|pay|order|ship|deliver|meet|attend|join|leave|arrive|depart|pack|unpack|sort|label|file|backup|sync|charge|plug in|turn on|turn off|restart|shutdown|login|logout|sign up|subscribe|unsubscribe|like|share|comment|post|upload|download|save|delete|edit|copy|paste|cut|print|scan|fax|mail|ship|track|monitor|measure|count|calculate|estimate|budget|plan|design|create|build|construct|assemble|disassemble|install|uninstall|configure|setup|troubleshoot|debug|test|verify|validate|approve|reject|accept|decline|confirm|cancel|reschedule|postpone|delay|rush|expedite|prioritize|delegate|assign|transfer|forward|redirect|reroute|navigate|search|find|locate|identify|recognize|classify|categorize|sort|filter|select|choose|decide|determine|resolve|solve|answer|respond|reply|acknowledge|notify|inform|alert|remind|warn|advise|recommend|suggest|propose|request|ask|inquire|question|interview|survey|poll|vote|rate|review|evaluate|assess|analyze|examine|inspect|investigate|research|study|learn|teach|train|coach|mentor|guide|lead|manage|supervise|oversee|coordinate|collaborate|cooperate|partner|team up|network|connect|link|associate|relate|compare|contrast|match|align|sync|balance|adjust|modify|change|update|upgrade|downgrade|rollback|restore|recover|backup|archive|store|organize|arrange|rearrange|reorder|restructure|redesign|refactor|optimize|improve|enhance|increase|decrease|reduce|minimize|maximize|expand|extend|contract|shrink|grow|scale|resize|crop|trim|cut|split|merge|combine|unite|separate|divide|distribute|spread|scatter|gather|collect|accumulate|aggregate|consolidate|compress|decompress|zip|unzip|encrypt|decrypt|encode|decode|translate|convert|transform|migrate|import|export|sync|backup|restore|clone|duplicate|copy|move|relocate|transfer|transport|deliver|ship|send|receive|accept|reject|return|exchange|trade|swap|replace|substitute|upgrade|downgrade|install|uninstall|activate|deactivate|enable|disable|start|stop|pause|resume|continue|restart|reset|refresh|reload|update|patch|fix|repair|maintain|service|clean|wash|rinse|dry|fold|iron|hang|store|organize|arrange|decorate|furnish|equip|stock|supply|provide|offer|serve|deliver|present|display|show|demonstrate|perform|execute|run|operate|control|manage|handle|process|produce|manufacture|craft|create|build|construct|assemble|cook|bake|fry|boil|steam|grill|roast|microwave|heat|cool|freeze|thaw|defrost|marinate|season|flavor|taste|sample|try|test|experiment|practice|rehearse|train|exercise|stretch|warm up|cool down|rest|relax|sleep|nap|wake up|get up|dress|undress|shower|bathe|brush|comb|style|trim|cut|shave|apply|remove|wear|take off|put on|change|switch|alternate|rotate|cycle|turn|flip|roll|fold|unfold|open|close|lock|unlock|secure|protect|guard|watch|monitor|observe|look|see|view|check|inspect|examine|scan|search|find|discover|explore|investigate|research|analyze|evaluate|assess|measure|weigh|count|calculate|compute|process|solve|figure out|work out|think|consider|contemplate|ponder|reflect|meditate|pray|hope|wish|dream|imagine|visualize|picture|envision|plan|prepare|organize|arrange|schedule|book|reserve|confirm|verify|validate|check|double check|triple check|review|audit|approve|authorize|sign|stamp|seal|certify|license|permit|allow|enable|facilitate|assist|help|support|aid|serve|provide|offer|give|donate|contribute|share|distribute|allocate|assign|delegate|transfer|hand over|pass|deliver|send|ship|mail|fax|email|text|call|phone|contact|reach|connect|link|associate|join|unite|combine|merge|integrate|incorporate|include|add|insert|append|attach|clip|pin|tape|glue|stick|bind|tie|wrap|package|box|bag|contain|hold|carry|transport|move|shift|slide|push|pull|lift|raise|lower|drop|place|put|set|position|locate|situate|establish|found|create|form|shape|mold|cast|forge|craft|make|produce|generate|develop|grow|cultivate|nurture|care|tend|maintain|preserve|protect|save|rescue|recover|retrieve|reclaim|regain|restore|repair|fix|mend|patch|heal|cure|treat|address|handle|deal with|manage|cope|adapt|adjust|accommodate|modify|change|alter|transform|convert|switch|exchange|trade|swap|replace|substitute|upgrade|update|renew|refresh|revise|edit|correct|improve|enhance|optimize|refine|polish|perfect|complete|finish|end|conclude|close|stop|halt|pause|break|interrupt|suspend|postpone|delay|reschedule|cancel|abort|quit|exit|leave|depart|go|come|arrive|enter|return|visit|travel|journey|trip|vacation|holiday|celebrate|party|gather|meet|assemble|congregate|convene|attend|participate|join|engage|involve|include|welcome|greet|introduce|present|announce|declare|state|say|tell|speak|talk|discuss|converse|chat|gossip|whisper|shout|yell|scream|sing|hum|whistle|laugh|cry|weep|sob|smile|frown|grin|wink|nod|shake|wave|point|gesture|signal|indicate|show|demonstrate|illustrate|explain|describe|detail|outline|summarize|recap|review|report|document|record|note|write|type|print|draw|sketch|paint|color|shade|highlight|underline|circle|mark|label|tag|name|title|caption|describe|characterize|define|specify|identify|recognize|distinguish|differentiate|compare|contrast|relate|associate|connect|link|match|pair|group|cluster|organize|categorize|classify|sort|arrange|order|rank|rate|score|grade|evaluate|assess|judge|critique|review|analyze|examine|study|investigate|research|explore|discover|uncover|reveal|expose|show|display|exhibit|present|offer|provide|supply|deliver|serve|give|donate|contribute|share|distribute|spread|broadcast|publish|release|launch|debut|introduce|unveil|reveal|announce|declare|proclaim|advertise|promote|market|sell|buy|purchase|order|request|ask|inquire|question|interview|survey|poll|vote|elect|choose|select|pick|decide|determine|resolve|settle|agree|disagree|argue|debate|discuss|negotiate|bargain|deal|trade|exchange|swap|barter|pay|charge|cost|price|value|worth|estimate|calculate|compute|figure|total|sum|add|subtract|multiply|divide|solve|answer|respond|reply|react|act|do|perform|execute|carry out|implement|apply|use|utilize|employ|operate|run|drive|pilot|steer|navigate|guide|direct|lead|manage|supervise|oversee|control|regulate|adjust|tune|calibrate|set|configure|program|code|develop|build|construct|create|make|produce|manufacture|assemble|install|setup|establish|found|start|begin|initiate|launch|kick off|commence|open|activate|turn on|power up|boot up|start up|log in|sign in|connect|join|enter|access|reach|contact|touch|feel|sense|perceive|notice|observe|see|look|watch|view|read|scan|browse|search|find|locate|discover|detect|identify|recognize|spot|catch|grab|take|get|obtain|acquire|gain|earn|win|achieve|accomplish|complete|finish|done)/i.test(line)) {
          tasks.push(line.trim())
        }
      }
    }
    
    // Remove duplicates and very short entries
    return [...new Set(tasks)].filter(task => task.length >= 3)
  }
  
  // Clear the stage (delete all processed melodies)
  static async clearTheStage(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('melodies')
      .delete()
      .eq('user_id', userId)
      .eq('processed', true)
      .select('id')
    
    if (error || !data) return 0
    return data.length
  }
  
  // Get melody capture prompts
  static getCapturePrompt(): string {
    const prompts = [
      "What melodies are playing in your mind? 🎵",
      "Capture those fleeting thoughts... ✨",
      "Let your mind flow onto the page 🌊",
      "What's swirling around up there? 🌪️",
      "Time for a beautiful brain symphony! 🎼"
    ]
    
    return prompts[Math.floor(Math.random() * prompts.length)]
  }
  
  // Get voice capture prompts  
  static getVoiceCapturePrompt(): string {
    const prompts = [
      "Speak your melody... 🎤",
      "Let your voice flow... ✨", 
      "Share what's on your mind 🗣️",
      "Voice your thoughts freely 🌟",
      "Sing your ideas into being 🎵"
    ]
    
    return prompts[Math.floor(Math.random() * prompts.length)]
  }
  
  // Get processing completion message
  static getProcessingMessage(taskCount: number): string {
    if (taskCount === 0) {
      return "Your melody was beautifully captured! Sometimes thoughts just need to be heard. 🎼💫"
    } else if (taskCount === 1) {
      return "Perfect! I found 1 potential note in your melody! Ready to arrange it into your playlist? 🎵✨"
    } else {
      return `Wonderful! I discovered ${taskCount} potential notes in your melody! Shall we arrange them into your playlist? 🎶🌟`
    }
  }
}