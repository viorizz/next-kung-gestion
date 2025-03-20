import { ProjectDetailClient } from './client';

// Add proper typing that's compatible with Next.js 15.2.0
export default function ProjectDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return <ProjectDetailClient id={params.id} />;
}