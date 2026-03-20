import { NextResponse } from "next/server";
import { fetchApiWithSession } from "@/lib/session";

type Ingredient = {
  quantity: string;
  name: string;
};

type RecipeUpdate = {
  title: string;
  yieldAmount: number;
  ingredients: Ingredient[];
  instructions: string[];
};

export async function PUT(
  request: Request,
  context: { params: Promise<{ title: string }> },
) {
  const { title } = await context.params;
  const body = (await request.json()) as RecipeUpdate;

  const apiResponse = await fetchApiWithSession(
    `/recipe/${encodeURIComponent(title)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const data = await apiResponse.json().catch(() => ({}));

  if (!apiResponse.ok) {
    return NextResponse.json(
      {
        detail:
          typeof data.detail === "string"
            ? data.detail
            : "Recipe update failed.",
      },
      { status: apiResponse.status },
    );
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ title: string }> },
) {
  const { title } = await context.params;

  const apiResponse = await fetchApiWithSession(
    `/recipe/${encodeURIComponent(title)}`,
    {
      method: "DELETE",
    },
  );

  const data = await apiResponse.json().catch(() => ({}));

  if (!apiResponse.ok) {
    return NextResponse.json(
      {
        detail:
          typeof data.detail === "string"
            ? data.detail
            : "Recipe deletion failed.",
      },
      { status: apiResponse.status },
    );
  }

  return NextResponse.json(data);
}
