import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import Message from "./Message";

export default function Chat({ messages, onSendMessage, isLoading }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white h-full relative">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 flex items-center px-6 bg-white shrink-0 sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-slate-800">Chat with your Documents</h2>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-indigo-600 text-2xl font-bold">PDF</span>
            </div>
            <h3 className="text-xl font-medium text-slate-800 mb-2">
              Welcome to PDF RAG Assistant
            </h3>
            <p className="text-slate-500 max-w-md">
              Upload some PDFs from the sidebar and start asking questions. The AI will answer based strictly on your uploaded documents.
            </p>
          </div>
        ) : (
          <div className="pb-32">
            {messages.map((msg, idx) => (
              <Message key={idx} message={msg} />
            ))}
            {isLoading && (
              <div className="py-6 px-4 md:px-8 flex w-full bg-slate-50/50">
                <div className="max-w-3xl mx-auto flex gap-4 md:gap-6 w-full items-center text-slate-500">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <span className="text-sm font-medium animate-pulse">
                    Analyzing documents...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="relative bg-white border border-slate-300 shadow-sm rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-shadow"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Ask a question about your documents..."
              className="w-full max-h-32 py-4 pl-4 pr-12 bg-transparent border-0 focus:ring-0 resize-none outline-none text-slate-800 placeholder-slate-400"
              rows={1}
              style={{ minHeight: "60px" }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-3 bottom-3 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-slate-400">
              AI answers are generated based only on uploaded documents.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
