// Remove all type annotations for the page component
export default function ProjectDetailPage({ params }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Project Details</h1>
      <p>Project ID: {params.id}</p>
      
      {/* We'll add a client component later after this builds */}
    </div>
  );
}