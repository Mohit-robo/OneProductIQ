#!/usr/bin/env python3
"""
test_chromadb.py — Verify ChromaDB is reachable and vector ops work.
Run from project root: python scripts/test_chromadb.py
"""

import sys
import chromadb
from chromadb.config import Settings

CHROMA_HOST = "localhost"
CHROMA_PORT = 8288          # host-mapped port from docker-compose
TEST_COLLECTION = "test_collection"

def separator(title: str):
    print(f"\n{'─' * 50}")
    print(f"  {title}")
    print('─' * 50)

def main():
    print("\n🟣 OneProductIQ — ChromaDB Test Suite")

    # ── 1. Connect ──────────────────────────────────────────────────────────────
    separator("1. Connection")
    try:
        client = chromadb.HttpClient(
            host=CHROMA_HOST,
            port=CHROMA_PORT,
            settings=Settings(anonymized_telemetry=False),
        )
        client.heartbeat()
        print(f"✅ ChromaDB heartbeat OK  ({CHROMA_HOST}:{CHROMA_PORT})")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

    # ── 2. Create test collection ────────────────────────────────────────────────
    separator("2. Create Collection")
    # Clean up any leftover test collection from a previous run
    try:
        client.delete_collection(TEST_COLLECTION)
    except Exception:
        pass

    col = client.create_collection(
        name=TEST_COLLECTION,
        metadata={"hnsw:space": "cosine"},
    )
    print(f"✅ Created collection: '{TEST_COLLECTION}'")

    # ── 3. Add documents with mock embeddings (dim=384 like all-MiniLM-L6-v2) ──
    separator("3. Add Documents")
    import random
    random.seed(42)
    dim = 384

    docs = [
        {"id": "p1", "text": "Red leather sneakers with white sole", "color": "Red"},
        {"id": "p2", "text": "Blue denim jacket slim fit",           "color": "Blue"},
        {"id": "p3", "text": "Black cotton kurta with embroidery",   "color": "Black"},
    ]
    col.add(
        ids        = [d["id"] for d in docs],
        documents  = [d["text"] for d in docs],
        embeddings = [[random.uniform(-1, 1) for _ in range(dim)] for _ in docs],
        metadatas  = [{"color": d["color"]} for d in docs],
    )
    print(f"✅ Added {len(docs)} documents with mock {dim}-dim embeddings")

    # ── 4. Query by similarity ───────────────────────────────────────────────────
    separator("4. Similarity Query")
    query_embedding = [random.uniform(-1, 1) for _ in range(dim)]
    results = col.query(
        query_embeddings=[query_embedding],
        n_results=2,
        include=["documents", "distances", "metadatas"],
    )
    print("✅ Top-2 nearest neighbours:")
    for i, (doc, dist) in enumerate(zip(results["documents"][0], results["distances"][0])):
        print(f"   [{i+1}] dist={dist:.4f}  → {doc}")

    # ── 5. Metadata filter ───────────────────────────────────────────────────────
    separator("5. Metadata Filter (color=Blue)")
    filtered = col.get(where={"color": "Blue"}, include=["documents"])
    print(f"✅ Found {len(filtered['documents'])} doc(s) with color=Blue:")
    for doc in filtered["documents"]:
        print(f"   → {doc}")

    # ── 6. Collection count & cleanup ────────────────────────────────────────────
    separator("6. Count & Cleanup")
    count = col.count()
    print(f"✅ Collection has {count} items")
    client.delete_collection(TEST_COLLECTION)
    print(f"✅ Test collection deleted")

    separator("Done")
    print("✅ All ChromaDB checks passed!\n")

if __name__ == "__main__":
    main()
