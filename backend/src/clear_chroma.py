import os
import sys
from pathlib import Path
import chromadb

# Ensure backend/src is in sys.path
sys.path.append(str(Path(__file__).parent))

from config import Settings

settings = Settings()

def clear_chromadb():
    chroma_host = os.getenv("CHROMA_HOST", "localhost")
    chroma_client = chromadb.HttpClient(host=chroma_host, port=8000)
    collection_name = settings.chroma_collection_products

    print(f"Attempting to clear ChromaDB collection: '{collection_name}'...")
    try:
        chroma_client.delete_collection(name=collection_name)
        print(f"✅ Collection '{collection_name}' deleted successfully.")
    except Exception as e:
        print(f"⚠️ Could not delete collection (it might not exist yet): {e}")

    # Re-create the collection so it is ready and empty
    chroma_client.get_or_create_collection(name=collection_name)
    print(f"✅ Re-created empty collection '{collection_name}'.")

if __name__ == "__main__":
    clear_chromadb()
