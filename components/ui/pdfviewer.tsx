'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Download } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

// Import PDF.js types
import * as pdfjsLib from 'pdfjs-dist';
import {
  PDFDocumentProxy,
  PDFPageProxy,
} from 'pdfjs-dist/types/src/pdf';
// This would typically be imported from a config file
const PDF_CDN_URL = 'https://cdn.kung-gestion.com';

interface PDFViewerProps {
  manufacturer: string;
  productType: string;
  projectData: any;
  partData: any;
  orderListData: any;
  isReadOnly: boolean;
  formDataMapping: Record<string, { source: string; field: string }>;
}

export function PDFViewer({
  manufacturer,
  productType,
  projectData,
  partData,
  orderListData,
  isReadOnly,
  formDataMapping,
}: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Format manufacturer and product type for the URL
  useEffect(() => {
    if (manufacturer && productType) {
      // Convert to uppercase and replace spaces with hyphens
      const formattedManufacturer = manufacturer.toUpperCase().replace(
        /\s+/g,
        '-'
      );
      const formattedProductType = productType.toUpperCase().replace(
        /\s+/g,
        '-'
      );

      // Construct the PDF URL
      const url = `${PDF_CDN_URL}/${formattedManufacturer}-${formattedProductType}.pdf`;
      setPdfUrl(url);
    }
  }, [manufacturer, productType]);

  // Load the PDF when the URL changes
  useEffect(() => {
    const loadPDF = async () => {
      if (!pdfUrl) return;

      setIsLoading(true);
      setError(null);

      try {
        // Dynamically import PDF.js to avoid SSR issues
        // Set the worker source
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdfDocument = await loadingTask.promise;
        setPdf(pdfDocument);
        setTotalPages(pdfDocument.numPages);
        setCurrentPage(1);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError(
          'Failed to load PDF file. Please ensure the form template exists for this product type.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [pdfUrl]);

  // Render the current page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdf || !canvasRef.current) return;

      try {
        const page = await pdf.getPage(currentPage);
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

        // If not in read-only mode, extract and fill form fields
        if (!isReadOnly) {
          await extractFormFields(page);
        }
      } catch (err) {
        console.error('Error rendering page:', err);
      }
    };

    renderPage();
  }, [pdf, currentPage, scale, isReadOnly]);

  // Prepare data for form filling by mapping database fields to PDF form fields
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
        default:
          // Handle custom fields or calculations here
          break;
      }

      mappedData[pdfField] = value;
    });

    setFormData(mappedData);
  }, [projectData, partData, orderListData, formDataMapping]);

  // Extract form fields from the PDF
  const extractFormFields = async (page: PDFPageProxy) => {
    try {
      const annotations = await page.getAnnotations();
      const formFields = annotations.filter(
        (ann: any) => ann.subtype === 'Widget'
      );

      // Map form fields to their positions and types
      console.log('Form fields found:', formFields.length);
      formFields.forEach((field: any) => {
        console.log('Field:', field.fieldName, 'Type:', field.fieldType);
      });

      // In a real implementation, we would modify the PDF here to fill in the values
      // However, direct form field modification requires additional libraries
    } catch (err) {
      console.error('Error extracting form fields:', err);
    }
  };

  // Export the PDF with filled form fields
  const handleExport = async () => {
    if (!pdfUrl) return;

    setIsLoading(true);

    try {
      // Fetch the original PDF
      const response = await fetch(pdfUrl);
      const pdfBytes = await response.arrayBuffer();

      // Load the PDF with pdf-lib
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      // Fill in the form fields with our data
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

      // Flatten the form (make it non-editable)
      form.flatten();

      // Save the PDF
      const filledPdfBytes = await pdfDoc.save();

      // Create a download link
      const blob = new Blob([filledPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${manufacturer}-${productType}-filled.pdf`;
      link.click();

      // Clean up
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setError('Failed to export the filled PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Print the current view using browser's print functionality
  const handlePrint = () => {
    window.print();
  };

  // Handle page navigation
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

  // Handle zoom
  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p>Loading PDF form...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold mb-2">PDF Form Not Available</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          {error}
        </p>
        <Button
          variant="outline"
          onClick={() => window.open(pdfUrl, '_blank')}
          disabled={!pdfUrl}
        >
          Try Open Original PDF
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* PDF controls */}
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

      {/* PDF canvas */}
      <div className="border rounded-lg overflow-auto w-full bg-white shadow-sm">
        <canvas ref={canvasRef} className="mx-auto" />
      </div>

      {/* Read-only warning if applicable */}
      {isReadOnly && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
          This order list has been submitted and cannot be modified. You can
          still export or print the PDF.
        </div>
      )}
    </div>
  );
}
