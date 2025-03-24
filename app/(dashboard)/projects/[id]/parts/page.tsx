'use client';

import { ProjectPartsPage } from '@/components/project-part-page';

export default function ProjectPartsPageWrapper({ params }: { params: { id: string } }) {
  return <ProjectPartsPage projectId={params.id} />;
}