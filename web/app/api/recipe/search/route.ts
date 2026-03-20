import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type Recipe = {
  title: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchPhrase = searchParams.get("q")?.trim();

  if (!searchPhrase) {
    return NextResponse.json(
      { detail: "Search phrase is required." },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }

  const apiResponse = await fetch(
    `${process.env.API_URL}/recipe/${encodeURIComponent(searchPhrase)}`,
    {
      method: "GET",
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      cache: "no-store",
    },
  );

  const data = await apiResponse.json().catch(() => []);

  if (!apiResponse.ok) {
    return NextResponse.json(
      {
        detail:
          typeof data.detail === "string"
            ? data.detail
            : "Recipe search failed.",
      },
      { status: apiResponse.status },
    );
  }

  return NextResponse.json(
    (data as Recipe[]).map((recipe) => ({ title: recipe.title })),
  );
}
