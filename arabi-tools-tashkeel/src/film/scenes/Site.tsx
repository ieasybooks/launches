import React from 'react';
import {BODY,MONO,TRANSCRIPT} from '../../lib/fonts';
import {clamp,ease,lerp,life,ramp,useStage} from '../../lib/motion';
import {C} from '../../theme';
import {Button,Cursor,Display,Icon,OUTLINE,Ornament,Panel,Ripple,SOLID} from '../parts/kit';
import {Marked} from '../parts/marks';
import {COUNT,DOC_FILE,DOC_NAME,DocCard,DocPage,HADITH,HADITH_CATT} from '../parts/text';
import {T} from '../times';

// arabi.tools/diacritize, redrawn: paste text and pick CATT, get it back diacritized; then the
// same with a Word document, downloaded in its own format.
const click=(t:number,at:number)=>ramp(t,at,.08)*(1-ramp(t,at+.1,.18));
const STEPS=['الإدخال','التشكيل','النتيجة'];
export const RESULT_AT=T.result-.3;
export const RESET_AT=T.resultEnd+.32;
export const DOC_GO=T.word2+.4;
export const DOC_DONE=T.download+.04;
export const DROP_AT=T.word2+.02;

const layout=(P:boolean,W:number)=>{
  const L=P?{cardW:940,cardY:440,cardH:1150,pad:44,stepsY:38,legendY:192,chipsY:240,chipH:82,chipFont:34,chipW:[236,196],tabsY:356,tabH:78,headY:478,areaY:530,areaH:390,textSize:50,btnY:1010,btnSize:36,hintY:945,
    doneY:186,metaY:262,divY:322,resY:350,resH:320,resText:54,dlY:705,dlSize:30,dlW:[260,340],keepY:815,dropY:478,dropH:430,docDlW:[470,330],docDlY:360,docHintY:470}
   :{cardW:1320,cardY:262,cardH:690,pad:52,stepsY:30,legendY:154,chipsY:194,chipH:66,chipFont:30,chipW:[206,172],tabsY:282,tabH:62,headY:370,areaY:412,areaH:172,textSize:44,btnY:604,btnSize:31,hintY:-1,
    doneY:158,metaY:226,divY:276,resY:298,resH:186,resText:46,dlY:510,dlSize:27,dlW:[220,300],keepY:612,dropY:370,dropH:216,docDlW:[400,290],docDlY:304,docHintY:400};
  const cardX=(W-L.cardW)/2, inner=L.cardW-2*L.pad, right=cardX+L.cardW-L.pad;
  const btnH=L.btnSize*2.14;
  return {...L,cardX,inner,right,
    area:{x:cardX+L.cardW/2,y:L.cardY+L.areaY+L.areaH/2},
    chip:[{x:right-L.chipW[0]/2,y:L.cardY+L.chipsY+L.chipH/2},{x:right-L.chipW[0]-16-L.chipW[1]/2,y:L.cardY+L.chipsY+L.chipH/2}],
    tab:[{x:cardX+L.pad+inner*.75,y:L.cardY+L.tabsY+L.tabH/2},{x:cardX+L.pad+inner*.25,y:L.cardY+L.tabsY+L.tabH/2}],
    btn:{x:W/2,y:L.cardY+L.btnY+btnH/2},
    drop:{x:W/2,y:L.cardY+L.dropY+L.dropH/2},
    docDl:{x:right-L.docDlW[0]/2,y:L.cardY+L.docDlY+L.dlSize*1.1},
  };
};

/** Cursor position along timed key points, eased between them. */
const along=(t:number,keys:[number,number,number][])=>{
  if(t<=keys[0][0])return {x:keys[0][1],y:keys[0][2]};
  for(let i=1;i<keys.length;i++){
    const [t1,x1,y1]=keys[i];
    if(t<=t1){const [t0,x0,y0]=keys[i-1];const k=ease.inOut(clamp((t-t0)/Math.max(.01,t1-t0)));return {x:lerp(x0,x1,k),y:lerp(y0,y1,k)};}
  }
  const last=keys[keys.length-1];return {x:last[1],y:last[2]};
};

const Chip:React.FC<{label:string;on:number;ring:number;w:number;h:number;font:number;latin?:boolean}>=({label,on,ring,w,h,font,latin})=>
  <div style={{position:'relative',width:w,height:h,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',gap:font*.45,direction:'rtl',
    background:on>.5?C.greenSoft:C.surface,boxShadow:`inset 0 0 0 ${on>.5?2:1.5}px ${on>.5?C.green:C.line}${ring>0?`, 0 0 0 ${6*ring}px rgba(164,130,74,${.35*ring})`:''}`,color:on>.5?C.greenStrong:C.text,fontFamily:BODY,fontWeight:500,fontSize:font}}>
    <div style={{width:font*.62,height:font*.62,borderRadius:99,boxShadow:`inset 0 0 0 2px ${on>.5?C.green:C.faint}`,display:'grid',placeItems:'center'}}>
      <div style={{width:font*.32*on,height:font*.32*on,borderRadius:99,background:C.green}}/>
    </div>
    <span style={{direction:latin?'ltr':'rtl'}}>{label}</span>
  </div>;

export const Site: React.FC=()=>{
  const {W,P,t}=useStage();
  if(t<T.paste-.7||t>T.free)return null;
  const L=layout(P,W);
  const vis=life(t,T.paste-.65,T.free-.1,.45,.45);
  const go=T.go;
  const inputA=1-ramp(t,go+.1,.22);
  const runB=ramp(t,go+.1,.22)*(1-ramp(t,RESULT_AT,.28));
  const resC=ramp(t,RESULT_AT,.28)*(1-ramp(t,RESET_AT,.35));
  const inputD=ramp(t,RESET_AT,.35)*(1-ramp(t,DOC_GO+.05,.2));
  const runE=ramp(t,DOC_GO+.05,.2)*(1-ramp(t,DOC_DONE,.22));
  const resF=ramp(t,DOC_DONE,.22);
  const step=t<go+.1?0:t<RESULT_AT?1:t<RESET_AT?2:t<DOC_GO+.05?0:t<DOC_DONE?1:2;
  const focus=t>=T.write+.45;
  const pasted=t>=T.pasted;
  const flash=1-ramp(t,T.pasted,.6);
  const catt=ramp(t,T.catt+.03,.14);
  const tabDoc=ramp(t,T.upload+.07,.3,ease.inOut);
  const dropped=t>=DROP_AT;
  const pageAt=T.same-.2;
  const page=ramp(t,pageAt,.55,ease.out);
  const cursorKeys:[number,number,number][]=[
    [T.write-.25,W+60,L.cardY+L.cardH],
    [T.write+.4,L.area.x+150,L.area.y-20],
    [T.choose+.05,L.area.x+150,L.area.y-20],
    [T.shakkelha-.05,L.chip[0].x+20,L.chip[0].y+10],
    [T.catt-.12,L.chip[1].x+10,L.chip[1].y+10],
    [T.catt+.25,L.chip[1].x+10,L.chip[1].y+10],
    [go-.1,L.btn.x+20,L.btn.y+4],
    [go+.6,L.btn.x+60,L.btn.y+90],
    [RESET_AT+.2,L.tab[1].x+220,L.tab[1].y+160],
    [T.upload+.02,L.tab[1].x,L.tab[1].y+6],
    [T.upload+.25,L.tab[1].x,L.tab[1].y+6],
    [T.txt-.2,W+90,L.drop.y+220],
    [DROP_AT-.02,L.drop.x+170,L.drop.y+40],
    [DROP_AT+.1,L.drop.x+170,L.drop.y+40],
    [DOC_GO-.08,L.btn.x+20,L.btn.y+4],
    [DOC_GO+.12,L.btn.x+20,L.btn.y+4],
    [T.download+.3,L.docDl.x+30,L.docDl.y+4],
  ];
  const cur=along(t,cursorKeys);
  const docDl=T.download+.38;
  const clicks=[T.write+.45,T.catt+.02,go,T.upload+.07,DOC_GO,docDl];
  const cursorVis=Math.max(life(t,T.write-.25,go+.55,.2,.25),life(t,RESET_AT+.15,pageAt+.1,.25,.2));
  const fly=ramp(t,T.txt-.2,DROP_AT-(T.txt-.2),ease.inOut), sink=ramp(t,DROP_AT,.3);
  const stepsRow=<div style={{position:'absolute',left:L.pad,right:L.pad,top:L.stepsY,display:'flex',justifyContent:'center',direction:'rtl',gap:P?40:70}}>
    {STEPS.map((label,i)=><div key={label} style={{width:P?230:250,textAlign:'center',fontFamily:BODY,color:i===step?C.text:C.faint}}>
      <div style={{margin:'0 auto',width:54,height:54,borderRadius:999,display:'grid',placeItems:'center',fontFamily:MONO,fontSize:27,background:i===step?C.green:i<step?C.greenSoft:'transparent',border:`1.5px solid ${i===step?C.green:C.gold}`,color:i===step?C.paper:C.gold}}>{i<step?<Icon d={SOLID.check} solid size={28} color={C.green}/>:i+1}</div>
      <div style={{fontSize:P?30:27,marginTop:7,fontWeight:i===step?600:400}}>{label}</div>
    </div>)}
  </div>;
  const form=(o:number,doc:boolean)=>o>0&&<div style={{position:'absolute',inset:0,opacity:o,direction:'rtl'}}>
    <div style={{position:'absolute',right:L.pad,top:L.legendY,fontFamily:BODY,fontSize:P?32:28,fontWeight:500,color:C.text}}>نموذج التشكيل</div>
    <div style={{position:'absolute',right:L.pad,top:L.chipsY,display:'flex',gap:16,borderRadius:18,boxShadow:`0 0 0 ${10*life(t,T.choose-.1,T.shakkelha,.3,.3)}px rgba(241,230,207,.9)`,background:`rgba(241,230,207,${.9*life(t,T.choose-.1,T.shakkelha,.3,.3)})`}}>
      <Chip label="شكِّلها" on={1-catt} ring={doc?0:life(t,T.shakkelha-.08,T.catt-.05,.15,.2)} w={L.chipW[0]} h={L.chipH} font={L.chipFont}/>
      <Chip label="CATT" latin on={catt} ring={doc?0:life(t,T.catt-.1,T.catt+.5,.12,.3)} w={L.chipW[1]} h={L.chipH} font={L.chipFont}/>
    </div>
    <div style={{position:'absolute',left:L.pad,right:L.pad,top:L.tabsY,height:L.tabH,display:'flex',borderBottom:`1.5px solid ${C.line}`,fontFamily:BODY,fontSize:P?31:28,fontWeight:500}}>
      {['نص','مستند'].map((label,i)=><div key={label} style={{flex:1,display:'grid',placeItems:'center',color:(i===1)===(doc&&tabDoc>.5)?C.text:C.muted,borderRadius:'14px 14px 0 0',background:`rgba(248,244,234,${i===0?1-(doc?tabDoc:0):(doc?tabDoc:0)})`}}>{label}</div>)}
      <div style={{position:'absolute',bottom:-1.5,height:3,width:L.inner/2,right:(doc?tabDoc:0)*L.inner/2,background:C.green,borderRadius:2}}/>
    </div>
    {(!doc||tabDoc<1)&&<div style={{position:'absolute',inset:0,opacity:doc?1-tabDoc:1}}>
      <div style={{position:'absolute',left:L.pad,right:L.pad,top:L.headY,display:'flex',justifyContent:'space-between',fontFamily:BODY,fontSize:P?29:26}}>
        <span style={{fontWeight:500,color:C.text}}>النص الأصلي</span>
        <span style={{color:C.muted,fontVariantNumeric:'tabular-nums'}}>{!doc&&pasted?COUNT:'0 / 1000 حرف'}</span>
      </div>
      <div style={{position:'absolute',left:L.pad,right:L.pad,top:L.areaY,height:L.areaH,borderRadius:14,background:!doc&&pasted?`rgba(228,237,230,${.85*flash})`:C.paper,boxShadow:`inset 0 0 0 ${!doc&&focus?2:1.5}px ${!doc&&focus?C.green:C.line}`,padding:P?'22px 28px':'16px 26px',backgroundColor:C.paper}}>
        <div style={{position:'absolute',inset:0,borderRadius:14,background:`rgba(228,237,230,${!doc&&pasted?.9*flash:0})`}}/>
        <div style={{position:'relative',fontFamily:TRANSCRIPT,fontSize:L.textSize,lineHeight:2,color:!doc&&pasted?C.text:C.muted}}>
          {!doc&&pasted?HADITH:<span style={{fontSize:L.textSize*.72,fontFamily:BODY}}>اكتب النص العربي أو ألصقه هنا…</span>}
          {!doc&&focus&&!pasted&&<span style={{display:'inline-block',height:L.textSize*.9,width:3,background:C.green,verticalAlign:'middle',marginRight:6,opacity:Math.floor(t*2.4)%2?0:1}}/>}
        </div>
      </div>
      {P&&<div style={{position:'absolute',left:L.pad,right:L.pad,top:L.hintY,fontFamily:BODY,fontSize:26,color:C.muted}}>أدخل نصًا لا يتجاوز 1000 حرفًا، بما فيها الحركات والمسافات.</div>}
      <div style={{position:'absolute',top:L.btnY,left:0,right:0,display:'flex',justifyContent:'center'}}><Button label="شكِّل النص" primary size={L.btnSize} press={click(t,go)}/></div>
    </div>}
    {doc&&tabDoc>0&&<div style={{position:'absolute',inset:0,opacity:tabDoc}}>
      <div style={{position:'absolute',top:L.dropY,left:L.pad,right:L.pad,height:L.dropH,borderRadius:22,border:`2px dashed ${dropped?C.green:C.gold}`,background:dropped?C.greenSoft:C.paper,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',gap:P?22:14,padding:24}}>
        <Icon d={OUTLINE.upload} size={P?58:50} color={C.gold}/>
        <div style={{fontFamily:BODY,fontSize:P?38:34,fontWeight:600,color:C.text}}>اختر مستندًا، أو اسحبه وأفلته هنا</div>
        <div style={{fontFamily:BODY,fontSize:P?28:26,color:C.muted}}>ملف <Hl on={t>=T.txt}>TXT</Hl> بترميز UTF-8 أو <Hl on={t>=T.word2}>DOCX</Hl> واحد، حتى 99 ميغابايت.</div>
        <div style={{fontFamily:BODY,fontSize:P?28:26,color:dropped?C.green:C.faint}}>{dropped?DOC_FILE:'لم تختر ملفًا بعد.'}</div>
      </div>
      <div style={{position:'absolute',top:L.btnY,left:0,right:0,display:'flex',justifyContent:'center'}}><Button label="شكِّل المستند" primary size={L.btnSize} press={click(t,DOC_GO)}/></div>
    </div>}
  </div>;
  const running=(o:number,from:number,dur:number)=>o>0&&<div style={{position:'absolute',top:L.doneY,left:L.pad,right:L.pad,opacity:o,direction:'rtl'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontFamily:BODY,fontSize:P?38:36,color:C.text}}><span>جارٍ التشكيل…</span><span style={{fontFamily:MONO,color:C.green,fontVariantNumeric:'tabular-nums'}}>{Math.round(ramp(t,from,dur,ease.inOut)*100)}٪</span></div>
    <div style={{height:14,borderRadius:7,background:C.well,overflow:'hidden',marginTop:24}}><div style={{width:`${ramp(t,from,dur,ease.inOut)*100}%`,height:'100%',background:C.green,borderRadius:7}}/></div>
    <div style={{fontFamily:BODY,fontSize:P?28:26,color:C.muted,marginTop:22}}>أبقِ هذه الصفحة مفتوحة حتى ينتهي التشكيل، فإغلاقها يلغي المهمة.</div>
  </div>;
  const head=(name:string)=><>
    <div style={{position:'absolute',right:L.pad,top:L.doneY,display:'flex',alignItems:'center',gap:15}}><Icon d={SOLID.check} solid size={P?42:38} color={C.green}/><Display size={P?46:42}>اكتمل التشكيل.</Display></div>
    <div style={{position:'absolute',left:L.pad,right:L.pad,top:L.metaY,display:'flex',justifyContent:'space-between',alignItems:'center',fontFamily:BODY,fontSize:P?29:26}}>
      <span style={{display:'flex',alignItems:'center',gap:10,fontWeight:500,color:C.text}}><Icon d={SOLID.doc} solid size={P?30:27} color={C.gold}/>{name}</span>
      <span style={{color:C.muted}}>نموذج التشكيل: <span dir="ltr">CATT</span></span>
    </div>
    <div style={{position:'absolute',left:L.pad,right:L.pad,top:L.divY,height:1.5,background:C.line}}/>
  </>;
  const resultText=resC>0&&<div style={{position:'absolute',inset:0,opacity:resC,direction:'rtl'}}>
    {head('النص المشكول')}
    <div style={{position:'absolute',left:L.pad,right:L.pad,top:L.resY,height:L.resH,borderRadius:14,background:C.paper,boxShadow:`inset 0 0 0 1.5px ${C.line}`,padding:P?'22px 28px':'14px 26px'}}>
      <Marked text={HADITH_CATT} size={L.resText} k={ramp(t,T.marked-.3,.95,ease.linear)} lineHeight={P?2.05:1.95}/>
    </div>
    <div style={{position:'absolute',right:L.pad,top:L.dlY,display:'flex',gap:16}}>
      <Button label="نسخ النص" size={L.dlSize} style={{width:L.dlW[0],justifyContent:'center',padding:'14px 5px'}}/>
      <Button label="تنزيل النص (TXT)" icon={OUTLINE.download} size={L.dlSize} style={{width:L.dlW[1],justifyContent:'center',padding:'14px 5px'}}/>
    </div>
    <div style={{position:'absolute',right:L.pad,top:L.keepY,fontFamily:BODY,fontSize:P?27:25,color:C.faint}}>يبقى الأصل والنتيجة متاحين لمدة 30 دقيقة.</div>
  </div>;
  const resultDoc=resF>0&&<div style={{position:'absolute',inset:0,opacity:resF,direction:'rtl'}}>
    {head(DOC_NAME)}
    <div style={{position:'absolute',right:L.pad,top:L.docDlY,display:'flex',gap:16}}>
      <Button label="تنزيل مستند Word (DOCX)" icon={OUTLINE.download} size={L.dlSize} press={click(t,docDl)} style={{width:L.docDlW[0],justifyContent:'center',padding:'14px 5px'}}/>
      <Button label="تنزيل الملف الأصلي" size={L.dlSize} style={{width:L.docDlW[1],justifyContent:'center',padding:'14px 5px'}}/>
    </div>
    <div style={{position:'absolute',left:L.pad,right:L.pad,top:L.docHintY,fontFamily:BODY,fontSize:P?27:25,color:C.faint,lineHeight:1.8}}>
      تُستبدل الحركات الشائعة الموجودة في النص بتشكيل جديد. راجع النتيجة قبل استخدامها.<br/>يبقى الأصل والنتيجة متاحين لمدة 30 دقيقة.
    </div>
  </div>;
  const pageW=P?960:1040;
  return <div style={{position:'absolute',inset:0,opacity:vis,transform:`translateY(${(1-vis)*65}px)`}}>
    <div style={{position:'absolute',left:60,right:60,top:P?190:62,textAlign:'center',opacity:1-.85*page}}>
      <div style={{fontFamily:MONO,fontSize:P?32:26,color:C.faint,marginBottom:10}}>arabi.tools/diacritize</div>
      <Display size={P?87:86}>تشكيل النص العربي</Display>
      <div style={{display:'flex',justifyContent:'center',marginTop:14}}><Ornament width={250}/></div>
    </div>
    <Panel style={{position:'absolute',left:L.cardX,top:L.cardY,width:L.cardW,height:L.cardH,overflow:'hidden',opacity:1-.6*page,transform:`scale(${1-.05*page})`}}>
      {stepsRow}
      {form(inputA,false)}
      {running(runB,go+.15,RESULT_AT-go-.2)}
      {resultText}
      {form(inputD,true)}
      {running(runE,DOC_GO+.08,DOC_DONE-DOC_GO-.1)}
      {resultDoc}
    </Panel>
    {fly>0&&sink<1&&<div style={{position:'absolute',left:lerp(W+120,L.drop.x,fly)-250,top:lerp(L.drop.y+260,L.drop.y,fly)-70,opacity:1-sink,transform:`scale(${1-.3*sink}) rotate(${(1-fly)*9}deg)`}}><DocCard width={500} scale={.9}/></div>}
    {page>0&&<div style={{position:'absolute',left:(W-pageW)/2,top:(P?500:205)+(1-page)*(P?500:420),opacity:clamp(page*1.6),transform:`scale(${.9+.1*page})`,transformOrigin:'50% 100%'}}>
      <DocPage width={pageW} size={P?34:31} marked header={1} k={ramp(t,T.same-.05,1.3,ease.linear)}/>
    </div>}
    <Cursor x={cur.x} y={cur.y} size={38} press={Math.max(...clicks.map(c=>click(t,c)))} opacity={cursorVis}/>
    {clicks.map((at,i)=>{const p=along(at,cursorKeys);return <Ripple key={i} x={p.x} y={p.y} size={140} k={ramp(t,at,.5,ease.linear)}/>;})}
  </div>;
};

const Hl:React.FC<{on:boolean;children:React.ReactNode}>=({on,children})=>
  <span dir="ltr" style={{background:on?C.goldSoft:'transparent',color:on?C.text:undefined,fontWeight:on?600:undefined,padding:'0 7px',borderRadius:6}}>{children}</span>;
