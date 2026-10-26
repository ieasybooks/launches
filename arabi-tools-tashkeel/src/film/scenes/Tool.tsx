import React from 'react';
import {BODY,MONO} from '../../lib/fonts';
import {ease,life,ramp,useStage} from '../../lib/motion';
import {C} from '../../theme';
import {Display,Icon,OUTLINE,Panel} from '../parts/kit';
import {Marked} from '../parts/marks';
import {HADITH_SHAKKELHA} from '../parts/text';
import {T} from '../times';

// The tool's name, and the site's result settling onto the hadith word by word.
export const Tool: React.FC=()=>{
  const {W,P,t}=useStage();
  if(t<T.tool-.4||t>T.paste)return null;
  const vis=life(t,T.tool-.4,T.paste-.15,.35,.4);
  const k=ramp(t,T.toText-.15,1.25,ease.linear);
  const pw=P?960:1460, py=P?660:420;
  return <div style={{position:'absolute',inset:0,opacity:vis,transform:`translateY(${(1-vis)*40}px)`}}>
    <div style={{position:'absolute',top:P?250:105,left:60,right:60,textAlign:'center'}}>
      <Display size={P?104:126} color={C.green}>تشكيل النص العربي</Display>
      <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:26,marginTop:24,fontFamily:MONO,fontSize:P?32:34,color:C.muted,direction:'rtl',flexWrap:'wrap'}}>
        <span>نص · TXT · DOCX</span><Icon d={OUTLINE.arrowLeft} size={37} color={C.gold} draw={ramp(t,T.tool,.6)}/><span>نص مشكول · TXT · DOCX</span>
      </div>
    </div>
    <Panel style={{position:'absolute',left:(W-pw)/2,top:py,width:pw,padding:P?'50px 54px 40px':'54px 70px 44px'}}>
      <Marked text={HADITH_SHAKKELHA} size={P?70:74} k={k} lineHeight={P?2.05:2} style={{textWrap:'balance'}}/>
      <div style={{fontFamily:BODY,fontSize:P?28:27,color:C.faint,direction:'rtl',marginTop:P?18:10}}>حديث شريف · رواه مسلم</div>
    </Panel>
  </div>;
};
