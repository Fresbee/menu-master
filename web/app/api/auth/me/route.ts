import { NextResponse } from "next/server";
import { fetchApiWithSession } from "@/lib/session";

export async function GET() {
  const apiResponse = await fetchApiWithSession("/auth/me");
  const data = await apiResponse.json().catch(() => ({}));

  if (!apiResponse.ok) {
    return NextResponse.json(
      {
        detail:
          typeof data.detail === "string"
            ? data.detail
            : "Unable to load session user.",
      },
      { status: apiResponse.status },
    );
  }

  return NextResponse.json(data);
}
