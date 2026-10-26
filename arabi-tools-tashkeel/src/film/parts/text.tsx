import React from 'react';
import lesson from '../../data/lesson.json';
import site from '../../data/site.json';
import {BODY, MONO, TRANSCRIPT} from '../../lib/fonts';
import {C} from '../../theme';
import {Icon, Panel, SOLID} from './kit';
import {Marked} from './marks';

// The live site's unedited results (scripts/diacritize_on_site.mjs, src/data/site.json).
export const HADITH = site['hadith-catt'].input;
export const HADITH_CATT = site['hadith-catt'].output;
export const HADITH_SHAKKELHA = site['hadith-shakkelha'].output;
// The sample Word document and the site's DOCX result for it (scripts/extract_docx.py).
export const DOC_FILE = lesson.file;
export const DOC_NAME = lesson.file.replace(/\.docx$/, '');
export const DOC_META = `DOCX · ${Math.round(lesson.bytes / 1000)} KB`;
export const LESSON_PLAIN = lesson.plain;
export const LESSON_MARKED = lesson.marked;
export const COUNT = `${Array.from(HADITH).length} / 1000 حرف`;

/** A Word document: tile, name and size. */
export const DocCard: React.FC<{width: number; scale?: number}> = ({width, scale: s = 1}) => (
  <Panel radius={26 * s} style={{width, padding: 28 * s, direction: 'rtl', display: 'flex', alignItems: 'center', gap: 24 * s}}>
    <div style={{width: 72 * s, height: 86 * s, borderRadius: 16 * s, background: C.greenSoft, display: 'grid', placeItems: 'center', flexShrink: 0}}>
      <Icon d={SOLID.doc} solid size={42 * s} color={C.green} />
    </div>
    <div>
      <div style={{fontFamily: BODY, fontSize: 32 * s, fontWeight: 600, color: C.text}}>{DOC_FILE}</div>
      <div style={{fontFamily: MONO, fontSize: 23 * s, color: C.faint, direction: 'ltr', textAlign: 'right', marginTop: 6}}>{DOC_META}</div>
    </div>
  </Panel>
);

const hit = (word: string) => word.includes('علم');

/** The lesson sheet as a page. Plain, it can mark every word that could be read several ways;
 *  diacritized (`k`), it shows the site's DOCX result with the marks arriving in gold. */
export const DocPage: React.FC<{width: number; size: number; marked?: boolean; k?: number; settle?: number; highlight?: number; header?: number; style?: React.CSSProperties}> = ({
  width, size, marked, k = 1, settle = 0, highlight = 0, header = 0, style,
}) => {
  const paras = marked ? LESSON_MARKED : LESSON_PLAIN;
  return (
    <div style={{width, background: '#fffdf8', borderRadius: 14, boxShadow: '0 40px 90px -30px rgba(74,52,30,.38), 0 0 0 1.5px rgba(74,52,30,.08)', overflow: 'hidden', ...style}}>
      {header > 0 && (
        <div style={{height: size * 1.7, background: C.well, opacity: header, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${size}px`, direction: 'rtl'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: size * 0.4, fontFamily: BODY, fontSize: size * 0.72, color: C.text, fontWeight: 600}}>
            <Icon d={SOLID.doc} solid size={size * 0.85} color={C.green} />{DOC_FILE}
          </div>
          <div style={{fontFamily: MONO, fontSize: size * 0.62, color: C.green, fontWeight: 700, letterSpacing: '0.06em'}}>DOCX</div>
        </div>
      )}
      <div style={{padding: `${size * 1.3}px ${size * 1.5}px ${size * 1.5}px`, direction: 'rtl'}}>
        {paras.map((p, i) =>
          marked ? (
            <Marked key={i} text={p} size={i === 0 ? size * 1.45 : size} k={k} settle={settle} lineHeight={i === 0 ? 1.7 : 1.95} style={{marginBottom: size * 0.55}} />
          ) : (
            <div key={i} dir="rtl" style={{fontFamily: TRANSCRIPT, fontSize: i === 0 ? size * 1.45 : size, lineHeight: i === 0 ? 1.7 : 1.95, color: C.text, marginBottom: size * 0.55}}>
              {p.split(/(\s+)/).map((w, j) =>
                hit(w) ? <span key={j} style={{background: `rgba(241,230,207,${highlight})`, boxShadow: `0 0 0 ${size * 0.12}px rgba(241,230,207,${highlight}), inset 0 -2px 0 rgba(164,130,74,${highlight})`, borderRadius: 4}}>{w}</span> : w,
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
};

/** An abstract page behind the sheet: ruled lines, no words. */
export const BlankPage: React.FC<{width: number; size: number; seed: number; height?: number}> = ({width, size, seed, height}) => (
  <div style={{width, height, overflow: 'hidden', background: '#fffdf8', borderRadius: 14, boxShadow: '0 40px 90px -30px rgba(74,52,30,.32), 0 0 0 1.5px rgba(74,52,30,.08)', padding: `${size * 1.6}px ${size * 1.5}px`, direction: 'rtl'}}>
    <div style={{height: size * 0.5, width: '42%', background: C.well, borderRadius: 99, marginBottom: size * 1.3, marginRight: 'auto', marginLeft: 'auto'}} />
    {Array.from({length: 11}, (_, i) => (
      <div key={i} style={{height: size * 0.32, width: `${i % 4 === 3 ? 55 + ((seed * 13 + i * 7) % 25) : 92 + ((seed + i * 3) % 8)}%`, background: C.well, borderRadius: 99, marginBottom: size * 0.95}} />
    ))}
  </div>
);
