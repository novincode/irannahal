// api/app/api/check-auth/route.ts
import { auth } from "@auth";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  return new Response("OK");
}
