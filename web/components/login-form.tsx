"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        detail?: string;
      };

      if (!response.ok) {
        setError(payload.detail ?? "Login failed. Please try again.");
        return;
      }

      router.push("/landing");
      router.refresh();
    } catch {
      setError("Unable to reach Menu Master right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-ink/50">
          Welcome Back
        </p>
        <h2 className="font-display text-4xl text-ink">Sign In</h2>
        <p className="text-sm leading-6 text-ink/70">
          Use your Menu Master account to continue.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink/80">Email Address</span>
          <input
            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-base outline-none ring-0 placeholder:text-ink/35 focus:border-gold focus:shadow-[0_0_0_4px_rgba(199,152,68,0.16)]"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="chef@example.com"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink/80">Password</span>
          <input
            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-base outline-none ring-0 placeholder:text-ink/35 focus:border-gold focus:shadow-[0_0_0_4px_rgba(199,152,68,0.16)]"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />
        </label>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          className="inline-flex w-full items-center justify-center rounded-full bg-ink px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#1b3930] disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging In..." : "Login"}
        </button>
      </form>
    </div>
  );
}
