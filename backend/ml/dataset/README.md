# Dataset Directory

This directory contains the training data for the machine learning models.

## ⚠️ Large Files Not Committed

The dataset files are **NOT committed to git** due to their large size:
- `Home_and_Kitchen.jsonl`: ~29GB (uncompressed)
- `Home_and_Kitchen.jsonl.gz`: ~7.7GB (compressed)
- `meta_Home_and_Kitchen.jsonl`: ~11GB (uncompressed)
- `meta_Home_and_Kitchen.jsonl.gz`: ~2.8GB (compressed)

## 📥 How to Obtain the Dataset

### Option 1: Download from Original Source

The dataset is from Amazon product reviews. You can:

1. Download from [Amazon Product Data](https://cseweb.ucsd.edu/~jmcauley/datasets/amazon_v2/) or similar sources
2. Look for "Home and Kitchen" category reviews
3. Place the files in this directory

### Option 2: Use Pre-trained Models

If you only want to use the application (not train new models):

1. The trained models are already in `../models/` directory
2. The application will work with pre-trained models
3. You don't need the dataset files to run the application

### Option 3: Use Sample Data

For development/testing, you can:

1. Use a smaller sample of the data
2. The notebooks can work with partial data (see `SAMPLE_SIZE` in notebooks)
3. Adjust the sample size in the notebooks to fit your needs

## 📝 File Format

- **JSONL format**: One JSON object per line
- **Fields**: `user_id`, `asin`, `parent_asin`, `rating`, `timestamp`, `title`, `text`, etc.
- **Metadata**: Product information (title, category, price, images, etc.)

## 🔧 Usage

1. Place dataset files in this directory
2. Run the Jupyter notebooks in `../notebooks/`:
   - `product_recommendations.ipynb` - Trains recommendation models
   - `demand_forecasting.ipynb` - Trains demand forecasting model
3. Trained models will be saved to `../models/`

## 📊 Dataset Statistics

- **Total Reviews**: ~100,000 (sample used in notebooks)
- **Total Products**: ~73,600 unique products
- **Time Range**: 2000-2023
- **Category**: Home & Kitchen

## ⚡ Performance Tips

- Use compressed `.jsonl.gz` files to save disk space
- The notebooks use Polars for fast data loading (10-50x faster than pandas)
- Consider using a subset of data for faster iteration during development
