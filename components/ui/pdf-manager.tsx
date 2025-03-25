// components/ui/pdf-manager.tsx
import { useState } from "react";
import { PDFUploader } from "@/components/ui/pdf-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Trash, Download } from "lucide-react";

interface PDFManagerProps {
  manufacturer: string;
  productType: string;
  initialPdfUrl?: string;
  onPdfChange: (url: string | null) => void;
}

export function PDFManager({
  manufacturer,
  productType,
  initialPdfUrl,
  onPdfChange,
}: PDFManagerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(initialPdfUrl || null);
  const [pdfName, setPdfName] = useState<string | null>(null);

  const handleUploadComplete = (url: string, name: string) => {
    setPdfUrl(url);
    setPdfName(name);
    onPdfChange(url);
  };

  const handleRemove = () => {
    setPdfUrl(null);
    setPdfName(null);
    onPdfChange(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {pdfUrl ? "PDF Template" : "Upload PDF Template"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!pdfUrl ? (
          <PDFUploader onUploadComplete={handleUploadComplete} />
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium">{pdfName || `${manufacturer}-${productType}.pdf`}</p>
                <p className="text-sm text-muted-foreground">
                  {new URL(pdfUrl).pathname.split("/").pop()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(pdfUrl, "_blank")}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}