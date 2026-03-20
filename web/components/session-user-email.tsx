"use client";

import { useEffect, useState } from "react";

type SessionUser = {
  email: string;
};

export function SessionUserEmail() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSessionUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as SessionUser;
        if (isMounted) {
          setEmail(payload.email);
        }
      } catch {
        // Leave the label blank if the session lookup fails.
      }
    }

    void loadSessionUser();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!email) {
    return null;
  }

  return <p className="text-sm font-medium text-ink/75">{email}</p>;
}
