# E-Commerce Ml Platform

A full-stack e-commerce platform featuring AI-powered product recommendations and demand forecasting. Built with FastAPI, React, MongoDB, and Docker.

![Tests](https://github.com/jonasrenault/fastapi-react-mongodb-docker/actions/workflows/test.yml/badge.svg)
![Build](https://github.com/jonasrenault/fastapi-react-mongodb-docker/actions/workflows/build.yml/badge.svg)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
![python_version](https://img.shields.io/badge/Python-%3E=3.12-blue)

## 🚀 Features

### Product Recommendations

- **Collaborative Filtering:** "Customers who bought this also bought..." using item-based KNN
- **Content-Based Filtering:** Similar products based on title and category using TF-IDF
- **Hybrid Approach:** Combines both methods (60% CF + 40% Content) for optimal results
- Real-time recommendations with product metadata (images, prices, ratings)

### Demand Forecasting

- **Time Series Analysis:** Weekly demand forecasting using Gradient Boosting
- **Analytics Dashboard:** Product trends, category performance, top products
- **Forecast Visualization:** Historical vs predicted demand with interactive charts
- Review count as demand proxy (validated approach)

### User Management

- OAuth2 authentication with JWT tokens
- User registration and login
- SSO (Single Sign-On) support
- Role-based access control

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Frontend Routes](#frontend-routes)
- [Getting Started](#getting-started)
- [Development](#development)
- [Deployment](#deployment)
- [ML Models](#ml-models)

---

## 🛠 Tech Stack

### Backend

**Framework & Core:**

- **FastAPI** (v0.115.12+) - Modern Python web framework
- **Python 3.12+** - Programming language
- **uv** - Fast Python package manager

**Database:**

- **MongoDB** - NoSQL database (optional - recommendations work without it)
- **Beanie** (v1.29.0+) - ODM for MongoDB
- **Motor** (v3.7.1+) - Async MongoDB driver

**Authentication:**

- **python-jose** (v3.4.0+) - JWT token handling
- **passlib** (v1.7.4+) - Password hashing
- **bcrypt** (v4.3.0+) - Secure password storage
- **fastapi-sso** (v0.18.0+) - SSO integration

**Machine Learning:**

- **scikit-learn** (v1.4.0+) - ML algorithms (KNN, Gradient Boosting, TF-IDF)
- **polars** (v1.36.0+) - Fast DataFrame library (10-50x faster than pandas)
- **numpy** (v1.26.0+) - Numerical computing
- **joblib** (v1.3.0+) - Model serialization
- **xgboost** (v2.0.0+) - Gradient boosting (optional)
- **statsmodels** (v0.14.6+) - Time series analysis (optional)
- **prophet** (v1.2.1+) - Facebook Prophet for forecasting (optional)

**Data Processing:**

- **pandas** (v2.2.0+) - Data manipulation
- **pyarrow** (v22.0.0+) - Apache Arrow integration

**Other:**

- **pydantic** (v2.11.4+) - Data validation
- **python-dotenv** (v1.1.0+) - Environment variables
- **requests** (v2.32.3+) - HTTP client

### Frontend

**Framework:**

- **React** (v19.1.0+) - UI library
- **TypeScript** (v5.8.3+) - Type-safe JavaScript
- **Vite** (v6.3.5+) - Build tool and dev server

**UI Components:**

- **Material-UI (MUI)** (v7.1.0+) - React component library
- **@mui/icons-material** - Material icons
- **@emotion/react** & **@emotion/styled** - CSS-in-JS styling

**Routing:**

- **react-router** (v7.6.0+) - Client-side routing

**Data Visualization:**

- **plotly.js** (v2.35.3+) - Interactive charts
- **react-plotly.js** (v2.6.0+) - React wrapper for Plotly

**HTTP Client:**

- **axios** (v1.9.0+) - Promise-based HTTP client

**State Management:**

- **react-hook-form** (v7.56.4+) - Form handling
- **localforage** (v1.10.0+) - Local storage

**Testing:**

- **vitest** (v3.1.3+) - Unit testing framework
- **@testing-library/react** - React testing utilities
- **msw** (v2.8.2+) - API mocking

### DevOps

**Containerization:**

- **Docker** - Container platform
- **Docker Compose** - Multi-container orchestration

**CI/CD:**

- **GitHub Actions** - Automated testing and building

**Web Server:**

- **Nginx** - Reverse proxy and static file serving (production)

---

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Recommendations│  │Demand Analytics│  │User Management│    │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────┬─────────────────────────────────┘
                             │ HTTP/REST
┌───────────────────────────▼─────────────────────────────────┐
│                    Backend API (FastAPI)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Recommendation│  │Demand Service│  │Auth Service  │      │
│  │   Service    │  │              │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐    │
│  │  ML Models   │  │  ML Models   │  │   MongoDB    │    │
│  │  (KNN, TF-IDF)│  │ (Gradient    │  │  (Optional)  │    │
│  │              │  │   Boosting)  │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Recommendation Flow:**

1. User selects product in frontend
2. Frontend calls `/api/v1/recommendations/hybrid/{product_asin}`
3. Backend loads pre-trained models (KNN, TF-IDF)
4. Service computes recommendations
5. Results enriched with product metadata
6. JSON response sent to frontend
7. Frontend displays recommendations

**Demand Forecasting Flow:**

1. User selects product in analytics dashboard
2. Frontend calls `/api/v1/demand/forecast/{asin}`
3. Backend loads historical demand data
4. Feature engineering (lags, rolling stats)
5. Gradient Boosting model generates forecast
6. Results formatted with historical comparison
7. Frontend visualizes forecast chart

---

## 📁 Project Structure

```
fastapi-react-mongodb-docker/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI application entry point
│   │   ├── auth/              # Authentication module
│   │   │   ├── __init__.py
│   │   │   └── auth.py       # JWT, password hashing, SSO
│   │   ├── config/            # Configuration
│   │   │   ├── __init__.py
│   │   │   ├── config.py     # Settings management
│   │   │   └── logging.py    # Logging configuration
│   │   ├── models/            # Database models
│   │   │   ├── __init__.py
│   │   │   └── users.py      # User model (Beanie)
│   │   ├── routers/          # API routes
│   │   │   ├── __init__.py
│   │   │   ├── api.py        # Main API router
│   │   │   ├── recommendations.py  # Recommendation endpoints
│   │   │   ├── demand.py     # Demand forecasting endpoints
│   │   │   ├── login.py      # Authentication endpoints
│   │   │   └── users.py      # User management endpoints
│   │   ├── schemas/          # Pydantic models
│   │   │   ├── __init__.py
│   │   │   ├── tokens.py     # Token schemas
│   │   │   └── users.py      # User schemas
│   │   └── services/         # Business logic
│   │       ├── __init__.py
│   │       ├── recommendation_service.py  # ML recommendation logic
│   │       └── demand_service.py           # Demand forecasting logic
│   ├── ml/                    # Machine learning models
│   │   ├── dataset/          # Training data
│   │   │   ├── Home_and_Kitchen.jsonl
│   │   │   └── meta_Home_and_Kitchen.jsonl
│   │   ├── models/            # Trained models
│   │   │   ├── knn_recommender.joblib
│   │   │   ├── tfidf_vectorizer.joblib
│   │   │   ├── item_user_matrix.npz
│   │   │   ├── tfidf_matrix.npz
│   │   │   ├── recommendation_mappings.json
│   │   │   ├── demand_forecast_gb.joblib
│   │   │   └── demand_forecast_info.json
│   │   └── notebooks/         # Jupyter notebooks
│   │       ├── product_recommendations.ipynb
│   │       ├── demand_forecasting.ipynb
│   │       └── RESEARCH_DOCUMENTATION.md
│   ├── tests/                 # Unit tests
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   └── routers/
│   │       ├── test_login.py
│   │       └── test_users.py
│   ├── Dockerfile             # Backend container
│   ├── pyproject.toml         # Python dependencies
│   └── README.md              # Backend documentation
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── TopMenuBar.tsx
│   │   │   └── UserProfile.tsx
│   │   ├── contexts/          # React contexts
│   │   │   ├── auth.tsx       # Authentication context
│   │   │   └── snackbar.tsx   # Notification context
│   │   ├── routes/            # Page components
│   │   │   ├── root.tsx       # Root layout
│   │   │   ├── home.tsx       # Home page
│   │   │   ├── recommendations.tsx  # Recommendation UI
│   │   │   ├── demand.tsx     # Demand analytics dashboard
│   │   │   ├── login.tsx     # Login page
│   │   │   ├── register.tsx  # Registration page
│   │   │   └── profile.tsx   # User profile
│   │   ├── services/         # API clients
│   │   │   ├── auth.service.ts
│   │   │   ├── recommendation.service.ts
│   │   │   ├── demand.service.ts
│   │   │   └── user.service.ts
│   │   ├── models/           # TypeScript types
│   │   │   └── user.ts
│   │   ├── router.tsx        # Route configuration
│   │   ├── main.tsx         # Application entry point
│   │   ├── theme.tsx        # MUI theme configuration
│   │   └── axios.ts         # Axios configuration
│   ├── public/               # Static assets
│   ├── Dockerfile            # Production container
│   ├── Dockerfile.development # Development container
│   ├── nginx.conf            # Nginx configuration
│   ├── package.json          # Node dependencies
│   ├── vite.config.ts        # Vite configuration
│   └── tsconfig.json         # TypeScript configuration
│
├── docker-compose.yml         # Development Docker Compose
├── docker-compose.prod.yml    # Production Docker Compose
├── .env                       # Environment variables
└── README.md                  # This file
```

---

## 🔌 API Documentation

### Base URL

- **Development:** `http://localhost:8000/api/v1`
- **Production:** `https://your-domain.com/api/v1`

### Authentication

All endpoints (except public ones) require JWT authentication:

```
Authorization: Bearer <token>
```

### Recommendation Endpoints

#### Get Recommendation Statistics

```http
GET /recommendations/stats
```

**Response:**

```json
{
  "status": "ready",
  "total_products": 4875,
  "products_with_content": 912,
  "products_with_metadata": 4875,
  "models_loaded": {
    "knn": true,
    "tfidf": true,
    "item_user_matrix": true,
    "tfidf_matrix": true
  }
}
```

#### Get Available Products

```http
GET /recommendations/products?limit=20&offset=0
```

**Query Parameters:**

- `limit` (int, 1-100): Number of products to return
- `offset` (int, ≥0): Pagination offset

**Response:**

```json
{
  "products": [
    {
      "asin": "B07D1C573W",
      "title": "Tealyra Ceramic Teapot",
      "description": "...",
      "image_url": "https://...",
      "price": 29.99,
      "rating": 4.5,
      "rating_count": 1234,
      "store": "Amazon",
      "categories": ["Kitchen", "Tea"]
    }
  ],
  "total": 4875,
  "offset": 0,
  "limit": 20
}
```

#### Search Products

```http
GET /recommendations/search?q=teapot&limit=20
```

**Query Parameters:**

- `q` (string, min 2 chars): Search query
- `limit` (int, 1-50): Max results

#### Get Product Details

```http
GET /recommendations/product/{product_asin}
```

#### Get Collaborative Recommendations

```http
GET /recommendations/collaborative/{product_asin}?n=6
```

**Query Parameters:**

- `n` (int, 1-20): Number of recommendations

**Response:**

```json
{
  "product_asin": "B07D1C573W",
  "method": "collaborative",
  "source_product": { ... },
  "recommendations": [
    {
      "asin": "B0B6GLN38Y",
      "title": "...",
      "similarity": 0.085,
      "method": "collaborative",
      "image_url": "...",
      "price": 19.99
    }
  ]
}
```

#### Get Content-Based Recommendations

```http
GET /recommendations/content/{product_asin}?n=6
```

#### Get Hybrid Recommendations

```http
GET /recommendations/hybrid/{product_asin}?n=6&cf_weight=0.6
```

**Query Parameters:**

- `n` (int, 1-20): Number of recommendations
- `cf_weight` (float, 0-1): Collaborative filtering weight (default: 0.6)

### Demand Forecasting Endpoints

#### Get Demand Statistics

```http
GET /demand/stats
```

**Response:**

```json
{
  "status": "ready",
  "total_products": 4875,
  "total_weeks": 1200,
  "total_demand": 100000,
  "time_range": {
    "start": "2000-W32",
    "end": "2023-W12"
  },
  "assumption": "Review count used as proxy for demand"
}
```

#### Get Top Products

```http
GET /demand/top-products?limit=20
```

**Query Parameters:**

- `limit` (int, 1-100): Number of products

**Response:**

```json
[
  {
    "asin": "B07D1C573W",
    "title": "...",
    "total_demand": 1234,
    "avg_weekly_demand": 12.5,
    "num_weeks": 98,
    "avg_rating": 4.5
  }
]
```

#### Get Product Demand

```http
GET /demand/product/{asin}
```

**Response:**

```json
{
  "asin": "B07D1C573W",
  "title": "...",
  "total_demand": 1234,
  "avg_demand": 12.5,
  "max_demand": 45,
  "min_demand": 2,
  "trend": "increasing",
  "time_series": [
    {
      "week": "2023-W01",
      "demand": 15.0,
      "rating": 4.5
    }
  ]
}
```

#### Get Overall Trend

```http
GET /demand/overall-trend
```

#### Get Category Demand

```http
GET /demand/categories
```

#### Get Product Forecast

```http
GET /demand/forecast/{asin}?weeks=8
```

**Query Parameters:**

- `weeks` (int, 1-16): Forecast horizon

**Response:**

```json
{
  "asin": "B07D1C573W",
  "title": "...",
  "model_type": "GradientBoostingRegressor",
  "model_mae": 0.95,
  "forecast_weeks": 8,
  "historical": [
    {
      "week": "2023-W01",
      "demand": 15.0,
      "is_forecast": false
    }
  ],
  "forecast": [
    {
      "week": "Forecast-1",
      "demand": 16.2,
      "is_forecast": true
    }
  ],
  "combined": [ ... ]
}
```

### Authentication Endpoints

#### Login

```http
POST /login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=password
```

**Response:**

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

#### Register

```http
POST /register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password",
  "full_name": "John Doe"
}
```

### User Management Endpoints

#### Get Current User

```http
GET /users/me
Authorization: Bearer <token>
```

#### Get All Users

```http
GET /users/
Authorization: Bearer <token>
```

#### Get User by ID

```http
GET /users/{user_id}
Authorization: Bearer <token>
```

#### Update User

```http
PUT /users/{user_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Jane Doe"
}
```

### Health Check

```http
GET /health
```

**Response:**

```json
{
  "status": "healthy",
  "mongodb": "connected",
  "recommendations": "available"
}
```

### Interactive API Documentation

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## 🎨 Frontend Routes

### Route Structure

```
/                           # Home/Recommendations page
├── /demand                 # Demand Analytics Dashboard
├── /login                  # Login page
├── /register               # Registration page
└── /profile                # User profile (protected)
```

### Components

**Recommendations Page (`/`):**

- Product catalog grid
- Product selection
- Recommendation display (collaborative/content/hybrid)
- Algorithm selector
- Product search

**Demand Analytics (`/demand`):**

- Overall statistics cards
- Demand trend chart
- Category performance
- Product leaderboard
- Product deep dive
- Forecast visualization (tab)

**Authentication:**

- Login form with email/password
- Registration form
- SSO integration (if configured)

---

## 🚀 Getting Started

### Prerequisites

- **Docker** and **Docker Compose** installed
- **Git** for cloning the repository
- **Node.js 18+** (for local frontend development)
- **Python 3.12+** (for local backend development)
- **uv** (Python package manager) - [Installation](https://docs.astral.sh/uv/)

### Quick Start with Docker

1. **Clone the repository:**

```bash
git clone https://github.com/your-org/fastapi-react-mongodb-docker.git
cd fastapi-react-mongodb-docker
```

2. **Set up environment variables:**

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start the stack:**

```bash
docker compose up --build
```

4. **Access the application:**

- Frontend: http://localhost
- Backend API: http://localhost/api/v1
- API Docs: http://localhost/docs
- MongoDB: localhost:27017

### Local Development

#### Backend Setup

```bash
cd backend

# Install dependencies
uv sync

# Run development server
uv run fastapi dev app/main.py
```

Backend will be available at `http://localhost:8000`

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## 💻 Development

### Backend Development

**Project Structure:**

- `app/main.py` - FastAPI application
- `app/routers/` - API route handlers
- `app/services/` - Business logic
- `app/models/` - Database models
- `app/schemas/` - Pydantic validation models

**Running Tests:**

```bash
cd backend
uv run pytest
```

**Code Formatting:**

```bash
uv run black app/
uv run ruff check app/
```

### Frontend Development

**Project Structure:**

- `src/routes/` - Page components
- `src/components/` - Reusable components
- `src/services/` - API client services
- `src/contexts/` - React contexts

**Running Tests:**

```bash
cd frontend
npm test
```

**Code Formatting:**

```bash
npm run format
npm run lint
```

### ML Model Training

**Location:** `backend/ml/notebooks/`

**Notebooks:**

1. `product_recommendations.ipynb` - Train recommendation models
2. `demand_forecasting.ipynb` - Train demand forecasting model

**Training Process:**

1. Open Jupyter notebook
2. Run all cells
3. Models saved to `backend/ml/models/`
4. Restart backend to load new models

**See:** `backend/ml/notebooks/RESEARCH_DOCUMENTATION.md` for detailed methodology

---

## 🐳 Deployment

### Production Docker Compose

```bash
docker compose -f docker-compose.prod.yml up --build
```

### Environment Variables

**Backend (.env):**

```env
# MongoDB
MONGO_HOST=mongodb
MONGO_PORT=27017
MONGO_USER=admin
MONGO_PASSWORD=password
MONGO_DB=ecommerce

# API
API_V1_STR=/api/v1
SECRET_KEY=your-secret-key-here
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=admin

# CORS
BACKEND_CORS_ORIGINS=["http://localhost","http://localhost:5173"]
```

**Frontend (.env.production):**

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Production Considerations

1. **Security:**

   - Change default passwords
   - Use strong SECRET_KEY
   - Enable HTTPS
   - Configure CORS properly
2. **Performance:**

   - Enable model caching
   - Use CDN for static assets
   - Configure Nginx caching
   - Database indexing
3. **Monitoring:**

   - Set up logging
   - Monitor API response times
   - Track model performance
   - Database connection pooling

---

## 🤖 ML Models

### Recommendation Models

**Files:**

- `knn_recommender.joblib` - KNN model for collaborative filtering
- `tfidf_vectorizer.joblib` - TF-IDF vectorizer for content-based
- `item_user_matrix.npz` - Sparse user-item interaction matrix
- `tfidf_matrix.npz` - Sparse TF-IDF feature matrix
- `recommendation_mappings.json` - Product ID mappings

**Model Loading:**

- Models loaded at application startup
- Singleton pattern for service instances
- Automatic fallback if models unavailable

### Demand Forecasting Models

**Files:**

- `demand_forecast_gb.joblib` - Gradient Boosting regressor
- `demand_forecast_info.json` - Model metadata

**Features:**

- Lag features (1, 2, 4 weeks)
- Rolling statistics (mean, std over 4 weeks)
- Temporal features (week, month, year)

**Forecast Horizon:**

- Optimal: 4-8 weeks
- Maximum: 16 weeks
- Accuracy decreases with longer horizons

### Model Training

See `backend/ml/notebooks/RESEARCH_DOCUMENTATION.md` for:

- Complete methodology
- Data processing steps
- Model selection rationale
- Evaluation metrics
- Results and limitations

---

## 📊 Performance

### Backend Performance

- **API Response Time:** <100ms (recommendations)
- **Model Loading:** ~2-3 seconds (startup)
- **Concurrent Requests:** Handles 100+ req/s
- **Memory Usage:** ~500MB (with models loaded)

### Frontend Performance

- **Initial Load:** <2s (production build)
- **Bundle Size:** ~500KB (gzipped)
- **Time to Interactive:** <3s

### Scalability

**Current Limitations:**

- In-memory model storage
- Single-threaded processing (some components)
- No distributed computing

**Scaling Options:**

1. Model caching with Redis
2. Load balancing with multiple backend instances
3. Database connection pooling
4. CDN for static assets

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
uv run pytest
uv run pytest --cov=app tests/  # With coverage
```

**Test Files:**

- `tests/routers/test_login.py` - Authentication tests
- `tests/routers/test_users.py` - User management tests

### Frontend Tests

```bash
cd frontend
npm test
npm run coverage  # With coverage
```

**Test Files:**

- Component unit tests
- Service integration tests
- E2E tests (if configured)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📧 Contact

- **Repository:** [GitHub](https://github.com/your-org/fastapi-react-mongodb-docker)
- **Issues:** [GitHub Issues](https://github.com/your-org/fastapi-react-mongodb-docker/issues)

---

## 🙏 Acknowledgments

- FastAPI team for the excellent framework
- Material-UI for the component library
- Polars team for the fast DataFrame library
- scikit-learn for machine learning tools

---

**Last Updated:** 2024
