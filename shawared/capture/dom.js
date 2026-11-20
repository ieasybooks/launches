// Runs inside the page: flattens what is on screen into a tree of drawable nodes (boxes, text lines, SVGs) with
// their absolute geometry and the styles that draw them, so the film can redraw the real app exactly and animate it.
// Elements that draw nothing themselves pass their children up to the nearest node.
(() => {
  const VW = innerWidth, VH = innerHeight;
  const MARGIN_TOP = -400, MARGIN_BOTTOM = VH + 600;
  const transparent = (c) => !c || c === "transparent" || /rgba\([^)]*,\s*0\)$/.test(c);
  const px = (v) => parseFloat(v) || 0;
  const r2 = (n) => Math.round(n * 100) / 100;
  const rectOf = (r) => ({ x: r2(r.left), y: r2(r.top), w: r2(r.width), h: r2(r.height) });

  const borderOf = (s) => {
    const sides = ["Top", "Right", "Bottom", "Left"].map((k) => ({ w: px(s[`border${k}Width`]), style: s[`border${k}Style`], color: s[`border${k}Color`] }));
    if (sides.every((b) => !b.w || b.style === "none" || transparent(b.color))) return null;
    return sides;
  };
  const radiusOf = (s) => {
    const r = [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius];
    return r.every((x) => px(x) === 0) ? null : r.join(" ");
  };

  const textLines = (node, s) => {
    // one primitive per line: characters grouped by the line box they sit on
    const text = node.textContent;
    if (!text.trim()) return [];
    const range = document.createRange();
    const lines = [];
    let cur = null;
    const chars = Array.from(text);
    let off = 0;
    for (const ch of chars) {
      range.setStart(node, off);
      range.setEnd(node, off + ch.length);
      off += ch.length;
      const rects = range.getClientRects();
      const rr = rects[0];
      if (!rr) {
        if (cur) cur.text += ch;
        continue;
      }
      const mid = rr.top + rr.height / 2;
      if (cur && Math.abs(mid - cur.mid) < rr.height * 0.45) {
        cur.text += ch;
      } else {
        cur = { text: ch, mid, start: off - ch.length };
        lines.push(cur);
      }
    }
    return lines.map((l) => {
      range.setStart(node, l.start);
      range.setEnd(node, l.start + l.text.length);
      const r = range.getBoundingClientRect();
      return { text: l.text.replace(/\s+$/, "").replace(/^\s+/, ""), ...rectOf(r) };
    }).filter((l) => l.text);
  };

  const fontOf = (s) => ({
    fontFamily: s.fontFamily, fontSize: px(s.fontSize), fontWeight: s.fontWeight, fontStyle: s.fontStyle,
    letterSpacing: s.letterSpacing === "normal" ? undefined : s.letterSpacing, color: s.color,
    fontVariantNumeric: s.fontVariantNumeric === "normal" ? undefined : s.fontVariantNumeric,
    fontFeatureSettings: s.fontFeatureSettings === "normal" ? undefined : s.fontFeatureSettings,
    textDecoration: s.textDecorationLine !== "none" ? `${s.textDecorationLine} ${s.textDecorationStyle} ${s.textDecorationColor}` : undefined,
    textDecorationThickness: s.textDecorationLine !== "none" ? s.textDecorationThickness : undefined,
    textUnderlineOffset: s.textDecorationLine !== "none" ? s.textUnderlineOffset : undefined,
    textShadow: s.textShadow === "none" ? undefined : s.textShadow,
    direction: s.direction,
  });

  const labelOf = (el) => el.getAttribute && (el.getAttribute("aria-label") || el.getAttribute("data-testid") || undefined);

  const walk = (el, parent, ctx) => {
    if (el.nodeType === Node.TEXT_NODE) {
      const host = el.parentElement;
      const s = getComputedStyle(host);
      if (s.visibility === "hidden") return;
      if (s.textOverflow === "ellipsis") {
        // one clipped line ending in an ellipsis: drawn the same way, in the host's own width
        const hr = host.getBoundingClientRect();
        const lines = textLines(el, s);
        if (!lines.length) return;
        const first = lines[0];
        const pl = px(s.paddingLeft), pr = px(s.paddingRight);
        parent.kids.push({ t: "text", text: el.textContent.trim(), x: r2(hr.left + pl), y: first.y, w: r2(hr.width - pl - pr), h: first.h, ellipsis: true, font: fontOf(s), labels: ctx.labels });
        return;
      }
      for (const line of textLines(el, s)) {
        if (line.y + line.h < MARGIN_TOP || line.y > MARGIN_BOTTOM) continue;
        parent.kids.push({ t: "text", ...line, font: fontOf(s), labels: ctx.labels });
      }
      return;
    }
    if (el.nodeType !== Node.ELEMENT_NODE) return;
    const tag = el.tagName.toLowerCase();
    if (["script", "style", "link", "meta", "noscript", "audio", "template"].includes(tag)) return;
    const s = getComputedStyle(el);
    if (s.display === "none") return;
    const op = px(s.opacity);
    if (op === 0) return;
    // a transformed element is measured (with its subtree) untransformed; the transform is drawn on top
    const transform = s.transform !== "none" && s.transform !== "matrix(1, 0, 0, 1, 0, 0)" && tag !== "svg" ? s.transform : undefined;
    const origin = transform ? s.transformOrigin : undefined;
    const saved = transform ? el.style.getPropertyValue("transform") : null;
    if (transform) el.style.setProperty("transform", "none", "important");
    try {
    const r = el.getBoundingClientRect();
    const label = labelOf(el);
    const labels = label ? [label, ...ctx.labels].slice(0, 4) : ctx.labels;
    if (tag === "svg") {
      if (s.visibility === "hidden" || r.width === 0) return;
      if (r.bottom < MARGIN_TOP || r.top > MARGIN_BOTTOM) return;
      const clone = el.cloneNode(true);
      clone.setAttribute("width", r.width);
      clone.setAttribute("height", r.height);
      clone.style.color = s.color;
      parent.kids.push({ t: "svg", ...rectOf(r), html: clone.outerHTML, opacity: op < 1 ? op : undefined, labels });
      return;
    }
    if (tag === "input" || tag === "textarea") {
      // the field's box is drawn below; its text (value or placeholder) is not a text node, so add it here
      const text = el.value || el.getAttribute("placeholder") || "";
      if (text && r.width > 0) {
        const ps = getComputedStyle(el, "::placeholder");
        const font = fontOf(s);
        if (!el.value) font.color = ps.color;
        const pl = px(s.paddingLeft) + px(s.borderLeftWidth), pr = px(s.paddingRight) + px(s.borderRightWidth);
        const pt = px(s.paddingTop) + px(s.borderTopWidth), pb = px(s.paddingBottom) + px(s.borderBottomWidth);
        parent.kids.push({ t: "text", text, x: r2(r.left + pl), y: r2(r.top + pt), w: r2(r.width - pl - pr), h: r2(r.height - pt - pb), vcenter: true, align: s.textAlign, font, labels });
      }
    }
    if (tag === "img") {
      parent.kids.push({ t: "img", ...rectOf(r), src: el.currentSrc || el.src, fit: s.objectFit, radius: radiusOf(s), opacity: op < 1 ? op : undefined, labels });
      return;
    }
    const bg = transparent(s.backgroundColor) ? undefined : s.backgroundColor;
    const bgImage = s.backgroundImage !== "none" ? s.backgroundImage : undefined;
    const border = borderOf(s);
    const shadow = s.boxShadow !== "none" ? s.boxShadow : undefined;
    const mask = (s.maskImage && s.maskImage !== "none") ? s.maskImage : (s.webkitMaskImage && s.webkitMaskImage !== "none" ? s.webkitMaskImage : undefined);
    const clip = ["hidden", "auto", "scroll", "clip"].includes(s.overflowX) || ["hidden", "auto", "scroll", "clip"].includes(s.overflowY);
    const z = s.zIndex !== "auto" && s.position !== "static" ? Number(s.zIndex) : undefined;
    const draws = bg || bgImage || border || shadow || mask || clip || op < 1 || z !== undefined || transform || label;
    let node = parent;
    if (draws && s.visibility !== "hidden") {
      if (r.bottom < MARGIN_TOP || r.top > MARGIN_BOTTOM) return;
      node = {
        t: "box", ...rectOf(r), kids: [], label,
        bg, bgImage, bgSize: bgImage ? s.backgroundSize : undefined, bgPos: bgImage ? s.backgroundPosition : undefined, bgRepeat: bgImage ? s.backgroundRepeat : undefined,
        border: border || undefined, radius: radiusOf(s) || undefined, shadow, mask,
        maskSize: mask ? (s.maskSize || s.webkitMaskSize) : undefined, maskPos: mask ? (s.maskPosition || s.webkitMaskPosition) : undefined, maskRepeat: mask ? (s.maskRepeat || s.webkitMaskRepeat) : undefined,
        clip: clip || undefined, opacity: op < 1 ? op : undefined, z, transform, origin,
      };
      parent.kids.push(node);
    }
    for (const c of el.childNodes) walk(c, node, { labels });
    if (node !== parent && !node.kids.length) delete node.kids;
    } finally {
      if (transform) {
        if (saved) el.style.setProperty("transform", saved);
        else el.style.removeProperty("transform");
      }
    }
  };

  const root = { t: "box", x: 0, y: 0, w: VW, h: VH, kids: [], bg: getComputedStyle(document.body).backgroundColor };
  walk(document.body, root, { labels: [] });
  // prune empty boxes that draw nothing at all
  const prune = (n) => {
    if (n.kids) n.kids = n.kids.filter((k) => k.t !== "box" || k.kids?.length || k.bg || k.bgImage || k.border || k.shadow || k.label);
    n.kids?.forEach(prune);
  };
  prune(root);
  return { w: VW, h: VH, root };
})();
