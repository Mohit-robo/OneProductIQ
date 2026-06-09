from typing import Optional, Dict, Any, List, Union
from langchain_core.tools import tool

import sys
import os
# Ensure we can import search_engine from the parent directory
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from search_engine import hybrid_search

@tool
def search_store(query: str, max_price: Optional[float] = None, brand: Optional[str] = None) -> Union[List[Dict[str, Any]], str]:
    """
    Search the store for products based on a natural language query.
    Optionally filter by a maximum price or a specific brand.
    Returns a list of product dictionaries containing SKU, brand, product_type, price, and visual description.
    """
    filters = {}
    if max_price is not None:
        filters["max_price"] = max_price
    if brand is not None:
        filters["brand"] = brand
        
    try:
        results = hybrid_search(query, top_k=5, filters=filters)
        
        # Clean up results for the LLM to read easily (remove heavy embeddings if any)
        cleaned = []
        for r in results:
            cleaned.append({
                "sku": r.get("sku"),
                "brand": r.get("brand"),
                "product_type": r.get("product_type"),
                "price": r.get("price"),
                "primary_color": r.get("primary_color"),
                "occasions": r.get("occasions", []),
                "visual_description": r.get("visual_description", "")[:200] # Truncate to save tokens
            })
        return cleaned
    except Exception as e:
        print(f"Tool Error (search_store): {e}")
        return f"Error executing search: {str(e)}"

@tool
def get_recommendations(user_style_preference: str) -> List[Dict[str, Any]]:
    """
    Get personalized product recommendations based on a user's style preference (e.g., 'minimalist', 'vibrant', 'streetwear').
    """
    # For MVP, this routes to semantic search under the hood, but gives the LLM a distinct action intent
    return search_store(f"products matching {user_style_preference} style")

@tool
def add_to_cart(sku: str) -> str:
    """
    Add a product to the user's shopping cart using its exact SKU (e.g., PROD-123).
    """
    # In a production app, we would update the MongoDB cart document here.
    # For now, returning a success message satisfies the agent logic.
    return f"Successfully added {sku} to the cart."

@tool
def get_inventory(sku: str) -> str:
    """
    Check if a specific product SKU is currently in stock.
    """
    # MVP simulation: all items are in stock
    return f"Yes, {sku} is currently in stock and available to ship."

def get_tools():
    return [search_store, get_recommendations, add_to_cart, get_inventory]
