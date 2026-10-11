import React from "react";
import { HEADING_FONT, LATIN_FONT, UI_FONT } from "../lib/fonts";
import { DURATION, E, S, cue as C } from "../lib/timeline";
import { easeInOutCubic, easeOutCubic, prog, rand } from "../lib/time";
import { Icon } from "../ui/kit";
import { FILM } from "../ui/theme";
import { ClipFrame } from "./Browser";
import { SHOTS, T } from "./director";
import { ClientCard } from "./Intro";
import { H, W } from "./layout";
import { Logo, sheenAt } from "./Logo";

export const O = {
  start: () => T.tourEnd,
  tips: S("tips") - 0.3,
  gptCard: C("tips", "خطة") - 0.2,
  claudeCard: C("tips", "Claude") - 0.2,
  guide: S("outro1") - 0.35,
  url: C("outro1", "الرابط") - 0.1,
  gather: E("outro1") + 0.2,
  logo: S("outro2") + 0.05,
  tagline: C("outro2", "المكتبة"),
  end: DURATION,
};

/** Where the browser goes as the stage gives way to the night (applied by the Film). */
export const outroFrame = (t: number) => {
  const a = prog(t, O.start(), O.start() + 0.9, easeInOutCubic);
  return { dx: -a * 380, dy: a * 30, scale: 1 - 0.18 * a, opacity: 1 - prog(t, O.start() + 0.2, O.start() + 0.85) };
};

/** Particles that pour out of the outro and gather into the final logo (as in the launch films). */
const GatherSparks: React.FC<{ t: number }> = ({ t }) => {
  const g0 = O.gather;
  if (t < g0 - 0.1 || t > O.logo + 0.4) return null;
  const items: React.ReactNode[] = [];
  for (let i = 0; i < 90; i++) {
    const a0 = rand(i * 1.7) * Math.PI * 2;
    const r0 = (0.35 + 0.65 * rand(i * 2.9)) * Math.max(W, H) * 0.55;
    const g = prog(t, g0 + rand(i * 3.3) * 0.3, O.logo - 0.05, easeInOutCubic);
    const ang = a0 + g * 2.2;
    const r = r0 * (1 - g);
    const appear = prog(t, g0 + rand(i) * 0.25, g0 + 0.3 + rand(i) * 0.25);
    const w = 5 + 8 * rand(i * 5.5);
    const h = 30 + 60 * rand(i * 6.1);
    items.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: W / 2 + Math.cos(ang) * r - w / 2,
          top: H / 2 + Math.sin(ang) * r * 0.75 - h / 2,
          width: w,
          height: h,
          borderRadius: w * 0.35,
          background: ["#ae4721", "#e16e4a", "#c98a5c", "#dcb48e"][i % 4],
          opacity: appear * (1 - prog(t, O.logo - 0.15, O.logo + 0.1)) * 0.85,
          transform: `rotate(${(rand(i * 9) - 0.5) * 30 + g * 90}deg) scale(${1 - 0.7 * g})`,
        }}
      />,
    );
  }
  return <>{items}</>;
};

/** The aljam3.com/mcp page from the opening, now as the place to find the full guide. */
const GuidePage: React.FC<{ a: number }> = ({ a }) => {
  const w = 900;
  const k = w / 1280;
  const site = SHOTS[0];
  return (
    <div style={{ width: w, borderRadius: 16, overflow: "hidden", background: "#fff", boxShadow: "0 50px 120px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)", opacity: a, transform: `translateY(${(1 - a) * 60}px)` }}>
      <div style={{ height: 52, background: "#f1ece7", display: "flex", alignItems: "center", gap: 14, padding: "0 18px", direction: "ltr", borderBottom: "1px solid #e2d9d1" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{ flex: 1, height: 32, borderRadius: 16, background: "#fff", border: "1px solid #e2d9d1", display: "flex", alignItems: "center", gap: 10, padding: "0 14px", fontFamily: LATIN_FONT, fontSize: 17, color: "#3b2f2c" }}>
          <Icon name="lock" size={14} color="#7d716c" />
          <span>aljam3.com/mcp</span>
        </div>
      </div>
      <div style={{ position: "relative", width: w, height: 800 * k, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1280, height: 800, transformOrigin: "0 0", transform: `scale(${k})` }}>
          <ClipFrame shot={site} t={site.f0} />
        </div>
      </div>
    </div>
  );
};

export const OutroForeground: React.FC<{ t: number }> = ({ t }) => {
  if (t < O.start()) return null;
  const tips = prog(t, O.tips, O.tips + 0.6, easeOutCubic) * (1 - prog(t, O.guide - 0.3, O.guide + 0.2, easeInOutCubic));
  const cards = [prog(t, O.gptCard - 0.2, O.gptCard + 0.4, easeOutCubic), prog(t, O.claudeCard - 0.2, O.claudeCard + 0.4, easeOutCubic)];
  const gatherOut = prog(t, O.gather, O.gather + 0.65, easeInOutCubic);
  const guide = prog(t, O.guide, O.guide + 0.7, easeOutCubic) * (1 - gatherOut);
  const url = prog(t, O.url - 0.1, O.url + 0.5, easeOutCubic) * (1 - gatherOut);
  const logoT = t - O.logo;
  const tagline = prog(t, O.tagline - 0.2, O.tagline + 0.5, easeOutCubic);
  const foot = prog(t, E("outro2") - 0.2, E("outro2") + 0.5, easeOutCubic);
  const endFade = prog(t, O.end - 0.55, O.end - 0.02, easeInOutCubic);
  return (
    <div style={{ position: "absolute", inset: 0, direction: "rtl" }}>
      {tips > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 230, opacity: tips, transform: `translateY(${(1 - tips) * 20}px)` }}>
          <div style={{ textAlign: "center", fontFamily: HEADING_FONT, fontSize: 76, color: "#f6eee7" }}>إن لم تجد الخيار</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, marginTop: 56 }}>
            <ClientCard title="ChatGPT" sub="على الويب. يعتمد التوفّر على حسابك وصلاحيات مساحة العمل." icon="message-square-text" a={cards[0]} width={1040} />
            <ClientCard title="Claude" sub="يسمح الحساب المجاني بموصّل مخصّص واحد، وفي Team وEnterprise يضيفه مالك المساحة أولًا." icon="sparkles" a={cards[1]} width={1040} />
          </div>
        </div>
      ) : null}
      {guide > 0 && gatherOut < 1 ? (
        <>
          <div style={{ position: "absolute", left: 110, top: 175, transform: `scale(${1 - 0.5 * gatherOut})` }}>
            <GuidePage a={guide} />
          </div>
          <div style={{ position: "absolute", left: 1090, width: 720, top: 360, textAlign: "right", opacity: url, transform: `translateY(${(1 - url) * 20}px)` }}>
            <div style={{ fontFamily: HEADING_FONT, fontSize: 52, color: FILM.ember }}>الرابط والدليل الكامل</div>
            <div style={{ fontFamily: LATIN_FONT, fontSize: 76, color: "#f6eee7", direction: "ltr", fontWeight: 600, letterSpacing: -1.5, marginTop: 10, textAlign: "right" }}>aljam3.com/mcp</div>
            <div style={{ display: "flex", gap: 14, marginTop: 30, justifyContent: "flex-start" }}>
              {[
                { icon: "users", label: "دون حساب" },
                { icon: "lock", label: "دون مفتاح" },
                { icon: "book-open", label: "للقراءة فقط" },
              ].map((c) => (
                <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 20px", borderRadius: 999, border: "1.5px solid rgba(225,110,74,0.5)", color: "#f6eee7", fontFamily: UI_FONT, fontSize: 28 }}>
                  <Icon name={c.icon} size={22} color={FILM.ember} />
                  {c.label}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
      <GatherSparks t={t} />
      {logoT > -0.3 ? (
        <div style={{ position: "absolute", inset: 0 }}>
          <div
            style={{
              position: "absolute",
              left: W / 2 - 240,
              top: H / 2 - 240 - 80,
              width: 480,
              height: 480,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(225,110,74,0.32) 0%, rgba(225,110,74,0) 65%)",
              opacity: prog(t, O.logo - 0.2, O.logo + 0.4),
              transform: `scale(${0.6 + 0.5 * prog(t, O.logo - 0.2, O.logo + 1.2, easeOutCubic)})`,
            }}
          />
          <div style={{ position: "absolute", left: W / 2 - 230, top: H / 2 - 230 }}>
            <Logo id="outro-logo" width={460} color={FILM.ember} write={logoT} sheen={sheenAt(t, O.logo + 1.3)} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: H / 2 + 170, textAlign: "center", opacity: tagline, transform: `translateY(${(1 - tagline) * 18}px)`, filter: `blur(${(1 - tagline) * 6}px)` }}>
            <div style={{ fontFamily: HEADING_FONT, fontSize: 74, color: "#f6eee7" }}>المكتبة بين يديك ويدي مساعدك</div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: H / 2 + 300, textAlign: "center", opacity: foot, transform: `translateY(${(1 - foot) * 14}px)` }}>
            <div style={{ fontFamily: LATIN_FONT, fontSize: 38, color: FILM.ember, direction: "ltr", fontWeight: 600, letterSpacing: -0.5 }}>aljam3.com/mcp</div>
            <div style={{ fontFamily: LATIN_FONT, fontSize: 24, color: "#b9aca5", marginTop: 12, direction: "ltr" }}>{"ChatGPT   ·   Claude   ·   MCP"}</div>
          </div>
        </div>
      ) : null}
      {endFade > 0 ? <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${endFade})` }} /> : null}
    </div>
  );
};

export const outroNight = (t: number) => prog(t, O.start() + 0.1, O.start() + 1.0, easeInOutCubic);
