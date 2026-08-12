import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

export default function SourceCard({ source }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden mt-2 text-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-slate-100 transition-colors text-left"
      >
        <div className="flex items-center gap-2 truncate pr-4">
          <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span className="font-medium text-slate-700 truncate">
            {source.filename}
          </span>
          <span className="text-slate-400 text-xs flex-shrink-0">
            Page {source.page}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>
      
      <div
        className={cn(
          "px-3 pb-3 text-slate-600 text-xs leading-relaxed",
          !expanded && "hidden"
        )}
      >
        <div className="pt-2 border-t border-slate-100">
          <p className="whitespace-pre-wrap font-mono bg-slate-100 p-2 rounded text-[11px] overflow-x-auto">
            {source.content}
          </p>
        </div>
      </div>
    </div>
  );
}
