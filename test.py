import os
import sys
# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app.rag.embeddings import get_embeddings

try:
    print("Testing embeddings...")
    embeddings = get_embeddings()
    res = embeddings.embed_query("test query")
    print(f"Success! Dimension: {len(res)}")
except Exception as e:
    import traceback
    traceback.print_exc()
