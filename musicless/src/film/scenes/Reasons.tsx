import React from "react";
import { DISPLAY } from "../../lib/fonts";
import { clamp, ease, lerp, ramp, spr, useStage } from "../../lib/motion";
import { C } from "../../theme";
import { useFilm } from "../context";
import { Note } from "../parts/Brand";
import { Icon, type IconName } from "../parts/icons";
import { Land } from "../parts/Kinetic";
import { Rise } from "./Why";

const ICONS: IconName[] = ["monitorPlay", "gift", "wifiOff", "feather", "puzzle", "laptop"];

/** Every kind of video: a landscape frame that turns into a Short on «Shorts», then back with a live badge on
 *  «live». Drawn in ink inside the emblem's paper disc. */
const Formats: React.FC<{ t: number; d: number; at: number[]; live: string; dir: "rtl" | "ltr" }> = ({ t, d, at, live, dir }) => {
  const [, shortsAt, liveAt] = at;
  const toShort = spr(t, shortsAt - 0.12, { stiffness: 210, damping: 15 });
  const back = spr(t, liveAt - 0.12, { stiffness: 210, damping: 15 });
  const m = toShort - back; // 0 landscape, 1 a Short
  const w = lerp(0.54, 0.29, m) * d;
  const h = lerp(0.31, 0.5, m) * d;
  const stroke = 0.026 * d;
  const badge = spr(t, liveAt - 0.05, { stiffness: 300, damping: 14 });
  const pulse = 0.5 + 0.5 * Math.sin((t - liveAt) * 7);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div
        style={{
          position: "absolute", left: (d - w) / 2, top: (d - h) / 2, width: w, height: h, boxSizing: "border-box", border: `${stroke}px solid ${C.ink}`,
          borderRadius: lerp(0.06, 0.07, m) * d, display: "grid", placeItems: "center",
        }}
      >
        <svg viewBox="0 0 24 24" width={0.13 * d} height={0.13 * d} style={{ display: "block", marginLeft: 0.012 * d }}>
          <path d="M7 4.5v15l12.5-7.5z" fill={C.ink} />
        </svg>
      </div>
      {badge > 0 && (
        <div
          style={{
            position: "absolute", left: d / 2, top: (d - h) / 2 + h, transform: `translate(-50%, -50%) scale(${badge})`, display: "flex", alignItems: "center", gap: 0.025 * d,
            padding: `${0.012 * d}px ${0.04 * d}px`, borderRadius: 0.03 * d, background: C.ytRed, color: "#fff", fontFamily: DISPLAY, fontWeight: 700,
            fontSize: 0.075 * d, lineHeight: dir === "rtl" ? 1.5 : 1.25, direction: dir, whiteSpace: "nowrap", letterSpacing: dir === "ltr" ? "0.04em" : 0,
          }}
        >
          <div style={{ width: 0.04 * d, height: 0.04 * d, borderRadius: "50%", background: "#fff", opacity: 0.55 + 0.45 * pulse }} />
          {live}
        </div>
      )}
    </div>
  );
};

/** Six reasons, each landing on its spoken word into a list that stays, so the last frame sums them up. The
 *  section's title arrives large while it is spoken, then settles above the list as the first reason lands. A
 *  large emblem shows the reason being spoken. */
export const Reasons: React.FC = () => {
  const { T, W: win, L, copy, dir } = useFilm();
  const { t } = useStage();
  const [a, b] = win.reasons;
  if (t < a || t > b + 0.7) return null;
  const u = L.u;
  const rtl = L.rtl;
  const R = L.reasons;
  const n = copy.reasons.length;
  const starts = T.reasons.map((x) => x - 0.22);
  const current = starts.reduce((acc, s, i) => (t >= s ? i : acc), -1);
  const allOn = ramp(t, T.reasonsEnd - 0.1, 0.4);
  const rowH = R.rowH;
  const em = R.em;
  const chips: Record<number, { items: string[]; at: number[] }> = { 0: { items: copy.formats, at: T.formats }, [n - 1]: { items: copy.systems, at: T.systems } };

  // the title: large in the list's place while it is spoken, then up to its place above the list
  const dock = ramp(t, starts[0] - 0.42, 0.5, ease.inOut);
  const titleSize = 50 * u;
  const big = R.bigTitle / titleSize;
  const listMid = R.top + (n * rowH) / 2;
  const titleY = lerp(listMid - (titleSize * 1.3) / 2, R.titleTop, dock);
  const titleScale = lerp(big, 1, dock);

  return (
    <Rise t={t} at={a} color={C.ink} H={L.H} u={u}>
      {/* title */}
      <div
        style={{
          position: "absolute", left: R.listX, width: R.listW, top: titleY, fontFamily: DISPLAY, fontWeight: 600, fontSize: titleSize, lineHeight: 1.3,
          color: `rgba(244, 237, 224, ${lerp(1, 0.55, dock)})`, direction: dir, textAlign: rtl ? "right" : "left", letterSpacing: dir === "ltr" ? "-0.02em" : 0,
          transform: `scale(${titleScale})`, transformOrigin: rtl ? "right center" : "left center", whiteSpace: "nowrap",
        }}
      >
        <Land at={T.diff + 0.05} t={t}>{copy.reasonsTitle}</Land>
      </div>
      {/* the list */}
      {copy.reasons.map((r, i) => {
        const k = spr(t, starts[i], { stiffness: 240, damping: 18 });
        if (t < starts[i]) return null;
        const dim = i === current ? 1 : Math.max(0.5, allOn);
        const y = R.top + i * rowH;
        const chip = chips[i];
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: R.listX, top: y, width: R.listW, height: rowH, display: "flex", alignItems: "center", gap: 30 * u, direction: dir,
              opacity: clamp(k * 1.5) * dim, transform: `translateX(${(1 - k) * (rtl ? 60 : -60) * u}px)`,
            }}
          >
            <div style={{ width: 96 * u, height: 96 * u, borderRadius: "50%", background: C.paper, display: "grid", placeItems: "center", flex: "none" }}>
              <Icon name={ICONS[i]} size={50 * u} color={C.ink} stroke={2} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: R.head, color: C.paper, lineHeight: rtl ? 1.35 : 1.12, letterSpacing: dir === "ltr" ? "-0.025em" : 0, whiteSpace: "nowrap" }}>{r.head}</div>
              {!chip ? (
                <div style={{ marginTop: 6 * u, fontFamily: DISPLAY, fontWeight: 400, fontSize: R.sub, color: "rgba(244, 237, 224, 0.78)", whiteSpace: "nowrap" }}>{r.sub}</div>
              ) : (
                <div style={{ marginTop: 10 * u, display: "flex", gap: 12 * u, direction: dir }}>
                  {chip.items.map((s, j) => {
                    const p = spr(t, chip.at[j] - 0.08, { stiffness: 320, damping: 14 });
                    const isLive = i === 0 && j === 2;
                    return (
                      <div
                        key={s}
                        style={{
                          display: "flex", alignItems: "center", gap: 10 * u, fontFamily: DISPLAY, fontWeight: 500, fontSize: 29 * u, lineHeight: rtl ? 1.45 : 1.25, color: C.paper,
                          border: `${2 * u}px solid rgba(244, 237, 224, 0.5)`, borderRadius: 30 * u, padding: `${4 * u}px ${18 * u}px`, transform: `scale(${p})`, opacity: clamp(p * 2), whiteSpace: "nowrap",
                        }}
                      >
                        {isLive && <div style={{ width: 13 * u, height: 13 * u, borderRadius: "50%", background: C.ytRed, flex: "none" }} />}
                        <span style={{ direction: /[a-z]/i.test(s) ? "ltr" : dir }}>{s}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
      {/* the emblem of the reason being spoken */}
      <div style={{ position: "absolute", left: em.cx - em.d / 2, top: em.cy - em.d / 2, width: em.d, height: em.d }}>
        <div
          style={{
            position: "absolute", inset: -0.06 * em.d, borderRadius: "50%", border: `${2.5 * u}px dashed rgba(244, 237, 224, 0.28)`,
            transform: `rotate(${t * 14}deg)`, opacity: clamp(ramp(t, T.diff, 0.5)) * (1 - allOn * 0.4),
          }}
        />
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: C.paper, transform: `scale(${spr(t, T.diff, { stiffness: 140, damping: 16 })})`, overflow: "hidden" }}>
          {current < 0 && (
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: 1 - ramp(t, starts[0] - 0.1, 0.15) }}>
              <Note size={em.d * 0.46} k={ease.outQuint(ramp(t, T.diff + 0.35, 0.56, ease.linear))} />
            </div>
          )}
          {ICONS.map((icon, i) => {
            if (i !== current && !(i === current - 1 && t < starts[current] + 0.25)) return null;
            const inK = spr(t, starts[i], { stiffness: 220, damping: 14 });
            const outK = i === current ? 0 : ramp(t, starts[current], 0.22, ease.in);
            const bob = icon === "feather" ? Math.sin(t * 2.4) * 10 * u * (em.d / (440 * u)) : 0;
            return (
              <div key={icon} style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: 1 - outK, transform: `translateY(${bob - outK * 50 * u}px) scale(${0.6 + 0.4 * inK}) rotate(${(1 - inK) * (icon === "puzzle" ? -40 : -12)}deg)` }}>
                {i === 0 ? <Formats t={t} d={em.d} at={T.formats} live={copy.live} dir={dir} /> : <Icon name={icon} size={em.d * 0.44} color={C.ink} stroke={1.6} />}
              </div>
            );
          })}
        </div>
      </div>
    </Rise>
  );
};
