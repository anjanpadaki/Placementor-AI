import { useState } from "react";
import { FileText, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";

export default function SourceCard({ source, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border text-sm transition-all duration-200",
        expanded
          ? "border-indigo-200 bg-indigo-50/50 sm:col-span-2 dark:border-indigo-500/30 dark:bg-indigo-500/5"
          : "border-slate-200 bg-slate-50 hover:border-indigo-200 hover:bg-white dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-indigo-500/30"
      )}
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2.5 px-3 py-2 text-left"
        aria-expanded={expanded}
      >
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-indigo-500 text-[10px] font-bold text-white">
          {index + 1}
        </span>
        <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="min-w-0 flex-1 truncate font-medium text-slate-700 dark:text-slate-200" title={source.filename}>
          {source.filename}
        </span>
        <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-700">
          p. {source.page}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200", expanded && "rotate-180")}
        />
      </button>

      {/* Animate height with the grid-rows trick */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <p className="mx-3 mb-3 whitespace-pre-wrap rounded-lg border-l-2 border-indigo-400 bg-white px-3 py-2 text-xs leading-relaxed text-slate-600 dark:bg-slate-900 dark:text-slate-400">
            {source.content}
          </p>
        </div>
      </div>
    </div>
  );
}
