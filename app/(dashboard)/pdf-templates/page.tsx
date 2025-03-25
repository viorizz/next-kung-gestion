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
import { PDFManager } from '@/components/ui/pdf-manager';
import { PDFUploader } from '@/components/ui/pdf-uploader'; 
import { PlusIcon, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Link from 'next/link';
import { PdfTemplate } from '@/types/pdfTemplate';
import pdfTemplateService from '@/lib/services/pdfTemplateService';

// Add state for the uploaded PDF URL
const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);

const formSchema = z.object({
  manufacturer: z.string().min(2, {
    message: 'Manufacturer must be at least 2 characters.',
  }),
  productType: z.string().min(2, {
    message: 'Product Type must be at least 2 characters.',
  }),
});

export default function PdfTemplatesPage() {
  const { user, isLoaded } = useUser();
  const [templates, setTemplates] = useState<PdfTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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
      const data = await pdfTemplateService.getTemplates(user.id);
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching PDF templates:', error);
      toast.error('An error occurred while loading PDF templates');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for when upload is complete
const handleUploadComplete = (url: string, name: string) => {
  setUploadedPdfUrl(url);
  setUploadedPdfName(name);
};

  const handlePdfChange = async (
    manufacturer: string,
    productType: string,
    newPdfUrl: string | null
  ) => {
    if (!user) return;

    try {
      if (!newPdfUrl) {
        // Handle the case where the PDF URL is being removed
        const templateToDelete = templates.find(
          (t) =>
            t.manufacturer === manufacturer && t.productType === productType
        );
        if (templateToDelete) {
          await pdfTemplateService.updateTemplate(templateToDelete.id, null); // Set pdfUrl to null
          setTemplates((prev) =>
            prev.map((t) =>
              t.id === templateToDelete.id ? { ...t, pdfUrl: null } : t
            )
          );
          toast.success('PDF Template removed successfully');
        } else {
          toast.error('Template not found');
        }
        return;
      }
      
      // Check if a template already exists for this manufacturer and product type
      let existingTemplate = await pdfTemplateService.getTemplateByManufacturerAndType(
        manufacturer,
        productType,
        user.id
      );

      if (existingTemplate) {
        // Update the existing template
        const updatedTemplate = await pdfTemplateService.updateTemplate(
          existingTemplate.id,
          newPdfUrl || null
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
          newPdfUrl,
          user.id
        );
        setTemplates((prev) => [...prev, newTemplate]);
        toast.success('PDF Template added successfully');
      }
      fetchTemplates();
    } catch (error) {
      console.error('Error saving PDF template:', error);
      toast.error('An error occurred while saving the PDF template');
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      manufacturer: '',
      productType: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!uploadedPdfUrl) {
      toast.error('Please upload a PDF template first');
      return;
    }
    
    try {
      await pdfTemplateService.createTemplate(
        values.manufacturer,
        values.productType,
        uploadedPdfUrl,
        user!.id
      );
      
      setIsAddDialogOpen(false);
      toast.success(
        `Template created for ${values.manufacturer} / ${values.productType}`
      );
      fetchTemplates(); // Refresh the list
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    }
  };

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
          // Modify the dialog content in the PDF Templates page
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Template</DialogTitle>
                <DialogDescription>
                  Configure the manufacturer and product type to attach a new template.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="manufacturer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manufacturer</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Corp" {...field} />
                        </FormControl>
                        <FormDescription>
                          What is the manufacturer name?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="productType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Valve" {...field} />
                        </FormControl>
                        <FormDescription>What is the product type?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Add PDF Upload component here */}
                  <FormItem>
                    <FormLabel>PDF Template</FormLabel>
                    <PDFUploader onUploadComplete={handleUploadComplete} />
                    <FormDescription>
                      Upload a PDF form template with fillable fields
                    </FormDescription>
                  </FormItem>
                  
                  <Button type="submit">Submit</Button>
                </form>
              </Form>
            </DialogContent>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}