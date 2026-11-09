from fastapi import APIRouter, HTTPException
from fastapi.concurrency import run_in_threadpool
from app.models.schemas import ChatQuery, ChatResponse
from app.rag.generator import generate_answer

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(query: ChatQuery):
    if not query.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
        
    try:
        # Embedding and LLM calls are synchronous and can take several seconds.
        # Run them outside the event loop so health checks and other requests stay responsive.
        response = await run_in_threadpool(generate_answer, query.query)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to answer the question: {str(e)}"
        )
