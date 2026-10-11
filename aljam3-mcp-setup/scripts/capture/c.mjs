// Tiny CDP CLI over the daemon (daemon.mjs). Usage: TAB=gpt node c.mjs <cmd> [...args]
// Recordings go to archive/captures/<name> (frames + clip.json), screenshots to archive/captures/shots.
import fs from "node:fs";

const CAPTURE = new URL("../../archive/captures/", import.meta.url).pathname;
const STATE = `${CAPTURE}state.json`;
const SHOTS = process.env.SHOTS ?? `${CAPTURE}shots`;
fs.mkdirSync(SHOTS, { recursive: true });
const tab = process.env.TAB ?? "main";
const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, "utf8")) : {};
const save = () => fs.writeFileSync(STATE, JSON.stringify(state, null, 1));

const send = async (method, params = {}, sessionId) => {
  const r = await fetch("http://127.0.0.1:9333/send", { method: "POST", body: JSON.stringify({ method, params, sessionId }) });
  const j = await r.json();
  if (j.error) throw new Error(`${method}: ${JSON.stringify(j.error)}`);
  return j.result;
};
const S = () => {
  if (!state[tab]) throw new Error(`no tab ${tab}`);
  return state[tab].sessionId;
};
const ps = (m, p) => send(m, p, S());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const daemon = async (path, body) => (await fetch(`http://127.0.0.1:9333${path}`, { method: "POST", body: JSON.stringify(body) })).json();
const mark = (m) => daemon("/rec/mark", { sessionId: S(), ...m });
// input can get lost while a capture is in flight, so hold the recorder around presses
const pause = (on) => daemon("/js", { code: `const r = recs.get(${JSON.stringify(state[tab]?.sessionId)}); if (r) r.paused = ${on}; return !!r;` });
const evaluate = async (expression) => {
  const r = await ps("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? JSON.stringify(r.exceptionDetails));
  return r.result.value;
};
const W = Number(process.env.VW ?? 1280);
const H = Number(process.env.VH ?? 800);
const setup = async () => {
  await ps("Page.enable");
  await ps("Runtime.enable");
  await ps("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 2, mobile: false });
  await ps("Emulation.setFocusEmulationEnabled", { enabled: true });
  if (process.env.LOCALE) {
    await ps("Emulation.setLocaleOverride", { locale: process.env.LOCALE }).catch(() => {});
    const { userAgent } = await send("Browser.getVersion");
    await ps("Network.enable");
    await ps("Network.setUserAgentOverride", { userAgent: userAgent.replace("HeadlessChrome", "Chrome"), acceptLanguage: process.env.LOCALE, platform: "MacIntel" });
  }
};
// moves the mouse and checks that the page saw the same CSS coordinates; re-applies emulation if not
const moveChecked = async (x, y) => {
  for (let i = 0; i < 3; i++) {
    await evaluate(`window.__calib = null; document.addEventListener("mousemove", (e) => (window.__calib = [e.clientX, e.clientY]), { capture: true, once: true }); 1`);
    await ps("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
    await sleep(80);
    const got = await evaluate("window.__calib");
    if (!got || (Math.abs(got[0] - Math.round(x)) < 2 && Math.abs(got[1] - Math.round(y)) < 2)) return;
    console.error("input mapping off:", JSON.stringify(got), "vs", x, y);
    await setup();
  }
};
const mouse = async (x, y, label = "") => {
  // captures in flight skew input coordinates, so hold the recorder while moving and pressing
  const recording = (await pause(true)).valueOf();
  if (recording) await sleep(250);
  await moveChecked(x, y);
  await mark({ kind: "move", x, y, label });
  if (recording) await pause(false);
  await sleep(Number(process.env.HOVER ?? 350));
  await mark({ kind: "click", x, y, label });
  const press = async () => {
    if (recording) {
      await pause(true);
      await sleep(250);
    }
    await ps("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
    await sleep(50);
    await ps("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
    if (recording) {
      await sleep(60);
      await pause(false);
    }
  };
  await press();
  // EXPECT: a JS expression that is truthy once the click has had its effect; retried a few times
  if (process.env.EXPECT) {
    let ok = false;
    for (let attempt = 0; attempt < 4 && !ok; attempt++) {
      for (let i = 0; i < 10 && !ok; i++) {
        await sleep(150);
        ok = !!(await evaluate(process.env.EXPECT).catch(() => false));
      }
      if (!ok) {
        console.error(`retrying click at ${x},${y}`);
        await mark({ kind: "click", x, y, label, retry: true });
        if (attempt % 2 === 0) await evaluate(`(() => { const el = document.elementFromPoint(${x}, ${y}); (el.closest("button, a, [role=button], [role=menuitem], [role=checkbox], [role=option], label, input") ?? el).click(); })()`);
        else await press();
      }
    }
    if (!ok) throw new Error(`click had no effect: ${process.env.EXPECT}`);
  }
};
// Finds one element by CSS selector, or by visible text with "text=..." (exact) / "text~=..." (contains).
const FIND = `(q) => {
  const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  if (q.startsWith("text=") || q.startsWith("text~=")) {
    const exact = q.startsWith("text="); const needle = q.slice(exact ? 5 : 6).trim();
    const all = [...document.querySelectorAll("button, a, [role=button], [role=menuitem], [role=option], [role=tab], [role=switch], [role=checkbox], [role=radio], label, input, textarea, li, span, div, p, h1, h2, h3")].filter(vis);
    const m = all.filter((el) => { const t = (el.innerText ?? el.value ?? "").trim(); return exact ? t === needle : t.includes(needle); });
    // prefer the innermost match
    return m.find((el) => !m.some((o) => o !== el && el.contains(o))) ?? null;
  }
  return [...document.querySelectorAll(q)].find(vis) ?? null;
}`;
const rectOf = async (q) =>
  evaluate(`(() => { const el = (${FIND})(${JSON.stringify(q)}); if (!el) return null; el.scrollIntoView({block: "nearest"}); const r = el.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height, text: (el.innerText ?? "").slice(0, 80)}; })()`);

const [cmd, ...args] = process.argv.slice(2);
const out = (v) => console.log(typeof v === "string" ? v : JSON.stringify(v, null, 1));

switch (cmd) {
  case "open": {
    const { targetId } = await send("Target.createTarget", { url: "about:blank", newWindow: args[1] === "window" });
    const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
    state[tab] = { targetId, sessionId };
    save();
    await setup();
    await ps("Page.navigate", { url: args[0] });
    await sleep(3000);
    out({ tab, targetId });
    break;
  }
  case "attach": {
    // re-attach after the daemon restarts
    const { sessionId } = await send("Target.attachToTarget", { targetId: state[tab].targetId, flatten: true });
    state[tab].sessionId = sessionId;
    save();
    await setup();
    out("attached");
    break;
  }
  case "calib": {
    // make sure input coordinates match CSS pixels; re-apply emulation if they drifted
    for (let i = 0; i < 3; i++) {
      await evaluate(`window.__calib = null; document.addEventListener("mousemove", (e) => (window.__calib = [e.clientX, e.clientY]), { capture: true, once: true }); 1`);
      await ps("Input.dispatchMouseEvent", { type: "mouseMoved", x: 640, y: 400 });
      await sleep(200);
      const got = await evaluate("window.__calib");
      if (got && Math.abs(got[0] - 640) < 2 && Math.abs(got[1] - 400) < 2) {
        out("calibrated");
        process.exit(0);
      }
      console.error("input mapping off:", JSON.stringify(got), "re-applying emulation");
      await setup();
    }
    throw new Error("could not calibrate input");
  }
  case "setup":
    await setup();
    out("ok");
    break;
  case "nav":
    await ps("Page.navigate", { url: args[0] });
    await sleep(Number(args[1] ?? 3000));
    out(await evaluate("location.href"));
    break;
  case "eval":
    out(await evaluate(args.join(" ")));
    break;
  case "evalfile":
    out(await evaluate(fs.readFileSync(args[0], "utf8")));
    break;
  case "shot": {
    const name = args[0] ?? "view";
    const { data } = await ps("Page.captureScreenshot", { format: "png", fromSurface: true });
    const file = `${SHOTS}/${name}.png`;
    fs.writeFileSync(file, Buffer.from(data, "base64"));
    out(file);
    break;
  }
  case "click":
    await mouse(Number(args[0]), Number(args[1]));
    out("clicked");
    break;
  case "rect":
    out(await rectOf(args.join(" ")));
    break;
  case "tap": {
    // click an element found by selector/text; prints its rect (CSS px)
    const r = await rectOf(args.join(" "));
    if (!r) throw new Error(`not found: ${args.join(" ")}`);
    await mouse(r.x + r.w / 2, r.y + r.h / 2, args.join(" "));
    out(r);
    break;
  }
  case "tapel": {
    // click the element returned by a JS expression
    const r = await evaluate(`(() => { const el = (${args.join(" ")}); if (!el) return null; el.scrollIntoView({block: "nearest"}); const r = el.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height, text: (el.innerText ?? "").slice(0, 80)}; })()`);
    if (!r) throw new Error(`not found: ${args.join(" ")}`);
    await mouse(r.x + r.w / 2, r.y + r.h / 2, r.text);
    out(r);
    break;
  }
  case "hover": {
    const r = await rectOf(args.join(" "));
    const recording = (await pause(true)).valueOf();
    if (recording) await sleep(250);
    await moveChecked(r.x + r.w / 2, r.y + r.h / 2);
    if (recording) await pause(false);
    await mark({ kind: "move", x: r.x + r.w / 2, y: r.y + r.h / 2, label: args.join(" ") });
    out(r);
    break;
  }
  case "type":
    await ps("Input.insertText", { text: args.join(" ") });
    out("typed");
    break;
  case "typeslow": {
    // human-ish typing: one character at a time
    const text = args.join(" ");
    await mark({ kind: "type", text, phase: "start" });
    for (const ch of Array.from(text)) {
      await ps("Input.insertText", { text: ch });
      await sleep(45 + Math.random() * 55 + (ch === " " ? 40 : 0));
    }
    await mark({ kind: "type", text, phase: "end" });
    out("typed");
    break;
  }
  case "paste": {
    await mark({ kind: "paste", text: args.join(" ") });
    await ps("Input.insertText", { text: args.join(" ") });
    out("pasted");
    break;
  }
  case "mark":
    out(await mark({ kind: args[0], label: args.slice(1).join(" ") }));
    break;
  case "rec": {
    if (args[0] === "start") {
      // 2x stills in a tight loop (the screencast only delivers 1x frames)
      const code = `
        const sid = ${JSON.stringify(S())};
        const dir = ${JSON.stringify(`${CAPTURE}${args[1]}`)};
        fs.mkdirSync(dir, { recursive: true });
        const rec = { dir, frames: [], marks: [], started: Date.now() / 1000 };
        recs.set(sid, rec);
        (async () => {
          let last = "";
          while (recs.get(sid) === rec) {
            await new Promise((r) => setTimeout(r, ${Number(process.env.GAP ?? 60)}));
            if (rec.paused) continue;
            const t0 = Date.now() / 1000;
            const r = await send("Page.captureScreenshot", { format: "jpeg", quality: 92, optimizeForSpeed: true }, sid);
            const t1 = Date.now() / 1000;
            const data = r.result?.data;
            if (!data || recs.get(sid) !== rec) continue;
            if (data === last) { rec.frames[rec.frames.length - 1].until = t1; continue; }
            last = data;
            const file = "f" + String(rec.frames.length).padStart(5, "0") + ".jpg";
            fs.writeFileSync(dir + "/" + file, Buffer.from(data, "base64"));
            rec.frames.push({ file, t: (t0 + t1) / 2, until: t1 });
          }
        })();
        return { recording: dir };`;
      out(await daemon("/js", { code }));
    }
    else out(await daemon("/rec/stop", { sessionId: S() }));
    break;
  }
  case "mask": {
    // privacy script: runs now and on every new document in this tab
    const source = fs.readFileSync(args[0], "utf8");
    if (state[tab].maskId) await ps("Page.removeScriptToEvaluateOnNewDocument", { identifier: state[tab].maskId }).catch(() => {});
    const { identifier } = await ps("Page.addScriptToEvaluateOnNewDocument", { source });
    state[tab].maskId = identifier;
    save();
    out(await evaluate(source + ";'masked'"));
    break;
  }
  case "wait":
    await sleep(Number(args[0]));
    out("waited");
    break;
  case "key": {
    const key = args[0];
    const codes = { Enter: 13, Escape: 27, Tab: 9, Backspace: 8, ArrowDown: 40, ArrowUp: 38 };
    const base = { key, code: key, windowsVirtualKeyCode: codes[key] ?? key.toUpperCase().charCodeAt(0), modifiers: Number(args[1] ?? 0) };
    await mark({ kind: "key", key, modifiers: base.modifiers });
    await ps("Input.dispatchKeyEvent", { type: "rawKeyDown", ...base, ...(key === "Enter" ? { text: "\r" } : {}) });
    if (key === "Enter") await ps("Input.dispatchKeyEvent", { type: "char", ...base, text: "\r" });
    await ps("Input.dispatchKeyEvent", { type: "keyUp", ...base });
    out("key");
    break;
  }
  case "scroll":
    await ps("Input.dispatchMouseEvent", { type: "mouseWheel", x: Number(args[0]), y: Number(args[1]), deltaX: 0, deltaY: Number(args[2]) });
    out("scrolled");
    break;
  case "ui": {
    // list visible interactive elements with rects, a cheap text snapshot
    out(
      await evaluate(`[...document.querySelectorAll("button, a, input, textarea, [role=button], [role=menuitem], [role=option], [role=tab], [role=switch], [role=checkbox], [role=radio], [contenteditable=true]")].map((el) => { const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > innerHeight) return null; const t = (el.innerText || el.getAttribute("aria-label") || el.getAttribute("placeholder") || el.value || "").trim().replace(/\\s+/g, " ").slice(0, 60); return \`\${el.tagName.toLowerCase()}\${el.getAttribute("role") ? "[" + el.getAttribute("role") + "]" : ""} "\${t}" @\${Math.round(r.x)},\${Math.round(r.y)} \${Math.round(r.width)}x\${Math.round(r.height)}\`; }).filter(Boolean).join("\\n")`),
    );
    break;
  }
  case "text":
    out(await evaluate(`document.body.innerText.slice(0, ${Number(args[0] ?? 3000)})`));
    break;
  case "close":
    await send("Target.closeTarget", { targetId: state[tab].targetId });
    delete state[tab];
    save();
    out("closed");
    break;
  default:
    out("commands: open nav eval evalfile shot click rect tap hover type key scroll ui text close attach setup");
}
