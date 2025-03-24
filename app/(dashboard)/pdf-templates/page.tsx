// app/(dashboard)/pdf-templates/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PDFManager } from '@/components/ui/pdf-manager'; // Assuming this is where you put PDFManager
import { PlusIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

// Define a type or interface for your PDF template data
interface PdfTemplate {
  id: string;
  manufacturer: string;
  productType: string;
  pdfUrl: string | null;
  // Add other relevant fields, like createdBy, createdAt, etc.
}

// Placeholder service functions - replace with your actual data access logic
const pdfTemplateService = {
  getTemplates: async (): Promise<PdfTemplate[]> => {
    // Replace with your actual data fetching logic
    // This is just a placeholder
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [];
  },
  createTemplate: async (
    manufacturer: string,
    productType: string,
    pdfUrl: string
  ): Promise<PdfTemplate> => {
    // Replace with your actual data creation logic
    // This is just a placeholder
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      id: Math.random().toString(),
      manufacturer,
      productType,
      pdfUrl,
    };
  },
  updateTemplate: async (
    id: string,
    pdfUrl: string
  ): Promise<PdfTemplate> => {
    // Replace with your actual data update logic
    // This is just a placeholder
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      id,
      manufacturer: 'Example Manufacturer', // Replace with actual logic
      productType: 'Example Product Type', // Replace with actual logic
      pdfUrl,
    };
  },
};

export default function PdfTemplatesPage() {
  const { user, isLoaded } = useUser();
  const [templates, setTemplates] = useState<PdfTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<
    PdfTemplate | null
  >(null);

  useEffect(() => {
    // Fetch templates when user is loaded
    if (isLoaded && user) {
      fetchTemplates();
    }
  }, [isLoaded, user]);

  const fetchTemplates = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const data = await pdfTemplateService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching PDF templates:', error);
      toast.error('An error occurred while loading PDF templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfChange = async (
    manufacturer: string,
    productType: string,
    newPdfUrl: string | null
  ) => {
    if (!user) return;

    try {
      // Check if a template already exists for this manufacturer and product type
      const existingTemplate = templates.find(
        (t) =>
          t.manufacturer === manufacturer && t.productType === productType
      );

      if (existingTemplate) {
        // Update the existing template
        const updatedTemplate = await pdfTemplateService.updateTemplate(
          existingTemplate.id,
          newPdfUrl || ''
        );
        setTemplates((prev) =>
          prev.map((t) => (t.id === updatedTemplate.id ? updatedTemplate : t))
        );
        toast.success('PDF Template updated successfully');
      } else {
        // Create a new template
        if (!newPdfUrl) {
          toast.error('No PDF URL to save');
          return;
        }
        const newTemplate = await pdfTemplateService.createTemplate(
          manufacturer,
          productType,
          newPdfUrl
        );
        setTemplates((prev) => [...prev, newTemplate]);
        toast.success('PDF Template added successfully');
      }
    } catch (error) {
      console.error('Error saving PDF template:', error);
      toast.error('An error occurred while saving the PDF template');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>{' '}
        /{' '}
        <Link href="/admin" className="hover:underline">
          Admin
        </Link>{' '}
        / PDF Templates
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">PDF Templates</h1>
      </div>

      {/* PDF Template List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <PDFManager
            key={template.id}
            manufacturer={template.manufacturer}
            productType={template.productType}
            initialPdfUrl={template.pdfUrl || undefined}
            onPdfChange={(url) =>
              handlePdfChange(template.manufacturer, template.productType, url)
            }
          />
        ))}

        {/* Add New PDF Template - Static Card with Button */}
        <Card className="border-dashed border-2 border-gray-300 hover:border-primary transition-colors">
          <CardContent className="flex items-center justify-center p-6">
            <Button variant="ghost" onClick={() => {}}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}