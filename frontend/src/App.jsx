import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import Chat from "./components/Chat";

const API_URL = "http://localhost:8000/api";

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial documents
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API_URL}/documents`);
      setDocuments(res.data);
    } catch (err) {
      console.error("Failed to fetch documents", err);
      // Don't show error to user for initial load failure unless it's critical
    }
  };

  const handleUpload = async (file) => {
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDocuments((prev) => [...prev, res.data]);
      
      // Add a system message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Successfully indexed **${res.data.filename}** — ${res.data.pages} pages, ${res.data.chunks} chunks.`
        }
      ]);
    } catch (err) {
      console.error("Upload failed", err);
      setError(err.response?.data?.detail || "Failed to upload document");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    setIsDeleting(id);
    try {
      await axios.delete(`${API_URL}/documents/${id}`);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      setError("Failed to delete document");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSendMessage = async (query) => {
    const userMsg = { role: "user", content: query };
    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, { query });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.answer,
          sources: res.data.sources,
        },
      ]);
    } catch (err) {
      console.error("Chat failed", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error while trying to answer your question. Please try again.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <Sidebar
        documents={documents}
        onUpload={handleUpload}
        isUploading={isUploading}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
      
      <main className="flex-1 flex flex-col relative">
        {error && (
          <div className="absolute top-4 right-4 z-50 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-sm">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <Chat
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isChatLoading}
        />
      </main>
    </div>
  );
}
