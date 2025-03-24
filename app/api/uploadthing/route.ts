import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Export routes for Next.js API
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});