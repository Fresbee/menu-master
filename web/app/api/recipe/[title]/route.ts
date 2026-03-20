import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value;
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ title: string }> },
) {
  const { title } = await context.params;
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }

  const body = (await request.json()) as RecipeUpdate;

  const apiResponse = await fetch(
    `${process.env.API_URL}/recipe/${encodeURIComponent(title)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: `access_token=${accessToken}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
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
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return NextResponse.json({ detail: "Not authenticated." }, { status: 401 });
  }

  const apiResponse = await fetch(
    `${process.env.API_URL}/recipe/${encodeURIComponent(title)}`,
    {
      method: "DELETE",
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      cache: "no-store",
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
