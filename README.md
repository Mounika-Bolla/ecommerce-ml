# E-Commerce ML Platform

A full-stack e-commerce platform that provides production-ready product recommendations and demand forecasting. Built with FastAPI, React, MongoDB and Docker. The project includes model training artifacts, a REST API, and a responsive frontend for recommendations and analytics.

## Overview

This repository implements:
- Item-based collaborative filtering and TF-IDF content-based recommendations.
- A hybrid recommendation service that blends collaborative and content-based signals.
- Weekly demand forecasting using gradient boosting and time-series features.
- A React frontend with dashboards for recommendations and demand analytics.
- Containerized development and production deployments with Docker Compose.

## Key Features

- Product recommendations:
  - Collaborative filtering (item-based KNN)
  - Content-based filtering (TF-IDF on title/category)
  - Hybrid approach with configurable weighting
  - Enriched responses with product metadata (images, price, rating)

- Demand forecasting:
  - Weekly forecasting using Gradient Boosting (XGBoost or scikit-learn)
  - Feature engineering: lags, rolling statistics, temporal features
  - Analytics dashboard (trend charts, category performance, leaderboards)

- Authentication & user management:
  - OAuth2 with JWT tokens
  - Registration, login, role-based access control
  - Optional SSO integration

- Observability & developer experience:
  - Unit tests and CI configured via GitHub Actions
  - Local and production Docker Compose configurations
  - Interactive API docs (Swagger / ReDoc)

## Screenshots

The images below show the frontend pages for recommendations and demand forecasting. Place these files under `frontend/public/assets/screenshots/` or `frontend/src/assets/` and update paths in the repository as needed.

- frontend/public/assets/screenshots/recommendations-1.png  
  ![Recommendations – selected product and recommended items](frontend/public/recommendation page.png)

- frontend/public/assets/screenshots/demand-hero.png  
  ![Demand analytics hero with summary cards](frontend/public//demand forecasting.png)

- frontend/public/assets/screenshots/leaderboard.png  
  ![Product leaderboard ranked by demand](frontend/public/dm2.png)

- frontend/public/assets/screenshots/deep-dive.png  
  ![Product deep dive and weekly demand timeline](frontend/public/dm3.png)

## Tech Stack

Backend
- FastAPI (Python)
- Python 3.12+
- MongoDB (Beanie + Motor)
- scikit-learn, xgboost (optional), statsmodels (optional)
- polars / pandas for data processing
- joblib for model serialization

Frontend
- React + TypeScript
- Vite
- Material UI (MUI)
- plotly.js / react-plotly.js for charts
- axios for API requests

DevOps
- Docker & Docker Compose
- GitHub Actions for CI
- Nginx for production reverse proxy

## Project Structure (high level)

```
fastapi-react-mongodb-docker/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   ├── services/
│   │   ├── models/
│   │   └── schemas/
│   ├── ml/                      # datasets, trained models, notebooks
│   └── Dockerfile
├── frontend/                   # React frontend
│   ├── public/
│   │   └── assets/screenshots/  # add screenshot files here
│   ├── src/
│   └── Dockerfile
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env
└── README.md
```

## Quick Start

Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local frontend dev)
- Python 3.12+ (for local backend dev)

1. Clone repository
```bash
git clone https://github.com/your-org/fastapi-react-mongodb-docker.git
cd fastapi-react-mongodb-docker
```

2. Copy env example and update values
```bash
cp .env.example .env
# edit .env
```

3. Development with Docker Compose
```bash
docker compose up --build
```

- Frontend: http://localhost
- Backend API: http://localhost:8000/api/v1
- API docs: http://localhost:8000/docs

Local development (separate)

Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

## API (selected endpoints)

Base URL: `/api/v1`

Authentication
- POST /login
- POST /register
- GET /users/me

Recommendations
- GET /recommendations/products
- GET /recommendations/product/{asin}
- GET /recommendations/collaborative/{asin}?n=6
- GET /recommendations/content/{asin}?n=6
- GET /recommendations/hybrid/{asin}?n=6&cf_weight=0.6

Demand forecasting
- GET /demand/stats
- GET /demand/top-products
- GET /demand/product/{asin}
- GET /demand/forecast/{asin}?weeks=8

Health
- GET /health

All protected endpoints require:
```
Authorization: Bearer <token>
```

Interactive docs:
- Swagger UI: /docs
- ReDoc: /redoc

## Machine Learning

Recommendation models:
- knn_recommender.joblib
- tfidf_vectorizer.joblib
- item_user_matrix.npz
- tfidf_matrix.npz

Demand forecasting models:
- demand_forecast_gb.joblib
- demand_forecast_info.json

Models and training notebooks are in `backend/ml/`. Training notebooks:
- product_recommendations.ipynb
- demand_forecasting.ipynb

Best practices:
- Use cross-validation and hold-out test sets
- Persist model metadata and training configuration
- Monitor model performance over time and refresh if accuracy degrades

## Testing

Backend:
```bash
cd backend
pytest
```

Frontend:
```bash
cd frontend
npm test
```

CI is configured via GitHub Actions for linting, tests and builds.

## Deployment

Production stack:
```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Recommendations:
- Serve static frontend via CDN
- Use HTTPS / strong SECRET_KEY values
- Configure model caching (Redis) if serving many requests
- Set up logging and monitoring for API and model performance

## Security

- Store secrets in environment variables or a secrets manager
- Use HTTPS for production
- Enforce strong passwords and rotate default credentials
- Limit CORS to trusted origins

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit and push
4. Open a pull request with description and tests

Please include tests and update the documentation for new functionality.

## License

MIT License — see LICENSE file for details.

## Contact

- Repository: https://github.com/your-org/fastapi-react-mongodb-docker
- Issues: https://github.com/your-org/fastapi-react-mongodb-docker/issues

Last updated: 2026-01-28
