import os
import chromadb
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
from bson.objectid import ObjectId
from typing import List, Dict, Any, Optional

from src.config import Settings

settings = Settings()

# Lazy initialized variables
mongo_client = None
collection = None
chroma_client = None
chroma_collection = None
embedder = None

def get_mongo_collection():
    global mongo_client, collection
    if collection is None:
        mongo_url = os.getenv("MONGODB_URL", "mongodb://admin:secret123@localhost:27017/?authSource=admin")
        mongo_client = MongoClient(mongo_url)
        db = mongo_client[settings.mongodb_db]
        collection = db["products"]
    return collection

def get_chroma_collection():
    global chroma_client, chroma_collection
    if chroma_collection is None:
        chroma_host = os.getenv("CHROMA_HOST", "localhost")
        chroma_client = chromadb.HttpClient(host=chroma_host, port=8000)
        chroma_collection = chroma_client.get_or_create_collection(name=settings.chroma_collection_products)
    return chroma_collection

def get_embedder():
    global embedder
    if embedder is None:
        print("Loading embedding model for search engine...")
        embedder = SentenceTransformer(settings.embedding_model_name)
    return embedder

def preload_resources():
    """Warm up database clients and embedding models to prevent cold-start latency."""
    get_mongo_collection()
    get_chroma_collection()
    get_embedder()

def hybrid_search(query: str, top_k: int = 5, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Perform a hybrid semantic search.
    :param query: The natural language search query.
    :param top_k: Number of results to return.
    :param filters: A dictionary of hard filters (e.g. {"brand": "Nike", "max_price": 50}).
    :return: A list of full product dictionaries from MongoDB.
    """
    # 1. Embed the query
    embedder_model = get_embedder()
    query_embedding = embedder_model.encode(query).tolist()
    
    # 2. Build the ChromaDB 'where' clause for hard metadata filters
    where_clause = None
    if filters:
        chroma_filters = []
        
        # Example filter translations
        if "brand" in filters and filters["brand"]:
            chroma_filters.append({"brand": {"$eq": filters["brand"]}})
        
        if "product_type" in filters and filters["product_type"]:
            chroma_filters.append({"product_type": {"$eq": filters["product_type"]}})
            
        if "max_price" in filters and filters["max_price"]:
            chroma_filters.append({"price": {"$lte": float(filters["max_price"])}})
            
        if "primary_color" in filters and filters["primary_color"]:
            chroma_filters.append({"primary_color": {"$eq": filters["primary_color"]}})

        # ChromaDB requires a dict for 1 filter, or {"$and": [...]} for multiple
        if len(chroma_filters) == 1:
            where_clause = chroma_filters[0]
        elif len(chroma_filters) > 1:
            where_clause = {"$and": chroma_filters}

    # 3. Query ChromaDB for Vector Similarity
    try:
        c_collection = get_chroma_collection()
        results = c_collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where_clause
        )
    except Exception as e:
        print(f"ChromaDB Query Error: {e}")
        return []

    if not results['ids'] or not results['ids'][0]:
        return []

    # 4. Extract IDs and their corresponding distances
    retrieved_ids = results['ids'][0]
    distances = results['distances'][0]
    
    # 5. Fetch full documents from MongoDB
    object_ids = [ObjectId(id_str) for id_str in retrieved_ids]
    m_collection = get_mongo_collection()
    mongo_docs = list(m_collection.find({"_id": {"$in": object_ids}}))
    
    # 6. MongoDB doesn't return results in the exact order of the $in array. 
    # We must re-order them to match the ChromaDB distance ranking.
    doc_map = {str(doc["_id"]): doc for doc in mongo_docs}
    
    final_results = []
    seen_ids = set()
    DISTANCE_THRESHOLD = 1.15

    for doc_id, dist in zip(retrieved_ids, distances):
        # If the user typed a query, enforce a semantic similarity threshold.
        # An empty query will bypass this and return all recent products.
        if query.strip() and dist > DISTANCE_THRESHOLD:
            continue
            
        if doc_id in doc_map and doc_id not in seen_ids:
            seen_ids.add(doc_id)
            doc = doc_map[doc_id].copy()
            # Convert ObjectId to string so it can be serialized to JSON later in FastAPI
            doc["_id"] = str(doc["_id"])
            doc["search_score"] = dist  # Lower distance = better match
            final_results.append(doc)

    return final_results
