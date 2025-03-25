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
import { PlusIcon, Loader2, FileText, Trash2, Download } from 'lucide-react';
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
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);
  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      manufacturer: '',
      productType: '',
    },
  });

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

  const handleUploadComplete = (url: string, name: string) => {
    setUploadedPdfUrl(url);
    setUploadedPdfName(name);
  };

  const handleRemoveTemplate = async (templateId: string) => {
    if (!user) return;

    if (!confirm('Are you sure you want to remove this template?')) {
      return;
    }

    try {
      await pdfTemplateService.deleteTemplate(templateId);
      toast.success('Template removed successfully');
      fetchTemplates(); // Refresh the list
    } catch (error) {
      console.error('Error removing template:', error);
      toast.error('An error occurred while removing the template');
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!uploadedPdfUrl) {
      toast.error('Please upload a PDF template first');
      return;
    }
    
    try {
      if (!user) return;
      
      await pdfTemplateService.createTemplate(
        values.manufacturer,
        values.productType,
        uploadedPdfUrl,
        user.id
      );
      
      setIsAddDialogOpen(false);
      toast.success(
        `Template created for ${values.manufacturer} / ${values.productType}`
      );
      fetchTemplates(); // Refresh the list
      
      // Reset form and uploaded PDF
      form.reset();
      setUploadedPdfUrl(null);
      setUploadedPdfName(null);
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
        <div className="text-center py-12 border rounded-lg bg-card">
          <p className="text-muted-foreground">
            No PDF templates found. Click the button above to add your first template.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <Card key={template.id} className="bg-card hover:bg-accent/10 transition-colors">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle className="text-xl">
                    {template.manufacturer} - {template.productType}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Added: {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-blue-500" />
                    <span className="text-sm">
                      {template.pdfUrl ? 
                        new URL(template.pdfUrl).pathname.split('/').pop() :
                        'No PDF uploaded'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {template.pdfUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(template.pdfUrl as string, "_blank")}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Update PDF
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update PDF Template</DialogTitle>
                          <DialogDescription>
                            Upload a new PDF for {template.manufacturer} - {template.productType}
                          </DialogDescription>
                        </DialogHeader>
                        <PDFUploader 
                          onUploadComplete={(url, name) => {
                            pdfTemplateService.updateTemplate(template.id, url)
                              .then(() => {
                                toast.success('Template updated successfully');
                                fetchTemplates();
                              })
                              .catch(err => {
                                console.error('Update failed:', err);
                                toast.error('Failed to update template');
                              });
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Template</DialogTitle>
            <DialogDescription>
              Configure the manufacturer and product type to attach a new
              template.
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
              
              {/* Add PDF Upload component */}
              <FormItem>
                <FormLabel>PDF Template</FormLabel>
                <PDFUploader onUploadComplete={handleUploadComplete} />
                {uploadedPdfUrl && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {uploadedPdfName || 'PDF'} uploaded successfully
                  </p>
                )}
                <FormDescription>
                  Upload a PDF form template with fillable fields
                </FormDescription>
              </FormItem>
              
              <Button type="submit" disabled={!uploadedPdfUrl}>
                Create Template
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}