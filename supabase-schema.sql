-- TidyGuru Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Uploads table
CREATE TABLE uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  row_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales data table
CREATE TABLE sales_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  upload_id UUID REFERENCES uploads(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  product TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  refund DECIMAL(10, 2) NOT NULL DEFAULT 0,
  fees DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for uploads
CREATE POLICY "Users can view their own uploads"
  ON uploads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploads"
  ON uploads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads"
  ON uploads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads"
  ON uploads FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for sales_data
CREATE POLICY "Users can view their own sales data"
  ON sales_data FOR SELECT
  USING (
    upload_id IN (
      SELECT id FROM uploads WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own sales data"
  ON sales_data FOR INSERT
  WITH CHECK (
    upload_id IN (
      SELECT id FROM uploads WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own sales data"
  ON sales_data FOR DELETE
  USING (
    upload_id IN (
      SELECT id FROM uploads WHERE user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX idx_uploads_user_id ON uploads(user_id);
CREATE INDEX idx_uploads_created_at ON uploads(created_at DESC);
CREATE INDEX idx_sales_data_upload_id ON sales_data(upload_id);
CREATE INDEX idx_sales_data_date ON sales_data(date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for uploads table
CREATE TRIGGER update_uploads_updated_at
  BEFORE UPDATE ON uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

