// app/(dashboard)/projects/[id]/parts/[partId]/client.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectPartDialog } from '@/components/ui/projectpartdialog';
import { OrderListDialog } from '@/components/ui/orderlistdialog';
import { OrderListCard } from '@/components/ui/orderlistcard';
import {
  Loader2,
  ArrowLeft,
  PlusIcon,
  Edit,
  Calendar,
  User,
} from 'lucide-react';
import { projectPartService } from '@/lib/services/projectPartService';
import { projectService } from '@/lib/services/projectService';
import { orderListService } from '@/lib/services/orderListService';
import { ProjectPart } from '@/types/projectPart';
import { OrderList, OrderListFormData } from '@/types/orderList';
// Remove Project import if no longer needed directly
// import { Project } from '@/types/project';
import { toast } from 'sonner';
import Link from 'next/link';

// --- Ensure EnrichedProjectData is defined or imported correctly here ---
// (Make sure this matches the definition in projectService.ts and other clients)
interface Company {
  id: string;
  name: string;
  street?: string;        // Add missing street field
  address?: string;       // Keep for backward compatibility
  postalCode?: string;    // Add missing postalCode field
  city?: string;
  country?: string;       // Add missing country field
  phone?: string;
  email?: string;         // Add missing email field
  type?: string;          // Add missing type field
}

interface EnrichedProjectData {
  id: string;
  name: string;
  projectNumber?: string;
  address: string;
  designer: string;
  projectManager: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  engineer: Company | null;
  masonryCompany: Company | null;
  architect: Company | null;
  owner: Company | null;
}
// --------------------------------------------------------------------

interface ProjectPartDetailPageClientProps {
  projectId: string;
  partId: string;
}

export function ProjectPartDetailPageClient({
  projectId,
  partId,
}: ProjectPartDetailPageClientProps) {
  const { user, isLoaded } = useUser();
  const [projectPart, setProjectPart] = useState<ProjectPart | null>(null);

  // --- THIS IS THE CORRECTED LINE (Line 33 approx.) ---
  const [project, setProject] = useState<EnrichedProjectData | null>(null);
  // ----------------------------------------------------

  const [orderLists, setOrderLists] = useState<OrderList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddOrderListDialogOpen, setIsAddOrderListDialogOpen] =
    useState(false);
  const [editingOrderList, setEditingOrderList] = useState<OrderList | null>(
    null,
  );

  useEffect(() => {
    if (isLoaded && user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user, projectId, partId]);

  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch project details - returns EnrichedProjectData
      const projectData: EnrichedProjectData =
        await projectService.getProject(projectId);
      // This assignment is now correct
      setProject(projectData);

      // Fetch project part details
      const partData = await projectPartService.getProjectPart(partId);
      setProjectPart(partData);

      // Fetch order lists for this part
      const orderListsData = await orderListService.getOrderLists(partId);
      setOrderLists(orderListsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('An error occurred while loading data');
      setProject(null); // Reset state on error
      setProjectPart(null);
      setOrderLists([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProjectPart = async (
    updatedPart: ProjectPart | Partial<ProjectPart>,
  ) => {
    if (!user || !projectPart) return;

    try {
      const updateData = {
        partNumber: updatedPart.partNumber,
        name: updatedPart.name,
        designer: updatedPart.designer,
        projectManager: updatedPart.projectManager,
      };

      await projectPartService.updateProjectPart(partId, updateData);
      toast.success('Project part updated successfully');
      setIsEditDialogOpen(false);
      fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error updating project part:', error);
      toast.error('An error occurred while updating the project part');
    }
  };

  const handleAddOrderList = async (
    orderList: OrderList | Partial<OrderList>,
  ) => {
    if (!user || !projectPart) return;

    try {
      const orderListData: OrderListFormData = {
        partId: partId,
        listNumber: orderList.listNumber || '',
        name: orderList.name || '',
        manufacturer: orderList.manufacturer || '',
        type: orderList.type || '',
        designer: orderList.designer || '',
        projectManager: orderList.projectManager || '',
        status: 'draft',
        submissionDate: null,
      };

      await orderListService.createOrderList(orderListData);

      toast.success('Order list created successfully!');
      setIsAddOrderListDialogOpen(false);
      fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error creating order list:', error);
      toast.error('An error occurred while creating the order list');
    }
  };

  const handleUpdateOrderList = async (
    orderList: OrderList | Partial<OrderList>,
  ) => {
    if (!user || !editingOrderList) return;

    try {
      await orderListService.updateOrderList(editingOrderList.id, orderList);

      toast.success('Order list updated successfully!');
      setEditingOrderList(null);
      fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error updating order list:', error);
      toast.error('An error occurred while updating the order list');
    }
  };

  const handleOrderListEditClick = (orderList: OrderList) => {
    setEditingOrderList(orderList);
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check project and projectPart after loading
  if (!project || !projectPart) {
    return (
      <div className="p-6">
        <div className="text-center py-12 border rounded-lg bg-card">
          <p className="text-muted-foreground">
            The requested project or part was not found.
          </p>
          <Link href={`/projects/${projectId}`}>
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Project
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Now safe to access project and projectPart
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
          {project.name} {/* Safe access */}
        </Link>
        {' / '}
        {projectPart.name} {/* Safe access */}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{projectPart.name}</h1>
          <p className="text-muted-foreground">
            Part #{projectPart.partNumber || 'N/A'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Part
          </Button>
          <Button onClick={() => setIsAddOrderListDialogOpen(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Order List
          </Button>
        </div>
      </div>

      {/* Project Part Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Part Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Created: {formatDate(projectPart.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Last Updated: {formatDate(projectPart.updatedAt)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Team (Part)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Designer: {projectPart.designer || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>
                Project Manager: {projectPart.projectManager || 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Lists Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Order Lists</h2>
          {/* Button moved here for consistency */}
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddOrderListDialogOpen(true)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Order List
          </Button> */}
        </div>

        {orderLists.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                No order lists found for this part yet. Start by creating a new
                order list.
              </p>
              <Button onClick={() => setIsAddOrderListDialogOpen(true)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Order List
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orderLists.map((orderList) => (
              <OrderListCard
                key={orderList.id}
                orderList={orderList}
                projectId={projectId} // Pass projectId
                partId={partId} // Pass partId
                onEditClick={() => handleOrderListEditClick(orderList)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Project Part Edit Dialog */}
      <ProjectPartDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleUpdateProjectPart}
        projectPart={projectPart} // Pass the full part object
        projectId={projectId}
      />

      {/* Add Order List Dialog */}
      <OrderListDialog
        open={isAddOrderListDialogOpen}
        onOpenChange={setIsAddOrderListDialogOpen}
        onSave={handleAddOrderList}
        partId={partId}
        partName={projectPart.name} // Pass part name
        defaultDesigner={projectPart.designer}
        defaultProjectManager={projectPart.projectManager}
      />

      {/* Edit Order List Dialog */}
      {editingOrderList && (
        <OrderListDialog
          open={editingOrderList !== null}
          onOpenChange={(open: boolean) => !open && setEditingOrderList(null)}
          onSave={handleUpdateOrderList}
          orderList={editingOrderList} // Pass the order list to edit
          partId={partId}
        />
      )}
    </div>
  );
}