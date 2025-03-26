// app/(dashboard)/projects/[id]/parts/[partId]/order-lists/[orderListId]/client.tsx

'use client';

import { useState, useEffect, useMemo } from 'react'; // Added useMemo
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
} from 'lucide-react';
import { orderListService } from '@/lib/services/orderListService';
import { itemService } from '@/lib/services/itemService';
import { OrderList } from '@/types/orderList';
import { Item } from '@/types/item';
import { OrderListDialog } from '@/components/ui/orderlistdialog';
import { ItemDialog } from '@/components/ui/itemdialog';
import { ItemTable } from '@/components/ui/itemtable';
import { PDFViewer } from '@/components/ui/pdfviewer';
// REMOVED: import { getFormMapping, applyFormMapping } from '@/lib/pdf/formMapping';
import { toast } from 'sonner';
import Link from 'next/link';
import { projectService } from '@/lib/services/projectService';
import { projectPartService } from '@/lib/services/projectPartService';
import pdfTemplateService from '@/lib/services/pdfTemplateService';
import { PdfTemplate } from '@/types/pdfTemplate'; // Import PdfTemplate type

interface OrderListDetailClientProps {
  projectId: string;
  partId: string;
  orderListId: string;
}

// Define a type for the parsed mapping
type FormMapping = Record<string, { source: string; field: string }>;

export function OrderListDetailClient({
  projectId,
  partId,
  orderListId,
}: OrderListDetailClientProps) {
  const { user, isLoaded } = useUser();
  const [project, setProject] = useState<any>(null);
  const [projectPart, setProjectPart] = useState<any>(null);
  const [orderList, setOrderList] = useState<OrderList | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [activeTab, setActiveTab] = useState('items');
  const [pdfTemplate, setPdfTemplate] = useState<PdfTemplate | null>(null); // State to store the fetched template object

  // Removed separate pdfUrl and formMapping states

  useEffect(() => {
    if (isLoaded && user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user, orderListId]); // Keep dependencies minimal

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    setPdfTemplate(null); // Reset template on each fetch
    try {
      // Fetch order list details
      const orderListData = await orderListService.getOrderList(orderListId);
      setOrderList(orderListData);

      // Fetch items for this order list
      const itemsData = await itemService.getItems(orderListId);
      setItems(itemsData);

      // Fetch project part details
      const partData = await projectPartService.getProjectPart(partId);
      setProjectPart(partData);

      // Fetch project details
      const projectData = await projectService.getProject(partData.projectId);
      setProject(projectData);

      // Fetch the template including the mapping, if manufacturer/type exist
      if (orderListData.manufacturer && orderListData.type) {
        const template =
          await pdfTemplateService.getTemplateByManufacturerAndType(
            orderListData.manufacturer,
            orderListData.type,
            user.id // Assuming service needs userId for authorization
          );
        setPdfTemplate(template || null); // Store the fetched template (or null if not found)
      } else {
        console.warn('Order list is missing manufacturer or type.');
        setPdfTemplate(null); // Ensure template is null if info is missing
      }

      // REMOVED: Old local getFormMapping logic
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('An error occurred while loading data');
      setPdfTemplate(null); // Ensure template is null on error
    } finally {
      setIsLoading(false);
    }
  };

  // Use useMemo to parse the mapping only when the template changes
  const formMapping: FormMapping = useMemo(() => {
    if (!pdfTemplate?.fieldMapping) {
      return {}; // No template or no mapping defined
    }
    try {
      // Parse the JSON string from the template
      const parsedMapping = JSON.parse(pdfTemplate.fieldMapping);
      // Basic validation: ensure it's a non-null object
      if (typeof parsedMapping === 'object' && parsedMapping !== null) {
        return parsedMapping as FormMapping;
      }
      console.warn(
        'Invalid JSON format in fieldMapping:',
        pdfTemplate.fieldMapping
      );
      toast.warning('PDF field mapping is invalid. Check template settings.');
      return {}; // Return empty object on invalid format
    } catch (error) {
      console.error('Error parsing fieldMapping JSON:', error);
      toast.error('Failed to parse PDF field mapping.');
      return {}; // Return empty object on parsing error
    }
  }, [pdfTemplate]); // Re-run only when pdfTemplate changes

  // Derive PDF URL directly from the fetched template state
  const pdfUrl = pdfTemplate?.pdfUrl || null;

  // Determine if PDF viewer should be shown based on derived URL
  const showPdfViewer = !!pdfUrl;

  // Handler for updating the order list
  const handleUpdateOrderList = async (
    updatedOrderList: Partial<OrderList> // Accept partial updates
  ) => {
    if (!user || !orderList) return;

    try {
      const result = await orderListService.updateOrderList(
        orderListId,
        updatedOrderList
      );

      // IMPORTANT: If manufacturer or type changed, we MUST refetch all data
      // because the associated PDF template might have changed.
      if (
        updatedOrderList.manufacturer !== orderList.manufacturer ||
        updatedOrderList.type !== orderList.type
      ) {
        toast.info('Manufacturer/Type changed, reloading data...');
        fetchData(); // Refetch everything including the new template
      } else {
        // Otherwise, just update the order list state locally
        setOrderList(result);
        toast.success('Order list updated successfully');
      }
      setIsEditDialogOpen(false); // Close dialog on success
    } catch (error) {
      console.error('Error updating order list:', error);
      toast.error('An error occurred while updating the order list');
    }
  };

  // --- Other handlers (handleAddItem, handleUpdateItem, etc.) remain the same ---
  // (Assuming they don't need direct access to pdfUrl or formMapping)
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
        prevItems.map((i) => (i.id === editingItem.id ? result : i))
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
        'Are you sure you want to submit this order list? This action cannot be undone easily.'
      )
    )
      return;
    try {
      const result = await orderListService.submitOrderList(orderListId);
      setOrderList(result); // Update status locally
      toast.success('Order list submitted successfully');
    } catch (error) {
      console.error('Error submitting order list:', error);
      toast.error('An error occurred while submitting the order list');
    }
  };

  // --- Helper functions ---
  const formatDate = (dateString: string | null | undefined | Date) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  const getStatusBadgeColor = (status: string = 'unknown') => {
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

  // --- Render logic ---
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
          <p className="text-muted-foreground">
            The requested order list was not found or you don't have access to
            it.
          </p>
          <Link href={`/projects/${projectId}/parts/${partId}`}>
            <Button className="mt-4">
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
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-4">
        <Link href="/dashboard" className="hover:underline">
          Dashboard
        </Link>
        {' / '}
        <Link href="/projects" className="hover:underline">
          Projects
        </Link>
        {' / '}
        <Link href={`/projects/${projectId}`} className="hover:underline">
          {project?.name || 'Project'} {/* Display project name */}
        </Link>
        {' / '}
        <Link
          href={`/projects/${projectId}/parts/${partId}`}
          className="hover:underline"
        >
          {projectPart?.name || 'Part'} {/* Display part name */}
        </Link>
        {' / '}
        Order List {orderList.listNumber}
      </div>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{orderList.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={getStatusBadgeColor(orderList.status)}>
              {orderList.status}
            </Badge>
            {orderList.submissionDate && (
              <div className="text-sm text-muted-foreground">
                <Calendar className="inline h-4 w-4 mr-1" />
                Submitted: {formatDate(orderList.submissionDate)}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Details
          </Button>
          {orderList.status === 'draft' && (
            <Button onClick={handleSubmitOrderList}>
              <FileText className="h-4 w-4 mr-2" />
              Submit Order
            </Button>
          )}
        </div>
      </div>

      {/* Order List Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Order List Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Manufacturer:{' '}
                <span className="font-medium text-foreground">
                  {orderList.manufacturer || 'N/A'}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Type:{' '}
                <span className="font-medium text-foreground">
                  {orderList.type || 'N/A'}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Created: {formatDate(orderList.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Last Updated: {formatDate(orderList.updatedAt)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team & Project Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Designer:{' '}
                <span className="font-medium text-foreground">
                  {orderList.designer || 'N/A'}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Project Manager:{' '}
                <span className="font-medium text-foreground">
                  {orderList.projectManager || 'N/A'}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Project:{' '}
                <span className="font-medium text-foreground">
                  {project?.name || 'N/A'}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Part:{' '}
                <span className="font-medium text-foreground">
                  {projectPart?.name || 'N/A'}
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="items"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="items">Items ({items.length})</TabsTrigger>
          {/* Disable PDF tab if no viewer */}
          <TabsTrigger value="pdf" disabled={!showPdfViewer}>
            PDF Form
          </TabsTrigger>
          {/* <TabsTrigger value="documents">Documents</TabsTrigger> */}
          {/* <TabsTrigger value="history">History</TabsTrigger> */}
        </TabsList>

        {/* Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Order List Items</h2>
            {orderList?.status === 'draft' && (
              <Button onClick={() => setIsAddItemDialogOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            )}
          </div>

          {items.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No items found in this order list. Start by adding items.
                </p>
                {orderList?.status === 'draft' && (
                  <Button onClick={() => setIsAddItemDialogOpen(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add First Item
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <ItemTable
              items={items}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              readOnly={orderList?.status !== 'draft'}
            />
          )}
        </TabsContent>

        {/* PDF Form Tab */}
        <TabsContent value="pdf" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Order Form Preview</h2>
            {/* Removed extra buttons, PDFViewer has its own export */}
          </div>

          {/* Conditionally render PDFViewer or the placeholder card */}
          {showPdfViewer && pdfUrl ? ( // Ensure pdfUrl is not null here
            <PDFViewer
              pdfUrl={pdfUrl} // Pass the derived PDF URL
              projectData={project}
              partData={projectPart}
              orderListData={orderList}
              isReadOnly={orderList?.status !== 'draft'}
              formDataMapping={formMapping} // Pass the parsed mapping
            />
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">
                  PDF Form Not Available
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  No PDF form template found or configured for{' '}
                  <span className="font-medium">
                    {orderList.manufacturer || 'this manufacturer'}
                  </span>{' '}
                  /{' '}
                  <span className="font-medium">
                    {orderList.type || 'product type'}
                  </span>
                  .
                </p>
                <Link href="/pdf-templates">
                  <Button variant="outline">Manage PDF Templates</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Documents Tab (Placeholder) */}
        {/* <TabsContent value="documents"> ... </TabsContent> */}

        {/* History Tab (Placeholder) */}
        {/* <TabsContent value="history"> ... </TabsContent> */}
      </Tabs>

      {/* Dialogs */}
      {/* Edit Order List Dialog */}
      <OrderListDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleUpdateOrderList}
        orderList={orderList} // Pass the full order list for pre-filling
        partId={partId}
      />

      {/* Add Item Dialog */}
      <ItemDialog
        open={isAddItemDialogOpen}
        onOpenChange={setIsAddItemDialogOpen}
        onSave={handleAddItem}
        orderListId={orderListId}
        manufacturer={orderList.manufacturer}
        productType={orderList.type}
      />

      {/* Edit Item Dialog */}
      {editingItem && (
        <ItemDialog
          open={!!editingItem} // Open if editingItem is not null
          onOpenChange={(open) => !open && setEditingItem(null)}
          onSave={handleUpdateItem}
          item={editingItem}
          orderListId={orderListId}
          manufacturer={orderList.manufacturer}
          productType={orderList.type}
        />
      )}
    </div>
  );
}
