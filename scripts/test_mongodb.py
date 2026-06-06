#!/usr/bin/env python3
"""
test_mongodb.py — Verify MongoDB is reachable and operational.
Run from project root: python scripts/test_mongodb.py
"""

import sys
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

# Load variables from .env file (so we can use ${MONGO_USER}, ${MONGO_PASS})
import os
from dotenv import load_dotenv
load_dotenv()

# Backend style: use env vars (with safe defaults if needed)
mongo_user = os.getenv("MONGO_USER", "admin")
mongo_pass = os.getenv("MONGO_PASS", "secret123")
mongo_host = os.getenv("MONGO_HOST", "localhost")
mongo_port = os.getenv("MONGO_PORT", "27017")

MONGO_URL = f"mongodb://{mongo_user}:{mongo_pass}@{mongo_host}:{mongo_port}/?authSource=admin"
DB_NAME   = "oneproductiq"
COL_NAME  = "products"

def separator(title: str):
    print(f"\n{'─' * 50}")
    print(f"  {title}")
    print('─' * 50)

def test_connection(client: MongoClient) -> bool:
    separator("1. Connection Ping")
    try:
        client.admin.command("ping")
        print("✅ MongoDB ping OK")
        return True
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print(f"❌ Connection failed: {e}")
        return False

def test_insert(col) -> str | None:
    separator("2. Insert Document")
    doc = {
        "sku": "TEST-001",
        "product_type": "Test Sneaker",
        "brand": "TestBrand",
        "price": 99.99,
        "primary_color": "Red",
        "pattern": "Solid",
        "_test": True,
    }
    result = col.insert_one(doc)
    print(f"✅ Inserted _id: {result.inserted_id}")
    return result.inserted_id

def test_read(col, inserted_id) -> bool:
    separator("3. Read Document")
    doc = col.find_one({"_id": inserted_id})
    if doc:
        print(f"✅ Retrieved: {doc['brand']} — {doc['product_type']} @ ${doc['price']}")
        return True
    print("❌ Document not found")
    return False

def test_count(col) -> None:
    separator("4. Collection Stats")
    total   = col.count_documents({})
    test_docs = col.count_documents({"_test": True})
    print(f"✅ Total documents : {total}")
    print(f"   Test documents  : {test_docs}")

def test_delete(col, inserted_id) -> None:
    separator("5. Cleanup Test Document")
    res = col.delete_one({"_id": inserted_id})
    print(f"✅ Deleted {res.deleted_count} test document(s)")

def main():
    print("\n🍃 OneProductIQ — MongoDB Test Suite")
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)

    if not test_connection(client):
        sys.exit(1)

    db  = client[DB_NAME]
    col = db[COL_NAME]

    inserted_id = test_insert(col)
    if inserted_id:
        test_read(col, inserted_id)
        test_count(col)
        test_delete(col, inserted_id)

    client.close()
    separator("Done")
    print("✅ All MongoDB checks passed!\n")

if __name__ == "__main__":
    main()
