from beanie import Document
from pydantic import BaseModel, Field
from typing import List

class Ingredient(BaseModel):
    """
    Defines a food ingredient and its quantity
    """

    name: str = Field(..., description="Ingredient name and details")
    quantity: str = Field(..., description="Quantity and unit")

class Recipe(Document):
    """
    Defines a recipe representing everything needed to prepare a food dish
    """

    organization: str = Field(..., description="Organization that owns this recipe")
    title: str = Field(..., description="Recipe title")
    yieldAmount: int = Field(..., description="Number of servings")
    ingredients: List[Ingredient] = Field(..., description="List of ingredients")
    instructions: List[str] = Field(..., description="Step-by-step instructions")

    def __str__(self):
        return f"'{self.title}': owned by {self.organization}"

    class Config:
        json_schema_extra = {
            "description": "A Recipe represents everything needed to prepare a food dish"
        }
    
    class Settings:
        name = "recipes"
        indexes = ["title"]
