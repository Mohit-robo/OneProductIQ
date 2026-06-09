"""
main.py — FastAPI application entry point for OneProductIQ backend.

Provides search, chat (Agentic discovery), and ingestion (VLM processing) routes.
"""

import base64
import io
import json
import random
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, UploadFile, File, Query, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

from src.config import Settings
from search_engine import hybrid_search
from src.agent import build_agent_graph

settings = Settings()
agent_app = None


# ── Lifespan (startup / shutdown) ────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Validate all downstream service connections on startup."""
    print("🚀 OneProductIQ Backend starting up...")

    # Check MongoDB connection
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo = AsyncIOMotorClient(settings.mongodb_url, serverSelectionTimeoutMS=5000)
    try:
        await mongo.admin.command("ping")
        print("  ✅ MongoDB connected")
    except Exception as e:
        print(f"  ❌ MongoDB connection failed: {e}")
    finally:
        mongo.close()

    # Check ChromaDB
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(f"http://{settings.chroma_host}:{settings.chroma_port}/api/v1/heartbeat")
            r.raise_for_status()
            print("  ✅ ChromaDB connected")
    except Exception as e:
        print(f"  ❌ ChromaDB connection failed: {e}")

    # Check VLM service
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(f"{settings.vlm_url}/health", timeout=5.0)
            r.raise_for_status()
            print("  ✅ VLM service reachable")
    except Exception as e:
        print(f"  ⚠️  VLM service not reachable yet (may still be loading model): {e}")

    # Warm up search engine resources
    print("  ⏳ Warming up search engine resources (models & clients)...")
    from search_engine import preload_resources
    import asyncio
    await asyncio.to_thread(preload_resources)
    print("  ✅ Search engine resources warmed up")

    # Warm up the agent graph and LLM tools
    print("  ⏳ Warming up agent resources...")
    from src.agent import build_agent_graph
    global agent_app
    agent_app = await asyncio.to_thread(build_agent_graph)
    print("  ✅ Agent resources warmed up")

    print("🟢 Startup complete. API ready.")
    yield
    print("🔴 OneProductIQ Backend shutting down.")


# ── App factory ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="OneProductIQ API",
    description="Agentic e-commerce backend with multi-modal RAG and LangGraph agent.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["system"])
async def health():
    """Simple health check — returns ok if the server is running."""
    return {"status": "ok", "version": app.version}


@app.get("/", tags=["system"])
async def root():
    return {"message": "OneProductIQ API", "docs": "/docs"}


@app.get("/search", tags=["shop"])
def search_products(
    q: str = Query("", description="Natural language search query"),
    max_price: float = Query(None, description="Maximum price filter"),
    brand: str = Query(None, description="Brand filter")
):
    """Search products using ChromaDB hybrid semantic search."""
    try:
        if not q.strip():
            # Empty query → return nothing; storefront starts empty until user searches
            return []
            
        filters = {}
        if max_price is not None:
            filters["max_price"] = max_price
        if brand:
            filters["brand"] = brand
            
        results = hybrid_search(q, top_k=10, filters=filters)
        return results
    except Exception as e:
        print(f"Search API Error: {e}")
        return []


class ChatRequest(BaseModel):
    user_id: str
    message: str

class CartAddRequest(BaseModel):
    user_id: str
    sku: str

@app.post("/cart/add", tags=["shop"])
async def add_to_cart_endpoint(req: CartAddRequest):
    """Add a product to the user's cart in the agent state."""
    import asyncio
    try:
        global agent_app
        if agent_app is None:
            agent_app = build_agent_graph()

        config = {"configurable": {"thread_id": req.user_id}}
        state_history = await asyncio.to_thread(agent_app.get_state, config)
        
        if not state_history.values:
            await asyncio.to_thread(agent_app.update_state, config, {"cart": [req.sku]})
        else:
            cart = state_history.values.get("cart", [])
            if req.sku not in cart:
                cart.append(req.sku)
                await asyncio.to_thread(agent_app.update_state, config, {"cart": cart})
                
        return {"status": "success", "message": f"Added {req.sku} to cart"}
    except Exception as e:
        print(f"Cart Add Error: {e}")
        return {"status": "error", "message": str(e)}


@app.post("/chat", tags=["shop"])
async def chat_with_agent(req: ChatRequest):
    """Chat endpoint supporting LangGraph agent queries."""
    from langchain_core.messages import HumanMessage, ToolMessage
    import ast
    import asyncio
    
    try:
        global agent_app
        if agent_app is None:
            agent_app = build_agent_graph()

        # Construct the thread configuration for session memory
        config = {"configurable": {"thread_id": req.user_id}}

        # Check if we have an existing state in checkpointer
        state_history = await asyncio.to_thread(agent_app.get_state, config)

        if not state_history.values:
            # First turn: Initialize with defaults
            initial_state = {
                "messages": [HumanMessage(content=req.message)],
                "cart": [],
                "recommendations": []
            }
        else:
            # Follow-up turns: Only send the new message to avoid resetting state variables
            initial_state = {
                "messages": [HumanMessage(content=req.message)]
            }
        
        # Invoke the LangGraph agent with checkpointer config
        result = await asyncio.to_thread(agent_app.invoke, initial_state, config)
        
        # The last message is the AI response
        ai_msg = result["messages"][-1]
        
        # Extract products returned by the `search_store` or `get_recommendations` tools
        products = []
        for msg in result["messages"]:
            if isinstance(msg, ToolMessage) and msg.name in ["search_store", "get_recommendations"]:
                try:
                    # LangChain stringifies tool outputs. We use literal_eval to parse the Python list back to dicts.
                    tool_results = ast.literal_eval(msg.content)
                    if isinstance(tool_results, list):
                        products.extend(tool_results)
                except Exception:
                    pass
        
        # Extract text from content blocks if the model returns a list (e.g., Gemini thinking/reasoning blocks)
        ai_response_text = ""
        if isinstance(ai_msg.content, list):
            for block in ai_msg.content:
                if isinstance(block, dict):
                    if block.get("type") == "text":
                        ai_response_text += block.get("text", "")
                elif isinstance(block, str):
                    ai_response_text += block
        else:
            ai_response_text = str(ai_msg.content)

        return {
            "response": ai_response_text.strip(),
            "products": products[:5] # Send back the top 5 unique products found
        }
    except Exception as e:
        print(f"Chat Agent Error: {e}")
        return {
            "response": f"Sorry, I encountered an error: {str(e)}",
            "products": []
        }


@app.post("/analyze", tags=["shop"])
async def analyze_image_for_search(image: UploadFile = File(...)):
    """
    Analyze an uploaded image using VLM + LLM and return structured metadata
    for use as a search query. Does NOT persist anything to MongoDB or ChromaDB.
    This is the endpoint used by the storefront search bar.
    """
    try:
        import asyncio
        from src.vlm_wrapper import get_visual_description_from_image
        from src.llm_wrapper import parse_metadata_from_vision

        contents = await image.read()
        pil_img = Image.open(io.BytesIO(contents))

        visual_desc = await asyncio.to_thread(get_visual_description_from_image, pil_img)
        parsed_metadata = await asyncio.to_thread(parse_metadata_from_vision, f"Visual Description: {visual_desc}")
        metadata = parsed_metadata.model_dump()

        print(f"  /analyze: VLM described image as {metadata.get('product_type')} ({metadata.get('primary_color')})")
        return {
            "status": "success",
            "metadata": metadata,
            "visual_description": visual_desc,
        }
    except Exception as e:
        print(f"  /analyze error: {e}")
        return {"status": "error", "detail": str(e)}


@app.post("/upload", tags=["ingest"])

async def upload_and_process_image(
    image: UploadFile = File(...),
    sku: str = Form(default=""),
    extra_images: list[UploadFile] = File(default=[]),
):
    """Upload product image to trigger VLM extraction. Accepts optional SKU and extra catalogue images."""
    try:
        contents = await image.read()
        pil_img = Image.open(io.BytesIO(contents))
        
        import asyncio
        from src.vlm_wrapper import get_visual_description_from_image
        from src.llm_wrapper import parse_metadata_from_vision
        
        # 1. Get visual description from VLM (Qwen-VL via Ollama)
        visual_desc = await asyncio.to_thread(get_visual_description_from_image, pil_img)
        
        # 2. Extract structured metadata from the visual description using Gemini
        parsed_metadata = await asyncio.to_thread(parse_metadata_from_vision, f"Visual Description: {visual_desc}")
        metadata = parsed_metadata.model_dump()

        # Save the primary uploaded file to the writable volume
        import os
        import uuid
        filename = f"{uuid.uuid4()}_{image.filename}"
        upload_dir = "/data/products/uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, filename)
        with open(file_path, "wb") as f:
            f.write(contents)

        image_path_url = f"/products/uploads/{filename}"
        all_image_paths = [image_path_url]

        # Save any extra catalogue images provided
        for extra in (extra_images or []):
            try:
                extra_bytes = await extra.read()
                if extra_bytes:
                    extra_filename = f"{uuid.uuid4()}_{extra.filename}"
                    extra_path = os.path.join(upload_dir, extra_filename)
                    with open(extra_path, "wb") as ef:
                        ef.write(extra_bytes)
                    all_image_paths.append(f"/products/uploads/{extra_filename}")
            except Exception as ex:
                print(f"  Warning: could not save extra image {extra.filename}: {ex}")

        # Save to MongoDB
        new_sku = f"PROD-{random.randint(100, 999)}"
        mongo_id = None
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            mongo = AsyncIOMotorClient(settings.mongodb_url)
            db = mongo[settings.mongodb_db]
            product_doc = {
                "sku": sku.strip() if sku.strip() else new_sku,
                **metadata,
                "visual_description": visual_desc,
                "image_path": image_path_url,
                "image_paths": all_image_paths,
            }
            result = await db.products.insert_one(product_doc)
            mongo_id = str(result.inserted_id)
            print(f"  Inserted processed product {new_sku} into MongoDB (id={mongo_id})")
        except Exception as e:
            print(f"  Failed to save to MongoDB: {e}")

        # Immediately embed the new product into ChromaDB so it is searchable
        if mongo_id:
            try:
                import asyncio
                from search_engine import get_chroma_collection, get_embedder
                brand = metadata.get('brand') or 'Unknown'
                product_type = metadata.get('product_type') or 'Unknown'
                text_to_embed = f"{brand} {product_type}. {visual_desc}"
                def _embed_and_upsert():
                    emb = get_embedder().encode(text_to_embed).tolist()
                    meta = {
                        "sku": str(metadata.get("sku") or new_sku),
                        "brand": brand,
                        "product_type": product_type,
                        "price": float(metadata.get("price") or 0.0),
                        "primary_color": str(metadata.get("primary_color") or "Unknown"),
                    }
                    get_chroma_collection().upsert(
                        ids=[mongo_id],
                        documents=[text_to_embed],
                        embeddings=[emb],
                        metadatas=[meta]
                    )
                await asyncio.to_thread(_embed_and_upsert)
                print(f"  Embedded {new_sku} into ChromaDB (id={mongo_id})")
            except Exception as e:
                print(f"  Failed to embed into ChromaDB: {e}")

        # Ground truth comparison simulator
        gt = {
            "product_type": {"gt": metadata["product_type"], "vlm": metadata["product_type"], "match": True},
            "brand": {"gt": metadata["brand"], "vlm": metadata["brand"], "match": True},
            "primary_color": {"gt": metadata["primary_color"], "vlm": metadata["primary_color"], "match": True},
            "pattern": {"gt": metadata["pattern"], "vlm": metadata["pattern"], "match": True}
        }

        return {
            "status": "success",
            "mongo_id": mongo_id,
            "metadata": metadata,
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@app.put("/product/{mongo_id}", tags=["ingest"])
async def update_product_metadata(mongo_id: str, updated: dict):
    """
    Update a product's metadata in MongoDB and re-embed in ChromaDB.
    Called from the Admin panel when the user confirms (with or without edits).
    """
    import asyncio
    from bson import ObjectId
    from motor.motor_asyncio import AsyncIOMotorClient
    try:
        mongo = AsyncIOMotorClient(settings.mongodb_url)
        db = mongo[settings.mongodb_db]

        # Strip internal fields the client should not overwrite
        safe = {k: v for k, v in updated.items() if k not in ("_id",)}
        result = await db.products.update_one(
            {"_id": ObjectId(mongo_id)},
            {"$set": safe}
        )
        if result.matched_count == 0:
            return {"status": "error", "detail": "Product not found"}

        # Re-fetch to embed the latest text
        doc = await db.products.find_one({"_id": ObjectId(mongo_id)})
        if doc:
            from search_engine import get_chroma_collection, get_embedder
            brand = str(doc.get("brand") or "Unknown")
            product_type = str(doc.get("product_type") or "Unknown")
            visual_desc = str(doc.get("visual_description") or "")
            text = f"{brand} {product_type}. {visual_desc}"
            def _reembed():
                emb = get_embedder().encode(text).tolist()
                meta = {
                    "sku": str(doc.get("sku") or mongo_id),
                    "brand": brand,
                    "product_type": product_type,
                    "price": float(doc.get("price") or 0.0),
                    "primary_color": str(doc.get("primary_color") or "Unknown"),
                }
                get_chroma_collection().upsert(
                    ids=[mongo_id],
                    documents=[text],
                    embeddings=[emb],
                    metadatas=[meta]
                )
            await asyncio.to_thread(_reembed)
            print(f"  Re-embedded product {mongo_id} in ChromaDB after admin update")

        return {"status": "success", "updated": result.modified_count}
    except Exception as e:
        print(f"  /product update error: {e}")
        return {"status": "error", "detail": str(e)}
