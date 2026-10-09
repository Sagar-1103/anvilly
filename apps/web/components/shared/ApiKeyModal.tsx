"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Key,
  ShieldCheck,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Loader2,
  X,
  Lock,
  ChevronRight,
  Sparkles,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  PROVIDER_MODELS,
  PROVIDER_DISPLAY_INFO,
  type CredentialItem,
  useCredentials,
} from "@/contexts/credential-context";
import { toast } from "sonner";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROVIDER_OPTIONS = [
  {
    id: "openai",
    name: "OpenAI",
    defaultModel: "gpt-4o",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    placeholder: "sk-proj-... or sk-...",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    defaultModel: "deepseek-chat",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    placeholder: "sk-...",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    defaultModel: "deepseek/deepseek-chat",
    badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    placeholder: "sk-or-...",
  },
];

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const [mounted, setMounted] = useState(false);
  const { credentials, isLoading, addOrUpdateCredential, removeCredential } = useCredentials();
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<CredentialItem | null>(null);

  // Tabs: 'list' | 'add'
  const [activeTab, setActiveTab] = useState<"list" | "add">("list");

  // Form State
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelInput, setCustomModelInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [label, setLabel] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setKeyToDelete(null);
      if (credentials.length === 0) {
        setActiveTab("add");
      } else {
        setActiveTab("list");
      }
    }
  }, [isOpen, credentials.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (keyToDelete && !deletingId) {
          setKeyToDelete(null);
          return;
        }
        if (isOpen && !submitting && !deletingId) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, submitting, deletingId, keyToDelete, onClose]);

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    const presets = PROVIDER_MODELS[providerId] || [];
    const defaultMod = presets.find((m) => m.isDefault)?.id || presets[0]?.id || "";
    setSelectedModel(defaultMod);
    setIsCustomModel(false);
    setCustomModelInput("");
    setErrorMessage(null);
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setErrorMessage("Please enter an API key");
      return;
    }

    const effectiveModel = isCustomModel ? customModelInput.trim() : selectedModel.trim();
    if (isCustomModel && !effectiveModel) {
      setErrorMessage("Please specify a custom model name");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/user/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          apiKey: apiKey.trim(),
          label: label.trim() || undefined,
          model: effectiveModel || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to store key");
      } else {
        toast.success(`Encrypted and saved ${selectedProvider.toUpperCase()} key`);
        if (data.credential) {
          addOrUpdateCredential(data.credential);
        }
        setApiKey("");
        setLabel("");
        setIsCustomModel(false);
        setCustomModelInput("");
        setActiveTab("list");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error while saving");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!keyToDelete) return;
    const id = keyToDelete.id;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/user/credentials?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("API key deleted from vault");
        removeCredential(id);
        if (credentials.length <= 1) {
          setActiveTab("add");
        }
        setKeyToDelete(null);
      } else {
        toast.error(data.message || "Failed to delete key");
      }
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete key");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen || !mounted) return null;

  const currentProviderConfig =
    PROVIDER_OPTIONS.find((p) => p.id === selectedProvider) || PROVIDER_OPTIONS[0];

  const presets = PROVIDER_MODELS[selectedProvider] || [];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={() => {
        if (!submitting) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#09090b] border border-zinc-800/90 shadow-2xl shadow-black/90 animate-fade-in-up text-left overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-violet-500/40 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">API Key Vault</h2>
              <p className="text-[11px] text-zinc-400">Bring your own AI provider keys</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Segmented Control Tabs */}
        {credentials.length > 0 && (
          <div className="px-6 pt-4 pb-1">
            <div className="flex p-1 bg-zinc-900/80 rounded-xl border border-zinc-800/70">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("list");
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "list"
                    ? "bg-zinc-800 text-white shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span>Saved Keys</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-700/60 text-zinc-300 font-mono">
                  {credentials.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("add");
                  setErrorMessage(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "add"
                    ? "bg-zinc-800 text-white shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>Add Key</span>
              </button>
            </div>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* TAB 1: Stored Keys List */}
          {activeTab === "list" && (
            <div className="space-y-3">
              {isLoading && credentials.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-zinc-500 text-xs gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                  <span>Loading vault keys...</span>
                </div>
              ) : credentials.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200">No Keys Stored</h4>
                    <p className="text-[11px] text-zinc-500 max-w-xs mx-auto mt-1 leading-relaxed">
                      Add an API key from OpenAI, DeepSeek, or OpenRouter to build projects.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("add")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add First Key</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {credentials.map((cred) => {
                    const pConfig = PROVIDER_OPTIONS.find((p) => p.id === cred.provider);
                    const activeModelName = cred.model || pConfig?.defaultModel || "default";

                    return (
                      <div
                        key={cred.id}
                        className="group flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/70 hover:border-zinc-700/80 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-white">
                                {pConfig?.name || cred.provider}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {cred.keyPreview}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/70 px-1.5 py-0.5 rounded border border-zinc-700/50">
                                {activeModelName}
                              </span>
                              {cred.label && (
                                <span className="text-[10px] text-zinc-500 truncate max-w-[150px]">
                                  {cred.label}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] text-zinc-500">
                            {cred.lastUsedAt
                              ? `Used ${new Date(cred.lastUsedAt).toLocaleDateString()}`
                              : "Ready"}
                          </span>
                          <button
                            type="button"
                            onClick={() => setKeyToDelete(cred)}
                            disabled={deletingId !== null}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete API Key"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setActiveTab("add")}
                    className="w-full mt-2 py-2.5 px-3 rounded-xl border border-dashed border-zinc-800 hover:border-violet-500/50 hover:bg-violet-500/5 text-zinc-400 hover:text-violet-300 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Provider Key</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Add Key Form */}
          {activeTab === "add" && (
            <form onSubmit={handleSaveKey} className="space-y-4">
              {errorMessage && (
                <div className="px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed">
                  {errorMessage}
                </div>
              )}

              {/* Provider Selection (Minimal 4-item pill row) */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Select Provider
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PROVIDER_OPTIONS.map((opt) => {
                    const isSelected = selectedProvider === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleProviderChange(opt.id)}
                        className={`py-2 px-2.5 rounded-xl text-center border text-xs font-medium transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? "bg-zinc-800 border-violet-500 text-white shadow-xs"
                            : "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                        }`}
                      >
                        <span className="truncate">{opt.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Model Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-300">
                    Default Model for {currentProviderConfig?.name}
                  </label>
                  <span className="text-[10px] text-zinc-500">Pick or type custom</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {presets.map((m) => {
                    const isSelected = !isCustomModel && selectedModel === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setIsCustomModel(false);
                          setSelectedModel(m.id);
                        }}
                        className={`px-3 py-2 rounded-xl text-left text-xs transition-all border cursor-pointer flex items-center ${
                          isSelected
                            ? "bg-zinc-800 border-violet-500/60 text-white font-medium shadow-xs"
                            : "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                        }`}
                      >
                        <span className="font-mono text-[11px] truncate text-zinc-200">{m.id}</span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setIsCustomModel(true)}
                    className={`px-3 py-2 rounded-xl text-left text-xs transition-all border cursor-pointer flex items-center ${
                      isCustomModel
                        ? "bg-zinc-800 border-violet-500/60 text-white font-medium shadow-xs"
                        : "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                    }`}
                  >
                    <span className="text-[11px] font-medium text-violet-400">Custom Model</span>
                  </button>
                </div>

                {isCustomModel && (
                  <input
                    type="text"
                    value={customModelInput}
                    onChange={(e) => setCustomModelInput(e.target.value)}
                    placeholder="e.g. gpt-4-turbo or anthropic/claude-3-opus"
                    className="w-full px-3 py-2 rounded-xl bg-zinc-900/70 border border-violet-500/40 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 font-mono"
                    autoFocus
                  />
                )}
              </div>

              {/* API Key Input */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  {currentProviderConfig?.name} Secret API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={currentProviderConfig?.placeholder || "sk-..."}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-zinc-900/60 border border-zinc-800/90 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/80 focus:ring-1 focus:ring-violet-500/30 transition-all font-mono"
                    autoComplete="off"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    aria-label={showKey ? "Hide key" : "Show key"}
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Label (Optional) */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Key Label <span className="text-zinc-600 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Personal Account"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/90 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/80 transition-all"
                />
              </div>

              {/* Security Footnote */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/50 text-[11px] text-zinc-400">
                <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Keys are encrypted with <strong>AES-256-GCM</strong>. Plaintext keys are never sent
                  back to browsers, never written to sandboxes, and never logged.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                {credentials.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("list")}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold border border-zinc-800 transition-colors cursor-pointer"
                  >
                    Back to Keys
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting || !apiKey.trim()}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-violet-950/50 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Encrypting...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Save & Encrypt Key</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Delete Confirmation Modal Overlay */}
        {keyToDelete && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fade-in"
            onClick={() => {
              if (!deletingId) setKeyToDelete(null);
            }}
          >
            <div
              className="w-full max-w-sm rounded-2xl bg-[#121215] border border-zinc-800 p-5 shadow-2xl text-left space-y-4 animate-fade-in-up"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Delete API Key</h3>
                  <p className="text-xs text-zinc-400">This action cannot be undone</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Provider:</span>
                  <span className="font-semibold text-white capitalize">{keyToDelete.provider}</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-zinc-400 font-sans text-xs">Key:</span>
                  <span className="text-zinc-300">{keyToDelete.keyPreview}</span>
                </div>
                {keyToDelete.label && (
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Label:</span>
                    <span className="text-zinc-300 truncate max-w-[160px]">{keyToDelete.label}</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Are you sure you want to remove this key? Projects configured with this key will require an updated API key to generate code.
              </p>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setKeyToDelete(null)}
                  disabled={deletingId !== null}
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deletingId !== null}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {deletingId ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Key</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
