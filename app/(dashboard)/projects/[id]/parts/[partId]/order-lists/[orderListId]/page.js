// app/(dashboard)/projects/[id]/parts/[partId]/order-lists/[orderListId]/page.js
// Using .js instead of .tsx to avoid TypeScript issues with route params
import { OrderListDetailClient } from './client.tsx';

export default function OrderListDetailPage(props) {
  // Access the IDs directly without typing constraints
  const projectId = props.params.id;
  const partId = props.params.partId;
  const orderListId = props.params.orderListId;
  
  return (
    <OrderListDetailClient 
      projectId={projectId} 
      partId={partId}
      orderListId={orderListId} 
    />
  );
}