from pymongo import AsyncMongoClient
from beanie import init_beanie
from pymongo import ASCENDING

from api.core.config import settings
from api.models.recipe import Recipe
from api.models.refresh_token import RefreshToken
from api.models.user import User

client: AsyncMongoClient | None = None

async def init_db():
    global client
    client = AsyncMongoClient(settings.mongo_database_connection_uri)
    await ensure_user_email_unique_index(client[settings.mongodb_db])

    await init_beanie(
        database=client[settings.mongodb_db],
        document_models=[
            Recipe,
            RefreshToken,
            User
        ]
    )

async def close_db():
    global client
    if client:
        await client.close()


async def ensure_user_email_unique_index(database) -> None:
    users_collection = database[User.Settings.name]
    index_info = await users_collection.index_information()

    existing_unique_index = index_info.get("user_email_unique")
    if existing_unique_index and existing_unique_index.get("unique"):
        return

    legacy_email_index = index_info.get("email_1")
    if legacy_email_index and not legacy_email_index.get("unique", False):
        duplicate_cursor = await users_collection.aggregate([
            {
                "$group": {
                    "_id": "$email",
                    "count": {"$sum": 1},
                }
            },
            {
                "$match": {
                    "count": {"$gt": 1}
                }
            },
            {"$limit": 1}
        ])
        duplicates = await duplicate_cursor.to_list(length=1)
        if duplicates:
            raise RuntimeError(
                "Cannot convert users.email to a unique index because duplicate email records already exist."
            )

        await users_collection.drop_index("email_1")

    await users_collection.create_index(
        [("email", ASCENDING)],
        name="user_email_unique",
        unique=True,
    )
