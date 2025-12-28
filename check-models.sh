#!/bin/bash

echo "🔍 Checking ML Models Setup..."
echo ""

# Check if models exist locally
echo "📦 Local Models:"
if [ -d "backend/ml/models" ]; then
    echo "  ✅ Models directory exists"
    model_count=$(ls -1 backend/ml/models/*.joblib backend/ml/models/*.npz backend/ml/models/*.json 2>/dev/null | wc -l | tr -d ' ')
    echo "  📊 Found $model_count model files"
    
    echo ""
    echo "  Required files:"
    required_files=(
        "knn_recommender.joblib"
        "tfidf_vectorizer.joblib"
        "item_user_matrix.npz"
        "tfidf_matrix.npz"
        "recommendation_mappings.json"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "backend/ml/models/$file" ]; then
            echo "    ✅ $file"
        else
            echo "    ❌ $file (MISSING!)"
        fi
    done
else
    echo "  ❌ Models directory not found!"
fi

echo ""
echo "🐳 Docker Container Check:"
echo "  Run this to check if models are in the container:"
echo "  docker compose exec backend ls -la /app/ml/models/"
echo ""
echo "📋 Backend Logs:"
echo "  Run this to see backend startup logs:"
echo "  docker compose logs backend | grep -i 'model\|recommendation\|error'"
echo ""

