// app/(dashboard)/projects/[id]/client.tsx
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PlusIcon,
  Loader2,
  Building2,
  User2,
  MapPin,
  Calendar,
} from 'lucide-react';
import { projectService } from '@/lib/services/projectService';
import { projectPartService } from '@/lib/services/projectPartService';
import { orderListService } from '@/lib/services/orderListService';
// Remove Project import if no longer needed directly
// import { Project } from '@/types/project';
import { ProjectPart, ProjectPartFormData } from '@/types/projectPart';
import { OrderList, OrderListFormData } from '@/types/orderList';
import { toast } from 'sonner';
import Link from 'next/link';
import { ProjectPartDialog } from '@/components/ui/projectpartdialog';
import { OrderListDialog } from '@/components/ui/orderlistdialog';

// --- Ensure EnrichedProjectData is defined or imported correctly here ---
// (Make sure this matches the definition in projectService.ts)
interface Company {
  id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
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

interface ProjectDetailClientProps {
  id: string;
}

export function ProjectDetailClient({ id }: ProjectDetailClientProps) {
  const { user, isLoaded } = useUser();

  // --- THIS IS THE CORRECTED LINE (Line 31 approx.) ---
  const [project, setProject] = useState<EnrichedProjectData | null>(null);
  // ----------------------------------------------------

  const [projectParts, setProjectParts] = useState<ProjectPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [editingProjectPart, setEditingProjectPart] =
    useState<ProjectPart | null>(null);

  const [isAddOrderListDialogOpen, setIsAddOrderListDialogOpen] =
    useState(false);
  const [selectedPartForOrderList, setSelectedPartForOrderList] =
    useState<ProjectPart | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      fetchProjectDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user, id]);

  const fetchProjectDetails = async () => {
    setIsLoading(true);
    try {
      const projectData: EnrichedProjectData =
        await projectService.getProject(id);
      // This assignment is now correct because useState uses EnrichedProjectData
      setProject(projectData);

      const partsData = await projectPartService.getProjectParts(id);
      setProjectParts(partsData);
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Failed to load project details');
      setProject(null); // Reset state on error
      setProjectParts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove the old getCompanyName helper function - it's not needed
  // const getCompanyName = (...) => { ... };

  const handleAddProjectPart = async (
    formData: ProjectPartFormData | Partial<ProjectPart>,
  ) => {
    if (!user || !project) return; // project is now EnrichedProjectData | null

    try {
      const partData: ProjectPartFormData = {
        projectId: id,
        partNumber: formData.partNumber || '',
        name: formData.name || '',
        // Use defaults from the enriched project data
        designer: formData.designer || project.designer || '',
        projectManager: formData.projectManager || project.projectManager || '',
      };

      await projectPartService.createProjectPart(partData);
      toast.success('Project part added successfully');
      setIsAddPartDialogOpen(false);
      fetchProjectDetails(); // Refresh the list
    } catch (error) {
      console.error('Error adding project part:', error);
      toast.error('An error occurred while adding the project part');
    }
  };

  const handleEditProjectPart = async (
    projectPart: ProjectPart | Partial<ProjectPart>,
  ) => {
    if (!user) return;

    if (!('id' in projectPart) || !projectPart.id) {
      console.error('Cannot update project part without ID');
      toast.error('An error occurred: Missing project part ID');
      return;
    }

    console.log('Editing project part:', projectPart);

    try {
      const partId: string = projectPart.id;

      const updateData: Partial<ProjectPartFormData> = {
        partNumber: projectPart.partNumber,
        name: projectPart.name,
        designer: projectPart.designer,
        projectManager: projectPart.projectManager,
      };

      await projectPartService.updateProjectPart(partId, updateData);

      toast.success('Project part updated successfully');
      setEditingProjectPart(null);
      fetchProjectDetails(); // Refresh the list
    } catch (error) {
      console.error('Error updating project part:', error);
      toast.error('An error occurred while updating the project part');
    }
  };

  const handleEditClick = (part: ProjectPart) => {
    setEditingProjectPart(part);
  };

  const handleAddOrderListClick = (part: ProjectPart) => {
    setSelectedPartForOrderList(part);
    setIsAddOrderListDialogOpen(true);
  };

  const handleAddOrderList = async (
    orderList: OrderList | Partial<OrderList>,
  ) => {
    if (!user || !selectedPartForOrderList) return;

    try {
      const orderListData: OrderListFormData = {
        partId: selectedPartForOrderList.id,
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

      toast.success('Order list created successfully');
      setIsAddOrderListDialogOpen(false);
      setSelectedPartForOrderList(null);
      // fetchProjectDetails(); // Optionally refresh
    } catch (error) {
      console.error('Error creating order list:', error);
      toast.error('An error occurred while creating the order list');
    }
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

  if (!project) {
    return (
      <div className="p-6">
        <div className="text-center py-12 border rounded-lg bg-card">
          <p className="text-muted-foreground">Project not found.</p>
          <Link href="/projects">
            <Button variant="outline" className="mt-4">
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Access company names directly using optional chaining
  const masonryCompanyName = project.masonryCompany?.name;
  const architectName = project.architect?.name;
  const engineerName = project.engineer?.name;
  const ownerName = project.owner?.name;

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
        {project.name}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">
            Project #{project.projectNumber || 'N/A'}
          </p>
        </div>
        <div className="flex gap-2">
          {/* <Button variant="outline" size="sm">Edit Project</Button> */}
          <Button
            size="sm"
            onClick={() => {
              setIsAddPartDialogOpen(true);
              setActiveTab('parts');
            }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Project Part
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="parts">
            Project Parts ({projectParts.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{project.address || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Created: {formatDate(project.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Last Updated: {formatDate(project.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Project Team */}
            <Card>
              <CardHeader>
                <CardTitle>Project Team</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <User2 className="h-4 w-4 text-muted-foreground" />
                  <span>Designer: {project.designer || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User2 className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Project Manager: {project.projectManager || 'N/A'}
                  </span>
                </div>
                {architectName && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>Architect: {architectName}</span>
                  </div>
                )}
                {engineerName && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>Engineer: {engineerName}</span>
                  </div>
                )}
                {masonryCompanyName && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>Masonry: {masonryCompanyName}</span>
                  </div>
                )}
                {ownerName && (
                  <div className="flex items-center gap-2">
                    <User2 className="h-4 w-4 text-muted-foreground" />
                    <span>Owner: {ownerName}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Project Parts Tab */}
        <TabsContent value="parts">
          {projectParts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No project parts found. Start by adding a new part.
                </p>
                <Button onClick={() => setIsAddPartDialogOpen(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Project Part
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {projectParts.map((part) => (
                <Card key={part.id}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle>{part.name}</CardTitle>
                      <CardDescription>
                        Part #{part.partNumber || 'N/A'}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddOrderListClick(part)}
                      >
                        <PlusIcon className="h-3 w-3 mr-1" />
                        New Order List
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(part)}
                      >
                        Edit
                      </Button>
                      <Link href={`/projects/${id}/parts/${part.id}`}>
                        <Button size="sm">View Details</Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Designer:
                        </span>
                        <span className="ml-2">{part.designer || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Project Manager:
                        </span>
                        <span className="ml-2">
                          {part.projectManager || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Project Part Dialog */}
      <ProjectPartDialog
        open={isAddPartDialogOpen}
        onOpenChange={setIsAddPartDialogOpen}
        onSave={handleAddProjectPart}
        projectId={id}
        defaultDesigner={project.designer} // Safe access due to check above
        defaultProjectManager={project.projectManager} // Safe access
      />

      {/* Edit Project Part Dialog */}
      {editingProjectPart && (
        <ProjectPartDialog
          open={editingProjectPart !== null}
          onOpenChange={(open: boolean) => !open && setEditingProjectPart(null)}
          onSave={handleEditProjectPart}
          projectPart={editingProjectPart}
          projectId={id}
        />
      )}

      {/* Add Order List Dialog */}
      {selectedPartForOrderList && (
        <OrderListDialog
          open={isAddOrderListDialogOpen}
          onOpenChange={(open) => {
            setIsAddOrderListDialogOpen(open);
            if (!open) setSelectedPartForOrderList(null);
          }}
          onSave={handleAddOrderList}
          partId={selectedPartForOrderList.id}
          partName={selectedPartForOrderList.name}
          defaultDesigner={selectedPartForOrderList.designer}
          defaultProjectManager={selectedPartForOrderList.projectManager}
        />
      )}
    </div>
  );
}
