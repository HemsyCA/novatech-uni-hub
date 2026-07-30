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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      awards: {
        Row: {
          awarded_date: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          robot_competition_id: string
          title: string
        }
        Insert: {
          awarded_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          robot_competition_id: string
          title: string
        }
        Update: {
          awarded_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          robot_competition_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "awards_robot_competition_id_fkey"
            columns: ["robot_competition_id"]
            isOneToOne: false
            referencedRelation: "robot_competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          created_at: string
          description: string | null
          event_date: string | null
          id: string
          location: string | null
          name: string
          organizer: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          name: string
          organizer?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          name?: string
          organizer?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          quantity: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          status: Database["public"]["Enums"]["order_status"]
          total: number
          transaction_code: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total: number
          transaction_code?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total?: number
          transaction_code?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      print_materials: {
        Row: {
          cost_per_gram: number
          cost_per_hour: number
          created_at: string
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          print_speed_g_per_hour: number
        }
        Insert: {
          cost_per_gram?: number
          cost_per_hour?: number
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          print_speed_g_per_hour?: number
        }
        Update: {
          cost_per_gram?: number
          cost_per_hour?: number
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          print_speed_g_per_hour?: number
        }
        Relationships: []
      }
      print_reservations: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          design_file_path: string | null
          estimated_cost: number | null
          estimated_grams: number
          estimated_hours: number
          id: string
          material_id: string | null
          notes: string | null
          printer_id: string | null
          project_name: string
          scheduled_date: string
          scheduled_time: string
          status: Database["public"]["Enums"]["print_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          design_file_path?: string | null
          estimated_cost?: number | null
          estimated_grams: number
          estimated_hours: number
          id?: string
          material_id?: string | null
          notes?: string | null
          printer_id?: string | null
          project_name: string
          scheduled_date: string
          scheduled_time: string
          status?: Database["public"]["Enums"]["print_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          design_file_path?: string | null
          estimated_cost?: number | null
          estimated_grams?: number
          estimated_hours?: number
          id?: string
          material_id?: string | null
          notes?: string | null
          printer_id?: string | null
          project_name?: string
          scheduled_date?: string
          scheduled_time?: string
          status?: Database["public"]["Enums"]["print_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "print_reservations_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "print_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "print_reservations_printer_id_fkey"
            columns: ["printer_id"]
            isOneToOne: false
            referencedRelation: "printers"
            referencedColumns: ["id"]
          },
        ]
      }
      printers: {
        Row: {
          cost_per_gram: number
          cost_per_hour: number
          created_at: string
          id: string
          is_available: boolean | null
          name: string
          type: Database["public"]["Enums"]["printer_type"]
        }
        Insert: {
          cost_per_gram?: number
          cost_per_hour?: number
          created_at?: string
          id?: string
          is_available?: boolean | null
          name: string
          type?: Database["public"]["Enums"]["printer_type"]
        }
        Update: {
          cost_per_gram?: number
          cost_per_hour?: number
          created_at?: string
          id?: string
          is_available?: boolean | null
          name?: string
          type?: Database["public"]["Enums"]["printer_type"]
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number
          stock: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price: number
          stock?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
          stock?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      robot_competitions: {
        Row: {
          competition_id: string
          created_at: string
          id: string
          notes: string | null
          result: string | null
          robot_id: string
        }
        Insert: {
          competition_id: string
          created_at?: string
          id?: string
          notes?: string | null
          result?: string | null
          robot_id: string
        }
        Update: {
          competition_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          result?: string | null
          robot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "robot_competitions_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "robot_competitions_robot_id_fkey"
            columns: ["robot_id"]
            isOneToOne: false
            referencedRelation: "robots"
            referencedColumns: ["id"]
          },
        ]
      }
      robot_owners: {
        Row: {
          created_at: string
          full_name: string
          id: string
          robot_id: string
          team_role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          robot_id: string
          team_role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          robot_id?: string
          team_role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "robot_owners_robot_id_fkey"
            columns: ["robot_id"]
            isOneToOne: false
            referencedRelation: "robots"
            referencedColumns: ["id"]
          },
        ]
      }
      robots: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          platform: string
          url: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          platform: string
          url: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          platform?: string
          url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "directiva"
      order_status: "pending" | "paid" | "delivered" | "cancelled"
      print_status:
        | "pending"
        | "approved"
        | "in_progress"
        | "completed"
        | "cancelled"
      printer_type: "filament" | "resin"
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
    Enums: {
      app_role: ["admin", "directiva"],
      order_status: ["pending", "paid", "delivered", "cancelled"],
      print_status: [
        "pending",
        "approved",
        "in_progress",
        "completed",
        "cancelled",
      ],
      printer_type: ["filament", "resin"],
    },
  },
} as const
