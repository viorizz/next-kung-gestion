// Using .js file to avoid TypeScript type issues
import { ProjectDetailClient } from './client.tsx'; // <-- Problematic Import

export default function ProjectDetailPage(props) {
  // Access the ID directly without typing constraints
  const id = props.params.id;
  return <ProjectDetailClient id={id} />;
}