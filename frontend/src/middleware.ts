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

  //-----------------------------Protected pages must be logged in-----------------------------//
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
  matcher: ["/", "/join-room", "/workspace/:path*"]
};
