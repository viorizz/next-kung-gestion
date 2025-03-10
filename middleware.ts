import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/", 
    "/api/webhook", 
    "/sign-in", 
    "/sign-up",
    "/sign-up/verify-email-address",
    "/verify-email-change"
  ]
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};