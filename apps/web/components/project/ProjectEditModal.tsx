"use client";

import { useEffect, useState } from "react";
import { Pencil, Loader2, X } from "lucide-react";

interface ProjectEditModalProps {
  isOpen: boolean;
  project: {
    id: string;
    title?: string | null;
    description?: string | null;
  } | null;
  onClose: () => void;
  onSave: (title: string, description: string) => Promise<void>;
}

export default function ProjectEditModal({
  isOpen,
  project,
  onClose,
  onSave,
}: ProjectEditModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setDescription(project.description || "");
      setError(null);
    }
  }, [project, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSaving) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError("Project title cannot be empty");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave(cleanTitle, description.trim());
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to update project");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 relative"
      >
        {/* Close Button */}
        <button
          type="button"
          disabled={isSaving}
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 shrink-0">
            <Pencil className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Edit Project Details
            </h3>
            <p className="text-xs text-zinc-400">
              Update the title and description for this project.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Title Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="edit-project-title" className="text-xs font-semibold text-zinc-300">
                Title <span className="text-violet-400">*</span>
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">
                {title.length}/100
              </span>
            </div>
            <input
              id="edit-project-title"
              type="text"
              value={title}
              maxLength={100}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Modern Developer Portfolio"
              disabled={isSaving}
              autoFocus
              className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 transition-all disabled:opacity-50"
            />
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="edit-project-desc" className="text-xs font-semibold text-zinc-300">
                Description
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">
                {description.length}/500
              </span>
            </div>
            <textarea
              id="edit-project-desc"
              rows={3}
              value={description}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what this application does..."
              disabled={isSaving}
              className="w-full bg-zinc-900/80 border border-zinc-800/80 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/40 transition-all resize-none leading-relaxed disabled:opacity-50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold border border-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !title.trim()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-violet-950/50 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
