import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (refreshToken) {
    await fetch(`${process.env.API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: [
          accessToken ? `access_token=${accessToken}` : "",
          `refresh_token=${refreshToken}`,
        ]
          .filter(Boolean)
          .join("; "),
      },
      cache: "no-store",
    }).catch(() => null);
  }

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");

  return NextResponse.json({ success: true });
}
