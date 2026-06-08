export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          active: boolean;
          created_at: string;
          id: string;
          note: string | null;
          user_id: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          id?: string;
          note?: string | null;
          user_id: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          id?: string;
          note?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      ai_usage_logs: {
        Row: {
          created_at: string;
          id: string;
          prompt_excerpt: string | null;
          usage_day: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          prompt_excerpt?: string | null;
          usage_day: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          prompt_excerpt?: string | null;
          usage_day?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      redeem_codes: {
        Row: {
          code: string;
          course_type: string;
          created_at: string;
          expires_at: string | null;
          id: string;
          max_redemptions: number;
          redeemed_count: number;
          status: "active" | "disabled";
        };
        Insert: {
          code: string;
          course_type: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          max_redemptions?: number;
          redeemed_count?: number;
          status?: "active" | "disabled";
        };
        Update: {
          code?: string;
          course_type?: string;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          max_redemptions?: number;
          redeemed_count?: number;
          status?: "active" | "disabled";
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          created_at: string;
          key: string;
          updated_at: string;
          value: string;
        };
        Insert: {
          created_at?: string;
          key: string;
          updated_at?: string;
          value: string;
        };
        Update: {
          created_at?: string;
          key?: string;
          updated_at?: string;
          value?: string;
        };
        Relationships: [];
      };
      redemption_events: {
        Row: {
          code_id: string;
          created_at: string;
          id: string;
          redeemed_by_user_id: string;
        };
        Insert: {
          code_id: string;
          created_at?: string;
          id?: string;
          redeemed_by_user_id: string;
        };
        Update: {
          code_id?: string;
          created_at?: string;
          id?: string;
          redeemed_by_user_id?: string;
        };
        Relationships: [];
      };
      user_permissions: {
        Row: {
          active: boolean;
          course_type: string;
          created_at: string;
          granted_by_code_id: string | null;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          active?: boolean;
          course_type: string;
          created_at?: string;
          granted_by_code_id?: string | null;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          active?: boolean;
          course_type?: string;
          created_at?: string;
          granted_by_code_id?: string | null;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      consume_ai_quota: {
        Args: {
          daily_limit: number;
          prompt_excerpt_input?: string;
          timezone_name?: string;
        };
        Returns: {
          message: string;
          quota_limit: number;
          remaining_count: number;
          success: boolean;
          usage_day: string;
          used_count: number;
        }[];
      };
      get_ai_quota_status: {
        Args: {
          daily_limit: number;
          timezone_name?: string;
        };
        Returns: {
          quota_limit: number;
          remaining_count: number;
          usage_day: string;
          used_count: number;
        }[];
      };
      redeem_code: {
        Args: {
          input_code: string;
        };
        Returns: {
          course_type: string;
          message: string;
          success: boolean;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
