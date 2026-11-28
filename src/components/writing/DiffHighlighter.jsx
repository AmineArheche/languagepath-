import React, { useState, useMemo } from "react";
import { CheckCircle2, SplitSquareVertical, Columns } from "lucide-react";

/**
 * Computes a clean word-level diff between oldText and newText using Longest Common Subsequence
 */
function computeWordDiff(oldStr = "", newStr = "") {
  if (!oldStr && !newStr) return [];
  if (!oldStr) return [{ type: "added", text: newStr }];
  if (!newStr) return [{ type: "removed", text: oldStr }];
  if (oldStr === newStr) return [{ type: "unchanged", text: oldStr }];

  const oldTokens = oldStr.split(/(\s+|[.,!?;:()]+)/).filter(Boolean);
  const newTokens = newStr.split(/(\s+|[.,!?;:()]+)/).filter(Boolean);

  const m = oldTokens.length;
  const n = newTokens.length;

  // Limit dynamic programming matrix size for performance on long essays
  if (m * n > 40000) {
    return [
      { type: "removed", text: oldStr },
      { type: "added", text: newStr }
    ];
  }

  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (oldTokens[i] === newTokens[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to extract diff chunks
  const diff = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldTokens[i - 1] === newTokens[j - 1]) {
      diff.unshift({ type: "unchanged", text: oldTokens[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({ type: "added", text: newTokens[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      diff.unshift({ type: "removed", text: oldTokens[i - 1] });
      i--;
    }
  }

  // Merge contiguous tokens of the same type
  const merged = [];
  for (const chunk of diff) {
    if (merged.length > 0 && merged[merged.length - 1].type === chunk.type) {
      merged[merged.length - 1].text += chunk.text;
    } else {
      merged.push({ ...chunk });
    }
  }

  return merged;
}

/**
 * Word-level Diff Highlighter
 * Displays word-level edits between original and corrected German texts.
 */
export function DiffHighlighter({ originalText = "", correctedText = "", mistakes = [] }) {
  const [viewMode, setViewMode] = useState("unified"); // "unified" | "split"

  const diffChunks = useMemo(() => {
    return computeWordDiff(originalText, correctedText);
  }, [originalText, correctedText]);

  if (!mistakes || mistakes.length === 0 || originalText === correctedText) {
    return (
      <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
        <div className="flex items-center gap-2 font-black text-sm mb-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Flawless Text! No Corrections Needed</span>
        </div>
        <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed">
          {correctedText || originalText}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Mode Toggle & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode("unified")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              viewMode === "unified"
                ? "bg-amber-500 text-white shadow-2xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span>Inline Word Diff</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
              viewMode === "split"
                ? "bg-amber-500 text-white shadow-2xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-200 dark:bg-rose-900 border border-rose-400" />
            Original error (deleted)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-200 dark:bg-emerald-900 border border-emerald-400" />
            Corrected word
          </span>
        </div>
      </div>

      {viewMode === "unified" ? (
        /* Unified Inline Word-level View */
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm leading-loose font-medium text-slate-800 dark:text-slate-100 whitespace-pre-wrap select-text shadow-2xs">
          {diffChunks.map((chunk, idx) => {
            if (chunk.type === "removed") {
              return (
                <span
                  key={idx}
                  className="line-through bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 px-1 py-0.5 mx-0.5 rounded font-medium border border-rose-200 dark:border-rose-800/60"
                  title="Original text removed or changed"
                >
                  {chunk.text}
                </span>
              );
            }
            if (chunk.type === "added") {
              return (
                <span
                  key={idx}
                  className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100 px-1 py-0.5 mx-0.5 rounded font-extrabold border border-emerald-300 dark:border-emerald-700/80"
                  title="Corrected German wording"
                >
                  {chunk.text}
                </span>
              );
            }
            return <span key={idx}>{chunk.text}</span>;
          })}
        </div>
      ) : (
        /* Side-by-Side View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center justify-between">
              <span>Your Original Text</span>
              <span className="text-[10px] text-slate-400 font-bold">Errors marked</span>
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {diffChunks.map((chunk, idx) => {
                if (chunk.type === "removed") {
                  return (
                    <span
                      key={idx}
                      className="bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 px-1 py-0.5 mx-0.5 rounded line-through"
                    >
                      {chunk.text}
                    </span>
                  );
                }
                if (chunk.type === "added") {
                  return null;
                }
                return <span key={idx}>{chunk.text}</span>;
              })}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-slate-900/60 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
              <span>Corrected Natural German</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Standard standard German</span>
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {diffChunks.map((chunk, idx) => {
                if (chunk.type === "added") {
                  return (
                    <span
                      key={idx}
                      className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 px-1 py-0.5 mx-0.5 rounded font-bold"
                    >
                      {chunk.text}
                    </span>
                  );
                }
                if (chunk.type === "removed") {
                  return null;
                }
                return <span key={idx}>{chunk.text}</span>;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
