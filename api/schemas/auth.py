from typing import Annotated

from pydantic import BaseModel, EmailStr, Field, StringConstraints

NonEmptyStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]

class RegisterRequest(BaseModel):
    """
    Schema for user registration and login requests.
    Contains a user's email and password fields required for authentication.
    """

    email: EmailStr = Field(description="a user email address associated with the account", examples=["john.doe@tuscandreams.biz"])
    password: NonEmptyStr = Field(description="a user's secret password", examples=["12345678"])
    organization: NonEmptyStr = Field(description="a user's organization they work for", examples=["Tuscan Dreams"])

class LoginRequest(BaseModel):
    """
    Schema for user login requests.
    Contains a user's email and password fields required for authentication.
    """

    username: EmailStr = Field(description="a user email address associated with the account", examples=["john.doe@tuscandreams.biz"])
    password: NonEmptyStr = Field(description="a user's secret password", examples=["12345678"])

class TokenResponse(BaseModel):
    """
    Schema for responses containing access and refresh tokens.
    """

    access_token: str = Field(description="access token")
    refresh_token: str = Field(description="refresh token")
    token_type: str = "bearer"
