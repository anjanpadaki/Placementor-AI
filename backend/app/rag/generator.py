from functools import lru_cache

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from groq import APIConnectionError
from app.config import settings
from app.rag.retriever import get_retriever

@lru_cache(maxsize=1)
def get_llm():
    return ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model=settings.GROQ_CHAT_MODEL,
        temperature=0,
        timeout=15,
        max_retries=0,
    )

def format_docs(docs):
    return "\n\n".join(f"Source: {doc.metadata.get('filename')} (Page {doc.metadata.get('page')})\nContent: {doc.page_content}" for doc in docs)

def generate_answer(query: str):
    retriever = get_retriever()
    llm = get_llm()

    system_prompt = (
        "You are a helpful and precise assistant. Use the following pieces of retrieved context to answer the user's question. "
        "If the answer is not contained in the context, explicitly state that the information could not be found in the uploaded documents. "
        "Do not invent or hallucinate information. "
        "Answer concisely but provide enough detail to be useful.\n\n"
        "Formatting rules (your answer is rendered as GitHub-flavored Markdown):\n"
        "- Start with a one or two sentence direct answer, with no heading above it.\n"
        "- For longer answers, organise the rest under short `###` headings.\n"
        "- Use bullet points for lists of facts, steps or features; keep each bullet to one or two lines.\n"
        "- Use **bold** for key terms, names and numbers, sparingly.\n"
        "- Use a table only to compare items across the same attributes; keep cells short "
        "(a few words or one sentence), and never put lists or multiple paragraphs inside a cell.\n"
        "- Never output HTML tags such as <br>; use separate bullets or rows instead.\n"
        "- Write mathematical formulas in LaTeX: $...$ inline and $$...$$ on its own line for display equations.\n"
        "- When the question is simple, answer in a short paragraph without headings.\n"
        "- Optionally end with a brief **Summary** line for long answers.\n\n"
        "Context:\n{context}"
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{question}")
    ])
    
    # Retrieve documents first to return them as sources
    docs = retriever.invoke(query)

    if not docs:
        return {
            "answer": "I could not find any information relevant to your question in the uploaded documents.",
            "sources": []
        }
    
    # Generate the answer using LangChain
    chain = (
        prompt
        | llm
        | StrOutputParser()
    )
    
    try:
        answer = chain.invoke({
            "context": format_docs(docs),
            "question": query
        })
    except APIConnectionError as error:
        raise RuntimeError(
            "Cannot reach Groq to generate an answer. Check your internet, "
            "firewall, VPN, or proxy settings, then try again."
        ) from error

    sources = []
    for doc in docs:
        sources.append({
            "filename": doc.metadata.get("filename", "Unknown"),
            "page": doc.metadata.get("page", 0),
            "content": doc.page_content[:200] + "..." # return a snippet
        })
        
    # Deduplicate sources based on filename and page
    unique_sources = []
    seen = set()
    for s in sources:
        identifier = f"{s['filename']}_{s['page']}"
        if identifier not in seen:
            seen.add(identifier)
            unique_sources.append(s)
            
    return {
        "answer": answer,
        "sources": unique_sources
    }
