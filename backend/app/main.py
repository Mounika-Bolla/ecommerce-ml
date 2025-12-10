from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config.config import settings
from .routers.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # MongoDB is optional - recommendations work without it
    try:
        from beanie import init_beanie
        from motor.motor_asyncio import AsyncIOMotorClient
        from .auth.auth import get_hashed_password
        from .models.users import User
        
        app.state.client = AsyncIOMotorClient(
            settings.MONGO_HOST,
            settings.MONGO_PORT,
            username=settings.MONGO_USER,
            password=settings.MONGO_PASSWORD,
            serverSelectionTimeoutMS=5000,
        )
        await init_beanie(
            database=app.state.client[settings.MONGO_DB], document_models=[User]
        )

        user = await User.find_one({"email": settings.FIRST_SUPERUSER})
        if not user:
            user = User(
                email=settings.FIRST_SUPERUSER,
                hashed_password=get_hashed_password(settings.FIRST_SUPERUSER_PASSWORD),
                is_superuser=True,
            )
            await user.create()

        print("✅ MongoDB connected successfully!")
        app.state.mongodb_available = True
    except Exception as e:
        print(f"⚠️ MongoDB not available: {e}")
        print("   Recommendations API will still work!")
        app.state.mongodb_available = False

    yield


app = FastAPI(
    title="E-Commerce Recommendation System",
    description="AI-powered product recommendations for e-commerce",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)
