import { useState } from "react";
import { Trash2, UploadCloud, Loader2, Sparkles, X, FileStack, BookOpen } from "lucide-react";
import { cn } from "../lib/utils";

function formatSize(bytes) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadProgress({ upload }) {
  const indexing = upload.stage === "indexing";
  return (
    <div className="w-full text-left">
      <div className="mb-2 flex items-center gap-2">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-indigo-300" />
        <p className="truncate text-sm font-medium text-slate-200" title={upload.name}>
          {upload.name}
        </p>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            indexing ? "progress-shimmer w-full animate-shimmer" : "bg-linear-to-r from-indigo-500 to-fuchsia-500"
          )}
          style={indexing ? undefined : { width: `${upload.progress}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-400">
        <span>{indexing ? "Extracting & embedding pages…" : `Uploading… ${upload.progress}%`}</span>
        {upload.total > 1 && (
          <span>
            {upload.index}/{upload.total}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({ documents, onUpload, upload, onDelete, isDeleting, open, onClose }) {
  const [dragActive, setDragActive] = useState(false);
  const isUploading = !!upload;
  const totalPages = documents.reduce((sum, d) => sum + (d.pages || 0), 0);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (!isUploading && e.dataTransfer.files?.length) onUpload(e.dataTransfer.files);
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-80 max-w-[85vw] shrink-0 flex-col overflow-hidden bg-slate-950 text-slate-100 transition-transform duration-300 ease-out md:static md:max-w-none md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-72 w-72 animate-float rounded-full bg-indigo-600/25 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 animate-float-slow rounded-full bg-fuchsia-600/15 blur-3xl" />
        </div>

        {/* Brand */}
        <div className="relative flex items-center justify-between px-5 pb-4 pt-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold tracking-tight">PlaceMentor AI</h1>
              <p className="text-xs text-slate-400">Answers with page citations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Upload dropzone */}
        <div className="relative px-5">
          <label
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setDragActive(false);
            }}
            onDrop={handleDrop}
            className={cn(
              "group flex min-h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-5 text-center transition-all duration-200",
              isUploading
                ? "cursor-default border-indigo-500/40 bg-indigo-500/5"
                : dragActive
                  ? "scale-[1.02] cursor-copy border-indigo-400 bg-indigo-500/15"
                  : "cursor-pointer border-slate-700 hover:border-indigo-500/60 hover:bg-white/[0.03]"
            )}
          >
            {isUploading ? (
              <UploadProgress upload={upload} />
            ) : (
              <>
                <div
                  className={cn(
                    "grid h-11 w-11 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-110",
                    dragActive && "-translate-y-1 scale-110"
                  )}
                >
                  <UploadCloud className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-slate-200">
                  {dragActive ? (
                    "Drop to upload"
                  ) : (
                    <>
                      Drop PDFs or <span className="text-indigo-300 underline-offset-2 group-hover:underline">browse</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-slate-500">Multiple files supported</p>
              </>
            )}
            <input
              type="file"
              accept=".pdf,application/pdf"
              multiple
              className="hidden"
              disabled={isUploading}
              onChange={(e) => {
                if (e.target.files?.length) onUpload(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-2 gap-2 px-5 pt-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
              <FileStack className="h-3.5 w-3.5" /> Docs
            </div>
            <p className="mt-0.5 text-lg font-bold tabular-nums">{documents.length}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-500">
              <BookOpen className="h-3.5 w-3.5" /> Pages
            </div>
            <p className="mt-0.5 text-lg font-bold tabular-nums">{totalPages}</p>
          </div>
        </div>

        {/* Document list */}
        <div className="relative flex-1 overflow-y-auto px-5 pb-4 pt-5">
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Your library</h2>
          {documents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-800 px-4 py-8 text-center">
              <p className="text-sm text-slate-400">No documents yet</p>
              <p className="mt-1 text-xs text-slate-600">Uploaded PDFs will appear here.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {documents.map((doc, i) => {
                const deleting = isDeleting === doc.id;
                return (
                  <li
                    key={doc.id}
                    style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                    className={cn(
                      "group relative flex animate-fade-up items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-all duration-200 hover:border-indigo-500/30 hover:bg-white/[0.06]",
                      deleting && "opacity-50"
                    )}
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-linear-to-br from-rose-500/20 to-orange-500/20 text-[10px] font-extrabold tracking-wide text-rose-300 ring-1 ring-rose-500/20">
                      PDF
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-200" title={doc.filename}>
                        {doc.filename}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {doc.pages} pages · {doc.chunks} chunks
                        {formatSize(doc.size) && ` · ${formatSize(doc.size)}`}
                      </p>
                    </div>
                    <button
                      onClick={() => onDelete(doc.id)}
                      disabled={deleting}
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400 focus:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      title="Delete document"
                      aria-label={`Delete ${doc.filename}`}
                    >
                      {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="relative border-t border-white/5 px-5 py-3 text-[11px] text-slate-500">
          Powered by Groq · ChromaDB · LangChain
        </div>
      </aside>
    </>
  );
}
