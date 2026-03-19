from typing import Annotated

from pydantic import BaseModel, Field, StringConstraints

from api.models.recipe import Ingredient

NonEmptyStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]

class RecipeWrite(BaseModel):
    yieldAmount: int = Field(
        description="number of servings the recipe yields",
        examples=[4],
        gt=0,
    )
    ingredients: list[Ingredient] = Field(
        description="list of ingredients and their measurements",
        min_length=1,
    )
    instructions: list[NonEmptyStr] = Field(
        description="step-by-step instructions",
        min_length=1,
    )

class Recipe(RecipeWrite):
    organization: NonEmptyStr = Field(
        description="restaurant that owns this recipe as intellectual property",
        examples=["Tuscan Dreams"],
    )
    title: str = Field(..., description="name of the recipe", examples=["Chicken Marsala"])

    class Config:
        json_schema_extra = {
            "description": "A complete list of ingredients and steps needed to create a food dish"
        }
