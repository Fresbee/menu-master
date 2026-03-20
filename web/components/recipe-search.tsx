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

function cloneRecipe(recipe: Recipe): Recipe {
  return {
    title: recipe.title,
    yieldAmount: recipe.yieldAmount,
    ingredients: recipe.ingredients.map((ingredient) => ({ ...ingredient })),
    instructions: [...recipe.instructions],
  };
}

export function RecipeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [draftRecipe, setDraftRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function selectRecipe(recipe: Recipe) {
    setSelectedRecipe(recipe);
    setDraftRecipe(null);
    setIsEditing(false);
    setSaveError("");
    setDeleteError("");
    setIsDeleteModalOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Enter a search phrase to find recipes.");
      setResults([]);
      setSelectedRecipe(null);
      setDraftRecipe(null);
      setHasSearched(false);
      setIsEditing(false);
      setIsDeleteModalOpen(false);
      return;
    }

    setError("");
    setSaveError("");
    setDeleteError("");
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
        setDraftRecipe(null);
        setHasSearched(false);
        setIsEditing(false);
        setIsDeleteModalOpen(false);
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
      setDraftRecipe(null);
      setHasSearched(true);
      setIsEditing(false);
      setIsDeleteModalOpen(false);
    } catch {
      setResults([]);
      setSelectedRecipe(null);
      setDraftRecipe(null);
      setHasSearched(false);
      setIsEditing(false);
      setIsDeleteModalOpen(false);
      setError("Unable to search recipes right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditing() {
    if (!selectedRecipe) {
      return;
    }

    setDraftRecipe(cloneRecipe(selectedRecipe));
    setSaveError("");
    setDeleteError("");
    setIsDeleteModalOpen(false);
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraftRecipe(null);
    setSaveError("");
    setIsEditing(false);
  }

  function updateDraftTitle(title: string) {
    setDraftRecipe((current) =>
      current
        ? {
            ...current,
            title,
          }
        : current,
    );
  }

  function updateDraftYield(yieldAmount: number) {
    setDraftRecipe((current) =>
      current
        ? {
            ...current,
            yieldAmount,
          }
        : current,
    );
  }

  function updateIngredient(index: number, field: keyof Ingredient, value: string) {
    setDraftRecipe((current) => {
      if (!current) {
        return current;
      }

      const ingredients = current.ingredients.map((ingredient, ingredientIndex) =>
        ingredientIndex === index
          ? {
              ...ingredient,
              [field]: value,
            }
          : ingredient,
      );

      return {
        ...current,
        ingredients,
      };
    });
  }

  function addIngredient() {
    setDraftRecipe((current) =>
      current
        ? {
            ...current,
            ingredients: [...current.ingredients, { quantity: "", name: "" }],
          }
        : current,
    );
  }

  function removeIngredient(index: number) {
    setDraftRecipe((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        ingredients: current.ingredients.filter((_, ingredientIndex) => ingredientIndex !== index),
      };
    });
  }

  function updateInstruction(index: number, value: string) {
    setDraftRecipe((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        instructions: current.instructions.map((instruction, instructionIndex) =>
          instructionIndex === index ? value : instruction,
        ),
      };
    });
  }

  function addInstruction() {
    setDraftRecipe((current) =>
      current
        ? {
            ...current,
            instructions: [...current.instructions, ""],
          }
        : current,
    );
  }

  function removeInstruction(index: number) {
    setDraftRecipe((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        instructions: current.instructions.filter((_, instructionIndex) => instructionIndex !== index),
      };
    });
  }

  async function saveRecipe() {
    if (!selectedRecipe || !draftRecipe) {
      return;
    }

    const trimmedTitle = draftRecipe.title.trim();
    const trimmedIngredients = draftRecipe.ingredients.map((ingredient) => ({
      quantity: ingredient.quantity.trim(),
      name: ingredient.name.trim(),
    }));
    const trimmedInstructions = draftRecipe.instructions.map((instruction) => instruction.trim());

    if (!trimmedTitle) {
      setSaveError("Recipe title is required.");
      return;
    }

    if (!Number.isInteger(draftRecipe.yieldAmount) || draftRecipe.yieldAmount <= 0) {
      setSaveError("Yield must be a whole number greater than zero.");
      return;
    }

    if (
      !trimmedIngredients.length ||
      trimmedIngredients.some((ingredient) => !ingredient.quantity || !ingredient.name)
    ) {
      setSaveError("Each ingredient needs both a quantity and a name.");
      return;
    }

    if (!trimmedInstructions.length || trimmedInstructions.some((instruction) => !instruction)) {
      setSaveError("Each instruction step must have text.");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    setDeleteError("");

    try {
      const response = await fetch(
        `/api/recipe/${encodeURIComponent(selectedRecipe.title)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: trimmedTitle,
            yieldAmount: draftRecipe.yieldAmount,
            ingredients: trimmedIngredients,
            instructions: trimmedInstructions,
          }),
        },
      );

      const payload = (await response.json().catch(() => ({}))) as
        | Recipe
        | { detail?: string };

      if (!response.ok) {
        setSaveError(
          "detail" in payload && payload.detail
            ? payload.detail
            : "Recipe update failed.",
        );
        return;
      }

      const updatedRecipe = payload as Recipe;
      setResults((current) =>
        current.map((recipe) =>
          recipe.title === selectedRecipe.title ? updatedRecipe : recipe,
        ),
      );
      setSelectedRecipe(updatedRecipe);
      setDraftRecipe(cloneRecipe(updatedRecipe));
      setIsEditing(false);
    } catch {
      setSaveError("Unable to save recipe right now. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function openDeleteModal() {
    setDeleteError("");
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    if (isDeleting) {
      return;
    }

    setIsDeleteModalOpen(false);
  }

  async function confirmDelete() {
    if (!selectedRecipe) {
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      const response = await fetch(
        `/api/recipe/${encodeURIComponent(selectedRecipe.title)}`,
        {
          method: "DELETE",
        },
      );

      const payload = (await response.json().catch(() => ({}))) as {
        detail?: string;
      };

      if (!response.ok) {
        setDeleteError(payload.detail ?? "Recipe deletion failed.");
        return;
      }

      const nextResults = results.filter(
        (recipe) => recipe.title !== selectedRecipe.title,
      );

      setResults(nextResults);
      setSelectedRecipe(nextResults[0] ?? null);
      setDraftRecipe(null);
      setIsEditing(false);
      setIsDeleteModalOpen(false);
      setDeleteError("");
    } catch {
      setDeleteError("Unable to delete recipe right now. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  const detailRecipe = isEditing ? draftRecipe : selectedRecipe;

  return (
    <>
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
                          onClick={() => selectRecipe(result)}
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
            {detailRecipe ? (
              <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink/55">
                      Recipe Details
                    </p>
                    {isEditing && draftRecipe ? (
                      <div className="mt-3 space-y-4">
                        <label className="block space-y-2">
                          <span className="text-sm font-medium text-ink/75">Recipe Title</span>
                          <input
                            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-base outline-none focus:border-gold focus:shadow-[0_0_0_4px_rgba(199,152,68,0.16)]"
                            type="text"
                            value={draftRecipe.title}
                            onChange={(event) => updateDraftTitle(event.target.value)}
                          />
                        </label>
                        <label className="block max-w-48 space-y-2">
                          <span className="text-sm font-medium text-ink/75">Yield</span>
                          <input
                            className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-base outline-none focus:border-gold focus:shadow-[0_0_0_4px_rgba(199,152,68,0.16)]"
                            type="number"
                            min={1}
                            step={1}
                            value={draftRecipe.yieldAmount}
                            onChange={(event) =>
                              updateDraftYield(
                                Number.parseInt(event.target.value || "0", 10),
                              )
                            }
                          />
                        </label>
                      </div>
                    ) : (
                      <>
                        <h2 className="mt-3 font-display text-4xl text-ink">
                          {detailRecipe.title}
                        </h2>
                        <p className="mt-2 text-base text-ink/70">
                          Yields {detailRecipe.yieldAmount} servings
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-3 self-start">
                    {isEditing ? (
                      <>
                        <button
                          className="inline-flex items-center justify-center rounded-full border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ink hover:border-ink/30 hover:bg-cream"
                          type="button"
                          onClick={cancelEditing}
                          disabled={isSaving}
                        >
                          Cancel
                        </button>
                        <button
                          className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-[#1b3930] disabled:cursor-not-allowed disabled:opacity-60"
                          type="button"
                          onClick={saveRecipe}
                          disabled={isSaving}
                        >
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-[#1b3930]"
                          type="button"
                          onClick={startEditing}
                        >
                          Edit
                        </button>
                        <button
                          className="inline-flex items-center justify-center rounded-full border border-ink/10 bg-white/70 px-5 py-2 text-sm font-semibold text-ink hover:border-ink/20 hover:bg-cream"
                          type="button"
                          onClick={openDeleteModal}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {saveError ? (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {saveError}
                  </p>
                ) : null}

                {deleteError ? (
                  <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {deleteError}
                  </p>
                ) : null}

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-ink/55">
                      Ingredients
                    </h3>
                    {isEditing ? (
                      <button
                        className="text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4"
                        type="button"
                        onClick={addIngredient}
                      >
                        Add Ingredient
                      </button>
                    ) : null}
                  </div>

                  {isEditing && draftRecipe ? (
                    <div className="mt-3 space-y-3">
                      {draftRecipe.ingredients.map((ingredient, index) => (
                        <div
                          key={`ingredient-${index}`}
                          className="grid gap-3 rounded-2xl border border-ink/8 bg-cream/50 p-4 sm:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)_auto]"
                        >
                          <input
                            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-base outline-none focus:border-gold focus:shadow-[0_0_0_4px_rgba(199,152,68,0.16)]"
                            type="text"
                            value={ingredient.quantity}
                            onChange={(event) =>
                              updateIngredient(index, "quantity", event.target.value)
                            }
                            placeholder="Quantity"
                          />
                          <input
                            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-base outline-none focus:border-gold focus:shadow-[0_0_0_4px_rgba(199,152,68,0.16)]"
                            type="text"
                            value={ingredient.name}
                            onChange={(event) =>
                              updateIngredient(index, "name", event.target.value)
                            }
                            placeholder="Ingredient name"
                          />
                          <button
                            className="inline-flex items-center justify-center rounded-full border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                            type="button"
                            onClick={() => removeIngredient(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {detailRecipe.ingredients.map((ingredient, index) => (
                        <li
                          key={`${ingredient.quantity}-${ingredient.name}-${index}`}
                          className="text-base text-ink"
                        >
                          {ingredient.quantity} {ingredient.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-ink/55">
                      Instructions
                    </h3>
                    {isEditing ? (
                      <button
                        className="text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4"
                        type="button"
                        onClick={addInstruction}
                      >
                        Add Step
                      </button>
                    ) : null}
                  </div>

                  {isEditing && draftRecipe ? (
                    <div className="mt-3 space-y-3">
                      {draftRecipe.instructions.map((instruction, index) => (
                        <div
                          key={`instruction-${index}`}
                          className="grid gap-3 rounded-2xl border border-ink/8 bg-cream/50 p-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-start"
                        >
                          <span className="pt-3 text-sm font-semibold text-ink/70">
                            {index + 1}.
                          </span>
                          <textarea
                            className="min-h-24 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-base outline-none focus:border-gold focus:shadow-[0_0_0_4px_rgba(199,152,68,0.16)]"
                            value={instruction}
                            onChange={(event) =>
                              updateInstruction(index, event.target.value)
                            }
                            placeholder="Describe this step"
                          />
                          <button
                            className="inline-flex items-center justify-center rounded-full border border-red-200 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-50"
                            type="button"
                            onClick={() => removeInstruction(index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ol className="mt-3 space-y-3 text-base text-ink">
                      {detailRecipe.instructions.map((instruction, index) => (
                        <li
                          key={`${detailRecipe.title}-step-${index}`}
                          className="flex gap-3"
                        >
                          <span className="font-semibold text-ink/70">{index + 1}.</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  )}
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

      {isDeleteModalOpen && selectedRecipe ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 px-6">
          <div className="w-full max-w-md rounded-[1.75rem] border border-white/60 bg-white p-6 shadow-card">
            <h2 className="font-display text-3xl text-ink">Delete Recipe</h2>
            <p className="mt-4 text-base leading-7 text-ink/75">
              Are you sure you would like to delete this recipe? This action cannot
              be reversed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="inline-flex items-center justify-center rounded-full border border-ink/12 bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:border-ink/25 hover:bg-cream"
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                No
              </button>
              <button
                className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1b3930] disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
