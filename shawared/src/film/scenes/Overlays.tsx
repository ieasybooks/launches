import React from "react";
import { Img, staticFile } from "remotion";
import { UI, UI_MEDIUM, UI_SEMI, VERSE_BOLD, fontsLoaded } from "../../lib/fonts";
import { clamp, ease, lerp, life, ramp, spr, useStage } from "../../lib/motion";
import { DAY, NIGHT, mix } from "../../theme";
import { useFilm } from "../context";
import { Diamond, Lockup, markDot } from "../parts/Brand";
import { bayt1 } from "../shots";
import { stageCam } from "./Stage";

// What sits over and around the phone: the verse's credit, the diamond that leaves «المها» and becomes the mark's
// dot, the name, the verbs (hear, read, understand), the oryx, and the night's caption.

/** A line's width in the film's fonts (canvas metrics; kept once the face has loaded). */
const widths = new Map<string, number>();
let ctx2d: CanvasRenderingContext2D | null = null;
const textWidth = (text: string, family: string, size: number) => {
  const key = `${family}|${size}|${text}`;
  const hit = widths.get(key);
  if (hit !== undefined) return hit;
  if (typeof document === "undefined") return text.length * size * 0.55;
  ctx2d ??= document.createElement("canvas").getContext("2d");
  if (!ctx2d) return text.length * size * 0.55;
  ctx2d.font = `${size}px ${family}`;
  const w = ctx2d.measureText(text).width;
  if (fontsLoaded()) widths.set(key, w);
  return w;
};

export const Overlays: React.FC = () => {
  const film = useFilm();
  const { T, W, L, lang, copy, dir } = film;
  const { t } = useStage();
  if (t > W.night[1] + 0.5) return null;
  const rtl = lang === "ar";
  const cam = stageCam(t, film);
  const toFrame = (x: number, y: number) => ({ x: cam.X + (x - cam.fx) * cam.s, y: cam.Y + (y - cam.fy) * cam.s });
  const b1 = bayt1(lang, "p1");
  const maha = b1.words.find((w) => w.node.text.includes("المَها"))!.node;

  // ---- the credit under the opening verse -------------------------------------------------------------
  const rowBottom = toFrame(b1.row.cx, b1.row.y + b1.row.h);
  const credit = life(t, T.rec1 - 0.2, T.brand - 0.2, 0.6, 0.45) * (1 - ramp(t, T.maha - 0.2, 0.3) * 0.65);

  // ---- the diamond -----------------------------------------------------------------------------------
  const lockTop = L.lockY;
  const markLeft = L.cx - L.lockMark / 2;
  const dot0 = markDot(L.lockMark, 0);
  const born = T.maha + 0.25;
  const leave = T.brand - 0.15;
  const land = T.name - 0.02;
  const under = toFrame(maha.x + maha.w / 2, maha.y + maha.h + 9);
  const fly = ramp(t, leave, Math.max(0.3, land - leave), ease.inOut);
  const target = { x: markLeft + dot0.x, y: lockTop + dot0.y };
  // an arc: up and over, toward the mark
  const dx = lerp(under.x, target.x, fly);
  const dy = lerp(under.y, target.y, fly) - Math.sin(fly * Math.PI) * 120;
  const dr = lerp(9, dot0.r, fly) * ease.outBack(clamp(ramp(t, born, 0.35)));
  const showDiamond = t >= born && t < land;

  // ---- the name ---------------------------------------------------------------------------------------
  const lockOut = ramp(t, T.hearStart - 0.55, 0.5, ease.inOut);
  const lockVis = t >= T.brand - 0.3 && lockOut < 1;

  // ---- verbs ---------------------------------------------------------------------------------------
  const verbAt = [T.hear, T.follow, T.tap + 0.05];
  const verbsVis = 1 - ramp(t, T.oryx - 0.35, 0.35, ease.inOut); // the oryx takes their place

  // ---- the oryx ----------------------------------------------------------------------------------------
  const oryx = life(t, T.oryx - 0.3, T.poets - 0.05, 0.45, 0.45);
  const push = ramp(t, T.eyes - 0.2, 1.6, ease.inOut);
  const oryxBox = L.tall ? { x: 90, y: 250, w: 900, h: 560 } : L.wide ? { x: L.side!.x + (rtl ? 20 : 0), y: 150, w: 660, h: 780 } : { x: L.side!.x + (rtl ? 30 : 0), y: 230, w: 350, h: 600 };

  // ---- night captions --------------------------------------------------------------------------------
  const offCap = life(t, T.offline - 0.1, W.night[1], 0.3, 0.3);

  // each verb rises in on its word and takes the emphasis from the one before, which steps back (a crossfade)
  const emph = (i: number) => ramp(t, verbAt[i] - 0.12, 0.32, ease.inOut) * (i + 1 < verbAt.length ? 1 - ramp(t, verbAt[i + 1] - 0.12, 0.32, ease.inOut) : 1);
  const verbStyle = (i: number): React.CSSProperties => {
    const k = spr(t, verbAt[i] - 0.08, { damping: 15, stiffness: 200 });
    const e = emph(i);
    return {
      fontFamily: UI_SEMI, fontSize: L.verbs.size, lineHeight: 1.3, whiteSpace: "nowrap",
      color: mix(DAY.muted, DAY.fg, e), opacity: clamp(k * 1.4) * (0.55 + 0.45 * e),
      transform: `translateY(${(1 - k) * 26}px)`,
    };
  };
  // 9:16: one centred row that glides to its new centre as each verb arrives (nothing jumps)
  const gapV = 30;
  const vw0 = copy.verbs.map((v) => textWidth(v, UI_SEMI, L.verbs.size));
  const fit = Math.min(1, 960 / (vw0.reduce((a, b) => a + b, 0) + gapV * (vw0.length - 1)));
  const vw = vw0.map((w) => w * fit);
  const arrive = verbAt.map((at) => ramp(t, at - 0.12, 0.5, ease.inOut));
  const rowW = vw.reduce((sum, w, i) => sum + arrive[i] * (w + (i ? gapV : 0)), 0);
  const startEdge = (1080 + (rtl ? rowW : -rowW)) / 2;
  const verbX = (i: number) => vw.slice(0, i).reduce((sum, w) => sum + w + gapV, 0);

  return (
    <>
      {credit > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: rowBottom.y + (L.tall ? 70 : L.wide ? 40 : 46), textAlign: "center", direction: dir, opacity: credit }}>
          <div style={{ fontFamily: UI_MEDIUM, fontSize: L.tall ? 40 : L.wide ? 36 : 34, color: DAY.fg }}>{copy.poet}</div>
          <div style={{ fontFamily: UI, fontSize: L.tall ? 31 : L.wide ? 29 : 27, color: DAY.muted, marginTop: L.tall ? 26 : 20 }}>{copy.reciter}</div>
        </div>
      )}
      {showDiamond && <Diamond cx={dx} cy={dy} r={dr} color={DAY.accent} />}
      {lockVis && (
        <div style={{ position: "absolute", left: 0, right: 0, top: lockTop, display: "flex", justifyContent: "center", opacity: 1 - lockOut, transform: `translateY(${-lockOut * 60}px)` }}>
          <Lockup t={t} at={T.brand - 0.05} tagAt={T.tagline} mark={L.lockMark} lang={lang} tagline={copy.tagline} dotArrive={land} />
        </div>
      )}
      {verbsVis > 0 && t > T.hear - 0.2 && (
        L.tall ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: L.verbs.top, direction: dir, opacity: verbsVis }}>
            {copy.verbs.map((v, i) =>
              t >= verbAt[i] - 0.1 ? (
                <span key={i} style={{ ...verbStyle(i), position: "absolute", top: 0, fontSize: L.verbs.size * fit, ...(rtl ? { right: 1080 - startEdge + verbX(i) } : { left: startEdge + verbX(i) }) }}>{v}</span>
              ) : null,
            )}
          </div>
        ) : (
          // 4:5 and 16:9: a column in the middle of the space beside the phone, its lines from the reading side
          <div style={{ position: "absolute", left: L.side!.x, width: L.side!.w, top: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", direction: dir, opacity: verbsVis }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: Math.round(L.verbs.size * 0.16) }}>
              {copy.verbs.map((v, i) => <span key={i} style={{ ...verbStyle(i), visibility: t >= verbAt[i] - 0.1 ? "visible" : "hidden" }}>{v}</span>)}
            </div>
          </div>
        )
      )}
      {oryx > 0 && (
        <div style={{ position: "absolute", left: oryxBox.x, top: oryxBox.y, width: oryxBox.w, height: oryxBox.h, borderRadius: 34, overflow: "hidden", opacity: oryx, transform: `translateY(${(1 - oryx) * 30}px)`, boxShadow: "0 40px 90px -40px rgba(26,32,54,0.55)", zIndex: 5 }}>
          <Img
            src={staticFile("images/oryx.jpg")}
            style={{
              position: "absolute", width: "100%", height: "100%", objectFit: "cover",
              objectPosition: L.tall ? "55% 45%" : "57% 40%",
              transform: `scale(${lerp(L.tall ? 1.08 : L.wide ? 1.15 : 1.25, L.tall ? 2.35 : L.wide ? 2.1 : 2.2, push)})`,
              transformOrigin: L.tall ? "57.5% 46%" : "57.5% 44%",
            }}
          />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "46%", background: "linear-gradient(rgba(18,21,31,0), rgba(18,21,31,0.78))" }} />
          <div style={{ position: "absolute", left: 40, right: 40, bottom: L.tall ? 34 : 30, direction: dir, textAlign: rtl ? "right" : "left", color: "#fff" }}>
            <div style={{ fontFamily: rtl ? VERSE_BOLD : UI_SEMI, fontSize: L.tall ? (rtl ? 92 : 70) : L.wide ? (rtl ? 88 : 68) : rtl ? 72 : 56, lineHeight: rtl ? 1.35 : 1.15 }}>{copy.maha}</div>
            <div style={{ fontFamily: UI_MEDIUM, fontSize: L.tall ? 46 : L.wide ? 44 : 36, color: "rgba(255,255,255,0.9)", marginTop: rtl ? -6 : 4 }}>{copy.oryx}</div>
          </div>
        </div>
      )}
      {offCap > 0 && <NightCaption L={L} dir={dir} off={offCap} offText={copy.offline} rtl={rtl} />}
    </>
  );
};

const NightCaption: React.FC<{ L: ReturnType<typeof useFilm>["L"]; dir: "rtl" | "ltr"; off: number; offText: string; rtl: boolean }> = ({ L, dir, off, offText, rtl }) => {
  const box: React.CSSProperties = L.tall
    ? { position: "absolute", left: 0, right: 0, top: L.verbs.top, display: "flex", justifyContent: "center" }
    : { position: "absolute", left: L.side!.x, width: L.side!.w, top: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center" };
  const s = L.tall ? 64 : L.wide ? 64 : 54;
  return (
    <div style={box}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, direction: dir, opacity: off, transform: `translateY(${(1 - off) * 20}px)` }}>
        <svg width={s} height={s} viewBox="0 0 24 24" fill={NIGHT.accent}><path d="M21 15.5v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V8.5l-8 5v2l8-2.5V18.5l-2 1.5V21.5l3.5-1 3.5 1V20l-2-1.5V13z" /></svg>
        <span style={{ fontFamily: UI_SEMI, fontSize: L.tall ? 74 : L.wide ? 76 : 62, color: NIGHT.fg, whiteSpace: "nowrap" }}>{offText}</span>
      </div>
    </div>
  );
};
