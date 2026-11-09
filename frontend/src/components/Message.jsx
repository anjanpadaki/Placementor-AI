import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Sparkles, Copy, Check, AlertTriangle, BookOpen } from "lucide-react";
import { cn } from "../lib/utils";
import SourceCard from "./SourceCard";

// remark-math only understands $...$ and $$...$$, but LLMs often emit \( \) and \[ \].
function normalizeMath(text) {
  return (
    text
      // Display math on its own lines. Keep the original indentation on both fences so
      // equations nested in list items stay inside the list (a closing $$ indented 4+
      // spaces more than its opener is not recognised and swallows the rest of the answer).
      .replace(/^([ \t]*)\\\[([\s\S]+?)\\\][ \t]*$/gm, (_, indent, math) => {
        const body = math
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .join(" ");
        return `${indent}$$\n${indent}${body}\n${indent}$$`;
      })
      // Any remaining \[ \] sits mid-sentence: render it inline.
      .replace(/\\\[([\s\S]+?)\\\]/g, (_, math) => `$${math.trim()}$`)
      .replace(/\\\(([\s\S]+?)\\\)/g, (_, math) => `$${math}$`)
  );
}

function formatTime(ts) {
  return ts ? new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
}

const markdownComponents = {
  // Let wide tables scroll horizontally instead of overflowing the chat.
  table: ({ node: _node, ...props }) => (
    <div className="overflow-x-auto">
      <table {...props} />
    </div>
  ),
  a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (e.g. insecure context); fail silently.
    }
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      aria-label="Copy answer"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function Message({ message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex animate-fade-up justify-end">
        <div className="max-w-[85%] sm:max-w-[75%]">
          <div className="rounded-2xl rounded-br-md bg-linear-to-br from-indigo-500 to-violet-600 px-4 py-3 text-[15px] leading-relaxed text-white shadow-md shadow-indigo-500/20">
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <p className="mt-1 pr-1 text-right text-[11px] text-slate-400">{formatTime(message.createdAt)}</p>
        </div>
      </div>
    );
  }

  const sources = message.sources ?? [];

  return (
    <div className="group flex animate-fade-up gap-3">
      <div
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-xl text-white shadow-md",
          message.isError
            ? "bg-rose-500 shadow-rose-500/25"
            : "bg-linear-to-br from-indigo-500 to-fuchsia-500 shadow-indigo-500/25"
        )}
      >
        {message.isError ? <AlertTriangle className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "rounded-2xl rounded-tl-md border px-4 py-3 shadow-sm sm:px-5 sm:py-4",
            message.isError
              ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200"
              : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          )}
        >
          {message.isError ? (
            <p className="text-[15px] leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose prose-slate max-w-none text-[15px] text-slate-700 dark:prose-invert dark:text-slate-300 prose-headings:font-semibold prose-headings:text-slate-900 dark:prose-headings:text-white prose-h3:mt-5 prose-h3:text-base prose-p:leading-relaxed prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-strong:text-slate-900 dark:prose-strong:text-white prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:font-medium prose-code:before:content-none prose-code:after:content-none dark:prose-code:bg-slate-800 prose-table:text-sm prose-th:bg-slate-100 prose-th:px-3 prose-th:py-2 dark:prose-th:bg-slate-800 prose-td:px-3 prose-td:py-2 prose-td:align-top [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={markdownComponents}
              >
                {normalizeMath(message.content)}
              </ReactMarkdown>
            </div>
          )}

          {sources.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <BookOpen className="h-3.5 w-3.5" />
                {sources.length} source{sources.length === 1 ? "" : "s"}
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {sources.map((source, index) => (
                  <SourceCard key={`${source.filename}-${source.page}-${index}`} source={source} index={index} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-1 flex items-center gap-1 pl-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          <span className="mr-1 text-[11px] text-slate-400">{formatTime(message.createdAt)}</span>
          {!message.isError && <CopyButton text={message.content} />}
        </div>
      </div>
    </div>
  );
}
