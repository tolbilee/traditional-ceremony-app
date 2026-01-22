// Supabase 데이터베이스 타입 정의
// 이 파일은 Supabase CLI로 자동 생성되거나 수동으로 작성할 수 있습니다.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      applications: {
        Row: {
          id: string;
          type: 'wedding' | 'doljanchi';
          user_name: string;
          birth_date: string;
          schedule_1: Json;
          schedule_2: Json | null;
          support_type: string;
          application_data: Json;
          consent_status: boolean;
          file_urls: string[];
          file_metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: 'wedding' | 'doljanchi';
          user_name: string;
          birth_date: string;
          schedule_1: Json;
          schedule_2?: Json | null;
          support_type: string;
          application_data: Json;
          consent_status: boolean;
          file_urls?: string[];
          file_metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: 'wedding' | 'doljanchi';
          user_name?: string;
          birth_date?: string;
          schedule_1?: Json;
          schedule_2?: Json | null;
          support_type?: string;
          application_data?: Json;
          consent_status?: boolean;
          file_urls?: string[];
          file_metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

