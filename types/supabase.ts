// types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          project_number: string
          name: string
          address: string
          masonry_company: string | null
          architect: string | null
          engineer: string | null
          owner: string | null
          designer: string
          project_manager: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_number: string
          name: string
          address: string
          masonry_company?: string | null
          architect?: string | null
          engineer?: string | null
          owner?: string | null
          designer: string
          project_manager: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_number?: string
          name?: string
          address?: string
          masonry_company?: string | null
          architect?: string | null
          engineer?: string | null
          owner?: string | null
          designer?: string
          project_manager?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      project_parts: {
        Row: {
          id: string
          project_id: string
          part_number: string
          name: string
          designer: string
          project_manager: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          part_number: string
          name: string
          designer: string
          project_manager: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          part_number?: string
          name?: string
          designer?: string
          project_manager?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_parts_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      order_lists: {
        Row: {
          id: string
          part_id: string
          list_number: string
          name: string
          manufacturer: string
          type: string
          designer: string
          project_manager: string
          status: string
          submission_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          part_id: string
          list_number: string
          name: string
          manufacturer: string
          type: string
          designer: string
          project_manager: string
          status?: string
          submission_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          part_id?: string
          list_number?: string
          name?: string
          manufacturer?: string
          type?: string
          designer?: string
          project_manager?: string
          status?: string
          submission_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_lists_part_id_fkey"
            columns: ["part_id"]
            referencedRelation: "project_parts"
            referencedColumns: ["id"]
          }
        ]
      }
      items: {
        Row: {
          id: string
          order_list_id: string
          position: number
          article: string
          quantity: number
          type: string
          specifications: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_list_id: string
          position: number
          article: string
          quantity?: number
          type: string
          specifications?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_list_id?: string
          position?: number
          article?: string
          quantity?: number
          type?: string
          specifications?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "items_order_list_id_fkey"
            columns: ["order_list_id"]
            referencedRelation: "order_lists"
            referencedColumns: ["id"]
          }
        ]
      }
      companies: {
        Row: {
          id: string
          name: string
          street: string
          postal_code: string
          city: string
          country: string
          phone: string | null
          email: string | null
          type: string
          user_id: string // Changed from UUID to string to accommodate Clerk IDs
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          street: string
          postal_code: string
          city: string
          country?: string
          phone?: string | null
          email?: string | null
          type: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          street?: string
          postal_code?: string
          city?: string
          country?: string
          phone?: string | null
          email?: string | null
          type?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [] // Updated to remove the foreign key relationship that no longer exists
      }
      // Add this new table definition
      pdf_templates: {
        Row: {
          id: string
          manufacturer: string
          product_type: string
          pdf_url: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          manufacturer: string
          product_type: string
          pdf_url?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          manufacturer?: string
          product_type?: string
          pdf_url?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      list_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          fields: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          fields: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          fields?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      manufacturers: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_types: {
        Row: {
          id: string
          manufacturer_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          manufacturer_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          manufacturer_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_types_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          type_id: string
          code: string
          name: string
          description: string | null
          specifications: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type_id: string
          code: string
          name: string
          description?: string | null
          specifications?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type_id?: string
          code?: string
          name?: string
          description?: string | null
          specifications?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_type_id_fkey"
            columns: ["type_id"]
            referencedRelation: "product_types"
            referencedColumns: ["id"]
          }
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
  }
}

// Helper types for database rows
export type DbProject = Database['public']['Tables']['projects']['Row']
export type DbProjectPart = Database['public']['Tables']['project_parts']['Row']
export type DbOrderList = Database['public']['Tables']['order_lists']['Row']
export type DbItem = Database['public']['Tables']['items']['Row']
export type DbCompany = Database['public']['Tables']['companies']['Row']
export type DbManufacturer = Database['public']['Tables']['manufacturers']['Row']
export type DbProductType = Database['public']['Tables']['product_types']['Row']
export type DbProduct = Database['public']['Tables']['products']['Row']

// Helper types for database inserts
export type DbProjectInsert = Database['public']['Tables']['projects']['Insert']
export type DbProjectPartInsert = Database['public']['Tables']['project_parts']['Insert']
export type DbOrderListInsert = Database['public']['Tables']['order_lists']['Insert']
export type DbItemInsert = Database['public']['Tables']['items']['Insert']
export type DbCompanyInsert = Database['public']['Tables']['companies']['Insert']
export type DbManufacturerInsert = Database['public']['Tables']['manufacturers']['Insert']
export type DbProductTypeInsert = Database['public']['Tables']['product_types']['Insert']
export type DbProductInsert = Database['public']['Tables']['products']['Insert']

// Helper types for database updates
export type DbProjectUpdate = Database['public']['Tables']['projects']['Update']
export type DbProjectPartUpdate = Database['public']['Tables']['project_parts']['Update']
export type DbOrderListUpdate = Database['public']['Tables']['order_lists']['Update']
export type DbItemUpdate = Database['public']['Tables']['items']['Update']
export type DbCompanyUpdate = Database['public']['Tables']['companies']['Update']
export type DbManufacturerUpdate = Database['public']['Tables']['manufacturers']['Update']
export type DbProductTypeUpdate = Database['public']['Tables']['product_types']['Update']
export type DbProductUpdate = Database['public']['Tables']['products']['Update']