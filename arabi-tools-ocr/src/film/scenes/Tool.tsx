import React from 'react';
import {BODY,MONO} from '../../lib/fonts';
import {clamp,ease,life,ramp,spr,useStage,wipe} from '../../lib/motion';
import {C} from '../../theme';
import {EXCERPT,OcrText,Scan} from '../parts/book';
import {Cursor,Display,Icon,OUTLINE,Panel} from '../parts/kit';
import {T} from '../times';

export const Tool: React.FC=()=>{
  const {W,P,t}=useStage();
  if(t<T.tool-.4||t>T.upload)return null;
  const vis=life(t,T.tool-.4,T.upload-.15,.35,.4);
  const reveal=ramp(t,T.toText-.1,.95,ease.inOut);
  const select=ramp(t,T.toText+.35,.6,ease.inOut);
  const sw=P?350:310, sx=P?W/2:1460, sy=P?640:420;
  const tx=P?90:180, ty=P?1310:435, tw=P?900:790;
  return <div style={{position:'absolute',inset:0,opacity:vis,transform:`translateY(${(1-vis)*40}px)`}}>
    <div style={{position:'absolute',top:P?230:105,left:60,right:60,textAlign:'center'}}>
      <Display size={P?100:126} color={C.green}>استخراج النص من الصور</Display>
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:26,marginTop:24,fontFamily:MONO,fontSize:34,color:C.muted,direction:'rtl'}}><span dir="ltr">PDF · JPG · PNG</span><Icon d={OUTLINE.arrowLeft} size={37} color={C.gold}/><span dir="ltr">TXT · DOCX · JSON</span></div>
    </div>
    <div style={{position:'absolute',left:sx-sw/2,top:sy,transform:`rotate(${(1-reveal)*3}deg)`}}>
      <Scan width={sw}/>
      <div style={{position:'absolute',left:0,right:0,top:`${reveal*100}%`,height:3,background:C.gold,boxShadow:`0 0 22px ${C.gold}`,opacity:Math.sin(reveal*Math.PI)}}/>
    </div>
    <div style={{position:'absolute',left:P?W/2-34:1140-34,top:P?1210:630}}><Icon d={P?OUTLINE.arrowDown:OUTLINE.arrowLeft} size={68} color={C.gold} draw={ramp(t,T.tool,.6)}/></div>
    <Panel style={{position:'absolute',left:tx,top:ty,width:tw,padding:P?40:48,minHeight:270}}>
      <div style={{fontFamily:BODY,fontSize:30,color:C.green,direction:'rtl',marginBottom:15}}>نص قابل للتحديد والنسخ</div>
      <div style={{position:'relative',...wipe(reveal)}}>
        <OcrText size={P?47:44} text={EXCERPT} style={{position:'relative',zIndex:1}}/>
        <div style={{position:'absolute',top:9,right:-5,width:`${select*100}%`,height:P?70:66,background:C.greenSoft,borderRadius:5}}/>
      </div>
    </Panel>
    <Cursor x={tx+tw-40-select*(tw-80)} y={ty+110} size={34} opacity={life(t,T.toText+.3,T.upload-.35,.2,.2)}/>
  </div>;
};
