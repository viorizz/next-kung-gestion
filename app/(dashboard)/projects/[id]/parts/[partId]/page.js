// Using .js file to avoid TypeScript type issues
import { ProjectPartDetailPageClient } from './client.tsx';

export default function ProjectPartDetailPage(props) {
  // Access the ID and partId directly without typing constraints
  const id = props.params.id;
  const partId = props.params.partId;
  return <ProjectPartDetailPageClient projectId={id} partId={partId} />;
}