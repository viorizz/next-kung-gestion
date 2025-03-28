// components/ui/pdfviewer.tsx

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  FileText,
  Download,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { PDFDocument, PDFTextField } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/pdf';
import Link from 'next/link';
import { toast } from 'sonner';

// Set worker path ONLY in the browser
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;
}

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

  // Helper function to access nested properties using dot notation
  const getNestedProperty = (obj: any, path: string): any => {
    if (!obj || !path) return '';
    return path.split('.').reduce((prev, curr) => 
      prev && prev[curr] !== undefined ? prev[curr] : null, obj);
  };
  
  // Helper function to format address fields
  const formatAddress = (address: string | null | undefined): string => {
    return address || '';
  };
  
  // Helper function to format city with postal code
  const formatCity = (postalCode: string | null | undefined, city: string | null | undefined): string => {
    if (!postalCode && !city) return '';
    if (!postalCode) return city || '';
    if (!city) return postalCode || '';
    return `CH-${postalCode} ${city}`;
  };

  // Memoize formData calculation
  const formData = useMemo(() => {
    console.log('[PDFViewer useMemo] Calculating formData. Inputs:', { 
      projectData, 
      partData, 
      orderListData,
      formDataMapping 
    });

    if (!projectData || !partData || !orderListData) {
      console.warn('[PDFViewer] Missing data for form mapping');
      return {};
    }

    // Extra debug logs for company objects
    console.log('Engineer object:', projectData.engineer);
    console.log('Masonry Company object:', projectData.masonryCompany);

    const mappedData: Record<string, string> = {};
    Object.entries(formDataMapping).forEach(([pdfField, mapping]) => {
      let value: any = '';
      try {
        console.log(`[PDFViewer] Processing field mapping: ${pdfField} -> ${mapping.source}.${mapping.field}`);

        switch (mapping.source) {
          case 'project':
            value = getNestedProperty(projectData, mapping.field);
            console.log(`  -> Source 'project', Field '${mapping.field}', Value:`, value);
            break;
          case 'part':
            value = getNestedProperty(partData, mapping.field);
            console.log(`  -> Source 'part', Field '${mapping.field}', Value:`, value);
            break;
          case 'orderList':
            value = getNestedProperty(orderListData, mapping.field);
            console.log(`  -> Source 'orderList', Field '${mapping.field}', Value:`, value);
            break;
          case 'custom':
            if (mapping.field === 'currentDate') {
              value = new Date().toLocaleDateString();
            }
            // --- Logic for compositePartNumber ---
            else if (mapping.field === 'compositePartNumber') {
              const projNum = projectData?.projectNumber ?? '??';
              const partNum = partData?.partNumber ?? '??';
              value = `${projNum}-${partNum}`;
              console.log(`  -> Custom compositePartNumber: ${projNum}-${partNum}`);
            }
            // --- Logic for compositeOrderListNumber ---
            else if (mapping.field === 'compositeOrderListNumber') {
              const projNum = projectData?.projectNumber ?? '??';
              const partNum = partData?.partNumber ?? '??';
              const listNum = orderListData?.listNumber ?? '??';
              value = `${projNum}-${partNum}.${listNum}`;
              console.log(`  -> Custom compositeOrderListNumber: ${projNum}-${partNum}.${listNum}`);
            }
            // --- Engineer Address Formatting ---
            else if (mapping.field === 'engineerFormattedAddress') {
              console.log('Engineer street data:', projectData?.engineer?.street);
              const address = projectData?.engineer?.street;
              value = formatAddress(address);
              console.log(`  -> Custom engineerFormattedAddress: ${value}`);
            }
            // --- Engineer City with Postal Code Formatting ---
            else if (mapping.field === 'engineerFormattedCity') {
              console.log('Engineer postal/city data:', projectData?.engineer?.postalCode, projectData?.engineer?.city);
              const postalCode = projectData?.engineer?.postalCode;
              const city = projectData?.engineer?.city;
              value = formatCity(postalCode, city);
              console.log(`  -> Custom engineerFormattedCity: ${value}`);
            }
            // --- Masonry Address Formatting ---
            else if (mapping.field === 'masonryFormattedAddress') {
              console.log('Masonry street data:', projectData?.masonryCompany?.street);
              const address = projectData?.masonryCompany?.street;
              value = formatAddress(address);
              console.log(`  -> Custom masonryFormattedAddress: ${value}`);
            }
            // --- Masonry City with Postal Code Formatting ---
            else if (mapping.field === 'masonryFormattedCity') {
              console.log('Masonry postal/city data:', projectData?.masonryCompany?.postalCode, projectData?.masonryCompany?.city);
              const postalCode = projectData?.masonryCompany?.postalCode;
              const city = projectData?.masonryCompany?.city;
              value = formatCity(postalCode, city);
              console.log(`  -> Custom masonryFormattedCity: ${value}`);
            }
            // Log the final custom value
            console.log(`  -> Source 'custom', Field '${mapping.field}', Final Value:`, value);
            break;
          default:
            console.warn(`[PDFViewer] Unknown source type: ${mapping.source}`);
            break;
        }
        mappedData[pdfField] =
          value !== null && value !== undefined ? String(value) : '';
      } catch (e) {
        console.error(`[PDFViewer] Error processing field mapping for ${pdfField}:`, e);
        mappedData[pdfField] = '';
      }
    });
    console.log('[PDFViewer useMemo] Calculated formData:', mappedData);
    return mappedData;
  }, [projectData, partData, orderListData, formDataMapping]);

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
          pdfDocument.destroy();
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
      pdfJsDoc?.destroy();
    };
  }, [pdfUrl]);

  // --- PDF Rendering Effect ---
  const renderPage = useCallback(
    async (pageNum: number, pdfDoc: PDFDocumentProxy | null) => {
      console.log(
        `[PDFViewer renderPage] Attempting to render page ${pageNum}`
      );

      if (!canvasRef.current) {
        console.warn(
          `[PDFViewer renderPage] Aborted page ${pageNum}: canvasRef.current is null. Canvas may not be rendered yet.`
        );
        return;
      }

      const canvas = canvasRef.current;

      if (!pdfDoc) {
        console.warn(
          `[PDFViewer renderPage] Aborted page ${pageNum}: pdfDoc is null.`
        );
        return;
      }

      setIsLoading(true);
      try {
        const page: PDFPageProxy = await pdfDoc.getPage(pageNum);
        console.log(
          `[PDFViewer renderPage] Got page ${pageNum}, scale: ${scale}`
        );
        const viewport = page.getViewport({ scale });

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
        setError(null);
      } catch (err: any) {
        console.error(`[PDFViewer renderPage] Error rendering page ${pageNum}:`, err);
        setError(`Failed to render page ${pageNum}: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [scale]
  );

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
  }, [pdfJsDoc, currentPage, renderPage]);

  // --- Export Handler ---
  const handleExport = async () => {
    console.log('[PDFViewer handleExport] Starting export...');
    if (!pdfUrl || !pdfJsDoc) {
      console.warn('[PDFViewer handleExport] Aborted: Missing pdfUrl or pdfJsDoc');
      return;
    }

    setIsExporting(true);
    setError(null);

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

      console.log('[PDFViewer handleExport] Flattening form...');
      form.flatten();

      console.log('[PDFViewer handleExport] Saving flattened PDF bytes...');
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
          filename = `filled-${decodeURIComponent(originalName)}`;
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