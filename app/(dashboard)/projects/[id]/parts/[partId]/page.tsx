'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectPartDialog } from '@/components/ui/projectpartdialog';
import { Loader2, ArrowLeft, PlusIcon, Edit, Calendar, User } from 'lucide-react';
import { projectPartService } from '@/lib/services/projectPartService';
import { projectService } from '@/lib/services/projectService';
import { ProjectPart } from '@/types/projectPart';
import { Project } from '@/types/project';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProjectPartDetailPage({ params }: { params: { id: string; partId: string } }) {
  const projectId = params.id;
  const partId = params.partId;
  const { user, isLoaded } = useUser();
  const [projectPart, setProjectPart] = useState<ProjectPart | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch project and project part when user is loaded
    if (isLoaded && user) {
      fetchData();
    }
  }, [isLoaded, user, projectId, partId]);

  const fetchData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Fetch project details
      const projectData = await projectService.getProject(projectId);
      setProject(projectData);
      
      // Fetch project part details
      const partData = await projectPartService.getProjectPart(partId);
      setProjectPart(partData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('An error occurred while loading data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProjectPart = async (updatedPart: ProjectPart | Partial<ProjectPart>) => {
    if (!user || !projectPart) return;
    
    try {
      const updateData = {
        partNumber: updatedPart.partNumber,
        name: updatedPart.name,
        designer: updatedPart.designer,
        projectManager: updatedPart.projectManager
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

  if (!project || !projectPart) {
    return (
      <div className="p-6">
        <div className="text-center py-12 border rounded-lg bg-card">
          <p className="text-muted-foreground">
            The requested project part was not found or you don't have access to it.
          </p>
          <Link href="/projects">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
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
        <Link href={`/projects/${projectId}`} className="hover:underline">{project.name}</Link>
        {' / '}
        <Link href={`/projects/${projectId}/parts`} className="hover:underline">Parts</Link>
        {' / '}
        {projectPart.name}
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{projectPart.name}</h1>
          <p className="text-muted-foreground">Part #{projectPart.partNumber}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Part
          </Button>
          <Link href={`/projects/${projectId}/parts/${partId}/order-lists/new`}>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Order List
            </Button>
          </Link>
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
            <CardTitle>Project Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Designer: {projectPart.designer}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Project Manager: {projectPart.projectManager}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Order Lists Section - Placeholder for future implementation */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Order Lists</h2>
          <Link href={`/projects/${projectId}/parts/${partId}/order-lists/new`}>
            <Button variant="outline" size="sm">
              <PlusIcon className="h-4 w-4 mr-2" />
              New Order List
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              No order lists found for this part yet. Start by creating a new order list.
            </p>
            <Link href={`/projects/${projectId}/parts/${partId}/order-lists/new`}>
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Order List
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Dialog */}
      <ProjectPartDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleUpdateProjectPart}
        projectPart={projectPart}
        projectId={projectId}
      />
    </div>
  );
}