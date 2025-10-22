import { useCallback } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const { toast } = useToast();

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type === "text/csv") {
        onFileUpload(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
      }
    },
    [onFileUpload, toast]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileUpload(file);
      }
    },
    [onFileUpload]
  );

  return (
    <div className="relative group">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-2xl cursor-pointer bg-card hover:bg-primary/5 transition-all duration-300 border-border hover:border-primary/50 shadow-md hover:shadow-xl group-hover:scale-[1.02]"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
          <div className="mb-4 p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Upload className="w-10 h-10 text-primary" />
          </div>
          <p className="mb-2 text-base font-medium text-foreground">
            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm text-muted-foreground">
            CSV files from Shopify, Gumroad, Whop, Etsy, and more
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleFileInput}
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="absolute inset-0 cursor-pointer"
        />
      </div>
    </div>
  );
};
