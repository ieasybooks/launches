import React from 'react';
import {BODY,MONO} from '../../lib/fonts';
import {clamp,ease,lerp,life,ramp,spr,useStage} from '../../lib/motion';
import {C} from '../../theme';
import {ARABIC_LINE,BOOK_FILE,LATIN,OcrText,PREVIEWS,PdfCard,Scan} from '../parts/book';
import {Button,Cursor,Display,Icon,OUTLINE,Ornament,Panel,Ripple,SOLID} from '../parts/kit';
import {T} from '../times';

const click=(t:number,at:number)=>ramp(t,at,.08)*(1-ramp(t,at+.1,.18));
const labels=['الرفع','استخراج النص','التنزيل'];

export const Site: React.FC=()=>{
  const {W,P,t}=useStage();
  if(t<T.upload-.7||t>T.free)return null;
  const vis=life(t,T.upload-.65,T.free-.1,.45,.45);
  const running=ramp(t,T.go,.3),done=ramp(t,T.done,.3);
  const cardW=P?940:1320,cardX=(W-cardW)/2;
  const cardY=P?510:270,cardH=P?1120:675;
  const pad=P?44:50;
  const step=t<T.go?0:t<T.done?1:2;
  const drop=ramp(t,T.raise-.05,T.drop-(T.raise-.05),ease.inOut);
  const sink=ramp(t,T.drop,.3);
  const percent=Math.min(99,Math.round(ramp(t,T.go+.25,T.arabic-T.go-.25,ease.inOut)*100));
  const language=life(t,T.arabic-.25,T.done,.3,.25);
  const upload=1-running;
  const run=running*(1-done);
  const btnY=P?308:255;
  const btnWidth=P?415:360;
  const gap=P?22:26;
  const btnCenters=[0,1,2].map(i=>({x:cardX+cardW-pad-btnWidth/2-i*(btnWidth+gap),y:cardY+btnY+32}));
  const start={x:W/2+50,y:cardY+(P?780:585)};
  const dropPoint={x:W/2,y:cardY+(P?445:380)};
  const txt=btnCenters[0],word=btnCenters[1];
  const cursor= t<T.drop?{x:lerp(W+80,dropPoint.x+180,drop),y:lerp(cardY+cardH,dropPoint.y,drop)}:
    t<T.go+.2?{x:lerp(dropPoint.x+180,start.x,ramp(t,T.drop,.6,ease.inOut)),y:lerp(dropPoint.y,start.y,ramp(t,T.drop,.6,ease.inOut))}:
    t<T.txt?txt:{x:lerp(txt.x,word.x,ramp(t,T.docx-.6,.5,ease.inOut)),y:word.y};
  const cursorVis=Math.max(life(t,T.raise,T.go+.3,.2,.2),life(t,T.txt-.45,T.docx+.6,.2,.3));
  return <div style={{position:'absolute',inset:0,opacity:vis,transform:`translateY(${(1-vis)*65}px)`}}>
    <div style={{position:'absolute',left:60,right:60,top:P?200:65,textAlign:'center'}}>
      <div style={{fontFamily:MONO,fontSize:P?32:26,color:C.faint,marginBottom:10}}>arabi.tools/ocr</div>
      <Display size={P?87:86}>استخراج النص من الصور</Display>
      <div style={{display:'flex',justifyContent:'center',marginTop:14}}><Ornament width={250}/></div>
    </div>
    <Panel style={{position:'absolute',left:cardX,top:cardY,width:cardW,height:cardH,overflow:'hidden'}}>
      <div style={{position:'absolute',left:pad,right:pad,top:32,display:'flex',justifyContent:'center',direction:'rtl',gap:P?35:65}}>
        {labels.map((label,i)=><div key={label} style={{width:P?230:270,textAlign:'center',fontFamily:BODY,color:i===step?C.text:C.faint}}>
          <div style={{margin:'0 auto',width:54,height:54,borderRadius:999,display:'grid',placeItems:'center',fontFamily:MONO,fontSize:27,background:i===step?C.green:i<step?C.greenSoft:'transparent',border:`1.5px solid ${i===step?C.green:C.gold}`,color:i===step?C.paper:C.gold}}>{i<step?<Icon d={SOLID.check} solid size={28} color={C.green}/>:i+1}</div>
          <div style={{fontSize:P?30:28,marginTop:7}}>{label}</div>
        </div>)}
      </div>
      {upload>0&&<div style={{position:'absolute',inset:0,opacity:upload}}>
        <div style={{position:'absolute',top:185,left:pad,right:pad,height:P?480:330,borderRadius:24,border:`2px dashed ${t>T.drop?C.green:C.gold}`,background:t>T.drop?C.greenSoft:C.paper,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',gap:20,padding:26,direction:'rtl'}}>
          <Icon d={OUTLINE.upload} size={58} color={C.gold}/>
          <div style={{fontFamily:BODY,fontSize:P?40:39,fontWeight:600,color:C.text}}>اختر ملف PDF أو صورة،<br/>أو اسحبه وأفلته هنا</div>
          <div style={{fontFamily:BODY,fontSize:P?28:29,color:C.muted,lineHeight:1.7}}>PDF أو JPG أو PNG · حتى 99 ميغابايت<br/>حتى <span style={{background:t>=T.pagesLimit?C.goldSoft:'transparent',padding:'0 9px',color:t>=T.pagesLimit?C.text:undefined,fontWeight:600}}>1000 صفحة</span></div>
          <div style={{fontFamily:BODY,fontSize:28,color:t>=T.drop?C.green:C.faint}}>{t>=T.drop?BOOK_FILE:'لم تختر ملفًا بعد.'}</div>
        </div>
        <div style={{position:'absolute',top:P?740:550,left:0,right:0,display:'flex',justifyContent:'center'}}><Button label="ابدأ استخراج النص" primary size={34} press={click(t,T.go)}/></div>
        {P&&<div style={{position:'absolute',bottom:100,left:pad,right:pad,fontFamily:BODY,fontSize:30,color:C.muted,textAlign:'center',direction:'rtl'}}>نتعرّف على لغة النص تلقائيًا.</div>}
      </div>}
      {run>0&&<div style={{position:'absolute',top:190,left:pad,right:pad,opacity:run,direction:'rtl'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontFamily:BODY,fontSize:P?38:36,color:C.text}}><span>جارٍ استخراج النص…</span><span style={{fontFamily:MONO,color:C.green,fontVariantNumeric:'tabular-nums'}}>{percent}٪</span></div>
        <div style={{height:14,borderRadius:7,background:C.well,overflow:'hidden',marginTop:24}}><div style={{width:`${percent}%`,height:'100%',background:C.green,borderRadius:7}}/></div>
        <div style={{fontFamily:BODY,fontSize:28,color:C.muted,marginTop:22}}>استخراج الصفحة {percent<55?'1':'2'} من 2</div>
        <div style={{position:'relative',marginTop:28,height:P?630:310}}>
          <div style={{position:'absolute',right:P?25:110,top:0,opacity:1-language,display:'flex',gap:25}}>{[1,2].map((n)=><div key={n} style={{opacity:percent>=(n-1)*55?1:.4,transform:`rotate(${n===1?3:-3}deg)`}}><Scan page={n} width={P?230:175}/></div>)}</div>
          <div style={{position:'absolute',left:P?30:90,top:P?440:95,opacity:1-language,fontFamily:BODY,fontSize:30,color:C.green}}>النص صفحةً صفحة</div>
          <div style={{position:'absolute',inset:0,opacity:language,transform:`translateY(${(1-language)*30}px)`}}>
            <div style={{display:'flex',alignItems:'center',gap:16,fontFamily:BODY,fontSize:36,color:C.green,marginBottom:22}}><Icon d={OUTLINE.language} size={42} color={C.gold}/>نتعرّف على اللغة تلقائيًا</div>
            <div style={{padding:'15px 25px',background:C.paper,borderRadius:18}}><OcrText size={P?38:32} text={ARABIC_LINE}/></div>
            <div style={{padding:'18px 25px',background:C.goldSoft,borderRadius:18,marginTop:16}}>
              <div style={{fontFamily:MONO,fontSize:P?30:31,direction:'ltr',textAlign:'left',color:C.text}}>{LATIN}</div>
              <div style={{fontFamily:BODY,fontSize:24,color:C.muted,marginTop:8}}>حاشية لاتينية من الطبعة نفسها</div>
            </div>
          </div>
        </div>
      </div>}
      {done>0&&<div style={{position:'absolute',inset:0,opacity:done,direction:'rtl'}}>
        <div style={{position:'absolute',right:pad,top:175,display:'flex',alignItems:'center',gap:15,fontFamily:BODY,fontSize:P?38:35,color:C.text,fontWeight:600}}><Icon d={SOLID.check} solid size={38} color={C.green}/>اكتمل استخراج النص.</div>
        <div style={{position:'absolute',right:pad,top:P?236:218,fontFamily:BODY,fontSize:27,color:C.muted}}>تاريخ-الطبري</div>
        {['تنزيل النص (TXT)','تنزيل مستند Word (DOCX)','تنزيل بيانات الصفحات (JSON)'].map((name,i)=>{
          const at=i===0?T.txt:i===1?T.docx:T.done;
          return <div key={name} style={{position:'absolute',right:P&&i===2?pad:pad+i*(btnWidth+gap),top:P&&i===2?btnY+84:btnY,width:P&&i===2?cardW-2*pad:btnWidth}}><Button label={name} primary={i===0} icon={OUTLINE.download} size={P?27:25} press={i<2?click(t,at):0} style={{width:'100%',justifyContent:'center',padding:'15px 5px'}}/></div>;
        })}
        <div style={{position:'absolute',right:pad,top:P?485:350,fontFamily:BODY,fontSize:25,color:C.faint}}>تبقى النتائج متاحة لمدة 30 دقيقة.</div>
        <div style={{position:'absolute',right:pad,top:P?540:394,fontFamily:BODY,fontSize:34,color:C.text,fontWeight:600}}>النص صفحةً صفحة</div>
        <div style={{position:'absolute',top:P?606:455,left:pad,right:pad,display:'flex',flexDirection:P?'column':'row',gap:22}}>
          {PREVIEWS.map((text,i)=><div key={i} style={{background:C.paper,borderRadius:18,padding:P?'20px 26px':'15px 24px',flex:1,overflow:'hidden',height:P?202:190}}>
            <div style={{fontFamily:BODY,fontSize:26,color:C.gold,marginBottom:9}}>الصفحة {i+1}</div>
            <OcrText text={text} size={P?34:30} style={{maxHeight:P?130:130,overflow:'hidden',WebkitMaskImage:'linear-gradient(to bottom,#000 75%,transparent)'}}/>
          </div>)}
        </div>
      </div>}
    </Panel>
    {drop>0&&sink<1&&<div style={{position:'absolute',left:lerp(W+100,dropPoint.x,drop)-260,top:lerp(cardY+cardH,dropPoint.y,drop)-75,opacity:1-sink,transform:`scale(${1-.3*sink}) rotate(${(1-drop)*9}deg)`}}><PdfCard width={520} scale={.92}/></div>}
    <Cursor x={cursor.x} y={cursor.y} size={38} press={Math.max(click(t,T.go),click(t,T.txt),click(t,T.docx))} opacity={cursorVis}/>
    {[{at:T.go,point:start},{at:T.txt,point:txt},{at:T.docx,point:word}].map(({at,point})=><Ripple key={at} x={point.x} y={point.y} size={140} k={ramp(t,at,.5,ease.linear)}/>)}
  </div>;
};
