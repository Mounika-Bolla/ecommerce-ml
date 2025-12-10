"""
Demand Analytics API endpoints.
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional

from ..services.demand_service import demand_service

router = APIRouter()


# Pydantic models
class DemandStats(BaseModel):
    status: str
    total_products: int = 0
    total_weeks: int = 0
    total_demand: int = 0
    time_range: dict = {}
    assumption: str = ""


class TopProduct(BaseModel):
    asin: str
    title: str
    total_demand: int
    avg_weekly_demand: float
    num_weeks: int
    avg_rating: Optional[float] = None


class TimeSeriesPoint(BaseModel):
    week: str
    demand: int
    rating: Optional[float] = None


class ProductDemand(BaseModel):
    asin: str
    title: str
    total_demand: int
    avg_demand: float
    max_demand: int
    min_demand: int
    trend: str
    time_series: list[TimeSeriesPoint]


class OverallTrend(BaseModel):
    week: str
    total_demand: int
    active_products: int


class CategoryDemand(BaseModel):
    category: str
    total_demand: int
    num_products: int


class ForecastPoint(BaseModel):
    week: str
    demand: float
    is_forecast: bool


class ProductForecast(BaseModel):
    asin: str
    title: str
    model_type: str
    model_mae: float
    forecast_weeks: int
    historical: list[ForecastPoint]
    forecast: list[ForecastPoint]
    combined: list[ForecastPoint]


@router.get("/stats", response_model=DemandStats)
async def get_demand_stats():
    """Get overall demand statistics."""
    stats = demand_service.get_stats()
    return DemandStats(**stats)


@router.get("/top-products", response_model=list[TopProduct])
async def get_top_products(
    limit: int = Query(20, ge=1, le=100, description="Number of products")
):
    """Get top products by total demand."""
    products = demand_service.get_top_products(limit)
    return [TopProduct(**p) for p in products]


@router.get("/product/{asin}", response_model=ProductDemand)
async def get_product_demand(asin: str):
    """Get demand time series for a specific product."""
    data = demand_service.get_product_demand(asin)
    if not data:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductDemand(**data)


@router.get("/overall-trend", response_model=list[OverallTrend])
async def get_overall_trend():
    """Get overall demand trend aggregated by week."""
    trend = demand_service.get_overall_trend()
    return [OverallTrend(**t) for t in trend]


@router.get("/categories", response_model=list[CategoryDemand])
async def get_category_demand():
    """Get demand breakdown by category."""
    categories = demand_service.get_category_demand()
    return [CategoryDemand(**c) for c in categories]


@router.get("/forecast/{asin}", response_model=ProductForecast)
async def get_product_forecast(
    asin: str,
    weeks: int = Query(8, ge=1, le=16, description="Number of weeks to forecast")
):
    """Generate demand forecast for a specific product."""
    forecast = demand_service.generate_forecast(asin, weeks)
    if not forecast:
        raise HTTPException(
            status_code=404, 
            detail="Product not found or insufficient data for forecasting"
        )
    return ProductForecast(**forecast)

