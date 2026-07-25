export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      daily_checkins: {
        Row: {
          checkin_date: string
          id: string
          is_rest_day: boolean
          mobility_hit: boolean
          protein_hit: boolean
          sleep_hit: boolean
          user_id: string
          water_hit: boolean
          xp_earned: number
        }
        Insert: {
          checkin_date: string
          id?: string
          is_rest_day?: boolean
          mobility_hit?: boolean
          protein_hit?: boolean
          sleep_hit?: boolean
          user_id: string
          water_hit?: boolean
          xp_earned?: number
        }
        Update: {
          checkin_date?: string
          id?: string
          is_rest_day?: boolean
          mobility_hit?: boolean
          protein_hit?: boolean
          sleep_hit?: boolean
          user_id?: string
          water_hit?: boolean
          xp_earned?: number
        }
        Relationships: []
      }
      exercise_progress: {
        Row: {
          best_est_1rm_kg: number | null
          best_volume_kg: number | null
          exercise_id: string
          exercise_level: number
          exercise_xp: number
          last_performed_at: string | null
          user_id: string
        }
        Insert: {
          best_est_1rm_kg?: number | null
          best_volume_kg?: number | null
          exercise_id: string
          exercise_level?: number
          exercise_xp?: number
          last_performed_at?: string | null
          user_id: string
        }
        Update: {
          best_est_1rm_kg?: number | null
          best_volume_kg?: number | null
          exercise_id?: string
          exercise_level?: number
          exercise_xp?: number
          last_performed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_progress_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          id: string
          is_bodyweight: boolean
          is_default: boolean
          name: string
          primary_muscle: string | null
          slug: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_bodyweight?: boolean
          is_default?: boolean
          name: string
          primary_muscle?: string | null
          slug: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_bodyweight?: boolean
          is_default?: boolean
          name?: string
          primary_muscle?: string | null
          slug?: string
        }
        Relationships: []
      }
      habit_logs: {
        Row: {
          habit_id: string
          id: string
          log_date: string
          user_id: string
        }
        Insert: {
          habit_id: string
          id?: string
          log_date: string
          user_id: string
        }
        Update: {
          habit_id?: string
          id?: string
          log_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          archived: boolean
          color: string | null
          created_at: string
          emoji: string | null
          id: string
          name: string
          sort_order: number
          user_id: string
        }
        Insert: {
          archived?: boolean
          color?: string | null
          created_at?: string
          emoji?: string | null
          id?: string
          name: string
          sort_order?: number
          user_id: string
        }
        Update: {
          archived?: boolean
          color?: string | null
          created_at?: string
          emoji?: string | null
          id?: string
          name?: string
          sort_order?: number
          user_id?: string
        }
        Relationships: []
      }
      mission_claims: {
        Row: {
          claimed_at: string
          id: string
          mission_id: string
          period_key: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          id?: string
          mission_id: string
          period_key: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          id?: string
          mission_id?: string
          period_key?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bodyweight_kg: number | null
          created_at: string
          current_streak: number
          display_name: string | null
          goal: string | null
          height_cm: number | null
          id: string
          last_completed_date: string | null
          longest_streak: number
          nutrition_carb: string | null
          nutrition_fat: string | null
          nutrition_kcal: string | null
          nutrition_protein: string | null
          onboarded: boolean
          sleep_time: string | null
          xp_total: number
        }
        Insert: {
          bodyweight_kg?: number | null
          created_at?: string
          current_streak?: number
          display_name?: string | null
          goal?: string | null
          height_cm?: number | null
          id: string
          last_completed_date?: string | null
          longest_streak?: number
          nutrition_carb?: string | null
          nutrition_fat?: string | null
          nutrition_kcal?: string | null
          nutrition_protein?: string | null
          onboarded?: boolean
          sleep_time?: string | null
          xp_total?: number
        }
        Update: {
          bodyweight_kg?: number | null
          created_at?: string
          current_streak?: number
          display_name?: string | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          last_completed_date?: string | null
          longest_streak?: number
          nutrition_carb?: string | null
          nutrition_fat?: string | null
          nutrition_kcal?: string | null
          nutrition_protein?: string | null
          onboarded?: boolean
          sleep_time?: string | null
          xp_total?: number
        }
        Relationships: []
      }
      program_exercises: {
        Row: {
          exercise_id: string
          id: string
          program_id: string
          sort_order: number
          target_reps: number | null
          target_sets: number | null
        }
        Insert: {
          exercise_id: string
          id?: string
          program_id: string
          sort_order?: number
          target_reps?: number | null
          target_sets?: number | null
        }
        Update: {
          exercise_id?: string
          id?: string
          program_id?: string
          sort_order?: number
          target_reps?: number | null
          target_sets?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "program_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_exercises_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          sort_order: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          sort_order?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          sort_order?: number
          user_id?: string | null
        }
        Relationships: []
      }
      streak_log: {
        Row: {
          completed: boolean
          id: string
          is_protected_rest: boolean
          log_date: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          id?: string
          is_protected_rest?: boolean
          log_date: string
          user_id: string
        }
        Update: {
          completed?: boolean
          id?: string
          is_protected_rest?: boolean
          log_date?: string
          user_id?: string
        }
        Relationships: []
      }
      user_attributes: {
        Row: {
          disciplina: number
          forca: number
          mobilidade: number
          resistencia: number
          saude: number
          user_id: string
          velocidade: number
        }
        Insert: {
          disciplina?: number
          forca?: number
          mobilidade?: number
          resistencia?: number
          saude?: number
          user_id: string
          velocidade?: number
        }
        Update: {
          disciplina?: number
          forca?: number
          mobilidade?: number
          resistencia?: number
          saude?: number
          user_id?: string
          velocidade?: number
        }
        Relationships: []
      }
      workout_sets: {
        Row: {
          exercise_id: string
          id: string
          is_pr: boolean
          is_warmup: boolean
          reps: number
          set_index: number
          volume_kg: number | null
          weight_kg: number
          workout_id: string
        }
        Insert: {
          exercise_id: string
          id?: string
          is_pr?: boolean
          is_warmup?: boolean
          reps?: number
          set_index: number
          volume_kg?: number | null
          weight_kg?: number
          workout_id: string
        }
        Update: {
          exercise_id?: string
          id?: string
          is_pr?: boolean
          is_warmup?: boolean
          reps?: number
          set_index?: number
          volume_kg?: number | null
          weight_kg?: number
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sets_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          duration_min: number | null
          id: string
          notes: string | null
          performed_at: string
          total_volume_kg: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          created_at?: string
          duration_min?: number | null
          id?: string
          notes?: string | null
          performed_at?: string
          total_volume_kg?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          created_at?: string
          duration_min?: number | null
          id?: string
          notes?: string | null
          performed_at?: string
          total_volume_kg?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          amount: number
          id: string
          occurred_at: string
          source: string
          user_id: string
          workout_id: string | null
        }
        Insert: {
          amount: number
          id?: string
          occurred_at?: string
          source: string
          user_id: string
          workout_id?: string | null
        }
        Update: {
          amount?: number
          id?: string
          occurred_at?: string
          source?: string
          user_id?: string
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xp_events_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
