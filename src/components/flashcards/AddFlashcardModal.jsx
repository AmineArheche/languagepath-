import React, { useState } from "react";
import { Plus, Sparkles, Check, AlertCircle } from "lucide-react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { playSound } from "../../utils/soundEffects";

export function AddFlashcardModal({ isOpen, onClose, onAddCard }) {
  const [formData, setFormData] = useState({
    german: "",
    article: "",
    english: "",
    plural: "",
    exampleDe: "",
    exampleEn: "",
    level: "A1",
    unit: "Custom Deck"
  });

  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.german.trim() || !formData.english.trim()) {
      setError("Please provide both the German word and English meaning.");
      return;
    }

    onAddCard({
      german: formData.german.trim(),
      article: formData.article ? formData.article : null,
      english: formData.english.trim(),
      plural: formData.plural.trim() || "-",
      exampleDe: formData.exampleDe.trim(),
      exampleEn: formData.exampleEn.trim(),
      level: formData.level,
      unit: formData.unit.trim() || "My Flashcards"
    });

    playSound.correct();

    // Reset form
    setFormData({
      german: "",
      article: "",
      english: "",
      plural: "",
      exampleDe: "",
      exampleEn: "",
      level: "A1",
      unit: "Custom Deck"
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Flashcard" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* German Word & Article */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Article & German Word *
          </label>

          {/* Article Pill Selector (Color coded!) */}
          <div className="flex gap-2 mb-2">
            {[
              { val: "", label: "None / Not a Noun", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
              { val: "der", label: "der (Masculine)", color: "bg-blue-600 text-white" },
              { val: "die", label: "die (Feminine)", color: "bg-rose-600 text-white" },
              { val: "das", label: "das (Neuter)", color: "bg-emerald-600 text-white" }
            ].map((art) => (
              <button
                key={art.val}
                type="button"
                onClick={() => handleChange("article", art.val)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all ${
                  formData.article === art.val
                    ? `${art.color} ring-2 ring-amber-400 ring-offset-1`
                    : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {art.val ? art.val : "No Article"}
              </button>
            ))}
          </div>

          <input
            type="text"
            required
            value={formData.german}
            onChange={(e) => handleChange("german", e.target.value)}
            placeholder="e.g. Apfel, Wohnung, Buch"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* English Meaning & Plural */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              English Meaning *
            </label>
            <input
              type="text"
              required
              value={formData.english}
              onChange={(e) => handleChange("english", e.target.value)}
              placeholder="e.g. apple, apartment"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Plural Form (optional)
            </label>
            <input
              type="text"
              value={formData.plural}
              onChange={(e) => handleChange("plural", e.target.value)}
              placeholder="e.g. die Äpfel"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Level & Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              CEFR Level
            </label>
            <select
              value={formData.level}
              onChange={(e) => handleChange("level", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="A1">A1 • Beginner</option>
              <option value="A2">A2 • Elementary</option>
              <option value="B1">B1 • Intermediate</option>
              <option value="B2">B2 • Upper Intermediate</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Unit / Topic Name
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => handleChange("unit", e.target.value)}
              placeholder="e.g. Food & Drinks"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Example Sentence with Translation */}
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Example Sentence (German)
            </label>
            <input
              type="text"
              value={formData.exampleDe}
              onChange={(e) => handleChange("exampleDe", e.target.value)}
              placeholder="e.g. Ich esse jeden Tag einen Apfel."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Example Translation (English)
            </label>
            <input
              type="text"
              value={formData.exampleEn}
              onChange={(e) => handleChange("exampleEn", e.target.value)}
              placeholder="e.g. I eat an apple every day."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={Plus}>
            Save Flashcard
          </Button>
        </div>
      </form>
    </Modal>
  );
}
