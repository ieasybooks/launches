import React from "react";
import { Freeze, OffthreadVideo, staticFile } from "remotion";
import { LATIN_FONT, UI_FONT } from "../lib/fonts";
import { clamp, easeInOutCubic, easeOutBack, easeOutCubic, mixPt, prog, track, window01 } from "../lib/time";
import { Icon } from "../ui/kit";
import { BAR_H, FILM, VIEW_H, VIEW_W, WIN_H, WIN_W } from "../ui/theme";
import { CLIP_DATA, Shot, videoAt } from "./clips";
import { CAMS, CLICKS, CURSOR, Cam, KEYCAPS, SCROLLS, SELECT_MENU, SPOTS, T, TOASTS, shotsAt } from "./director";

const mixCam = (a: Cam, b: Cam, p: number): Cam => {
  // interpolate zoom in log space so zoom speed feels constant
  const z = Math.exp(Math.log(a.z) + (Math.log(b.z) - Math.log(a.z)) * p);
  return { z, x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p };
};

export const cameraAt = (scene: string, t: number): Cam => {
  const c = track(CAMS[scene], t, mixCam);
  const z = Math.max(1, c.z);
  const hw = VIEW_W / (2 * z);
  const hh = VIEW_H / (2 * z);
  return { z, x: clamp(c.x, hw, VIEW_W - hw), y: clamp(c.y, hh, VIEW_H - hh) };
};

/** One frame of a recording: the frame of its clip that the shot shows at film time t. */
const VideoFrame: React.FC<{ src: string; frame: number; opacity?: number }> = ({ src, frame, opacity = 1 }) => (
  <div style={{ position: "absolute", inset: 0, opacity }}>
    <Freeze frame={frame}>
      <OffthreadVideo src={staticFile(src)} muted style={{ width: VIEW_W, height: VIEW_H, display: "block" }} />
    </Freeze>
  </div>
);

const SCROLL_SPAN = 0.45;

export const ClipFrame: React.FC<{ shot: Shot; t: number; opacity?: number }> = ({ shot, t, opacity = 1 }) => {
  const info = CLIP_DATA[shot.clip];
  const v = videoAt(shot, t);
  const frame = clamp(Math.round(v * info.fps), 0, info.frames - 1);
  const sc = SCROLLS[shot.clip]?.find((s) => v >= s.at && v < s.at + SCROLL_SPAN);
  if (sc === undefined) {
    return (
      <div style={{ position: "absolute", inset: 0, opacity }}>
        <VideoFrame src={info.src} frame={frame} />
      </div>
    );
  }
  // slide the scrolled area from its old position to its new one
  const p = easeInOutCubic((v - sc.at) / SCROLL_SPAN);
  const pre = Math.floor(sc.at * info.fps);
  const post = pre + 1;
  const [x, y, w, h] = sc.box;
  const down = (1 - p) * sc.dy;
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      <VideoFrame src={info.src} frame={pre} />
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: -x, top: -y - p * sc.dy, width: VIEW_W, height: VIEW_H }}>
          <VideoFrame src={info.src} frame={pre} />
        </div>
      </div>
      <div style={{ position: "absolute", left: x, top: y + down, width: w, height: h - down, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: -x, top: -y, width: VIEW_W, height: VIEW_H }}>
          <VideoFrame src={info.src} frame={post} />
        </div>
      </div>
    </div>
  );
};

const cursorOpacity = (t: number) => prog(t, T.launch + 0.6, T.launch + 1.0) * (1 - prog(t, T.tourEnd - 0.8, T.tourEnd - 0.4));

const Cursor: React.FC<{ t: number; z: number }> = ({ t, z }) => {
  const op = cursorOpacity(t);
  if (op <= 0) return null;
  const { x, y } = track(CURSOR, t, mixPt);
  const k = 1.15 / z;
  let dip = 0;
  const ripples: React.ReactNode[] = [];
  for (const c of CLICKS) {
    const dt = t - c;
    if (dt > -0.08 && dt < 0.16) dip = Math.max(dip, 1 - Math.abs(dt - 0.02) / 0.12);
    if (dt >= 0 && dt < 0.55) {
      const p = easeOutCubic(dt / 0.55);
      const r = (4 + 26 * p) * k;
      ripples.push(
        <div
          key={c}
          style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", border: `${2.5 * k}px solid ${FILM.terracotta}`, opacity: 0.6 * (1 - p), boxSizing: "border-box" }}
        />,
      );
    }
  }
  const s = k * (1 - 0.16 * clamp(dip));
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: op }}>
      {ripples}
      <svg width={26} height={36} viewBox="0 0 26 36" style={{ position: "absolute", left: x - 3, top: y - 2, transform: `scale(${s})`, transformOrigin: "3px 2px", filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.28))" }}>
        <path d="M3 2 L3 27 L9 21.5 L13.2 31 L17 29.4 L12.9 20 L21 20 Z" fill="#141010" stroke="#ffffff" strokeWidth={2} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

/** Terracotta rings around the control being used, with the rest of the page dimmed slightly. */
const Spotlights: React.FC<{ t: number; z: number }> = ({ t, z }) => (
  <>
    {SPOTS.map((sp, i) => {
      const a = Math.min(prog(t, sp.t0, sp.t0 + 0.3, easeOutCubic), 1 - prog(t, sp.t1 - 0.25, sp.t1, easeInOutCubic));
      if (a <= 0) return null;
      const grow = 1 + 0.05 * (1 - prog(t, sp.t0, sp.t0 + 0.35, easeOutCubic));
      const pad = 5 / z;
      const [x, y, w, h] = sp.box;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x - pad,
            top: y - pad,
            width: w + 2 * pad,
            height: h + 2 * pad,
            borderRadius: sp.r,
            boxShadow: `0 0 0 ${2.6 / z}px ${FILM.terracotta}, 0 0 0 ${7 / z}px rgba(174,71,33,0.16), 0 0 0 4000px rgba(28,18,14,${0.12 * a})`,
            opacity: a,
            transform: `scale(${grow})`,
            pointerEvents: "none",
          }}
        />
      );
    })}
  </>
);

/** ⌘V and ⏎ keycaps that pop up next to the cursor when a key is pressed. */
const Keycaps: React.FC<{ t: number; z: number }> = ({ t, z }) => (
  <>
    {KEYCAPS.map((kc, i) => {
      const a = prog(t, kc.t - 0.05, kc.t + 0.25, easeOutBack(1.6)) * (1 - prog(t, kc.t + 0.9, kc.t + 1.2));
      if (a <= 0) return null;
      const k = 1 / z;
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: kc.x + 22 * k,
            top: kc.y + 18 * k,
            transformOrigin: "0 0",
            transform: `scale(${k * (0.7 + 0.3 * a)})`,
            opacity: clamp(a),
            padding: "6px 14px",
            borderRadius: 10,
            background: "#2b2422",
            color: "#fff",
            fontFamily: LATIN_FONT,
            fontWeight: 600,
            fontSize: 22,
            boxShadow: "0 6px 16px rgba(0,0,0,0.25), inset 0 -3px 0 rgba(255,255,255,0.12)",
            direction: "ltr",
            whiteSpace: "nowrap",
          }}
        >
          {kc.label}
        </div>
      );
    })}
  </>
);

/** Small dark tooltips (✓ تم النسخ) above a control. */
const Toasts: React.FC<{ t: number; z: number }> = ({ t, z }) => (
  <>
    {TOASTS.map((ts, i) => {
      const a = prog(t, ts.t0, ts.t0 + 0.2, easeOutCubic) * (1 - prog(t, ts.t1 - 0.25, ts.t1));
      if (a <= 0) return null;
      const k = 1 / z;
      return (
        <div key={i} style={{ position: "absolute", left: ts.x, top: ts.y, transformOrigin: "50% 100%", transform: `translate(-50%, -100%) scale(${k}) translateY(${(1 - a) * 8}px)`, opacity: a }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10, background: "#2b2422", color: "#fff", fontFamily: UI_FONT, fontSize: 20, direction: "rtl", whiteSpace: "nowrap", boxShadow: "0 8px 20px rgba(0,0,0,0.22)" }}>
            <Icon name="check" size={18} color="#7fd29b" strokeWidth={2.6} />
            {ts.label}
          </div>
        </div>
      );
    })}
  </>
);

/** The macOS menu of a native <select>: screen captures can't see it, so it is drawn here. */
const SelectMenu: React.FC<{ t: number }> = ({ t }) => {
  const { t0, t1, box, options, pick } = SELECT_MENU;
  const a = prog(t, t0, t0 + 0.12) * (1 - prog(t, t1 + 0.05, t1 + 0.2));
  if (a <= 0) return null;
  const rowH = 30;
  const hover = t > t1 - 0.45 ? pick : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: box[0] + box[2] - 300,
        top: box[1] + 2,
        width: 296,
        padding: 5,
        borderRadius: 9,
        background: "rgba(246,244,242,0.97)",
        boxShadow: "0 12px 34px rgba(0,0,0,0.22), 0 0 0 0.5px rgba(0,0,0,0.18)",
        opacity: a,
        direction: "rtl",
        fontFamily: UI_FONT,
        fontSize: 15,
      }}
    >
      {options.map((o, i) => (
        <div
          key={o}
          style={{ height: rowH, borderRadius: 5, display: "flex", alignItems: "center", gap: 8, padding: "0 10px", background: i === hover ? "#2f6fe4" : "transparent", color: i === hover ? "#fff" : "#1d1d1f" }}
        >
          <span style={{ width: 14, display: "inline-flex" }}>{i === 0 ? <Icon name="check" size={13} color={i === hover ? "#fff" : "#1d1d1f"} strokeWidth={2.6} /> : null}</span>
          <span style={{ unicodeBidi: "plaintext" }}>{o}</span>
        </div>
      ))}
    </div>
  );
};

/** "×6" while a long wait (the server check, the assistant working) is sped up. */
const SpeedBadge: React.FC<{ t: number; shot: Shot }> = ({ t, shot }) => {
  const A = shot.anchors;
  let a = 0;
  let rate = 1;
  for (let i = 0; i < A.length - 1; i++) {
    const b = A[i + 1];
    const dv = b.v - A[i].v;
    const df = b.f - A[i].f;
    if (!b.ff || b.from !== undefined || dv / df < 1.6) continue;
    const w = window01(t, A[i].f, b.f, 0.18, 0.18);
    if (w > a) {
      a = w;
      rate = dv / df;
    }
  }
  if (a <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 18,
        top: 16,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 14px",
        borderRadius: 999,
        background: "rgba(43,36,34,0.88)",
        color: "#fff",
        fontFamily: LATIN_FONT,
        fontWeight: 600,
        fontSize: 19,
        opacity: a,
        transform: `translateY(${(1 - a) * -8}px)`,
        direction: "ltr",
        boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
      }}
    >
      <Icon name="fast-forward" size={18} color="#fff" />
      {`×${Math.round(rate)}`}
    </div>
  );
};

const Toolbar: React.FC<{ url: string; t: number }> = ({ url }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: WIN_W, height: BAR_H, background: "#f1ece7", borderBottom: "1px solid #e2d9d1", display: "flex", alignItems: "center", gap: 18, padding: "0 20px", boxSizing: "border-box", direction: "ltr" }}>
    <div style={{ display: "flex", gap: 9 }}>
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
        <div key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />
      ))}
    </div>
    <div style={{ display: "flex", gap: 14, opacity: 0.45 }}>
      <Icon name="chevron-left" size={18} color="#3b2f2c" />
      <Icon name="chevron-left" size={18} color="#3b2f2c" style={{ transform: "scaleX(-1)" }} />
    </div>
    <div style={{ flex: 1, height: 32, borderRadius: 16, background: "#fff", border: "1px solid #e2d9d1", display: "flex", alignItems: "center", gap: 10, padding: "0 16px", fontFamily: LATIN_FONT, fontSize: 16, color: "#3b2f2c", maxWidth: 760 }}>
      <Icon name="lock" size={14} color="#7d716c" />
      <span>{url}</span>
    </div>
  </div>
);

/** The browser: toolbar, the recording under a moving camera, and everything drawn over it. */
const camTransform = (c: Cam) => `translate(${VIEW_W / 2}px, ${VIEW_H / 2}px) scale(${c.z}) translate(${-c.x}px, ${-c.y}px)`;

export const BrowserWindow: React.FC<{ t: number }> = ({ t }) => {
  const { cur, prev, mix } = shotsAt(t);
  const cam = cameraAt(cur.scene, t);
  const layer: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: VIEW_W, height: VIEW_H, transformOrigin: "0 0" };
  return (
    <div style={{ position: "absolute", inset: 0, borderRadius: 14, overflow: "hidden", background: "#ffffff" }}>
      <Toolbar url={cur.url(videoAt(cur, t))} t={t} />
      <div style={{ position: "absolute", left: 0, top: BAR_H, width: VIEW_W, height: VIEW_H, overflow: "hidden", background: "#fff" }}>
        {prev ? (
          <div style={{ ...layer, transform: camTransform(cameraAt(prev.scene, t)) }}>
            <ClipFrame shot={prev} t={t} />
          </div>
        ) : null}
        <div style={{ ...layer, transform: camTransform(cam) }}>
          <ClipFrame shot={cur} t={t} opacity={mix} />
          <SelectMenu t={t} />
          <Spotlights t={t} z={cam.z} />
          <Keycaps t={t} z={cam.z} />
          <Toasts t={t} z={cam.z} />
          <Cursor t={t} z={cam.z} />
        </div>
        <SpeedBadge t={t} shot={cur} />
      </div>
      <div style={{ position: "absolute", inset: 0, borderRadius: 14, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.10)", pointerEvents: "none" }} />
    </div>
  );
};

export const BROWSER_SIZE = { w: WIN_W, h: WIN_H };
