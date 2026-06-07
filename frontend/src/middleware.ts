import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const userId = request.cookies.get("userId")?.value;
  const roomCode = request.cookies.get("roomCode")?.value;

  const { pathname } = request.nextUrl;

  //-----------------------------Entry Point-----------------------------//

  if (pathname === "/") {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (userId && roomCode) {
      return NextResponse.redirect(
        new URL(`/workspace/${roomCode}`, request.url)
      );
    }
    return NextResponse.redirect(new URL("/join-room", request.url));
  }

  //-----------------------------Auth pages if the user is already signed in-----------------------------//
  if (pathname === "/login" || pathname === "/register") {
    if (accessToken) {
      return NextResponse.redirect(new URL("/join-room", request.url));
    }
    return NextResponse.next();
  }

  //-----------------------------Protected pages must be logged in-----------------------------//
  if (pathname === "/join-room" || pathname.startsWith("/workspace")) {
    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  // ---- Already in a room — skip join-room ---- //
  if (pathname === "/join-room" && userId && roomCode) {
    return NextResponse.redirect(
      new URL(`/workspace/${roomCode}`, request.url)
    );
  }

  // ---- Workspace — must have userId and roomCode ---- //
  if (pathname.startsWith("/workspace") && (!userId || !roomCode)) {
    return NextResponse.redirect(new URL("/join-room", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/join-room", "/workspace/:path*"]
};
