import axios from '../axios'

const API_BASE = '/demand'

export interface DemandStats {
  status: string
  total_products: number
  total_weeks: number
  total_demand: number
  time_range: {
    start: string | null
    end: string | null
  }
  assumption: string
}

export interface TopProduct {
  asin: string
  title: string
  total_demand: number
  avg_weekly_demand: number
  num_weeks: number
  avg_rating: number | null
}

export interface TimeSeriesPoint {
  week: string
  demand: number
  rating: number | null
}

export interface ProductDemand {
  asin: string
  title: string
  total_demand: number
  avg_demand: number
  max_demand: number
  min_demand: number
  trend: string
  time_series: TimeSeriesPoint[]
}

export interface OverallTrend {
  week: string
  total_demand: number
  active_products: number
}

export interface CategoryDemand {
  category: string
  total_demand: number
  num_products: number
}

export interface ForecastPoint {
  week: string
  demand: number
  is_forecast: boolean
}

export interface ProductForecast {
  asin: string
  title: string
  model_type: string
  model_mae: number
  forecast_weeks: number
  historical: ForecastPoint[]
  forecast: ForecastPoint[]
  combined: ForecastPoint[]
}

export const getDemandStats = async (): Promise<DemandStats> => {
  const response = await axios.get(`${API_BASE}/stats`)
  return response.data
}

export const getTopProducts = async (limit: number = 20): Promise<TopProduct[]> => {
  const response = await axios.get(`${API_BASE}/top-products`, { params: { limit } })
  return response.data
}

export const getProductDemand = async (asin: string): Promise<ProductDemand> => {
  const response = await axios.get(`${API_BASE}/product/${asin}`)
  return response.data
}

export const getOverallTrend = async (): Promise<OverallTrend[]> => {
  const response = await axios.get(`${API_BASE}/overall-trend`)
  return response.data
}

export const getCategoryDemand = async (): Promise<CategoryDemand[]> => {
  const response = await axios.get(`${API_BASE}/categories`)
  return response.data
}

export const getProductForecast = async (asin: string, weeks: number = 8): Promise<ProductForecast> => {
  const response = await axios.get(`${API_BASE}/forecast/${asin}`, { params: { weeks } })
  return response.data
}

