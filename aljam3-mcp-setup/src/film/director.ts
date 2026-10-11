/**
 * The tutorial's choreography: which recording plays when, how each click lines up with the narration,
 * and the camera, cursor, highlights and sounds laid over the real UI. Every time comes from the
 * narration (cue/S/E), so regenerating the voice keeps it in sync. Coordinates are CSS pixels of the
 * 1280 × 800 recordings; highlight boxes were measured on the recorded frames (scripts/check_boxes.py).
 */
import { cue as C, E, S } from "../lib/timeline";
import { Key, Pt, easeInOutCubic } from "../lib/time";
import { CLIP_DATA, Mark, Shot, filmAt, mark, videoAt } from "./clips";

export type Cam = { z: number; x: number; y: number };
export type Sfx = { t: number; name: string; vol: number };
export type Box = [number, number, number, number];
export type Spot = { t0: number; t1: number; box: Box; r: number };
export type Keycap = { t: number; label: string; x: number; y: number };
export type Toast = { t0: number; t1: number; label: string; x: number; y: number };

export const SHOTS: Shot[] = [];
export const CURSOR: Key<Pt>[] = [];
export const CLICKS: number[] = [];
/** One camera per scene, so a dissolve blends two independently framed views. */
export const CAMS: Record<string, Key<Cam>[]> = {};
export const SFX: Sfx[] = [];
export const SPOTS: Spot[] = [];
export const KEYCAPS: Keycap[] = [];
export const TOASTS: Toast[] = [];
export const T = {} as Record<string, number>;
/** Anchors that had to move later than the cue asked for (want = the cue). */
export const LAG: { shot: string; want: number; t: number }[] = [];
/** Length of the dissolve between scenes. */
export const DISSOLVE = 0.6;
/**
 * Instant scrolls in the recordings (the capture tool scrolled with scrollIntoView), replayed as smooth
 * scrolls: at clip time `at`, the content of `box` moved up by `dy` (measured by comparing the two frames).
 */
export const SCROLLS: Record<string, { at: number; box: Box; dy: number }[]> = { "claude-add": [{ at: 36.02, box: [388, 30, 522, 752], dy: 131 }] };

let scene = "";
const setScene = (id: string) => {
  scene = id;
  CAMS[id] ??= [];
};
const sfx = (t: number, name: string, vol: number) => SFX.push({ t, name, vol });
const cam = (t: number, z: number, x: number, y: number, d = 0.9) => CAMS[scene].push({ t, v: { z, x, y }, d, e: easeInOutCubic });
const spot = (t0: number, t1: number, box: Box, r = 8) => SPOTS.push({ t0, t1: Math.max(t1, t0 + 0.9), box, r });
const center = (b: Box) => ({ x: b[0] + b[2] / 2, y: b[1] + b[3] / 2 });
/** Camera on a box: zoom z, centred on the box (optionally nudged). */
const focus = (t: number, z: number, b: Box, d = 0.9, dx = 0, dy = 0) => cam(t, z, center(b).x + dx, center(b).y + dy, d);
const wide = (t: number, d = 0.9) => cam(t, 1, 640, 400, d);
/** The scene's camera eases back to the whole page as the next scene dissolves in at `next`. */
const leave = (next: number) => wide(next - 0.75, 1.25);

const shot = (id: string, clip: string, f0: number, v0: number, url: (v: number) => string, cut = false) => {
  const s: Shot = { id, scene, clip, f0, f1: Infinity, anchors: [{ f: f0, v: v0, lead: 0, ff: false }], url, cut };
  SHOTS.push(s);
  return s;
};
/** Pin clip time v (or a mark) to film time f; never earlier than the previous anchor allows. */
const pin = (s: Shot, f: number, v: number | Mark, lead = 0.45, ff = false, from?: number) => {
  const vt = typeof v === "number" ? v : v.t;
  const prev = s.anchors[s.anchors.length - 1];
  const t = Math.max(f, prev.f + 0.25);
  if (t > f + 0.05) LAG.push({ shot: s.id, want: f, t });
  s.anchors.push({ f: t, v: vt, lead, ff, from });
  return t;
};
const end = (s: Shot, f1: number) => (s.f1 = f1);
const m = mark;

// ---------------------------------------------------------------- intro → stage
T.question = S("intro1") + 0.2;
T.title = S("intro2") - 0.2;
T.gpt = C("intro2", "ChatGPT");
T.claude = C("intro2", "وClaude");
T.bloom = E("intro2") + 0.45;
T.launch = T.bloom + 0.55;

// ---------------------------------------------------------------- 01 the link on aljam3.com
setScene("site");
const CARD: Box = [88, 121, 428, 354];
const URL_BOX: Box = [113, 194, 379, 56];
const COPY: Box = [377, 263, 115, 48];
const site = shot("site", "site-copy", T.launch - 0.2, 0.2, () => "aljam3.com/mcp");
T.ch1 = S("link") - 0.4;
T.copy = pin(site, C("link", "وانسخ") + 0.45, m("site-copy", "click"));
T.ch2 = S("gpt1") - 0.55;
end(site, T.ch2);
wide(0, 0.01);
focus(C("link", "رابط") - 0.1, 1.55, CARD, 1.0, 40, 10);
spot(C("link", "رابط") + 0.1, C("link", "إفتح") - 0.1, URL_BOX, 10);
spot(T.copy - 0.35, T.copy + 1.2, COPY, 10);
// the page swaps the button for «تم النسخ»; the recording missed it, so it is shown as a tooltip
TOASTS.push({ t0: T.copy + 0.05, t1: T.copy + 1.7, label: "تم النسخ", x: center(COPY).x, y: COPY[1] - 10 });
leave(T.ch2);

// ---------------------------------------------------------------- 02 ChatGPT: add the server
setScene("gpt-setup");
const RAIL: Box = [1236, 164, 36, 36];
const ADD: Box = [383, 28, 77, 36];
const MENU_ITEM: Box = [394, 148, 175, 36];
const NAME: Box = [360, 236, 560, 36];
const URL_FIELD: Box = [360, 402, 560, 36];
const AUTH: Box = [360, 478, 560, 36];
const ACK: Box = [360, 589, 559, 88];
const CREATE: Box = [360, 690, 124, 36];
const DIALOG: Box = [340, 80, 600, 679];
const gptAdd = shot("gpt-add", "gpt-add", T.ch2, 0.9, (v) => (v < 2.3 ? "chatgpt.com" : "chatgpt.com/plugins"));
T.rail = pin(gptAdd, C("gpt1", "المكونات") + 0.35, m("gpt-add", "click", ""));
T.add = pin(gptAdd, C("gpt2", "إضافة") + 0.15, m("gpt-add", "click", "text=إضافة"));
T.menuItem = pin(gptAdd, C("gpt2", "خادم") + 0.1, m("gpt-add", "click", "خادم MCP"));
T.name = pin(gptAdd, S("gpt3") + 0.15, m("gpt-add", "click", "أداة"));
T.url = pin(gptAdd, C("gpt3", "وضع") + 0.15, m("gpt-add", "click", "https://example"));
T.select = pin(gptAdd, C("gpt4", "اختر") + 0.15, m("gpt-add", "click", "select"));
T.selected = pin(gptAdd, C("gpt4", "بدون") + 0.55, m("gpt-add", "select"), 0.05);
T.ack = pin(gptAdd, C("gpt4", "أكد") + 0.1, m("gpt-add", "click", "checkbox"));
T.create = pin(gptAdd, C("gpt5", "إنشاء") + 0.2, m("gpt-add", "click", "إنشاء"));
// the server is checked and the plugin created (≈12 s), shown sped up
T.created = pin(gptAdd, C("gpt5", "راجع") - 0.15, 34.4, 0.2, true);
end(gptAdd, C("gpt5", "راجع") + 0.35);
wide(T.ch2 - 0.5, 0.01);
focus(C("gpt1", "المكونات") - 0.45, 1.9, RAIL, 0.9, -150, 120);
spot(C("gpt1", "المكونات") - 0.1, T.rail + 0.5, RAIL, 10);
focus(T.rail + 0.5, 1.6, ADD, 0.9, 120, 140);
spot(T.add - 0.4, T.add + 0.45, ADD, 18);
spot(T.menuItem - 0.45, T.menuItem + 0.5, MENU_ITEM, 8);
focus(T.menuItem + 0.35, 1.25, DIALOG, 1.0, 0, -10);
focus(S("gpt3") - 0.25, 1.85, NAME, 0.8, 0, 70);
spot(T.name - 0.35, T.url - 0.4, NAME, 8);
spot(T.url - 0.35, T.select - 0.45, URL_FIELD, 8);
focus(T.url - 0.3, 1.75, URL_FIELD, 0.8, 0, 30);
focus(T.select - 0.4, 1.75, AUTH, 0.8, 0, 60);
spot(T.select - 0.35, T.selected + 0.6, AUTH, 8);
spot(T.ack - 0.5, T.ack + 0.7, ACK, 12);
focus(T.ack - 0.55, 1.6, ACK, 0.8, 0, 30);
spot(T.create - 0.45, T.create + 0.6, CREATE, 18);
focus(T.create + 0.6, 1.2, DIALOG, 0.9);

// the connection notice, then ChatGPT connects and installs it (same scene: a seamless cut)
const CONNECT_BTN: Box = [424, 584, 432, 36];
const SIDEBAR_ITEM: Box = [946, 180, 276, 36];
const gptConnect = shot("gpt-connect", "gpt-connect", gptAdd.f1, 0.25, () => "chatgpt.com/plugins", true);
T.connect = pin(gptConnect, C("gpt5", "ربط") + 0.2, m("gpt-connect", "click"));
T.installed = pin(gptConnect, S("gpt6") + 0.2, 4.6, 0.2);
T.chat = E("gpt6") + 0.55;
end(gptConnect, T.chat);
focus(C("gpt5", "راجع") - 0.2, 1.35, [400, 180, 480, 460], 0.8);
spot(T.connect - 0.45, T.connect + 0.45, CONNECT_BTN, 18);
focus(S("gpt6") - 0.2, 1.8, SIDEBAR_ITEM, 1.0, -170, 60);
spot(C("gpt6", "الجامع") - 0.1, E("gpt6") + 0.3, SIDEBAR_ITEM, 10);
leave(T.chat);

// ---------------------------------------------------------------- 02 ChatGPT: use it
setScene("gpt-chat");
const WORK: Box = [358, 8, 112, 36];
const COMPOSER: Box = [88, 336, 766, 128];
const MENTION: Box = [88, 336, 766, 70];
const ANSWER: Box = [256, 205, 602, 165];
const BOOK_LINE: Box = [370, 252, 488, 30];
const PAGE_LINE: Box = [250, 316, 580, 30];
const LINK_LINE: Box = [690, 344, 140, 26];
const gptChat = shot("gpt-chat", "gpt-chat", T.chat, 1.2, (v) => (v < 20.3 ? "chatgpt.com" : "chatgpt.com/c/…"));
T.work = pin(gptChat, C("gpt7", "وضع") + 0.2, m("gpt-chat", "click", "العمل"));
T.composer = pin(gptChat, C("gpt7", "واكتب") + 0.35, m("gpt-chat", "click", "contenteditable"));
T.mention = pin(gptChat, C("gpt7", "اختر") + 0.55, m("gpt-chat", "click", "Aljam3"));
// the question is typed a little faster than it was recorded
T.send = pin(gptChat, E("gpt8") + 1.2, m("gpt-chat", "key", "Enter"), 0.15);
T.answered = pin(gptChat, C("gpt9", "يجيبك") - 0.1, 50.6, 0.2, true);
// hold on the finished answer (the recording goes on to expand the steps)
pin(gptChat, E("gpt9") + 1.2, 52.9, 0);
T.ch3 = S("claude1") - 0.6;
end(gptChat, T.ch3);
wide(T.chat - 0.5, 0.01);
focus(C("gpt7", "وضع") - 0.4, 1.7, WORK, 0.9, 0, 120);
spot(T.work - 0.4, T.work + 0.5, WORK, 18);
focus(T.work + 0.55, 1.45, COMPOSER, 0.9, 0, 40);
spot(T.mention - 0.6, T.mention + 0.6, MENTION, 14);
focus(T.send + 0.15, 1.2, [100, 80, 800, 420], 0.9);
focus(C("gpt9", "يجيبك") - 0.3, 1.6, ANSWER, 1.0, 0, 10);
spot(C("gpt9", "باسم"), C("gpt9", "ورقم") - 0.1, BOOK_LINE, 8);
spot(C("gpt9", "ورقم"), C("gpt9", "ورابط") - 0.1, PAGE_LINE, 8);
spot(C("gpt9", "ورابط"), E("gpt9") + 0.5, LINK_LINE, 8);
T.gptLink = C("gpt9", "ورابط") + 0.1;
leave(T.ch3);

// ---------------------------------------------------------------- 03 Claude: add the connector
setScene("claude-add");
const CUSTOMIZE: Box = [12, 256, 263, 32];
const CONNECTORS_TAB: Box = [379, 112, 103, 32];
const C_ADD: Box = [1149, 112, 91, 32];
const C_MENU: Box = [1066, 154, 170, 32];
const C_NAME: Box = [396, 287, 488, 32];
const C_URL: Box = [396, 361, 488, 32];
const C_CONTINUE: Box = [798, 569, 86, 32];
const C_DIALOG: Box = [372, 175, 536, 450];
const NO_SIGNIN: Box = [388, 378, 486, 64];
const C_ADD2: Box = [832, 728, 52, 32];
const CONNECT: Box = [736, 503, 88, 32];
const claudeAdd = shot("claude-add", "claude-add", T.ch3, 0.8, (v) =>
  v < 2.6 ? "claude.ai/new" : v < 5.9 ? "claude.ai/customize" : v < 37.2 ? "claude.ai/customize/connectors" : "claude.ai/customize/connectors/…",
);
T.customize = pin(claudeAdd, C("claude1", "التخصيص") + 0.1, m("claude-add", "click", "Customize"));
T.connectorsTab = pin(claudeAdd, C("claude1", "الموصلات") + 0.15, m("claude-add", "click", "Connectors"));
T.cAdd = pin(claudeAdd, C("claude2", "إضافة") + 0.15, m("claude-add", "click", "Add\n"));
T.cMenu = pin(claudeAdd, C("claude2", "موصل") + 0.1, m("claude-add", "click", "Add custom"));
T.cName = pin(claudeAdd, S("claude3") + 0.1, m("claude-add", "click", "Name"));
T.cUrl = pin(claudeAdd, C("claude3", "وضع") + 0.3, m("claude-add", "click", "MCP server URL"));
T.cContinue = pin(claudeAdd, C("claude3", "تابع") + 0.35, m("claude-add", "click", "Continue"));
T.cChecked = pin(claudeAdd, C("claude4", "ويختار") - 0.1, 30.2, 0.2, true);
T.cNoSignin = pin(claudeAdd, C("claude4", "تسجيل") + 0.1, m("claude-add", "move", "No sign-in"), 0.2);
T.cAddBtn = pin(claudeAdd, C("claude4", "إضافة") + 0.25, m("claude-add", "click", "Add", 2));
T.cConnect = pin(claudeAdd, C("claude4", "اتصال") + 0.25, m("claude-add", "click", "Connect", 1));
// connected: the connector's page with its tools, briefly
T.cTools = pin(claudeAdd, E("claude4") + 0.7, 47.9, 0.3);
T.claudeChat = E("claude4") + 1.9;
end(claudeAdd, T.claudeChat);
wide(T.ch3 - 0.5, 0.01);
focus(C("claude1", "التخصيص") - 0.5, 1.7, CUSTOMIZE, 0.9, 220, 60);
spot(T.customize - 0.4, T.customize + 0.5, CUSTOMIZE, 10);
focus(T.customize + 0.35, 1.5, CONNECTORS_TAB, 0.9, 230, 120);
spot(T.connectorsTab - 0.4, T.connectorsTab + 0.5, CONNECTORS_TAB, 10);
focus(C("claude2", "إضافة") - 0.5, 1.75, C_ADD, 0.9, -200, 80);
spot(T.cAdd - 0.4, T.cAdd + 0.45, C_ADD, 10);
spot(T.cMenu - 0.45, T.cMenu + 0.5, C_MENU, 8);
focus(T.cMenu + 0.35, 1.5, C_DIALOG, 1.0, 0, 20);
spot(T.cName - 0.35, T.cUrl - 0.4, C_NAME, 8);
spot(T.cUrl - 0.35, T.cContinue - 0.45, C_URL, 8);
spot(T.cContinue - 0.4, T.cContinue + 0.45, C_CONTINUE, 10);
focus(T.cContinue + 0.4, 1.35, [372, 100, 536, 640], 0.9);
focus(T.cNoSignin - 0.5, 1.6, NO_SIGNIN, 0.9, 0, 20);
spot(T.cNoSignin - 0.3, C("claude4", "إضافة") - 0.25, NO_SIGNIN, 10);
// «اضغط إضافة»: the dialog scrolls to its Add button
focus(C("claude4", "إضافة") - 0.55, 1.7, C_ADD2, 0.8, -150, -60);
spot(T.cAddBtn - 0.18, T.cAddBtn + 0.55, C_ADD2, 10);
focus(T.cAddBtn + 0.35, 1.6, CONNECT, 0.9, 0, -60);
spot(T.cConnect - 0.45, T.cConnect + 0.5, CONNECT, 10);
leave(T.claudeChat);

// ---------------------------------------------------------------- 03 Claude: use it
setScene("claude-chat");
const PLUS: Box = [468, 418, 32, 32];
const CONNECTORS_ITEM: Box = [472, 531, 219, 32];
const ALJAM3_ROW: Box = [700, 485, 183, 33];
const C_COMPOSER: Box = [460, 355, 641, 104];
const PROMPT: Box = [398, 579, 773, 125];
const ALLOW: Box = [845, 664, 165, 28];
const C_TOOLS: Box = [414, 240, 740, 152];
const C_PAGE: Box = [496, 398, 660, 60];
const C_LINK: Box = [740, 514, 268, 34];
const claudeChat = shot("claude-chat", "claude-chat", T.claudeChat, 0.8, (v) => (v < 22.9 ? "claude.ai/new" : "claude.ai/chat/…"));
T.plus = pin(claudeChat, C("claude6", "تأكد") + 0.2, m("claude-chat", "click", ""));
T.connectorsHover = pin(claudeChat, C("claude6", "الجامع") + 0.1, m("claude-chat", "move", "Connectors"), 0.2);
// the submenu opens, but the recording lost it for a moment: skip to where it stays open
T.submenu = pin(claudeChat, C("claude6", "مفعل") - 0.1, 8.5, 0, false, 4.72);
T.menuClose = pin(claudeChat, C("claude6", "الموصلات", 0, "end") + 0.3, 9.55, 0);
T.cComposer = pin(claudeChat, C("claude6", "اسأل") + 0.25, m("claude-chat", "click", "contenteditable"));
T.cSend = pin(claudeChat, S("claude7") - 1.3, m("claude-chat", "key", "Enter"), 0.15);
// Claude starts working and stops to ask before its first tool call
T.ask = pin(claudeChat, S("claude7") + 0.2, 29.9, 0.2, true);
T.allow1 = pin(claudeChat, C("claude7", "السماح") + 0.25, m("claude-chat", "click", "Always allow"));
T.allow2 = pin(claudeChat, T.allow1 + 1.6, m("claude-chat", "click", "Always allow", 1), 0.45, true);
T.cAnswered = pin(claudeChat, S("claude8") + 0.1, 83.7, 0.2, true);
T.cExpand = pin(claudeChat, C("claude8", "الكتاب") + 0.1, m("claude-chat", "click", "Used Aljam3"));
T.cLinkHover = pin(claudeChat, C("claude8", "ورابط") + 0.2, m("claude-chat", "move", "aljam3.com/ar"), 0.2);
T.openLink = C("verify", "إفتح") + 0.35;
end(claudeChat, T.openLink + 0.25);
CLICKS.push(T.openLink);
sfx(T.openLink, "ui_click", 0.42);
wide(T.claudeChat - 0.5, 0.01);
focus(S("claude6") - 0.1, 1.55, [468, 380, 520, 200], 0.9, 40, 20);
spot(T.plus - 0.4, T.plus + 0.45, PLUS, 10);
spot(T.connectorsHover - 0.25, T.submenu - 0.05, CONNECTORS_ITEM, 8);
spot(T.submenu - 0.05, T.menuClose - 0.1, ALJAM3_ROW, 10);
focus(T.cComposer - 0.4, 1.45, C_COMPOSER, 0.9, 0, 20);
focus(T.cSend + 0.2, 1.2, [380, 60, 820, 560], 0.9);
focus(S("claude7") + 0.1, 1.55, PROMPT, 0.9, 0, -30);
spot(S("claude7") + 0.3, C("claude7", "السماح") - 0.25, PROMPT, 14);
spot(C("claude7", "السماح") - 0.2, T.allow1 + 0.5, ALLOW, 10);
focus(S("claude8") - 0.4, 1.3, [414, 150, 740, 420], 1.0);
spot(T.cExpand + 0.3, C("claude8", "رقم") - 0.05, C_TOOLS, 12);
spot(C("claude8", "رقم"), C("claude8", "ورابط") - 0.1, C_PAGE, 8);
spot(C("claude8", "ورابط"), T.openLink + 0.2, C_LINK, 8);
wide(T.openLink - 0.1, 1.1);

// ---------------------------------------------------------------- 04 the source page
setScene("verify");
const PDF_LINE: Box = [82, 634, 520, 28];
const TEXT_LINE: Box = [662, 450, 596, 28];
const verify = shot("verify", "site-verify", T.openLink + 0.25, 0.4, () => "aljam3.com/ar/1889/4971/29");
T.loaded = pin(verify, T.openLink + 1.25, 9.6, 0.2);
end(verify, E("verify") + 0.9);
wide(T.openLink, 0.01);
focus(C("verify", "لتتحقق") - 0.3, 1.6, TEXT_LINE, 1.0, 10, 40);
spot(C("verify", "بنفسك") - 0.15, E("verify") + 0.6, TEXT_LINE, 8);
focus(C("verify", "الأصلية") - 0.45, 1.7, PDF_LINE, 1.0, 20, -20);
spot(C("verify", "الأصلية") - 0.2, E("verify") + 0.6, PDF_LINE, 8);
T.tourEnd = verify.f1;

// every shot runs until the next one takes over (the clip holds its last frame meanwhile)
SHOTS.forEach((s, i) => {
  if (i + 1 < SHOTS.length) s.f1 = SHOTS[i + 1].f0;
});

// ---------------------------------------------------------------- cursor, clicks and typing from the recordings
const MOVE = 0.42;
let lastT = -1;
for (const s of SHOTS) {
  const vEnd = videoAt(s, s.f1);
  for (const mk of CLIP_DATA[s.clip].marks) {
    if (mk.retry || mk.t < s.anchors[0].v - 0.01 || mk.t > vEnd + 0.01) continue;
    const t = filmAt(s, mk.t);
    if (!Number.isFinite(t)) continue;
    if ((mk.kind === "move" || mk.kind === "click") && mk.x !== undefined && mk.y !== undefined) {
      if (mk.kind === "move" || CURSOR.length === 0 || Math.hypot(CURSOR[CURSOR.length - 1].v.x - mk.x, CURSOR[CURSOR.length - 1].v.y - mk.y) > 2) {
        const start = Math.max(lastT, t - MOVE);
        CURSOR.push({ t: start, v: { x: mk.x, y: mk.y }, d: Math.max(0.12, t - start), e: easeInOutCubic });
        lastT = t;
      }
    }
    if (mk.kind === "click") {
      CLICKS.push(t);
      sfx(t, "ui_click", 0.42);
    }
    if (mk.kind === "paste") KEYCAPS.push({ t, label: "⌘ V", x: CURSOR[CURSOR.length - 1]?.v.x ?? 640, y: CURSOR[CURSOR.length - 1]?.v.y ?? 400 });
    if (mk.kind === "key" && mk.key === "Enter") KEYCAPS.push({ t, label: "⏎", x: CURSOR[CURSOR.length - 1]?.v.x ?? 640, y: CURSOR[CURSOR.length - 1]?.v.y ?? 400 });
    if (mk.kind === "key" && (mk.key === "Enter" || mk.key === "Escape")) sfx(t, "key1", 0.3);
  }
  // keystrokes between each pair of type marks, at most ~16 a second
  const types = CLIP_DATA[s.clip].marks.filter((mk) => mk.kind === "type" && mk.t >= s.anchors[0].v - 0.01 && mk.t <= vEnd + 0.01);
  for (let i = 0; i + 1 < types.length; i += 2) {
    const a = filmAt(s, types[i].t);
    const b = filmAt(s, types[i + 1].t);
    const n = Math.max(1, Math.min(Array.from(types[i].text ?? "").length, Math.round((b - a) * 16)));
    for (let k = 0; k < n; k++) sfx(a + ((b - a) * k) / n, `key${k % 4}`, 0.2);
  }
}
// pointing at the source link in ChatGPT's answer
CURSOR.push({ t: T.gptLink - 0.45, v: center(LINK_LINE), d: 0.5, e: easeInOutCubic });
// the link Claude cited is opened by hand
CURSOR.push({ t: T.cLinkHover + 0.3, v: { x: 873, y: 532 }, d: 0.3, e: easeInOutCubic });

// transitions and stage sounds
sfx(T.bloom - 0.1, "whoosh_long", 0.2);
sfx(T.launch - 0.1, "whoosh", 0.2);
for (const s of SHOTS.slice(1)) if (!s.cut) sfx(s.f0 - 0.15, "whoosh", 0.14);
sfx(T.created, "pop", 0.16);
sfx(T.installed - 0.2, "pop", 0.16);
sfx(T.answered, "pop", 0.14);
sfx(T.cTools - 0.1, "pop", 0.16);
sfx(T.ask - 0.1, "pop", 0.16);
sfx(T.cAnswered, "pop", 0.14);
sfx(T.loaded - 0.3, "page_flip", 0.2);

CURSOR.sort((a, b) => a.t - b.t);
for (const k of Object.values(CAMS)) k.sort((a, b) => a.t - b.t);
SFX.sort((a, b) => a.t - b.t);

// ---------------------------------------------------------------- the native select menu ChatGPT opens for «المصادقة»
export const SELECT_MENU = { t0: filmAt(gptAdd, m("gpt-add", "click", "select").t), t1: T.selected, box: AUTH, options: ["OAuth", "بدون مصادقة", "OAuth أو بدون مصادقة"], pick: 1 };

// ---------------------------------------------------------------- chapters for the side panel
export type Bullet = { text: string; t: number; latin?: boolean };
export type Chapter = { n: number; title: string; latin?: boolean; headline: string; t0: number; t1: number; bullets: Bullet[] };
export const CHAPTERS: Chapter[] = [
  {
    n: 1,
    title: "الرابط",
    headline: "رابط واحد للاتصال",
    t0: T.ch1,
    t1: T.ch2,
    bullets: [
      { text: "aljam3.com/mcp", t: C("link", "موقع"), latin: true },
      { text: "انسخ رابط الاتصال", t: C("link", "وانسخ") },
    ],
  },
  {
    n: 2,
    title: "ChatGPT",
    latin: true,
    headline: "خادم MCP مخصّص",
    t0: T.ch2,
    t1: T.ch3,
    bullets: [
      { text: "المكونات الإضافية ← إضافة", t: C("gpt1", "المكونات") },
      { text: "الاسم ورابط الخادم", t: S("gpt3") },
      { text: "بدون مصادقة", t: C("gpt4", "بدون") },
      { text: "إنشاء كمكوّن إضافي ← ربط", t: C("gpt5", "إنشاء") },
      { text: "وضع العمل ← ‎@Aljam3", t: S("gpt7") },
    ],
  },
  {
    n: 3,
    title: "Claude",
    latin: true,
    headline: "موصّل مخصّص",
    t0: T.ch3,
    t1: S("verify") - 0.3,
    bullets: [
      { text: "Customize → Connectors", t: S("claude1"), latin: true },
      { text: "Add custom connector", t: C("claude2", "موصل"), latin: true },
      { text: "No sign-in → Add → Connect", t: C("claude4", "تسجيل"), latin: true },
      { text: "+ → Connectors → Aljam3", t: S("claude6"), latin: true },
      { text: "Always allow", t: C("claude7", "السماح"), latin: true },
    ],
  },
  {
    n: 4,
    title: "التحقق",
    headline: "ارجع إلى المصدر",
    t0: S("verify") - 0.3,
    t1: T.tourEnd,
    bullets: [
      { text: "افتح رابط الصفحة", t: C("verify", "إفتح") },
      { text: "قارن بالصفحة الأصلية", t: C("verify", "الأصلية") },
    ],
  },
];

/** The shot on screen at film time t, and the one dissolving out under it (if any). */
export const shotsAt = (t: number) => {
  const i = SHOTS.findIndex((s) => t >= s.f0 && t < s.f1);
  if (i < 0) return { cur: t < SHOTS[0].f0 ? SHOTS[0] : SHOTS[SHOTS.length - 1], prev: null as Shot | null, mix: 1 };
  const cur = SHOTS[i];
  const prev = i > 0 && !cur.cut ? SHOTS[i - 1] : null;
  const mix = prev ? Math.min(1, (t - cur.f0) / DISSOLVE) : 1;
  return { cur, prev: mix < 1 ? prev : null, mix };
};
