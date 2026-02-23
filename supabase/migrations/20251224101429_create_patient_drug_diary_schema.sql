/*
  # Patient Drug Diary Database Schema

  ## Overview
  This migration creates the complete database schema for the Patient Drug Diary application,
  enabling patients to track medications, schedules, dose logs, and side effects.

  ## New Tables

  ### 1. profiles
  Extends auth.users with additional patient information
  - `id` (uuid, primary key, references auth.users)
  - `full_name` (text)
  - `email` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. medications
  Stores medication information for each patient
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `drug_name` (text, required)
  - `dosage` (text, e.g., "500mg")
  - `frequency` (text, e.g., "twice daily")
  - `start_date` (date, required)
  - `end_date` (date, nullable)
  - `notes` (text, optional)
  - `is_active` (boolean, default true)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. medication_schedules
  Defines when medications should be taken each day
  - `id` (uuid, primary key)
  - `medication_id` (uuid, references medications)
  - `time_of_day` (time, e.g., "08:00:00")
  - `days_of_week` (text array, e.g., ["Monday", "Tuesday"])
  - `is_active` (boolean, default true)
  - `created_at` (timestamptz)

  ### 4. dose_logs
  Records when doses are taken or missed
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `medication_id` (uuid, references medications)
  - `schedule_id` (uuid, references medication_schedules, nullable)
  - `scheduled_time` (timestamptz)
  - `actual_time` (timestamptz, nullable)
  - `status` (text: "taken", "missed", "skipped")
  - `notes` (text, optional)
  - `created_at` (timestamptz)

  ### 5. side_effects
  Tracks side effects experienced by patients
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `medication_id` (uuid, references medications)
  - `dose_log_id` (uuid, references dose_logs, nullable)
  - `description` (text, required)
  - `severity` (text: "mild", "moderate", "severe")
  - `occurred_at` (timestamptz)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Policies enforce user_id matching for all operations
*/

-- Create profiles table
  CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    email text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

  CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

  CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

  -- Create medications table
  CREATE TABLE IF NOT EXISTS medications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    drug_name text NOT NULL,
    dosage text NOT NULL,
    frequency text NOT NULL,
    start_date date NOT NULL,
    end_date date,
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users can view own medications"
    ON medications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own medications"
    ON medications FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own medications"
    ON medications FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete own medications"
    ON medications FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

  -- Create medication_schedules table
  CREATE TABLE IF NOT EXISTS medication_schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    medication_id uuid NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    time_of_day time NOT NULL,
    days_of_week text[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
  );

  ALTER TABLE medication_schedules ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users can view schedules for own medications"
    ON medication_schedules FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM medications
        WHERE medications.id = medication_schedules.medication_id
        AND medications.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can insert schedules for own medications"
    ON medication_schedules FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM medications
        WHERE medications.id = medication_schedules.medication_id
        AND medications.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can update schedules for own medications"
    ON medication_schedules FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM medications
        WHERE medications.id = medication_schedules.medication_id
        AND medications.user_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM medications
        WHERE medications.id = medication_schedules.medication_id
        AND medications.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can delete schedules for own medications"
    ON medication_schedules FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM medications
        WHERE medications.id = medication_schedules.medication_id
        AND medications.user_id = auth.uid()
      )
    );

  -- Create dose_logs table
  CREATE TABLE IF NOT EXISTS dose_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    medication_id uuid NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    schedule_id uuid REFERENCES medication_schedules(id) ON DELETE SET NULL,
    scheduled_time timestamptz NOT NULL,
    actual_time timestamptz,
    status text NOT NULL CHECK (status IN ('taken', 'missed', 'skipped')),
    notes text,
    created_at timestamptz DEFAULT now()
  );

  ALTER TABLE dose_logs ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users can view own dose logs"
    ON dose_logs FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own dose logs"
    ON dose_logs FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own dose logs"
    ON dose_logs FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete own dose logs"
    ON dose_logs FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

  -- Create side_effects table
  CREATE TABLE IF NOT EXISTS side_effects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    medication_id uuid NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    dose_log_id uuid REFERENCES dose_logs(id) ON DELETE SET NULL,
    description text NOT NULL,
    severity text NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
    occurred_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz DEFAULT now()
  );

  ALTER TABLE side_effects ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users can view own side effects"
    ON side_effects FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert own side effects"
    ON side_effects FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can update own side effects"
    ON side_effects FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete own side effects"
    ON side_effects FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

  -- Create indexes for better query performance
  CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
  CREATE INDEX IF NOT EXISTS idx_medications_is_active ON medications(is_active);
  CREATE INDEX IF NOT EXISTS idx_dose_logs_user_id ON dose_logs(user_id);
  CREATE INDEX IF NOT EXISTS idx_dose_logs_scheduled_time ON dose_logs(scheduled_time);
  CREATE INDEX IF NOT EXISTS idx_side_effects_user_id ON side_effects(user_id);
  CREATE INDEX IF NOT EXISTS idx_side_effects_medication_id ON side_effects(medication_id);

  -- Create function to automatically update updated_at timestamp
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Create triggers for updated_at
  CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  CREATE TRIGGER update_medications_updated_at
    BEFORE UPDATE ON medications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();