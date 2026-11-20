import React from "react";
import { clamp, ease, ramp, track, useStage } from "../../lib/motion";
import { DAY, NIGHT, mix } from "../../theme";
import { useFilm } from "../context";
import { Phone, Touch, type Cam } from "../parts/Phone";
import { Shot, within, type AnyNode, type Mod } from "../parts/Shot";
import { RECS } from "../../lib/timeline";
import { bayt1, labelled, meaningCard, shotOf, textAt } from "../shots";

// The phone, from the opening's verse to the night: one continuous object. The opening's verse IS bayt 1's row
// of the app, enlarged on the same paper; the camera pulls back and the app is around it.

const REST_F = { fx: 393 / 2, fy: 852 / 2 };

/** Keeps only the subtrees at `keep` (their ancestors are drawn without their own paint); `inner` styles them. */
const isolate = (keep: string[], inner?: Mod): Mod => (n, path) => {
  if (keep.some((k) => within(path, k))) return inner?.(n, path);
  if (keep.some((k) => k.startsWith(path + "."))) return { background: "transparent", backgroundImage: "none", boxShadow: "none", border: "none", WebkitMaskImage: "none", maskImage: "none" };
  return null;
};
/** Leaves out the subtrees at `drop`; `other` styles the rest. */
const without = (drop: string[], other?: Mod): Mod => (n, path) => (drop.some((d) => within(path, d)) ? null : other?.(n, path));

const fade = (t: number, a: number, d = 0.18) => ramp(t, a, d, ease.inOut);

/** The recorded screen showing at time t: [state, from], in order. Crossfades are short (the app switches). */
const pick = (t: number, seq: [string, number][]) => {
  let cur = seq[0][0];
  let prev = seq[0][0];
  let at = -1e9;
  for (const [s, from] of seq) {
    if (t >= from) {
      prev = cur;
      cur = s;
      at = from;
    }
  }
  return { cur, prev, k: fade(t, at, 0.14) };
};


/** The camera on the phone at time t (shared with the overlays, which pin things to the phone's screen). */
export const stageCam = (t: number, film: ReturnType<typeof useFilm>): Cam => {
  const { T, L, lang, labels } = film;
  const b1 = bayt1(lang, "p1");
  const card = meaningCard(lang);
  const dl = labelled(lang, "night", labels.download, true);
  const P = L.phone;
  const v = verseBox(lang);
  // in 4:5 and 16:9 the phone keeps to its side of the frame, clear of the words beside it
  const sideX = P.X + (lang === "ar" ? -40 : 40);
  const zoomCard = L.tall ? { X: 540, Y: 1300, s: 1.95 } : L.wide ? { X: sideX, Y: 560, s: 1.17 } : { X: sideX, Y: 700, s: 1.45 };
  const zoomOryx = L.tall ? { X: 540, Y: 1420, s: 2.1 } : L.wide ? { X: sideX, Y: 600, s: 1.22 } : { X: sideX, Y: 760, s: 1.5 };
  const away = L.tall ? { X: 540, Y: 2900, s: 1.3 } : L.wide ? { X: P.X, Y: 1850, s: 0.98 } : { X: P.X, Y: 2300, s: 1.2 };
  return track(t, [
    { at: 0, dur: 0, X: L.hook.X, Y: L.hook.Y, s: L.hook.s, fx: v.cx, fy: v.cy },
    // a slow push in while he recites
    { at: T.rec1 - 0.3, dur: T.rec1End - T.rec1 + 1.5, X: L.hook.X, Y: L.hook.Y, s: L.hook.s * 1.045, fx: v.cx, fy: v.cy },
    { at: T.brand - 0.35, dur: 0.9, X: L.brandVerse.X, Y: L.brandVerse.Y, s: L.brandVerse.s, fx: v.cx, fy: v.cy },
    { at: T.hearStart - 0.5, dur: 1.3, X: P.X, Y: P.Y, s: P.s, ...REST_F },
    // closer to the verses while bayt 2 is recited
    { at: T.rec2 - 0.2, dur: T.rec2End - T.rec2 + 0.4, X: P.X, Y: L.tall ? P.Y - 30 : P.Y, s: P.s * 1.09, fx: 196.5, fy: 390 },
    { at: T.tapWord + 0.25, dur: 0.9, ...zoomCard, fx: card.cx, fy: card.cy - 60 },
    { at: T.oryx - 0.45, dur: 0.8, ...zoomOryx, fx: card.cx, fy: card.cy },
    // to the eras (the phone sinks away), then back with the library's tabs
    { at: T.poets - 0.3, dur: 0.7, ...away, ...REST_F },
    { at: T.byPoet - 0.35, dur: 0.75, X: P.X, Y: P.Y, s: P.s, ...REST_F },
    // the download button, close
    L.tall
      ? { at: T.download + 0.05, dur: 0.6, X: 540, Y: 1160, s: 1.9, fx: dl.cx + (lang === "ar" ? 60 : -60), fy: dl.cy + 40 }
      : { at: T.download + 0.05, dur: 0.6, X: sideX, Y: L.wide ? 600 : 760, s: L.wide ? 1.2 : 1.48, fx: 393 / 2, fy: dl.cy + 160 },
    // and away, before the words of the end
    { at: T.nightEnd + 0.02, dur: 0.62, ...away, ...REST_F },
  ] as ({ at: number; dur: number } & Cam)[]) as Cam;
};

export const Stage: React.FC = () => {
  const film = useFilm();
  const { T, W, L, lang, labels } = film;
  const { t } = useStage();
  const [a] = W.opening;
  const [, nightEnd] = W.night;
  if (t < a || t > nightEnd + 0.6) return null;
  const rtl = lang === "ar";
  const b1 = bayt1(lang, "p1");
  const card = meaningCard(lang);
  const play = labelled(lang, "p1", labels.play);
  const dl = labelled(lang, "night", labels.download, true);
  const tabRec = textAt(lang, "poets", labels.reciters);

  const cam = stageCam(t, film);

  // ---- the opening: bayt 1 alone, then the app around it -----------------------------------------------
  const iso = 1 - ramp(t, T.hearStart - 0.45, 1.0, ease.inOut); // 1 = only the verse is drawn
  const frame = 1 - iso;
  const askK = ramp(t, T.maha - 0.05, 0.35); // the question: every word but «المها» steps back
  const askOut = ramp(t, T.hearStart - 0.6, 0.6);
  const ask = askK * (1 - askOut);
  const recK = (w: { s: number }) => ramp(t, w.s - 0.04, 0.16);
  const words = T.words1;
  const ajuzStart = words.find((w) => w.a.startsWith("1.2."))!.s;
  const wordColor = (i: number, half: 1 | 2) => {
    const w = words[i];
    let lit = recK(w);
    if (half === 1) lit *= 1 - ramp(t, ajuzStart - 0.1, 0.35);
    // after the recitation the app holds bayt 1's second half lit (the paused state), as the opening left it;
    // the question lights «المها» again
    if (w.a === "1.1.2") lit = Math.max(lit, ask);
    return mix(DAY.fg, DAY.accent, lit);
  };
  const wordOpacity = (i: number) => (words[i].a === "1.1.2" ? 1 : 1 - 0.72 * ask);
  const mahaLift = ask;
  const verseMod: Mod = (n, path) => {
    const wi = b1.words.findIndex((w) => w.path === path);
    if (wi >= 0) {
      const w = b1.words[wi];
      const say = recK(words[wi]) * (1 - ramp(t, words[wi].e + 0.05, 0.3));
      return { color: wordColor(wi, w.half), opacity: wordOpacity(wi), transform: `translateY(${-3 * say - 4 * (words[wi].a === "1.1.2" ? mahaLift : 0)}px)` };
    }
    if (b1.other.includes(path)) return { opacity: frame };
    if (b1.marks.some((m) => within(path, m))) {
      // the gloss marks: «المها»'s draws in with the question, the others with the app
      const isMaha = b1.words.some((w) => w.node.text.includes("المَها") && n.y > w.node.y && n.y < w.node.y + w.node.h + 12 && n.x > w.node.x - 6 && n.x < w.node.x + w.node.w + 6);
      const k = isMaha ? Math.max(frame, ask) : frame;
      return { opacity: k, transform: `scaleX(${isMaha ? Math.max(frame, ramp(t, T.maha + 0.05, 0.4)) : 1})`, transformOrigin: rtl || true ? "right" : "left" };
    }
    if (path === b1.row.path) return { background: "transparent", border: "1px solid transparent", boxShadow: "none" };
    return undefined;
  };
  // the row's own card (the playing bayt's background) comes in with the app
  const rowCard = b1.node;

  // ---- the app's screens, in order ------------------------------------------------------------------
  const seq: [string, number][] = [
    ["p1", -1],
    ["b2a", T.play + 0.12],
    ["b2b", T.rec2 + (12.5 - RECS.b2.from)],
    ["b2c", T.rec2 + (14.5 - RECS.b2.from)],
    ["b2ajuz", T.rec2Ajuz - 0.04],
    ["poets", T.byPoet - 0.3],
    ["reciters", T.byReciter + 0.02],
    ["night", T.night - 0.75],
  ];
  const now = pick(t, seq);
  // the notes rise over the page when the word is tapped; they are put away while the phone is out of frame
  const sheetUp = ramp(t, T.tapWord + 0.05, 0.5, ease.outQuint) * (t < T.poets + 0.5 ? 1 : 0);
  const sheetShot = shotOf(lang, "sheet");
  const sheetNode = sheetShot.root;
  const sheetPath = findSheet(sheetNode);
  const playerPath = findPlayer(sheetNode);
  // English pages scroll their verses as the recitation moves on: glide between the recorded positions
  const scrollMod = scrollFrom(lang, now.prev, now.cur, now.k);

  const night = ramp(t, T.night - 0.75, 0.4);
  const tone: "light" | "dark" = night > 0.5 ? "light" : "dark";

  // ---- download ----------------------------------------------------------------------------------
  const dlTap = T.download + 0.3;
  const dlProg = ramp(t, dlTap + 0.15, 1.1, ease.inOut);
  const dlDone = t >= dlTap + 1.3;

  const screen = (state: string, mod?: Mod) => <Shot shot={shotOf(lang, state)} mod={mod} />;
  const dlMod: Mod = (n, path) => {
    const box = labelled(lang, "night", labels.download, true);
    if (n.t === "svg" && within(path, box.path) && t > dlTap) return { opacity: 0 };
    return undefined;
  };
  // the player's equalizer bars move while the recitation plays (the app animates them; the capture froze them)
  const eqMod: Mod = (n, path) => {
    if (n.t !== "box" || !n.transform || !/^matrix\(1, 0, 0, [0-9.]+, 0, 0\)$/.test(n.transform)) return undefined;
    const seed = path.split(".").reduce((a, x) => a * 31 + Number(x), 7) % 97;
    const k = 0.3 + 0.7 * Math.abs(Math.sin(t * (4.2 + (seed % 5) * 0.55) + seed));
    return { transform: `scaleY(${k.toFixed(3)})` };
  };
  const both = (...mods: (Mod | undefined)[]): Mod => (n, path) => {
    let out: React.CSSProperties | undefined;
    for (const m of mods) {
      const r = m?.(n, path);
      if (r === null) return null;
      if (r) out = { ...out, ...r };
    }
    return out;
  };
  const layer = (state: string) => {
    if (state === "p1") return screen(state, scrollMod(state));
    if (state === "night") return screen(state, both(dlMod, eqMod));
    return screen(state, both(scrollMod(state), eqMod));
  };

  return (
    <>
      <Phone cam={cam} frame={frame} rtl={rtl} tone={tone} screenBg={frame < 1 ? "transparent" : night > 0.5 ? NIGHT.bg : DAY.bg} airplane={ramp(t, T.offline - 0.1, 0.3)} shadow={frame}>
        {/* the opening: the page around the verse comes in with the app */}
        {iso > 0 && (
          <>
            <div style={{ position: "absolute", inset: 0, opacity: frame }}>{screen("p1", without([b1.row.path]))}</div>
            {/* the row's card, under its words */}
            <div style={{ position: "absolute", left: rowCard.x, top: rowCard.y, width: rowCard.w, height: rowCard.h, borderRadius: rowCard.radius, background: rowCard.bg, border: rowCard.border ? `1px solid ${rowCard.border[0].color}` : undefined, boxSizing: "border-box", opacity: frame }} />
            {screen("p1", isolate([b1.row.path], verseMod))}
          </>
        )}
        {iso <= 0 && (
          <>
            {now.k < 1 && <div style={{ position: "absolute", inset: 0 }}>{layer(now.prev)}</div>}
            <div style={{ position: "absolute", inset: 0, opacity: now.k }}>{layer(now.cur)}</div>
            {sheetUp > 0 && (
              <Shot
                shot={sheetShot}
                mod={isolate([sheetPath, playerPath], (n, path) => (within(path, sheetPath) && path === sheetPath ? { transform: `translateY(${(1 - sheetUp) * 600}px)` } : undefined))}
              />
            )}
          </>
        )}
        {/* touches */}
        <Touch x={play.cx} y={play.cy} t={t} at={T.play} />
        <Touch x={wordAt(lang).cx} y={wordAt(lang).cy} t={t} at={T.tapWord} />
        <Touch x={tabRec.cx} y={tabRec.cy - 14} t={t} at={T.byReciter} />
        <Touch x={dl.cx} y={dl.cy} t={t} at={dlTap} dark />
        {/* the download: its ring fills, then the icon says it's on the phone */}
        {t > dlTap && t < nightEnd + 1 && <DownloadMark x={dl.cx} y={dl.cy} p={dlProg} done={dlDone} />}
      </Phone>
    </>
  );
};

/** The middle of bayt 1's words (the opening's verse), in the recorded page. */
export const verseBox = (lang: "ar" | "en") => {
  const ws = bayt1(lang, "p1").words.map((w) => w.node);
  const x0 = Math.min(...ws.map((w) => w.x)), x1 = Math.max(...ws.map((w) => w.x + w.w));
  const y0 = Math.min(...ws.map((w) => w.y)), y1 = Math.max(...ws.map((w) => w.y + w.h));
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 };
};

/** Bayt 1's «المها» in the page under the notes (b2c), where the finger taps. */
const wordAt = (lang: "ar" | "en") => labelled(lang, "b2c", "المَها");

const findSheet = (root: AnyNode): string => {
  // the notes' sheet: the raised card with rounded top corners and a shadow
  const hit = findFirst(root, (n) => n.t === "box" && !!n.shadow && !!n.radius && n.radius.startsWith("22px 22px 0px"));
  return hit ?? "none";
};
const findPlayer = (root: AnyNode): string => {
  const hit = findFirst(root, (n) => n.t === "box" && n.bg === "rgb(251, 249, 244)" && n.y > 600 && n.h > 150);
  return hit ?? "none";
};
const findFirst = (n: AnyNode, pred: (n: AnyNode) => boolean, path = "r"): string | null => {
  if (pred(n)) return path;
  if (n.t === "box" && n.kids) {
    for (let i = 0; i < n.kids.length; i++) {
      const r = findFirst(n.kids[i], pred, `${path}.${i}`);
      if (r) return r;
    }
  }
  return null;
};

/** The verse list's offset between two recorded screens, glided over the switch (`k` 0 → 1). */
const scrollFrom = (lang: "ar" | "en", prev: string, cur: string, k: number) => (state: string): Mod | undefined => {
  if (prev === cur || state !== cur) return undefined;
  let dy = 0;
  try {
    const a = labelled(lang, prev, lang === "ar" ? "البيت ٢" : "Verse 2");
    const b = labelled(lang, cur, lang === "ar" ? "البيت ٢" : "Verse 2");
    dy = a.y - b.y;
  } catch {
    return undefined;
  }
  if (Math.abs(dy) < 1) return undefined;
  const verses = labelled(lang, cur, "verses");
  const off = dy * (1 - ease.inOut(clamp(k)));
  return (_n, path) => (path.startsWith(verses.path + ".") && path.split(".").length === verses.path.split(".").length + 1 ? { transform: `translateY(${off}px)` } : undefined);
};

const DownloadMark: React.FC<{ x: number; y: number; p: number; done: boolean }> = ({ x, y, p, done }) => {
  const size = 36;
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, zIndex: 24 }}>
      {!done && (
        <svg width={size} height={size} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} stroke={NIGHT.line} strokeWidth={2} fill="none" />
          <circle cx={size / 2} cy={size / 2} r={r} stroke={NIGHT.accent} strokeWidth={2} fill="none" strokeLinecap="round" strokeDasharray={`${c * Math.max(0.02, p)} ${c}`} />
        </svg>
      )}
      <svg width={done ? 20 : 14} height={done ? 20 : 14} viewBox="0 0 24 24" style={{ position: "absolute", left: size / 2 - (done ? 10 : 7), top: size / 2 - (done ? 10 : 7) }}>
        {done ? (
          <path fill="none" stroke={NIGHT.accent} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.9} d="M5 19.5h14M7.5 11.5l3.2 3.2 6-6.2" />
        ) : (
          <path fill="none" stroke={NIGHT.muted} strokeLinecap="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" />
        )}
      </svg>
    </div>
  );
};

