export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  timezone: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
};

type ProjectRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  project_type: string | null;
  custom_project_type: string | null;
  target_users: string | null;
  team_size: number | null;
  sprint_length: string | null;
  capacity: number | null;
  planning_depth: string | null;
  constraints: string | null;
  status: string;
  discovery_context: Json | null;
  readiness_state: Json | null;
  plan: Json | null;
  plan_schema_version: string | null;
  generation_source: string | null;
  approved_discovery_context: Json | null;
  discovery_approved_at: string | null;
  context_version: number;
  blueprint_version: number;
  pressure_test: Json | null;
  pressure_tested_at: string | null;
  pressure_test_blueprint_version: number | null;
  last_generation_request_id: string | null;
  created_at: string;
  updated_at: string;
};

type DiscoveryRequestRow = {
  id: string;
  request_id: string;
  project_id: string;
  user_id: string;
  status: string;
  response_payload: Json | null;
  created_at: string;
  updated_at: string;
};

type DiscoveryMessageRow = {
  id: string;
  project_id: string;
  user_id: string;
  role: string;
  content: string;
  structured_facts: Json | null;
  sequence_number: number;
  created_at: string;
};

type WorkflowRequestRow = {
  id: string;
  request_id: string;
  operation: string;
  project_id: string;
  user_id: string;
  status: string;
  response_payload: Json | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string | null;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string | null;
          location?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: ProjectRow;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          project_type?: string | null;
          custom_project_type?: string | null;
          target_users?: string | null;
          team_size?: number | null;
          sprint_length?: string | null;
          capacity?: number | null;
          planning_depth?: string | null;
          constraints?: string | null;
          status?: string;
          discovery_context?: Json | null;
          readiness_state?: Json | null;
          plan?: Json | null;
          plan_schema_version?: string | null;
          generation_source?: string | null;
          approved_discovery_context?: Json | null;
          discovery_approved_at?: string | null;
          context_version?: number;
          blueprint_version?: number;
          pressure_test?: Json | null;
          pressure_tested_at?: string | null;
          pressure_test_blueprint_version?: number | null;
          last_generation_request_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ProjectRow, "id" | "created_at">>;
        Relationships: [];
      };
      discovery_messages: {
        Row: DiscoveryMessageRow;
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role: string;
          content: string;
          structured_facts?: Json | null;
          sequence_number: number;
          created_at?: string;
        };
        Update: Partial<
          Pick<DiscoveryMessageRow, "role" | "content" | "structured_facts" | "sequence_number">
        >;
        Relationships: [];
      };
      discovery_requests: {
        Row: DiscoveryRequestRow;
        Insert: {
          id?: string;
          request_id: string;
          project_id: string;
          user_id: string;
          status?: string;
          response_payload?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Pick<DiscoveryRequestRow, "status" | "response_payload" | "updated_at">>;
        Relationships: [];
      };
      workflow_requests: {
        Row: WorkflowRequestRow;
        Insert: {
          id?: string;
          request_id: string;
          operation: string;
          project_id: string;
          user_id: string;
          status?: string;
          response_payload?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Pick<WorkflowRequestRow, "status" | "response_payload" | "updated_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type ProjectDatabaseRow = ProjectRow;
