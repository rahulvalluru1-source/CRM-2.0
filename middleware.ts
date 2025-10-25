import { NextResponse } from "next/server";
import { NextRequestWithAuth, withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    // Get pathname
    const { pathname } = request.nextUrl;
    const { token } = request.nextauth;

    // Public paths that don't require authentication
    const publicPaths = ["/login"];
    if (publicPaths.includes(pathname)) {
      // If user is already logged in and tries to access login page,
      // redirect them based on their role
      if (token) {
        if (token.role === "ADMIN") {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        } else if (token.role === "EMPLOYEE") {
          return NextResponse.redirect(new URL("/employee/dashboard", request.url));
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.next();
    }

    // Protected paths require authentication
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Role-based access control
    const isAdminPath = pathname.startsWith("/admin");
    const isEmployeePath = pathname.startsWith("/employee");

    if (isAdminPath && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (isEmployeePath && token.role !== "EMPLOYEE") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect all routes except public ones
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"],
};