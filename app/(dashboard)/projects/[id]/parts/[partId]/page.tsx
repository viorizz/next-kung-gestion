'use client';

import { ProjectPartDetailPage } from '@/components/project-part-detail-page';

export default function ProjectPartDetailPageWrapper({ 
  params 
}: { 
  params: { id: string; partId: string } 
}) {
  return <ProjectPartDetailPage projectId={params.id} partId={params.partId} />;
}