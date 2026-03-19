from beanie import Document
from pydantic import BaseModel, Field, StringConstraints
from pymongo import ASCENDING, IndexModel
from typing import Annotated, List

NonEmptyStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]

class Ingredient(BaseModel):
    """
    Defines a food ingredient and its quantity
    """

    name: NonEmptyStr = Field(description="Ingredient name and details")
    quantity: NonEmptyStr = Field(description="Quantity and unit")

class Recipe(Document):
    """
    Defines a recipe representing everything needed to prepare a food dish
    """

    organization: NonEmptyStr = Field(description="Organization that owns this recipe")
    title: str = Field(description="Recipe title")
    yieldAmount: int = Field(description="Number of servings")
    ingredients: List[Ingredient] = Field(description="List of ingredients")
    instructions: List[NonEmptyStr] = Field(description="Step-by-step instructions")

    def __str__(self):
        return f"'{self.title}': owned by {self.organization}"

    class Config:
        json_schema_extra = {
            "description": "A Recipe represents everything needed to prepare a food dish"
        }
    
    class Settings:
        name = "recipes"
        indexes = [
            IndexModel(
                [("organization", ASCENDING), ("title", ASCENDING)],
                unique=True,
            )
        ]
