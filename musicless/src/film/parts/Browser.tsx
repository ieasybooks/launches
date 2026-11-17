import React from "react";
import { Img, staticFile } from "remotion";
import { DISPLAY, PAGE_HEAD_AR, UI, UI_AR } from "../../lib/fonts";
import { clamp, ease, ramp } from "../../lib/motion";
import { C } from "../../theme";
import { BROWSER_H, BROWSER_W } from "../context";
import { AppIcon } from "./Brand";
import { Icon } from "./icons";
import { Player, type PlayerProps } from "./Player";

// A Chrome-like window in its own CSS pixels (1280 × 800), mirrored for Arabic as Chrome is. Pages sit in the
// content area below the tab strip and toolbar.
export const TOP = 86;
export const CONTENT_H = BROWSER_H - TOP;

export type Tab = { title: string; icon: "store" | "ext" | "yt"; open?: number };

/** Mirror an x position (left edge of a box of width w) for right-to-left pages. */
export const mx = (rtl: boolean, x: number, w = 0) => (rtl ? BROWSER_W - x - w : x);

const StoreGlyph: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ display: "block", flex: "none" }}>
    <path d="M4 7h16l-1.2 12.2a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8z" fill="#e8eaed" />
    <path d="M8.5 7V5.5a3.5 3.5 0 0 1 7 0V7" fill="none" stroke="#9aa0a6" strokeWidth="1.6" />
    <circle cx="12" cy="14.5" r="3.6" fill="#8ab4f8" />
  </svg>
);
const PlayGlyph: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ display: "block", flex: "none" }}>
    <rect x="2" y="5" width="20" height="14" rx="4" fill="#ff0033" />
    <path d="M10 9v6l5-3z" fill="#fff" />
  </svg>
);

const TabIcon: React.FC<{ icon: Tab["icon"]; size: number }> = ({ icon, size }) =>
  icon === "store" ? <StoreGlyph size={size} /> : icon === "ext" ? <AppIcon size={size} k={1} /> : <PlayGlyph size={size} />;

export const BrowserFrame: React.FC<{
  rtl: boolean; tabs: Tab[]; active: number; url: string; secure?: boolean; children: React.ReactNode; dark?: boolean;
}> = ({ rtl, tabs, active, url, children, dark = false }) => {
  const font = rtl ? UI_AR : UI;
  return (
    <div style={{ position: "relative", width: BROWSER_W, height: BROWSER_H, borderRadius: 14, overflow: "hidden", background: C.frame, direction: rtl ? "rtl" : "ltr", fontFamily: font }}>
      {/* tab strip */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 40, display: "flex", alignItems: "flex-end", paddingInlineStart: 14, gap: 2 }}>
        {tabs.map((tab, i) => {
          const open = tab.open ?? 1;
          const on = i === active;
          return (
            <div
              key={i}
              style={{
                position: "relative", height: 34, width: 236 * ease.out(open), overflow: "hidden", borderRadius: "10px 10px 0 0",
                background: on ? C.tab : "transparent", display: "flex", alignItems: "center", gap: 9, padding: "0 12px", boxSizing: "border-box", flex: "none",
              }}
            >
              <TabIcon icon={tab.icon} size={16} />
              <div style={{ fontSize: 12.5, color: "#1f1f1f", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, unicodeBidi: "plaintext" }}>{tab.title}</div>
              <Icon name="x" size={13} color="#5f6368" stroke={2.2} />
            </div>
          );
        })}
        <div style={{ height: 34, width: 34, display: "grid", placeItems: "center" }}>
          <Icon name="plus" size={16} color="#5f6368" stroke={2} />
        </div>
      </div>
      {/* toolbar */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 40, height: 46, background: C.tab, display: "flex", alignItems: "center", gap: 6, padding: "0 10px" }}>
        {(rtl ? ["arrowRight", "arrowLeft", "reload"] : ["arrowLeft", "arrowRight", "reload"]).map((n) => (
          <div key={n} style={{ width: 32, height: 32, display: "grid", placeItems: "center" }}>
            <Icon name={n as "reload"} size={17} color={n === "arrowRight" && !rtl ? "#bdc1c6" : n === "arrowLeft" && rtl ? "#bdc1c6" : "#474747"} stroke={2} />
          </div>
        ))}
        <div style={{ flex: 1, height: 34, borderRadius: 17, background: C.omnibox, display: "flex", alignItems: "center", gap: 10, padding: "0 14px", direction: "ltr", flexDirection: rtl ? "row-reverse" : "row" }}>
          <Icon name="lock" size={14} color="#474747" stroke={2.2} />
          <div style={{ fontSize: 14.5, color: "#1f1f1f", fontFamily: UI, whiteSpace: "nowrap", overflow: "hidden", flex: 1, textAlign: rtl ? "right" : "left" }}>{url}</div>
        </div>
        <div style={{ width: 32, height: 32, display: "grid", placeItems: "center" }}>
          <Icon name="puzzle" size={17} color="#474747" stroke={2} />
        </div>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#c8d6c5", margin: "0 4px" }} />
        <div style={{ width: 28, height: 32, display: "grid", placeItems: "center" }}>
          <Icon name="dots" size={17} color="#474747" stroke={2.4} />
        </div>
      </div>
      {/* page */}
      <div style={{ position: "absolute", left: 0, top: TOP, width: BROWSER_W, height: CONTENT_H, overflow: "hidden", background: dark ? C.ytBg : C.white, borderTop: dark ? "none" : "1px solid #e3e3e3", direction: "ltr" }}>
        {children}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- the Chrome Web Store
export const STORE = {
  search: { x: 372, y: 8, w: 720, h: 48 },
  button: { x: 1100, y: 152, w: 156, h: 40 },
  icon: { x: 184, y: 146, s: 60 },
};

export const StorePage: React.FC<{
  rtl: boolean; t: number; typed: string; caret: boolean; listing: number;
  ui: { storeTitle: string; storeSearch: string; storeNav: string[]; name: string; addToChrome: string; chips: string[]; shotCaption?: [string, string] | null };
  shot: string; pressed?: number; hoverBtn?: number;
}> = ({ rtl, typed, caret, listing, ui, shot, pressed = 0, hoverBtn = 0 }) => {
  const font = rtl ? UI_AR : UI;
  const s = STORE.search;
  const b = STORE.button;
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: font, direction: rtl ? "rtl" : "ltr" }}>
      {/* header */}
      <div style={{ position: "absolute", top: 18, insetInlineStart: 22, display: "flex", alignItems: "center", gap: 10 }}>
        <StoreGlyph size={30} />
        <span style={{ fontSize: 21, color: "#1f1f1f", fontWeight: 400, letterSpacing: rtl ? 0 : "-0.01em", whiteSpace: "nowrap" }}>{ui.storeTitle}</span>
      </div>
      <div
        style={{
          position: "absolute", left: mx(rtl, s.x, s.w), top: s.y, width: s.w, height: s.h, borderRadius: 24, background: "#fff",
          boxShadow: "0 1px 3px rgba(60,64,67,0.3), 0 1px 6px rgba(60,64,67,0.12)", display: "flex", alignItems: "center", gap: 14, padding: "0 18px", boxSizing: "border-box",
        }}
      >
        <Icon name="search" size={21} color="#474747" stroke={2.2} />
        <span style={{ fontSize: 16.5, color: typed ? "#1f1f1f" : "#5f6368", whiteSpace: "nowrap" }}>
          {typed || (caret ? "" : ui.storeSearch)}
          {caret && <span style={{ display: "inline-block", width: 1.5, height: 21, background: "#1f1f1f", verticalAlign: "-4px", marginInlineStart: 1 }} />}
        </span>
      </div>
      <div style={{ position: "absolute", top: 74, insetInlineStart: 42, display: "flex", gap: 34, fontSize: 14.5, color: "#444746" }}>
        {ui.storeNav.map((n, i) => (
          <div key={n} style={{ position: "relative", color: i === 1 ? C.blue : undefined, fontWeight: i === 1 ? 500 : 400 }}>
            {n}
            {i === 1 && <div style={{ position: "absolute", left: 0, right: 0, bottom: -10, height: 3, borderRadius: 2, background: C.blue }} />}
          </div>
        ))}
      </div>
      {/* the store's front page, until the search */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - listing }}>
        <div style={{ position: "absolute", left: 104, top: 136, width: 1072, height: 230, borderRadius: 24, background: "linear-gradient(120deg, #e8eefc, #f3f0fb)" }} />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ position: "absolute", left: 104 + i * 274, top: 398, width: 250, height: 200, borderRadius: 18, background: "#f1f3f4" }}>
            <div style={{ position: "absolute", left: 16, top: 16, width: 48, height: 48, borderRadius: 12, background: "#e3e5e8" }} />
            <div style={{ position: "absolute", left: 16, top: 84, width: 160, height: 12, borderRadius: 6, background: "#e3e5e8" }} />
            <div style={{ position: "absolute", left: 16, top: 108, width: 110, height: 12, borderRadius: 6, background: "#e8eaed" }} />
          </div>
        ))}
      </div>
      {/* the listing */}
      <div style={{ position: "absolute", inset: 0, opacity: listing, transform: `translateY(${(1 - listing) * 14}px)` }}>
        <div style={{ position: "absolute", left: mx(rtl, STORE.icon.x, STORE.icon.s), top: STORE.icon.y }}>
          <AppIcon size={STORE.icon.s} k={1} />
        </div>
        <div style={{ position: "absolute", insetInlineStart: 262, top: 150, fontSize: 33, fontWeight: 500, color: "#1f1f1f", whiteSpace: "nowrap" }}>{ui.name}</div>
        <div style={{ position: "absolute", insetInlineStart: 184, top: 232, display: "flex", gap: 8 }}>
          {ui.chips.map((c) => (
            <div key={c} style={{ height: 36, lineHeight: "36px", padding: "0 12px", borderRadius: 8, background: C.chip, fontSize: 14, color: "#1f1f1f" }}>{c}</div>
          ))}
        </div>
        <div
          style={{
            position: "absolute", left: mx(rtl, b.x, b.w), top: b.y, width: b.w, height: b.h, borderRadius: 20, background: hoverBtn ? "#0a4ebc" : C.blue, color: "#fff",
            fontSize: 14.5, fontWeight: 500, display: "grid", placeItems: "center", transform: `scale(${1 - 0.04 * pressed})`, whiteSpace: "nowrap",
            boxShadow: hoverBtn ? "0 1px 3px rgba(11,87,208,0.4)" : "none", unicodeBidi: "plaintext",
          }}
        >
          {ui.addToChrome}
        </div>
        <div style={{ position: "absolute", left: 360, top: 300, width: 560, height: 350, borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(60,64,67,0.25)" }}>
          <Img src={staticFile(shot)} style={{ width: "100%", height: "100%", display: "block" }} />
          {/* the image's own caption, redrawn where it needs correcting (same face, size and colours as
              tests/screenshots.mjs in the musicless repository: 40 px on the store image's paper) */}
          {ui.shotCaption && (
            <div style={{ position: "absolute", left: 0, top: 0, width: 1280, height: 122, transform: `scale(${560 / 1280})`, transformOrigin: "0 0", background: "#f4ede0" }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 46, height: 52, textAlign: "center", fontFamily: UI_AR, fontSize: 40, lineHeight: "52px", fontWeight: 500, color: "#1f1d1a", direction: "rtl", whiteSpace: "nowrap" }}>
                <span style={{ fontWeight: 600 }}>{ui.shotCaption[0]}</span> <span style={{ color: "#6e675c" }}>{ui.shotCaption[1]}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- Chrome's install dialog
export const DIALOG = { x: 400, y: 8, w: 480, h: 204, add: { x: 1, y: 150, w: 132, h: 36 } };
/** The "Add extension" button's centre in content coordinates. */
export const dialogAdd = (rtl: boolean) => {
  const right = DIALOG.x + DIALOG.w - 20;
  const x = rtl ? DIALOG.x + 20 + DIALOG.add.w / 2 : right - DIALOG.add.w / 2;
  return { x, y: DIALOG.y + DIALOG.add.y + DIALOG.add.h / 2 };
};

export const InstallDialog: React.FC<{ rtl: boolean; k: number; pressed?: number; ui: { dialogTitle: string; dialogCan: string; dialogHosts: string; cancel: string; addExtension: string } }> = ({
  rtl, k, pressed = 0, ui,
}) => {
  if (k <= 0) return null;
  const font = rtl ? UI_AR : UI;
  return (
    <div
      style={{
        position: "absolute", left: DIALOG.x, top: DIALOG.y, width: DIALOG.w, height: DIALOG.h, boxSizing: "border-box", padding: "20px 20px 18px", borderRadius: 12, background: "#fff",
        boxShadow: "0 4px 8px 3px rgba(60,64,67,0.15), 0 1px 3px rgba(60,64,67,0.3)", opacity: clamp(k * 1.6), transform: `translateY(${(1 - ease.out(k)) * -10}px) scale(${0.97 + 0.03 * ease.out(k)})`,
        transformOrigin: "50% 0", fontFamily: font, direction: rtl ? "rtl" : "ltr", zIndex: 5,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <AppIcon size={32} k={1} />
        <div style={{ fontSize: 16.5, fontWeight: 500, color: "#1f1f1f" }}>{ui.dialogTitle}</div>
      </div>
      <div style={{ marginTop: 14, fontSize: 13.5, color: "#1f1f1f" }}>{ui.dialogCan}</div>
      <ul style={{ margin: "6px 0 0", paddingInlineStart: 20, fontSize: 13.5, lineHeight: 1.45, color: "#444746" }}>
        <li>
          {ui.dialogHosts.split(/([a-z0-9.-]+\.com)/).map((part, i) =>
            i % 2 ? (
              <bdi key={i} style={{ whiteSpace: "nowrap", direction: "ltr", unicodeBidi: "isolate" }}>{part}</bdi>
            ) : (
              <React.Fragment key={i}>{part}</React.Fragment>
            ),
          )}
        </li>
      </ul>
      <div style={{ position: "absolute", insetInlineEnd: 20, bottom: 18, display: "flex", gap: 8 }}>
        <div style={{ height: 36, lineHeight: "36px", padding: "0 16px", borderRadius: 18, border: "1px solid #c4c7c5", color: C.blue, fontSize: 14, fontWeight: 500 }}>{ui.cancel}</div>
        <div
          style={{
            height: 36, lineHeight: "36px", width: DIALOG.add.w, textAlign: "center", borderRadius: 18, background: C.blue, color: "#fff", fontSize: 14, fontWeight: 500,
            transform: `scale(${1 - 0.05 * pressed})`,
          }}
        >
          {ui.addExtension}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- the extension's first-run page
export const WELCOME = { button: { y: 437, h: 40 } };

export const WelcomePage: React.FC<{ rtl: boolean; snap: number; done: number; pressed?: number; ext: (k: string) => string }> = ({ rtl, snap, done, pressed = 0, ext }) => {
  const font = rtl ? UI_AR : UI;
  const head = rtl ? PAGE_HEAD_AR : font;
  const hSize = rtl ? 34 : 32;
  const pSize = rtl ? 17 : 16;
  const pLine = rtl ? 28 : 24;
  const steps: [string, React.ReactNode][] = [
    [ext("done_step1_title"), ext("done_step1_text")],
    [ext("done_step2_title"), ext("done_step2_text")],
    [
      ext("done_step3_title"),
      (() => {
        const [a, b] = ext("done_step3_text").split("{icon}");
        return (
          <>
            {a}
            <InlineGlyph />
            {b}
          </>
        );
      })(),
    ],
  ];
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: font, direction: rtl ? "rtl" : "ltr", color: C.pageText }}>
      <div style={{ position: "absolute", left: (BROWSER_W - 560) / 2, top: 0, width: 560, paddingTop: 96, textAlign: "center", boxSizing: "border-box" }}>
        <div style={{ width: 64, height: 64, margin: "0 auto 28px" }}>
          <AppIcon size={64} k={snap} />
        </div>
        <div style={{ position: "relative" }}>
          {/* setup */}
          <div style={{ opacity: 1 - clamp(done * 7), position: done >= 1 ? "absolute" : "relative", top: 0, left: 0, right: 0 }}>
            <div style={{ fontFamily: head, fontSize: hSize, lineHeight: `${rtl ? 48 : 40}px`, height: rtl ? 48 : 40, fontWeight: 400, marginBottom: 12, whiteSpace: "nowrap" }}>{ext("setup_heading")}</div>
            <div style={{ maxWidth: 500, height: 4 * pLine, margin: "0 auto 32px", color: C.pageMuted, fontSize: pSize, lineHeight: `${pLine}px` }}>
              {ext("consent_text")} <span style={{ textDecoration: "underline", textUnderlineOffset: rtl ? 4 : 3 }}>{ext("link_privacy")}</span>
            </div>
            <div
              style={{
                display: "inline-flex", alignItems: "center", height: 40, padding: "0 24px", borderRadius: 20, background: C.ink, color: C.paper,
                fontSize: rtl ? 15 : 14, fontWeight: 500, transform: `scale(${1 - 0.03 * pressed})`,
              }}
            >
              {ext("consent_accept")}
            </div>
          </div>
          {/* turned on */}
          {done > 0 && (
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, opacity: clamp((done - 0.12) * 5) }}>
              <div style={{ fontFamily: head, fontSize: hSize, lineHeight: `${rtl ? 48 : 40}px`, fontWeight: 400, marginBottom: 12 }}>{ext("done_heading")}</div>
              <ol style={{ boxSizing: "border-box", maxWidth: 380, margin: "24px auto", paddingInlineStart: 28, textAlign: "start", listStyleType: "decimal" }}>
                {steps.map(([title, text], i) => {
                  const k = ramp(done, 0.25 + i * 0.12, 0.35, ease.outQuint);
                  return (
                    <li key={i} style={{ paddingInlineStart: 4, marginBottom: 16, fontSize: pSize, lineHeight: `${pLine}px`, opacity: k, transform: `translateY(${(1 - k) * 6}px)` }}>
                      <strong style={{ fontWeight: 500, fontFamily: head }}>{title}</strong>
                      <p style={{ margin: "4px 0 0", color: C.pageMuted }}>{text}</p>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InlineGlyph: React.FC = () => (
  <svg viewBox="0 0 24 24" width="1.35em" height="1.35em" style={{ display: "inline-block", verticalAlign: "-0.3em", margin: "0 0.1em" }}>
    <g fill={C.pageText}>
      <circle cx="9.2" cy="17.9" r="4.2" />
      <rect x="11.4" y="1.9" width="2" height="16" />
      <rect x="11.4" y="1.9" width="6.4" height="4.4" />
    </g>
    <path d="M3.4 2.3 21.4 20.3" stroke="#fff" strokeWidth="4.4" strokeLinecap="round" />
    <path d="M3.4 2.3 21.4 20.3" stroke={C.pageText} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ---------------------------------------------------------------- a YouTube watch page (dark)
export const WATCH = { player: { x: 24, y: 72, w: 848 } };

export const WatchPage: React.FC<{ rtl: boolean; player: Omit<PlayerProps, "w" | "lang">; ui: { videoTitle: string; channel: string; channelMark: string }; lang: "ar" | "en" }> = ({ rtl, player, ui, lang }) => {
  const p = WATCH.player;
  const ph = (p.w * 9) / 16;
  const px = mx(rtl, p.x, p.w);
  const side = mx(rtl, p.x + p.w + 24, BROWSER_W - p.w - 72);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.ytBg, fontFamily: rtl ? UI_AR : UI }}>
      {/* top bar, without the site's logo */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 56, display: "flex", alignItems: "center", justifyContent: "center", direction: rtl ? "rtl" : "ltr" }}>
        <div style={{ position: "absolute", insetInlineStart: 24, top: 18, width: 22, height: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ height: 2.4, borderRadius: 2, background: C.ytText }} />
          ))}
        </div>
        <div style={{ width: 520, height: 40, borderRadius: 20, border: "1px solid #303030", background: "#121212", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 16px", boxSizing: "border-box" }}>
          <Icon name="search" size={19} color={C.ytText} stroke={2} />
        </div>
        <div style={{ position: "absolute", insetInlineEnd: 24, top: 14, width: 30, height: 30, borderRadius: "50%", background: "#3b6e8f" }} />
      </div>
      <div style={{ position: "absolute", left: px, top: p.y }}>
        <Player w={p.w} lang={lang} radius={12} {...player} />
      </div>
      <div style={{ position: "absolute", left: px, top: p.y + ph + 14, width: p.w, direction: "ltr", textAlign: rtl ? "right" : "left" }}>
        <div style={{ fontFamily: rtl ? UI_AR : UI, fontSize: 21, fontWeight: 700, color: C.ytText, direction: rtl ? "rtl" : "ltr", unicodeBidi: "plaintext", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ui.videoTitle}</div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12, flexDirection: rtl ? "row-reverse" : "row" }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#13324a", display: "grid", placeItems: "center", color: "#fff", fontFamily: DISPLAY, fontSize: 15, fontWeight: 700 }}>{ui.channelMark}</div>
          <div style={{ fontFamily: /[؀-ۿ]/.test(ui.channel) ? UI_AR : UI, fontSize: 16, fontWeight: 500, color: C.ytText, direction: "ltr", unicodeBidi: "plaintext" }}>{ui.channel}</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: side, top: p.y, width: BROWSER_W - p.w - 72 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, flexDirection: rtl ? "row-reverse" : "row" }}>
            <div style={{ width: 168, height: 94, borderRadius: 8, background: "#272727", flex: "none" }} />
            <div style={{ flex: 1, paddingTop: 4 }}>
              <div style={{ height: 12, borderRadius: 6, background: "#2a2a2a", width: "92%" }} />
              <div style={{ height: 12, borderRadius: 6, background: "#2a2a2a", width: "70%", marginTop: 8 }} />
              <div style={{ height: 10, borderRadius: 5, background: "#222", width: "45%", marginTop: 12 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
