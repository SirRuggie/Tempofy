-- Tempofy Database Schema
-- Musical terminology for ADHD productivity orchestration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - The Conductors
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  current_tempo TEXT DEFAULT 'moderato' CHECK (current_tempo IN ('allegro', 'moderato', 'adagio')),
  measures_completed INTEGER DEFAULT 0, -- XP system
  rhythm_streak INTEGER DEFAULT 0,
  preferred_start_tempo TEXT DEFAULT 'moderato' CHECK (preferred_start_tempo IN ('allegro', 'moderato', 'adagio')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table - The Musical Notes
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tempo_required TEXT DEFAULT 'moderato' CHECK (tempo_required IN ('allegro', 'moderato', 'adagio')),
  completed BOOLEAN DEFAULT false,
  movement_id UUID REFERENCES movements(id) ON DELETE SET NULL,
  priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5), -- 1=highest, 5=lowest
  estimated_minutes INTEGER DEFAULT 15,
  energy_boost INTEGER DEFAULT 1 CHECK (energy_boost >= 1 AND energy_boost <= 3), -- measures gained on completion
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  due_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Movements table - The Musical Lists/Projects  
CREATE TABLE movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'solo' CHECK (type IN ('symphony', 'ensemble', 'solo')),
  ensemble_members UUID[], -- shared with family/team
  color_theme TEXT DEFAULT 'warm-amber', -- for visual harmony
  is_template BOOLEAN DEFAULT false,
  template_category TEXT, -- 'shopping', 'errands', 'project', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Melodies table - The Brain Dumps/Voice Captures
CREATE TABLE melodies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_voice BOOLEAN DEFAULT false,
  processed BOOLEAN DEFAULT false,
  processing_notes TEXT, -- AI interpretation notes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Tempo History - The User's Rhythm Patterns
CREATE TABLE tempo_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  tempo TEXT NOT NULL CHECK (tempo IN ('allegro', 'moderato', 'adagio')),
  context TEXT, -- what triggered the tempo choice
  mood_note TEXT, -- optional user note about their state
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Compositions - Track daily progress
CREATE TABLE daily_compositions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  measures_earned INTEGER DEFAULT 0,
  notes_completed INTEGER DEFAULT 0,
  dominant_tempo TEXT CHECK (dominant_tempo IN ('allegro', 'moderato', 'adagio')),
  fermata_used BOOLEAN DEFAULT false, -- did they use stress mode?
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_tempo ON tasks(tempo_required);
CREATE INDEX idx_tasks_movement ON tasks(movement_id);
CREATE INDEX idx_movements_user_id ON movements(user_id);
CREATE INDEX idx_melodies_user_id ON melodies(user_id);
CREATE INDEX idx_melodies_processed ON melodies(processed);
CREATE INDEX idx_tempo_history_user_id ON tempo_history(user_id);
CREATE INDEX idx_tempo_history_timestamp ON tempo_history(timestamp);
CREATE INDEX idx_daily_compositions_user_date ON daily_compositions(user_id, date);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_movements_updated_at BEFORE UPDATE ON movements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE melodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tempo_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_compositions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Tasks policies
CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Movements policies (including ensemble sharing)
CREATE POLICY "Users can view their own movements or shared movements" ON movements
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = ANY(ensemble_members));

CREATE POLICY "Users can insert their own movements" ON movements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own movements" ON movements
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own movements" ON movements
    FOR DELETE USING (auth.uid() = user_id);

-- Melodies policies
CREATE POLICY "Users can view their own melodies" ON melodies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own melodies" ON melodies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own melodies" ON melodies
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own melodies" ON melodies
    FOR DELETE USING (auth.uid() = user_id);

-- Tempo history policies
CREATE POLICY "Users can view their own tempo history" ON tempo_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tempo history" ON tempo_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Daily compositions policies
CREATE POLICY "Users can view their own daily compositions" ON daily_compositions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily compositions" ON daily_compositions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily compositions" ON daily_compositions
    FOR UPDATE USING (auth.uid() = user_id);

-- Insert some movement templates
INSERT INTO movements (id, user_id, name, description, type, is_template, template_category, color_theme) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'Shopping Symphony', 'Harmonized grocery and household shopping', 'solo', true, 'shopping', 'fresh-green'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'Errands Ensemble', 'Coordinated daily errands and appointments', 'solo', true, 'errands', 'calm-blue'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'Project Concerto', 'Multi-movement work project', 'solo', true, 'project', 'focused-purple'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'Home Orchestra', 'Family household coordination', 'ensemble', true, 'home', 'warm-amber'),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'Self-Care Serenade', 'Personal wellness and care routine', 'solo', true, 'wellness', 'soft-pink');