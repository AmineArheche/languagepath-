import React, { useState } from "react";
import { Key, ExternalLink, Check, Shield } from "lucide-react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";

export function ApiKeyModal({ isOpen, onClose, currentKey, onSaveKey }) {
  const [keyInput, setKeyInput] = useState(currentKey || "");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    onSaveKey(keyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Tutor API Configuration" maxWidth="max-w-md">
      <form onSubmit={handleSave} className="space-y-4">
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-1.5 font-bold">
            <Shield className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Secure Client-Side Storage</span>
          </div>
          <p>
            Your API key is stored privately in your browser's local storage (Bring Your Own Key model) and sent directly to Google Gemini via HTTPS. Never embed API keys into build environment files for deployed web apps, as Vite inlines <code className="font-mono bg-white dark:bg-slate-900 px-1 py-0.5 rounded font-bold">VITE_*</code> variables into client bundles.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Gemini API Key
          </label>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline font-semibold"
          >
            <span>Get free API key from Google AI Studio</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={Key}>
            {savedSuccess ? "Saved!" : "Save API Key"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
