'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CalendarIcon, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectPart } from '@/types/projectPart';
import Link from 'next/link';

interface ProjectPartCardProps {
  projectPart: ProjectPart;
  onEditClick: () => void;
  onAddOrderListClick?: () => void; // Added callback for opening order list dialog
}

export function ProjectPartCard({ projectPart, onEditClick, onAddOrderListClick }: ProjectPartCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <Card className="bg-card hover:bg-accent/10 transition-colors">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-xl">
            <span className="font-bold">{projectPart.partNumber}</span> - {projectPart.name}
          </CardTitle>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-xs text-muted-foreground mt-1">
            <CalendarIcon className="inline h-3 w-3 mr-1" />
            Created: {formatDate(projectPart.createdAt)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Designer: {projectPart.designer}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Project Manager: {projectPart.projectManager}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Link href={`/projects/${projectPart.projectId}/parts/${projectPart.id}`}>
          <Button variant="outline" size="sm">View Details</Button>
        </Link>
        <div className="flex gap-2">
          {/* Conditionally render the Add Order List button if callback is provided */}
          {onAddOrderListClick && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onAddOrderListClick}
            >
              New Order List
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onEditClick}>
            Edit
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}