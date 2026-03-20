"use client";

import { FormEvent, useState } from "react";

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

export function RecipeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Enter a search phrase to find recipes.");
      setResults([]);
      setSelectedRecipe(null);
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
        | Recipe[]
        | { detail?: string };

      if (!response.ok) {
        setResults([]);
        setSelectedRecipe(null);
        setHasSearched(false);
        setError(
          "detail" in payload && payload.detail
            ? payload.detail
            : "Recipe search failed.",
        );
        return;
      }

      const recipes = payload as Recipe[];
      setResults(recipes);
      setSelectedRecipe(recipes[0] ?? null);
      setHasSearched(true);
    } catch {
      setResults([]);
      setSelectedRecipe(null);
      setHasSearched(false);
      setError("Unable to search recipes right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-10 flex w-full flex-1 flex-col">
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
        <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid flex-1 gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-[1.5rem] border border-ink/10 bg-white/70 p-5 text-left">
          <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-ink/55">
            Search Results
          </h2>

          {hasSearched ? (
            results.length ? (
              <ul className="mt-4 space-y-3">
                {results.map((result) => {
                  const isSelected = selectedRecipe?.title === result.title;

                  return (
                    <li key={result.title}>
                      <button
                        className={`w-full rounded-2xl border px-4 py-3 text-left text-base transition ${
                          isSelected
                            ? "border-gold bg-gold/15 text-ink shadow-sm"
                            : "border-ink/8 bg-cream/70 text-ink hover:border-ink/20 hover:bg-white"
                        }`}
                        type="button"
                        onClick={() => setSelectedRecipe(result)}
                      >
                        {result.title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-ink/65">No matching recipes found.</p>
            )
          ) : (
            <p className="mt-4 text-sm text-ink/65">
              Search for a recipe to view matching results.
            </p>
          )}
        </div>

        <div className="rounded-[1.5rem] border border-ink/10 bg-white/70 p-5 text-left">
          {selectedRecipe ? (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink/55">
                  Recipe Details
                </p>
                <h2 className="mt-3 font-display text-4xl text-ink">
                  {selectedRecipe.title}
                </h2>
                <p className="mt-2 text-base text-ink/70">
                  Yields {selectedRecipe.yieldAmount} servings
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-ink/55">
                  Ingredients
                </h3>
                <ul className="mt-3 space-y-2">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <li key={`${ingredient.quantity}-${ingredient.name}-${index}`} className="text-base text-ink">
                      {ingredient.quantity} {ingredient.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-ink/55">
                  Instructions
                </h3>
                <ol className="mt-3 space-y-3 text-base text-ink">
                  {selectedRecipe.instructions.map((instruction, index) => (
                    <li key={`${selectedRecipe.title}-step-${index}`} className="flex gap-3">
                      <span className="font-semibold text-ink/70">{index + 1}.</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-72 items-center justify-center rounded-[1.25rem] border border-dashed border-ink/12 bg-cream/40 px-6 text-center">
              <p className="max-w-sm text-sm leading-6 text-ink/60">
                Select a recipe from the search results to view its title, yield,
                ingredients, and step-by-step instructions.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
