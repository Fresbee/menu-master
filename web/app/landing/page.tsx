import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { RecipeSearch } from "@/components/recipe-search";

export default async function LandingPage() {
  const cookieStore = await cookies();

  if (!cookieStore.get("access_token")) {
    redirect("/");
  }

  return (
    <main className="h-screen overflow-y-auto p-6 sm:p-10">
      <div className="mx-auto flex min-h-full max-w-6xl flex-col rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-card backdrop-blur sm:p-8">
        <header className="flex justify-end">
          <LogoutButton />
        </header>

        <section className="flex flex-1 flex-col items-center py-8 text-center sm:py-12">
          <h1 className="font-display text-5xl text-ink sm:text-7xl">
            Menu Master
          </h1>
          <RecipeSearch />
        </section>
      </div>
    </main>
  );
}
