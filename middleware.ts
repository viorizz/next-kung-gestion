// middleware.ts
import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api(.*)",
    "/about",
    "/contact",
    "/pricing",
  ],

  // Routes that signed-in users shouldn't access
  afterAuth(auth, req) {
    // Handle authenticated users trying to access sign-in/sign-up pages
    if (auth.userId && (
      req.nextUrl.pathname.startsWith('/sign-in') || 
      req.nextUrl.pathname.startsWith('/sign-up')
    )) {
      const dashboard = new URL('/dashboard', req.url);
      return NextResponse.redirect(dashboard);
    }

    // Handle unauthenticated users trying to access protected routes
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};