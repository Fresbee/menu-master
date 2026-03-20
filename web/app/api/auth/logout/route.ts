import { NextResponse } from "next/server";
import { clearSessionCookies, fetchApiWithSession } from "@/lib/session";

export async function POST() {
  await fetchApiWithSession(
    "/auth/logout",
    {
      method: "POST",
    },
    {
      includeRefreshToken: true,
      retryOnUnauthorized: false,
    },
  ).catch(() => null);

  await clearSessionCookies();

  return NextResponse.json({ success: true });
}
