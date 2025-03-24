'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlusIcon, 
  Loader2, 
  Building2, 
  User2, 
  MapPin,
  Calendar
} from 'lucide-react';
import { projectService } from '@/lib/services/projectService';
import { projectPartService } from '@/lib/services/projectPartService';
import { Project } from '@/types/project';
import { ProjectPart, ProjectPartFormData } from '@/types/projectPart';
import { toast } from 'sonner';
import Link from 'next/link';
import { ProjectPartDialog } from '@/components/ui/projectpartdialog';

interface ProjectDetailClientProps {
  id: string;
}

export function ProjectDetailClient({ id }: ProjectDetailClientProps) {
  const { user, isLoaded } = useUser();
  const [project, setProject] = useState<Project | null>(null);
  const [projectParts, setProjectParts] = useState<ProjectPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [editingProjectPart, setEditingProjectPart] = useState<ProjectPart | null>(null);

  useEffect(() => {
    if (isLoaded && user) {
      fetchProjectDetails();
    }
  }, [isLoaded, user, id]);

  const fetchProjectDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch project details
      const projectData = await projectService.getProject(id);
      setProject(projectData);

      // Fetch project parts
      const partsData = await projectPartService.getProjectParts(id);
      setProjectParts(partsData);
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast.error('Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProjectPart = async (formData: ProjectPartFormData | Partial<ProjectPart>) => {
    if (!user || !project) return;
    
    try {
      // Ensure projectId is set
      const partData: ProjectPartFormData = {
        projectId: id,
        partNumber: formData.partNumber || '',
        name: formData.name || '',
        designer: formData.designer || '',
        projectManager: formData.projectManager || ''
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

  const handleEditProjectPart = async (projectPart: ProjectPart | Partial<ProjectPart>) => {
    if (!user) return;
    
    // Make sure we have an ID (should always be the case for editing)
    if (!('id' in projectPart) || !projectPart.id) {
      console.error('Cannot update project part without ID');
      toast.error('An error occurred: Missing project part ID');
      return;
    }
    
    console.log('Editing project part:', projectPart);
    
    try {
      // Use a non-null assertion since we've checked above
      const partId: string = projectPart.id;
      
      const updateData: Partial<ProjectPartFormData> = {
        partNumber: projectPart.partNumber,
        name: projectPart.name,
        designer: projectPart.designer,
        projectManager: projectPart.projectManager
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
          <p className="text-muted-foreground">
            Project not found.
          </p>
          <Link href="/projects">
            <Button variant="outline" className="mt-4">
              Back to Projects
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
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        {' / '}
        <Link href="/projects" className="hover:underline">Projects</Link>
        {' / '}
        {project.name}
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">Project #{project.projectNumber}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Edit Project
          </Button>
          <Button 
            size="sm"
            onClick={() => {
              setIsAddPartDialogOpen(true);
              // Optionally switch to parts tab
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
                  <span>{project.address}</span>
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
                  <span>Designer: {project.designer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User2 className="h-4 w-4 text-muted-foreground" />
                  <span>Project Manager: {project.projectManager}</span>
                </div>
                {project.architect && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>Architect: {project.architect}</span>
                  </div>
                )}
                {project.engineer && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>Engineer: {project.engineer}</span>
                  </div>
                )}
                {project.masonryCompany && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>Masonry Company: {project.masonryCompany}</span>
                  </div>
                )}
                {project.owner && (
                  <div className="flex items-center gap-2">
                    <User2 className="h-4 w-4 text-muted-foreground" />
                    <span>Owner: {project.owner}</span>
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
              {projectParts.map(part => (
                <Card key={part.id}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle>{part.name}</CardTitle>
                      <CardDescription>Part #{part.partNumber}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/projects/${id}/parts/${part.id}/order-lists/new`}>
                        <Button variant="outline" size="sm">
                          <PlusIcon className="h-3 w-3 mr-1" />
                          New Order List
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditClick(part)}
                      >
                        Edit
                      </Button>
                      <Link href={`/projects/${id}/parts/${part.id}`}>
                        <Button size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">Designer:</span>
                        <span className="ml-2">{part.designer}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Project Manager:</span>
                        <span className="ml-2">{part.projectManager}</span>
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
        defaultDesigner={project.designer}
        defaultProjectManager={project.projectManager}
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
    </div>
  );
}