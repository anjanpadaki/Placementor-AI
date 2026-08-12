from app.database.chroma import get_vector_store

def get_retriever(k: int = 4):
    vector_store = get_vector_store()
    return vector_store.as_retriever(search_kwargs={"k": k})
