# PDF RAG Assistant

A complete full-stack application that allows users to upload multiple PDFs and ask questions about their contents, with source citations for every answer.

## Architecture

This project uses a Retrieval-Augmented Generation (RAG) architecture:
- **Backend:** FastAPI, Python, LangChain, PyMuPDF, ChromaDB, OpenAI
- **Frontend:** React, Vite, Tailwind CSS, Lucide React

```mermaid
graph TD
    A[PDF Upload] -->|PyMuPDF| B(Text Chunks)
    B -->|OpenAI Embeddings| C[(ChromaDB)]
    
    D[User Question] -->|OpenAI Embeddings| E(Retriever)
    C <--> E
    E -->|Relevant Context| F[OpenAI LLM]
    F --> G[Answer + Sources]
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.9+
- OpenAI API Key

### Backend Setup
1. Open a terminal and navigate to the `backend` folder.
2. (Optional but recommended) Create a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and add your OpenAI API Key:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to include your `OPENAI_API_KEY`.
5. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend will be available at `http://localhost:8000`.

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

## How it works

1. **Ingestion**: When you upload a PDF, `PyMuPDF` extracts the text. The text is split into chunks of ~1000 characters using LangChain's `RecursiveCharacterTextSplitter`.
2. **Embeddings**: Chunks are converted into vectors using OpenAI's `text-embedding-3-small` model and stored in ChromaDB along with metadata (filename, page number).
3. **Retrieval**: When a question is asked, the query is embedded and we perform a similarity search against ChromaDB to find the most relevant chunks.
4. **Generation**: The retrieved chunks are passed as context to an OpenAI Chat Model (`gpt-4o-mini`). The system prompt instructs the model to answer only using the provided context, preventing hallucinations. The citations are constructed using the metadata from the retrieved chunks.

## Project Structure
- `backend/app/api`: FastAPI routes for upload, chat, and document management.
- `backend/app/rag`: LangChain components for ingestion, embeddings, retriever, and generation.
- `backend/app/database`: ChromaDB configuration.
- `backend/data`: Persisted vector data and uploaded PDFs (ignored by git).
- `frontend/src/components`: React components for the UI.
