// components/ui/pdfviewer.tsx

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'; // Added useMemo
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Loader2,
  FileText,
  Download,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { PDFDocument, PDFTextField } from 'pdf-lib'; // Import PDFTextField
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/pdf';

interface PDFViewerProps {
  pdfUrl: string | null;
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
  // --- CONSOLE LOG: Log received props ---
  console.log('[PDFViewer Props]', {
    pdfUrl,
    projectData,
    partData,
    orderListData,
    isReadOnly,
    formDataMapping,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfJsDoc, setPdfJsDoc] = useState<PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isExporting, setIsExporting] = useState(false);

  // Memoize formData calculation
  const formData = useMemo(() => {
    // --- CONSOLE LOG: Log inputs for formData calculation ---
    console.log('[PDFViewer useMemo] Calculating formData. Inputs:', {
      formDataMapping,
      projectData,
      partData,
      orderListData,
    });

    if (!projectData || !partData || !orderListData) {
      console.warn(
        '[PDFViewer useMemo] Skipping formData calculation: Missing data objects'
      );
      return {};
    }

    const mappedData: Record<string, string> = {};
    Object.entries(formDataMapping).forEach(([pdfField, mapping]) => {
      let value: any = '';
      try {
        // --- CONSOLE LOG: Log each mapping entry ---
        console.log(
          `[PDFViewer useMemo] Processing mapping for PDF Field: "${pdfField}"`,
          mapping
        );

        switch (mapping.source) {
          // Ensure these cases match your JSON 'source' values ('project' vs 'projects', etc.)
          case 'project': // Assuming singular based on prop name
            value = projectData?.[mapping.field];
            console.log(
              `  -> Source 'project', Field '${mapping.field}', Value:`,
              value
            );
            break;
          case 'part': // Assuming singular based on prop name
            value = partData?.[mapping.field];
            console.log(
              `  -> Source 'part', Field '${mapping.field}', Value:`,
              value
            );
            break;
          case 'orderList': // Assuming singular based on prop name
            value = orderListData?.[mapping.field];
            console.log(
              `  -> Source 'orderList', Field '${mapping.field}', Value:`,
              value
            );
            break;
          case 'custom':
            if (mapping.field === 'currentDate') {
              value = new Date().toLocaleDateString();
            }
            console.log(
              `  -> Source 'custom', Field '${mapping.field}', Value:`,
              value
            );
            break;
          default:
            console.warn(
              `  -> Unknown mapping source: "${mapping.source}" for PDF field "${pdfField}"`
            );
            break;
        }
        // Convert value to string, handle null/undefined
        mappedData[pdfField] =
          value !== null && value !== undefined ? String(value) : '';
      } catch (e) {
        console.error(
          `[PDFViewer useMemo] Error accessing data for PDF field "${pdfField}" with mapping`,
          mapping,
          e
        );
        mappedData[pdfField] = ''; // Default to empty string on error
      }
    });
    // --- CONSOLE LOG: Log the final calculated formData object ---
    console.log('[PDFViewer useMemo] Calculated formData:', mappedData);
    return mappedData;
  }, [projectData, partData, orderListData, formDataMapping]); // Dependencies for useMemo

  // --- PDF Loading Effect ---
  useEffect(() => {
    let isMounted = true;
    const loadPDF = async () => {
      console.log('[PDFViewer useEffect loadPDF] Attempting to load:', pdfUrl);
      if (!pdfUrl) {
        setError('No PDF URL provided.');
        setIsLoading(false);
        setPdfJsDoc(null);
        setTotalPages(0);
        setCurrentPage(1);
        console.log('[PDFViewer useEffect loadPDF] Aborted: No URL');
        return;
      }

      setIsLoading(true);
      setError(null);
      setPdfJsDoc(null);

      try {
        console.log('[PDFViewer useEffect loadPDF] Fetching URL:', pdfUrl);
        const response = await fetch(pdfUrl);
        console.log(
          '[PDFViewer useEffect loadPDF] Fetch response status:',
          response.status
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `[PDFViewer useEffect loadPDF] Fetch failed: ${response.status} ${response.statusText}`,
            errorText
          );
          throw new Error(
            `Failed to fetch PDF: ${response.status} ${response.statusText}`
          );
        }
        const pdfData = await response.arrayBuffer();
        console.log(
          '[PDFViewer useEffect loadPDF] Fetched PDF data (bytes):',
          pdfData.byteLength
        );

        console.log('[PDFViewer useEffect loadPDF] Loading document with PDF.js');
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdfDocument = await loadingTask.promise;
        console.log(
          '[PDFViewer useEffect loadPDF] PDF.js document loaded, pages:',
          pdfDocument.numPages
        );

        if (isMounted) {
          setPdfJsDoc(pdfDocument);
          setTotalPages(pdfDocument.numPages);
          setCurrentPage(1);
        } else {
          console.log(
            '[PDFViewer useEffect loadPDF] Component unmounted before setting state'
          );
          pdfDocument.destroy(); // Clean up if unmounted
        }
      } catch (err: any) {
        console.error('[PDFViewer useEffect loadPDF] Detailed error:', err);
        if (isMounted) {
          if (err.message?.includes('CORS')) {
            setError(
              'Failed to load PDF due to CORS policy. Check server configuration (UploadThing) and browser console.'
            );
          } else if (err.message?.includes('Invalid PDF')) {
            setError('Failed to load PDF: Invalid or corrupted file.');
          } else if (err.message?.includes('worker')) {
            // Specific error for worker issues
            setError(
              `Failed to load PDF worker: ${err.message}. Ensure '/pdf.worker.min.mjs' is in the public folder and accessible.`
            );
          } else {
            setError(`Failed to load PDF: ${err.message}`);
          }
          setPdfJsDoc(null);
          setTotalPages(0);
          setCurrentPage(1);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          console.log('[PDFViewer useEffect loadPDF] Loading finished.');
        }
      }
    };

    loadPDF();

    return () => {
      console.log('[PDFViewer useEffect loadPDF] Cleanup: Unmounting');
      isMounted = false;
      pdfJsDoc?.destroy(); // Cleanup PDF.js document
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl]); // Re-run only when pdfUrl changes

  // --- PDF Rendering Effect ---
  const renderPage = useCallback(
    async (pageNum: number, pdfDoc: PDFDocumentProxy | null) => {
      console.log(
        `[PDFViewer renderPage] Attempting to render page ${pageNum}`
      );
      if (!pdfDoc || !canvasRef.current) {
        console.warn(
          `[PDFViewer renderPage] Aborted: Missing pdfDoc or canvasRef`
        );
        return;
      }

      setIsLoading(true); // Show loading indicator during render
      try {
        const page: PDFPageProxy = await pdfDoc.getPage(pageNum);
        console.log(
          `[PDFViewer renderPage] Got page ${pageNum}, scale: ${scale}`
        );
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) {
          console.error(
            '[PDFViewer renderPage] Could not get 2D context for canvas'
          );
          setError('Failed to render PDF: Canvas context unavailable.');
          setIsLoading(false);
          return;
        }
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        console.log(
          `[PDFViewer renderPage] Canvas size set: ${canvas.width}x${canvas.height}`
        );

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        console.log(`[PDFViewer renderPage] Rendering page ${pageNum}...`);
        await page.render(renderContext).promise;
        console.log(`[PDFViewer renderPage] Page ${pageNum} rendered.`);
        setError(null); // Clear previous render errors
      } catch (err: any) {
        console.error(`[PDFViewer renderPage] Error rendering page ${pageNum}:`, err);
        setError(`Failed to render page ${pageNum}: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [scale]
  ); // Dependency on scale

  useEffect(() => {
    if (pdfJsDoc) {
      console.log(
        `[PDFViewer useEffect render] Triggering render for page ${currentPage}`
      );
      renderPage(currentPage, pdfJsDoc);
    } else {
      console.log(
        `[PDFViewer useEffect render] Skipping render: pdfJsDoc not available`
      );
    }
  }, [pdfJsDoc, currentPage, renderPage]); // renderPage is memoized

  // --- Export Handler ---
  const handleExport = async () => {
    console.log('[PDFViewer handleExport] Starting export...');
    if (!pdfUrl || !pdfJsDoc) {
      console.warn('[PDFViewer handleExport] Aborted: Missing pdfUrl or pdfJsDoc');
      return;
    }

    setIsExporting(true);
    setError(null);

    // --- CONSOLE LOG: Log formData being used for export ---
    console.log('[PDFViewer handleExport] Using formData:', formData);

    try {
      console.log('[PDFViewer handleExport] Fetching original PDF bytes...');
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF for export: ${response.status}`);
      }
      const pdfBytes = await response.arrayBuffer();
      console.log('[PDFViewer handleExport] Loading PDF with pdf-lib...');
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();
      console.log('[PDFViewer handleExport] pdf-lib form loaded.');

      // Fill form fields using the memoized formData
      Object.entries(formData).forEach(([fieldName, value]) => {
        try {
          // --- CONSOLE LOG: Log field filling attempt ---
          console.log(
            `[PDFViewer handleExport] Attempting to fill field "${fieldName}" with value: "${value}"`
          );
          const field = form.getField(fieldName);
          if (field) {
            if (field instanceof PDFTextField) {
              field.setText(value);
              console.log(`  -> Field "${fieldName}" set successfully.`);
            } else {
              console.warn(
                `  -> Field "${fieldName}" found, but it's not a TextField. Type: ${field.constructor.name}. Filling not implemented for this type.`
              );
              // Add handling for Checkbox, Dropdown etc. if needed
              // e.g., if (field instanceof PDFCheckBox) { field.check(); }
            }
          } else {
            console.warn(`  -> Field "${fieldName}" not found in PDF form.`);
          }
        } catch (e) {
          console.error(
            `[PDFViewer handleExport] Error processing field "${fieldName}":`,
            e
          );
        }
      });

      // Optional: Flatten form
      // console.log('[PDFViewer handleExport] Flattening form...');
      // form.flatten();

      console.log('[PDFViewer handleExport] Saving filled PDF bytes...');
      const filledPdfBytes = await pdfDoc.save();
      console.log(
        '[PDFViewer handleExport] Saved bytes length:',
        filledPdfBytes.byteLength
      );

      const blob = new Blob([filledPdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);

      let filename = 'filled-form.pdf';
      try {
        const path = new URL(pdfUrl).pathname;
        const parts = path.split('/');
        const originalName = parts[parts.length - 1];
        if (originalName) {
          filename = `filled-${decodeURIComponent(originalName)}`; // Decode filename
        }
      } catch { /* ignore URL parsing errors */ }

      link.download = filename;
      document.body.appendChild(link);
      console.log('[PDFViewer handleExport] Triggering download:', filename);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      console.log('[PDFViewer handleExport] Export finished.');
    } catch (err: any) {
      console.error('[PDFViewer handleExport] Error during export:', err);
      setError(`Failed to export filled PDF: ${err.message}`);
      toast.error('Failed to export filled PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  // --- Navigation and Zoom Handlers ---
  const goToPreviousPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const zoomIn = () => setScale((s) => Math.min(3.0, s + 0.2));
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.2));

  // --- Render Logic ---
  // ... (Rest of the JSX rendering logic remains the same) ...
  // ... (Loading indicators, error messages, canvas, toolbar) ...

  if (!pdfUrl && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-6 border rounded-lg bg-card">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-bold mb-2">PDF Form Not Loaded</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          No PDF template is associated with this order list item.
        </p>
        <Link href="/pdf-templates">
          <Button variant="outline">Manage PDF Templates</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center border rounded-lg p-4 bg-muted/20">
      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center w-full mb-4 gap-4">
        {/* Pagination */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage <= 1 || isLoading}
            aria-label="Previous Page"
          >
            Previous
          </Button>
          <span className="text-sm tabular-nums">
            Page {currentPage} of {totalPages || '?'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages || isLoading}
            aria-label="Next Page"
          >
            Next
          </Button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={zoomOut}
            disabled={scale <= 0.5 || isLoading}
            aria-label="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm tabular-nums w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={zoomIn}
            disabled={scale >= 3.0 || isLoading}
            aria-label="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExport}
            disabled={isReadOnly || isLoading || !!error || isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export Filled PDF
          </Button>
        </div>
      </div>

      {/* Loading / Error / Canvas */}
      <div className="w-full overflow-auto bg-white shadow-sm flex justify-center items-center min-h-[500px]">
        {isLoading && (
          <div className="flex flex-col items-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <span>Loading PDF...</span>
          </div>
        )}
        {error && !isLoading && (
          <div className="flex flex-col items-center text-destructive text-center p-4">
            <FileText className="h-12 w-12 mb-2" />
            <span className="font-semibold">Error Loading PDF</span>
            <p className="text-sm max-w-md">{error}</p>
          </div>
        )}
        {!isLoading && !error && pdfJsDoc && (
          <canvas ref={canvasRef} className="pdf-canvas" />
        )}
      </div>

      {isReadOnly && !isLoading && !error && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-200 rounded-md text-yellow-800 text-sm w-full text-center">
          This order list is submitted (read-only). You can view and export the
          PDF, but changes require reverting the status.
        </div>
      )}
    </div>
  );
}
