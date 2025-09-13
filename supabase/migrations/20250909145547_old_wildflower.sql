/*
  # Mom's Grove Platform - Complete Database Schema
  
  This migration creates the complete database schema for the Mom's Grove Unified Early Childhood Education Platform.
  
  ## Schema Overview
  
  1. **Core Domain Tables**
     - schools: School information and subscription status
     - admins, teachers, parents: User management with auth integration
     - students: Student enrollment and basic information
     - parent_student_link: Many-to-many relationship between parents and students
  
  2. **Curriculum & Progress Tables**
     - skill_pathways: Learning pathways and goals
     - pathway_activities: Individual activities within pathways
     - student_pathway_progress: Student progress tracking
     - activity_logs: Teacher observations and outcomes
  
  3. **AI & Analytics Tables**
     - ai_alerts: AI-generated insights and alerts
     - student_assessments: Initial student assessments
  
  4. **Modular Architecture Tables**
     - grove_modules: Available platform modules
     - school_unlocked_modules: School's activated modules
  
  5. **Calendar & Communication Tables**
     - school_events: Calendar events
     - school_communications: Messages and feedback
  
  6. **Financial Management Tables**
     - fee_structures: School fee configurations
     - payment_plans: Payment plan options
     - financial_transactions: All financial transactions
  
  7. **Compliance Tables**
     - compliance_records: Regulatory compliance tracking
  
  ## Security
  - All tables have Row Level Security (RLS) enabled
  - Comprehensive RLS policies for multi-tenant security
  - Foreign key constraints ensure data integrity
*/

-- Create custom ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'parent');
CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'past_due', 'canceled');
CREATE TYPE student_category AS ENUM ('HEL', 'BLSN', 'HSL');
CREATE TYPE pathway_status AS ENUM ('in_progress', 'mastered', 'not_started');
CREATE TYPE activity_outcome AS ENUM ('mastered', 'practicing', 'struggling');
CREATE TYPE engagement_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE ai_alert_type AS ENUM ('STUDENT_AT_RISK', 'STUDENT_STRUGGLING', 'STUDENT_DISENGAGED', 'TEACHER_SUPPORT_NEEDED', 'POSITIVE_HIGHLIGHT');
CREATE TYPE alert_status AS ENUM ('new', 'viewed', 'dismissed');
CREATE TYPE event_audience AS ENUM ('all', 'parents', 'teachers', 'admins');
CREATE TYPE transaction_type AS ENUM ('FEE', 'EXPENSE');
CREATE TYPE transaction_status AS ENUM ('PAID', 'DUE', 'OVERDUE');
CREATE TYPE communication_type AS ENUM ('ANNOUNCEMENT', 'FEEDBACK', 'COMPLAINT', 'DIRECT_MESSAGE');

-- =============================================
-- CORE DOMAIN TABLES
-- =============================================

-- Schools table
CREATE TABLE IF NOT EXISTS schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name TEXT NOT NULL,
  address TEXT,
  contact_email TEXT,
  phone_number TEXT,
  subscription_status subscription_status NOT NULL DEFAULT 'trialing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Parents table
CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT,
  class TEXT,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Parent-Student relationship table
CREATE TABLE IF NOT EXISTS parent_student_link (
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (parent_id, student_id)
);

-- Student assessments table
CREATE TABLE IF NOT EXISTS student_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  assessment_data JSONB NOT NULL,
  total_score INTEGER,
  category student_category,
  submitted_by UUID REFERENCES admins(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- CURRICULUM & PROGRESS TABLES
-- =============================================

-- Skill pathways table
CREATE TABLE IF NOT EXISTS skill_pathways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_name TEXT NOT NULL,
  problem_category TEXT NOT NULL,
  goal_description TEXT NOT NULL,
  parent_home_activity_suggestion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pathway activities table
CREATE TABLE IF NOT EXISTS pathway_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_id UUID NOT NULL REFERENCES skill_pathways(id) ON DELETE CASCADE,
  step_level INTEGER NOT NULL,
  activity_name TEXT NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('foundational', 'core', 'extension')),
  modality TEXT NOT NULL,
  is_default_choice BOOLEAN NOT NULL DEFAULT false,
  instruction TEXT NOT NULL,
  materials_needed TEXT[],
  assessment_cue TEXT,
  effectiveness_score NUMERIC(3,2) DEFAULT 0.50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Student pathway progress table
CREATE TABLE IF NOT EXISTS student_pathway_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  pathway_id UUID NOT NULL REFERENCES skill_pathways(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 1,
  status pathway_status NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  mastered_at TIMESTAMPTZ,
  UNIQUE(student_id, pathway_id)
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES pathway_activities(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  outcome activity_outcome NOT NULL,
  engagement_level engagement_level NOT NULL,
  activity_rating INTEGER CHECK (activity_rating >= 1 AND activity_rating <= 5),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- AI & ANALYTICS TABLES
-- =============================================

-- AI alerts table
CREATE TABLE IF NOT EXISTS ai_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  alert_type ai_alert_type NOT NULL,
  details JSONB NOT NULL,
  status alert_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- MODULAR ARCHITECTURE TABLES
-- =============================================

-- Grove modules table
CREATE TABLE IF NOT EXISTS grove_modules (
  id TEXT PRIMARY KEY,
  module_name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- School unlocked modules table
CREATE TABLE IF NOT EXISTS school_unlocked_modules (
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL REFERENCES grove_modules(id) ON DELETE CASCADE,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (school_id, module_id)
);

-- =============================================
-- CALENDAR & COMMUNICATION TABLES
-- =============================================

-- School events table
CREATE TABLE IF NOT EXISTS school_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  audience event_audience[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- School communications table
CREATE TABLE IF NOT EXISTS school_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_role user_role NOT NULL,
  recipient_id UUID,
  recipient_role user_role,
  message_type communication_type NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- FINANCIAL MANAGEMENT TABLES
-- =============================================

-- Fee structures table
CREATE TABLE IF NOT EXISTS fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  structure_name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  total_tuition_fee NUMERIC(10,2) NOT NULL,
  annual_charges NUMERIC(10,2) DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payment plans table
CREATE TABLE IF NOT EXISTS payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_structure_id UUID NOT NULL REFERENCES fee_structures(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  number_of_installments INTEGER NOT NULL DEFAULT 1,
  discount_percentage NUMERIC(5,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Financial transactions table
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  transaction_type transaction_type NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status transaction_status NOT NULL,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- COMPLIANCE TABLES
-- =============================================

-- Compliance records table
CREATE TABLE IF NOT EXISTS compliance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL,
  document_url TEXT,
  status TEXT NOT NULL,
  expiry_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_link ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_pathways ENABLE ROW LEVEL SECURITY;
ALTER TABLE pathway_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_pathway_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE grove_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_unlocked_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_records ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Schools policies
CREATE POLICY "Schools are viewable by authenticated users" ON schools
  FOR SELECT TO authenticated
  USING (true);

-- Admins policies
CREATE POLICY "Admins can view their own data" ON admins
  FOR SELECT TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Admins can update their own data" ON admins
  FOR UPDATE TO authenticated
  USING (auth.uid() = auth_id);

-- Teachers policies
CREATE POLICY "Teachers can view their own data" ON teachers
  FOR SELECT TO authenticated
  USING (auth.uid() = auth_id);

CREATE POLICY "Admins can view teachers in their school" ON teachers
  FOR SELECT TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM admins WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage teachers in their school" ON teachers
  FOR ALL TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM admins WHERE auth_id = auth.uid()
    )
  );

-- Parents policies
CREATE POLICY "Parents can view their own data" ON parents
  FOR SELECT TO authenticated
  USING (auth.uid() = auth_id);

-- Students policies
CREATE POLICY "Students are viewable by school staff" ON students
  FOR SELECT TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM admins WHERE auth_id = auth.uid()
      UNION
      SELECT school_id FROM teachers WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Students are viewable by their parents" ON students
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT student_id FROM parent_student_link 
      WHERE parent_id IN (
        SELECT id FROM parents WHERE auth_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage students in their school" ON students
  FOR ALL TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM admins WHERE auth_id = auth.uid()
    )
  );

-- Parent-student link policies
CREATE POLICY "Parent-student links viewable by parents and school staff" ON parent_student_link
  FOR SELECT TO authenticated
  USING (
    parent_id IN (SELECT id FROM parents WHERE auth_id = auth.uid())
    OR
    student_id IN (
      SELECT id FROM students WHERE school_id IN (
        SELECT school_id FROM admins WHERE auth_id = auth.uid()
        UNION
        SELECT school_id FROM teachers WHERE auth_id = auth.uid()
      )
    )
  );

-- Student assessments policies
CREATE POLICY "Student assessments viewable by school staff and parents" ON student_assessments
  FOR SELECT TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE school_id IN (
        SELECT school_id FROM admins WHERE auth_id = auth.uid()
        UNION
        SELECT school_id FROM teachers WHERE auth_id = auth.uid()
      )
      UNION
      SELECT student_id FROM parent_student_link 
      WHERE parent_id IN (
        SELECT id FROM parents WHERE auth_id = auth.uid()
      )
    )
  );

-- Skill pathways policies (public read)
CREATE POLICY "Skill pathways are viewable by authenticated users" ON skill_pathways
  FOR SELECT TO authenticated
  USING (true);

-- Pathway activities policies (public read)
CREATE POLICY "Pathway activities are viewable by authenticated users" ON pathway_activities
  FOR SELECT TO authenticated
  USING (true);

-- Student pathway progress policies
CREATE POLICY "Student progress viewable by school staff and parents" ON student_pathway_progress
  FOR SELECT TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE school_id IN (
        SELECT school_id FROM admins WHERE auth_id = auth.uid()
        UNION
        SELECT school_id FROM teachers WHERE auth_id = auth.uid()
      )
      UNION
      SELECT student_id FROM parent_student_link 
      WHERE parent_id IN (
        SELECT id FROM parents WHERE auth_id = auth.uid()
      )
    )
  );

-- Activity logs policies
CREATE POLICY "Activity logs viewable by school staff and parents" ON activity_logs
  FOR SELECT TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE school_id IN (
        SELECT school_id FROM admins WHERE auth_id = auth.uid()
        UNION
        SELECT school_id FROM teachers WHERE auth_id = auth.uid()
      )
      UNION
      SELECT student_id FROM parent_student_link 
      WHERE parent_id IN (
        SELECT id FROM parents WHERE auth_id = auth.uid()
      )
    )
  );

CREATE POLICY "Teachers can create activity logs for their school" ON activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    teacher_id IN (SELECT id FROM teachers WHERE auth_id = auth.uid())
    AND
    student_id IN (
      SELECT id FROM students WHERE school_id IN (
        SELECT school_id FROM teachers WHERE auth_id = auth.uid()
      )
    )
  );

-- AI alerts policies
CREATE POLICY "AI alerts viewable by school staff" ON ai_alerts
  FOR SELECT TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM admins WHERE auth_id = auth.uid()
      UNION
      SELECT school_id FROM teachers WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update AI alerts in their school" ON ai_alerts
  FOR UPDATE TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM admins WHERE auth_id = auth.uid()
    )
  );

-- Grove modules policies (public read)
CREATE POLICY "Grove modules are viewable by authenticated users" ON grove_modules
  FOR SELECT TO authenticated
  USING (true);

-- School unlocked modules policies
CREATE POLICY "School modules viewable by school staff" ON school_unlocked_modules
  FOR SELECT TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM admins WHERE auth_id = auth.uid()
      UNION
      SELECT school_id FROM teachers WHERE auth_id = auth.uid()
    )
  );

-- School events policies
CREATE POLICY "School events viewable by school community" ON school_events
  FOR SELECT TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM admins WHERE auth_id = auth.uid()
      UNION
      SELECT school_id FROM teachers WHERE auth_id = auth.uid()
    )
    OR
    (
      'parents' = ANY(audience) AND
      school_id IN (
        SELECT DISTINCT s.school_id FROM students s
        JOIN parent_student_link psl ON s.id = psl.student_id
        WHERE psl.parent_id IN (
          SELECT id FROM parents WHERE auth_id = auth.uid()
        )
      )
    )
  );

-- Financial transactions policies
CREATE POLICY "Financial transactions viewable by school staff" ON financial_transactions
  FOR SELECT TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM admins WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Parents can view their child's financial transactions" ON financial_transactions
  FOR SELECT TO authenticated
  USING (
    student_id IN (
      SELECT student_id FROM parent_student_link 
      WHERE parent_id IN (
        SELECT id FROM parents WHERE auth_id = auth.uid()
      )
    )
  );

-- Fee structures policies
CREATE POLICY "Fee structures viewable by school staff" ON fee_structures
  FOR SELECT TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM admins WHERE auth_id = auth.uid()
    )
  );

-- Payment plans policies
CREATE POLICY "Payment plans viewable by school staff" ON payment_plans
  FOR SELECT TO authenticated
  USING (
    fee_structure_id IN (
      SELECT id FROM fee_structures WHERE school_id IN (
        SELECT school_id FROM admins WHERE auth_id = auth.uid()
      )
    )
  );

-- School communications policies
CREATE POLICY "School communications viewable by relevant parties" ON school_communications
  FOR SELECT TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM admins WHERE auth_id = auth.uid()
      UNION
      SELECT school_id FROM teachers WHERE auth_id = auth.uid()
    )
    OR
    (
      recipient_role = 'parent' AND recipient_id IN (
        SELECT id FROM parents WHERE auth_id = auth.uid()
      )
    )
    OR
    (
      sender_role = 'parent' AND sender_id IN (
        SELECT id FROM parents WHERE auth_id = auth.uid()
      )
    )
  );

-- Compliance records policies
CREATE POLICY "Compliance records viewable by school admins" ON compliance_records
  FOR SELECT TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM admins WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage compliance records" ON compliance_records
  FOR ALL TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM admins WHERE auth_id = auth.uid()
    )
  );