import React from "react";
import { Img, staticFile } from "remotion";
import { Btn, Card, Field, Highlighted, Icon, IconBtn, Progress, Sep, Txt, usePal } from "./kit";
import { APP_W, PAGE_TOP, RADIUS } from "./theme";
import { READING_FONT } from "../lib/fonts";
import demo from "../data/demo.json";

export const MAIN_W = 1112;
export const MAIN_X = 24;
const fmt = (n: number) => n.toLocaleString("en-US");

/** Absolute box helper in page coordinates. */
const Abs: React.FC<{ x: number; y: number; w?: number; h?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ x, y, w, h, style, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, ...style }}>{children}</div>
);

// ---------- search controls shared by home, results and saved ----------

export type SearchUI = {
  mode: "books" | "content";
  scope: "all" | "downloaded";
  query: string;
  caret?: boolean;
  focused?: boolean;
  filterCount?: number;
  pressed?: Partial<Record<"mode" | "scope" | "filters" | "submit", number>>;
};

// Measured from the app at 1160 px: controls row at y 140, field row at y 188.
export const CTRL = {
  mode: { x: 928, y: 140, w: 146 },
  scope: { x: 716, y: 140, w: 154 },
  filters: { x: 592, y: 140, w: 102 },
  field: { x: 128, y: 188, w: 1008 },
  submit: { x: 24, y: 188, w: 92 },
};

export const SearchControls: React.FC<{ ui: SearchUI; top?: number }> = ({ ui, top = 0 }) => {
  const p = ui.pressed ?? {};
  return (
    <>
      <Abs x={1080} y={CTRL.mode.y + top} w={56} h={36} style={{ display: "flex", alignItems: "center" }}>
        <Txt size={14} muted>البحث في:</Txt>
      </Abs>
      <Abs x={CTRL.mode.x} y={CTRL.mode.y + top}>
        <Btn label={ui.mode === "content" ? "نصوص الكتب" : "عناوين الكتب"} icon="chevron-down" width={CTRL.mode.w} pressed={p.mode} />
      </Abs>
      <Abs x={874} y={CTRL.scope.y + top} w={44} h={36} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <Txt size={14} muted>ضمن:</Txt>
      </Abs>
      <Abs x={CTRL.scope.x} y={CTRL.scope.y + top}>
        <Btn label={ui.scope === "downloaded" ? "كتبي المحمّلة" : "كل المكتبة"} icon="chevron-down" width={CTRL.scope.w} pressed={p.scope} />
      </Abs>
      <Abs x={CTRL.filters.x} y={CTRL.filters.y + top}>
        <Btn label={ui.filterCount ? `تصفية · ${ui.filterCount}` : "تصفية"} icon="sliders-horizontal" width={CTRL.filters.w} pressed={p.filters} />
      </Abs>
      <Abs x={CTRL.field.x} y={CTRL.field.y + top}>
        <Field
          value={ui.query}
          caret={ui.caret}
          focused={ui.focused}
          width={CTRL.field.w}
          placeholder={ui.mode === "content" ? "ابحث عن كلمة أو عبارة في نصوص الكتب…" : "ابحث عن عنوان كتاب…"}
        />
      </Abs>
      <Abs x={CTRL.submit.x} y={CTRL.submit.y + top}>
        <Btn label="بحث" icon="search" variant="solid" width={CTRL.submit.w} height={44} pressed={p.submit} />
      </Abs>
    </>
  );
};

const SectionHeading: React.FC<{ title: string; action?: string }> = ({ title, action }) => (
  <div style={{ height: 40, marginBottom: 12, display: "flex", alignItems: "center" }}>
    <Txt heading size={20} style={{ flex: 1 }}>
      {title}
    </Txt>
    {action ? <Txt size={14}>{action}</Txt> : null}
  </div>
);

const BookHeading: React.FC<{ category?: string; title: string; author?: string; marks?: string[]; titleSize?: number; m?: string }> = ({ category, title, author, marks = [], titleSize = 20, m = "" }) => (
  <div>
    {category ? <Txt size={13} muted>{category}</Txt> : null}
    <Txt size={titleSize} weight={600} style={{ marginTop: category ? 8 : 0 }}>
      <span data-m={m && `${m}title`}>
        <Highlighted text={title} marks={marks} />
      </span>
    </Txt>
    {author ? (
      <Txt size={14} muted style={{ marginTop: 8 }}>
        <span data-m={m && `${m}author`}>{author}</span>
      </Txt>
    ) : null}
  </div>
);

// ---------- home ----------

export type HomeProps = {
  ui: SearchUI;
  recent?: { fraction: number; pressed?: number } | null;
  scroll?: number;
};

const CATEGORY_SAMPLE = demo.categories.slice(0, 6);

export const HomeScreen: React.FC<HomeProps> = ({ ui, recent, scroll = 0 }) => {
  const pal = usePal();
  const r = demo.riyad;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Abs x={MAIN_X} y={PAGE_TOP} w={MAIN_W}>
        <Txt heading size={26}>
          {recent ? "مكتبتك، حيث توقفت" : "المكتبة بين يديك"}
        </Txt>
        <Txt size={16} muted style={{ marginTop: 6 }}>
          ابحث في الكتب، وتابع القراءة، واحتفظ بما تحتاجه دون اتصال.
        </Txt>
      </Abs>
      <SearchControls ui={ui} />
      <Abs x={MAIN_X} y={256} w={MAIN_W} h={788 - 256} style={{ overflow: "hidden" }}>
        <div style={{ transform: `translateY(${-scroll}px)` }}>
          {recent ? (
            <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
              <div style={{ flex: 1 }}>
                <SectionHeading title="تابع القراءة" />
                <Card style={{ height: 236, position: "relative" }} m="recentcard">
                  <div style={{ padding: 16 }}>
                    <BookHeading category={r.category} title="رياض الصالحين - النووي - ت الأرناؤوط ط3" author={r.author} />
                    <Txt size={14} muted style={{ marginTop: 12 }}>
                      <span data-m="recentloc">{`صفحة 29 من ${fmt(r.filePages)}`}</span>
                    </Txt>
                    <Progress fraction={recent.fraction} style={{ marginTop: 14 }} />
                  </div>
                  <div style={{ position: "absolute", left: 16, right: 16, bottom: 16, display: "flex", alignItems: "center" }}>
                    <Btn label="متابعة القراءة" icon="book-open" width={164} pressed={recent.pressed} m="continue" />
                    <Txt size={13} muted style={{ flex: 1, textAlign: "left" }}>
                      متاح دون اتصال
                    </Txt>
                  </div>
                </Card>
              </div>
              <div style={{ flex: 1 }}>
                <SectionHeading title="قرأت مؤخرًا" />
                <Card style={{ height: 236, padding: 16, boxSizing: "border-box" }}>
                  {[
                    ["متن الأربعين النووية - ت مستو - ط الرسالة", "صفحة 13 · متاح عبر الإنترنت"],
                    ["تطهير الطوية بتحسين النية", "صفحة 25 · متاح دون اتصال"],
                    ["الفوائد - ابن القيم", "صفحة 112 · متاح دون اتصال"],
                  ].map(([t, s], i) => (
                    <div key={t}>
                      {i ? <Sep style={{ margin: "6px 0" }} /> : null}
                      <div style={{ height: 56, display: "flex", alignItems: "center" }}>
                        <div style={{ flex: 1 }}>
                          <Txt size={16}>{t}</Txt>
                          <Txt size={13} muted style={{ marginTop: 2 }}>
                            {s}
                          </Txt>
                        </div>
                        <IconBtn icon="arrow-left" />
                      </div>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          ) : null}
          <SectionHeading title="اكتشف المكتبة" action="جميع الكتب" />
          <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
            {demo.libraries.map((l) => (
              <Card key={l.name} style={{ flex: 1, padding: 16, display: "flex", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <Txt size={18}>{l.name}</Txt>
                  <Txt size={14} muted style={{ marginTop: 4 }}>
                    {fmt(l.count)} كتاب
                  </Txt>
                </div>
                <Icon name="arrow-left" size={18} />
              </Card>
            ))}
          </div>
          <SectionHeading title="التصنيفات" action="جميع التصنيفات" />
          <div style={{ display: "flex", flexWrap: "wrap", columnGap: 24 }}>
            {CATEGORY_SAMPLE.map((c) => (
              <div key={c.id} style={{ width: (MAIN_W - 24) / 2 }}>
                <div style={{ display: "flex", alignItems: "center", padding: "14px 0" }}>
                  <Txt size={16} style={{ flex: 1 }}>
                    {c.name}
                  </Txt>
                  <Txt size={13} muted>
                    {fmt(c.count)} كتاب
                  </Txt>
                </div>
                <Sep />
              </div>
            ))}
          </div>
          <div style={{ height: 40, background: pal.paper }} />
        </div>
      </Abs>
    </div>
  );
};

// ---------- search results ----------

export type Hit = { page: number; title: string; author: string; category: string; excerpt: string; bookId?: number };

export const ResultCard: React.FC<{ hit: Hit; marks: string[]; availability?: string; pressedOpen?: number; downloaded?: boolean; inBook?: boolean; m?: string }> = ({
  hit,
  marks,
  availability = "متاح عبر الإنترنت",
  pressedOpen,
  downloaded,
  inBook,
  m = "",
}) => (
  <Card style={{ marginBottom: 16 }} m={m && `${m}card`}>
    <div style={{ padding: 16 }}>
      {inBook ? (
        <div style={{ display: "flex", alignItems: "center", height: 36 }}>
          <Txt size={16} style={{ flex: 1 }}>{`صفحة ${hit.page}`}</Txt>
          <Btn label="عرض الصفحة" icon="book-open" width={124} pressed={pressedOpen} m={m && `${m}open`} />
        </div>
      ) : (
        <BookHeading category={hit.category} title={hit.title} author={hit.author} m={m} />
      )}
      <div data-m={m && `${m}excerpt`} style={{ fontFamily: READING_FONT, fontSize: 19, lineHeight: "36px", marginTop: 14 }}>
        <Highlighted text={hit.excerpt} marks={marks} />
      </div>
    </div>
    {inBook ? null : (
      <>
        <Sep />
        <div style={{ height: 68, margin: "0 16px", display: "flex", alignItems: "center" }}>
          <Txt size={13} muted style={{ flex: 1 }}>
            <span data-m={m && `${m}page`}>{`صفحة ${hit.page} · ${availability}`}</span>
          </Txt>
          <Btn label="عرض الصفحة" icon="book-open" width={124} pressed={pressedOpen} style={{ marginLeft: 8 }} m={m && `${m}open`} />
          <IconBtn icon={downloaded ? "trash-2" : "download"} />
        </div>
      </>
    )}
  </Card>
);

export type ResultsProps = {
  heading?: string;
  description?: string;
  ui: SearchUI;
  count: string;
  chips?: string[];
  chipsIn?: number;
  hits: Hit[];
  marks: string[];
  scroll?: number;
  pressedOpen?: number;
  availability?: string;
  downloaded?: boolean;
  loading?: number; // 0..1 fades the list while a request is in flight
  bookGrid?: boolean;
  sortable?: boolean;
};

export const ResultsScreen: React.FC<ResultsProps> = ({ heading = "نتائج البحث", description, ui, count, chips = [], chipsIn = 1, hits, marks, scroll = 0, pressedOpen, availability, downloaded, loading = 0, bookGrid, sortable }) => {
  const listTop = chips.length ? 340 : 292;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Abs x={MAIN_X} y={PAGE_TOP} w={MAIN_W}>
        <Txt heading size={24}>
          {heading}
        </Txt>
        <Txt size={15} muted style={{ marginTop: 6 }}>
          {description ?? "ابحث في النصوص أو العناوين، ثم افتح الكتاب أو نزّله."}
        </Txt>
      </Abs>
      <SearchControls ui={ui} />
      <Abs x={MAIN_X} y={244} w={MAIN_W} h={36} style={{ display: "flex", alignItems: "center" }}>
        <Txt size={14} muted style={{ flex: 1 }}>
          <span data-m="count">{count}</span>
        </Txt>
        {sortable ? (
          <>
            <Txt size={14} muted style={{ marginLeft: 8 }}>
              الترتيب:
            </Txt>
            <Btn label="الأكثر صلة" icon="chevron-down" width={164} />
          </>
        ) : null}
      </Abs>
      {chips.length ? (
        <Abs x={MAIN_X} y={292} w={MAIN_W} style={{ display: "flex", gap: 8, opacity: chipsIn, transform: `translateY(${(1 - chipsIn) * -6}px)` }}>
          {chips.map((c) => (
            <Btn key={c} label={c} icon="x" iconLeft width={300} style={{ justifyContent: "space-between" }} />
          ))}
        </Abs>
      ) : null}
      <Abs x={MAIN_X} y={listTop} w={MAIN_W} h={788 - listTop} style={{ overflow: "hidden" }}>
        <div style={{ transform: `translateY(${-scroll}px)`, opacity: 1 - loading * 0.6 }}>
          {bookGrid ? (
            <BookGrid books={hits} category={hits[0]?.category ?? ""} availability={availability ?? ""} downloaded={downloaded} />
          ) : (
            hits.map((h, i) => <ResultCard key={i} m={`r${i}`} hit={h} marks={marks} pressedOpen={i === 0 ? pressedOpen : undefined} availability={availability} downloaded={downloaded} />)
          )}
        </div>
      </Abs>
    </div>
  );
};

// ---------- reader ----------

export type ReaderProps = {
  mode: "text" | "split" | "pdf";
  split: number; // pdf share of the width
  textSize: number;
  tashkeel: boolean;
  night: number; // 0..1 PDF night colours
  query: string;
  matchIndex: number;
  matchCount?: number;
  bookmarked: boolean;
  availability: string;
  page: number;
  textScroll?: number;
  pdfScroll?: number;
  pressed?: Partial<Record<"search" | "bookmark" | "options" | "menu" | "text" | "split" | "pdf" | "next" | "back", number>>;
  focused?: Partial<Record<"options" | "menu" | "search", boolean>>;
  dragging?: boolean;
  matchBar?: number;
};

const stripTashkeel = (s: string) => s.replace(/[ً-ْٰ]/g, "");
export const READER = {
  toolbarY: 144,
  search: { x: 1040, w: 88 },
  bookmark: { x: 1004, w: 36 },
  copy: { x: 968, w: 36 },
  options: { x: 840, w: 128 },
  menu: { x: 804, w: 36 },
  tabs: { pdf: { x: 156, w: 72 }, split: { x: 236, w: 132 }, text: { x: 376, w: 60 } },
};

export const readerPanes = (split: number, mode: ReaderProps["mode"]) => {
  const available = APP_W - 48;
  if (mode !== "split") return { pdf: available, text: available };
  const a = available - 16;
  const pdf = Math.round(Math.max(240, Math.min(a - 240, a * split)));
  return { pdf, text: a - pdf };
};

export const ReaderScreen: React.FC<ReaderProps> = (props) => {
  const pal = usePal();
  const { mode, split, textSize, tashkeel, night, query, matchIndex, bookmarked, availability, page, textScroll = 0, pdfScroll = 0, pressed = {}, focused = {}, matchBar = 1 } = props;
  const r = demo.riyad;
  const rawText = (demo.pages as Record<string, string>)[String(page)] ?? "";
  const text = tashkeel ? rawText : stripTashkeel(rawText);
  const showBar = query.length > 0;
  const paneTop = PAGE_TOP + 132 + (showBar ? 44 * matchBar : 0);
  const paneH = 788 - paneTop - 88;
  const panes = readerPanes(split, mode);
  const marks = query ? [query] : [];
  const count = props.matchCount ?? 0;
  const pdfW = mode === "text" ? 0 : panes.pdf;
  const textLeft = 24 + (mode === "split" ? panes.pdf + 16 : 0);
  const pageImgW = Math.min(pdfW - 24, 600);
  // PDF pages follow the app theme («حسب المظهر»): night colours in dark mode.
  const nightAmt = Math.max(night, pal.dark ? 1 : 0);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* header */}
      <Abs x={72} y={PAGE_TOP - 2} w={1064}>
        <Txt heading size={22} style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
          {r.title}
        </Txt>
      </Abs>
      <Abs x={24} y={PAGE_TOP - 4}>
        <IconBtn icon="arrow-left" pressed={pressed.back} />
      </Abs>
      <Abs x={208} y={PAGE_TOP + 36} w={928}>
        <Txt size={14} muted>
          {r.author}
        </Txt>
      </Abs>
      <Abs x={24} y={PAGE_TOP + 36} w={176}>
        <Txt size={13} muted style={{ textAlign: "left" }}>
          {availability}
        </Txt>
      </Abs>
      {/* toolbar */}
      <Abs x={24} y={READER.toolbarY} w={1112} h={48} style={{ background: pal.surface, borderRadius: RADIUS }}>
        <Abs x={READER.search.x - 24} y={6}>
          <Btn label="بحث" icon="search" variant="ghost" width={READER.search.w} pressed={pressed.search} focused={focused.search} />
        </Abs>
        <Abs x={READER.bookmark.x - 24} y={6}>
          <IconBtn icon={bookmarked ? "bookmark-check" : "bookmark"} selected={bookmarked} pressed={pressed.bookmark} />
        </Abs>
        <Abs x={READER.copy.x - 24} y={6}>
          <IconBtn icon="copy" />
        </Abs>
        <Abs x={READER.options.x - 24} y={6}>
          <Btn label="خيارات القراءة" variant="ghost" width={128} pressed={pressed.options} selected={focused.options} />
        </Abs>
        <Abs x={READER.menu.x - 24} y={6}>
          <IconBtn icon="ellipsis" pressed={pressed.menu} selected={focused.menu} />
        </Abs>
        <Abs x={READER.tabs.text.x - 24} y={6}>
          <Btn label="النص" selected={mode === "text"} width={READER.tabs.text.w} pressed={pressed.text} />
        </Abs>
        <Abs x={READER.tabs.split.x - 24} y={6}>
          <Btn label="النص والصورة" selected={mode === "split"} width={READER.tabs.split.w} pressed={pressed.split} />
        </Abs>
        <Abs x={READER.tabs.pdf.x - 24} y={6}>
          <Btn label="الصورة" selected={mode === "pdf"} width={READER.tabs.pdf.w} pressed={pressed.pdf} />
        </Abs>
        {mode !== "text" ? (
          <Abs x={8} y={6} style={{ display: "flex", direction: "ltr" }}>
            <IconBtn icon="page-fit" disabled />
            <IconBtn icon="zoom-out" />
            <IconBtn icon="zoom-in" />
          </Abs>
        ) : null}
      </Abs>
      {/* match bar */}
      {showBar ? (
        <Abs x={24} y={PAGE_TOP + 132} w={1112} h={36} style={{ display: "flex", alignItems: "center", opacity: matchBar }}>
          <Txt size={15} color={pal.primary} style={{ flex: 1 }}>{`البحث: ${query}`}</Txt>
          <Txt size={14} muted style={{ width: 164, textAlign: "center" }}>{`${count ? matchIndex + 1 : 0} / ${count} في الصفحة`}</Txt>
          <IconBtn icon="arrow-right" />
          <IconBtn icon="arrow-left" pressed={pressed.next} />
          <IconBtn icon="x" />
        </Abs>
      ) : null}
      {/* pdf pane */}
      {mode !== "text" ? (
        <Abs x={24} y={paneTop} w={pdfW} h={paneH} style={{ borderRadius: RADIUS, border: `1px solid ${pal.line}`, background: pal.surface, overflow: "hidden", boxSizing: "border-box" }}>
          <div data-m="pdfimg" style={{ position: "absolute", left: (pdfW - pageImgW) / 2, top: 12 - pdfScroll, width: pageImgW }}>
            <div style={{ position: "relative", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <Img src={staticFile(`pdf/riyad-${page}.png`)} style={{ width: pageImgW, display: "block" }} />
              {nightAmt > 0 ? (
                <Img
                  src={staticFile(`pdf/riyad-${page}.png`)}
                  style={{ position: "absolute", inset: 0, width: pageImgW, opacity: nightAmt, filter: "invert(0.92) hue-rotate(180deg) sepia(0.25) brightness(0.92)" }}
                />
              ) : null}
            </div>
          </div>
        </Abs>
      ) : null}
      {/* divider */}
      {mode === "split" ? (
        <Abs x={24 + panes.pdf} y={paneTop} w={16} h={paneH}>
          <div style={{ position: "absolute", left: 7.5, top: 4, bottom: 4, width: 1, background: pal.line }} />
          <div style={{ position: "absolute", left: 0, top: paneH / 2 - 12, width: 16, height: 24, background: props.dragging ? pal.accent : pal.paper, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="grip-vertical" size={16} color={pal.muted} />
          </div>
        </Abs>
      ) : null}
      {/* text pane */}
      {mode !== "pdf" ? (
        <Abs x={textLeft} y={paneTop} w={panes.text} h={paneH} style={{ background: pal.card, border: `1px solid ${pal.line}`, borderRadius: RADIUS, overflow: "hidden", boxSizing: "border-box" }}>
          <div data-m="text" style={{ margin: 20, transform: `translateY(${-textScroll}px)`, fontFamily: READING_FONT, fontSize: textSize, lineHeight: `${Math.round(textSize * 1.55 + 8)}px`, color: pal.ink, whiteSpace: "pre-wrap" }}>
            <Highlighted text={text} marks={marks} current={matchIndex} />
          </div>
        </Abs>
      ) : null}
      {/* pagination */}
      <Abs x={24} y={788 - 68} w={1112} h={52} style={{ background: pal.card, border: `1px solid ${pal.line}`, borderRadius: RADIUS, boxSizing: "border-box" }} />
      <Abs x={(APP_W - 360) / 2} y={788 - 60} w={360} h={36} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0 }}>
        <IconBtn icon="chevrons-right" />
        <IconBtn icon="arrow-right" />
        <Txt size={14} muted style={{ width: 52, textAlign: "center" }}>
          الصفحة
        </Txt>
        <Field value={String(page)} width={76} height={36} size={16} style={{ justifyContent: "center", padding: 0 }} />
        <Txt size={14} muted style={{ width: 68, textAlign: "center" }}>{`من ${r.filePages}`}</Txt>
        <IconBtn icon="arrow-left" />
        <IconBtn icon="chevrons-left" />
      </Abs>
    </div>
  );
};

// ---------- categories / category page ----------

export const CategoriesScreen: React.FC<{ filter: string; caret?: boolean; focused?: boolean; pressedRow?: number }> = ({ filter, caret, focused, pressedRow }) => {
  const pal = usePal();
  const cats = demo.categories.filter((c) => c.name.includes(filter.trim()));
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Abs x={MAIN_X} y={PAGE_TOP} w={MAIN_W}>
        <Txt heading size={24}>
          التصنيفات
        </Txt>
        <Txt size={15} muted style={{ marginTop: 6 }}>
          اختر مجالًا لاستكشاف كتبه، أو ابحث عن تصنيف.
        </Txt>
      </Abs>
      <Abs x={MAIN_X} y={PAGE_TOP + 72}>
        <Field value={filter} placeholder="اسم التصنيف…" caret={caret} focused={focused} width={MAIN_W} />
      </Abs>
      <Abs x={MAIN_X} y={PAGE_TOP + 140} w={MAIN_W} h={788 - PAGE_TOP - 140} style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", flexWrap: "wrap", columnGap: 24 }}>
          {cats.slice(0, 18).map((c, i) => (
            <div key={c.id} style={{ width: (MAIN_W - 24) / 2, position: "relative" }}>
              {pressedRow && i === 0 ? <div style={{ position: "absolute", inset: "4px -8px", background: pal.accent, opacity: pressedRow, borderRadius: RADIUS }} /> : null}
              <div style={{ display: "flex", alignItems: "center", padding: "16px 0", position: "relative" }}>
                <Txt size={16} style={{ flex: 1 }} m={i === 0 ? "catrow" : undefined}>
                  {c.name}
                </Txt>
                <Txt size={13} muted>
                  {fmt(c.count)} كتاب
                </Txt>
              </div>
              <Sep />
            </div>
          ))}
        </div>
      </Abs>
    </div>
  );
};

export const BookGrid: React.FC<{ books: { title: string; author: string; page?: number; pages?: number; files?: number }[]; category: string; availability: string; downloaded?: boolean }> = ({ books, category, availability, downloaded }) => (
  <div style={{ display: "flex", flexWrap: "wrap", columnGap: 24 }}>
    {books.map((b) => (
      <Card key={b.title} style={{ width: (MAIN_W - 24) / 2, marginBottom: 16 }}>
        <div style={{ padding: 16, height: 128, boxSizing: "border-box" }}>
          <BookHeading category={category} title={b.title} author={b.author} titleSize={19} />
        </div>
        <Sep />
        <div style={{ height: 60, margin: "0 16px", display: "flex", alignItems: "center" }}>
          <Txt size={13} muted style={{ flex: 1 }}>{`${fmt(b.pages ?? b.page ?? 0)} صفحة · ${b.files ?? 1} ملف · ${availability}`}</Txt>
          <Btn label="قراءة" icon="book-open" width={110} style={{ marginLeft: 8 }} />
          <IconBtn icon={downloaded ? "trash-2" : "download"} />
        </div>
      </Card>
    ))}
  </div>
);

export const CategoryPage: React.FC<{ name: string; books: { title: string; author: string; pages: number; files: number }[]; pressedDownload?: number }> = ({ name, books, pressedDownload }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    <Abs x={MAIN_X + 192} y={PAGE_TOP} w={MAIN_W - 192}>
      <Txt heading size={24}>
        {name}
      </Txt>
    </Abs>
    <Abs x={MAIN_X} y={PAGE_TOP}>
      <Btn label="تنزيل التصنيف" icon="download" width={180} pressed={pressedDownload} m="catdl" />
    </Abs>
    <Abs x={MAIN_X} y={PAGE_TOP + 38} w={MAIN_W}>
      <Txt size={15} muted>
        ابحث في النصوص أو العناوين، ثم افتح الكتاب أو نزّله.
      </Txt>
    </Abs>
    <SearchControls ui={{ mode: "books", scope: "all", query: "" }} />
    <Abs x={MAIN_X} y={244} w={MAIN_W} h={36} style={{ display: "flex", alignItems: "center" }}>
      <Txt size={14} muted>45 نتيجة · كل المكتبة</Txt>
    </Abs>
    <Abs x={MAIN_X} y={292} w={MAIN_W} h={788 - 292} style={{ overflow: "hidden" }}>
      <BookGrid books={books} category={name} availability="متاح عبر الإنترنت" />
    </Abs>
  </div>
);

// ---------- downloads ----------

export type DownloadsProps = {
  done: number;
  total: number;
  fraction: number; // current book progress
  current: string;
  paused: boolean;
  pressedPause?: number;
  ready: number; // books available offline
};

export const DownloadsScreen: React.FC<DownloadsProps> = ({ done, total, fraction, current, paused, pressedPause, ready }) => {
  const pal = usePal();
  const mb = (fraction * 6.4).toFixed(1);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Abs x={MAIN_X} y={PAGE_TOP} w={MAIN_W}>
        <Txt heading size={24}>
          التنزيلات والمساحة
        </Txt>
        <Txt size={15} muted style={{ marginTop: 6 }}>{`${fmt(ready)} كتاب متاح دون اتصال · PDF: ${(ready * 7.9).toFixed(0)} MB · النص والفهرس: ${(ready * 1.3).toFixed(1)} MB`}</Txt>
      </Abs>
      <Abs x={MAIN_X} y={PAGE_TOP + 72} w={MAIN_W} style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Btn label="الكل" selected width={88} />
        <Btn label="غير المكتملة" width={112} />
        <Btn label="المكتملة" width={80} />
        <div style={{ flex: 1 }} />
        <Btn label="كتبي المحمّلة" width={140} />
        <Btn label="مسح الصور المؤقتة" variant="ghost" width={186} />
      </Abs>
      <Abs x={MAIN_X} y={PAGE_TOP + 124} w={MAIN_W}>
        <Txt size={14} muted>
          يمكنك إيقاف التنزيل ومتابعته. يُحفظ تقدمك عند إغلاق التطبيق.
        </Txt>
      </Abs>
      <Abs x={MAIN_X} y={PAGE_TOP + 164} w={MAIN_W}>
        <Card style={{ padding: 16 }} m="dlcard">
          <div style={{ display: "flex", alignItems: "center", height: 36 }}>
            <Txt size={20} style={{ flex: 1 }}>
              كتب ابن القيم
            </Txt>
            <Btn label="عرض الكتب" icon="chevron-down" variant="ghost" width={144} />
          </div>
          <Txt size={14} muted style={{ marginTop: 4 }}>
            <span style={{ direction: "ltr", unicodeBidi: "isolate" }}>{`${done} / ${total}`}</span> كتاب مكتمل
          </Txt>
          <Txt size={14} muted style={{ marginTop: 8 }}>
            {paused ? "متوقف مؤقتًا · يمكنك المتابعة لاحقًا" : `${current}  ·  ${mb} MB / 6.4 MB`}
          </Txt>
          <Progress fraction={(done + (paused ? 0 : fraction)) / total} height={14} style={{ marginTop: 10 }} />
          <div style={{ height: 48, marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
            {paused ? <Btn label="متابعة التنزيل" icon="play" width={158} pressed={pressedPause} m="dlpause" /> : <Btn label="إيقاف مؤقت" icon="pause" width={144} pressed={pressedPause} m="dlpause" />}
            <Btn label="إلغاء التنزيل" variant="ghost" width={124} />
          </div>
        </Card>
        <Card style={{ padding: 16, marginTop: 0 }}>
          <div style={{ display: "flex", alignItems: "center", height: 52 }}>
            <div style={{ flex: 1 }}>
              <Txt size={18}>رياض الصالحين - النووي - ت الأرناؤوط ط3</Txt>
              <Txt size={13} muted style={{ marginTop: 6 }}>
                ابو زكريا محي الدين يحيى بن شرف بن حزم النووي · 12.6 MB · متاح دون اتصال
              </Txt>
            </div>
            <Btn label="قراءة" icon="book-open" width={122} style={{ marginLeft: 12 }} />
            <Btn label="إزالة النسخة المحمّلة" icon="trash-2" variant="ghost" width={180} />
          </div>
        </Card>
        <div style={{ height: 1, background: "transparent", borderColor: pal.line }} />
      </Abs>
    </div>
  );
};
