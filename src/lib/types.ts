// Core TypeScript interfaces for the Mom's Grove platform
export type UserRole = 'admin' | 'teacher' | 'parent';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled';
export type StudentCategory = 'HEL' | 'BLSN' | 'HSL';
export type PathwayStatus = 'in_progress' | 'mastered' | 'not_started';
export type ActivityOutcome = 'mastered' | 'practicing' | 'struggling';
export type EngagementLevel = 'low' | 'medium' | 'high';
export type AIAlertType = 'STUDENT_AT_RISK' | 'STUDENT_STRUGGLING' | 'STUDENT_DISENGAGED' | 'TEACHER_SUPPORT_NEEDED';
export type AlertStatus = 'new' | 'viewed' | 'dismissed';
export type TransactionType = 'FEE' | 'EXPENSE';
export type TransactionStatus = 'PAID' | 'DUE' | 'OVERDUE';

// Core Domain Interfaces
export interface School {
  id: string;
  school_name: string;
  address?: string;
  contact_email?: string;
  phone_number?: string;
  subscription_status: SubscriptionStatus;
  created_at: string;
}

export interface User {
  id: string;
  auth_id: string;
  school_id: string;
  name: string;
  email: string;
  role: UserRole;
  unlocked_modules?: string[];
  status?: string;
}

export interface SchoolEvent {
  id: string;
  school_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  audience: string[];
  created_at: string;
}

export interface Student {
  id: string;
  school_id: string;
  child_name: string;
  date_of_birth: string;
  gender?: string;
  class?: string;
  enrollment_date: string;
  status: string;
}

export interface SkillPathway {
  id: string;
  pathway_name: string;
  problem_category: string;
  goal_description: string;
  parent_home_activity_suggestion?: string;
}

export interface PathwayActivity {
  id: string;
  pathway_id: string;
  step_level: number;
  activity_name: string;
  difficulty_level: 'foundational' | 'core' | 'extension';
  modality: string;
  is_default_choice: boolean;
  instruction: string;
  materials_needed?: string[];
  assessment_cue?: string;
}

export interface StudentPathwayProgress {
  id: string;
  student_id: string;
  pathway_id: string;
  current_step: number;
  status: PathwayStatus;
  started_at: string;
  mastered_at?: string;
}

export interface ActivityLog {
  id: string;
  student_id: string;
  activity_id: string;
  teacher_id: string;
  outcome: ActivityOutcome;
  engagement_level: EngagementLevel;
  activity_rating?: number;
  logged_at: string;
}

export interface AIAlert {
  id: string;
  school_id: string;
  alert_type: AIAlertType;
  details: Record<string, any>;
  status: AlertStatus;
  created_at: string;
}

export interface GroveModule {
  id: string;
  module_name: string;
  description: string;
}

export interface PriorityActionItem {
  school_id: string;
  activity_id: string;
  activity_name: string;
  pathway_name: string;
  pathway_id: string;
  step_level: number;
  student_id: string;
  student_name: string;
  instruction: string;
  materials_needed?: string[];
}

export interface FinancialTransaction {
  id: string;
  school_id: string;
  student_id?: string;
  transaction_type: TransactionType;
  amount: number;
  status: TransactionStatus;
  due_date?: string;
  paid_at?: string;
  description?: string;
}

export interface FormData {
  child_name: string;
  date_of_birth: string;
  gender: string;
  class: string;
  father_name: string;
  mother_name: string;
  current_city: string;
  language_skills: string;
  motor_skills: string;
  cognitive_skills: string;
  activity_level: string;
  emotional_reactivity: string;
  sociability: string;
  adaptability: string;
  emotional_regulation: string;
  behavioral_regulation: string;
  social_preference: string;
  conflict_resolution: string;
  learning_style: string[];
  interests: string;
  parenting_style: string;
  family_dynamics: string[];
  cultural_values: string[];
  concerns: string[];
  goals: string[];
  sentiment: string;
  // Add any other optional text fields if needed
  [key: string]: any; 
}