// app/(dashboard)/projects/[id]/parts/[partId]/order-lists/[orderListId]/client.tsx

'use client';

import { useState, useEffect } from 'react';
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
import { getFormMapping, applyFormMapping } from '@/lib/pdf/formMapping';
import { toast } from 'sonner';
import Link from 'next/link';
import { projectService } from '@/lib/services/projectService';
import { projectPartService } from '@/lib/services/projectPartService';
import pdfTemplateService from '@/lib/services/pdfTemplateService';

interface OrderListDetailClientProps {
  projectId: string;
  partId: string;
  orderListId: string;
}

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
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  // For the form mapping state:
  const [formMapping, setFormMapping] = useState<Record<string, { source: string; field: string }>>({});

  // For the PDF URL state:
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    // Fetch order list and items when user is loaded
    if (isLoaded && user) {
      fetchData();
    }
  }, [isLoaded, user, orderListId]);

  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);
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

      // Fetch project details - use the full project_id from the part data
      const projectData = await projectService.getProject(partData.projectId);
      setProject(projectData);

      // Load form mapping based on manufacturer and product type
      const mapping = getFormMapping(
        orderListData.manufacturer,
        orderListData.type
      );
      setFormMapping(mapping);

      // Get PDF URL from template service
      const template = await pdfTemplateService.getTemplateByManufacturerAndType(
        orderListData.manufacturer,
        orderListData.type,
        user.id
      );
      
      const pdfURL = template?.pdfUrl || null;
      setPdfUrl(pdfURL);
      
      // Initialize PDF viewer if URL exists
      setShowPdfViewer(!!pdfURL);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('An error occurred while loading data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateOrderList = async (
    updatedOrderList: OrderList | Partial<OrderList>
  ) => {
    if (!user || !orderList) return;

    try {
      const result = await orderListService.updateOrderList(
        orderListId,
        updatedOrderList
      );
      setOrderList(result);
      toast.success('Order list updated successfully');
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating order list:', error);
      toast.error('An error occurred while updating the order list');
    }
  };

  const handleAddItem = async (item: Item | Partial<Item>) => {
    if (!user || !orderList) return;

    try {
      // Ensure we have the order list ID
      const newItem = {
        ...item,
        orderListId,
      };

      const result = await itemService.createItem(newItem);

      // Update the items list with the new item
      setItems((prevItems) => [...prevItems, result]);

      toast.success('Item added successfully');
      setIsAddItemDialogOpen(false);
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('An error occurred while adding the item');
    }
  };

  const handleUpdateItem = async (item: Item | Partial<Item>) => {
    if (!user || !editingItem) return;

    try {
      const result = await itemService.updateItem(editingItem.id, item);

      // Update the items list with the updated item
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

    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await itemService.deleteItem(itemId);

      // Remove the deleted item from the list
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
        'Are you sure you want to submit this order list? This will mark it as submitted and set the submission date to today.'
      )
    ) {
      return;
    }

    try {
      const result = await orderListService.submitOrderList(orderListId);
      setOrderList(result);
      toast.success('Order list submitted successfully');
    } catch (error) {
      console.error('Error submitting order list:', error);
      toast.error('An error occurred while submitting the order list');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not submitted';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Helper function to determine badge color based on status
  const getStatusBadgeColor = (status: string) => {
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
          Project
        </Link>
        {' / '}
        <Link
          href={`/projects/${projectId}/parts/${partId}`}
          className="hover:underline"
        >
          Part
        </Link>
        {' / '}
        Order List {orderList.listNumber}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
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
            Edit Order List
          </Button>
          {orderList.status === 'draft' && (
            <Button onClick={handleSubmitOrderList}>
              <FileText className="h-4 w-4 mr-2" />
              Submit Order List
            </Button>
          )}
        </div>
      </div>

      {/* Order List Details */}
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
                  {orderList.manufacturer}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Type:{' '}
                <span className="font-medium text-foreground">
                  {orderList.type}
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
            <CardTitle>Team Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Designer:{' '}
                <span className="font-medium text-foreground">
                  {orderList.designer}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Project Manager:{' '}
                <span className="font-medium text-foreground">
                  {orderList.projectManager}
                </span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Items and other content */}
      <Tabs
        defaultValue="items"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="items">Items ({items.length})</TabsTrigger>
          <TabsTrigger value="pdf">PDF Form</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
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
                  No items found in this order list. Start by adding items to
                  your order.
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
            <h2 className="text-xl font-semibold">Order Form</h2>
            <div className="flex gap-2">
              {orderList?.status === 'draft' && (
                <Button onClick={handleSubmitOrderList}>
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Order
                </Button>
              )}
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          {showPdfViewer ? (
            <PDFViewer
              pdfUrl={pdfUrl} // Pass the PDF URL
              projectData={project}
              partData={projectPart}
              orderListData={orderList}
              isReadOnly={orderList?.status !== 'draft'}
              formDataMapping={formMapping}
            />
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">PDF Form Not Available</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  No PDF form template is available for this
                  manufacturer/product type combination.
                </p>
                <Link href="/pdf-templates">
                  <Button variant="outline">
                    Manage PDF Templates
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Attach and manage documents related to this order list.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-4">
                Document management will be implemented in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Order List History</CardTitle>
              <CardDescription>
                View the history of changes to this order list.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-4">
                Order list history tracking will be implemented in a future
                update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Order List Dialog */}
      <OrderListDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleUpdateOrderList}
        orderList={orderList}
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
          open={editingItem !== null}
          onOpenChange={(open: boolean) => !open && setEditingItem(null)}
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