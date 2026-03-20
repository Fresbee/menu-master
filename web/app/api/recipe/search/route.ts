import { NextResponse } from "next/server";
import { fetchApiWithSession } from "@/lib/session";

type Ingredient = {
  quantity: string;
  name: string;
};

type Recipe = {
  title: string;
  yieldAmount: number;
  ingredients: Ingredient[];
  instructions: string[];
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

  const apiResponse = await fetchApiWithSession(
    `/recipe/${encodeURIComponent(searchPhrase)}`,
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

  return NextResponse.json(data as Recipe[]);
}
