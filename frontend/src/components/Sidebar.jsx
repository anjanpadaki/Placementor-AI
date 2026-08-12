import { FileText, Trash2, UploadCloud, Loader2 } from "lucide-react";

export default function Sidebar({ documents, onUpload, isUploading, onDelete, isDeleting }) {
  return (
    <div className="w-80 h-full bg-slate-900 text-slate-100 flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FileText className="text-indigo-400" />
          PDF RAG Assistant
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Upload documents and ask questions.
        </p>
      </div>

      <div className="p-4 border-b border-slate-800">
        <label className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md cursor-pointer transition-colors">
          {isUploading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <UploadCloud className="w-5 h-5" />
          )}
          <span className="font-medium">
            {isUploading ? "Uploading..." : "Upload PDF"}
          </span>
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onUpload(e.target.files[0]);
              }
              // Reset input
              e.target.value = "";
            }}
            disabled={isUploading}
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Uploaded Documents
        </h2>
        {documents.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-8">
            No documents uploaded yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="bg-slate-800 rounded-lg p-3 group relative hover:bg-slate-750 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 truncate pr-6">
                    <FileText className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div className="truncate">
                      <p className="text-sm font-medium text-slate-200 truncate" title={doc.filename}>
                        {doc.filename}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {doc.pages} pages • {doc.chunks} chunks
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(doc.id)}
                    disabled={isDeleting === doc.id}
                    className="absolute right-3 top-3 text-slate-500 hover:text-red-400 transition-colors"
                    title="Delete document"
                  >
                    {isDeleting === doc.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
