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
      game_recordings: {
        Row: {
          apple_count: number | null
          apples_eaten: number | null
          created_at: string
          duration: number | null
          game_data: Json
          generation: number | null
          id: string
          max_score: number | null
          metadata: Json | null
          snake_count: number | null
          total_moves: number | null
          winner_color: string | null
          winner_id: number | null
        }
        Insert: {
          apple_count?: number | null
          apples_eaten?: number | null
          created_at?: string
          duration?: number | null
          game_data: Json
          generation?: number | null
          id?: string
          max_score?: number | null
          metadata?: Json | null
          snake_count?: number | null
          total_moves?: number | null
          winner_color?: string | null
          winner_id?: number | null
        }
        Update: {
          apple_count?: number | null
          apples_eaten?: number | null
          created_at?: string
          duration?: number | null
          game_data?: Json
          generation?: number | null
          id?: string
          max_score?: number | null
          metadata?: Json | null
          snake_count?: number | null
          total_moves?: number | null
          winner_color?: string | null
          winner_id?: number | null
        }
        Relationships: []
      }
      neural_networks: {
        Row: {
          created_at: string | null
          generation: number | null
          id: string
          metadata: Json | null
          score: number | null
          updated_at: string | null
          weights: Json
        }
        Insert: {
          created_at?: string | null
          generation?: number | null
          id?: string
          metadata?: Json | null
          score?: number | null
          updated_at?: string | null
          weights: Json
        }
        Update: {
          created_at?: string | null
          generation?: number | null
          id?: string
          metadata?: Json | null
          score?: number | null
          updated_at?: string | null
          weights?: Json
        }
        Relationships: []
      }
      training_data: {
        Row: {
          created_at: string | null
          id: string
          inputs: Json
          neural_network_id: string | null
          outputs: Json
          success: boolean
        }
        Insert: {
          created_at?: string | null
          id?: string
          inputs: Json
          neural_network_id?: string | null
          outputs: Json
          success: boolean
        }
        Update: {
          created_at?: string | null
          id?: string
          inputs?: Json
          neural_network_id?: string | null
          outputs?: Json
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "training_data_neural_network_id_fkey"
            columns: ["neural_network_id"]
            isOneToOne: false
            referencedRelation: "neural_networks"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
