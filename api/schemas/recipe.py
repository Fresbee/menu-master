from pydantic import BaseModel, Field
from api.models.recipe import Ingredient

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
    instructions: list[str] = Field(
        description="step-by-step instructions",
        min_length=1,
    )

class Recipe(RecipeWrite):
    organization: str = Field(
        description="restaurant that owns this recipe as intellectual property",
        examples=["Tuscan Dreams"],
    )
    title: str = Field(..., description="name of the recipe", examples=["Chicken Marsala"])

    class Config:
        json_schema_extra = {
            "description": "A complete list of ingredients and steps needed to create a food dish"
        }
