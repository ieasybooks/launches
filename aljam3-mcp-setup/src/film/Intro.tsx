import React from "react";
import { HEADING_FONT, LATIN_FONT, UI_FONT } from "../lib/fonts";
import { cue as C, E, S } from "../lib/timeline";
import { clamp, easeInOutCubic, easeOutBack, easeOutCubic, prog } from "../lib/time";
import { Icon } from "../ui/kit";
import { FILM } from "../ui/theme";
import { T } from "./director";
import { H, W } from "./layout";
import { Logo, sheenAt } from "./Logo";

export const I = {
  logo: 0.35,
  chip: C("intro1", "MCP") - 0.1,
  q: C("intro1", "كيف") - 0.2,
  qEnd: E("intro1") - 0.2,
  title: S("intro2") - 0.15,
  step: C("intro2", "خطوة") - 0.1,
  gpt: C("intro2", "ChatGPT") - 0.15,
  claude: C("intro2", "وClaude") - 0.15,
  bloom: T.bloom,
  launch: T.launch,
};

const QUESTION = "كيف أربط خادم الجامع بمساعدي الذكي؟";

/** Radius of the paper stage opening from the centre (px). */
export const bloomRadius = (t: number) => Math.hypot(W, H) * 0.62 * prog(t, I.bloom, I.bloom + 0.9, easeInOutCubic);

export const ClientCard: React.FC<{ title: string; sub: string; icon: string; a: number; width: number }> = ({ title, sub, icon, a, width }) => (
  <div
    style={{
      width,
      boxSizing: "border-box",
      padding: "20px 26px",
      borderRadius: 22,
      background: "linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))",
      border: "1.5px solid rgba(255,255,255,0.14)",
      display: "flex",
      alignItems: "center",
      gap: 20,
      opacity: a,
      transform: `translateY(${(1 - a) * 24}px) scale(${0.96 + 0.04 * a})`,
      direction: "rtl",
    }}
  >
    <div style={{ width: 60, height: 60, borderRadius: 16, background: "rgba(225,110,74,0.16)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon name={icon} size={30} color={FILM.ember} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontFamily: LATIN_FONT, fontSize: 34, color: "#f6eee7", fontWeight: 600, letterSpacing: -0.3, lineHeight: 1.25 }}>{title}</div>
      <div style={{ fontFamily: UI_FONT, fontSize: 24, color: "#b9aca5", marginTop: 4, lineHeight: 1.45 }}>{sub}</div>
    </div>
  </div>
);

/** The night opening: the question people asked after the launch, then what this film covers. */
export const IntroForeground: React.FC<{ t: number }> = ({ t }) => {
  if (t > I.bloom + 1.0) return null;
  const up = prog(t, I.title - 0.35, I.title + 0.45, easeInOutCubic);
  const out = prog(t, I.bloom - 0.35, I.bloom + 0.25, easeInOutCubic);
  // the opening question
  const chip = prog(t, I.chip, I.chip + 0.45, easeOutCubic);
  const q = prog(t, I.q - 0.2, I.q + 0.35, easeOutCubic);
  const words = QUESTION.split(" ");
  const shown = prog(t, I.q, I.qEnd, (x) => x) * words.length;
  // the title and the two assistants
  const title = prog(t, I.title, I.title + 0.6, easeOutCubic);
  const step = prog(t, I.step, I.step + 0.45, easeOutBack(1.5));
  const cards = [prog(t, I.gpt - 0.1, I.gpt + 0.45, easeOutCubic), prog(t, I.claude - 0.1, I.claude + 0.45, easeOutCubic)];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out, direction: "rtl" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - up, transform: `translateY(${-up * 70}px)`, filter: `blur(${up * 6}px)` }}>
        <div style={{ position: "absolute", left: W / 2 - 150, top: 200 }}>
          <Logo id="intro-logo" width={300} color={FILM.ember} write={t - I.logo} sheen={sheenAt(t, I.logo + 1.4)} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 470, display: "flex", justifyContent: "center", opacity: chip, transform: `translateY(${(1 - chip) * 12}px)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 22px", borderRadius: 999, border: "1.5px solid rgba(225,110,74,0.5)", color: "#f6eee7", fontFamily: UI_FONT, fontSize: 28 }}>
            <Icon name="plug" size={22} color={FILM.ember} />
            <span>خادم</span>
            <span style={{ fontFamily: LATIN_FONT, fontWeight: 600, direction: "ltr" }}>MCP</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 600, display: "flex", justifyContent: "center", opacity: q, transform: `translateY(${(1 - q) * 30}px)` }}>
          <div
            style={{
              padding: "24px 38px",
              borderRadius: 36,
              borderTopRightRadius: 10,
              background: "rgba(255,255,255,0.09)",
              border: "1.5px solid rgba(255,255,255,0.08)",
              fontFamily: UI_FONT,
              fontSize: 50,
              lineHeight: 1.5,
              color: FILM.cream,
            }}
          >
            {words.map((w, i) => (
              <span key={i} style={{ opacity: 0.12 + 0.88 * clamp(shown - i) }}>
                {w}
                {i < words.length - 1 ? " " : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
      {title > 0 ? (
        <div style={{ position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", opacity: title, transform: `translateY(${(1 - title) * 26}px)` }}>
            <div style={{ fontFamily: UI_FONT, fontSize: 30, color: FILM.ember }}>الجامع للمساعدات الذكية</div>
            <div style={{ fontFamily: HEADING_FONT, fontSize: 100, lineHeight: 1.3, color: "#f6eee7", marginTop: 10 }}>اربط الجامع بمساعدك الذكي</div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 515, display: "flex", justifyContent: "center", opacity: clamp(step), transform: `scale(${0.8 + 0.2 * step})` }}>
            <div style={{ padding: "8px 26px", borderRadius: 999, background: "rgba(225,110,74,0.16)", color: FILM.ember, fontFamily: HEADING_FONT, fontSize: 36 }}>خطوةً خطوة</div>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", gap: 28, direction: "rtl" }}>
            <ClientCard title="ChatGPT" sub="مكوّن إضافي · خادم MCP مخصّص" icon="message-square-text" a={cards[0]} width={470} />
            <ClientCard title="Claude" sub="موصّل مخصّص" icon="sparkles" a={cards[1]} width={470} />
          </div>
        </div>
      ) : null}
    </div>
  );
};
