import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { RecipeSearch } from "@/components/recipe-search";
import { SessionUserEmail } from "@/components/session-user-email";

export default async function LandingPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!accessToken && !refreshToken) {
    redirect("/");
  }

  return (
    <main className="h-screen overflow-y-auto p-6 sm:p-10">
      <div className="mx-auto flex min-h-full max-w-7xl flex-col rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-card backdrop-blur sm:p-8">
        <header className="flex justify-end">
          <div className="flex items-center gap-3">
            <SessionUserEmail />
            <LogoutButton />
          </div>
        </header>

        <section className="flex flex-1 flex-col py-8 sm:py-12">
          <h1 className="text-center font-display text-5xl text-ink sm:text-7xl">
            Menu Master
          </h1>
          <RecipeSearch />
        </section>
      </div>
    </main>
  );
}
