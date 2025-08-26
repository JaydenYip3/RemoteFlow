// middleware.ts (at project root)
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the login page itself
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Read the session cookie
  const token = request.cookies.get("session")?.value;
  
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Verify with JOSE (Edge-compatible)
  const secret = process.env.JWT_SECRET_KEY;
  
  if (!secret) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const key = new TextEncoder().encode(secret);
    await jwtVerify(token, key, { algorithms: ["HS256"] });
    return NextResponse.next();
  } catch (error) {
    // Token expired or invalid
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
}

// Protect everything except these paths and assets
export const config = {
    matcher: ["/", "/device/:path*"],
};
