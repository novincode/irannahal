import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // const url = `${process.env.NEXTAUTH_URL}/api/auth/check`
  // const res = await fetch(url, {
  //   headers: {
  //     Authorization: req.headers.get("Authorization") || "",
  //   },
  // });

  // console.log(await res.json())

  // if (res.status !== 200) {
  //   // return NextResponse.redirect(new URL('/auth', req.url));
  // }

  // return NextResponse.next();
}
