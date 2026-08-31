-- ============================================
-- ASTRANEX VOTING SYSTEM - SUPABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ADMIN CONFIG TABLE (single-row admin credentials)
-- ============================================
CREATE TABLE admin_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  start_time TIMESTAMPTZ,  -- Election window start
  end_time TIMESTAMPTZ,    -- Election window end
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_config ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read admin_config (for election timer)
CREATE POLICY "Anyone can read admin_config" ON admin_config
  FOR SELECT USING (auth.role() = 'authenticated');

-- Auto-seed a default admin_config row if one doesn't exist
INSERT INTO admin_config (admin_name, username, email, start_time, end_time)
SELECT 'Admin', 'admin', 'admin@astranex.edu', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 hour'
WHERE NOT EXISTS (SELECT 1 FROM admin_config);

-- ============================================
-- STUDENTS TABLE
-- ============================================
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_number VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  year VARCHAR(20),
  department VARCHAR(100),
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin', 'hod')),
  is_active BOOLEAN DEFAULT true,
  has_voted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Students can read their own data
CREATE POLICY "Students can read own data" ON students
  FOR SELECT USING (auth.uid() = id);

-- Students can insert their own row (only first time, by the trigger)
CREATE POLICY "Students can insert own row" ON students
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can read all students
CREATE POLICY "Admins can read all students" ON students
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE id = auth.uid() AND role IN ('admin', 'hod'))
  );

-- Students can update their own has_voted status
CREATE POLICY "Enable update for students self status" ON students
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Admins can update any student record
CREATE POLICY "Admins can update students" ON students
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM students WHERE id = auth.uid() AND role IN ('admin', 'hod'))
  );

-- ============================================
-- CANDIDATES TABLE
-- ============================================
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  position VARCHAR(50) NOT NULL CHECK (position IN (
    'president', 'vice_president', 'secretary', 'joint_secretary',
    'treasurer', 'technical_lead', 'deputy_technical_lead', 'discipline_lead'
  )),
  year VARCHAR(20),
  manifest TEXT,
  achievements TEXT,
  proposal TEXT,
  image_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read approved candidates
CREATE POLICY "Anyone can read approved candidates" ON candidates
  FOR SELECT USING (is_approved = true OR 
    EXISTS (SELECT 1 FROM students WHERE id = auth.uid() AND role IN ('admin', 'hod'))
  );

-- Admins can manage candidates
CREATE POLICY "Admins can manage candidates" ON candidates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM students WHERE id = auth.uid() AND role IN ('admin', 'hod'))
  );

-- ============================================
-- VOTES TABLE
-- ============================================
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  position VARCHAR(50) NOT NULL,
  election_year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, position, election_year)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Students can insert their own votes (only during election window)
CREATE POLICY "Students can insert own votes" ON votes
  FOR INSERT WITH CHECK (
    auth.uid() = student_id AND
    EXISTS (SELECT 1 FROM students WHERE id = auth.uid() AND has_voted = false) AND
    EXISTS (
      SELECT 1 FROM admin_config 
      WHERE NOW() >= start_time AND NOW() <= end_time
    )
  );

-- Admins can read all votes
CREATE POLICY "Admins can read all votes" ON votes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM students WHERE id = auth.uid() AND role IN ('admin', 'hod'))
  );

-- Admins can delete votes (for purge)
CREATE POLICY "Admins can delete votes" ON votes
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM students WHERE id = auth.uid() AND role IN ('admin', 'hod'))
  );

-- ============================================
-- AUTH TRIGGER: Auto-sync new registrations to students table
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.students (id, student_number, email, name, role, is_active, has_voted)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'student_number', 'STU_' || substr(NEW.id::text, 1, 8)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New Voter'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    true,
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind it to the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_student_number ON students(student_number);
CREATE INDEX idx_students_has_voted ON students(has_voted);
CREATE INDEX idx_candidates_position ON candidates(position);
CREATE INDEX idx_votes_candidate_id ON votes(candidate_id);
CREATE INDEX idx_votes_position ON votes(position);
CREATE INDEX idx_votes_election_year ON votes(election_year);

-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();