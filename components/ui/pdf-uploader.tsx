// components/ui/pdf-uploader.tsx
import { useState, useCallback } from 'react';
import { useUploadThing } from '@/lib/uploadthing';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, FileText, X } from 'lucide-react'; // Removed Check icon as it wasn't used

interface PDFUploaderProps {
  onUploadComplete: (url: string, name: string) => void;
  className?: string;
}

export function PDFUploader({ onUploadComplete, className }: PDFUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const { startUpload, isUploading } = useUploadThing('pdfUploader', {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        // Call the callback with the URL and name of the uploaded file
        onUploadComplete(res[0].url, res[0].name);
        // Reset the file state after successful upload and callback
        setFile(null);
        setProgress(0);
      } else {
        // Handle cases where upload completes but response is unexpected
        console.error('Upload completed but no result received.');
        // Optionally show an error message to the user
        setFile(null); // Still reset file
        setProgress(0);
      }
    },
    onUploadProgress: (progress) => {
      setProgress(progress);
    },
    onUploadError: (error) => {
      // Provide more context for the error
      console.error('Upload error:', error.message, error);
      // Optionally show a user-friendly error message via toast or state
      alert(`Upload failed: ${error.message}`); // Simple alert for now
      setFile(null);
      setProgress(0);
    },
  });

  // Removed isValidJson and formSchema - they don't belong here

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        if (selectedFile.type === 'application/pdf') {
          // Reset progress if a new file is selected
          setProgress(0);
          setFile(selectedFile);
        } else {
          // Inform user about invalid file type
          alert('Invalid file type. Please select a PDF file.');
          e.target.value = ''; // Clear the input
        }
      }
    },
    []
  ); // Empty dependency array is correct here

  const handleUpload = useCallback(() => {
    if (file && !isUploading) {
      // Reset progress before starting upload
      setProgress(0);
      startUpload([file]);
    }
  }, [file, startUpload, isUploading]); // Added isUploading dependency

  const handleCancel = useCallback(() => {
    // Should we cancel the ongoing upload? useUploadThing doesn't expose a cancel method easily.
    // For now, just reset the UI state.
    setFile(null);
    setProgress(0);
    // If you need true cancellation, you might need AbortController, which uploadthing might not support directly.
  }, []);

  return (
    <div className={`flex flex-col items-center gap-4 ${className || ''}`}>
      {!file ? (
        <>
          <label
            htmlFor="pdf-upload-input" // Added htmlFor and id for accessibility
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-accent/50"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold text-primary">
                  Click to upload PDF
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">PDF (MAX. 8MB)</p>
            </div>
            <input
              id="pdf-upload-input" // Added id
              type="file"
              className="hidden"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={isUploading} // Disable input while uploading
            />
          </label>
        </>
      ) : (
        <div className="w-full p-4 border rounded-lg bg-background">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <span
                className="text-sm font-medium truncate"
                title={file.name} // Add title for full name on hover
              >
                {file.name}
              </span>
            </div>
            {/* Show cancel button only if not currently uploading */}
            {!isUploading && (
              <button
                onClick={handleCancel}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Remove selected file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Show progress bar OR upload button */}
          {isUploading ? (
            <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          ) : (
            <Button
              onClick={handleUpload}
              className="w-full mt-2"
              size="sm"
              disabled={isUploading} // Disable button while uploading
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload PDF
            </Button>
          )}
        </div>
      )}

      {/* Show textual progress indicator */}
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Uploading... {progress}%</span>
        </div>
      )}
    </div>
  );
}
