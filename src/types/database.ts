// Supabase database types

export interface Upload {
  id: string;
  user_id: string;
  filename: string;
  row_count: number;
  created_at: string;
  updated_at: string;
}

export interface SalesDataRow {
  id: string;
  upload_id: string;
  date: string;
  product: string;
  amount: number;
  refund: number;
  fees: number;
  quantity: number;
  raw_data: Record<string, string | number>;
  created_at: string;
}

export interface UploadWithData extends Upload {
  sales_data?: SalesDataRow[];
}

