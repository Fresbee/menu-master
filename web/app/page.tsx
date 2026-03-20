import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  const cookieStore = await cookies();

  if (cookieStore.get("access_token")) {
    redirect("/landing");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 shadow-card backdrop-blur">
        <div className="grid min-h-[680px] lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative flex flex-col justify-between overflow-hidden bg-ink px-8 py-10 text-white sm:px-12 sm:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(247,243,234,0.16),transparent_34%),linear-gradient(145deg,rgba(199,152,68,0.18),transparent_55%)]" />
            <div className="relative">
              <p className="text-sm uppercase tracking-[0.35em] text-sage/80">
                Culinary Operations
              </p>
              <h1 className="mt-6 font-display text-6xl leading-none sm:text-7xl">
                Menu Master
              </h1>
            </div>
            <div className="relative max-w-md space-y-4">
              <p className="text-lg text-sage/85">
                Sign in to manage recipes, organize your kitchen knowledge, and
                keep your team aligned.
              </p>
              <div className="h-px w-24 bg-gold/70" />
            </div>
          </section>

          <section className="flex items-center px-6 py-10 sm:px-10 lg:px-12">
            <LoginForm />
          </section>
        </div>
      </div>
    </main>
  );
}
