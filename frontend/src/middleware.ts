import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const userId = request.cookies.get("userId")?.value;
  const roomCode = request.cookies.get("roomCode")?.value;

  const { pathname } = request.nextUrl;

  //-----------------------------Entry Point-----------------------------//
  if (pathname === "/") {
    if (userId && roomCode) {
      return NextResponse.redirect(
        new URL(`/workspace/${roomCode}`, request.url)
      );
    }
    return NextResponse.redirect(new URL("/join-room", request.url));
  }
  //-----------------------------no user in workspace-----------------------------//
  if (!userId && pathname.startsWith("/workspace")) {
    return NextResponse.redirect(new URL("/join-room", request.url));
  }
  if (userId && roomCode && pathname === "/join-room") {
    return NextResponse.redirect(
      new URL(`/workspace/${roomCode}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/join-room", "/workspace/:path*"]
};
