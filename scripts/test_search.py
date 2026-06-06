import os
import sys
from pathlib import Path
from pprint import pprint

# Add backend to path so we can import search_engine
ROOT = Path(__file__).parent / '..' / 'app/'
sys.path.append(str(ROOT))

from search_engine import hybrid_search

def run_tests():
    print("\n" + "="*60)
    print("TEST 1: Pure Semantic Search")
    print("Query: 'a dark colored formal shirt'")
    print("="*60)
    
    results1 = hybrid_search("a dark colored formal shirt", top_k=2)
    
    for r in results1:
        print(f"[{r.get('search_score', 0):.4f}] {r.get('brand')} - {r.get('product_type')}")
        print(f"  Price: ${r.get('price')}")
        print(f"  Visual: {r.get('visual_description')[:100]}...")
        print(f"  Images: {len(r.get('image_paths', []))} found")
        print()
        
    print("\n" + "="*60)
    print("TEST 2: Hybrid Search (Semantic + Metadata Filter)")
    print("Query: 'a dark colored formal shirt'")
    print("Filter: {'max_price': 20.0} (Assuming user has a strict budget)")
    print("="*60)
    
    results2 = hybrid_search("a dark colored formal shirt", top_k=2, filters={"max_price": 20.0})
    
    if not results2:
        print("❌ No items found matching the semantic query that are ALSO under $20.")
    else:
        for r in results2:
            print(f"[{r.get('search_score', 0):.4f}] {r.get('brand')} - {r.get('product_type')}")
            print(f"  Price: ${r.get('price')}  <--- Filter successfully applied!")
            print(f"  Visual: {r.get('visual_description')[:100]}...")
            print()

if __name__ == "__main__":
    print('Running Search Test')
    run_tests()
