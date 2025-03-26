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
import { PDFUploader } from '@/components/ui/pdf-uploader';
import {
  PlusIcon,
  Loader2,
  FileText,
  Trash2,
  Download,
  Pencil,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Link from 'next/link';
import { PdfTemplate } from '@/types/pdfTemplate';
// Assuming PdfTemplate type includes:
// interface PdfTemplate {
//   id: string;
//   manufacturer: string;
//   productType: string;
//   pdfUrl: string | null;
//   userId: string;
//   createdAt?: string | Date;
//   updatedAt?: string | Date;
//   fieldMapping?: string | null; // Ensure this is part of the type
// }
import pdfTemplateService from '@/lib/services/pdfTemplateService';

// --- Schema Definitions (Outside Component) ---

const isValidJson = (value: string | undefined): boolean => {
  if (!value || value.trim() === '') return true;
  try {
    JSON.parse(value);
    return true;
  } catch (e) {
    return false;
  }
};

const formSchema = z.object({
  manufacturer: z.string().min(2, {
    message: 'Manufacturer must be at least 2 characters.',
  }),
  productType: z.string().min(2, {
    message: 'Product Type must be at least 2 characters.',
  }),
  fieldMapping: z
    .string()
    .optional()
    .refine(isValidJson, {
      message: 'Field Mapping must be valid JSON or empty.',
    }),
});

const mappingSchema = z.object({
  fieldMapping: z
    .string()
    .optional()
    .refine(isValidJson, {
      message: 'Field Mapping must be valid JSON or empty.',
    }),
});

// --- Component Definition ---

export default function PdfTemplatesPage() {
  const { user, isLoaded } = useUser();
  const [templates, setTemplates] = useState<PdfTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);
  const [editingMappingTemplate, setEditingMappingTemplate] =
    useState<PdfTemplate | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      manufacturer: '',
      productType: '',
      fieldMapping: '',
    },
  });

  const mappingForm = useForm<z.infer<typeof mappingSchema>>({
    resolver: zodResolver(mappingSchema),
    defaultValues: {
      fieldMapping: '',
    },
  });

  useEffect(() => {
    if (isLoaded && user) {
      fetchTemplates();
    }
  }, [isLoaded, user]);

  useEffect(() => {
    if (editingMappingTemplate) {
      mappingForm.reset({
        fieldMapping: editingMappingTemplate.fieldMapping || '',
      });
    }
  }, [editingMappingTemplate, mappingForm]);

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

  const handleUploadComplete = (url: string, name: string) => {
    setUploadedPdfUrl(url);
    setUploadedPdfName(name);
  };

  const handleRemoveTemplate = async (templateId: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to remove this template?')) return;

    try {
      await pdfTemplateService.deleteTemplate(templateId);
      toast.success('Template removed successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error removing template:', error);
      toast.error('An error occurred while removing the template');
    }
  };

  // onSubmit for CREATING a new template
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!uploadedPdfUrl) {
      toast.error('Please upload a PDF template first');
      return;
    }
    if (!user) return;

    try {
      // ***** ATTENTION: Error ts(2554) occurs here *****
      // This means your `createTemplate` service function needs to be updated
      // to accept the 5th argument (`fieldMapping`).
      // The call below is CORRECT based on the requirement.
      // You MUST modify the function definition in `pdfTemplateService`.
      await pdfTemplateService.createTemplate(
        values.manufacturer,
        values.productType,
        uploadedPdfUrl,
        user.id,
        values.fieldMapping // The 5th argument causing the error until the service is updated
      );

      setIsAddDialogOpen(false);
      toast.success(
        `Template created for ${values.manufacturer} / ${values.productType}`
      );
      fetchTemplates();
      form.reset();
      setUploadedPdfUrl(null);
      setUploadedPdfName(null);
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    }
  };

  // onMappingSubmit for UPDATING the mapping of an existing template
  const onMappingSubmit = async (values: z.infer<typeof mappingSchema>) => {
    if (!editingMappingTemplate) return;

    try {
      // ***** ATTENTION: Error ts(2345) might occur here *****
      // This call assumes `updateTemplate` accepts an ID and a partial update object.
      // e.g., updateTemplate(id: string, updates: Partial<PdfTemplate>)
      // If you still get ts(2345), it means the TYPE DEFINITION for
      // `updateTemplate` is incorrect and expects a string as the second argument.
      // You need to fix the type definition to match the partial update pattern.
      const updates: Partial<PdfTemplate> = {
        fieldMapping: values.fieldMapping || null, // Send null if empty
      };
      await pdfTemplateService.updateTemplate(
        editingMappingTemplate.id,
        updates // Pass the partial update object
      );

      toast.success('Field mapping updated successfully');
      setEditingMappingTemplate(null);
      fetchTemplates();
    } catch (error) {
      console.error('Error updating mapping:', error);
      toast.error('Failed to update field mapping');
    }
  };

  const getPdfFileName = (url: string | null | undefined): string => {
    if (!url) return 'No PDF uploaded';
    try {
      const path = new URL(url).pathname;
      const parts = path.split('/');
      return decodeURIComponent(parts[parts.length - 1] || 'PDF File');
    } catch (e) {
      console.warn('Could not parse PDF URL for filename:', url);
      return 'PDF File';
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
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add New Template
        </Button>
      </div>

      {/* PDF Template List */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : templates.length === 0 ? (
        // ... No templates message ...
        <div className="text-center py-12 border rounded-lg bg-card">
          <p className="text-muted-foreground">
            No PDF templates found. Click the button above to add your first
            template.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="bg-card hover:bg-accent/10 transition-colors"
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-xl">
                    {template.manufacturer} - {template.productType}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Added:{' '}
                    {template.createdAt
                      ? new Date(template.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="h-6 w-6 text-blue-500 flex-shrink-0" />
                    <span
                      className="text-sm truncate"
                      title={getPdfFileName(template.pdfUrl)}
                    >
                      {getPdfFileName(template.pdfUrl)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {template.pdfUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(template.pdfUrl as string, '_blank')
                        }
                      >
                        <Download className="h-4 w-4 mr-1" />
                        View PDF
                      </Button>
                    )}
                    {/* Update PDF Dialog Trigger */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4 mr-1" />
                          Update PDF
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update PDF Template</DialogTitle>
                          <DialogDescription>
                            Upload a new PDF for {template.manufacturer} -{' '}
                            {template.productType}. This will replace the
                            existing one.
                          </DialogDescription>
                        </DialogHeader>
                        <PDFUploader
                          onUploadComplete={(url, name) => {
                            // ***** ATTENTION: Error ts(2345) might occur here *****
                            // This call assumes `updateTemplate` accepts an ID and a partial update object.
                            // If you still get ts(2345), fix the TYPE DEFINITION for `updateTemplate`.
                            const updates: Partial<PdfTemplate> = {
                              pdfUrl: url,
                            };
                            pdfTemplateService
                              .updateTemplate(template.id, updates) // Pass partial update object
                              .then(() => {
                                toast.success('PDF updated successfully');
                                fetchTemplates();
                              })
                              .catch((err) => {
                                console.error('Update failed:', err);
                                toast.error('Failed to update PDF');
                              });
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                    {/* Edit Mapping Dialog Trigger */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingMappingTemplate(template)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit Mapping
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Template Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        {/* ... DialogContent for Add New Template ... */}
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Template</DialogTitle>
            <DialogDescription>
              Configure manufacturer, product type, upload a PDF, and optionally
              define field mappings.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 pt-4"
            >
              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Schöck" {...field} />
                    </FormControl>
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
                      <Input placeholder="e.g., Isokorb T" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>PDF Template File</FormLabel>
                <PDFUploader onUploadComplete={handleUploadComplete} />
                {uploadedPdfUrl && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {uploadedPdfName || 'PDF'} uploaded successfully.
                  </p>
                )}
                <FormDescription>
                  Upload the fillable PDF form provided by the manufacturer.
                </FormDescription>
                {!uploadedPdfUrl && form.formState.isSubmitted && (
                  <p className="text-sm text-destructive mt-1">
                    PDF upload is required.
                  </p>
                )}
              </FormItem>

              <FormField
                control={form.control}
                name="fieldMapping"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field Mapping (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{\n  "pdfFieldName1": { "source": "project", "field": "name" },\n  "pdfFieldName2": { "source": "orderList", "field": "designer" },\n  "dateField": { "source": "custom", "field": "currentDate" }\n}'
                        className="min-h-[150px] font-mono text-sm"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Define mappings between PDF fields and data
                      sources (project, part, orderList, custom). Use valid
                      JSON format or leave empty.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!uploadedPdfUrl || form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Template
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Mapping Dialog */}
      <Dialog
        open={editingMappingTemplate !== null}
        onOpenChange={(open) => !open && setEditingMappingTemplate(null)}
      >
        {/* ... DialogContent for Edit Mapping ... */}
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Field Mapping</DialogTitle>
            <DialogDescription>
              Update the JSON mapping for{' '}
              <span className="font-semibold">
                {editingMappingTemplate?.manufacturer}
              </span>{' '}
              -{' '}
              <span className="font-semibold">
                {editingMappingTemplate?.productType}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <Form {...mappingForm}>
            <form
              onSubmit={mappingForm.handleSubmit(onMappingSubmit)}
              className="space-y-4 pt-4"
            >
              <FormField
                control={mappingForm.control}
                name="fieldMapping"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field Mapping (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{\n  "pdfFieldName1": { "source": "project", "field": "name" }\n}'
                        className="min-h-[250px] font-mono text-sm"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Define mappings between PDF fields and data sources. Use
                      valid JSON format or leave empty to clear mapping.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingMappingTemplate(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={mappingForm.formState.isSubmitting}
                >
                  {mappingForm.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Mapping
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
