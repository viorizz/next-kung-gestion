// Server component
import { ProjectDetailClient } from './client';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return <ProjectDetailClient id={params.id} />;
}