// Using .js file to avoid TypeScript type issues
import ProjectPartsClient from './client.tsx'; // Change to default import

export default function ProjectPartsPage(props) {
  // Access the ID directly without typing constraints
  const id = props.params.id;
  return <ProjectPartsClient params={{ id }} />; // Pass params as an object
}