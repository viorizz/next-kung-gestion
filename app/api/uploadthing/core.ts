// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// Define permissions for who can upload what files
const auth = (req: Request) => ({ id: "user-id" }); // Replace with your auth logic
 
// Define file upload routes
export const ourFileRouter = {
  // Route for PDF uploads
  pdfUploader: f({ pdf: { maxFileSize: "8MB" } })
    .middleware(async ({ req }) => {
      // This throws if the user isn't authenticated
      const user = await auth(req);
      
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      
      console.log("File uploaded:", file);
      
      return { uploadedBy: metadata.userId };
    }),
  
  // You can add more routes for other file types as needed
  // imageUploader: f(...)
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;