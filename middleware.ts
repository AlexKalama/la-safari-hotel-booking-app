import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/",
    "/rooms",
    "/contact",
    "/amenities",
    "/sign-in",
    "/sign-up",
    "/api/webhook",
    "/_next/static",
    "/_next/image",
    "/favicon.ico",
    "/sign-in/(.*)",
    "/sign-up/(.*)",
    "/api/webhook/(.*)",
    "/_next/static/(.*)",
    "/_next/image/(.*)"
  ],
  ignoredRoutes: ["/api/webhook", "/api/webhook/(.*)"],
  debug: true,
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};