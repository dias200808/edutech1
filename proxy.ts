import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/token";

const protectedPrefixes = [
  "/dashboard",
  "/schedule",
  "/homework",
  "/grades",
  "/attendance",
  "/messages",
  "/calendar",
  "/announcements",
  "/ai",
  "/reports",
  "/settings",
  "/users",
  "/students",
  "/parents",
  "/teachers",
  "/classes",
  "/subjects",
  "/timetable",
  "/analytics",
  "/system-settings",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  const token = request.cookies.get("school_diary_session")?.value;

  if (pathname.startsWith("/login") && token) {
    try {
      await verifySessionToken(token);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch {
      return NextResponse.next();
    }
  }

  if (!isProtected) return NextResponse.next();
  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  try {
    await verifySessionToken(token);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/schedule/:path*",
    "/homework/:path*",
    "/grades/:path*",
    "/attendance/:path*",
    "/messages/:path*",
    "/calendar/:path*",
    "/announcements/:path*",
    "/ai/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/users/:path*",
    "/students/:path*",
    "/parents/:path*",
    "/teachers/:path*",
    "/classes/:path*",
    "/subjects/:path*",
    "/timetable/:path*",
    "/analytics/:path*",
    "/system-settings/:path*",
  ],
};
