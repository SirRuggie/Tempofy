# Tempofy - Claude Developer Guide

## 🎼 Project Overview

**Tempofy** is an ADHD-friendly productivity app that uses musical metaphors to make task management feel natural and engaging. Instead of clinical productivity terms, everything is framed as musical concepts.

### Core Philosophy
- **"Working at Your Tempo"** - Acknowledges that energy levels vary
- **No Shame** - Variable tempo is natural and beautiful
- **Musical Language** - Uses musical metaphors instead of clinical terms
- **Maximum 3 Taps** - Any feature reachable in 3 taps or less

### Target Audience
People with ADHD who struggle with:
- Traditional rigid productivity systems
- Shame around variable energy levels
- Overwhelming task management interfaces
- Forgetting fleeting thoughts/ideas

---

## 🏗️ Technical Architecture

### Tech Stack
- **Frontend**: React Native with Expo SDK 51 (cross-platform: web + mobile)
- **Web**: Expo Web (integrated, not separate Next.js)
- **State**: React useState hooks (local component state)
- **Storage**: AsyncStorage for persistence (local device storage)
- **Styling**: React Native StyleSheet with custom color system
- **Types**: TypeScript for type safety
- **Haptics**: expo-haptics for tactile feedback
- **Version Control**: Active Git repository

### Current Status: **Checkpoints 1-6 Complete! ✅**

### What Actually Works:
- ✅ React Native Expo app (web + mobile via Expo Dev)
- ✅ Web version at localhost:8087 via Expo Web
- ✅ Git repository with version control
- ✅ Tab Navigation (Tasks/Tempo/Profile screens)
- ✅ Complete Task System (Add/Edit/Delete/Complete with AsyncStorage)
- ✅ Tempo System with filtering and history tracking
- ✅ Fermata Mode with breathing animations and modern light theme
- ✅ Melody Capture (brain dump) with local storage
- ✅ Intuitive Header with clear button labels (💭 Quick Note, 😌 Pause)
- ✅ Voice Recording UI with intelligent simulation
- ✅ Smart task detection and conversion from voice/text

### What Doesn't Work Yet:
- ❌ No Supabase database (only credentials configured, using AsyncStorage)
- ❌ No actual audio/sound effects (just console.log + haptic feedback)
- ❌ No real Whisper API (intelligent fake responses)
- ❌ No real microphone recording (animated UI only)

---

## 🎵 Musical Terminology Mapping

| Standard Term | Tempofy Term | Context |
|---------------|--------------|---------|
| Energy Level | **Tempo** | Allegro (fast), Moderato (steady), Adagio (gentle) |
| Tasks | **Notes/Pieces** | Individual items to complete |
| Task Lists | **Movements** | Groups of related tasks |
| Stress/Overwhelm Mode | **Fermata Mode** | Pause symbol, calming single-task view |
| Brain Dump | **Melody Capture** | Quick thought/idea capture |
| XP/Points | **Measures Completed** | Progress tracking |
| Streaks | **Rhythm Maintenance** | Consistency tracking |
| Family Sharing | **Ensemble Mode** | Collaborative features |

---

## 📁 File Structure

```
/tempofy                     # Main React Native app
  /src
    /components
      /shared                # Cross-platform components
        AddNote.tsx          # Task creation modal
        Celebration.tsx      # Completion feedback (3s duration)
        CompactHeader.tsx    # Main navigation header
        EditNote.tsx         # Task editing modal
        FermataMode.tsx      # Overwhelm management (light theme)
        FilterBar.tsx        # Task filtering/sorting
        MelodyCapture.tsx    # Brain dump feature
        Playlist.tsx         # Task list display
        TabNavigator.tsx     # Bottom tab navigation
        VoiceRecorder.tsx    # Voice-to-text simulation
      /screens
        TempoScreen.tsx      # Tempo selection screen
    /lib
      supabase.ts           # Database types & configuration
    /modules                # Business logic modules
      TaskModule.ts         # Task management utilities
      TempoModule.ts        # Tempo-related functions
      MelodyModule.ts       # Brain dump processing
      SyncModule.ts         # Data synchronization
      EnsembleModule.ts     # Family sharing features
    /utils
      sounds.ts             # Audio feedback utilities
      storage.ts            # AsyncStorage helpers
    /styles
      colors.ts             # Design system & color palette
    /types
      index.ts              # TypeScript type definitions
  App.tsx                   # Main application entry point
  package.json              # Dependencies and scripts

/projectplan.md             # Detailed development roadmap
/supabase-schema.sql        # Database schema design
/Claude.md                  # This documentation file
```

---

## 🎯 Key Features Deep Dive

### 1. Tempo System (Energy Management)
**File**: `TempoScreen.tsx`, `lib/supabase.ts`
- **Allegro**: High energy, quick tasks, bright colors
- **Moderato**: Balanced energy, normal pace, steady colors  
- **Adagio**: Low energy, gentle tasks, calming colors
- Filters tasks by tempo, saves history in AsyncStorage

### 2. Fermata Mode (Overwhelm Management)
**File**: `FermataMode.tsx`
- **Recent Fix**: Transformed from dark purple → light blue/white theme
- Shows single "gentlest" task with breathing animation
- 3-second breathing cycle, calming environment
- Uses `getGentlestTask()` helper for task selection

### 3. Melody Capture (Brain Dump)
**File**: `MelodyCapture.tsx`
- Text input + voice simulation for capturing fleeting thoughts
- **"Arrange into Playlist"** converts melodies → structured tasks
- Timestamps, voice badges, smart task conversion
- **Recent Enhancement**: Fully functional task conversion

### 4. Voice Composition (Simulated)
**File**: `VoiceRecorder.tsx`
- **Recent Enhancement**: Intelligent transcription based on recording length
- Haptic feedback on start/completion
- Smart action word detection (call, buy, schedule, etc.)
- Auto-suggests converting voice → tasks
- Processing delay scales with recording duration

### 5. Celebration System
**File**: `Celebration.tsx`
- **Recent Fix**: Extended duration from 1.5s → 3s
- **Tempo-specific messages**:
  - Allegro: "Lightning fast! ⚡", "Speed demon! 🚀"
  - Moderato: "Perfect rhythm! 🎵", "Great pace! 🌟"
  - Adagio: "Mindful completion! 🌸", "Gentle progress! 🕊️"

---

## 🛠️ Development Commands

```bash
# Start development server
cd tempofy
npx expo start --web --port 8087 --clear

# Platform-specific starts
npm run android    # Android emulator
npm run ios        # iOS simulator  
npm run web        # Web development

# Currently running at: http://localhost:8087
```

### Testing & Quality (TODO)
```bash
# Add these commands to package.json
npm run lint       # Code linting
npm run typecheck  # TypeScript checking
npm run test       # Unit tests
```

---

## 🎨 Code Conventions & Patterns

### 1. **NO COMMENTS Rule**
- **NEVER add comments** unless user explicitly requests
- Code should be self-documenting
- Use clear variable/function names

### 2. **Musical Terminology**
- Always use musical metaphors in UI text
- Variable names can be standard (task, user) but UI shows "note", "melody"
- Maintain consistency across all components

### 3. **Accessibility & Contrast**
- **Recent Improvements**: Fixed low opacity elements (0.6 → 0.8+)
- Use high contrast colors for readability
- Clear, descriptive button labels over cryptic symbols

### 4. **TypeScript Patterns**
```typescript
// Import types from lib/supabase.ts
import { Task, Tempo, TEMPO_CONFIG } from '../../lib/supabase'

// Use proper interfaces for components
interface ComponentProps {
  tasks: Task[]
  currentTempo: Tempo
  onTaskComplete: (taskId: string) => void
}
```

### 5. **State Management Patterns**
```typescript
// Local state with useState
const [tasks, setTasks] = useState<Task[]>([])

// AsyncStorage pattern
await AsyncStorage.setItem('@tempofy_tasks', JSON.stringify(tasks))
```

### 6. **Styling Patterns**
```typescript
// Use existing design system
import { Colors, GlassMorphism, Typography } from '../../styles/colors'

// Apply glassmorphism consistently
style={[styles.container, GlassMorphism.card]}
```

---

## 🔧 Common Development Tasks

### Adding a New Feature
1. Check existing patterns in similar components
2. Use musical terminology in user-facing text
3. Match existing styling (Colors, GlassMorphism, Typography)
4. Add TypeScript types to `/types/index.ts`
5. Follow the 3-tap maximum rule
6. Test accessibility/contrast

### Fixing UI Issues
1. **Check opacity levels** - should be 0.8+ for readability
2. **Use clear labels** instead of symbols/icons
3. **Ensure proper contrast** against backgrounds
4. **Test on different screen sizes**

### Adding New Tempo Logic
1. Update `TEMPO_CONFIG` in `lib/supabase.ts`
2. Add color schemes to `styles/colors.ts`
3. Update filtering logic in components
4. Add celebration messages for new tempo

### Voice/Audio Features
- All audio is **simulated** - use console.log + haptic feedback
- Use `expo-haptics` for tactile responses
- Make processing delays realistic (1.5s + recording time)
- Vary responses based on input length/complexity

---

## 🎭 Recent Improvements Summary

### UI/UX Fixes
- ✅ **Header buttons**: 𝄐 → 😌 Pause, 🎵 → 💭 Quick Note
- ✅ **Fermata Mode colors**: Dark purple → Light blue/white theme
- ✅ **Celebration duration**: 1.5s → 3s for readability
- ✅ **Contrast improvements**: Low opacity elements fixed

### Feature Completions  
- ✅ **"Arrange into Playlist"**: Now converts melodies → tasks
- ✅ **Smart voice processing**: Duration-based transcription
- ✅ **Action word detection**: Auto-suggests task conversion
- ✅ **Haptic feedback**: Start/completion vibrations
- ✅ **Tempo-specific celebrations**: Varied messages by energy level

### Documentation
- ✅ **ProjectPlan.md**: Updated to reflect reality
- ✅ **Checkpoints 5 & 6**: Marked as fully complete
- ✅ **This Claude.md**: Comprehensive developer guide

---

## 🔮 Known Limitations & Future Work

### Immediate Limitations
1. **Voice features simulated** - No real speech-to-text
2. **Sounds are console.log** - Need actual audio files
3. **Local storage only** - AsyncStorage instead of Supabase
4. **No offline sync** - All data stays on device

### Checkpoint 7+ (Future Features)
- **Harmonized Lists** - Nested task collections
- **Musical Progression** - Advanced gamification
- **Ensemble Mode** - Family/team collaboration
- **Performance Optimization** - Sub-2 second load times
- **Onboarding Flow** - 30-second setup experience

---

## 💡 Key Insights for AI Assistants

### When Working on This Codebase:
1. **Always prioritize clarity over aesthetics** - ADHD users need intuitive interfaces
2. **Maintain musical metaphors** - Don't revert to clinical productivity terms
3. **Check for accessibility issues** - High contrast is crucial
4. **Respect the 3-tap rule** - Don't add deep navigation
5. **Test celebration timing** - 3+ seconds for feedback visibility
6. **Use existing patterns** - Don't reinvent, extend existing code

### Red Flags to Avoid:
- ❌ Adding comments without user request
- ❌ Using clinical terms (tasks → "notes", energy → "tempo")
- ❌ Cryptic symbols without clear labels
- ❌ Low contrast text (opacity < 0.8)
- ❌ Complex navigation flows
- ❌ Breaking the musical theme

### Quick Wins:
- ✅ Add haptic feedback to interactions
- ✅ Extend animation/feedback durations
- ✅ Improve contrast ratios
- ✅ Add variety to repeated messages
- ✅ Make simulated features more intelligent

---

## 📞 Support Commands

```bash
# Check current development server
curl http://localhost:8087

# View current git status
git status

# Check package versions
npm list --depth=0

# Clear Expo cache
npx expo start --clear
```

---

*Created with Claude in ultrathink mode - comprehensive documentation for AI-assisted development on the Tempofy ADHD productivity app.* 🎵✨