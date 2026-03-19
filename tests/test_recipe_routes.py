import os
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import warnings
from pydantic.warnings import PydanticDeprecatedSince20

from fastapi import FastAPI
from fastapi.testclient import TestClient

os.environ.setdefault("MONGO_HOST_PORT", "27017")
os.environ.setdefault("MONGO_APP_USER", "test-user")
os.environ.setdefault("MONGO_APP_PASSWORD", "test-password")
os.environ.setdefault("MONGO_APP_DB", "test-db")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret")

from api.auth.endpoint_dependencies import get_current_user
from api.routes import recipe as recipe_routes
from api.models.recipe import Ingredient

warnings.filterwarnings(
    "ignore",
    message=r".*Using extra keyword arguments on `Field` is deprecated.*",
)

class RecipeRouteTests(unittest.TestCase):
    def setUp(self):
        app = FastAPI()
        app.include_router(recipe_routes.router)
        app.dependency_overrides[get_current_user] = self._get_current_user
        self.client = TestClient(app)

    @staticmethod
    async def _get_current_user():
        return SimpleNamespace(organization="Tuscan Dreams")

    @staticmethod
    def _recipe_document(title="Chicken Marsala"):
        return SimpleNamespace(
            organization="Tuscan Dreams",
            title=title,
            yieldAmount=4,
            ingredients=[{"name": "Chicken breast", "quantity": "2 pieces"}],
            instructions=["Saute chicken", "Add marsala wine"],
        )

    @staticmethod
    def _recipe_write_payload():
        return {
            "yieldAmount": 4,
            "ingredients": [
                {"name": "Chicken breast", "quantity": "2 pieces"},
            ],
            "instructions": ["Saute chicken", "Add marsala wine"],
        }

    def test_get_recipe_returns_matching_results_for_user_organization(self):
        cursor = SimpleNamespace(
            to_list=AsyncMock(return_value=[self._recipe_document()])
        )

        with patch.object(recipe_routes, "RecipeModel") as mock_model:
            mock_model.find_many.return_value = cursor

            response = self.client.get("/recipe/chicken")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            [{
                "organization": "Tuscan Dreams",
                "title": "Chicken Marsala",
                "yieldAmount": 4,
                "ingredients": [{"name": "Chicken breast", "quantity": "2 pieces"}],
                "instructions": ["Saute chicken", "Add marsala wine"],
            }],
        )
        mock_model.find_many.assert_called_once_with({
            "organization": "Tuscan Dreams",
            "title": {"$regex": ".*chicken.*", "$options": "i"},
        })
        cursor.to_list.assert_awaited_once_with(length=10)

    def test_get_recipe_returns_404_when_no_matches_exist(self):
        cursor = SimpleNamespace(to_list=AsyncMock(return_value=[]))

        with patch.object(recipe_routes, "RecipeModel") as mock_model:
            mock_model.find_many.return_value = cursor

            response = self.client.get("/recipe/unknown")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"detail": "Recipe not found"})

    def test_create_recipe_returns_created_recipe(self):
        created_document = self._recipe_document()
        created_document.save = AsyncMock()

        with patch.object(recipe_routes, "RecipeModel") as mock_model:
            mock_model.find_one = AsyncMock(return_value=None)
            mock_model.return_value = created_document

            response = self.client.post(
                "/recipe/Chicken Marsala",
                json=self._recipe_write_payload(),
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["title"], "Chicken Marsala")
        self.assertEqual(response.json()["organization"], "Tuscan Dreams")
        mock_model.find_one.assert_awaited_once_with({
            "organization": "Tuscan Dreams",
            "title": "Chicken Marsala",
        })
        mock_model.assert_called_once_with(
            organization="Tuscan Dreams",
            title="Chicken Marsala",
            yieldAmount=4,
            ingredients=[Ingredient(name="Chicken breast", quantity="2 pieces")],
            instructions=["Saute chicken", "Add marsala wine"],
        )
        created_document.save.assert_awaited_once()

    def test_create_recipe_returns_409_for_duplicate_title(self):
        with patch.object(recipe_routes, "RecipeModel") as mock_model:
            mock_model.find_one = AsyncMock(return_value=self._recipe_document())

            response = self.client.post(
                "/recipe/Chicken Marsala",
                json=self._recipe_write_payload(),
            )

        self.assertEqual(response.status_code, 409)
        self.assertEqual(
            response.json(),
            {"detail": "A recipe with that title already exists in your organization"},
        )

    def test_create_recipe_returns_422_for_missing_required_fields(self):
        response = self.client.post(
            "/recipe/Chicken Marsala",
            json={"ingredients": [{"name": "Chicken breast", "quantity": "2 pieces"}]},
        )

        self.assertEqual(response.status_code, 422)

    def test_update_recipe_returns_updated_recipe(self):
        document = self._recipe_document()
        document.save = AsyncMock()

        with patch.object(recipe_routes, "RecipeModel") as mock_model:
            mock_model.find_one = AsyncMock(return_value=document)

            response = self.client.put(
                "/recipe/Chicken Marsala",
                json={
                    "yieldAmount": 6,
                    "ingredients": [{"name": "Chicken thigh", "quantity": "3 pieces"}],
                    "instructions": ["Brown chicken", "Finish sauce"],
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["yieldAmount"], 6)
        self.assertEqual(response.json()["title"], "Chicken Marsala")
        self.assertEqual(
            response.json()["ingredients"],
            [{"name": "Chicken thigh", "quantity": "3 pieces"}],
        )
        self.assertEqual(document.organization, "Tuscan Dreams")
        self.assertEqual(document.title, "Chicken Marsala")
        self.assertEqual(document.yieldAmount, 6)
        document.save.assert_awaited_once()

    def test_update_recipe_returns_404_when_recipe_missing(self):
        with patch.object(recipe_routes, "RecipeModel") as mock_model:
            mock_model.find_one = AsyncMock(return_value=None)

            response = self.client.put(
                "/recipe/Chicken Marsala",
                json=self._recipe_write_payload(),
            )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"detail": "Recipe not found"})

    def test_delete_recipe_returns_success_payload(self):
        document = self._recipe_document()
        document.delete = AsyncMock()

        with patch.object(recipe_routes, "RecipeModel") as mock_model:
            mock_model.find_one = AsyncMock(return_value=document)

            response = self.client.delete("/recipe/Chicken Marsala")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"deleted": True, "title": "Chicken Marsala"})
        document.delete.assert_awaited_once()

    def test_delete_recipe_returns_500_when_delete_fails(self):
        document = self._recipe_document()
        document.delete = AsyncMock(side_effect=Exception("delete failed"))

        with patch.object(recipe_routes, "RecipeModel") as mock_model:
            mock_model.find_one = AsyncMock(return_value=document)

            response = self.client.delete("/recipe/Chicken Marsala")

        self.assertEqual(response.status_code, 500)
        self.assertEqual(response.json(), {"detail": "Recipe could not be deleted"})


if __name__ == "__main__":
    unittest.main()
