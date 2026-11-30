import React, { useState } from "react";
import { Languages, HelpCircle, Volume2, User, Bot, Check } from "lucide-react";
import { AudioButton } from "../common/AudioButton";
import { CorrectionBox } from "./CorrectionBox";

export function ChatMessage({ message, tutorCharacter = "AI Tutor" }) {
  const [showTranslation, setShowTranslation] = useState(false);
  const isTutor = message.sender === "tutor";

  if (isTutor) {
    return (
      <div className="flex items-start gap-3 my-4 animate-in fade-in duration-200">
        {/* Tutor Avatar */}
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 font-black text-xs">
          🇩🇪
        </div>

        <div className="flex-1 max-w-xl">
          {/* Sender label & character */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {tutorCharacter}
            </span>
            <span className="text-[10px] font-semibold text-slate-400">
              German Tutor
            </span>
          </div>

          {/* Speech Bubble */}
          <div className="p-4 rounded-3xl rounded-tl-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-slate-900 dark:text-slate-100">
            <div className="flex items-start justify-between gap-3">
              <p className="text-base font-medium leading-relaxed">
                {message.text}
              </p>
              <div className="shrink-0 pt-0.5">
                <AudioButton text={message.text} size="sm" />
              </div>
            </div>

            {/* "I don't understand" translation toggle */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowTranslation((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showTranslation ? "Hide English" : "I don't understand (Translate)"}</span>
              </button>
            </div>

            {/* Revealed translation */}
            {showTranslation && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 animate-in fade-in duration-150">
                <span className="font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                  English Translation:
                </span>
                <p className="italic font-medium">"{message.translation || "Translation unavailable"}"</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // User Message
  return (
    <div className="flex flex-col items-end my-4 animate-in fade-in duration-200">
      <div className="max-w-xl w-full flex justify-end gap-3">
        <div className="max-w-lg w-full">
          <div className="text-right text-[11px] font-bold text-slate-400 mb-1">
            You
          </div>

          {/* User Bubble */}
          <div className="p-4 rounded-3xl rounded-tr-sm bg-amber-500 text-white shadow-md shadow-amber-500/15">
            <p className="text-base font-medium leading-relaxed">{message.text}</p>
          </div>

          {/* Attached Correction Box */}
          {message.correction && <CorrectionBox correction={message.correction} />}
        </div>

        {/* User avatar */}
        <div className="w-9 h-9 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
          <User className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
