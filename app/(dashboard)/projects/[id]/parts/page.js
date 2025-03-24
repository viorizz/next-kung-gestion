// Using .js file to avoid TypeScript type issues
import { ProjectPartsPageClient } from './client.tsx';

export default function ProjectPartsPage(props) {
  // Access the ID directly without typing constraints
  const id = props.params.id;
  return <ProjectPartsPageClient projectId={id} />;
}