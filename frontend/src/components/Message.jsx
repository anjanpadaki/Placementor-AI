import ReactMarkdown from "react-markdown";
import { User, Bot } from "lucide-react";
import { cn } from "../lib/utils";
import SourceCard from "./SourceCard";

export default function Message({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "py-6 px-4 md:px-8 flex w-full",
        isUser ? "bg-white" : "bg-slate-50/50"
      )}
    >
      <div className="max-w-3xl mx-auto flex gap-4 md:gap-6 w-full">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
            isUser ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"
          )}
        >
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="prose prose-slate max-w-none text-slate-700">
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            )}
          </div>
          
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-6 border-t border-slate-200 pt-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Sources
              </h4>
              <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
                {message.sources.map((source, index) => (
                  <SourceCard key={index} source={source} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
