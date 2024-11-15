import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: ["/dashboard/:path*", "/register"], // `/register` を追加
};

export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });

    // `/register` ページは認証不要
    if (req.nextUrl.pathname === "/register") {
        return NextResponse.next();
    }

    // 他のページでトークンがなければログイン画面にリダイレクト
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}
