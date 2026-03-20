"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.push("/");
      router.refresh();
      setIsSubmitting(false);
    }
  }

  return (
    <button
      className="inline-flex items-center justify-center rounded-full border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm hover:border-ink/30 hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      onClick={handleLogout}
      disabled={isSubmitting}
      type="button"
    >
      {isSubmitting ? "Logging Out..." : "Logout"}
    </button>
  );
}
