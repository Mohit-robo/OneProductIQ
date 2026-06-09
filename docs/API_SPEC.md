# API Specification

This document details the main endpoints exposed by the OneProductIQ FastAPI backend.

---

## 1. Chat with Agent

Handles stateful conversational e-commerce queries using the LangGraph ReAct agent.

- **URL**: `/chat`
- **Method**: `POST`
- **Content-Type**: `application/json`

### Request Body
```json
{
  "user_id": "string (thread session identifier)",
  "message": "string (user search query or message)"
}
```

### Response Body (200 OK)
```json
{
  "response": "string (the natural language assistant response)",
  "products": [
    {
      "sku": "string",
      "brand": "string",
      "product_type": "string",
      "price": 0.0,
      "primary_color": "string",
      "occasions": ["string"],
      "visual_description": "string",
      "image_path": "string (optional)"
    }
  ]
}
```

---

## 2. Direct Hybrid RAG Search

Performs a vector search query against ChromaDB, optionally filtering by metadata attributes.

- **URL**: `/search`
- **Method**: `GET`

### Query Parameters
- `q` (string, required): The search query text (e.g. `dark blue casual shirts`).
- `limit` (integer, optional, default: 5): Maximum number of results to return.

### Response Body (200 OK)
```json
[
  {
    "sku": "string",
    "brand": "string",
    "product_type": "string",
    "price": 0.0,
    "primary_color": "string",
    "occasions": ["string"],
    "visual_description": "string",
    "search_score": 0.0
  }
]
```

---

## 3. Product Ingestion / Image Upload

Uploads a new product image, triggers VLM visual metadata extraction, and inserts records into both MongoDB and ChromaDB.

- **URL**: `/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`

### Form Data
- `file` (binary, required): The image file of the product to ingest.

### Response Body (200 OK)
```json
{
  "message": "Successfully ingested product",
  "product_id": "string (MongoDB Object ID)",
  "metadata": {
    "sku": "string",
    "brand": "string",
    "product_type": "string",
    "price": 0.0,
    "primary_color": "string",
    "visual_description": "string"
  }
}
```
