// components/ui/pdfviewer.tsx

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Download } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

// Import PDF.js types
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/pdf';

if (typeof window !== 'undefined') {
  // Use the EXACT filename you copied, including .mjs
  pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
}

interface PDFViewerProps {
  pdfUrl: string | null; // Now accepts the direct URL from UploadThing
  projectData: any;
  partData: any;
  orderListData: any;
  isReadOnly: boolean;
  formDataMapping: Record<string, { source: string; field: string }>;
}

export function PDFViewer({
  pdfUrl,
  projectData,
  partData,
  orderListData,
  isReadOnly,
  formDataMapping,
}: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfLibDoc, setPdfLibDoc] = useState<PDFDocument | null>(null);
  const [pdfJsDoc, setPdfJsDoc] = useState<PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;

    const loadPDF = async () => {
      if (!pdfUrl) {
        setError('No PDF URL provided');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.status} ${response.statusText}`
          );
        }
        const existingPdfBytes = await response.arrayBuffer();

        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        setPdfLibDoc(pdfDoc);

        pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdfDocument = await loadingTask.promise;
        setPdfJsDoc(pdfDocument);
        setTotalPages(pdfDocument.numPages);
        setCurrentPage(1);
      } catch (err: any) {
        console.error('Error loading PDF:', err);
        if (isMounted) {
          setError(`Failed to load PDF file: ${err.message}`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPDF();
    return () => {
      isMounted = false;
    };
  }, [pdfUrl]);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfJsDoc || !canvasRef.current) return;

      try {
        const page = await pdfJsDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) {
          console.error('Could not get 2D context for canvas');
          return;
        }
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error('Error rendering page:', err);
      }
    };

    renderPage();
  }, [pdfJsDoc, currentPage, scale, isReadOnly]);

  useEffect(() => {
    if (!projectData || !partData || !orderListData) return;

    const mappedData: Record<string, string> = {};

    Object.entries(formDataMapping).forEach(([pdfField, mapping]) => {
      let value = '';

      switch (mapping.source) {
        case 'project':
          value = projectData[mapping.field] || '';
          break;
        case 'part':
          value = partData[mapping.field] || '';
          break;
        case 'orderList':
          value = orderListData[mapping.field] || '';
          break;
        case 'custom':
          if (mapping.field === 'currentDate') {
            value = new Date().toLocaleDateString();
          }
          break;
        default:
          break;
      }

      mappedData[pdfField] = value;
    });

    setFormData(mappedData);
  }, [projectData, partData, orderListData, formDataMapping]);

  const handleExport = async () => {
    if (!pdfUrl) return;

    setIsLoading(true);

    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF from URL: ${response.status}`);
      }

      const pdfBytes = await response.arrayBuffer();

      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      Object.entries(formData).forEach(([fieldName, value]) => {
        try {
          const field = form.getTextField(fieldName);
          if (field) {
            field.setText(value);
          }
        } catch (e) {
          console.warn(`Field ${fieldName} not found or not a text field`);
        }
      });

      form.flatten();

      const filledPdfBytes = await pdfDoc.save();

      const blob = new Blob([filledPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = pdfUrl.split('/').pop() || 'filled-form.pdf';
      link.download = `filled-${filename}`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setError('Failed to export the filled PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Loading PDF form...</p>
      </div>
    );
  }

  if (error || !pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold mb-2">PDF Form Not Available</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          {error || 'No PDF template has been uploaded for this product type.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between items-center w-full mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
          >
            Zoom Out
          </Button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 3.0}
          >
            Zoom In
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            Print
          </Button>
          <Button onClick={handleExport} disabled={isReadOnly}>
            <Download className="h-4 w-4 mr-2" />
            Export Filled PDF
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-auto w-full bg-white shadow-sm">
        <canvas ref={canvasRef} className="mx-auto" />
      </div>

      {isReadOnly && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
          This order list has been submitted and cannot be modified. You can
          still export or print the PDF.
        </div>
      )}
    </div>
  );
}