import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "../lib/utils";

const STYLES = {
  success: {
    icon: CheckCircle2,
    tone: "text-emerald-500",
    bar: "bg-emerald-500",
  },
  error: {
    icon: AlertTriangle,
    tone: "text-rose-500",
    bar: "bg-rose-500",
  },
  info: {
    icon: Info,
    tone: "text-indigo-500",
    bar: "bg-indigo-500",
  },
};

export default function Toasts({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col items-end gap-2 sm:left-auto sm:right-4 sm:w-96"
    >
      {toasts.map((toast) => {
        const { icon: Icon, tone, bar } = STYLES[toast.type] ?? STYLES.info;
        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto relative flex w-full animate-toast-in items-start gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white/90 p-3.5 pl-4 text-sm shadow-xl shadow-slate-900/10 backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/90 dark:shadow-black/40"
          >
            <span className={cn("absolute inset-y-0 left-0 w-1", bar)} />
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", tone)} />
            <p className="flex-1 leading-snug text-slate-700 dark:text-slate-200">{toast.message}</p>
            <button
              onClick={() => onDismiss(toast.id)}
              className="rounded-md p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
