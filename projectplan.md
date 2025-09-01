# Tempofy Development Plan
The ADHD Productivity Orchestra - Working at Your Tempo

## Technical Stack
- **Frontend**: React Native with Expo (Android primary, iOS future)
- **Web**: Next.js (shares React components)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State**: Zustand
- **Styling**: NativeWind + Tailwind CSS
- **AI**: OpenAI Whisper + GPT-4

## Development Checkpoints (Complete in Order)

### Foundation Phase

#### Checkpoint 1: Project Setup ✅
**Goal: Initialize Tempofy's foundation**
- [x] Initialize React Native Expo project as "Tempofy"
- [x] Setup Next.js for web version
- [x] Configure Supabase with tempo-aware schema
- [x] Create folder structure with musical naming conventions
- [x] Setup Git repository
- [x] Display "Tempofy - Find Your Rhythm" on Android/Web

#### Checkpoint 2: Basic Task System ✅
**Goal: Create tasks as "musical notes"**
- [x] Create task model (id, title, completed, tempo_required)
- [x] Build AddNote component (for adding tasks)
- [x] Build Playlist component (task list)
- [x] Implement local storage
- [x] Add completion with musical sound effect
- [x] Style with soft, calming colors

#### Checkpoint 3: Tempo System Core
**Goal: Implement the revolutionary tempo filtering**
- [ ] Add tempo field to tasks (allegro/moderato/adagio)
- [ ] Create TempoSelector with musical icons:
  - 🎵 Allegro (Fast & Energetic)
  - 🎶 Moderato (Steady Rhythm)
  - 🎼 Adagio (Gentle Pace)
- [ ] Implement "What's your tempo today?" check-in
- [ ] Filter tasks by current tempo
- [ ] Add tempo indicators with musical notes
- [ ] Save tempo history for patterns

### Core Features Phase

#### Checkpoint 4: Fermata Mode (formerly Stress Mode)
**Goal: The musical pause for overwhelm**
- [ ] Create Fermata button (musical pause symbol)
- [ ] Build calming single-task view
- [ ] Select gentlest incomplete "note"
- [ ] Add soothing background gradient
- [ ] Implement "Resume your rhythm" exit
- [ ] Add breathing animation during fermata

#### Checkpoint 5: Melody Capture (Brain Dump)
**Goal: Capture fleeting melodies (thoughts)**
- [ ] Create MelodyCapture input component
- [ ] Build melody storage system
- [ ] Create "Unfinished Melodies" inbox
- [ ] Add "Arrange into Playlist" function
- [ ] Implement "Clear the Stage" option
- [ ] Add musical note counter animation

#### Checkpoint 6: Voice Composition
**Goal: Speak your symphony**
- [ ] Setup microphone permissions
- [ ] Add "Capture the melody" voice button
- [ ] Integrate Whisper API
- [ ] Process voice into structured notes
- [ ] Add recording visualization (sound waves)
- [ ] Play gentle chime on capture complete

### Enhancement Phase

#### Checkpoint 7: Harmonized Lists
**Goal: Lists that play together**
- [ ] Create List model as "Movements"
- [ ] Build templates:
  - "Shopping Symphony"
  - "Errands Ensemble"
  - "Project Concerto"
- [ ] Link lists to parent tasks
- [ ] Show harmonic connections
- [ ] Display movement progress

#### Checkpoint 8: Musical Progression (Gamification)
**Goal: Celebrate your rhythm**
- [ ] Add "Measures Completed" (XP system)
- [ ] Create "Rhythm Streak" counter
- [ ] Build progression through musical grades
- [ ] Add completion crescendos (animations)
- [ ] Create tempo-aware rewards (more points for adagio days)
- [ ] Show daily composition progress

#### Checkpoint 9: Ensemble Mode (Family Sharing)
**Goal: Playing in harmony with others**
- [ ] Create family "Orchestra" structure
- [ ] Build shared playlists
- [ ] Implement "Duet Tasks" (collaborative)
- [ ] Add family member tempo visibility
- [ ] Create "Pass the Baton" delegation
- [ ] Show ensemble harmony score

### Polish Phase

#### Checkpoint 10: Performance Optimization
**Goal: Smooth as a symphony**
- [ ] Achieve <2 second opening
- [ ] Optimize musical assets
- [ ] Implement smooth transitions
- [ ] Add skeleton loaders with music notes
- [ ] Cache frequently played "pieces"
- [ ] Test on low-end devices

#### Checkpoint 11: Opening Movement (Onboarding)
**Goal: 30-second overture**
- [ ] Create "Welcome to Your Orchestra" screen
- [ ] Build 3-beat onboarding:
  1. "What's your tempo today?"
  2. "Here's your first note"
  3. "Begin your symphony"
- [ ] Add "Skip to Main Performance" option
- [ ] Set default tempo to Moderato
- [ ] Create welcoming first task

#### Checkpoint 12: First Performance (Beta)
**Goal: Ready for the audience**
- [ ] Add error boundaries with musical messages
- [ ] Implement analytics (tempo patterns)
- [ ] Create "Share Your Experience" feedback
- [ ] Write privacy policy
- [ ] Add "Performance Tips" help section
- [ ] Deploy to TestFlight/Play Store Beta

## File Structure
```
/tempofy
  /src
    /components
      /shared       -- Works on both web and mobile
      /mobile       -- React Native specific
      /web          -- Next.js specific
    /modules        -- Business logic
      TempoModule.js
      TaskModule.js
      MelodyModule.js
      SyncModule.js
      EnsembleModule.js
    /screens        -- Full page views
    /hooks          -- Custom React hooks
    /utils          -- Helper functions
    /types          -- TypeScript definitions
    /styles         -- Global styles and themes
```

## Key Terminology
- Energy → Tempo
- Tasks → Notes/Pieces
- Lists → Movements
- Stress Mode → Fermata Mode
- Brain Dump → Melody Capture
- XP → Measures Completed
- Streaks → Rhythm Maintenance
- Family Sharing → Ensemble Mode

## Development Principles
- **Tempo-First**: Every feature adapts to user's current tempo
- **Musical Language**: Use musical metaphors, not clinical terms
- **No Shame**: Variable tempo is natural and beautiful
- **Maximum 3 Taps**: Any feature reachable in 3 taps or less
- **Offline-First**: Core features work without internet
- **Sub-2 Second Load**: Performance is crucial for ADHD users

## Database Schema

```sql
-- Supabase PostgreSQL schema with musical terminology
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  current_tempo TEXT DEFAULT 'moderato', -- 'allegro', 'moderato', 'adagio'
  measures_completed INTEGER DEFAULT 0, -- (XP)
  rhythm_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tempo_required TEXT DEFAULT 'moderato', -- 'allegro', 'moderato', 'adagio'
  completed BOOLEAN DEFAULT false,
  movement_id UUID REFERENCES movements(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE TABLE movements ( -- (formerly lists)
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'solo', -- 'symphony', 'ensemble', 'solo'
  ensemble_members UUID[], -- (shared with)
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE melodies ( -- (brain dumps)
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_voice BOOLEAN DEFAULT false,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tempo_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tempo TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);
```