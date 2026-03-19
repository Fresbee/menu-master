from fastapi import APIRouter, Depends, status, HTTPException, Path, Query
import re

from api.schemas.recipe import Recipe as RecipeSchema
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
