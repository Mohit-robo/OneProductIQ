import os
import chromadb
from sentence_transformers import SentenceTransformer

def check_chroma():
    # Connect to ChromaDB (localhost if running outside docker, or 'chroma' if inside)
    host = "chroma" if os.path.exists("/.dockerenv") else "localhost"
    chroma_client = chromadb.HttpClient(host=host, port=8000)
    
    try:
        collection = chroma_client.get_collection(name="products")
    except Exception as e:
        print(f"Error getting collection: {e}")
        return

    # 1. Check Total Count
    print(f"📦 Total products embedded in ChromaDB: {collection.count()}")
    
    if collection.count() == 0:
        return

    # 2. Peek at the data (like clicking 'View Document' in Compass)
    print("\n🔍 --- PEEKING AT FIRST ENTRY ---")
    peek_data = collection.peek(1)
    print(f"ID: {peek_data['ids'][0]}")
    print(f"Metadata: {peek_data['metadatas'][0]}")
    print(f"Document chunk: {peek_data['documents'][0][:150]}...")

    # 3. Test a Semantic Search!
    print("\n🎯 --- TEST SEMANTIC SEARCH ---")
    query_text = "a dark colored formal shirt"
    print(f"Searching for: '{query_text}'")
    
    print("Loading embedding model...")
    model = SentenceTransformer("all-MiniLM-L6-v2")
    query_embedding = model.encode(query_text).tolist()

    # Query ChromaDB
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=2 # Get top 2 matches
    )

    for i in range(len(results['ids'][0])):
        # In ChromaDB, lower distance = closer match (L2 distance by default)
        print(f"\nResult {i+1} (Distance score: {results['distances'][0][i]:.4f})")
        print(f"Brand: {results['metadatas'][0][i]['brand']}")
        print(f"Price: ${results['metadatas'][0][i]['price']}")
        print(f"Match snippet: {results['documents'][0][i][:150]}...")

if __name__ == "__main__":
    check_chroma()
