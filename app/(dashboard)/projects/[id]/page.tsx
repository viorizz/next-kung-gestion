// app/(dashboard)/projects/[id]/page.tsx
import { ProjectDetailClient } from './client';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ProjectDetailPage({ params }: PageProps) {
  return <ProjectDetailClient id={params.id} />;
}