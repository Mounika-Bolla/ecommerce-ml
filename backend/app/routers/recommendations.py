"""
Recommendation API endpoints.
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

from ..services.recommendation_service import recommendation_service

router = APIRouter()


# Pydantic models
class ProductDetails(BaseModel):
    asin: str
    title: str
    description: Optional[str] = ""
    image_url: Optional[str] = None
    price: Optional[float] = None
    rating: Optional[float] = None
    rating_count: Optional[int] = None
    store: Optional[str] = None
    categories: list[str] = []


class RecommendationItem(BaseModel):
    asin: str
    title: str
    description: Optional[str] = ""
    image_url: Optional[str] = None
    price: Optional[float] = None
    rating: Optional[float] = None
    rating_count: Optional[int] = None
    store: Optional[str] = None
    categories: list[str] = []
    similarity: Optional[float] = None
    score: Optional[float] = None
    method: str


class RecommendationResponse(BaseModel):
    product_asin: str
    method: str
    source_product: Optional[ProductDetails] = None
    recommendations: list[RecommendationItem]


class ProductListResponse(BaseModel):
    products: list[ProductDetails]
    total: int
    offset: int = 0
    limit: int = 100


class RecommendationStats(BaseModel):
    status: str
    total_products: int = 0
    products_with_content: int = 0
    products_with_metadata: int = 0
    models_loaded: dict = {}


@router.get("/stats", response_model=RecommendationStats)
async def get_recommendation_stats():
    """Get statistics about the recommendation system."""
    stats = recommendation_service.get_stats()
    return RecommendationStats(**stats)


@router.get("/products", response_model=ProductListResponse)
async def get_available_products(
    limit: int = Query(20, ge=1, le=100, description="Max products to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination")
):
    """Get paginated list of products with details."""
    result = recommendation_service.get_available_products(limit, offset)
    return ProductListResponse(**result)


@router.get("/search")
async def search_products(
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(20, ge=1, le=50, description="Max results")
):
    """Search products by title."""
    results = recommendation_service.search_products(q, limit)
    return {"results": results, "query": q, "count": len(results)}


@router.get("/product/{product_asin}", response_model=ProductDetails)
async def get_product_details(product_asin: str):
    """Get detailed information about a specific product."""
    details = recommendation_service.get_product_details(product_asin)
    if not details:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductDetails(**details)


@router.get("/collaborative/{product_asin}", response_model=RecommendationResponse)
async def get_collaborative_recommendations(
    product_asin: str,
    n: int = Query(6, ge=1, le=20, description="Number of recommendations")
):
    """
    Collaborative Filtering: "Customers who bought this also bought..."
    Uses item-based KNN on user-item interaction matrix.
    """
    if not recommendation_service.is_ready:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    recommendations = recommendation_service.get_collaborative_recommendations(product_asin, n)
    
    if not recommendations:
        raise HTTPException(status_code=404, detail=f"Product {product_asin} not found")
    
    source = recommendation_service.get_product_details(product_asin)
    
    return RecommendationResponse(
        product_asin=product_asin,
        method="collaborative",
        source_product=ProductDetails(**source) if source else None,
        recommendations=[RecommendationItem(**r) for r in recommendations]
    )


@router.get("/content/{product_asin}", response_model=RecommendationResponse)
async def get_content_recommendations(
    product_asin: str,
    n: int = Query(6, ge=1, le=20, description="Number of recommendations")
):
    """
    Content-Based Filtering: "Similar products you might like..."
    Uses TF-IDF on product titles and categories.
    """
    if not recommendation_service.is_ready:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    recommendations = recommendation_service.get_content_recommendations(product_asin, n)
    
    if not recommendations:
        raise HTTPException(status_code=404, detail=f"Product {product_asin} not found")
    
    source = recommendation_service.get_product_details(product_asin)
    
    return RecommendationResponse(
        product_asin=product_asin,
        method="content",
        source_product=ProductDetails(**source) if source else None,
        recommendations=[RecommendationItem(**r) for r in recommendations]
    )


@router.get("/hybrid/{product_asin}", response_model=RecommendationResponse)
async def get_hybrid_recommendations(
    product_asin: str,
    n: int = Query(6, ge=1, le=20, description="Number of recommendations"),
    cf_weight: float = Query(0.6, ge=0, le=1, description="CF weight (0-1)")
):
    """
    Hybrid: Best of both worlds!
    Combines Collaborative Filtering + Content-Based for optimal results.
    """
    if not recommendation_service.is_ready:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    recommendations = recommendation_service.get_hybrid_recommendations(product_asin, n, cf_weight)
    
    if not recommendations:
        raise HTTPException(status_code=404, detail=f"Product {product_asin} not found")
    
    source = recommendation_service.get_product_details(product_asin)
    
    return RecommendationResponse(
        product_asin=product_asin,
        method="hybrid",
        source_product=ProductDetails(**source) if source else None,
        recommendations=[RecommendationItem(**r) for r in recommendations]
    )
