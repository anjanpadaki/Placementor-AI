import { useState, useRef, useEffect, useLayoutEffect } from "react";
import {
  ArrowUp,
  ArrowDown,
  Loader2,
  Menu,
  Moon,
  Sun,
  SquarePen,
  Sparkles,
  ListChecks,
  Lightbulb,
  FlaskConical,
  BookMarked,
  UploadCloud,
  MessageSquareText,
  Quote,
} from "lucide-react";
import Message from "./Message";
import { cn } from "../lib/utils";

const SUGGESTIONS = [
  { icon: ListChecks, title: "Summarize", prompt: "Summarize the key points of my documents" },
  { icon: Lightbulb, title: "Key findings", prompt: "What are the main findings or conclusions?" },
  { icon: FlaskConical, title: "Methodology", prompt: "Explain the methodology in simple terms" },
  { icon: BookMarked, title: "Definitions", prompt: "List the important terms and their definitions" },
];

const LOADING_STEPS = ["Searching your documents…", "Reading the relevant pages…", "Writing an answer…"];

function TypingIndicator() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex animate-fade-up gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-linear-to-br from-indigo-500 to-fuchsia-500 text-white shadow-md shadow-indigo-500/25">
        <Sparkles className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-3 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex gap-1">
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-indigo-500" />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-violet-500" />
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
        </div>
        <span key={step} className="animate-fade-in text-sm text-slate-500 dark:text-slate-400">
          {LOADING_STEPS[step]}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ hasDocuments, onSuggestion, onPickFile, isUploading }) {
  return (
    <div className="relative flex min-h-full flex-col items-center justify-center overflow-hidden px-4 pb-40 pt-12">
      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-[70%] -translate-y-1/2 animate-float rounded-full bg-indigo-400/25 blur-3xl dark:bg-indigo-600/20" />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-[10%] -translate-y-1/3 animate-float-slow rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-600/15" />
      </div>

      <div className="relative w-full max-w-2xl text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 animate-fade-up place-items-center rounded-2xl bg-linear-to-br from-indigo-500 to-fuchsia-500 shadow-xl shadow-indigo-500/30">
          <MessageSquareText className="h-8 w-8 text-white" />
        </div>
        <h2
          className="animate-fade-up text-3xl font-extrabold tracking-tight sm:text-4xl"
          style={{ animationDelay: "60ms" }}
        >
          {hasDocuments ? (
            <>
              What would you like to <span className="bg-linear-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">know</span>?
            </>
          ) : (
            <>
              Chat with your <span className="bg-linear-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">PDFs</span>
            </>
          )}
        </h2>
        <p
          className="mx-auto mt-3 max-w-md animate-fade-up text-slate-500 dark:text-slate-400"
          style={{ animationDelay: "120ms" }}
        >
          {hasDocuments
            ? "Ask anything about your uploaded documents. Every answer cites the pages it came from."
            : "Upload a PDF and ask questions in plain English. Answers come straight from your documents, with page citations."}
        </p>

        {hasDocuments ? (
          <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
            {SUGGESTIONS.map(({ icon: Icon, title, prompt }, i) => (
              <button
                key={title}
                onClick={() => onSuggestion(prompt)}
                style={{ animationDelay: `${180 + i * 60}ms` }}
                className="group flex animate-fade-up items-start gap-3 rounded-2xl border text-left border-slate-200 bg-white/70 p-4 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-indigo-500/50"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-500 group-hover:text-white dark:bg-indigo-500/10 dark:text-indigo-300">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{prompt}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-8 animate-fade-up" style={{ animationDelay: "180ms" }}>
            <button
              onClick={onPickFile}
              disabled={isUploading}
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-fuchsia-500 px-5 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/40 disabled:opacity-60"
            >
              {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
              {isUploading ? "Uploading…" : "Upload your first PDF"}
            </button>
            <p className="mt-3 text-xs text-slate-400">or drag and drop a file anywhere</p>

            <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-3">
              {[
                { icon: UploadCloud, label: "Upload" },
                { icon: MessageSquareText, label: "Ask" },
                { icon: Quote, label: "Get cited answers" },
              ].map(({ icon: Icon, label }, i) => (
                <div
                  key={label}
                  className="flex animate-fade-up flex-col items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400"
                  style={{ animationDelay: `${260 + i * 80}ms` }}
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <Icon className="h-4 w-4 text-indigo-500" />
                  </div>
                  <span>
                    {i + 1}. {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Chat({
  messages,
  documents,
  onSendMessage,
  onUpload,
  isUploading,
  isLoading,
  onClearChat,
  onOpenSidebar,
  theme,
  onToggleTheme,
}) {
  const [input, setInput] = useState("");
  const [atBottom, setAtBottom] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const dragDepth = useRef(0);

  const hasDocuments = documents.length > 0;

  const scrollToBottom = (behavior = "smooth") => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-grow the textarea up to a max height.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [input]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  };

  const send = (text) => {
    const query = text.trim();
    if (!query || isLoading) return;
    onSendMessage(query);
    setInput("");
    textareaRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  // Drag a PDF anywhere over the chat to upload it.
  const dragHandlers = {
    onDragEnter: (e) => {
      if (!e.dataTransfer.types.includes("Files")) return;
      e.preventDefault();
      dragDepth.current += 1;
      setDragActive(true);
    },
    onDragOver: (e) => {
      if (e.dataTransfer.types.includes("Files")) e.preventDefault();
    },
    onDragLeave: () => {
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragActive(false);
    },
    onDrop: (e) => {
      e.preventDefault();
      dragDepth.current = 0;
      setDragActive(false);
      if (!isUploading && e.dataTransfer.files?.length) onUpload(e.dataTransfer.files);
    },
  };

  return (
    <div className="relative flex h-full flex-col bg-slate-50 dark:bg-slate-950" {...dragHandlers}>
      {/* Header */}
      <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200/80 bg-white/70 px-4 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70 sm:px-6">
        <button
          onClick={onOpenSidebar}
          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100 md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[15px] font-semibold text-slate-800 dark:text-slate-100">
            Chat with your documents
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="relative flex h-2 w-2">
              {hasDocuments && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              )}
              <span
                className={cn(
                  "relative inline-flex h-2 w-2 rounded-full",
                  hasDocuments ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                )}
              />
            </span>
            {hasDocuments
              ? `${documents.length} document${documents.length === 1 ? "" : "s"} ready`
              : "No documents uploaded"}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              title="Start a new chat"
            >
              <SquarePen className="h-4 w-4" />
              <span className="hidden sm:inline">New chat</span>
            </button>
          )}
          <button
            onClick={onToggleTheme}
            className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-lg text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            <Sun
              className={cn(
                "absolute h-[18px] w-[18px] transition-all duration-300",
                theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
              )}
            />
            <Moon
              className={cn(
                "absolute h-[18px] w-[18px] transition-all duration-300",
                theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
              )}
            />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState
            hasDocuments={hasDocuments}
            onSuggestion={send}
            onPickFile={() => fileInputRef.current?.click()}
            isUploading={isUploading}
          />
        ) : (
          <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pb-44 pt-6 sm:px-6">
            {messages.map((msg) => (
              <Message key={msg.id} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
          </div>
        )}
      </div>

      {/* Jump to latest */}
      {!atBottom && messages.length > 0 && (
        <button
          onClick={() => scrollToBottom()}
          className="absolute bottom-36 left-1/2 z-10 grid h-9 w-9 -translate-x-1/2 animate-fade-up place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg transition hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          aria-label="Scroll to latest message"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      )}

      {/* Composer */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-slate-50 via-slate-50/95 to-transparent px-4 pb-4 pt-10 dark:from-slate-950 dark:via-slate-950/95 sm:px-6">
        <div className="pointer-events-auto mx-auto max-w-3xl">
          <form
            onSubmit={handleSubmit}
            className="group rounded-2xl bg-slate-200 p-[1.5px] shadow-lg shadow-slate-900/5 transition-all duration-300 focus-within:bg-linear-to-r focus-within:from-indigo-500 focus-within:via-violet-500 focus-within:to-fuchsia-500 focus-within:shadow-indigo-500/20 dark:bg-slate-800 dark:shadow-black/30"
          >
            <div className="flex items-end gap-2 rounded-[15px] bg-white p-2 pl-4 dark:bg-slate-900">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder={hasDocuments ? "Ask a question about your documents…" : "Upload a PDF to get started…"}
                rows={1}
                className="max-h-[200px] flex-1 resize-none bg-transparent py-2.5 text-[15px] leading-6 text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-linear-to-br from-indigo-500 to-fuchsia-500 text-white shadow-md shadow-indigo-500/30 transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 disabled:scale-100 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none dark:disabled:from-slate-700 dark:disabled:to-slate-700"
                aria-label="Send message"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </form>
          <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
            <kbd className="font-sans font-semibold">Enter</kbd> to send ·{" "}
            <kbd className="font-sans font-semibold">Shift + Enter</kbd> for a new line · Answers are based only on your
            documents
          </p>
        </div>
      </div>

      {/* Drag-and-drop overlay */}
      {dragActive && (
        <div className="pointer-events-none absolute inset-0 z-30 grid animate-fade-in place-items-center bg-indigo-500/10 p-6 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-indigo-400 bg-white/90 px-10 py-8 shadow-2xl dark:bg-slate-900/90">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-indigo-500 to-fuchsia-500 text-white">
              <UploadCloud className="h-7 w-7" />
            </div>
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">Drop PDFs to upload</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">They'll be indexed and ready to query</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onUpload(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
