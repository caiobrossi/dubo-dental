export interface Database {
  public: {
    Tables: {
      procedures: {
        Row: {
          id: string;
          name: string;
          category: string;
          price: number;
          estimated_time: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          category: string;
          price: number;
          estimated_time: string;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          category?: string;
          price?: number;
          estimated_time?: string;
          is_active?: boolean;
        };
      };
      insurance_plans: {
        Row: {
          id: string;
          name: string;
          type: string;
          description?: string;
          coverage_percentage?: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          type: string;
          description?: string;
          coverage_percentage?: number;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          type?: string;
          description?: string;
          coverage_percentage?: number;
          is_active?: boolean;
        };
      };
      inventory: {
        Row: {
          id: string;
          name: string;
          category: string;
          quantity: number;
          min_stock: number;
          price: number;
          supplier?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          category: string;
          quantity: number;
          min_stock: number;
          price: number;
          supplier?: string;
        };
        Update: {
          name?: string;
          category?: string;
          quantity?: number;
          min_stock?: number;
          price?: number;
          supplier?: string;
        };
      };
    };
  };
}