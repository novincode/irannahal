import { auth } from "@auth"; // or your wrapper
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const session = await auth(req as any); // internally respects NEXTAUTH_URL_INTERNAL
  if (!session) {
    return NextResponse.redirect("https://nextkala.com/login");
  }
  return NextResponse.next();
}
