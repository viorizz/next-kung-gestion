// components/ui/pdf-uploader.tsx
import { useState, useCallback } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, FileText, Check, X } from "lucide-react";

interface PDFUploaderProps {
  onUploadComplete: (url: string, name: string) => void;
  className?: string;
}

export function PDFUploader({ onUploadComplete, className }: PDFUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const { startUpload, isUploading } = useUploadThing("pdfUploader", {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        // Call the callback with the URL and name of the uploaded file
        onUploadComplete(res[0].url, res[0].name);
        // Reset the file state
        setFile(null);
        setProgress(0);
      }
    },
    onUploadProgress: (progress) => {
      setProgress(progress);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setFile(null);
      setProgress(0);
    },
  });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    }
  }, []);

  const handleUpload = useCallback(() => {
    if (file) {
      startUpload([file]);
    }
  }, [file, startUpload]);

  const handleCancel = useCallback(() => {
    setFile(null);
    setProgress(0);
  }, []);

  return (
    <div className={`flex flex-col items-center gap-4 ${className || ""}`}>
      {!file ? (
        <>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload PDF</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF (MAX. 8MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </label>
        </>
      ) : (
        <div className="w-full p-4 border rounded-lg bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium truncate max-w-[200px]">
                {file.name}
              </span>
            </div>
            {!isUploading && (
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {isUploading ? (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          ) : (
            <Button
              onClick={handleUpload}
              className="w-full mt-2"
              size="sm"
            >
              Upload PDF
            </Button>
          )}
        </div>
      )}

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uploading... {progress}%</span>
        </div>
      )}
    </div>
  );
}