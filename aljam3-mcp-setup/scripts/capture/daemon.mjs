// One long-lived CDP connection to the user's Chrome, exposed over local HTTP so short CLI calls reuse it.
// Also records screencasts: frames of a tab are written to disk with browser timestamps, plus "marks"
// (clicks, keys) on the same clock, so the film can replay the real UI and place a cursor on it.
import fs from "node:fs";
import http from "node:http";

const ws = new WebSocket("ws://127.0.0.1:9222/devtools/browser");
let nextId = 1;
const pending = new Map();
const events = [];
const recs = new Map(); // sessionId -> { dir, frames: [], marks: [] }
const hooks = [];
const send = (method, params = {}, sessionId) =>
  new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
ws.onmessage = (e) => {
  const msg = JSON.parse(String(e.data));
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
    return;
  }
  if (msg.method === "Page.screencastFrame") {
    const rec = recs.get(msg.sessionId);
    send("Page.screencastFrameAck", { sessionId: msg.params.sessionId }, msg.sessionId);
    if (rec) {
      const n = rec.frames.length;
      const file = `f${String(n).padStart(5, "0")}.jpg`;
      fs.writeFileSync(`${rec.dir}/${file}`, Buffer.from(msg.params.data, "base64"));
      rec.frames.push({ file, t: msg.params.metadata.timestamp, w: msg.params.metadata.deviceWidth, h: msg.params.metadata.deviceHeight, sy: msg.params.metadata.scrollOffsetY });
    }
    return;
  }
  if (msg.method) {
    events.push({ at: Date.now(), ...msg });
    if (events.length > 3000) events.splice(0, events.length - 3000);
    for (const h of hooks) h(msg);
  }
};
ws.onclose = () => process.exit(1);
await new Promise((r) => (ws.onopen = r));

const routes = {
  "/send": async ({ method, params, sessionId }) => send(method, params, sessionId),
  "/events": async ({ since = 0 }) => events.filter((e) => e.at > since),
  "/rec/start": async ({ sessionId, dir, quality = 88 }) => {
    fs.mkdirSync(dir, { recursive: true });
    recs.set(sessionId, { dir, frames: [], marks: [], started: Date.now() / 1000 });
    return send("Page.startScreencast", { format: "jpeg", quality, maxWidth: 2560, maxHeight: 1600, everyNthFrame: 1 }, sessionId);
  },
  "/rec/mark": async ({ sessionId, ...mark }) => {
    const rec = recs.get(sessionId);
    if (!rec) return { error: "not recording" };
    rec.marks.push({ t: Date.now() / 1000, ...mark });
    return { ok: true, n: rec.marks.length };
  },
  "/rec/stop": async ({ sessionId }) => {
    await send("Page.stopScreencast", {}, sessionId);
    await new Promise((r) => setTimeout(r, 300));
    const rec = recs.get(sessionId);
    recs.delete(sessionId);
    if (!rec) return { error: "not recording" };
    fs.writeFileSync(`${rec.dir}/clip.json`, JSON.stringify({ started: rec.started, frames: rec.frames, marks: rec.marks }, null, 1));
    return { frames: rec.frames.length, marks: rec.marks.length, dir: rec.dir };
  },
  // escape hatch: run code inside the daemon without restarting the connection
  "/js": async ({ code }) => new (Object.getPrototypeOf(async () => {}).constructor)("send", "hooks", "recs", "fs", code)(send, hooks, recs, fs),
};

http
  .createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    const url = new URL(req.url, "http://x");
    const fn = routes[url.pathname];
    try {
      const input = body ? JSON.parse(body) : Object.fromEntries(url.searchParams);
      res.end(JSON.stringify(fn ? await fn(input) : { error: "no route" }));
    } catch (err) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: String(err?.stack ?? err) }));
    }
  })
  .listen(9333, "127.0.0.1", () => console.log("cdp daemon on 9333"));
