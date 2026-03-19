from beanie import Document
from pydantic import EmailStr
from pymongo import ASCENDING, IndexModel

class User(Document):
    """
    Defines a record in the User collection of the MongoDB database.
    """

    email: EmailStr
    password_hash: str
    organization: str
    is_active: bool = True

    class Config:
        json_schema_extra = {
            "description": "A User represents a person who has an account in the system."
        }

    class Settings:
        name = "users"
        indexes = [
            IndexModel(
                [("email", ASCENDING)],
                name="user_email_unique",
                unique=True,
            )
        ]
