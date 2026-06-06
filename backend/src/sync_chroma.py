import os
import sys

from pymongo import MongoClient
import chromadb
from sentence_transformers import SentenceTransformer
from pathlib import Path

ROOT_DIR = Path(__file__).parent / 'src'
sys.path.append(str(ROOT_DIR))

from config import Settings

settings = Settings()

# Connect to MongoDB
mongo_url = os.getenv("MONGODB_URL", "mongodb://admin:secret123@localhost:27017/?authSource=admin")
mongo_client = MongoClient(mongo_url)
db = mongo_client[settings.mongodb_db]
collection = db["products"]

# Connect to ChromaDB
# If we are inside Docker, CHROMA_HOST will be 'chroma' (from docker-compose.yml)
chroma_host = os.getenv("CHROMA_HOST", "localhost")
chroma_client = chromadb.HttpClient(host=chroma_host, port=8000)

chroma_collection = chroma_client.get_or_create_collection(name=settings.chroma_collection_products)

print("Loading embedding model (all-MiniLM-L6-v2)...")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

def sync_mongodb_to_chroma():
    products = list(collection.find({}))
    if not products:
        print("No products found in MongoDB.")
        return

    print(f"Found {len(products)} products in MongoDB. Syncing to ChromaDB...")

    docs = []
    metadatas = []
    ids = []

    for p in products:
        # We combine the semantic visual description with the brand and product type
        # to create a highly searchable chunk of text.
        visual_desc = p.get("visual_description", "")
        text_to_embed = f"{p.get('brand', '')} {p.get('product_type', '')}. {visual_desc}"
        
        doc_id = str(p["_id"])
        
        # Metadata allows us to do exact keyword/price filtering inside ChromaDB
        meta = {
            "sku": p.get("sku", "AUTO-GEN"),
            "brand": p.get("brand", "Unknown"),
            "product_type": p.get("product_type", "Unknown"),
            "price": float(p.get("price", 0.0)),
            "primary_color": p.get("primary_color", "Unknown")
        }

        docs.append(text_to_embed)
        metadatas.append(meta)
        ids.append(doc_id)

    print("Computing embeddings...")
    # Encode all documents into vectors
    embeddings = embedder.encode(docs, show_progress_bar=True).tolist()

    print("Upserting into ChromaDB...")
    chroma_collection.upsert(
        ids=ids,
        documents=docs,
        embeddings=embeddings,
        metadatas=metadatas
    )

    print("✅ Successfully synced MongoDB products to ChromaDB!")

if __name__ == "__main__":
    sync_mongodb_to_chroma()
