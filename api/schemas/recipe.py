from pydantic import BaseModel, Field

class Recipe(BaseModel):
    organization: str = Field(description="restaurant that owns this recipe as intellectual property", examples=["Tuscan Dreams"])
    title: str = Field(description="name of the recipe", examples=["Chicken Marsala"])
    yieldAmount: int = Field(description="number of servings the recipe yields", examples=["4"])
    ingredients: list[object] = Field(description="list of ingredients and their measurements")
    instructions: list[str] = Field(description="step-by-step instructions")

    class Config:
        json_schema_extra = {
            "description": "A complete list of ingredients and steps needed to create a food dish"
        }
