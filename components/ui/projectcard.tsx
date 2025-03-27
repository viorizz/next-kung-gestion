'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MapPinIcon, CalendarIcon, BuildingIcon, UsersIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project } from '@/types/project';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  onEditClick: () => void;
}

export function ProjectCard({ project, onEditClick }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Helper function to get company name from either ID-based object or legacy name field
  const getCompanyName = (companyObj: any | undefined, companyName: string | null) => {
    if (companyObj && companyObj.name) {
      return companyObj.name;
    }
    return companyName || 'None';
  };
  
  return (
    <Card className="bg-card hover:bg-accent/10 transition-colors">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-xl">
            <span className="font-bold">{project.projectNumber}</span>-{project.name}
          </CardTitle>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm px-3 py-1 rounded bg-primary/10 text-primary font-medium">
            {project.designer}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            <CalendarIcon className="inline h-3 w-3 mr-1" />
            Created: {formatDate(project.createdAt)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{project.address}</span>
          </div>
          
          {/* Display architect from either object or name field */}
          {(project.architectObj || project.architect) && (
            <div className="flex items-center gap-2">
              <BuildingIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Architect: {getCompanyName(project.architectObj, project.architect)}
              </span>
            </div>
          )}
          
          {/* Display engineer from either object or name field */}
          {(project.engineerObj || project.engineer) && (
            <div className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Engineer: {getCompanyName(project.engineerObj, project.engineer)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Link href={`/projects/${project.id}`}>
          <Button variant="outline" size="sm">View Details</Button>
        </Link>
        <Button variant="ghost" size="sm" onClick={onEditClick}>
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}