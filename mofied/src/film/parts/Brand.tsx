import React from "react";
import { DISPLAY } from "../../lib/fonts";
import type { Lang } from "../../lib/timeline";
import { C } from "../../theme";
import { MARK_PATH } from "./markPath";

export const Mark: React.FC<{ size: number; color?: string; style?: React.CSSProperties }> = ({ size, color = C.ink, style }) => (
  <svg width={size} height={size} viewBox="0 0 1024 1024" style={{ display: "block", flexShrink: 0, overflow: "visible", ...style }}>
    <path fill={color} fillRule="evenodd" d={MARK_PATH} />
  </svg>
);

/** The mark beside the name, as on the store listing and the app's About sheet. */
export const Lockup: React.FC<{ lang: Lang; size: number; color?: string; name?: number }> = ({ lang, size, color = C.ink, name = 1 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: size * 0.22, direction: lang === "ar" ? "rtl" : "ltr" }}>
    <Mark size={size} color={color} />
    <span style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: size * 0.95, lineHeight: 1, color, opacity: name, transform: `translateY(${lang === "ar" ? -size * 0.04 : size * 0.02}px)`, letterSpacing: lang === "en" ? "-0.02em" : 0 }}>
      {lang === "ar" ? "مفيد" : "Mofied"}
    </span>
  </div>
);
