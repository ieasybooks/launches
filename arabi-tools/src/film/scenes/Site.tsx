import React from "react";
import { BODY, DISPLAY, MONO, TRANSCRIPT } from "../../lib/fonts";
import { clamp, ease, lerp, ramp, spr, useStage } from "../../lib/motion";
import { fileWave } from "../../lib/voice";
import transcript from "../../data/transcript.json";
import { C, LIFT } from "../../theme";
import { Logo } from "../parts/Logo";
import { Button, Cursor, FileCard, Icon, OUTLINE, Panel, Ripple, SOLID } from "../parts/kit";
import { T } from "../times";

// The transcription page, rebuilt from the site's design: steps, drop zone, progress, and the
// result with its downloads and SRT cues. The transcript is the site's real output for this
// film's narration (src/data/transcript.json).

const FILE = "أدوات-العربية.mp3";
const CUES = transcript.cues.slice(0, 3);

const click = (t: number, at: number) => ramp(t, at, 0.08) * (1 - ramp(t, at + 0.1, 0.18));

const Seal: React.FC<{ n: number; label: string; state: "todo" | "current" | "done"; size: number }> = ({ n, label, state, size }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: size * 0.2, width: size * 3 }}>
    <div
      style={{
        width: size, height: size, borderRadius: 999, display: "grid", placeItems: "center", fontFamily: MONO, fontWeight: 500, fontSize: size * 0.44,
        background: state === "current" ? C.green : state === "done" ? C.greenSoft : "transparent",
        boxShadow: state === "current" ? "none" : `inset 0 0 0 1.5px ${state === "done" ? C.green : C.gold}`,
        color: state === "current" ? "#fff" : state === "done" ? C.green : C.gold,
      }}
    >
      {n}
    </div>
    <div style={{ fontFamily: BODY, fontSize: size * 0.5, color: state === "current" ? C.text : state === "done" ? C.muted : C.faint, fontWeight: state === "current" ? 600 : 400 }}>{label}</div>
  </div>
);

const Mark: React.FC<{ k: number; children: React.ReactNode }> = ({ k, children }) => (
  <span style={{ position: "relative", display: "inline-block", padding: "0 6px" }}>
    <span style={{ position: "absolute", inset: "8% -2px", borderRadius: 8, background: C.goldSoft, transform: `scaleX(${k})`, transformOrigin: "right", zIndex: 0 }} />
    <span style={{ position: "relative", color: k > 0.5 ? C.text : undefined, fontWeight: k > 0.5 ? 600 : undefined }}>{children}</span>
  </span>
);

export const Site: React.FC = () => {
  const { W, H, P, t } = useStage();
  if (t < T.upload - 0.9 || t > T.free) return null;

  // ---- timing
  const enter = spr(t, T.upload - 0.5, { damping: 19, stiffness: 120 });
  const exit = ramp(t, T.free - 0.65, 0.5, ease.in);
  const dropAt = T.yours + 0.05;
  const go = T.uploadEnd + 0.05;
  const running = ramp(t, go + 0.2, 0.3, ease.inOut);
  const percent = Math.round(ramp(t, go + 0.45, T.download - 0.75 - (go + 0.45), ease.inOut) * 100);
  const doneAt = T.download - 0.6;
  const done = ramp(t, doneAt, 0.35, ease.inOut);
  const txtAt = T.txt - 0.05;
  const srtAt = T.srt - 0.1;
  const spread = spr(t, txtAt - 0.35, { damping: 22, stiffness: 90 });

  // ---- layout
  const cardW = P ? 960 : 1180;
  const pad = 56;
  const heights = { upload: P ? 760 : 700, running: P ? 470 : 430, done: P ? 1060 : 930 };
  const cardH = lerp(lerp(heights.upload, heights.running, running), heights.done, done);
  const cardX = (W - cardW) / 2;
  // the card stays centred (in portrait, in the upper part) while its content changes
  const cardY = (H - cardH) / 2 + (1 - enter) * 120;
  const cardScale = lerp(1, P ? 0.9 : 0.84, spread);
  const cardShift = (P ? -150 : 0) * spread;
  const toScreen = (x: number, y: number) => ({
    x: W / 2 + (cardX + x - W / 2) * cardScale,
    y: cardY + cardShift + y * cardScale,
  });

  const steps: ("todo" | "current" | "done")[] = done > 0.5 ? ["done", "done", "current"] : running > 0.5 ? ["done", "current", "todo"] : ["current", "todo", "todo"];
  const seal = P ? 62 : 60;
  const stepGap = P ? 270 : 260;

  // ---- the file being dropped
  const zone = { x: cardW / 2, y: P ? 380 : 365 };
  const zoneScreen = toScreen(zone.x, zone.y);
  const fly = ramp(t, T.raise - 0.15, dropAt - (T.raise - 0.15), ease.inOut);
  const from = P ? { x: W + 380, y: 1650 } : { x: W + 340, y: 860 };
  const ctrl = P ? { x: W * 0.75, y: 1500 } : { x: 1500, y: 960 };
  const chipX = (1 - fly) ** 2 * from.x + 2 * (1 - fly) * fly * ctrl.x + fly ** 2 * zoneScreen.x;
  const chipY = (1 - fly) ** 2 * from.y + 2 * (1 - fly) * fly * ctrl.y + fly ** 2 * zoneScreen.y;
  const sink = ramp(t, dropAt, 0.3, ease.in);
  const dropped = t >= dropAt;
  const zoneFlash = ramp(t, dropAt, 0.15) * (1 - ramp(t, dropAt + 0.5, 0.6));
  const chipW = P ? 600 : 520;

  // ---- result buttons (card coordinates)
  const btn = P
    ? { txt: { x: pad + (cardW - 2 * pad + 16) / 2, y: 340, w: (cardW - 2 * pad - 16) / 2 }, srt: { x: pad, y: 340, w: (cardW - 2 * pad - 16) / 2 } }
    : { txt: { x: pad + 376, y: 262, w: 330 }, srt: { x: pad, y: 262, w: 360 } };
  const txtC = toScreen(btn.txt.x + btn.txt.w / 2, btn.txt.y + 32);
  const srtC = toScreen(btn.srt.x + btn.srt.w / 2, btn.srt.y + 32);
  // the start button, where it was when pressed (the card shrinks right after)
  const goC = { x: W / 2, y: (H - heights.upload) / 2 + (P ? 670 : 612) };

  // ---- cursor: carries the file by its icon, then presses start and the two downloads
  const chipScale = lerp(1, 0.9, fly);
  const grab = { x: chipX + (chipW / 2 - 70) * chipScale, y: chipY - 46 * chipScale };
  const stops = [
    { at: dropAt, x: zoneScreen.x + (chipW / 2 - 70) * 0.9, y: zoneScreen.y - 46 * 0.9 },
    { at: go - 0.12, x: goC.x + 20, y: goC.y + 6 },
    { at: go + 0.5, x: goC.x + 60, y: goC.y + 90 },
    { at: txtAt - 0.1, x: txtC.x + 10, y: txtC.y + 4 },
    { at: srtAt - 0.1, x: srtC.x + 10, y: srtC.y + 4 },
    { at: srtAt + 0.6, x: srtC.x + 70, y: srtC.y + 120 },
  ];
  let cur = t < dropAt ? grab : stops[0];
  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1];
    const b = stops[i];
    if (t >= a.at) {
      const travel = Math.min(0.6, b.at - a.at);
      const k = ease.inOut(clamp((t - (b.at - travel)) / travel));
      cur = { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) };
    }
  }
  const cursorOpacity = ramp(t, T.raise - 0.2, 0.2) * (1 - ramp(t, go + 0.3, 0.3) + ramp(t, doneAt + 0.2, 0.3)) * (1 - ramp(t, srtAt + 0.5, 0.4));
  const press = Math.max(click(t, go), click(t, txtAt), click(t, srtAt));

  // ---- artifacts: the text file and a video with its subtitles
  const doc = spr(t, txtAt + 0.05, { damping: 17, stiffness: 110 });
  const vid = spr(t, srtAt + 0.05, { damping: 17, stiffness: 110 });
  const docAt = P ? { x: 290, y: 1530, r: -5 } : { x: 300, y: 610, r: -5 };
  const vidAt = P ? { x: 735, y: 1560, r: 4 } : { x: 1625, y: 660, r: 4 };
  const vidW = P ? 520 : 500;
  const subtitle = t < T.videos ? transcript.cues[0].text : transcript.cues[1].text;
  const playhead = ramp(t, srtAt + 0.4, T.free - srtAt, ease.linear);

  const limits = (
    <>
      ملف <Mark k={ramp(t, T.mp3 - 0.05, 0.3)}>MP3</Mark> أو <Mark k={ramp(t, T.m4a - 0.05, 0.3)}>M4A</Mark>، حتى 99 ميغابايت و<Mark k={ramp(t, T.hours - 0.05, 0.3)}>3 ساعات</Mark>.
    </>
  );

  const uploadBody = 1 - ramp(t, go + 0.12, 0.2, ease.inOut);
  const runBody = ramp(t, go + 0.3, 0.25, ease.inOut) * (1 - done);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: (1 - exit) * clamp(enter * 1.5), transform: `scale(${1 - 0.08 * exit})` }}>
      <div style={{ position: "absolute", left: cardX, top: cardY + cardShift, width: cardW, height: cardH, transformOrigin: `${W / 2 - cardX}px 0px`, transform: `scale(${cardScale})` }}>
        <Panel radius={36} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {/* steps */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 44, display: "flex", justifyContent: "center", direction: "rtl" }}>
            {["الرفع", "التفريغ", "التنزيل"].map((label, i) => (
              <React.Fragment key={label}>
                {i > 0 && <div style={{ width: stepGap - seal * 3 + seal, height: 1.5, marginTop: seal / 2, marginInline: -seal, background: C.gold, opacity: steps[i - 1] === "done" ? 1 : 0.5 }} />}
                <Seal n={i + 1} label={label} state={steps[i]} size={seal} />
              </React.Fragment>
            ))}
          </div>

          {/* 1. upload */}
          {uploadBody > 0 && (
            <div style={{ position: "absolute", inset: 0, opacity: uploadBody, transform: `translateY(${-30 * running}px)` }}>
              <div
                style={{
                  position: "absolute", left: pad, right: pad, top: 190, height: P ? 390 : 350, borderRadius: 26,
                  border: `2px dashed ${zoneFlash > 0.01 ? C.green : C.gold}`, background: zoneFlash > 0.01 ? `rgba(228, 237, 230, ${zoneFlash})` : "transparent",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, direction: "rtl", textAlign: "center",
                }}
              >
                <Icon d={OUTLINE.upload} size={50} color={C.gold} />
                <div style={{ fontFamily: BODY, fontSize: P ? 40 : 40, fontWeight: 600, color: C.text }}>اختر ملفًا صوتيًا، أو اسحبه وأفلته هنا</div>
                <div style={{ fontFamily: BODY, fontSize: P ? 31 : 30, color: C.muted, lineHeight: 1.6 }}>{limits}</div>
                <div style={{ fontFamily: BODY, fontSize: 28, color: dropped ? C.green : C.faint, fontWeight: dropped ? 600 : 400, marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
                  {dropped && <Icon d={SOLID.check} solid size={30} color={C.green} />}
                  {dropped ? FILE : "لم تختر ملفًا بعد."}
                </div>
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, top: (P ? 670 : 612) - 38, display: "flex", justifyContent: "center" }}>
                <Button label="ابدأ التفريغ" primary size={32} press={click(t, go)} />
              </div>
            </div>
          )}

          {/* 2. transcribing, then done */}
          {running > 0 && (
            <div style={{ position: "absolute", left: pad, right: pad, top: 190, direction: "rtl", opacity: Math.max(runBody, done), transform: `translateY(${(1 - running) * 30}px)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, height: 56 }}>
                {done > 0.5 && <Icon d={SOLID.check} solid size={40} color={C.green} />}
                <div style={{ fontFamily: BODY, fontSize: 36, fontWeight: 600, color: C.text }}>{done > 0.5 ? "اكتمل التفريغ." : "جارٍ التفريغ…"}</div>
                {done <= 0.5 && <div style={{ marginInlineStart: "auto", fontFamily: MONO, fontWeight: 500, fontSize: 36, color: C.green, fontVariantNumeric: "tabular-nums" }}>{percent}٪</div>}
              </div>
              {done <= 0.5 && (
                <>
                  <div style={{ height: 14, borderRadius: 7, background: C.well, marginTop: 22, overflow: "hidden", direction: "rtl" }}>
                    <div style={{ height: "100%", width: `${percent}%`, background: C.green, borderRadius: 7 }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 28, fontFamily: BODY, fontSize: 26, color: C.muted }}>
                    <Icon d={OUTLINE.checkCircle} size={30} color={C.gold} />
                    أبقِ هذه الصفحة مفتوحة حتى ينتهي التفريغ.
                  </div>
                </>
              )}
            </div>
          )}

          {done > 0 && (
            <div style={{ position: "absolute", inset: 0, direction: "rtl" }}>
              {(() => {
                const row = (i: number) => {
                  const s = spr(t, doneAt + 0.15 + i * 0.1, { damping: 20, stiffness: 140 });
                  return { opacity: clamp(s * 1.5), transform: `translateY(${(1 - s) * 30}px)` };
                };
                return (
                  <>
                    <div style={{ position: "absolute", right: pad, top: 268, display: "flex", alignItems: "center", gap: 12, ...row(0) }}>
                      <Icon d={SOLID.doc} solid size={36} color={C.gold} />
                      <div style={{ fontFamily: BODY, fontSize: 34, fontWeight: 600, color: C.text }}>{transcript.name}</div>
                    </div>
                    <div style={{ position: "absolute", left: btn.txt.x, top: btn.txt.y, width: btn.txt.w, display: "flex", justifyContent: "center", ...row(1) }}>
                      <Button label="تنزيل النص (TXT)" primary icon={OUTLINE.download} size={28} press={click(t, txtAt)} style={{ width: "100%", justifyContent: "center", padding: "14px 0" }} />
                    </div>
                    <div style={{ position: "absolute", left: btn.srt.x, top: btn.srt.y, width: btn.srt.w, display: "flex", justifyContent: "center", ...row(1) }}>
                      <Button label="تنزيل الترجمة (SRT)" icon={OUTLINE.download} size={28} press={click(t, srtAt)} style={{ width: "100%", justifyContent: "center", padding: "14px 0" }} />
                    </div>
                    <div style={{ position: "absolute", right: pad, top: P ? 440 : 350, fontFamily: BODY, fontSize: 25, color: C.faint, ...row(2) }}>يبقى النص متاحًا لمدة 30 دقيقة.</div>
                    <div style={{ position: "absolute", right: pad, top: P ? 500 : 405, fontFamily: DISPLAY, fontSize: 44, color: C.text, ...row(3) }}>النص</div>
                    <div
                      style={{
                        position: "absolute", left: pad, right: pad, top: P ? 580 : 480, bottom: pad, borderRadius: 22, background: C.paper,
                        boxShadow: `inset 0 0 0 1.5px ${C.lineSoft}`, padding: "6px 34px", overflow: "hidden", ...row(4),
                        WebkitMaskImage: "linear-gradient(to bottom, #000 78%, transparent)", maskImage: "linear-gradient(to bottom, #000 78%, transparent)",
                      }}
                    >
                      {CUES.map((c, i) => {
                        const s = spr(t, doneAt + 0.55 + i * 0.12, { damping: 20 });
                        return (
                          <div key={c.n} style={{ padding: "16px 0", borderTop: i ? `1.5px solid ${C.lineSoft}` : "none", opacity: clamp(s * 1.5), transform: `translateY(${(1 - s) * 20}px)` }}>
                            <div style={{ direction: "ltr", textAlign: "right", fontFamily: MONO, fontSize: 23, color: C.faint, fontVariantNumeric: "tabular-nums" }}>
                              <span style={{ display: "inline-block", minWidth: 40, marginRight: 14, color: C.gold, fontWeight: 700 }}>{c.n}</span>
                              {c.start} → {c.end}
                            </div>
                            <div style={{ fontFamily: TRANSCRIPT, fontSize: P ? 36 : 34, lineHeight: 1.8, color: C.text }}>{c.text}</div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </Panel>
      </div>

      {/* the dragged file */}
      {fly > 0 && sink < 1 && (
        <div style={{ position: "absolute", left: chipX - chipW / 2, top: chipY - 100, width: chipW, opacity: 1 - sink, transform: `scale(${lerp(1, 0.9, fly) * (1 - 0.4 * sink)}) rotate(${(1 - fly) * 6}deg)` }}>
          <FileCard name={FILE} meta="MP3 · 0:58" width={chipW} scale={P ? 1.1 : 1} heights={fileWave(2.2, 36)} />
        </div>
      )}

      {/* the text file */}
      {doc > 0 && (
        <div
          style={{
            position: "absolute", left: lerp(txtC.x, docAt.x, doc) - (P ? 160 : 170), top: lerp(txtC.y, docAt.y, doc) - (P ? 210 : 230),
            width: P ? 320 : 340, height: P ? 420 : 460, transform: `scale(${lerp(0.3, 1, doc)}) rotate(${docAt.r * doc}deg)`, opacity: clamp(doc * 3),
            background: "#fffdf8", borderRadius: 18, boxShadow: LIFT, padding: "26px 26px", direction: "rtl", overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <Icon d={SOLID.doc} solid size={32} color={C.green} />
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: C.text, direction: "ltr" }}>transcript.txt</div>
          </div>
          <div style={{ fontFamily: TRANSCRIPT, fontSize: 19, lineHeight: 1.85, color: C.muted, whiteSpace: "pre-wrap" }}>{transcript.txt}</div>
        </div>
      )}

      {/* a video with the subtitles */}
      {vid > 0 && (
        <div
          style={{
            position: "absolute", left: lerp(srtC.x, vidAt.x, vid) - vidW / 2, top: lerp(srtC.y, vidAt.y, vid) - (vidW * 9) / 32,
            width: vidW, height: (vidW * 9) / 16, transform: `scale(${lerp(0.3, 1, vid)}) rotate(${vidAt.r * vid}deg)`, opacity: clamp(vid * 3),
            borderRadius: 20, overflow: "hidden", boxShadow: LIFT, background: `radial-gradient(120% 90% at 70% 20%, #2f5a4b 0%, #173a2f 45%, #0f211b 100%)`,
          }}
        >
          <div style={{ position: "absolute", left: "50%", top: "40%", transform: "translate(-50%, -50%)", opacity: 0.18 }}>
            <Logo size={vidW * 0.32} tile="transparent" />
          </div>
          <div style={{ position: "absolute", top: 16, right: 16, padding: "4px 12px", borderRadius: 8, background: C.gold, color: "#fff", fontFamily: MONO, fontWeight: 700, fontSize: 18 }}>SRT</div>
          <div style={{ position: "absolute", left: 24, right: 24, bottom: 46, display: "flex", justifyContent: "center" }}>
            <div style={{ direction: "rtl", textAlign: "center", fontFamily: BODY, fontWeight: 600, fontSize: vidW * 0.044, lineHeight: 1.55, color: "#fff", background: "rgba(0,0,0,0.55)", padding: "4px 14px", borderRadius: 8 }}>{subtitle}</div>
          </div>
          <div style={{ position: "absolute", left: 20, right: 20, bottom: 20, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.25)" }}>
            <div style={{ width: `${playhead * 100}%`, height: "100%", borderRadius: 3, background: C.gold }} />
          </div>
        </div>
      )}

      <Ripple x={goC.x} y={goC.y} k={ramp(t, go, 0.5, ease.linear)} size={160} />
      <Ripple x={txtC.x} y={txtC.y} k={ramp(t, txtAt, 0.5, ease.linear)} size={140} />
      <Ripple x={srtC.x} y={srtC.y} k={ramp(t, srtAt, 0.5, ease.linear)} size={140} />
      {cursorOpacity > 0 && <Cursor x={cur.x} y={cur.y} size={P ? 40 : 36} press={press} opacity={cursorOpacity} />}
    </div>
  );
};
