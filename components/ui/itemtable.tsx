'use client';

import { useState } from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Item } from '@/types/item';
import { Edit, Trash2, MoveVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItemTableProps {
  items: Item[];
  onEditItem: (item: Item) => void;
  onDeleteItem: (itemId: string) => void;
  readOnly?: boolean;
}

export function ItemTable({ items, onEditItem, onDeleteItem, readOnly = false }: ItemTableProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<Item | null>(null);
  
  const handleDragStart = (e: React.DragEvent, item: Item) => {
    if (readOnly) return;
    
    setIsDragging(true);
    setDraggedItem(item);
    
    // Set the drag image and data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
    
    // Create a custom drag image (optional)
    const dragImage = document.createElement('div');
    dragImage.innerHTML = `<div class="bg-primary text-white p-2 rounded">${item.article}</div>`;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };
  
  const handleDragOver = (e: React.DragEvent, targetItem: Item) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (readOnly || !draggedItem || draggedItem.id === targetItem.id) return;
    
    // You can add visual feedback here, like changing the target row's style
  };
  
  const handleDrop = (e: React.DragEvent, targetItem: Item) => {
    e.preventDefault();
    
    if (readOnly || !draggedItem || draggedItem.id === targetItem.id) return;
    
    // Handle the reordering logic here
    // You would typically update the positions in your state and database
    console.log(`Reordering: ${draggedItem.id} dropped onto ${targetItem.id}`);
    
    // Reset the drag state
    setIsDragging(false);
    setDraggedItem(null);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedItem(null);
  };

  // Function to format specifications
  const formatSpecifications = (specs: any): string => {
    if (!specs || Object.keys(specs).length === 0) {
      return 'None';
    }
    
    // Convert the specifications object to a readable string
    return Object.entries(specs)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            {!readOnly && (
              <TableHead style={{ width: '40px' }}></TableHead>
            )}
            <TableHead className="w-16">Pos.</TableHead>
            <TableHead>Article</TableHead>
            <TableHead className="w-20">Quantity</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Specifications</TableHead>
            {!readOnly && (
              <TableHead style={{ width: '100px' }}>Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow 
              key={item.id}
              draggable={!readOnly}
              onDragStart={(e) => handleDragStart(e, item)}
              onDragOver={(e) => handleDragOver(e, item)}
              onDrop={(e) => handleDrop(e, item)}
              onDragEnd={handleDragEnd}
              className={cn(
                draggedItem?.id === item.id ? 'opacity-50' : '',
                isDragging ? 'cursor-move' : ''
              )}
            >
              {!readOnly && (
                <TableCell>
                  <MoveVertical className="h-4 w-4 cursor-move text-muted-foreground" />
                </TableCell>
              )}
              <TableCell className="font-medium">{item.position / 10}</TableCell>
              <TableCell>{item.article}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.type}</TableCell>
              <TableCell className="max-w-xs truncate">
                {formatSpecifications(item.specifications)}
              </TableCell>
              {!readOnly && (
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEditItem(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDeleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {items.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          No items found in this order list.
        </div>
      )}
    </div>
  )}