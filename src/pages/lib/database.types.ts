export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          id: string
          school_id: string
          title: string
          content: string
          priority: string
          target_audience: string
          published: boolean
          published_at: string | null
          expires_at: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          title: string
          content: string
          priority?: string
          target_audience: string
          published?: boolean
          published_at?: string | null
          expires_at?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          title?: string
          content?: string
          priority?: string
          target_audience?: string
          published?: boolean
          published_at?: string | null
          expires_at?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      assignments: {
        Row: {
          id: string
          class_id: string
          session_id: string | null
          title: string
          description: string | null
          assignment_type: string
          due_date: string | null
          max_points: number
          attachments: Json
          instructions: string | null
          rubric: Json
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          session_id?: string | null
          title: string
          description?: string | null
          assignment_type: string
          due_date?: string | null
          max_points?: number
          attachments?: Json
          instructions?: string | null
          rubric?: Json
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          session_id?: string | null
          title?: string
          description?: string | null
          assignment_type?: string
          due_date?: string | null
          max_points?: number
          attachments?: Json
          instructions?: string | null
          rubric?: Json
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      assignment_submissions: {
        Row: {
          id: string
          assignment_id: string
          student_id: string
          submission_text: string | null
          submission_file_url: string | null
          submission_audio_url: string | null
          attachments: Json
          submitted_at: string
          grade: number | null
          feedback: string | null
          graded_by: string | null
          graded_at: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          assignment_id: string
          student_id: string
          submission_text?: string | null
          submission_file_url?: string | null
          submission_audio_url?: string | null
          attachments?: Json
          submitted_at?: string
          grade?: number | null
          feedback?: string | null
          graded_by?: string | null
          graded_at?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string
          student_id?: string
          submission_text?: string | null
          submission_file_url?: string | null
          submission_audio_url?: string | null
          attachments?: Json
          submitted_at?: string
          grade?: number | null
          feedback?: string | null
          graded_by?: string | null
          graded_at?: string | null
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          id: string
          session_id: string
          student_id: string
          status: string
          check_in_time: string | null
          check_out_time: string | null
          participation_score: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          student_id: string
          status?: string
          check_in_time?: string | null
          check_out_time?: string | null
          participation_score?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          student_id?: string
          status?: string
          check_in_time?: string | null
          check_out_time?: string | null
          participation_score?: number | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      certificates: {
        Row: {
          id: string
          student_id: string
          class_id: string
          school_id: string
          certificate_number: string
          issue_date: string
          completion_date: string | null
          level_achieved: string | null
          total_hours: number | null
          final_grade: string | null
          pdf_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          class_id: string
          school_id: string
          certificate_number: string
          issue_date?: string
          completion_date?: string | null
          level_achieved?: string | null
          total_hours?: number | null
          final_grade?: string | null
          pdf_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          class_id?: string
          school_id?: string
          certificate_number?: string
          issue_date?: string
          completion_date?: string | null
          level_achieved?: string | null
          total_hours?: number | null
          final_grade?: string | null
          pdf_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          id: string
          school_id: string
          course_id: string
          level_id: string | null
          teacher_id: string | null
          classroom_id: string | null
          name: string
          class_type: string
          format: string
          capacity: number
          price: number | null
          schedule_type: string
          start_date: string | null
          end_date: string | null
          days_of_week: number[]
          start_time: string | null
          end_time: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          course_id: string
          level_id?: string | null
          teacher_id?: string | null
          classroom_id?: string | null
          name: string
          class_type: string
          format: string
          capacity?: number
          price?: number | null
          schedule_type: string
          start_date?: string | null
          end_date?: string | null
          days_of_week?: number[]
          start_time?: string | null
          end_time?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          course_id?: string
          level_id?: string | null
          teacher_id?: string | null
          classroom_id?: string | null
          name?: string
          class_type?: string
          format?: string
          capacity?: number
          price?: number | null
          schedule_type?: string
          start_date?: string | null
          end_date?: string | null
          days_of_week?: number[]
          start_time?: string | null
          end_time?: string | null
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      classrooms: {
        Row: {
          id: string
          school_id: string
          name: string
          room_type: string
          capacity: number | null
          location: string | null
          equipment: Json
          virtual_room_url: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          name: string
          room_type: string
          capacity?: number | null
          location?: string | null
          equipment?: Json
          virtual_room_url?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          name?: string
          room_type?: string
          capacity?: number | null
          location?: string | null
          equipment?: Json
          virtual_room_url?: string | null
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      class_sessions: {
        Row: {
          id: string
          class_id: string
          classroom_id: string | null
          session_number: number | null
          scheduled_date: string
          start_time: string
          end_time: string
          actual_start_time: string | null
          actual_end_time: string | null
          topic: string | null
          materials_url: string | null
          homework_assigned: boolean
          notes: string | null
          teacher_notes: string | null
          status: string
          recording_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          classroom_id?: string | null
          session_number?: number | null
          scheduled_date: string
          start_time: string
          end_time: string
          actual_start_time?: string | null
          actual_end_time?: string | null
          topic?: string | null
          materials_url?: string | null
          homework_assigned?: boolean
          notes?: string | null
          teacher_notes?: string | null
          status?: string
          recording_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          classroom_id?: string | null
          session_number?: number | null
          scheduled_date?: string
          start_time?: string
          end_time?: string
          actual_start_time?: string | null
          actual_end_time?: string | null
          topic?: string | null
          materials_url?: string | null
          homework_assigned?: boolean
          notes?: string | null
          teacher_notes?: string | null
          status?: string
          recording_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          id: string
          school_id: string
          language_id: string
          name: string
          description: string | null
          course_type: string
          format: string
          duration_weeks: number | null
          total_hours: number | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          language_id: string
          name: string
          description?: string | null
          course_type: string
          format: string
          duration_weeks?: number | null
          total_hours?: number | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          language_id?: string
          name?: string
          description?: string | null
          course_type?: string
          format?: string
          duration_weeks?: number | null
          total_hours?: number | null
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      course_levels: {
        Row: {
          id: string
          course_id: string
          name: string
          cefr_level: string
          order_index: number
          description: string | null
          learning_outcomes: string[]
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          name: string
          cefr_level: string
          order_index: number
          description?: string | null
          learning_outcomes?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          name?: string
          cefr_level?: string
          order_index?: number
          description?: string | null
          learning_outcomes?: string[]
          created_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          id: string
          student_id: string
          class_id: string
          enrollment_date: string
          completion_date: string | null
          status: string
          payment_status: string
          final_grade: string | null
          progress_percentage: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          class_id: string
          enrollment_date?: string
          completion_date?: string | null
          status?: string
          payment_status?: string
          final_grade?: string | null
          progress_percentage?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          class_id?: string
          enrollment_date?: string
          completion_date?: string | null
          status?: string
          payment_status?: string
          final_grade?: string | null
          progress_percentage?: number
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          school_id: string
          student_id: string
          invoice_number: string
          amount: number
          tax_amount: number
          total_amount: number
          currency: string
          status: string
          due_date: string | null
          paid_date: string | null
          line_items: Json
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          student_id: string
          invoice_number: string
          amount: number
          tax_amount?: number
          total_amount: number
          currency?: string
          status?: string
          due_date?: string | null
          paid_date?: string | null
          line_items?: Json
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          student_id?: string
          invoice_number?: string
          amount?: number
          tax_amount?: number
          total_amount?: number
          currency?: string
          status?: string
          due_date?: string | null
          paid_date?: string | null
          line_items?: Json
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      languages: {
        Row: {
          id: string
          school_id: string
          name: string
          code: string
          flag_emoji: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          name: string
          code: string
          flag_emoji?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          name?: string
          code?: string
          flag_emoji?: string | null
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      live_rooms: {
        Row: {
          id: string
          school_id: string
          class_id: string | null
          name: string
          room_type: string
          max_participants: number
          settings: Json
          access_code: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          class_id?: string | null
          name: string
          room_type?: string
          max_participants?: number
          settings?: Json
          access_code?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          class_id?: string | null
          name?: string
          room_type?: string
          max_participants?: number
          settings?: Json
          access_code?: string | null
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      live_sessions: {
        Row: {
          id: string
          room_id: string
          class_session_id: string | null
          host_id: string
          title: string | null
          status: string
          started_at: string | null
          ended_at: string | null
          recording_url: string | null
          whiteboard_data: Json | null
          chat_log: Json
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          class_session_id?: string | null
          host_id: string
          title?: string | null
          status?: string
          started_at?: string | null
          ended_at?: string | null
          recording_url?: string | null
          whiteboard_data?: Json | null
          chat_log?: Json
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          class_session_id?: string | null
          host_id?: string
          title?: string | null
          status?: string
          started_at?: string | null
          ended_at?: string | null
          recording_url?: string | null
          whiteboard_data?: Json | null
          chat_log?: Json
          created_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          school_id: string
          sender_id: string
          recipient_id: string
          subject: string | null
          body: string
          read: boolean
          read_at: string | null
          parent_message_id: string | null
          attachments: Json
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          sender_id: string
          recipient_id: string
          subject?: string | null
          body: string
          read?: boolean
          read_at?: string | null
          parent_message_id?: string | null
          attachments?: Json
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          sender_id?: string
          recipient_id?: string
          subject?: string | null
          body?: string
          read?: boolean
          read_at?: string | null
          parent_message_id?: string | null
          attachments?: Json
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          category: string
          read: boolean
          read_at: string | null
          action_url: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          category: string
          read?: boolean
          read_at?: string | null
          action_url?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          category?: string
          read?: boolean
          read_at?: string | null
          action_url?: string | null
          metadata?: Json
          created_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          invoice_id: string | null
          student_id: string
          school_id: string
          amount: number
          currency: string
          payment_method: string
          payment_provider: string | null
          transaction_id: string | null
          status: string
          payment_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id?: string | null
          student_id: string
          school_id: string
          amount: number
          currency?: string
          payment_method: string
          payment_provider?: string | null
          transaction_id?: string | null
          status?: string
          payment_date?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string | null
          student_id?: string
          school_id?: string
          amount?: number
          currency?: string
          payment_method?: string
          payment_provider?: string | null
          transaction_id?: string | null
          status?: string
          payment_date?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      placement_results: {
        Row: {
          id: string
          student_id: string
          test_id: string
          score: number | null
          recommended_level: string | null
          grammar_score: number | null
          vocabulary_score: number | null
          speaking_score: number | null
          listening_score: number | null
          reading_score: number | null
          writing_score: number | null
          test_date: string
          evaluator_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          test_id: string
          score?: number | null
          recommended_level?: string | null
          grammar_score?: number | null
          vocabulary_score?: number | null
          speaking_score?: number | null
          listening_score?: number | null
          reading_score?: number | null
          writing_score?: number | null
          test_date?: string
          evaluator_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          test_id?: string
          score?: number | null
          recommended_level?: string | null
          grammar_score?: number | null
          vocabulary_score?: number | null
          speaking_score?: number | null
          listening_score?: number | null
          reading_score?: number | null
          writing_score?: number | null
          test_date?: string
          evaluator_notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      placement_tests: {
        Row: {
          id: string
          school_id: string
          language_id: string
          title: string
          description: string | null
          test_content: Json
          duration_minutes: number | null
          passing_score: number | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          language_id: string
          title: string
          description?: string | null
          test_content: Json
          duration_minutes?: number | null
          passing_score?: number | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          language_id?: string
          title?: string
          description?: string | null
          test_content?: Json
          duration_minutes?: number | null
          passing_score?: number | null
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      progress_reports: {
        Row: {
          id: string
          student_id: string
          class_id: string
          teacher_id: string | null
          reporting_period_start: string
          reporting_period_end: string
          period_start: string | null
          period_end: string | null
          overall_progress: number | null
          attendance_rate: number | null
          homework_completion_rate: number | null
          average_quiz_score: number | null
          speaking_score: number | null
          listening_score: number | null
          reading_score: number | null
          writing_score: number | null
          speaking_level: string | null
          writing_level: string | null
          listening_level: string | null
          reading_level: string | null
          grammar_level: string | null
          vocabulary_level: string | null
          cefr_level: string | null
          strengths: string | null
          areas_for_improvement: string | null
          teacher_comments: string | null
          teacher_notes: string | null
          recommendations: string | null
          next_level_ready: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          class_id: string
          teacher_id?: string | null
          reporting_period_start: string
          reporting_period_end: string
          period_start?: string | null
          period_end?: string | null
          overall_progress?: number | null
          attendance_rate?: number | null
          homework_completion_rate?: number | null
          average_quiz_score?: number | null
          speaking_score?: number | null
          listening_score?: number | null
          reading_score?: number | null
          writing_score?: number | null
          speaking_level?: string | null
          writing_level?: string | null
          listening_level?: string | null
          reading_level?: string | null
          grammar_level?: string | null
          vocabulary_level?: string | null
          cefr_level?: string | null
          strengths?: string | null
          areas_for_improvement?: string | null
          teacher_comments?: string | null
          teacher_notes?: string | null
          recommendations?: string | null
          next_level_ready?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          class_id?: string
          teacher_id?: string | null
          reporting_period_start?: string
          reporting_period_end?: string
          period_start?: string | null
          period_end?: string | null
          overall_progress?: number | null
          attendance_rate?: number | null
          homework_completion_rate?: number | null
          average_quiz_score?: number | null
          speaking_score?: number | null
          listening_score?: number | null
          reading_score?: number | null
          writing_score?: number | null
          speaking_level?: string | null
          writing_level?: string | null
          listening_level?: string | null
          reading_level?: string | null
          grammar_level?: string | null
          vocabulary_level?: string | null
          cefr_level?: string | null
          strengths?: string | null
          areas_for_improvement?: string | null
          teacher_comments?: string | null
          teacher_notes?: string | null
          recommendations?: string | null
          next_level_ready?: boolean
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      renewal_recommendations: {
        Row: {
          id: string
          student_id: string
          current_class_id: string | null
          current_enrollment_id: string | null
          recommended_class_id: string | null
          recommended_course_id: string | null
          recommended_level: string | null
          reason: string | null
          notes: string | null
          confidence_score: number | null
          recommendation_date: string
          status: string
          expires_at: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          current_class_id?: string | null
          current_enrollment_id?: string | null
          recommended_class_id?: string | null
          recommended_course_id?: string | null
          recommended_level?: string | null
          reason?: string | null
          notes?: string | null
          confidence_score?: number | null
          recommendation_date?: string
          status?: string
          expires_at?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          current_class_id?: string | null
          current_enrollment_id?: string | null
          recommended_class_id?: string | null
          recommended_course_id?: string | null
          recommended_level?: string | null
          reason?: string | null
          notes?: string | null
          confidence_score?: number | null
          recommendation_date?: string
          status?: string
          expires_at?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      risk_flags: {
        Row: {
          id: string
          student_id: string
          flag_type: string
          severity: string
          description: string | null
          auto_generated: boolean
          flagged_by: string | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          resolution_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          flag_type: string
          severity: string
          description?: string | null
          auto_generated?: boolean
          flagged_by?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          resolution_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          flag_type?: string
          severity?: string
          description?: string | null
          auto_generated?: boolean
          flagged_by?: string | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          resolution_notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          website: string | null
          timezone: string
          currency: string
          phone: string | null
          email: string | null
          address: string | null
          city: string | null
          country: string | null
          subscription_tier: string
          subscription_status: string
          max_students: number
          max_teachers: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          settings: Json
          branding: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          website?: string | null
          timezone?: string
          currency?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          subscription_tier?: string
          subscription_status?: string
          max_students?: number
          max_teachers?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          settings?: Json
          branding?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          website?: string | null
          timezone?: string
          currency?: string
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          subscription_tier?: string
          subscription_status?: string
          max_students?: number
          max_teachers?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          settings?: Json
          branding?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      school_memberships: {
        Row: {
          id: string
          school_id: string
          user_id: string
          role: string
          status: string
          joined_at: string
        }
        Insert: {
          id?: string
          school_id: string
          user_id: string
          role: string
          status?: string
          joined_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          user_id?: string
          role?: string
          status?: string
          joined_at?: string
        }
        Relationships: []
      }
      session_participants: {
        Row: {
          id: string
          live_session_id: string
          user_id: string
          role: string
          joined_at: string
          left_at: string | null
          duration_minutes: number | null
          connection_quality: string | null
        }
        Insert: {
          id?: string
          live_session_id: string
          user_id: string
          role?: string
          joined_at?: string
          left_at?: string | null
          duration_minutes?: number | null
          connection_quality?: string | null
        }
        Update: {
          id?: string
          live_session_id?: string
          user_id?: string
          role?: string
          joined_at?: string
          left_at?: string | null
          duration_minutes?: number | null
          connection_quality?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          id: string
          user_id: string
          school_id: string
          date_of_birth: string | null
          nationality: string | null
          native_language: string | null
          target_languages: string[]
          learning_goals: string | null
          preferred_learning_style: string | null
          education_level: string | null
          occupation: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          enrollment_date: string
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          school_id: string
          date_of_birth?: string | null
          nationality?: string | null
          native_language?: string | null
          target_languages?: string[]
          learning_goals?: string | null
          preferred_learning_style?: string | null
          education_level?: string | null
          occupation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          enrollment_date?: string
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          school_id?: string
          date_of_birth?: string | null
          nationality?: string | null
          native_language?: string | null
          target_languages?: string[]
          learning_goals?: string | null
          preferred_learning_style?: string | null
          education_level?: string | null
          occupation?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          enrollment_date?: string
          status?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      student_availability: {
        Row: {
          id: string
          student_id: string
          day_of_week: number
          start_time: string
          end_time: string
          preferred: boolean
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          day_of_week: number
          start_time: string
          end_time: string
          preferred?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          preferred?: boolean
          created_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          student_id: string
          class_id: string | null
          school_id: string
          plan_type: string
          amount: number
          currency: string
          billing_cycle: string
          start_date: string
          end_date: string | null
          next_billing_date: string | null
          status: string
          stripe_subscription_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          class_id?: string | null
          school_id: string
          plan_type: string
          amount: number
          currency?: string
          billing_cycle: string
          start_date: string
          end_date?: string | null
          next_billing_date?: string | null
          status?: string
          stripe_subscription_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          class_id?: string | null
          school_id?: string
          plan_type?: string
          amount?: number
          currency?: string
          billing_cycle?: string
          start_date?: string
          end_date?: string | null
          next_billing_date?: string | null
          status?: string
          stripe_subscription_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          id: string
          user_id: string
          school_id: string
          bio: string | null
          qualifications: Json
          languages_taught: string[]
          teaching_languages: string[]
          hourly_rate: number | null
          max_weekly_hours: number
          specializations: string[]
          certifications: Json
          hire_date: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          school_id: string
          bio?: string | null
          qualifications?: Json
          languages_taught?: string[]
          teaching_languages?: string[]
          hourly_rate?: number | null
          max_weekly_hours?: number
          specializations?: string[]
          certifications?: Json
          hire_date?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          school_id?: string
          bio?: string | null
          qualifications?: Json
          languages_taught?: string[]
          teaching_languages?: string[]
          hourly_rate?: number | null
          max_weekly_hours?: number
          specializations?: string[]
          certifications?: Json
          hire_date?: string | null
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      teacher_availability: {
        Row: {
          id: string
          teacher_id: string
          day_of_week: number
          start_time: string
          end_time: string
          available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          day_of_week: number
          start_time: string
          end_time: string
          available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          available?: boolean
          created_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          phone: string | null
          role: string
          timezone: string
          language_preference: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          phone?: string | null
          role?: string
          timezone?: string
          language_preference?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          phone?: string | null
          role?: string
          timezone?: string
          language_preference?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      waitlists: {
        Row: {
          id: string
          student_id: string
          class_id: string
          priority: number
          preferred_times: Json
          notes: string | null
          status: string
          added_at: string
          notified_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          class_id: string
          priority?: number
          preferred_times?: Json
          notes?: string | null
          status?: string
          added_at?: string
          notified_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          class_id?: string
          priority?: number
          preferred_times?: Json
          notes?: string | null
          status?: string
          added_at?: string
          notified_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_school_ids: {
        Args: Record<string, never>
        Returns: string[]
      }
      get_user_role_in_school: {
        Args: { p_school_id: string }
        Returns: string
      }
      is_school_member: {
        Args: { p_school_id: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_school_admin: {
        Args: { p_school_id: string }
        Returns: boolean
      }
      is_teacher_in_school: {
        Args: { p_school_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Enums = {
  user_role: 'super_admin' | 'school_admin' | 'teacher' | 'student'
  membership_status: 'active' | 'inactive' | 'suspended' | 'pending'
  subscription_tier: 'free' | 'starter' | 'professional' | 'enterprise'
  subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'paused'
}
