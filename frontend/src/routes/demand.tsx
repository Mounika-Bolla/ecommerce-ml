import {
  TrendingDown,
  TrendingFlat,
  TrendingUp,
  Analytics,
  Insights,
  Timeline,
  Category,
  ShowChart,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tabs,
  Tab,
} from '@mui/material'
import { useEffect, useState } from 'react'
import Plot from 'react-plotly.js'

import {
  getCategoryDemand,
  getDemandStats,
  getOverallTrend,
  getProductDemand,
  getProductForecast,
  getTopProducts,
  type CategoryDemand,
  type DemandStats,
  type OverallTrend,
  type ProductDemand,
  type ProductForecast,
  type TopProduct,
} from '../services/demand.service'

// Professional corporate color scheme
const professionalColors = {
  primary: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
  dark: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  card: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 100%)',
  metrics: {
    products: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
    time: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)',
    demand: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
    range: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
  },
}

// Animated stat card
function StatCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
  delay = 0,
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  gradient: string
  delay?: number
}) {
  return (
    <Card
      sx={{
        height: '100%',
        background: gradient,
        color: 'white',
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        animation: `fadeInUp 0.6s ease-out ${delay}s both`,
        '@keyframes fadeInUp': {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '120px',
          height: '120px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
        },
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography
            variant='overline'
            sx={{ opacity: 0.9, letterSpacing: 1.2, fontWeight: 600, fontSize: '0.65rem' }}
          >
            {title}
          </Typography>
          <Box sx={{ opacity: 0.85 }}>{icon}</Box>
        </Box>
        <Typography
          variant='h3'
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.5px',
            mb: 0.5,
            fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
        {subtitle && (
          <Typography variant='body2' sx={{ opacity: 0.85, fontWeight: 500 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

// Trend indicator
function TrendIndicator({ trend }: { trend: string }) {
  const config = {
    increasing: { icon: <TrendingUp />, color: '#047857', bg: '#ecfdf5', label: 'Growing' },
    decreasing: { icon: <TrendingDown />, color: '#b91c1c', bg: '#fef2f2', label: 'Declining' },
    stable: { icon: <TrendingFlat />, color: '#4b5563', bg: '#f3f4f6', label: 'Stable' },
    insufficient_data: { icon: <TrendingFlat />, color: '#6b7280', bg: '#f9fafb', label: 'Limited Data' },
  }
  const { icon, color, bg, label } = config[trend as keyof typeof config] || config.stable

  return (
    <Chip
      icon={icon}
      label={label}
      size='small'
      sx={{
        bgcolor: bg,
        color: color,
        fontWeight: 600,
        fontSize: '0.75rem',
        '& .MuiChip-icon': { color: color },
      }}
    />
  )
}

// Plotly bar chart component
function PlotlyBarChart({
  data,
  height = 400,
  color = '#1e40af',
  showForecast = false,
  title = '',
}: {
  data: { label: string; value: number; is_forecast?: boolean }[]
  height?: number
  color?: string
  showForecast?: boolean
  title?: string
}) {
  if (!data || data.length === 0) return <Skeleton variant='rectangular' height={height} />

  // Separate historical and forecast data
  const historicalData = data.filter((d) => !d.is_forecast)
  const forecastData = data.filter((d) => d.is_forecast)

  // Prepare data for Plotly
  const xLabels = data.map((d, i) => {
    if (d.is_forecast) {
      const match = d.label.match(/Forecast-(\d+)/)
      const forecastNum = match ? parseInt(match[1]) : i - historicalData.length + 1
      return historicalData.length + forecastNum - 1
    }
    return i
  })

  const historicalValues = historicalData.map((d) => typeof d.value === 'number' ? d.value : parseFloat(String(d.value)) || 0)
  const forecastValues = forecastData.map((d) => typeof d.value === 'number' ? d.value : parseFloat(String(d.value)) || 0)

  // Create traces
  const traces: any[] = []

  if (historicalData.length > 0) {
    const histX = xLabels.slice(0, historicalData.length)
    traces.push({
      x: histX,
      y: historicalValues,
      type: 'bar',
      name: 'Historical',
      marker: {
        color: color,
        line: { color: color, width: 1 },
      },
      text: historicalData.map((d, i) => `${d.label}<br>${historicalValues[i].toFixed(2)}`),
      textposition: 'none',
      hovertemplate: '<b>%{text}</b><extra></extra>',
    })
  }

  if (forecastData.length > 0 && showForecast) {
    const forecastX = xLabels.slice(historicalData.length)
    traces.push({
      x: forecastX,
      y: forecastValues,
      type: 'bar',
      name: 'Forecast',
      marker: {
        color: '#f59e0b',
        line: { color: '#d97706', width: 1, dash: 'dash' },
        pattern: { shape: '/', fillmode: 'overlay' },
      },
      text: forecastData.map((d, i) => `${d.label}<br>${forecastValues[i].toFixed(2)}`),
      textposition: 'none',
      hovertemplate: '<b>%{text}</b><br><i>Forecast</i><extra></extra>',
    })
  }

  const layout = {
    height: height,
    margin: { l: 50, r: 20, t: 20, b: 50 },
    xaxis: {
      title: 'Week Index',
      showgrid: true,
      gridcolor: '#e5e7eb',
      zeroline: false,
    },
    yaxis: {
      title: 'Demand',
      showgrid: true,
      gridcolor: '#e5e7eb',
      zeroline: false,
    },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    font: { family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', size: 12, color: '#4b5563' },
    showlegend: showForecast && forecastData.length > 0,
    legend: {
      x: 0.02,
      y: 0.98,
      bgcolor: 'rgba(255,255,255,0.8)',
      bordercolor: '#e5e7eb',
      borderwidth: 1,
    },
    hovermode: 'closest' as const,
    barmode: 'group' as const,
  }

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
    responsive: true,
  }

  return (
    <Box sx={{ width: '100%' }}>
      {title && (
        <Typography variant='body2' sx={{ color: '#6b7280', mb: 1, fontWeight: 500 }}>
          {title}
        </Typography>
      )}
      <Plot data={traces} layout={layout} config={config} style={{ width: '100%' }} />
    </Box>
  )
}

// Category progress bar
function CategoryBar({
  category,
  demand,
  maxDemand,
  index,
}: {
  category: string
  demand: number
  maxDemand: number
  index: number
}) {
  const percentage = (demand / maxDemand) * 100
  const colors = ['#1e40af', '#1e3a5f', '#0f766e', '#374151', '#1d4ed8', '#047857', '#3b82f6', '#475569']

  return (
    <Box
      sx={{
        mb: 2,
        animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
        '@keyframes slideIn': {
          '0%': { opacity: 0, transform: 'translateX(-20px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography
          variant='body2'
          sx={{
            fontWeight: 600,
            color: '#1f2937',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '65%',
          }}
        >
          {category}
        </Typography>
        <Typography variant='body2' sx={{ fontWeight: 700, color: colors[index % colors.length] }}>
          {demand.toLocaleString()}
        </Typography>
      </Box>
      <Box
        sx={{
          height: 8,
          bgcolor: '#f1f5f9',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${colors[index % colors.length]} 0%, ${colors[(index + 1) % colors.length]} 100%)`,
            borderRadius: 4,
            transition: 'width 1s ease-out',
            animation: `expandWidth 1s ease-out ${index * 0.1}s both`,
            '@keyframes expandWidth': {
              '0%': { width: 0 },
              '100%': { width: `${percentage}%` },
            },
          }}
        />
      </Box>
    </Box>
  )
}

export default function DemandDashboard() {
  const [tab, setTab] = useState(0)
  const [stats, setStats] = useState<DemandStats | null>(null)
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [overallTrend, setOverallTrend] = useState<OverallTrend[]>([])
  const [categories, setCategories] = useState<CategoryDemand[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [productDemand, setProductDemand] = useState<ProductDemand | null>(null)
  const [productForecast, setProductForecast] = useState<ProductForecast | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingProduct, setLoadingProduct] = useState(false)
  const [loadingForecast, setLoadingForecast] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, productsData, trendData, catData] = await Promise.all([
          getDemandStats(),
          getTopProducts(15),
          getOverallTrend(),
          getCategoryDemand(),
        ])
        setStats(statsData)
        setTopProducts(productsData)
        setOverallTrend(trendData)
        setCategories(catData)
        if (productsData.length > 0) setSelectedProduct(productsData[0].asin)
      } catch {
        setError('Could not connect to API. Make sure backend is running.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (!selectedProduct) return
    const loadProduct = async () => {
      setLoadingProduct(true)
      try {
        const data = await getProductDemand(selectedProduct)
        setProductDemand(data)
      } catch {
        setProductDemand(null)
      } finally {
        setLoadingProduct(false)
      }
    }
    loadProduct()
  }, [selectedProduct])

  useEffect(() => {
    if (!selectedProduct || tab !== 1) return
    const loadForecast = async () => {
      setLoadingForecast(true)
      try {
        const data = await getProductForecast(selectedProduct, 8)
        setProductForecast(data)
      } catch {
        setProductForecast(null)
      } finally {
        setLoadingForecast(false)
      }
    }
    loadForecast()
  }, [selectedProduct, tab])

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: professionalColors.dark,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#3b82f6', mb: 2 }} size={48} />
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            Loading analytics...
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Professional Hero Header */}
      <Box
        sx={{
          background: professionalColors.dark,
          pt: 14,
          pb: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth='lg' sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(30, 64, 175, 0.3)',
              }}
            >
              <Analytics sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Box>
              <Typography
                variant='h3'
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  letterSpacing: '-0.5px',
                  fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                Demand Analytics & Forecasting
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500, mt: 0.5 }}>
                Enterprise-grade demand intelligence platform
              </Typography>
            </Box>
          </Box>

          {/* Info badge */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2.5,
              py: 1.5,
              bgcolor: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <Insights sx={{ color: '#94a3b8', fontSize: 18 }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 500 }}>
              Demand proxy based on review velocity • Not actual sales data
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Stats Cards - Overlapping Hero */}
      <Container maxWidth='lg' sx={{ mt: -5, mb: 4, position: 'relative', zIndex: 2 }}>
        {error && (
          <Alert severity='error' sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {stats && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard
                title='TOTAL PRODUCTS'
                value={stats.total_products}
                subtitle='Tracked items'
                icon={<Category />}
                gradient={professionalColors.metrics.products}
                delay={0}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard
                title='TIME PERIODS'
                value={stats.total_weeks}
                subtitle='Weekly data points'
                icon={<Timeline />}
                gradient={professionalColors.metrics.time}
                delay={0.1}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard
                title='TOTAL DEMAND'
                value={stats.total_demand}
                subtitle='Aggregated signals'
                icon={<TrendingUp />}
                gradient={professionalColors.metrics.demand}
                delay={0.2}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard
                title='DATA RANGE'
                value={`${stats.time_range.start?.slice(0, 7) || '—'}`}
                subtitle={`to ${stats.time_range.end?.slice(0, 7) || '—'}`}
                icon={<Insights />}
                gradient={professionalColors.metrics.range}
                delay={0.3}
              />
            </Grid>
          </Grid>
        )}
      </Container>

      <Container maxWidth='lg' sx={{ pb: 6 }}>
        {/* Tabs */}
        <Box sx={{ mb: 4 }}>
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                minHeight: 48,
              },
            }}
          >
            <Tab icon={<Analytics />} iconPosition='start' label='Analytics' />
            <Tab icon={<ShowChart />} iconPosition='start' label='Forecast' />
          </Tabs>
        </Box>

        {/* Analytics Tab */}
        {tab === 0 && (
          <Grid container spacing={3}>
            {/* Overall Trend */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                    <Box>
                      <Typography variant='h6' sx={{ fontWeight: 700, color: '#1f2937', mb: 0.5 }}>
                        Demand Trend Over Time
                      </Typography>
                      <Typography variant='body2' sx={{ color: '#6b7280' }}>
                        Weekly aggregated demand signals
                      </Typography>
                    </Box>
                    <Chip
                      label={`${overallTrend.length} weeks`}
                      size='small'
                      sx={{ bgcolor: '#f1f5f9', fontWeight: 600 }}
                    />
                  </Box>
                  <PlotlyBarChart
                    data={overallTrend.slice(-40).map((t) => ({ label: t.week, value: t.total_demand }))}
                    height={300}
                    color='#1e40af'
                    title='Weekly aggregated demand signals'
                  />
                  <Typography variant='caption' sx={{ color: '#9ca3af', mt: 2, display: 'block' }}>
                    Hover over bars to see exact values
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Categories */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant='h6' sx={{ fontWeight: 700, color: '#1f2937', mb: 0.5 }}>
                    Category Performance
                  </Typography>
                  <Typography variant='body2' sx={{ color: '#6b7280', mb: 3 }}>
                    Top categories by demand volume
                  </Typography>
                  {categories.slice(0, 6).map((cat, i) => (
                    <CategoryBar
                      key={cat.category}
                      category={cat.category}
                      demand={cat.total_demand}
                      maxDemand={categories[0]?.total_demand || 1}
                      index={i}
                    />
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Product Deep Dive */}
            <Grid size={{ xs: 12 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(0,0,0,0.05)',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant='h6' sx={{ fontWeight: 700, color: '#1f2937', mb: 0.5 }}>
                        Product Deep Dive
                      </Typography>
                      <Typography variant='body2' sx={{ color: '#6b7280' }}>
                        Analyze individual product demand patterns
                      </Typography>
                    </Box>
                    <FormControl sx={{ minWidth: 350 }}>
                      <InputLabel sx={{ fontWeight: 500 }}>Select Product</InputLabel>
                      <Select
                        value={selectedProduct}
                        label='Select Product'
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}
                      >
                        {topProducts.map((p) => (
                          <MenuItem key={p.asin} value={p.asin}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ fontWeight: 500 }}>{p.title}</Typography>
                              <Chip
                                label={p.total_demand.toLocaleString()}
                                size='small'
                                sx={{ bgcolor: '#e5e7eb', color: '#1f2937', fontWeight: 600, fontSize: '0.7rem' }}
                              />
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {loadingProduct ? (
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Skeleton variant='rectangular' height={180} sx={{ borderRadius: 3 }} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 8 }}>
                        <Skeleton variant='rectangular' height={180} sx={{ borderRadius: 3 }} />
                      </Grid>
                    </Grid>
                  ) : productDemand ? (
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box
                          sx={{
                            p: 3,
                            background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
                            borderRadius: 3,
                            height: '100%',
                          }}
                        >
                          <Typography variant='caption' sx={{ color: '#6b7280', fontWeight: 600 }}>
                            {productDemand.asin}
                          </Typography>
                          <Typography
                            variant='subtitle1'
                            sx={{ fontWeight: 700, color: '#1f2937', mb: 3, lineHeight: 1.4 }}
                          >
                            {productDemand.title}
                          </Typography>

                          <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                              <Typography variant='caption' sx={{ color: '#6b7280', display: 'block', mb: 0.5 }}>
                                Total Demand
                              </Typography>
                              <Typography variant='h5' sx={{ fontWeight: 800, color: '#1e40af' }}>
                                {productDemand.total_demand.toLocaleString()}
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <Typography variant='caption' sx={{ color: '#6b7280', display: 'block', mb: 0.5 }}>
                                Weekly Avg
                              </Typography>
                              <Typography variant='h5' sx={{ fontWeight: 800, color: '#1f2937' }}>
                                {productDemand.avg_demand}
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <Typography variant='caption' sx={{ color: '#6b7280', display: 'block', mb: 0.5 }}>
                                Peak Demand
                              </Typography>
                              <Typography variant='h6' sx={{ fontWeight: 700, color: '#047857' }}>
                                {productDemand.max_demand}
                              </Typography>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <Typography variant='caption' sx={{ color: '#6b7280', display: 'block', mb: 0.5 }}>
                                Trend
                              </Typography>
                              <TrendIndicator trend={productDemand.trend} />
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 12, md: 8 }}>
                        <Box sx={{ p: 3, bgcolor: '#fafbfc', borderRadius: 3, height: '100%' }}>
                          <Typography variant='body2' sx={{ color: '#6b7280', mb: 2, fontWeight: 500 }}>
                            Weekly Demand Timeline
                          </Typography>
                          <PlotlyBarChart
                            data={productDemand.time_series.map((t) => ({ label: t.week, value: t.demand }))}
                            height={250}
                            color={
                              productDemand.trend === 'increasing'
                                ? '#047857'
                                : productDemand.trend === 'decreasing'
                                  ? '#b91c1c'
                                  : '#1e40af'
                            }
                            title='Weekly demand timeline'
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  ) : null}
                </CardContent>
              </Card>
            </Grid>

            {/* Leaderboard Table */}
            <Grid size={{ xs: 12 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ p: 4, pb: 2 }}>
                    <Typography variant='h6' sx={{ fontWeight: 700, color: '#1f2937', mb: 0.5 }}>
                      Product Leaderboard
                    </Typography>
                    <Typography variant='body2' sx={{ color: '#6b7280' }}>
                      Top performing products ranked by demand volume
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                          <TableCell sx={{ fontWeight: 700, color: '#4b5563', py: 2 }}>Rank</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#4b5563' }}>Product</TableCell>
                          <TableCell align='right' sx={{ fontWeight: 700, color: '#4b5563' }}>
                            Total Demand
                          </TableCell>
                          <TableCell align='right' sx={{ fontWeight: 700, color: '#4b5563' }}>
                            Avg/Week
                          </TableCell>
                          <TableCell align='right' sx={{ fontWeight: 700, color: '#4b5563' }}>
                            Data Points
                          </TableCell>
                          <TableCell align='right' sx={{ fontWeight: 700, color: '#4b5563' }}>
                            Rating
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {topProducts.map((product, i) => (
                          <TableRow
                            key={product.asin}
                            hover
                            onClick={() => setSelectedProduct(product.asin)}
                            sx={{
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': { bgcolor: '#f0f9ff' },
                            }}
                          >
                            <TableCell>
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: 2,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '0.875rem',
                                  bgcolor: i < 3 ? ['#fef3c7', '#f3f4f6', '#fef3c7'][i] : '#f8fafc',
                                  color: i < 3 ? ['#d97706', '#4b5563', '#b45309'][i] : '#6b7280',
                                }}
                              >
                                {i + 1}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant='body2' sx={{ fontWeight: 600, color: '#1f2937' }}>
                                {product.title}
                              </Typography>
                              <Typography variant='caption' sx={{ color: '#9ca3af' }}>
                                {product.asin}
                              </Typography>
                            </TableCell>
                            <TableCell align='right'>
                              <Typography sx={{ fontWeight: 700, color: '#1e40af', fontSize: '1rem' }}>
                                {product.total_demand.toLocaleString()}
                              </Typography>
                            </TableCell>
                            <TableCell align='right'>
                              <Typography sx={{ fontWeight: 600, color: '#4b5563' }}>
                                {product.avg_weekly_demand.toFixed(1)}
                              </Typography>
                            </TableCell>
                            <TableCell align='right'>
                              <Chip
                                label={`${product.num_weeks}w`}
                                size='small'
                                sx={{ bgcolor: '#f1f5f9', fontWeight: 600, fontSize: '0.75rem' }}
                              />
                            </TableCell>
                            <TableCell align='right'>
                              {product.avg_rating ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                  <Typography sx={{ color: '#6b7280', fontWeight: 600 }}>★</Typography>
                                  <Typography sx={{ fontWeight: 600, color: '#4b5563' }}>
                                    {product.avg_rating.toFixed(1)}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography sx={{ color: '#d1d5db' }}>—</Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Forecast Tab */}
        {tab === 1 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(0,0,0,0.05)',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant='h6' sx={{ fontWeight: 700, color: '#1f2937', mb: 0.5 }}>
                        Demand Forecasting
                      </Typography>
                      <Typography variant='body2' sx={{ color: '#6b7280' }}>
                        ML-powered demand predictions using Gradient Boosting
                      </Typography>
                    </Box>
                    <FormControl sx={{ minWidth: 350 }}>
                      <InputLabel sx={{ fontWeight: 500 }}>Select Product</InputLabel>
                      <Select
                        value={selectedProduct}
                        label='Select Product'
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        sx={{ borderRadius: 2, bgcolor: '#f8fafc' }}
                      >
                        {topProducts.map((p) => (
                          <MenuItem key={p.asin} value={p.asin}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ fontWeight: 500 }}>{p.title}</Typography>
                              <Chip
                                label={p.total_demand.toLocaleString()}
                                size='small'
                                sx={{ bgcolor: '#e5e7eb', color: '#1f2937', fontWeight: 600, fontSize: '0.7rem' }}
                              />
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {loadingForecast ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                      <CircularProgress />
                    </Box>
                  ) : productForecast ? (
                    <Box>
                      {/* Model Info */}
                      <Box
                        sx={{
                          p: 3,
                          mb: 4,
                          bgcolor: '#f8fafc',
                          borderRadius: 2,
                          border: '1px solid #e5e7eb',
                        }}
                      >
                        <Grid container spacing={3}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant='caption' sx={{ color: '#6b7280', fontWeight: 600, display: 'block' }}>
                              Product
                            </Typography>
                            <Typography variant='h6' sx={{ fontWeight: 700, color: '#1f2937', mt: 0.5 }}>
                              {productForecast.title}
                            </Typography>
                            <Typography variant='caption' sx={{ color: '#9ca3af' }}>
                              {productForecast.asin}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6, md: 3 }}>
                            <Typography variant='caption' sx={{ color: '#6b7280', fontWeight: 600, display: 'block' }}>
                              Model Type
                            </Typography>
                            <Typography variant='body1' sx={{ fontWeight: 600, color: '#1f2937', mt: 0.5 }}>
                              {productForecast.model_type}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6, md: 3 }}>
                            <Typography variant='caption' sx={{ color: '#6b7280', fontWeight: 600, display: 'block' }}>
                              Model MAE
                            </Typography>
                            <Typography variant='body1' sx={{ fontWeight: 600, color: '#1e40af', mt: 0.5 }}>
                              {productForecast.model_mae.toFixed(2)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>

                      {/* Forecast Chart */}
                      <Box sx={{ mb: 4 }}>
                        <Typography variant='h6' sx={{ fontWeight: 700, color: '#1f2937', mb: 2 }}>
                          Historical vs Forecasted Demand
                        </Typography>
                        <Box sx={{ p: 3, bgcolor: '#fafbfc', borderRadius: 3 }}>
                          <PlotlyBarChart
                            data={productForecast.combined.map((p) => ({
                              label: p.week,
                              value: typeof p.demand === 'number' ? p.demand : parseFloat(String(p.demand)) || 0,
                              is_forecast: p.is_forecast,
                            }))}
                            height={350}
                            color='#1e40af'
                            showForecast={true}
                            title='Historical vs Forecasted Demand'
                          />
                          <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 20,
                                  height: 20,
                                  bgcolor: '#1e40af',
                                  borderRadius: 1,
                                }}
                              />
                              <Typography variant='caption' sx={{ color: '#6b7280' }}>
                                Historical
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: 20,
                                  height: 20,
                                  bgcolor: '#f59e0b',
                                  borderRadius: 1,
                                  border: '2px dashed rgba(245, 158, 11, 0.5)',
                                }}
                              />
                              <Typography variant='caption' sx={{ color: '#6b7280' }}>
                                Forecast ({productForecast.forecast_weeks} weeks)
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      {/* Forecast Table */}
                      <Box>
                        <Typography variant='h6' sx={{ fontWeight: 700, color: '#1f2937', mb: 2 }}>
                          Forecast Details
                        </Typography>
                        <TableContainer>
                          <Table size='small'>
                            <TableHead>
                              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                <TableCell sx={{ fontWeight: 700, color: '#4b5563' }}>Week</TableCell>
                                <TableCell align='right' sx={{ fontWeight: 700, color: '#4b5563' }}>
                                  Forecasted Demand
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#4b5563' }}>Type</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {productForecast.forecast.map((point, i) => (
                                <TableRow key={i}>
                                  <TableCell>
                                    <Typography sx={{ fontWeight: 600, color: '#1f2937' }}>
                                      {point.week}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align='right'>
                                    <Typography sx={{ fontWeight: 700, color: '#f59e0b' }}>
                                      {point.demand.toFixed(1)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label='Forecast'
                                      size='small'
                                      sx={{
                                        bgcolor: '#fef3c7',
                                        color: '#d97706',
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Typography sx={{ color: '#6b7280' }}>
                        Select a product to generate demand forecast
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
    </Box>
  )
}
