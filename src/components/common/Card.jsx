import React from "react";

export function Card({ children, className = "", hover = false, onClick, ...props }) {
  return (
    <div
      onClick={onClick}
      className={`bg-slate-900/90 border border-slate-800 text-slate-100 rounded-2xl shadow-sm ${
        hover ? "hover:border-slate-700 hover:shadow-md transition-all duration-200 cursor-pointer" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
