import React from "react";
import { Volume2 } from "lucide-react";
import { useSpeech } from "../../hooks/useSpeech";
import { useProgress } from "../../context/ProgressContext";

const LANG_BCP47 = {
  de: "de-DE",
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  ar: "ar-SA",
  it: "it-IT"
};

export function AudioButton({ text, size = "md", className = "", label = "Listen" }) {
  const { activeTargetLanguage } = useProgress();
  const activeLang = activeTargetLanguage || "de";
  const targetBcp47 = LANG_BCP47[activeLang] || "de-DE";
  const { speak, isSpeaking } = useSpeech({ lang: targetBcp47 });

  const handleClick = (e) => {
    e.stopPropagation();
    speak(text);
  };

  const sizeClasses = {
    sm: "w-7 h-7 p-1 text-xs",
    md: "w-9 h-9 p-2 text-sm",
    lg: "w-11 h-11 p-2.5 text-base"
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={`Listen to "${text}"`}
      className={`inline-flex items-center justify-center rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/60 dark:hover:bg-amber-900 dark:text-amber-300 transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
        isSpeaking ? "animate-pulse ring-2 ring-amber-400" : ""
      } ${sizeClasses[size]} ${className}`}
      aria-label={label}
    >
      <Volume2 className={iconSizes[size]} />
    </button>
  );
}
