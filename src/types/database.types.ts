export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      medications: {
        Row: {
          id: string;
          user_id: string;
          drug_name: string;
          dosage: string;
          frequency: string;
          start_date: string;
          end_date: string | null;
          notes: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          drug_name: string;
          dosage: string;
          frequency: string;
          start_date: string;
          end_date?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          drug_name?: string;
          dosage?: string;
          frequency?: string;
          start_date?: string;
          end_date?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      medication_schedules: {
        Row: {
          id: string;
          medication_id: string;
          time_of_day: string;
          days_of_week: string[];
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          medication_id: string;
          time_of_day: string;
          days_of_week?: string[];
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          medication_id?: string;
          time_of_day?: string;
          days_of_week?: string[];
          is_active?: boolean;
          created_at?: string;
        };
      };
      dose_logs: {
        Row: {
          id: string;
          user_id: string;
          medication_id: string;
          schedule_id: string | null;
          scheduled_time: string;
          actual_time: string | null;
          status: 'taken' | 'missed' | 'skipped';
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          medication_id: string;
          schedule_id?: string | null;
          scheduled_time: string;
          actual_time?: string | null;
          status: 'taken' | 'missed' | 'skipped';
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          medication_id?: string;
          schedule_id?: string | null;
          scheduled_time?: string;
          actual_time?: string | null;
          status?: 'taken' | 'missed' | 'skipped';
          notes?: string | null;
          created_at?: string;
        };
      };
      side_effects: {
        Row: {
          id: string;
          user_id: string;
          medication_id: string;
          dose_log_id: string | null;
          description: string;
          severity: 'mild' | 'moderate' | 'severe';
          occurred_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          medication_id: string;
          dose_log_id?: string | null;
          description: string;
          severity: 'mild' | 'moderate' | 'severe';
          occurred_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          medication_id?: string;
          dose_log_id?: string | null;
          description?: string;
          severity?: 'mild' | 'moderate' | 'severe';
          occurred_at?: string;
          created_at?: string;
        };
      };
    };
  };
}
