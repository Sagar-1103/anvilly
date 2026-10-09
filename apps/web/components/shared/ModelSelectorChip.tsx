"use client";

import { useState, useRef, useEffect } from "react";
import {
  useCredentials,
  PROVIDER_DISPLAY_INFO,
  PROVIDER_MODELS,
} from "@/contexts/credential-context";
import { Key, ChevronDown, Plus, Check, Edit2 } from "lucide-react";

interface ModelSelectorChipProps {
  size?: "sm" | "md";
}

export default function ModelSelectorChip({ size = "md" }: ModelSelectorChipProps) {
  const {
    credentials,
    activeCredential,
    activeModel,
    setActiveModel,
    hasModel,
    setSelectedCredentialId,
    openModal,
  } = useCredentials();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputVal, setCustomInputVal] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setShowCustomInput(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!hasModel || !activeCredential) {
    return (
      <button
        type="button"
        onClick={openModal}
        className={`inline-flex items-center gap-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 transition-all duration-200 cursor-pointer shadow-sm shadow-violet-500/10 font-medium ${
          size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
        }`}
        title="Add an API key to enable project generation"
      >
        <Key className="w-3.5 h-3.5 animate-pulse text-violet-400" />
        <span>Add API Key</span>
      </button>
    );
  }

  const activeInfo =
    PROVIDER_DISPLAY_INFO[activeCredential.provider] || {
      name: activeCredential.provider,
      defaultModel: "default",
      badgeClass: "bg-zinc-800 text-zinc-300 border-zinc-700",
    };

  const availablePresets = PROVIDER_MODELS[activeCredential.provider] || [];

  const handleApplyCustomModel = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    if (customInputVal.trim()) {
      setActiveModel(customInputVal.trim());
      setShowCustomInput(false);
      setDropdownOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setDropdownOpen((prev) => !prev);
          setShowCustomInput(false);
        }}
        className={`inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition-all duration-150 cursor-pointer ${
          size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-white">{activeInfo.name}</span>
          <span className="text-[10px] text-zinc-400 font-mono">({activeModel})</span>
        </div>
        <ChevronDown className="w-3 h-3 text-zinc-400" />
      </button>

      {dropdownOpen && (
        <div
          style={{ backgroundColor: "#121215" }}
          className="absolute left-0 bottom-full mb-2 w-80 rounded-2xl bg-[#121215] border border-zinc-800 shadow-2xl shadow-black p-2 z-50 animate-fade-in-up"
        >
          {/* Section: Select Model on Active Provider */}
          <div className="px-2 py-1 flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider shrink-0">
              {activeInfo.name} Models
            </span>
            <span
              className="text-[10px] font-mono text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20 max-w-[160px] truncate"
              title={activeModel}
            >
              {activeModel}
            </span>
          </div>

          <div className="space-y-0.5 mt-1">
            {availablePresets.map((preset) => {
              const isSelected = activeModel === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setActiveModel(preset.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-zinc-800 text-white font-medium"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  <span className="font-mono text-[11px] text-zinc-200 truncate">{preset.id}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-violet-400 shrink-0 ml-2" />}
                </button>
              );
            })}

            {/* Custom Model Toggle */}
            {showCustomInput ? (
              <div className="p-1 mt-1">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={customInputVal}
                    onChange={(e) => setCustomInputVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleApplyCustomModel(e);
                      }
                    }}
                    placeholder="Enter custom model"
                    className="w-full px-2 py-1 text-[11px] font-mono bg-zinc-900 border border-violet-500/40 rounded-lg text-white focus:outline-none placeholder-zinc-600"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomModel}
                    className="px-2 py-1 text-[11px] rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold cursor-pointer shrink-0 transition-colors"
                  >
                    Set
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowCustomInput(true);
                  setCustomInputVal(activeModel);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit2 className="w-3 h-3 text-zinc-500" />
                <span>Specify Custom Model...</span>
              </button>
            )}
          </div>

          {/* Section: Switch Stored Key/Provider */}
          {credentials.length > 1 && (
            <div className="mt-2 pt-2 border-t border-zinc-800/80">
              <div className="px-2 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Switch Saved Provider Key
              </div>
              <div className="space-y-0.5 mt-0.5 max-h-32 overflow-y-auto">
                {credentials.map((cred) => {
                  const info = PROVIDER_DISPLAY_INFO[cred.provider];
                  const isSelected = cred.id === activeCredential.id;
                  return (
                    <button
                      key={cred.id}
                      type="button"
                      onClick={() => {
                        setSelectedCredentialId(cred.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-zinc-800 text-white font-medium"
                          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{info?.name || cred.provider}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {cred.keyPreview}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Manage Vault Keys */}
          <div className="mt-2 pt-2 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                openModal();
              }}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] text-violet-400 hover:bg-violet-500/10 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manage / Add API Keys</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
