import React from 'react';
import {clamp,ease,lerp,life,ramp,spr,useStage} from '../../lib/motion';
import {C} from '../../theme';
import {Display} from '../parts/kit';
import {Marked} from '../parts/marks';
import {BlankPage,DocPage} from '../parts/text';
import {T} from '../times';

// One undiacritized word with four readings, then a whole page of such words.
const READINGS=['عِلْمٌ','عَلَمٌ','عَلِمَ','عَلَّمَ'];

export const Hook: React.FC=()=>{
  const {W,P,t}=useStage();
  if(t>T.collapse+.65)return null;
  const exit=ramp(t,T.collapse,.6,ease.inOut);
  const title=life(t,.25,T.collapse+.2,.6,.3);
  const swap=ramp(t,T.hook2-.3,.5,ease.inOut);
  const born=spr(t,T.word,{damping:18});
  const split=ramp(t,T.readings-.2,.75,ease.inOut);
  const away=ramp(t,T.hook2-.35,.55,ease.inOut);
  const ring=life(t,T.noMarks-.1,T.readings,.35,.3);
  const page=spr(t,T.hook2-.2,{damping:19,stiffness:120});
  const fan=spr(t,T.book,{damping:16,stiffness:110});
  const highlight=ramp(t,T.book+.15,.5);
  const cx=W/2, cy=P?900:585;
  const big=P?330:300, small=P?190:175;
  const slots=READINGS.map((_,i)=>P?{x:W/2+(i%2?-1:1)*245,y:i<2?780:1130}:{x:W/2+(1.5-i)*410,y:585});
  const pageW=P?940:1000, pageY=P?560:290, pageH=P?680:560;
  return <div style={{position:'absolute',inset:0,opacity:1-exit,transform:`scale(${1-exit*.2})`}}>
    <div style={{position:'absolute',top:P?250:95,left:60,right:60,textAlign:'center',opacity:title,transform:`translateY(${(1-title)*35}px)`}}>
      <div style={{display:'grid',placeItems:'center'}}>
        <Display size={P?104:118} style={{gridArea:'1 / 1',opacity:1-swap,transform:`translateY(${-20*swap}px)`}}>كلمة واحدة بلا تشكيل</Display>
        <Display size={P?104:118} color={C.green} style={{gridArea:'1 / 1',opacity:swap,transform:`translateY(${20*(1-swap)}px)`}}>فكيف بكتاب كامل؟</Display>
      </div>
    </div>
    {away<1&&READINGS.map((word,i)=>{
      const s=slots[i];
      const x=lerp(cx,s.x,split), y=lerp(cy,s.y,split)-away*120;
      const size=lerp(big,small,split);
      const k=ramp(t,T.readings+.05+i*.24,.55);
      const show=i===0?1:clamp(split*3);
      return <div key={word} style={{position:'absolute',left:x-400,top:y-size*.95,width:800,display:'flex',justifyContent:'center',opacity:clamp(born*1.4)*show*(1-away),transform:`translateY(${(1-born)*80}px)`}}>
        <Marked text={word} size={size} k={k} lineHeight={1.9}/>
      </div>;
    })}
    {away<1&&<div style={{position:'absolute',left:cx-big*.75,top:cy-big*.72,width:big*1.5,height:big*1.2,border:`2.5px dashed ${C.gold}`,borderRadius:28,opacity:ring*(1-split),transform:`scale(${1+.08*(1-ring)})`}}/>}
    {page>0&&<>
      {[-1,1].map((side,i)=><div key={side} style={{position:'absolute',left:W/2-pageW/2+side*fan*(P?120:300),top:pageY+30+(1-page)*500,opacity:clamp(page*1.3)*.85*clamp(fan*2),transform:`rotate(${side*fan*7}deg) scale(.94)`}}>
        <BlankPage width={pageW} size={P?34:31} seed={i+2} height={pageH}/>
      </div>)}
      <div style={{position:'absolute',left:W/2-pageW/2,top:pageY+(1-page)*520,opacity:clamp(page*1.3),transform:`rotate(${(1-page)*-3}deg)`}}>
        <DocPage width={pageW} size={P?35:32} highlight={highlight} style={{height:pageH}}/>
      </div>
    </>}
  </div>;
};
