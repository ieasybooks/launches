import React from "react";
import { Btn, Field, Icon, IconBtn, Progress, Sep, Txt, usePal } from "./kit";
import { APP_H, APP_W, RADIUS, STATUS_H } from "./theme";
import { ResultCard } from "./screens";
import demo from "../data/demo.json";

/** Dialog shell from dialogs.rb: backdrop, panel, title row with close/back, separator at 56. */
export const DialogFrame: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title?: string;
  back?: boolean;
  menu?: boolean;
  appear: number; // 0..1
  popup?: boolean;
  backdrop?: number;
  closePressed?: number;
  children?: React.ReactNode;
}> = ({ x, y, w, h, title, back, menu, appear, popup, backdrop, closePressed, children }) => {
  const pal = usePal();
  if (appear <= 0) return null;
  const alpha = backdrop ?? (popup ? 0.1 : 0.28);
  const offset = (1 - appear) * (popup ? -5 : 8);
  const pad = menu ? 8 : 16;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: APP_W, height: APP_H, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${alpha * appear})` }} />
      <div
        style={{
          position: "absolute",
          left: x,
          top: y + offset,
          width: w,
          height: h,
          opacity: appear,
          background: pal.card,
          border: `1px solid ${pal.line}`,
          borderRadius: RADIUS,
          boxSizing: "border-box",
          boxShadow: pal.dark ? "0 18px 40px rgba(0,0,0,0.35)" : "0 18px 40px rgba(78,63,59,0.14)",
          overflow: "hidden",
        }}
      >
        {!menu && title ? (
          <>
            <div style={{ position: "absolute", left: pad, right: pad, top: 12, height: 36, display: "flex", alignItems: "center" }}>
              <Txt heading size={20} style={{ flex: 1 }}>
                {title}
              </Txt>
              <IconBtn icon={back ? "arrow-right" : "x"} pressed={closePressed} m={`close-${title}`} />
            </div>
            <Sep style={{ position: "absolute", left: pad, right: pad, top: 56 }} />
          </>
        ) : null}
        <div style={{ position: "absolute", left: pad, right: pad, top: menu ? 8 : 64, bottom: pad }}>{children}</div>
      </div>
    </div>
  );
};

const Row: React.FC<{ y: number; h?: number; children?: React.ReactNode; style?: React.CSSProperties }> = ({ y, h = 36, children, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, height: h, display: "flex", alignItems: "center", ...style }}>{children}</div>
);

// ---- select menu (dropdown) ----
export const SelectMenu: React.FC<{ x: number; y: number; items: string[]; selected: number; hover?: number; pressed?: number; appear: number }> = ({ x, y, items, selected, hover = -1, pressed, appear }) => {
  const pal = usePal();
  return (
    <DialogFrame x={x} y={y} w={220} h={12 + items.length * 44} menu popup backdrop={0} appear={appear}>
      {items.map((label, i) => (
        <div
          key={label}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: i * 44,
            height: 40,
            borderRadius: RADIUS,
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            gap: 10,
            background: i === hover ? pal.accent : "transparent",
            transform: i === hover && pressed ? `scale(${1 - 0.03 * pressed})` : undefined,
          }}
        >
          <Txt size={15} style={{ flex: 1 }}>
            {label}
          </Txt>
          {i === selected ? <Icon name="check" size={16} color={pal.primary} /> : null}
        </div>
      ))}
    </DialogFrame>
  );
};

// ---- filters ----
export const FILTERS_BOX = { x: 376, y: 256, w: 408, h: 308 };
export const FiltersDialog: React.FC<{ appear: number; author?: string; pressed?: Partial<Record<"author" | "apply", number>> }> = ({ appear, author, pressed = {} }) => (
  <DialogFrame {...FILTERS_BOX} title="خيارات البحث" appear={appear}>
    <Txt size={14} muted>
      يمكنك الجمع بين الخيارات لتحديد نطاق البحث.
    </Txt>
    {[
      ["المكتبة", "الجميع"],
      ["التصنيف", "الجميع"],
      ["المؤلف", author ?? "الجميع"],
    ].map(([label, value], i) => (
      <Row key={label} y={32 + i * 48} h={40}>
        <Txt size={15} style={{ width: 76 }}>
          {label}
        </Txt>
        <Btn label={value} icon="chevron-down" width={300} height={40} align="right" style={{ justifyContent: "space-between", overflow: "hidden" }} pressed={i === 2 ? pressed.author : undefined} m={`frow${i}`} />
      </Row>
    ))}
    <Sep style={{ position: "absolute", left: 0, right: 0, top: 180 }} />
    <Row y={192}>
      <Btn label="مسح التصفية" variant="ghost" width={124} />
      <div style={{ flex: 1 }} />
      <Btn label="تطبيق" variant="solid" width={104} pressed={pressed.apply} m="fapply" />
    </Row>
  </DialogFrame>
);

export const AUTHORS_BOX = { x: 376, y: 180, w: 408, h: 460 };
export const AuthorsDialog: React.FC<{ appear: number; query: string; caret?: boolean; results: number; hover?: number; pressed?: number }> = ({ appear, query, caret, results, hover = -1, pressed }) => {
  const pal = usePal();
  return (
    <DialogFrame {...AUTHORS_BOX} title="اختر المؤلف" back appear={appear} backdrop={0.28}>
      <Row y={0} h={40}>
        <Field value={query} placeholder="اسم المؤلف…" caret={caret} focused width={282} height={40} size={16} />
        <div style={{ flex: 1 }} />
        <Btn label="بحث" variant="solid" width={82} height={40} />
      </Row>
      <div style={{ position: "absolute", left: 0, right: 0, top: 48 }}>
        <Btn label="جميع المؤلفين" width="100%" align="right" />
        <div style={{ marginTop: 8, opacity: results }}>
          {demo.authors.slice(0, 5).map((a, i) => (
            <div key={a.id} data-m={`arow${i}`} style={{ height: 44, borderRadius: RADIUS, display: "flex", alignItems: "center", padding: "0 12px", background: i === hover ? pal.accent : "transparent", transform: i === hover && pressed ? `scale(${1 - 0.02 * pressed})` : undefined }}>
              <Txt size={15} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {a.name}
              </Txt>
            </div>
          ))}
        </div>
      </div>
    </DialogFrame>
  );
};

// ---- reader options popover ----
export const OPTIONS_BOX = { x: 584, y: 194, w: 384, h: 384 };
export const ReaderOptions: React.FC<{
  appear: number;
  textSize: number;
  tashkeel: number; // switch position 0..1
  appearance: "auto" | "original" | "night";
  split: number;
  pressed?: Partial<Record<"plus" | "switch" | "night", number>>;
}> = ({ appear, textSize, tashkeel, appearance, split, pressed = {} }) => {
  const pal = usePal();
  return (
    <DialogFrame {...OPTIONS_BOX} title="خيارات القراءة" popup appear={appear}>
      <Row y={0}>
        <Txt size={16} style={{ flex: 1 }}>
          حجم النص
        </Txt>
        <IconBtn icon="plus" pressed={pressed.plus} style={{ border: `1px solid ${pal.line}`, width: 44 }} m="opt-plus" />
        <Txt size={16} style={{ width: 52, textAlign: "center" }}>
          {textSize}
        </Txt>
        <IconBtn icon="minus" style={{ border: `1px solid ${pal.line}`, width: 44 }} />
      </Row>
      <Row y={48}>
        <Txt size={16} style={{ flex: 1 }}>
          إظهار التشكيل
        </Txt>
        <Txt size={13} muted style={{ width: 56, textAlign: "center" }}>
          {tashkeel > 0.5 ? "مفعّل" : "متوقف"}
        </Txt>
        <div data-m="opt-switch" style={{ width: 40, height: 22, borderRadius: 11, background: tashkeel > 0.5 ? pal.primary : pal.line, position: "relative", transform: pressed.switch ? `scale(${1 - 0.05 * pressed.switch})` : undefined }}>
          <div style={{ position: "absolute", top: 2, right: 2 + (1 - tashkeel) * 18, width: 18, height: 18, borderRadius: 9, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />
        </div>
      </Row>
      <Txt size={16} style={{ position: "absolute", top: 100 }}>
        ألوان صفحات PDF
      </Txt>
      <Row y={136} style={{ gap: 8 }}>
        {(
          [
            ["auto", "حسب المظهر"],
            ["original", "الأصلية"],
            ["night", "ليلية"],
          ] as const
        ).map(([k, label]) => (
          <Btn key={k} label={label} selected={appearance === k} width={(352 - 16) / 3} pressed={k === "night" ? pressed.night : undefined} m={`opt-${k}`} />
        ))}
      </Row>
      <Sep style={{ position: "absolute", left: 0, right: 0, top: 188 }} />
      <Txt size={16} style={{ position: "absolute", top: 204 }}>
        مساحة النص والصورة
      </Txt>
      <Row y={236} style={{ gap: 8 }}>
        {(
          [
            [0.35, "نص أوسع"],
            [0.5, "متساويان"],
            [0.65, "صورة أوسع"],
          ] as const
        ).map(([r, label]) => (
          <Btn key={label} label={label} selected={Math.abs(split - r) < 0.02} width={(352 - 16) / 3} />
        ))}
      </Row>
      <Txt size={13} muted style={{ position: "absolute", top: 288 }}>
        تُحفظ اختياراتك تلقائيًا.
      </Txt>
    </DialogFrame>
  );
};

// ---- reader tools menu ----
export const MENU_BOX = { x: 536, y: 194, w: 304, h: 216 };
export const ReaderMenu: React.FC<{ appear: number; hover?: number; pressed?: number }> = ({ appear, hover = -1, pressed }) => {
  const pal = usePal();
  const items: [string, string][] = [
    ["الفواصل المحفوظة", "bookmark"],
    ["تنزيل الكتاب وتصديره", "download"],
    ["مشاركة الصفحة", "share-2"],
    ["اختصارات لوحة المفاتيح", "keyboard"],
    ["حفظ صورة الصفحة", "image-down"],
  ];
  return (
    <DialogFrame {...MENU_BOX} menu popup appear={appear}>
      {items.map(([label, icon], i) => (
        <div
          key={label}
          data-m={`menu${i}`}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: i * 44,
            height: i === 4 ? 36 : 40,
            borderRadius: RADIUS,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 12px",
            background: i === hover ? pal.accent : "transparent",
            transform: i === hover && pressed ? `scale(${1 - 0.03 * pressed})` : undefined,
          }}
        >
          <Icon name={icon} size={16} />
          <Txt size={15}>{label}</Txt>
        </div>
      ))}
    </DialogFrame>
  );
};

// ---- export / offline download ----
export const EXPORT_BOX = { x: 320, y: 314, w: 520, h: 192 };
export const ExportDialog: React.FC<{
  appear: number;
  download: number; // -1 idle, 0..1 progress, 2 done
  feedback: string;
  glow?: Partial<Record<"pdf" | "txt" | "docx", number>>;
  pressed?: Partial<Record<"download" | "pdf" | "txt" | "docx" | "close", number>>;
  saving?: number; // file save progress 0..1, -1 hidden
}> = ({ appear, download, feedback, glow = {}, pressed = {}, saving = -1 }) => {
  const pal = usePal();
  const done = download >= 2;
  const busy = download >= 0 && !done;
  const label = done ? "متاح للقراءة والبحث دون اتصال" : busy ? "جارٍ تنزيل الكتاب…" : "تنزيل الكتاب للقراءة دون اتصال";
  return (
    <DialogFrame {...EXPORT_BOX} title="تنزيل الملفات" appear={appear} closePressed={pressed.close}>
      <Btn label={label} icon={done ? "check" : "download"} width="100%" disabled={done || busy} pressed={pressed.download} style={done || busy ? { opacity: done ? 0.75 : 0.85 } : undefined} m="ex-dl" />
      {busy ? <Progress fraction={download} height={4} style={{ position: "absolute", left: 0, right: 0, top: 41 }} /> : null}
      <Txt size={14} muted style={{ position: "absolute", top: 48, right: 0 }}>
        {feedback}
      </Txt>
      {saving >= 0 ? <Progress fraction={saving} height={4} style={{ position: "absolute", left: 0, right: 0, top: 70 }} /> : null}
      <Row y={76} style={{ gap: 8 }}>
        {(["pdf", "txt", "docx"] as const).map((f) => (
          <div key={f} style={{ position: "relative" }}>
            <Btn label={f.toUpperCase()} width={(488 - 16) / 3} pressed={pressed[f]} style={{ fontFamily: "'Noto Naskh Arabic UI', sans-serif", letterSpacing: 0.5 }} m={`ex-${f}`} />
            {glow[f] ? (
              <div style={{ position: "absolute", inset: -3, borderRadius: RADIUS + 3, boxShadow: `0 0 0 2px ${pal.primary}`, opacity: glow[f] }} />
            ) : null}
          </div>
        ))}
      </Row>
    </DialogFrame>
  );
};

// ---- search inside the book ----
export const BOOK_SEARCH_BOX = { x: 220, y: 108, w: 720, h: 604 };
export const BookSearchDialog: React.FC<{ appear: number; query: string; caret?: boolean; selected?: boolean; results: number; grow?: number; pressedOpen?: number; pressedSubmit?: number; scroll?: number }> = ({
  appear,
  query,
  caret,
  selected,
  results,
  grow = 0,
  pressedOpen,
  pressedSubmit,
  scroll = 0,
}) => (
  <DialogFrame {...BOOK_SEARCH_BOX} title="بحث في الكتاب" appear={appear} y={BOOK_SEARCH_BOX.y + (1 - grow) * 226} h={152 + 452 * grow}>
    <Row y={0} h={40}>
      <Field value={query} placeholder="اكتب كلمة أو عبارة…" caret={caret} selected={selected} focused width={688 - 100} height={40} size={16} />
      <div style={{ flex: 1 }} />
      <Btn label="بحث" variant="solid" width={88} height={40} pressed={pressedSubmit} m="bs-submit" />
    </Row>
    {results > 0 ? (
      <>
        <Txt size={14} muted style={{ position: "absolute", top: 52, opacity: results }}>
          {`${demo.bookCount} نتيجة · متصل بالجامع`}
        </Txt>
        <div style={{ position: "absolute", left: 0, right: 0, top: 84, bottom: 0, overflow: "hidden", opacity: results }}>
          <div style={{ transform: `translateY(${-scroll}px)` }}>
            {demo.bookHits.slice(0, 3).map((h, i) => (
              <ResultCard key={i} inBook m={`bs${i}`} hit={{ ...h, title: "", author: "", category: "" }} marks={["الأعمال"]} pressedOpen={i === 0 ? pressedOpen : undefined} />
            ))}
          </div>
        </div>
      </>
    ) : (
      <Txt size={15} muted style={{ position: "absolute", top: 52 }}>
        اكتب كلمة أو عبارة. يمكنك البحث في كتبك المحمّلة دون اتصال أيضًا.
      </Txt>
    )}
  </DialogFrame>
);

// ---- saved bookmarks ----
export const BOOKMARKS_BOX = { x: 280, y: 322, w: 600, h: 176 };
export const BookmarksDialog: React.FC<{ appear: number }> = ({ appear }) => (
  <DialogFrame {...BOOKMARKS_BOX} title="الفواصل المحفوظة" appear={appear}>
    <Txt size={15} muted>
      مواضع محفوظة في هذا الكتاب، تبقى معك بعد إغلاق التطبيق.
    </Txt>
    <Row y={40} h={59}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Txt size={16}>صفحة 29</Txt>
        <Txt size={14} muted style={{ marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          بسم الله الرحمن الرحيم - باب الإخلاص وإحضار النية في جميع الأعمال والأقوال البارزة والخفية
        </Txt>
      </div>
      <Btn label="فتح الصفحة" width={120} style={{ marginRight: 12 }} m="bm-open" />
    </Row>
  </DialogFrame>
);

// ---- category download ----
export const CATEGORY_BOX = { x: 320, y: 288, w: 520, h: 244 };
export const CategoryDownloadDialog: React.FC<{ appear: number; scanned: number; total: number; pressedStart?: number }> = ({ appear, scanned, total, pressedStart }) => {
  const ready = scanned >= total;
  return (
    <DialogFrame {...CATEGORY_BOX} title="تنزيل التصنيف" appear={appear}>
      <Txt size={19}>كتب ابن القيم</Txt>
      <Txt size={14} muted style={{ position: "absolute", top: 32 }}>
        جميع كتب التصنيف مع PDF والنص للقراءة والبحث دون اتصال.
      </Txt>
      <Txt size={14} muted style={{ position: "absolute", top: 64 }}>
        {ready ? `${total} كتاب · 0 محمّل · 0 في التنزيلات` : `جارٍ جمع الكتب… ${scanned} / ${total}`}
      </Txt>
      {ready ? (
        <Txt size={15} style={{ position: "absolute", top: 88 }}>{`سيُنزّل ${total} كتاب.`}</Txt>
      ) : null}
      <Row y={244 - 64 - 16 - 36 + 0} style={{ gap: 12 }}>
        <Btn label="بدء التنزيل" variant="solid" width={176} disabled={!ready} pressed={pressedStart} m="catstart" />
        <Btn label="إغلاق" width={88} />
      </Row>
    </DialogFrame>
  );
};

// ---- settings ----
export const SETTINGS_BOX = { x: 280, y: 140, w: 600, h: 516 };
export const SettingsDialog: React.FC<{ appear: number; highlight?: number }> = ({ appear, highlight = 0 }) => {
  const pal = usePal();
  return (
    <DialogFrame {...SETTINGS_BOX} title="الإعدادات" appear={appear}>
      <Txt heading size={20}>
        المكتبة
      </Txt>
      <div style={{ position: "absolute", top: 40, left: 0, right: 0, height: 36, borderRadius: RADIUS, background: pal.surface, border: `1px solid ${pal.line}`, display: "flex", alignItems: "center", padding: "0 12px", direction: "ltr" }}>
        <Txt size={14}>~/Library/Application Support/Aljam3</Txt>
      </div>
      <Txt size={13} muted style={{ position: "absolute", top: 86 }}>
        المساحة المستخدمة: 412.6 MB
      </Txt>
      <Row y={116}>
        <Btn label="نقل المكتبة" icon="folder" width={150} />
        <Txt size={13} muted style={{ marginRight: 12 }}>
          نقل الكتب وبيانات القراءة إلى مجلد فارغ.
        </Txt>
      </Row>
      <Sep style={{ position: "absolute", left: 0, right: 0, top: 168 }} />
      <Txt heading size={20} style={{ position: "absolute", top: 180 }}>
        إحصاءات الاستخدام
      </Txt>
      <Txt size={13} muted style={{ position: "absolute", top: 214 }}>
        تُرسل إلى PostHog إحصاءات عن مدة القراءة واستخدام الميزات، دون عناوين الكتب أو نصوص البحث.
      </Txt>
      <Sep style={{ position: "absolute", left: 0, right: 0, top: 252 }} />
      <Txt heading size={20} style={{ position: "absolute", top: 266 }}>
        تحديثات التطبيق
      </Txt>
      <Txt size={14} muted style={{ position: "absolute", top: 302 }}>
        الإصدار الحالي: 0.0.3 · يتحقق الجامع من التحديثات تلقائيًا كل يوم.
      </Txt>
      <div style={{ position: "absolute", top: 334, left: -8, right: -8, height: 70, borderRadius: RADIUS, background: pal.accent, opacity: highlight * 0.8 }} />
      <Txt size={15} style={{ position: "absolute", top: 338 }} m="upd-ready">
        الإصدار 0.0.4 جاهز للتثبيت.
      </Txt>
      <Txt size={13} muted style={{ position: "absolute", top: 366 }} m="upd-note">
        سنحفظ موضع القراءة وتُستأنف تنزيلات الكتب بعد إعادة التشغيل.
      </Txt>
      <div style={{ position: "absolute", left: 0, top: 404 }}>
        <Btn label="إعادة التشغيل والتحديث" variant="solid" width={204} m="upd-btn" />
      </div>
    </DialogFrame>
  );
};

// ---- notification (feedback.rb) ----
export const Toast: React.FC<{ appear: number; message: string; detail: string; action?: string; inReader?: boolean }> = ({ appear, message, detail, action, inReader }) => {
  const pal = usePal();
  if (appear <= 0) return null;
  const h = action ? 112 : 80;
  const top = APP_H - STATUS_H - (inReader ? 92 : 12) - h;
  return (
    <div
      style={{
        position: "absolute",
        left: APP_W - 24 - 420,
        top: top + (1 - appear) * 6,
        width: 420,
        height: h,
        opacity: appear,
        background: pal.dark ? pal.paper : pal.surface,
        border: `1px solid ${pal.line}`,
        borderRadius: RADIUS,
        boxSizing: "border-box",
        boxShadow: "0 10px 30px rgba(78,63,59,0.12)",
      }}
    >
      <div style={{ position: "absolute", right: 12, left: 12, top: 8, height: 32, display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name="check" size={18} color={pal.primary} />
        <Txt size={15} style={{ flex: 1 }}>
          {message}
        </Txt>
        <IconBtn icon="x" size={28} />
      </div>
      <Txt size={14} muted style={{ position: "absolute", right: 16, left: 16, top: 43, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {detail}
      </Txt>
      {action ? (
        <div style={{ position: "absolute", right: 12, top: 76 }}>
          <Btn label={action} variant="ghost" width={150} height={28} size={14} />
        </div>
      ) : null}
    </div>
  );
};

