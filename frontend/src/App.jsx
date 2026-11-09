import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import Chat from "./components/Chat";
import Toasts from "./components/Toasts";

const API_URL = "http://localhost:8000/api";

let nextId = 0;
const makeId = () => `${Date.now()}-${nextId++}`;

function getInitialTheme() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [messages, setMessages] = useState([]);
  // { name, progress, stage: "uploading" | "indexing", index, total } while a PDF uploads
  const [upload, setUpload] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // Storage can be unavailable (private mode); the theme still works for this visit.
    }
  }, [theme]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (type, message) => {
      const id = makeId();
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => dismissToast(id), 4500);
    },
    [dismissToast]
  );

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API_URL}/documents`);
      setDocuments(res.data);
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  const handleUpload = async (fileList) => {
    const all = Array.from(fileList);
    const files = all.filter((f) => f.name.toLowerCase().endsWith(".pdf"));
    if (files.length < all.length) {
      pushToast("error", "Only PDF files are supported. Non-PDF files were skipped.");
    }
    if (files.length === 0 || upload) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUpload({ name: file.name, progress: 0, stage: "uploading", index: i + 1, total: files.length });

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post(`${API_URL}/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            const progress = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
            // Once the bytes are sent, the server is extracting text and embedding chunks.
            setUpload((u) => u && { ...u, progress, stage: progress >= 100 ? "indexing" : "uploading" });
          },
        });
        setDocuments((prev) => [...prev, res.data]);
        pushToast("success", `Indexed ${res.data.filename} · ${res.data.pages} pages, ${res.data.chunks} chunks`);
      } catch (err) {
        console.error("Upload failed", err);
        pushToast("error", err.response?.data?.detail || `Failed to upload ${file.name}`);
      }
    }
    setUpload(null);
  };

  const handleDelete = async (id) => {
    const doc = documents.find((d) => d.id === id);
    setIsDeleting(id);
    try {
      await axios.delete(`${API_URL}/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      pushToast("info", `Removed ${doc?.filename ?? "document"}`);
    } catch (err) {
      console.error("Delete failed", err);
      pushToast("error", "Failed to delete document");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleSendMessage = async (query) => {
    setMessages((prev) => [...prev, { id: makeId(), role: "user", content: query, createdAt: Date.now() }]);
    setIsChatLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, { query }, { timeout: 30000 });
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content: res.data.answer,
          sources: res.data.sources,
          createdAt: Date.now(),
        },
      ]);
    } catch (err) {
      console.error("Chat failed", err);
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          isError: true,
          content: `Sorry, I couldn't answer that question. ${
            err.response?.data?.detail || "The request timed out. Please try again."
          }`,
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex h-dvh overflow-hidden font-sans">
      <Sidebar
        documents={documents}
        onUpload={handleUpload}
        upload={upload}
        onDelete={handleDelete}
        isDeleting={isDeleting}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="relative flex min-w-0 flex-1 flex-col">
        <Chat
          messages={messages}
          documents={documents}
          onSendMessage={handleSendMessage}
          onUpload={handleUpload}
          isUploading={!!upload}
          isLoading={isChatLoading}
          onClearChat={() => setMessages([])}
          onOpenSidebar={() => setSidebarOpen(true)}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        />
      </main>

      <Toasts toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
