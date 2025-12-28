"""
Recommendation Service - Loads ML models and provides recommendations with product metadata
"""
import json
from pathlib import Path
from typing import Optional

import joblib
import polars as pl
from scipy.sparse import load_npz
from sklearn.metrics.pairwise import cosine_similarity

# Paths
ML_MODELS_PATH = Path(__file__).parent.parent.parent / "ml" / "models"
DATASET_PATH = Path(__file__).parent.parent.parent / "ml" / "dataset"


def _parse_price(price_value) -> Optional[float]:
    """Parse price string (e.g., '$13.99') to float, or return None if invalid."""
    if price_value is None:
        return None
    
    if isinstance(price_value, (int, float)):
        return float(price_value)
    
    if isinstance(price_value, str):
        # Remove currency symbols, commas, and whitespace
        cleaned = price_value.replace('$', '').replace(',', '').strip()
        if not cleaned:
            return None
        try:
            return float(cleaned)
        except (ValueError, TypeError):
            return None
    
    return None


class RecommendationService:
    """Service to handle product recommendations using pre-trained models."""
    
    _instance = None
    
    def __new__(cls):
        """Singleton pattern to avoid reloading models."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self.knn_model = None
        self.tfidf_vectorizer = None
        self.item_user_matrix = None
        self.tfidf_matrix = None
        self.mappings = None
        self.product_metadata = {}  # Cache for product details
        self._initialized = True
        self._load_models()
    
    def _load_models(self):
        """Load all ML models from disk."""
        try:
            # Load KNN model
            knn_path = ML_MODELS_PATH / "knn_recommender.joblib"
            if knn_path.exists():
                self.knn_model = joblib.load(knn_path)
            
            # Load TF-IDF vectorizer
            tfidf_path = ML_MODELS_PATH / "tfidf_vectorizer.joblib"
            if tfidf_path.exists():
                self.tfidf_vectorizer = joblib.load(tfidf_path)
            
            # Load sparse matrices
            item_user_path = ML_MODELS_PATH / "item_user_matrix.npz"
            if item_user_path.exists():
                self.item_user_matrix = load_npz(item_user_path)
            
            tfidf_matrix_path = ML_MODELS_PATH / "tfidf_matrix.npz"
            if tfidf_matrix_path.exists():
                self.tfidf_matrix = load_npz(tfidf_matrix_path)
            
            # Load mappings
            mappings_path = ML_MODELS_PATH / "recommendation_mappings.json"
            if mappings_path.exists():
                with open(mappings_path, "r") as f:
                    self.mappings = json.load(f)
            
            # Load product metadata - scan more rows to find matches
            self._load_metadata_index()
            
            print("✅ Recommendation models loaded successfully!")
            
        except Exception as e:
            print(f"⚠️ Error loading recommendation models: {e}")
    
    def _load_metadata_index(self):
        """Load product metadata index - optimized to find ML model products."""
        try:
            # Try both .jsonl and .json extensions
            meta_path = DATASET_PATH / "meta_Home_and_Kitchen.jsonl"
            if not meta_path.exists():
                meta_path = DATASET_PATH / "meta_Home_and_Kitchen.json"
            if not meta_path.exists():
                print("   ⚠️ Metadata file not found")
                return
            
            # Get product ASINs from our ML model
            model_products = set()
            if self.mappings:
                model_products = set(self.mappings.get("product_to_idx", {}).keys())
            
            print(f"   🔍 Looking for {len(model_products)} products from ML model...")
            
            # Scan metadata in batches to find matching products
            batch_size = 50000
            offset = 0
            found = 0
            
            while found < len(model_products) and offset < 500000:  # Max 500k rows
                try:
                    meta = pl.read_ndjson(
                        meta_path,
                        n_rows=batch_size,
                    ).slice(offset, batch_size)
                    
                    if len(meta) == 0:
                        break
                    
                    # Filter to only model products
                    # Handle both 'parent_asin' and 'asin' column names
                    for row in meta.iter_rows(named=True):
                        asin = row.get('parent_asin') or row.get('asin')
                        if asin and asin in model_products and asin not in self.product_metadata:
                            self.product_metadata[asin] = row
                            found += 1
                    
                    offset += batch_size
                    
                except Exception:
                    break
            
            # If we didn't find many, just load first N rows for browsing
            if len(self.product_metadata) < 100:
                meta = pl.read_ndjson(meta_path, n_rows=10000)
                for row in meta.iter_rows(named=True):
                    # Handle both 'parent_asin' and 'asin' column names
                    asin = row.get('parent_asin') or row.get('asin')
                    if asin and asin not in self.product_metadata:
                        self.product_metadata[asin] = row
            
            print(f"   📦 Loaded metadata for {len(self.product_metadata):,} products")
            
        except Exception as e:
            print(f"   ⚠️ Could not load product metadata: {e}")
    
    def get_product_details(self, asin: str) -> Optional[dict]:
        """Get product details by ASIN."""
        data = self.product_metadata.get(asin)
        
        if not data:
            # Return minimal info for products without metadata
            return {
                "asin": asin,
                "title": f"Product {asin}",
                "description": "",
                "image_url": None,
                "price": None,
                "rating": None,
                "rating_count": None,
                "store": None,
                "categories": []
            }
        
        # Extract first image - check multiple possible field names
        image_url = None
        
        # Try imageURLHighRes first (highest quality)
        image_url_high_res = data.get('imageURLHighRes', [])
        if image_url_high_res and isinstance(image_url_high_res, list) and len(image_url_high_res) > 0:
            image_url = image_url_high_res[0] if isinstance(image_url_high_res[0], str) else None
        
        # Fall back to imageURL if no high-res
        if not image_url:
            image_url_list = data.get('imageURL', [])
            if image_url_list and isinstance(image_url_list, list) and len(image_url_list) > 0:
                image_url = image_url_list[0] if isinstance(image_url_list[0], str) else None
        
        # Also check for 'images' field (nested dict format)
        if not image_url:
            images = data.get('images', [])
            if images and isinstance(images, list) and len(images) > 0:
                first_image = images[0]
                if isinstance(first_image, dict):
                    # Prefer hi_res, then large, then thumb
                    image_url = (
                        first_image.get('hi_res') or 
                        first_image.get('large') or 
                        first_image.get('thumb')
                    )
                elif isinstance(first_image, str):
                    image_url = first_image
        
        # Extract description
        description = ""
        desc = data.get('description', [])
        if desc:
            if isinstance(desc, list):
                description = " ".join(str(d) for d in desc[:2])
            else:
                description = str(desc)
        
        if not description:
            features = data.get('features', [])
            if features and isinstance(features, list):
                description = str(features[0]) if features else ""
        
        if len(description) > 200:
            description = description[:197] + "..."
        
        categories = data.get('categories', [])
        if categories and isinstance(categories, list):
            categories = categories[:3]
        else:
            categories = []
        
        return {
            "asin": asin,
            "title": data.get('title', f'Product {asin}'),
            "description": description,
            "image_url": image_url,
            "price": _parse_price(data.get('price')),
            "rating": data.get('average_rating'),
            "rating_count": data.get('rating_number'),
            "store": data.get('store'),
            "categories": categories
        }
    
    def _has_image(self, data: dict) -> bool:
        """Check if product data has a valid image URL."""
        # Check imageURLHighRes
        image_url_high_res = data.get('imageURLHighRes', [])
        if image_url_high_res and isinstance(image_url_high_res, list) and len(image_url_high_res) > 0:
            if isinstance(image_url_high_res[0], str) and image_url_high_res[0]:
                return True
        
        # Check imageURL
        image_url_list = data.get('imageURL', [])
        if image_url_list and isinstance(image_url_list, list) and len(image_url_list) > 0:
            if isinstance(image_url_list[0], str) and image_url_list[0]:
                return True
        
        # Check images (nested dict format)
        images = data.get('images', [])
        if images and isinstance(images, list) and len(images) > 0:
            first_img = images[0]
            if isinstance(first_img, dict):
                img_url = first_img.get('hi_res') or first_img.get('large') or first_img.get('thumb')
                if img_url:
                    return True
            elif isinstance(first_img, str) and first_img:
                return True
        
        return False
    
    def _enrich_recommendations(self, recommendations: list[dict]) -> list[dict]:
        """Add product details to recommendations - only include products WITH images."""
        enriched = []
        for rec in recommendations:
            asin = rec.get('asin', '')
            details = self.get_product_details(asin)
            
            # Only include products with images
            if not details.get('image_url'):
                continue
            
            enriched.append({
                **rec,
                "title": details.get('title', f'Product {asin}'),
                "description": details.get('description', ''),
                "image_url": details.get('image_url'),  # Use actual image from metadata
                "price": details.get('price'),
                "rating": details.get('rating'),
                "rating_count": details.get('rating_count'),
                "store": details.get('store'),
                "categories": details.get('categories', [])
            })
        
        return enriched
    
    @property
    def is_ready(self) -> bool:
        """Check if models are loaded and ready."""
        return all([
            self.knn_model is not None,
            self.item_user_matrix is not None,
            self.mappings is not None
        ])
    
    def get_collaborative_recommendations(
        self, 
        product_asin: str, 
        n_recommendations: int = 5
    ) -> list[dict]:
        """Get recommendations using Collaborative Filtering (Item-based KNN)."""
        if not self.is_ready:
            return []
        
        product_to_idx = self.mappings.get("product_to_idx", {})
        idx_to_product = self.mappings.get("idx_to_product", {})
        
        if product_asin not in product_to_idx:
            return []
        
        product_idx = product_to_idx[product_asin]
        
        distances, indices = self.knn_model.kneighbors(
            self.item_user_matrix[product_idx].reshape(1, -1),
            n_neighbors=n_recommendations + 1
        )
        
        recommendations = []
        for i, idx in enumerate(indices[0][1:]):
            recommendations.append({
                "asin": idx_to_product.get(str(idx), ""),
                "similarity": round(float(1 - distances[0][i+1]), 3),
                "method": "collaborative"
            })
        
        return self._enrich_recommendations(recommendations)
    
    def get_content_recommendations(
        self, 
        product_asin: str, 
        n_recommendations: int = 5
    ) -> list[dict]:
        """Get recommendations using Content-Based Filtering (TF-IDF)."""
        if self.tfidf_matrix is None or self.mappings is None:
            return []
        
        cb_product_to_idx = self.mappings.get("cb_product_to_idx", {})
        cb_idx_to_product = self.mappings.get("cb_idx_to_product", {})
        
        if product_asin not in cb_product_to_idx:
            return []
        
        idx = cb_product_to_idx[product_asin]
        
        similarities = cosine_similarity(
            self.tfidf_matrix[idx], 
            self.tfidf_matrix
        ).flatten()
        
        similar_indices = similarities.argsort()[::-1][1:n_recommendations+1]
        
        recommendations = []
        for i in similar_indices:
            recommendations.append({
                "asin": cb_idx_to_product.get(str(i), ""),
                "similarity": round(float(similarities[i]), 3),
                "method": "content"
            })
        
        return self._enrich_recommendations(recommendations)
    
    def get_hybrid_recommendations(
        self, 
        product_asin: str, 
        n_recommendations: int = 5,
        cf_weight: float = 0.6
    ) -> list[dict]:
        """Get recommendations using Hybrid approach (CF + Content)."""
        cf_recs = self.get_collaborative_recommendations(product_asin, n_recommendations * 2)
        cb_recs = self.get_content_recommendations(product_asin, n_recommendations * 2)
        
        if not cf_recs and not cb_recs:
            return []
        
        if not cf_recs:
            return cb_recs[:n_recommendations]
        
        if not cb_recs:
            return cf_recs[:n_recommendations]
        
        scores = {}
        product_data = {}
        cb_weight = 1 - cf_weight
        
        for rec in cf_recs:
            asin = rec["asin"]
            scores[asin] = (rec.get("similarity", 0) or 0) * cf_weight
            product_data[asin] = rec
        
        for rec in cb_recs:
            asin = rec["asin"]
            if asin in scores:
                scores[asin] += (rec.get("similarity", 0) or 0) * cb_weight
            else:
                scores[asin] = (rec.get("similarity", 0) or 0) * cb_weight
                product_data[asin] = rec
        
        sorted_recs = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        
        results = []
        for asin, score in sorted_recs[:n_recommendations]:
            data = product_data.get(asin, {})
            # Only include products with images
            if not data.get("image_url"):
                continue
            results.append({
                "asin": asin,
                "score": round(score, 3),
                "method": "hybrid",
                "title": data.get("title", f"Product {asin}"),
                "description": data.get("description", ""),
                "image_url": data.get("image_url"),
                "price": _parse_price(data.get("price")),
                "rating": data.get("rating"),
                "rating_count": data.get("rating_count"),
                "store": data.get("store"),
                "categories": data.get("categories", [])
            })
        
        return results
    
    def get_available_products(self, limit: int = 100, offset: int = 0) -> dict:
        """Get list of products with details - only return products WITH images."""
        if not self.mappings:
            return {"products": [], "total": 0, "offset": 0, "limit": limit}
        
        # Only get products that have metadata AND images
        products_with_images = []
        all_products = list(self.mappings.get("product_to_idx", {}).keys())
        
        for asin in all_products:
            if asin in self.product_metadata:
                data = self.product_metadata[asin]
                if self._has_image(data):
                    products_with_images.append(asin)
        
        # Only return products with images
        total = len(products_with_images)
        paginated_asins = products_with_images[offset:offset + limit]
        
        products = []
        for asin in paginated_asins:
            details = self.get_product_details(asin)
            if details and details.get('image_url'):
                # Only include products with images
                products.append(details)
        
        return {
            "products": products,
            "total": total,
            "offset": offset,
            "limit": limit
        }
    
    def search_products(self, query: str, limit: int = 20) -> list[dict]:
        """Search products by title."""
        if not self.product_metadata:
            return []
        
        query_lower = query.lower()
        results = []
        
        for asin, data in self.product_metadata.items():
            title = data.get('title', '').lower()
            if query_lower in title:
                details = self.get_product_details(asin)
                if details:
                    results.append(details)
                    if len(results) >= limit:
                        break
        
        return results
    
    def get_stats(self) -> dict:
        """Get recommendation system statistics."""
        if not self.mappings:
            return {"status": "not_loaded"}
        
        return {
            "status": "ready" if self.is_ready else "partial",
            "total_products": len(self.mappings.get("product_to_idx", {})),
            "products_with_content": len(self.mappings.get("cb_product_to_idx", {})),
            "products_with_metadata": len(self.product_metadata),
            "models_loaded": {
                "knn": self.knn_model is not None,
                "tfidf": self.tfidf_vectorizer is not None,
                "item_user_matrix": self.item_user_matrix is not None,
                "tfidf_matrix": self.tfidf_matrix is not None,
            }
        }


# Global instance
recommendation_service = RecommendationService()
