from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# User models
class UserBase(BaseModel):
    email: str = Field(..., description="User's email address")
    organization: str = Field(..., description="Organization name")

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="User's password")

class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashed_password: str
    disabled: bool = False

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

# Recipe models
class Ingredient(BaseModel):
    name: str = Field(..., description="Ingredient name and details")
    quantity: str = Field(..., description="Quantity and unit")

class RecipeBase(BaseModel):
    organization: str = Field(..., description="Organization that owns this recipe")
    title: str = Field(..., description="Recipe title")
    yieldAmount: int = Field(..., description="Number of servings")
    tags: List[str] = Field(default_factory=list, description="Recipe tags")
    ingredients: List[Ingredient] = Field(..., description="List of ingredients")
    instructions: List[str] = Field(..., description="Step-by-step instructions")

class RecipeCreate(RecipeBase):
    pass

class RecipeUpdate(RecipeBase):
    pass

class RecipeInDB(RecipeBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_by: str = Field(..., description="Email of user who created the recipe")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Recipe(RecipeInDB):
    pass

# Authentication models
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: str = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")

class RegisterRequest(BaseModel):
    email: str = Field(..., description="User's email address")
    password: str = Field(..., min_length=8, description="User's password")
    organization: str = Field(..., description="Organization name")

# Refresh Token model
class RefreshTokenBase(BaseModel):
    token: str
    user_id: str
    expires_at: datetime

class RefreshTokenInDB(RefreshTokenBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}