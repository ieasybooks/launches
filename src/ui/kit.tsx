import React, { createContext, useContext } from "react";
import { ICONS } from "./iconData";
import { LIGHT, Palette, RADIUS } from "./theme";
import { HEADING_FONT, READING_FONT, UI_FONT } from "../lib/fonts";

export const PaletteContext = createContext<Palette>(LIGHT);
export const usePal = () => useContext(PaletteContext);

export const Icon: React.FC<{ name: string; size?: number; color?: string; strokeWidth?: number; style?: React.CSSProperties }> = ({
  name,
  size = 18,
  color,
  strokeWidth = 2,
  style,
}) => {
  const pal = usePal();
  const body = ICONS[name];
  if (!body) throw new Error(`unknown icon ${name}`);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? pal.ink}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, display: "block", ...style }}
      dangerouslySetInnerHTML={{ __html: body.replace(/stroke="[^"]*"/g, "").replace(/fill="#[0-9a-fA-F]+"/g, 'fill="currentColor"') }}
    />
  );
};

export type Variant = "outline" | "solid" | "ghost";

/** The app's `action` button (components.rb). */
export const Btn: React.FC<{
  label?: string;
  icon?: string;
  iconLeft?: boolean;
  variant?: Variant;
  selected?: boolean;
  disabled?: boolean;
  focused?: boolean;
  pressed?: number;
  width?: number | string;
  height?: number;
  size?: number;
  align?: "center" | "right";
  style?: React.CSSProperties;
  children?: React.ReactNode;
  m?: string;
}> = ({ label, icon, iconLeft, variant = "outline", selected, disabled, focused, pressed = 0, width, height = 36, size = 15, align = "center", style, children, m }) => {
  const pal = usePal();
  const solid = variant === "solid" && !selected;
  const bg = selected ? pal.accent : solid ? pal.primary : variant === "outline" ? pal.card : "transparent";
  const fg = solid ? "#ffffff" : pal.ink;
  const leftIcon = iconLeft ?? (icon === "arrow-left" || icon === "chevron-down");
  const iconEl = icon ? <Icon name={icon} size={16} color={fg} /> : null;
  return (
    <div
      data-m={m}
      style={{
        position: "relative",
        width,
        height,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: align === "right" ? "flex-start" : "center",
        gap: 8,
        padding: "0 12px",
        borderRadius: RADIUS,
        background: bg,
        border: variant === "outline" || selected ? `1px solid ${selected ? "transparent" : pal.line}` : "1px solid transparent",
        color: fg,
        fontFamily: UI_FONT,
        fontSize: size,
        whiteSpace: "nowrap",
        opacity: disabled ? 0.45 : 1,
        boxShadow: focused ? `inset 0 0 0 2px ${pal.primary}` : undefined,
        transform: pressed ? `scale(${1 - 0.04 * pressed})` : undefined,
        flexShrink: 0,
        ...style,
      }}
    >
      {!leftIcon && iconEl}
      {label ? <span style={{ lineHeight: 1 }}>{label}</span> : null}
      {children}
      {leftIcon && iconEl}
      {pressed ? (
        <div style={{ position: "absolute", inset: 0, borderRadius: RADIUS, background: solid ? "rgba(0,0,0,0.12)" : pal.accent, opacity: 0.6 * pressed, mixBlendMode: solid ? "normal" : "multiply" }} />
      ) : null}
    </div>
  );
};

export const IconBtn: React.FC<{ icon: string; selected?: boolean; size?: number; pressed?: number; disabled?: boolean; style?: React.CSSProperties; focused?: boolean; m?: string }> = ({
  icon,
  selected,
  size = 36,
  pressed,
  disabled,
  style,
  focused,
  m,
}) => (
  <Btn variant="ghost" icon={icon} selected={selected} width={size} height={size} pressed={pressed} disabled={disabled} focused={focused} m={m} style={{ padding: 0, ...style }} />
);

export const Card: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode; m?: string }> = ({ style, children, m }) => {
  const pal = usePal();
  return (
    <div data-m={m} style={{ background: pal.card, border: `1px solid ${pal.line}`, borderRadius: RADIUS, boxSizing: "border-box", ...style }}>{children}</div>
  );
};

export const Sep: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const pal = usePal();
  return <div style={{ height: 1, background: pal.line, ...style }} />;
};

export const Txt: React.FC<{
  size?: number;
  muted?: boolean;
  heading?: boolean;
  reading?: boolean;
  weight?: number;
  color?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  m?: string;
}> = ({ size = 16, muted, heading, reading, weight, color, style, children, m }) => {
  const pal = usePal();
  return (
    <div
      data-m={m}
      style={{
        fontFamily: heading ? HEADING_FONT : reading ? READING_FONT : UI_FONT,
        fontSize: size,
        fontWeight: weight ?? (heading ? 500 : 400),
        color: color ?? (muted ? pal.muted : pal.ink),
        lineHeight: 1.45,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Progress: React.FC<{ fraction: number; height?: number; style?: React.CSSProperties }> = ({ fraction, height = 8, style }) => {
  const pal = usePal();
  return (
    <div style={{ height, borderRadius: height, background: pal.line, overflow: "hidden", position: "relative", ...style }}>
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${Math.max(0, Math.min(1, fraction)) * 100}%`, background: pal.primary, borderRadius: height }} />
    </div>
  );
};

/** Text field (edit_line) with optional caret and placeholder. */
export const Field: React.FC<{
  value: string;
  placeholder?: string;
  caret?: boolean;
  focused?: boolean;
  width?: number | string;
  height?: number;
  size?: number;
  selected?: boolean;
  style?: React.CSSProperties;
}> = ({ value, placeholder, caret, focused, width = "100%", height = 44, size = 17, selected, style }) => {
  const pal = usePal();
  return (
    <div
      style={{
        width,
        height,
        boxSizing: "border-box",
        borderRadius: RADIUS,
        border: `1px solid ${focused ? pal.primary : pal.line}`,
        boxShadow: focused ? `0 0 0 1px ${pal.primary}` : undefined,
        background: pal.card,
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        fontFamily: UI_FONT,
        fontSize: size,
        color: value ? pal.ink : pal.muted,
        whiteSpace: "nowrap",
        overflow: "hidden",
        flexShrink: 0,
        ...style,
      }}
    >
      <span style={selected && value ? { background: pal.dark ? "#3d5f73" : "#cfe0f5", borderRadius: 2 } : undefined}>{value || placeholder}</span>
      {caret ? <span style={{ display: "inline-block", width: 1.5, height: size * 1.25, background: pal.ink, marginRight: value ? 1 : -1, order: value ? 0 : -1 }} /> : null}
    </div>
  );
};

/** Highlight occurrences of words from `query` like the app's `highlighted` helper. */
export const Highlighted: React.FC<{ text: string; marks: string[]; style?: React.CSSProperties; current?: number }> = ({ text, marks, style, current = -1 }) => {
  const pal = usePal();
  if (marks.length === 0) return <span style={style}>{text}</span>;
  const strip = (s: string) => s.replace(/[ً-ْٰـ]/g, "");
  const pieces: React.ReactNode[] = [];
  let rest = text;
  let key = 0;
  let found = 0;
  while (rest.length) {
    let best: { at: number; len: number } | null = null;
    for (const m of marks) {
      // find m in rest ignoring diacritics
      const plain = strip(rest);
      const idx = plain.indexOf(strip(m));
      if (idx < 0) continue;
      // map plain index back to original
      let count = -1;
      let start = -1;
      let end = -1;
      for (let i = 0; i < rest.length; i++) {
        if (!/[ً-ْٰـ]/.test(rest[i])) count++;
        if (count === idx && start < 0) start = i;
        if (count === idx + strip(m).length - 1) {
          end = i + 1;
          while (end < rest.length && /[ً-ْٰـ]/.test(rest[end])) end++;
          break;
        }
      }
      if (start >= 0 && end > start && (!best || start < best.at)) best = { at: start, len: end - start };
    }
    if (!best) {
      pieces.push(rest);
      break;
    }
    pieces.push(rest.slice(0, best.at));
    const isCurrent = found === current;
    pieces.push(
      <span
        key={key++}
        data-m="mark"
        style={{
          background: isCurrent ? pal.primary : pal.mark,
          color: isCurrent ? "#ffffff" : pal.primary,
          borderRadius: 3,
          padding: "0 1px",
          boxDecorationBreak: "clone",
          WebkitBoxDecorationBreak: "clone",
        }}
      >
        {rest.slice(best.at, best.at + best.len)}
      </span>,
    );
    found++;
    rest = rest.slice(best.at + best.len);
  }
  return <span style={style}>{pieces}</span>;
};
