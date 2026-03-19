from fastapi import APIRouter, Depends, status, HTTPException, Path, Query, Body
import re
from pymongo.errors import DuplicateKeyError

from api.schemas.recipe import Recipe as RecipeSchema, RecipeWrite
from api.models.recipe import Recipe as RecipeModel
from api.auth.endpoint_dependencies import get_current_user
from api.models.user import User

router = APIRouter(prefix="/recipe", tags=["Recipes"])

@router.get("/{search_phrase}",
         summary="Return all recipes that sufficiently match the provided phrase",
         description="The search phrase can be a partial or complete match to a recipe title.",
         status_code=status.HTTP_200_OK,
         responses={status.HTTP_404_NOT_FOUND: {"description": "Recipe not found"}})
async def get_recipe(search_phrase: str = Path(description="partial or complete recipe title to retrieve"),
                    limit: int = Query(10, ge=1, le=100, description="Maximum number of items to return"),
                    user: User = Depends(get_current_user)) -> list[RecipeSchema]:
    # Perform case-insensitive partial-text matching using a regex on the `title` field.
    # Escape the search phrase to avoid regex injection and limit results.
    regex = {"$regex": f".*{re.escape(search_phrase)}.*", "$options": "i"}
    cursor = RecipeModel.find_many({
        "organization": user.organization,
        "title": regex
    })
    results = await cursor.to_list(length=limit)

    if not results:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found")

    return [RecipeSchema(organization=document.organization,
                        title=document.title,
                        yieldAmount=document.yieldAmount,
                        ingredients=getattr(document, "ingredients", []) or [],
                        instructions=getattr(document, "instructions", []) or []) for document in results]

@router.post("/{title}",
         summary="Create a new recipe",
         description="Add a recipe with a unique title. All required fields must be present.",
         status_code=status.HTTP_200_OK,
         responses={
             status.HTTP_409_CONFLICT: {"description": "A recipe with that title already exists in your organization"},
         })
async def create_recipe(title: str = Path(description="complete recipe title to create"),
                        recipe: RecipeWrite = Body(description="new recipe contents"),
                        user: User = Depends(get_current_user)) -> RecipeSchema:
    document = await RecipeModel.find_one({
        "organization": user.organization,
        "title": title,
    })

    if document:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A recipe with that title already exists in your organization")

    document = RecipeModel(
        organization=user.organization,
        title=title,
        yieldAmount=recipe.yieldAmount,
        ingredients=recipe.ingredients,
        instructions=recipe.instructions,
    )

    try:
        await document.save()
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A recipe with that title already exists in your organization",
        )

    return RecipeSchema(
        organization=document.organization,
        title=document.title,
        yieldAmount=document.yieldAmount,
        ingredients=document.ingredients,
        instructions=document.instructions,
    )

@router.put("/{title}",
         summary="Update a recipe's content that exactly matches the provided title",
         description="The recipe title must be an exact match.",
         status_code=status.HTTP_200_OK,
         responses={
             status.HTTP_404_NOT_FOUND: {"description": "Recipe not found"},
             status.HTTP_409_CONFLICT: {"description": "A recipe with that title already exists in your organization"},
         })
async def update_recipe(title: str = Path(description="complete recipe title to edit"),
                        recipe: RecipeWrite = Body(description="new recipe contents to overwrite the existing data"),
                        user: User = Depends(get_current_user)) -> RecipeSchema:
    document = await RecipeModel.find_one({
        "organization": user.organization,
        "title": title,
    })

    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found")

    document.organization = user.organization
    document.title = title
    document.yieldAmount = recipe.yieldAmount
    document.ingredients = recipe.ingredients
    document.instructions = recipe.instructions

    try:
        await document.save()
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A recipe with that title already exists in your organization",
        )

    return RecipeSchema(
        organization=document.organization,
        title=document.title,
        yieldAmount=document.yieldAmount,
        ingredients=document.ingredients,
        instructions=document.instructions,
    )

@router.delete("/{title}",
         summary="Delete a recipe that exactly matches the provided title",
         description="The recipe title must be an exact match.",
         status_code=status.HTTP_200_OK,
         responses={
             status.HTTP_404_NOT_FOUND: {"description": "Recipe not found"},
             status.HTTP_500_INTERNAL_SERVER_ERROR: {"description": "Recipe could not be deleted"},
         })
async def delete_recipe(title: str = Path(description="complete recipe title to delete"),
                        user: User = Depends(get_current_user)):
    document = await RecipeModel.find_one({
        "organization": user.organization,
        "title": title,
    })

    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found")

    try:
        await document.delete()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Recipe could not be deleted",
        )

    return {"deleted": True, "title": title}
