from fastapi import APIRouter, Request

from . import recommendations, demand

api_router = APIRouter()

# Recommendations API
api_router.include_router(
    recommendations.router, 
    prefix="/recommendations", 
    tags=["recommendations"]
)

# Demand Analytics API
api_router.include_router(
    demand.router,
    prefix="/demand",
    tags=["demand"]
)


@api_router.get("/")
async def root():
    return {
        "message": "E-Commerce Recommendation API",
        "version": "1.0.0",
        "endpoints": {
            "recommendations": "/api/v1/recommendations",
            "docs": "/api/v1/docs"
        }
    }


@api_router.get("/health")
async def health_check(request: Request):
    mongodb_status = getattr(request.app.state, 'mongodb_available', False)
    return {
        "status": "healthy",
        "mongodb": "connected" if mongodb_status else "not_connected",
        "recommendations": "available"
    }
