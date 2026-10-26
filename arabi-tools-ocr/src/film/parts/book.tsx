import React from 'react';
import {Img, staticFile} from 'remotion';
import pages from '../../data/ocr.json';
import {BODY, MONO, TRANSCRIPT} from '../../lib/fonts';
import {C} from '../../theme';
import {Icon, Panel, SOLID} from './kit';

export const BOOK_FILE = 'تاريخ-الطبري.pdf';
export const BOOK_NAME = 'تاريخ الرسل والملوك';
export const OCR_PAGES = pages;
// Literal slices of the live site's output. No spelling or punctuation is repaired.
const excerpt = (page: number, from: string, until?: string) => {
  const text = pages[page - 1].content;
  const a = text.indexOf(from);
  const b = until ? text.indexOf(until, a + from.length) : text.indexOf('\n', a);
  if (a < 0 || b < a) throw new Error(`OCR excerpt missing: ${from}`);
  return text.slice(a, b);
};
export const EXCERPT = excerpt(1, 'عجبت لمن أيقن بالموت', ' وكان تدبير');
export const ARABIC_LINE = excerpt(1, 'عجبت لمن أيقن بالموت', ' عجبت لمن أيقن بالحساب');
export const LATIN = excerpt(1, '6) Tn et BM');
export const PREVIEWS = [
  EXCERPT,
  excerpt(2, 'عليه وعلوم بالغرق'),
];

export const Scan: React.FC<{page?: number; width: number; style?: React.CSSProperties}> = ({page = 1, width, style}) => (
  <Img src={staticFile(`scans/page-${page}.jpg`)} style={{display:'block',width,height:'auto',borderRadius:8,boxShadow:'0 26px 65px -24px rgba(74,52,30,.38)',...style}} />
);

export const PdfCard: React.FC<{width: number; scale?: number}> = ({width,scale:s=1}) => (
  <Panel radius={26*s} style={{width,padding:28*s,direction:'rtl',display:'flex',alignItems:'center',gap:24*s}}>
    <div style={{width:72*s,height:86*s,borderRadius:16*s,background:C.greenSoft,display:'grid',placeItems:'center',flexShrink:0}}>
      <Icon d={SOLID.doc} solid size={42*s} color={C.green}/>
    </div>
    <div>
      <div style={{fontFamily:BODY,fontSize:32*s,fontWeight:600,color:C.text}}>{BOOK_FILE}</div>
      <div style={{fontFamily:MONO,fontSize:23*s,color:C.faint,direction:'ltr',textAlign:'right',marginTop:6}}>PDF · 2 pages · 528 KB</div>
    </div>
  </Panel>
);
export const OcrText: React.FC<{text?: string; size: number; style?: React.CSSProperties}> = ({text=EXCERPT,size,style}) => (
  <div dir="rtl" style={{fontFamily:TRANSCRIPT,fontSize:size,lineHeight:1.85,color:C.text,whiteSpace:'pre-wrap',...style}}>{text}</div>
);
