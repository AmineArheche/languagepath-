/**
 * src/components/common/BrandLogo.jsx
 *
 * Modern, Balanced Vector Brand Logo for LanguagePath:
 * - Geometric squircle container with obsidian/slate gradient and subtle indigo glow
 * - Interconnected dual-pathway glyph combining the letters 'L' and 'P'
 * - Clean, modern typography with amber accent
 */

import React, { useId } from "react";

export function BrandLogo({ size = "md", iconOnly = false, className = "" }) {
  const rawId = useId();
  const safeId = rawId.replace(/:/g, "_");

  const sizeMap = {
    sm: { icon: "w-8 h-8", text: "text-base", sub: "text-[9px]" },
    md: { icon: "w-10 h-10", text: "text-lg sm:text-xl", sub: "text-[11px]" },
    lg: { icon: "w-12 h-12", text: "text-2xl", sub: "text-xs" }
  };

  const s = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Modern Squircle Logo Icon */}
      <div
        className={`relative ${s.icon} rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-950 border border-indigo-500/30 shadow-lg shadow-indigo-500/15 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-amber-500/50 transition-all duration-300 overflow-hidden`}
      >
        {/* Ambient background glow inside badge */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-indigo-500/20 pointer-events-none" />

        {/* Vector Emblem: Interlocking Pathway 'LP' Monogram */}
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 transform group-hover:rotate-3 transition-transform duration-300"
        >
          <defs>
            <linearGradient id={`lp-path-${safeId}`} x1="4" y1="6" x2="32" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" />
              <stop offset="0.5" stopColor="#EC4899" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
            <linearGradient id={`lp-gold-${safeId}`} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#FBBF24" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>
          </defs>

          {/* Stylized 'L' Pathway (Bottom & Left Stem) */}
          <path
            d="M9 8V24C9 26.2091 10.7909 28 13 28H27"
            stroke={`url(#lp-path-${safeId})`}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Stylized 'P' Upper Loop */}
          <path
            d="M17 8H23C25.7614 8 28 10.2386 28 13C28 15.7614 25.7614 18 23 18H17V8Z"
            stroke="#60A5FA"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Glowing Pathway Beacon Star */}
          <circle cx="27" cy="28" r="2.2" fill={`url(#lp-gold-${safeId})`} className="animate-pulse" />
        </svg>
      </div>

      {/* Brand Text Typography */}
      {!iconOnly && (
        <div className="leading-tight">
          <div className="flex items-center gap-1">
            <span className={`font-black tracking-tight text-white ${s.text}`}>
              Language<span className="text-amber-400">Path</span>
            </span>
          </div>
          <span className={`text-slate-400 font-medium block tracking-wide ${s.sub}`}>
            Universal Language Pathway
          </span>
        </div>
      )}
    </div>
  );
}
