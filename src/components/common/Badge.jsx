import React from "react";
import { getGenderDetails } from "../../utils/textFormatting";

export function Badge({ children, variant = "default", gender = null, size = "md", className = "" }) {
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs font-semibold" : "px-2.5 py-1 text-xs font-semibold";

  if (gender) {
    const details = getGenderDetails(gender);
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full uppercase tracking-wider ${details.pillClass} ${sizeClass} ${className}`}>
        {details.tag && (
          <span className="font-mono text-[9px] opacity-75 lowercase tracking-normal">
            [{details.tag}]
          </span>
        )}
        <span>{gender}</span>
      </span>
    );
  }

  const variants = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    primary: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60",
    purple: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60",
    outline: "border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400"
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${variants[variant] || variants.default} ${sizeClass} ${className}`}>
      {children}
    </span>
  );
}
