import { supabase } from "@/lib/supabase";
import { Upload, SalesDataRow, UploadWithData } from "@/types/database";
import { SalesData } from "@/utils/csvParser";

export const uploadService = {
  // Create a new upload and save sales data
  async createUpload(
    filename: string,
    salesData: SalesData[]
  ): Promise<Upload | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not authenticated");

      // Create upload record
      const { data: upload, error: uploadError } = await supabase
        .from("uploads")
        .insert({
          user_id: user.id,
          filename,
          row_count: salesData.length,
        })
        .select()
        .single();

      if (uploadError) throw uploadError;

      // Prepare sales data for insertion
      const salesDataRows = salesData.map((row) => ({
        upload_id: upload.id,
        date: row.date.toISOString().split("T")[0], // Convert to YYYY-MM-DD
        product: row.product,
        amount: row.amount,
        refund: row.refund,
        fees: row.fees,
        quantity: row.quantity || 1,
        raw_data: row.rawData,
      }));

      // Insert sales data in batches (Supabase has a limit)
      const batchSize = 1000;
      for (let i = 0; i < salesDataRows.length; i += batchSize) {
        const batch = salesDataRows.slice(i, i + batchSize);
        const { error: dataError } = await supabase
          .from("sales_data")
          .insert(batch);

        if (dataError) throw dataError;
      }

      return upload;
    } catch (error) {
      console.error("Error creating upload:", error);
      return null;
    }
  },

  // Get all uploads for current user
  async getUploads(): Promise<Upload[]> {
    try {
      const { data, error } = await supabase
        .from("uploads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching uploads:", error);
      return [];
    }
  },

  // Get a single upload with its sales data
  async getUploadWithData(uploadId: string): Promise<UploadWithData | null> {
    try {
      const { data: upload, error: uploadError } = await supabase
        .from("uploads")
        .select("*")
        .eq("id", uploadId)
        .single();

      if (uploadError) throw uploadError;

      const { data: salesData, error: salesError } = await supabase
        .from("sales_data")
        .select("*")
        .eq("upload_id", uploadId)
        .order("date", { ascending: true });

      if (salesError) throw salesError;

      return {
        ...upload,
        sales_data: salesData || [],
      };
    } catch (error) {
      console.error("Error fetching upload with data:", error);
      return null;
    }
  },

  // Get sales data for an upload
  async getSalesData(uploadId: string): Promise<SalesData[]> {
    try {
      const { data, error } = await supabase
        .from("sales_data")
        .select("*")
        .eq("upload_id", uploadId)
        .order("date", { ascending: true });

      if (error) throw error;

      // Convert back to SalesData format
      return (data || []).map((row) => ({
        date: new Date(row.date),
        product: row.product,
        amount: row.amount,
        refund: row.refund,
        fees: row.fees,
        quantity: row.quantity || 1,
        rawData: row.raw_data as Record<string, string | number>,
      }));
    } catch (error) {
      console.error("Error fetching sales data:", error);
      return [];
    }
  },

  // Delete an upload and its sales data
  async deleteUpload(uploadId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("uploads")
        .delete()
        .eq("id", uploadId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting upload:", error);
      return false;
    }
  },

  // Rename an upload
  async renameUpload(uploadId: string, newFilename: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("uploads")
        .update({ filename: newFilename })
        .eq("id", uploadId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error renaming upload:", error);
      return false;
    }
  },
};

