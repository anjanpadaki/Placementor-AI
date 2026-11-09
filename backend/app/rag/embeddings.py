from functools import lru_cache

from langchain_huggingface import HuggingFaceEmbeddings
from app.config import settings


@lru_cache(maxsize=1)
def get_embeddings():
    """Load the embedding model once and reuse it for uploads and chats."""
    return HuggingFaceEmbeddings(
        model_name=settings.HF_EMBEDDING_MODEL,
        # The model is installed locally. Avoid Hugging Face network checks on
        # every startup, which otherwise retry for minutes on restricted networks.
        model_kwargs={"device": "cpu", "local_files_only": True},
        # Batch vectors efficiently on CPU instead of processing one chunk at a time.
        encode_kwargs={"normalize_embeddings": True, "batch_size": 64},
    )
