import axios from '../axios'

// Note: axios.ts already sets baseURL to 'http://localhost:8000/api/v1'
const API_BASE = '/recommendations'

export interface ProductDetails {
  asin: string
  title: string
  description?: string
  image_url?: string | null
  price?: number | null
  rating?: number | null
  rating_count?: number | null
  store?: string | null
  categories?: string[]
}

export interface RecommendationItem extends ProductDetails {
  similarity?: number
  score?: number
  method: string
}

export interface RecommendationResponse {
  product_asin: string
  method: string
  source_product?: ProductDetails
  recommendations: RecommendationItem[]
}

export interface RecommendationStats {
  status: string
  total_products: number
  products_with_content: number
  products_with_metadata: number
  models_loaded: {
    knn: boolean
    tfidf: boolean
    item_user_matrix: boolean
    tfidf_matrix: boolean
  }
}

export interface ProductListResponse {
  products: ProductDetails[]
  total: number
  offset: number
  limit: number
}

// Get system statistics
export const getRecommendationStats = async (): Promise<RecommendationStats> => {
  const response = await axios.get(`${API_BASE}/stats`)
  return response.data
}

// Get paginated products
export const getAvailableProducts = async (
  limit: number = 20,
  offset: number = 0
): Promise<ProductListResponse> => {
  const response = await axios.get(`${API_BASE}/products`, {
    params: { limit, offset }
  })
  return response.data
}

// Search products
export const searchProducts = async (
  query: string,
  limit: number = 20
): Promise<{ results: ProductDetails[]; query: string; count: number }> => {
  const response = await axios.get(`${API_BASE}/search`, {
    params: { q: query, limit }
  })
  return response.data
}

// Get product details
export const getProductDetails = async (asin: string): Promise<ProductDetails> => {
  const response = await axios.get(`${API_BASE}/product/${asin}`)
  return response.data
}

// Get collaborative filtering recommendations
export const getCollaborativeRecommendations = async (
  productAsin: string,
  n: number = 6
): Promise<RecommendationResponse> => {
  const response = await axios.get(`${API_BASE}/collaborative/${productAsin}`, {
    params: { n }
  })
  return response.data
}

// Get content-based recommendations
export const getContentRecommendations = async (
  productAsin: string,
  n: number = 6
): Promise<RecommendationResponse> => {
  const response = await axios.get(`${API_BASE}/content/${productAsin}`, {
    params: { n }
  })
  return response.data
}

// Get hybrid recommendations
export const getHybridRecommendations = async (
  productAsin: string,
  n: number = 6,
  cfWeight: number = 0.6
): Promise<RecommendationResponse> => {
  const response = await axios.get(`${API_BASE}/hybrid/${productAsin}`, {
    params: { n, cf_weight: cfWeight }
  })
  return response.data
}
