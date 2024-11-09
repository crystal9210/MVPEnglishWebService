import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware( req : NextRequest ) {
    const token = await getToken({ req });
    if (!token) {
        return NextResponse.redirect(new URL("/lgoin", req.url));
    }
    return NextResponse.next(); // TODO
}

export const config = {
    matcher: ["/dashboard/:path*"],
};