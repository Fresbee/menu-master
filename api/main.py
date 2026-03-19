from fastapi import FastAPI, HTTPException, status
from contextlib import asynccontextmanager

from api.core.database import init_db, close_db
from api.routes.authentication import router as authentication_router
from api.routes.recipe import router as recipes_router
from api.models.recipe import Recipe as RecipeModel

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing database connection...", flush=True)
    await init_db()
    print("Database connection initialized", flush=True)
    yield
    print("Closing database connection...", flush=True)
    await close_db()
    print("Database connection closed", flush=True)


app = FastAPI(
    title="Menu Master API",
    summary="Manage your organization's food recipes.",
    description="Search, view, update, and remove recipes when you need them.",
    version="0.1.0",
    license_info={
        "name": "Proprietary",
    },
    lifespan=lifespan,
)

@app.get("/healthcheck",
         summary="Healthcheck endpoint to verify API is running",
         description="A simple endpoint to verify that the API is running and responsive.",
         tags=["Healthcheck"],
         status_code=status.HTTP_200_OK,
         responses={status.HTTP_503_SERVICE_UNAVAILABLE: {"description": "Database service not available"}})
async def health_check() -> dict:
    try:
        # Perform a very small query to ensure relevant DB models and Beanie are ready.
        # This will raise an exception if Beanie wasn't properly initialized.
        doc = await RecipeModel.find_one({})
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=f"Beanie query failed: {e}")

    return {"status": "ready", "db_connected": True, "db_sample_exists": bool(doc)}


app.include_router(authentication_router)
app.include_router(recipes_router)
