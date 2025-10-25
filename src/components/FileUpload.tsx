import { useCallback } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/config/env";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const { toast } = useToast();

  const validateAndUploadFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;

      // Check file size
      if (file.size > config.upload.maxFileSize) {
        toast({
          title: "File too large",
          description: `Please upload a CSV file smaller than ${config.upload.maxFileSizeMB}MB`,
          variant: "destructive",
        });
        return;
      }

      // Check file type
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
        return;
      }

      onFileUpload(file);
    },
    [onFileUpload, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      validateAndUploadFile(file);
    },
    [validateAndUploadFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      validateAndUploadFile(file);
    },
    [validateAndUploadFile]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        document.getElementById("file-upload")?.click();
      }
    },
    []
  );

  return (
    <div className="relative group">
      <div
        role="button"
        aria-label="Upload CSV file. Drop file here or click to browse"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onKeyDown={handleKeyDown}
        className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-2xl cursor-pointer bg-card hover:bg-primary/5 transition-all duration-300 border-border hover:border-primary/50 shadow-md hover:shadow-xl group-hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
          <div className="mb-4 p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors" aria-hidden="true">
            <Upload className="w-10 h-10 text-primary" />
          </div>
          <p className="mb-2 text-base font-medium text-foreground">
            <span className="font-semibold text-primary">Drop your sales CSV here</span> or click to upload
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            See insights in seconds
          </p>
          <p className="text-xs text-muted-foreground/70">
            Supports Shopify, Gumroad, Whop, Etsy, and more
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleFileInput}
          id="file-upload"
          aria-label="Select CSV file to upload"
        />
        <label
          htmlFor="file-upload"
          className="absolute inset-0 cursor-pointer"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
