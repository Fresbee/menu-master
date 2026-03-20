"use client";

import { FormEvent, useState } from "react";

type SearchResult = {
  title: string;
};

export function RecipeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Enter a search phrase to find recipes.");
      setResults([]);
      setHasSearched(false);
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/recipe/search?q=${encodeURIComponent(trimmedQuery)}`,
      );
      const payload = (await response.json().catch(() => [])) as
        | SearchResult[]
        | { detail?: string };

      if (!response.ok) {
        setResults([]);
        setHasSearched(false);
        setError(
          "detail" in payload && payload.detail
            ? payload.detail
            : "Recipe search failed.",
        );
        return;
      }

      setResults(payload as SearchResult[]);
      setHasSearched(true);
    } catch {
      setResults([]);
      setHasSearched(false);
      setError("Unable to search recipes right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-10 w-full max-w-3xl space-y-6">
      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
        <input
          className="min-w-0 flex-1 rounded-full border border-ink/10 bg-white px-5 py-3 text-base outline-none placeholder:text-ink/35 focus:border-gold focus:shadow-[0_0_0_4px_rgba(199,152,68,0.16)]"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search recipes"
          aria-label="Search recipes"
        />
        <button
          className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#1b3930] disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Searching..." : "Search"}
        </button>
      </form>

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {hasSearched ? (
        <div className="rounded-[1.5rem] border border-ink/10 bg-white/70 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-ink/55">
            Search Results
          </h2>

          {results.length ? (
            <ul className="mt-4 space-y-3">
              {results.map((result) => (
                <li
                  key={result.title}
                  className="rounded-2xl border border-ink/8 bg-cream/70 px-4 py-3 text-base text-ink"
                >
                  {result.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-ink/65">No matching recipes found.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
