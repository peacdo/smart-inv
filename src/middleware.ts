import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Auth-related paths
    if (path === "/login") {
      if (token) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      return NextResponse.next()
    }

    if (path === "/signout") {
      return NextResponse.next()
    }

    // Protected paths with role checks
    if (path.startsWith("/dashboard")) {
      // Admin only paths
      if (
        (path.startsWith("/dashboard/users") || path.startsWith("/dashboard/qr-codes")) &&
        token?.role !== "ADMIN"
      ) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }

      // Worker1 paths
      if (path.startsWith("/dashboard/inventory") && !["ADMIN", "WORKER1"].includes(token?.role as string)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }

      // Worker2 paths
      if (path.startsWith("/dashboard/orders") && !["ADMIN", "WORKER2"].includes(token?.role as string)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth-related pages without a token
        if (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signout") {
          return true
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signout"],
} 