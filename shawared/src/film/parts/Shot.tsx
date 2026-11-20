import React from "react";

// Redraws a screen recorded from the live app (capture/dom.js): nested boxes, text lines and icons, each at the
// position the app laid it out, in CSS pixels of a 393 × 852 iPhone screen. `mod` lets a scene change any node
// (hide it, recolour a word, move a subtree) while the rest stays exactly as recorded.

export type Font = {
  fontFamily: string; fontSize: number; fontWeight: string; fontStyle: string; letterSpacing?: string; color: string;
  fontVariantNumeric?: string; fontFeatureSettings?: string; textDecoration?: string; textDecorationThickness?: string;
  textUnderlineOffset?: string; textShadow?: string; direction: string;
};
export type TextNode = { t: "text"; text: string; x: number; y: number; w: number; h: number; font: Font; labels: string[]; ellipsis?: boolean; vcenter?: boolean; align?: string };
export type SvgNode = { t: "svg"; x: number; y: number; w: number; h: number; html: string; opacity?: number; labels: string[] };
export type ImgNode = { t: "img"; x: number; y: number; w: number; h: number; src: string; fit?: string; radius?: string; opacity?: number; labels: string[] };
export type Border = { w: number; style: string; color: string };
export type BoxNode = {
  t: "box"; x: number; y: number; w: number; h: number; kids?: AnyNode[]; label?: string;
  bg?: string; bgImage?: string; bgSize?: string; bgPos?: string; bgRepeat?: string; border?: Border[]; radius?: string; shadow?: string;
  mask?: string; maskSize?: string; maskPos?: string; maskRepeat?: string; clip?: boolean; opacity?: number; z?: number; transform?: string; origin?: string;
};
export type AnyNode = TextNode | SvgNode | ImgNode | BoxNode;
export type ShotData = { w: number; h: number; root: BoxNode };

/** What a scene may change on one node: extra style, or `null` to leave it out. `path` is the node's place. */
export type Mod = (node: AnyNode, path: string) => React.CSSProperties | null | undefined;

/** Where a field's text sits along its line, as flex alignment in the text's own direction. */
const justify = (align: string | undefined, dir: string) => {
  if (align === "center") return "center";
  const rtl = dir === "rtl";
  const right = align === "right" || (align === "start" && rtl) || (align === "end" && !rtl);
  return right === rtl ? "flex-start" : "flex-end";
};

const sideStyle = (b: Border[] | undefined): React.CSSProperties => {
  if (!b) return {};
  const [t, r, bo, l] = b;
  const one = (s: Border) => (s.w && s.style !== "none" ? `${s.w}px ${s.style} ${s.color}` : undefined);
  return { borderTop: one(t), borderRight: one(r), borderBottom: one(bo), borderLeft: one(l) };
};

const Node: React.FC<{ n: AnyNode; ox: number; oy: number; mod?: Mod; path: string }> = ({ n, ox, oy, mod, path }) => {
  const extra = mod?.(n, path);
  if (extra === null) return null;
  const pos: React.CSSProperties = { position: "absolute", left: n.x - ox, top: n.y - oy, width: n.w, height: n.h, boxSizing: "border-box" };
  if (n.t === "text") {
    const f = n.font;
    return (
      <div
        style={{
          ...pos, whiteSpace: "pre", lineHeight: `${n.h}px`, fontFamily: f.fontFamily, fontSize: f.fontSize,
          fontWeight: f.fontWeight as React.CSSProperties["fontWeight"], fontStyle: f.fontStyle, letterSpacing: f.letterSpacing, color: f.color,
          fontVariantNumeric: f.fontVariantNumeric, fontFeatureSettings: f.fontFeatureSettings, textDecoration: f.textDecoration,
          textDecorationThickness: f.textDecorationThickness, textUnderlineOffset: f.textUnderlineOffset, textShadow: f.textShadow,
          direction: f.direction as "rtl" | "ltr", textAlign: f.direction === "rtl" ? "right" : "left", unicodeBidi: "plaintext",
          ...(n.ellipsis ? { overflow: "hidden", textOverflow: "ellipsis" } : {}),
          ...(n.vcenter ? { display: "flex", alignItems: "center", lineHeight: "normal", justifyContent: justify(n.align, f.direction) } : {}),
          ...extra,
        }}
      >
        {n.text}
      </div>
    );
  }
  if (n.t === "svg") {
    return <div style={{ ...pos, opacity: n.opacity, ...extra }} dangerouslySetInnerHTML={{ __html: n.html }} />;
  }
  if (n.t === "img") {
    return <img src={n.src} style={{ ...pos, objectFit: (n.fit as React.CSSProperties["objectFit"]) ?? "fill", borderRadius: n.radius, opacity: n.opacity, ...extra }} />;
  }
  const style: React.CSSProperties = {
    ...pos,
    background: n.bg,
    backgroundImage: n.bgImage,
    backgroundSize: n.bgSize,
    backgroundPosition: n.bgPos,
    backgroundRepeat: n.bgRepeat,
    ...sideStyle(n.border),
    borderRadius: n.radius,
    boxShadow: n.shadow,
    WebkitMaskImage: n.mask,
    maskImage: n.mask,
    WebkitMaskSize: n.maskSize,
    WebkitMaskPosition: n.maskPos,
    WebkitMaskRepeat: n.maskRepeat,
    overflow: n.clip ? "hidden" : undefined,
    opacity: n.opacity,
    zIndex: n.z,
    transform: n.transform,
    transformOrigin: n.origin,
    ...extra,
  };
  // children are placed inside the box's border edge (absolute children start at the padding box)
  const bl = n.border?.[3]?.w ?? 0;
  const bt = n.border?.[0]?.w ?? 0;
  return (
    <div style={style}>
      {n.kids?.map((k, i) => <Node key={i} n={k} ox={n.x + bl} oy={n.y + bt} mod={mod} path={`${path}.${i}`} />)}
    </div>
  );
};

/** One recorded screen, drawn at its own size (393 × 852) from the top left of its parent. */
export const Shot: React.FC<{ shot: ShotData; mod?: Mod; style?: React.CSSProperties }> = ({ shot, mod, style }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: shot.w, height: shot.h, overflow: "hidden", ...style }}>
    <Node n={shot.root} ox={0} oy={0} mod={mod} path="r" />
  </div>
);

// Finding nodes ---------------------------------------------------------------------------------------------

/** Every node under `n` (itself included) that matches, with its path. */
export const findAll = (n: AnyNode, pred: (n: AnyNode) => boolean, path = "r", out: { n: AnyNode; path: string }[] = []) => {
  if (pred(n)) out.push({ n, path });
  if (n.t === "box") n.kids?.forEach((k, i) => findAll(k, pred, `${path}.${i}`, out));
  return out;
};
export const find = (n: AnyNode, pred: (n: AnyNode) => boolean) => findAll(n, pred)[0];
export const byLabel = (label: string) => (n: AnyNode) => n.t === "box" && n.label === label;
/** Is `path` the node at `root` or inside it? */
export const within = (path: string, root: string) => path === root || path.startsWith(root + ".");
