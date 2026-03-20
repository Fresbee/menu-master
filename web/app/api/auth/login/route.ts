import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type LoginPayload = {
  email?: string;
  password?: string;
};

type TokenResponse = {
  access_token: string;
  refresh_token: string;
};

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

export async function POST(request: Request) {
  const body = (await request.json()) as LoginPayload;
  const email = body.email?.trim();
  const password = body.password;

  if (!email || !password) {
    return NextResponse.json(
      { detail: "Email and password are required." },
      { status: 400 },
    );
  }

  const apiResponse = await fetch(`${process.env.API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: email,
      password,
    }),
    cache: "no-store",
  });

  const data = await apiResponse.json().catch(() => ({}));

  if (!apiResponse.ok) {
    return NextResponse.json(
      {
        detail:
          typeof data.detail === "string"
            ? data.detail
            : "Login failed. Please try again.",
      },
      { status: apiResponse.status },
    );
  }

  const tokens = data as TokenResponse;
  const cookieStore = await cookies();

  cookieStore.set("access_token", tokens.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: ONE_DAY_IN_SECONDS,
  });

  cookieStore.set("refresh_token", tokens.refresh_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: ONE_DAY_IN_SECONDS * 30,
  });

  return NextResponse.json({ success: true });
}
