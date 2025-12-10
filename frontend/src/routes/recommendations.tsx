import { AutoAwesome, ChevronRight, Refresh, Star, StarBorder } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Fade,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'

import {
  getAvailableProducts,
  getCollaborativeRecommendations,
  getContentRecommendations,
  getHybridRecommendations,
  getRecommendationStats,
  type ProductDetails,
  type RecommendationItem,
  type RecommendationStats,
} from '../services/recommendation.service'

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80'

// Rating stars
function RatingStars({ rating }: { rating: number | null | undefined }) {
  if (!rating) return null
  const fullStars = Math.floor(rating)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
      {[...Array(5)].map((_, i) => (
        <Box key={i} sx={{ color: i < fullStars ? '#ff9f0a' : '#d1d1d6' }}>
          {i < fullStars ? <Star sx={{ fontSize: 14 }} /> : <StarBorder sx={{ fontSize: 14 }} />}
        </Box>
      ))}
      <Typography variant='caption' sx={{ ml: 0.5, color: 'text.secondary' }}>
        {rating.toFixed(1)}
      </Typography>
    </Box>
  )
}

// Product card
function ProductCard({
  product,
  score,
  method,
  index,
  onClick,
  selected,
  compact = false,
}: {
  product: ProductDetails | RecommendationItem
  score?: number
  method?: string
  index: number
  onClick?: () => void
  selected?: boolean
  compact?: boolean
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const imageUrl = product.image_url && !imageError ? product.image_url : PLACEHOLDER_IMAGE

  return (
    <Fade in timeout={300 + index * 80}>
      <Card
        onClick={onClick}
        sx={{
          height: '100%',
          cursor: onClick ? 'pointer' : 'default',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: selected ? '2px solid #0066cc' : '1px solid rgba(0,0,0,0.04)',
          transform: selected ? 'scale(1.02)' : 'none',
        }}
      >
        {/* Image container - fixed aspect ratio */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: compact ? 120 : 160,
            bgcolor: '#f5f5f7',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {!imageLoaded && (
            <Skeleton
              variant='rectangular'
              sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            />
          )}
          <CardMedia
            component='img'
            image={imageUrl}
            alt={product.title}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true)
              setImageLoaded(true)
            }}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '90%',
              maxHeight: '90%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          />
          {score !== undefined && (
            <Chip
              label={`${(score * 100).toFixed(0)}%`}
              size='small'
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor:
                  method === 'collaborative' ? '#34c759' : method === 'content' ? '#0066cc' : '#5856d6',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 22,
              }}
            />
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 1.5 }}>
          {/* Category */}
          {product.categories && product.categories.length > 0 && (
            <Typography
              variant='caption'
              sx={{
                color: '#0066cc',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.65rem',
                mb: 0.25,
              }}
            >
              {product.categories[0]}
            </Typography>
          )}

          {/* Title */}
          <Typography
            variant='body2'
            sx={{
              fontWeight: 600,
              color: '#1d1d1f',
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.3,
              fontSize: '0.8rem',
            }}
          >
            {product.title || 'Unknown Product'}
          </Typography>

          {/* Description */}
          {product.description && !compact && (
            <Typography
              variant='caption'
              sx={{
                color: '#86868b',
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.3,
                fontSize: '0.7rem',
              }}
            >
              {product.description}
            </Typography>
          )}

          <Box sx={{ mt: 'auto' }}>
            <RatingStars rating={product.rating} />
            {product.price && (
              <Typography variant='body2' sx={{ fontWeight: 600, color: '#1d1d1f', mt: 0.25 }}>
                ${product.price.toFixed(2)}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Fade>
  )
}

// Loading grid
function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <Grid container spacing={2}>
      {[...Array(count)].map((_, i) => (
        <Grid key={i} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
          <Card sx={{ height: 280 }}>
            <Skeleton variant='rectangular' height={160} />
            <CardContent>
              <Skeleton variant='text' width='60%' />
              <Skeleton variant='text' width='100%' />
              <Skeleton variant='text' width='40%' />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default function Recommendations() {
  const [stats, setStats] = useState<RecommendationStats | null>(null)
  const [products, setProducts] = useState<ProductDetails[]>([])
  const [selectedProduct, setSelectedProduct] = useState<ProductDetails | null>(null)
  const [method, setMethod] = useState<'collaborative' | 'content' | 'hybrid'>('hybrid')
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([])

  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingRecs, setLoadingRecs] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getRecommendationStats()
        setStats(data)
      } catch {
        setError('Could not connect to API. Make sure backend is running on port 8000.')
      } finally {
        setLoadingStats(false)
      }
    }
    loadStats()
  }, [])

  // Load products when stats ready
  useEffect(() => {
    if (stats?.status === 'ready') {
      loadProducts()
    }
  }, [stats])

  const loadProducts = async () => {
    setLoadingProducts(true)
    try {
      const data = await getAvailableProducts(18, 0)
      setProducts(data.products)
    } catch {
      setError('Failed to load products')
    } finally {
      setLoadingProducts(false)
    }
  }

  // Get recommendations
  const getRecommendationsForProduct = async (product: ProductDetails) => {
    setSelectedProduct(product)
    setLoadingRecs(true)
    setError(null)

    try {
      let response
      switch (method) {
        case 'collaborative':
          response = await getCollaborativeRecommendations(product.asin, 6)
          break
        case 'content':
          response = await getContentRecommendations(product.asin, 6)
          break
        case 'hybrid':
          response = await getHybridRecommendations(product.asin, 6, 0.6)
          break
      }
      setRecommendations(response.recommendations)
    } catch {
      setError('Could not get recommendations for this product')
      setRecommendations([])
    } finally {
      setLoadingRecs(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fbfbfd', pt: 10, pb: 8 }}>
      {/* Hero */}
      <Box sx={{ textAlign: 'center', py: 5, px: 2 }}>
        <Typography
          variant='h4'
          sx={{ fontWeight: 700, color: '#1d1d1f', mb: 1, fontSize: { xs: '1.5rem', md: '2rem' } }}
        >
          Product Recommendations
        </Typography>
        <Typography variant='body2' sx={{ color: '#86868b', mb: 3, maxWidth: 450, mx: 'auto' }}>
          Click any product to discover similar items powered by ML
        </Typography>

        {/* Method selector */}
        <FormControl size='small' sx={{ minWidth: 180 }}>
          <InputLabel>Algorithm</InputLabel>
          <Select
            value={method}
            label='Algorithm'
            onChange={(e) => setMethod(e.target.value as typeof method)}
          >
            <MenuItem value='hybrid'>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#5856d6' }} />
                Hybrid (Best)
              </Box>
            </MenuItem>
            <MenuItem value='collaborative'>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#34c759' }} />
                Collaborative
              </Box>
            </MenuItem>
            <MenuItem value='content'>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#0066cc' }} />
                Content-Based
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Container maxWidth='lg'>
        {error && (
          <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Selected Product & Recommendations */}
        {selectedProduct && (
          <Box
            sx={{
              mb: 5,
              p: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 3,
              color: 'white',
            }}
          >
            {/* Selected product header */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              {/* Image - constrained size */}
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  flexShrink: 0,
                  bgcolor: 'white',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <Box
                  component='img'
                  src={selectedProduct.image_url || PLACEHOLDER_IMAGE}
                  alt={selectedProduct.title}
                  sx={{
                    maxWidth: '90%',
                    maxHeight: '90%',
                    objectFit: 'contain',
                  }}
                />
              </Box>

              {/* Product info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant='caption' sx={{ opacity: 0.8 }}>
                  You selected
                </Typography>
                <Typography
                  variant='subtitle1'
                  sx={{
                    fontWeight: 600,
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {selectedProduct.title}
                </Typography>
                {/* Description */}
                {selectedProduct.description && (
                  <Typography
                    variant='caption'
                    sx={{
                      display: 'block',
                      opacity: 0.85,
                      mt: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {selectedProduct.description}
                  </Typography>
                )}
                {selectedProduct.price && (
                  <Typography variant='body2' sx={{ fontWeight: 600, mt: 0.5 }}>
                    ${selectedProduct.price.toFixed(2)}
                  </Typography>
                )}
              </Box>

              <Button
                size='small'
                startIcon={<Refresh />}
                onClick={() => {
                  setSelectedProduct(null)
                  setRecommendations([])
                }}
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'white',
                  fontSize: '0.75rem',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                }}
              >
                Clear
              </Button>
            </Box>

            {/* Recommendations */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <AutoAwesome sx={{ fontSize: 18 }} />
              <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                Customers also viewed
              </Typography>
              <ChevronRight sx={{ fontSize: 18 }} />
            </Box>

            {loadingRecs ? (
              <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton
                    key={i}
                    variant='rectangular'
                    sx={{ minWidth: 150, height: 220, borderRadius: 2, flexShrink: 0 }}
                  />
                ))}
              </Box>
            ) : recommendations.length > 0 ? (
              <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1, mx: -1, px: 1 }}>
                {recommendations.map((rec, index) => (
                  <Box key={rec.asin} sx={{ minWidth: 150, maxWidth: 150, flexShrink: 0 }}>
                    <ProductCard
                      product={rec}
                      score={rec.similarity ?? rec.score}
                      method={rec.method}
                      index={index}
                      onClick={() => getRecommendationsForProduct(rec)}
                      compact
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant='body2' sx={{ opacity: 0.7 }}>
                No recommendations found.
              </Typography>
            )}
          </Box>
        )}

        {/* Product Catalog */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant='h6' sx={{ fontWeight: 600, color: '#1d1d1f' }}>
                {selectedProduct ? 'Browse more products' : '🛒 Click a product to get recommendations'}
              </Typography>
              {!selectedProduct && (
                <Typography variant='caption' sx={{ color: '#86868b' }}>
                  ML will find similar products based on{' '}
                  {method === 'collaborative'
                    ? 'purchase patterns'
                    : method === 'content'
                      ? 'product features'
                      : 'both'}
                </Typography>
              )}
            </Box>
            {stats && (
              <Chip
                label={`${stats.products_with_metadata} products`}
                size='small'
                sx={{ bgcolor: '#e8e8ed', fontWeight: 500 }}
              />
            )}
          </Box>

          {loadingProducts || loadingStats ? (
            <LoadingGrid count={12} />
          ) : products.length > 0 ? (
            <>
              <Grid container spacing={2}>
                {products.map((product, index) => (
                  <Grid key={product.asin} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
                    <ProductCard
                      product={product}
                      index={index}
                      onClick={() => getRecommendationsForProduct(product)}
                      selected={selectedProduct?.asin === product.asin}
                    />
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                  variant='outlined'
                  size='small'
                  onClick={async () => {
                    const data = await getAvailableProducts(12, products.length)
                    setProducts([...products, ...data.products])
                  }}
                  sx={{ borderColor: '#0066cc', color: '#0066cc' }}
                >
                  Load More
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>

        {/* How it works */}
        <Box sx={{ mt: 6, p: 4, bgcolor: '#1d1d1f', borderRadius: 3, color: 'white' }}>
          <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
            How Recommendations Work
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ fontSize: '1.5rem', mb: 0.5 }}>🛒</Box>
                <Typography variant='body2' sx={{ fontWeight: 600, color: '#34c759', mb: 0.5 }}>
                  Collaborative Filtering
                </Typography>
                <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  "Customers who bought this also bought..."
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ fontSize: '1.5rem', mb: 0.5 }}>📝</Box>
                <Typography variant='body2' sx={{ fontWeight: 600, color: '#0066cc', mb: 0.5 }}>
                  Content-Based
                </Typography>
                <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  "Similar products based on features..."
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ fontSize: '1.5rem', mb: 0.5 }}>✨</Box>
                <Typography variant='body2' sx={{ fontWeight: 600, color: '#5856d6', mb: 0.5 }}>
                  Hybrid (Best)
                </Typography>
                <Typography variant='caption' sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  60% behavior + 40% content
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  )
}
