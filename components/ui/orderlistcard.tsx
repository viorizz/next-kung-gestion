'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, UserIcon, Package, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderList } from '@/types/orderList';
import Link from 'next/link';

interface OrderListCardProps {
  orderList: OrderList;
  onEditClick: () => void;
  projectId: string;
  partId: string;
}

export function OrderListCard({ orderList, onEditClick }: OrderListCardProps) {
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

  return (
    <Card className="bg-card hover:bg-accent/10 transition-colors">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-xl">
            <span className="font-bold">#{orderList.listNumber}</span> - {orderList.name}
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={getStatusBadgeColor(orderList.status)}>
              {orderList.status}
            </Badge>
            {orderList.submissionDate && (
              <div className="text-xs text-muted-foreground">
                <CalendarIcon className="inline h-3 w-3 mr-1" />
                Submitted: {formatDate(orderList.submissionDate)}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Manufacturer: <span className="font-medium text-foreground">{orderList.manufacturer}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Type: <span className="font-medium text-foreground">{orderList.type}</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Designer: {orderList.designer}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Project Manager: {orderList.projectManager}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Link href={`/projects/${orderList.partId.split('-')[0]}/parts/${orderList.partId}/order-lists/${orderList.id}`}>
          <Button variant="outline" size="sm">View Details</Button>
        </Link>
        <Button variant="ghost" size="sm" onClick={onEditClick}>
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}