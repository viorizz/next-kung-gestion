// app/(dashboard)/projects/[id]/parts/[partId]/order-lists/[orderListId]/client.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  PlusIcon,
  Edit,
  Calendar,
  User,
  Building2,
  Package,
  ArrowLeft,
  FileText,
  Download,
  Briefcase,
  Phone,
  MapPin,
} from 'lucide-react';
import { orderListService } from '@/lib/services/orderListService';
import { itemService } from '@/lib/services/itemService';
import { OrderList } from '@/types/orderList';
import { Item } from '@/types/item';
import { OrderListDialog } from '@/components/ui/orderlistdialog';
import { ItemDialog } from '@/components/ui/itemdialog';
import { ItemTable } from '@/components/ui/itemtable';
import { PDFViewer } from '@/components/ui/pdfviewer';
import { toast } from 'sonner';
import Link from 'next/link';
import { projectService } from '@/lib/services/projectService';
import { projectPartService } from '@/lib/services/projectPartService';
import pdfTemplateService from '@/lib/services/pdfTemplateService';
import { PdfTemplate } from '@/types/pdfTemplate';
import { Company } from '@/types/company'; // Import Company type
import { EnrichedProjectData } from '@/types/project'; // Import EnrichedProjectData

interface OrderListDetailClientProps {
  projectId: string;
  partId: string;
  orderListId: string;
}

type FormMapping = Record<string, { source: string; field: string }>;

export function OrderListDetailClient({
  projectId,
  partId,
  orderListId,
}: OrderListDetailClientProps) {
  const { user, isLoaded } = useUser();
  // Use the imported type instead of defining locally
  const [project, setProject] = useState<EnrichedProjectData | null>(null);
  const [projectPart, setProjectPart] = useState<any>(null);
  const [orderList, setOrderList] = useState<OrderList | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [activeTab, setActiveTab] = useState('items');
  const [pdfTemplate, setPdfTemplate] = useState<PdfTemplate | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user, orderListId]);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    setPdfTemplate(null);
    setProject(null);
    setProjectPart(null);
    try {
      const orderListData = await orderListService.getOrderList(orderListId);
      setOrderList(orderListData);

      const itemsData = await itemService.getItems(orderListId);
      setItems(itemsData);

      const partData = await projectPartService.getProjectPart(partId);
      setProjectPart(partData);

      // Remove the explicit type annotation that's causing the conflict
      const enrichedProjectData = await projectService.getProject(partData.projectId);
      setProject(enrichedProjectData);

      if (orderListData.manufacturer && orderListData.type) {
        const template =
          await pdfTemplateService.getTemplateByManufacturerAndType(
            orderListData.manufacturer,
            orderListData.type,
            user.id,
          );
        setPdfTemplate(template || null);
      } else {
        console.warn('Order list is missing manufacturer or type.');
        setPdfTemplate(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('An error occurred while loading data');
      setPdfTemplate(null);
      setProject(null);
      setProjectPart(null);
      setOrderList(null);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

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

  // formMapping and pdfUrl derivation (using useMemo)
  const formMapping: FormMapping = useMemo(() => {
    if (!pdfTemplate?.fieldMapping) return {};
    try {
      const parsedMapping = JSON.parse(pdfTemplate.fieldMapping);
      if (typeof parsedMapping === 'object' && parsedMapping !== null) {
        return parsedMapping as FormMapping;
      }
      console.warn(
        'Invalid JSON format in fieldMapping:',
        pdfTemplate.fieldMapping,
      );
      toast.warning('PDF field mapping is invalid. Check template settings.');
      return {};
    } catch (error) {
      console.error('Error parsing fieldMapping JSON:', error);
      toast.error('Failed to parse PDF field mapping.');
      return {};
    }
  }, [pdfTemplate]);

  const pdfUrl = pdfTemplate?.pdfUrl || null;
  const showPdfViewer = !!pdfUrl;

  // formData calculation
  const formData = useMemo(() => {
    console.log('[PDFViewer useMemo] Calculating formData. Inputs:', { 
      project, 
      projectPart, 
      orderList,
      formMapping 
    });

    if (!project || !projectPart || !orderList) {
      console.warn('[PDFViewer] Missing data for form mapping');
      return {};
    }

    console.log('Engineer object:', project.engineer);
    console.log('Masonry Company object:', project.masonryCompany);

    const mappedData: Record<string, string> = {};
    Object.entries(formMapping).forEach(([pdfField, mapping]) => {
      let value: any = '';
      try {
        console.log(`[PDFViewer] Processing field mapping: ${pdfField} -> ${mapping.source}.${mapping.field}`);

        switch (mapping.source) {
          case 'project':
            value = getNestedProperty(project, mapping.field);
            console.log(`  -> Source 'project', Field '${mapping.field}', Value:`, value);
            break;
          case 'part':
            value = getNestedProperty(projectPart, mapping.field);
            console.log(`  -> Source 'part', Field '${mapping.field}', Value:`, value);
            break;
          case 'orderList':
            value = getNestedProperty(orderList, mapping.field);
            console.log(`  -> Source 'orderList', Field '${mapping.field}', Value:`, value);
            break;
          case 'custom':
            if (mapping.field === 'currentDate') {
              value = new Date().toLocaleDateString();
            }
            else if (mapping.field === 'compositePartNumber') {
              const projNum = project?.projectNumber ?? '??';
              const partNum = projectPart?.partNumber ?? '??';
              value = `${projNum}-${partNum}`;
              console.log(`  -> Custom compositePartNumber: ${projNum}-${partNum}`);
            }
            else if (mapping.field === 'compositeOrderListNumber') {
              const projNum = project?.projectNumber ?? '??';
              const partNum = projectPart?.partNumber ?? '??';
              const listNum = orderList?.listNumber ?? '??';
              value = `${projNum}-${partNum}.${listNum}`;
              console.log(`  -> Custom compositeOrderListNumber: ${projNum}-${partNum}.${listNum}`);
            }
            else if (mapping.field === 'engineerFormattedAddress') {
              console.log('Engineer address data:', project?.engineer?.street, project?.engineer?.address);
              const address = project?.engineer?.street || project?.engineer?.address;
              value = formatAddress(address);
              console.log(`  -> Custom engineerFormattedAddress: ${value}`);
            }
            else if (mapping.field === 'engineerFormattedCity') {
              console.log('Engineer postal/city data:', project?.engineer?.postalCode, project?.engineer?.city);
              const postalCode = project?.engineer?.postalCode;
              const city = project?.engineer?.city;
              value = formatCity(postalCode, city);
              console.log(`  -> Custom engineerFormattedCity: ${value}`);
            }
            else if (mapping.field === 'masonryFormattedAddress') {
              console.log('Masonry address data:', project?.masonryCompany?.street, project?.masonryCompany?.address);
              const address = project?.masonryCompany?.street || project?.masonryCompany?.address;
              value = formatAddress(address);
              console.log(`  -> Custom masonryFormattedAddress: ${value}`);
            }
            else if (mapping.field === 'masonryFormattedCity') {
              console.log('Masonry postal/city data:', project?.masonryCompany?.postalCode, project?.masonryCompany?.city);
              const postalCode = project?.masonryCompany?.postalCode;
              const city = project?.masonryCompany?.city;
              value = formatCity(postalCode, city);
              console.log(`  -> Custom masonryFormattedCity: ${value}`);
            }
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
  }, [project, projectPart, orderList, formMapping]);

  // Rest of your component methods...
  const handleUpdateOrderList = async (
    updatedOrderList: Partial<OrderList>,
  ) => {
    if (!user || !orderList) return;
    try {
      const result = await orderListService.updateOrderList(
        orderListId,
        updatedOrderList,
      );
      if (
        updatedOrderList.manufacturer !== orderList.manufacturer ||
        updatedOrderList.type !== orderList.type
      ) {
        toast.info('Manufacturer/Type changed, reloading data...');
        fetchData();
      } else {
        setOrderList(result);
        toast.success('Order list updated successfully');
      }
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating order list:', error);
      toast.error('An error occurred while updating the order list');
    }
  };

  const handleAddItem = async (item: Partial<Item>) => {
    if (!user || !orderList) return;
    try {
      const newItem = { ...item, orderListId };
      const result = await itemService.createItem(newItem);
      setItems((prevItems) => [...prevItems, result]);
      toast.success('Item added successfully');
      setIsAddItemDialogOpen(false);
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('An error occurred while adding the item');
    }
  };

  const handleUpdateItem = async (item: Partial<Item>) => {
    if (!user || !editingItem) return;
    try {
      const result = await itemService.updateItem(editingItem.id, item);
      setItems((prevItems) =>
        prevItems.map((i) => (i.id === editingItem.id ? result : i)),
      );
      toast.success('Item updated successfully');
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('An error occurred while updating the item');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!user) return;
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await itemService.deleteItem(itemId);
      setItems((prevItems) => prevItems.filter((i) => i.id !== itemId));
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('An error occurred while deleting the item');
    }
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
  };

  const handleSubmitOrderList = async () => {
    if (!user || !orderList) return;
    if (
      !confirm(
        'Are you sure you want to submit this order list? This action cannot be undone easily.',
      )
    )
      return;
    try {
      const result = await orderListService.submitOrderList(orderListId);
      setOrderList(result);
      toast.success('Order list submitted successfully');
    } catch (error) {
      console.error('Error submitting order list:', error);
      toast.error('An error occurred while submitting the order list');
    }
  };

  const formatDate = (dateString: string | null | undefined | Date): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusBadgeColor = (status: string = 'unknown'): string => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'approved':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!orderList) {
    return (
      <div className="p-6">
        <div className="text-center py-12 border rounded-lg bg-card">
          <p className="text-muted-foreground mb-4">
            The requested order list was not found or could not be loaded.
          </p>
          <Link href={`/projects/${projectId}/parts/${partId}`}>
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Project Part
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Rest of your JSX remains the same... */}
      {/* I'll omit the JSX for brevity since it doesn't need changes */}
    </div>
  );
}