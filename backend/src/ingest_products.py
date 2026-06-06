import os
import sys
from pathlib import Path
from PIL import Image
from pymongo import MongoClient

ROOT_DIR = Path(__file__).parent / 'src'
sys.path.append(str(ROOT_DIR))

from config import Settings
from llm_wrapper import parse_metadata_csv
from vlm_wrapper import get_visual_description_from_image

settings = Settings()

mongo_url = os.getenv("MONGODB_URL", "mongodb://admin:secret123@localhost:27017/?authSource=admin")
client = MongoClient(mongo_url)
db = client[settings.mongodb_db]
collection = db["products"]

def ingest_dataset(base_dir: str):
    """
    Walks through the dataset structure: data/products/test/{category_id}/entry_{n}/
    Reads metadata.csv -> LLM
    Reads images -> VLM
    Saves to MongoDB.
    """
    base_path = Path(base_dir)
    if not base_path.exists() or not base_path.is_dir():
        print(f"Directory {base_dir} not found.")
        return

    # Find all metadata.csv files in the tree
    csv_files = list(base_path.rglob("metadata.csv"))
    if not csv_files:
        print(f"No metadata.csv files found in {base_dir}.")
        return

    print(f"Found {len(csv_files)} products to ingest.")

    supported_extensions = {".jpg", ".jpeg", ".png", ".webp"}

    for csv_path in csv_files:
        entry_dir = csv_path.parent
        print(f"\nProcessing {entry_dir.name}...")
        try:
            # 1. Parse CSV with LLM to get structured metadata
            with open(csv_path, "r", encoding="utf-8") as f:
                csv_content = f.read()
            
            print("  -> Calling LLM to parse metadata.csv...")
            metadata = parse_metadata_csv(csv_content)

            # 2. Find Images
            images = [p for p in entry_dir.iterdir() if p.suffix.lower() in supported_extensions]
            
            if images:
                # 3. Use VLM on the first image for the visual description
                print(f"  -> Calling VLM on {images[0].name} for visual description...")
                first_img = Image.open(images[0])
                visual_desc = get_visual_description_from_image(first_img)
                metadata.visual_description = visual_desc
                
                # Store all image paths relative to the data dir
                # E.g., /products/test/1/entry_1/image.jpg
                paths = []
                for img in images:
                    # Construct a path that the frontend can use to load from the static folder
                    # Assuming frontend serves `data/products/` at `/products/`
                    relative_parts = img.parts[img.parts.index("products"):]
                    paths.append("/" + "/".join(relative_parts))
                metadata.image_paths = paths
            else:
                print("  ⚠️ No images found for this product.")

            # 4. Insert to MongoDB
            doc = metadata.model_dump()
            
            if doc.get("sku") and doc.get("sku") != "AUTO-GEN":
                existing = collection.find_one({"sku": doc.get("sku")})
                if existing:
                    print(f"  ⚠️ SKU {doc.get('sku')} already exists. Skipping.")
                    continue
                
            result = collection.insert_one(doc)
            print(f"  ✅ Inserted {metadata.brand} {metadata.product_type} -> DB ID: {result.inserted_id}")
            
        except Exception as e:
            print(f"  ❌ Failed to process {entry_dir}: {e}")

if __name__ == "__main__":
    import argparse
    from sync_chroma import sync_mongodb_to_chroma
    
    parser = argparse.ArgumentParser(description="Ingest product datasets into MongoDB.")
    parser.add_argument("--dir", type=str, default="/data/products/test", help="Base directory of the dataset")
    parser.add_argument("--skip-chroma", action="store_true", help="Skip syncing to ChromaDB")
    args = parser.parse_args()
    
    print(f"🍃 OneProductIQ - Starting Dataset Ingestion Pipeline")
    ingest_dataset(args.dir)
    
    if not args.skip_chroma:
        print("\n🍃 Starting ChromaDB Vector Sync Pipeline")
        sync_mongodb_to_chroma()
