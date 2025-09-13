import { supabase } from './supabase';
import type { 
  User, 
  Student, 
  Teacher, 
  PriorityActionItem, 
  AIAlert,
  FinancialTransaction,
  SchoolEvent,
  GroveModule,
  ActivityLog
} from './types';

// =============================================
// AUTHENTICATION API
// =============================================

export const authApi = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  }
};

// =============================================
// USER MANAGEMENT API
// =============================================

export const userApi = {
  async getUserProfile(authId: string): Promise<User | null> {
    // Check if user is an admin
    const { data: adminData } = await supabase
      .from('admins')
      .select(`
        id, auth_id, school_id, name, email,
        school_unlocked_modules (
          module_id
        )
      `)
      .eq('auth_id', authId)
      .single();

    if (adminData) {
      const unlocked_modules = adminData.school_unlocked_modules?.map((m: any) => m.module_id) || [];
      return {
        id: adminData.id,
        auth_id: adminData.auth_id,
        school_id: adminData.school_id,
        name: adminData.name,
        email: adminData.email,
        role: 'admin',
        unlocked_modules
      };
    }

    // Check if user is a teacher
    const { data: teacherData } = await supabase
      .from('teachers')
      .select('id, auth_id, school_id, name, email, status')
      .eq('auth_id', authId)
      .single();

    if (teacherData) {
      return {
        id: teacherData.id,
        auth_id: teacherData.auth_id,
        school_id: teacherData.school_id,
        name: teacherData.name,
        email: teacherData.email,
        role: 'teacher',
        status: teacherData.status
      };
    }

    // Check if user is a parent
    const { data: parentData } = await supabase
      .from('parents')
      .select('id, auth_id, name, email')
      .eq('auth_id', authId)
      .single();

    if (parentData) {
      return {
        id: parentData.id,
        auth_id: parentData.auth_id,
        school_id: '', // Parents may be associated with multiple schools
        name: parentData.name,
        email: parentData.email,
        role: 'parent'
      };
    }

    return null;
  }
};

// =============================================
// STUDENT MANAGEMENT API
// =============================================

export const studentApi = {
  async getStudents(schoolId: string): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select(`
        id,
        school_id,
        child_name,
        date_of_birth,
        gender,
        class,
        enrollment_date,
        status,
        student_assessments (
          category,
          total_score
        )
      `)
      .eq('school_id', schoolId)
      .eq('status', 'active')
      .order('child_name');

    if (error) throw error;
    return data || [];
  },

  async getStudentById(studentId: string): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        student_assessments (
          assessment_data,
          total_score,
          category,
          submitted_at
        ),
        student_pathway_progress (
          pathway_id,
          current_step,
          status,
          started_at,
          mastered_at,
          skill_pathways (
            pathway_name,
            goal_description
          )
        )
      `)
      .eq('id', studentId)
      .single();

    if (error) throw error;
    return data;
  }
};

// =============================================
// TEACHER MANAGEMENT API
// =============================================

export const teacherApi = {
  async getTeachers(schoolId: string): Promise<Teacher[]> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('school_id', schoolId)
      .order('name');

    if (error) throw error;
    return data || [];
  }
};

// =============================================
// CURRICULUM & INSTRUCTION API
// =============================================

export const curriculumApi = {
  async getPriorityActionList(): Promise<PriorityActionItem[]> {
    const { data, error } = await supabase
      .from('priority_action_list_view')
      .select('*')
      .order('pathway_name, step_level, student_name');

    if (error) throw error;
    return data || [];
  },

  async logActivityOutcomes(logs: any[]) {
    const { data, error } = await supabase.rpc('log_activity_outcomes', {
      params: { logs }
    });

    if (error) throw error;
    return data;
  },

  async updateStudentProgress(updates: any[]) {
    const { data, error } = await supabase.rpc('update_student_pathway_progress', {
      params: { updates }
    });

    if (error) throw error;
    return data;
  },

  async getActivityAlternatives(pathwayId: string, stepLevel: number) {
    const { data, error } = await supabase.rpc('get_activity_alternatives', {
      params: { pathway_id: pathwayId, step_level: stepLevel }
    });

    if (error) throw error;
    return data;
  }
};

// =============================================
// AI CO-PILOT API
// =============================================

export const aiApi = {
  async getAdminCoPilotFeed(): Promise<AIAlert[]> {
    const { data, error } = await supabase.rpc('get_admin_co_pilot_feed', {
      params: {}
    });

    if (error) throw error;
    return data?.alerts || [];
  },

  async updateAlertStatus(alertId: string, status: 'viewed' | 'dismissed') {
    const { data, error } = await supabase.rpc('update_alert_status', {
      params: { alert_id: alertId, status }
    });

    if (error) throw error;
    return data;
  },

  async generatePositiveHighlight(studentId: string) {
    const { data, error } = await supabase.rpc('generate_positive_highlight', {
      params: { student_id: studentId }
    });

    if (error) throw error;
    return data;
  }
};

// =============================================
// FINANCIAL MANAGEMENT API
// =============================================

export const financialApi = {
  async getStudentFinancialSummary(schoolId: string) {
    const { data, error } = await supabase
      .from('student_financial_summary_view')
      .select('*')
      .eq('school_id', schoolId)
      .order('child_name');

    if (error) throw error;
    return data || [];
  },

  async getFinancialTransactions(schoolId: string): Promise<FinancialTransaction[]> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select(`
        *,
        students (
          child_name
        )
      `)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getFeeStructures(schoolId: string) {
    const { data, error } = await supabase
      .from('fee_structures')
      .select(`
        *,
        payment_plans (*)
      `)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// =============================================
// CALENDAR & EVENTS API
// =============================================

export const calendarApi = {
  async getUnifiedCalendar(userRole: string, startDate: string, endDate: string): Promise<SchoolEvent[]> {
    const { data, error } = await supabase.rpc('get_unified_smart_calendar', {
      params: { 
        user_role: userRole, 
        start_date: startDate, 
        end_date: endDate 
      }
    });

    if (error) throw error;
    return data?.events || [];
  },

  async getSchoolEvents(schoolId: string): Promise<SchoolEvent[]> {
    const { data, error } = await supabase
      .from('school_events')
      .select('*')
      .eq('school_id', schoolId)
      .gte('start_time', new Date().toISOString())
      .order('start_time');

    if (error) throw error;
    return data || [];
  }
};

// =============================================
// COMMUNICATION API
// =============================================

export const communicationApi = {
  async submitCommunication(messageType: string, content: string, recipientId?: string) {
    const { data, error } = await supabase.rpc('submit_communication', {
      params: { 
        message_type: messageType, 
        content,
        recipient_id: recipientId 
      }
    });

    if (error) throw error;
    return data;
  },

  async getSchoolCommunications(schoolId: string) {
    const { data, error } = await supabase
      .from('school_communications')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// =============================================
// MODULES MARKETPLACE API
// =============================================

export const modulesApi = {
  async getAvailableModules(): Promise<GroveModule[]> {
    const { data, error } = await supabase
      .from('grove_modules')
      .select('*')
      .order('module_name');

    if (error) throw error;
    return data || [];
  },

  async getSchoolUnlockedModules(schoolId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('school_unlocked_modules')
      .select('module_id')
      .eq('school_id', schoolId);

    if (error) throw error;
    return data?.map(item => item.module_id) || [];
  },

  async activateModule(schoolId: string, moduleId: string) {
    const { data, error } = await supabase
      .from('school_unlocked_modules')
      .insert({ school_id: schoolId, module_id: moduleId });

    if (error) throw error;
    return data;
  }
};