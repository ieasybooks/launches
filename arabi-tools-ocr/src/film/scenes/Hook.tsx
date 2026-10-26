import React from 'react';
import {BODY} from '../../lib/fonts';
import {clamp,ease,lerp,life,ramp,shake,spr,useStage} from '../../lib/motion';
import {C} from '../../theme';
import {Scan} from '../parts/book';
import {Cursor,Display,Icon,OUTLINE,Panel} from '../parts/kit';
import {T} from '../times';

export const Hook: React.FC = () => {
  const {W,P,t}=useStage();
  if(t>T.collapse+0.65) return null;
  const focus=ramp(t,T.hook2-0.3,0.6,ease.inOut);
  const exit=ramp(t,T.collapse,0.6,ease.inOut);
  const title=life(t,0.25,T.collapse+0.2,0.6,0.3);
  const trapped=ramp(t,T.trapped-0.1,0.45);
  const width=P?470:380;
  const cx=lerp(W/2,P?W/2:1375,focus), cy=P?860:610;
  const searchLife=life(t,T.search-0.4,T.copy-0.2,0.3,0.25);
  const query='الموت';
  const typed=Math.floor(clamp((t-T.search)/0.45)*query.length);
  const noResult=ramp(t,T.search+0.5,0.25);
  const copyLife=life(t,T.copy-0.25,T.collapse+0.1,0.3,0.25);
  const drag=ramp(t,T.copy-0.1,0.65,ease.inOut);
  const panelW=P?850:780, panelX=P?W/2:550, panelY=P?1390:460;
  return <div style={{position:'absolute',inset:0,opacity:1-exit,transform:`scale(${1-exit*.2})`}}>
    <div style={{position:'absolute',top:P?220:95,left:70,right:70,textAlign:'center',opacity:title,transform:`translateY(${(1-title)*35}px)`}}>
      <div style={{display:'grid',placeItems:'center'}}>
        <Display size={P?110:124} style={{gridArea:'1 / 1',opacity:1-trapped,transform:`translateY(${-20*trapped}px)`}}>آلاف الكتب المصوّرة</Display>
        <Display size={P?110:124} color={C.green} style={{gridArea:'1 / 1',opacity:trapped,transform:`translateY(${20*(1-trapped)}px)`}}>نصوصها حبيسة الصور</Display>
      </div>
    </div>
    {[-1,1].map((side,i)=>{
      const enter=spr(t,.3+i*.15,{damping:18});
      return <div key={side} style={{position:'absolute',left:W/2+side*(P?210:350)-width/2,top:cy-width*.81,opacity:clamp(enter)*(1-focus)*.73,transform:`translateY(${(1-enter)*160}px) rotate(${side*10}deg) scale(.86)`}}>
        <Scan page={i+1} width={width}/>
      </div>;
    })}
    <div style={{position:'absolute',left:cx-width/2,top:cy-width*.81,opacity:clamp(spr(t,T.pages,{damping:19})),transform:`translateY(${(1-spr(t,T.pages,{damping:19}))*90}px) rotate(${(1-focus)*-1.5}deg)`}}>
      <Scan width={width}/>
      <div style={{position:'absolute',inset:-12,border:`2px solid ${C.gold}`,borderRadius:18,opacity:trapped*(1-exit),transform:`scale(${1+.06*(1-trapped)})`}}/>
      <div style={{position:'absolute',bottom:width*.35,right:width*.12,left:width*.12,height:width*.08,border:`2px dashed ${C.gold}`,opacity:copyLife*.7}}/>
    </div>
    {searchLife>0&&<div style={{position:'absolute',left:panelX-panelW/2,top:panelY,width:panelW,opacity:searchLife,transform:`translateX(${shake(t,T.search+.65,12)}px)`}}>
      <Panel radius={52} style={{height:110,padding:'0 34px',display:'flex',alignItems:'center',gap:22,direction:'rtl'}}>
        <Icon d={OUTLINE.search} size={44} color={C.gold}/>
        <div style={{fontFamily:BODY,fontSize:44,color:C.text}}>{typed?query.slice(0,typed):'ابحث في الكتاب'}<span style={{display:'inline-block',height:45,width:3,background:C.green,verticalAlign:'middle',marginRight:8}}/></div>
      </Panel>
      <div style={{textAlign:'center',fontFamily:BODY,fontSize:38,color:C.muted,marginTop:24,opacity:noResult}}>لا توجد نتائج</div>
    </div>}
    <div style={{position:'absolute',left:panelX-panelW/2,top:panelY,width:panelW,opacity:copyLife,textAlign:'center'}}>
      <Display size={P?86:94}>لا يمكن نسخ النص</Display>
      <div style={{fontFamily:BODY,fontSize:36,color:C.muted,marginTop:14}}>الصفحة صورة</div>
    </div>
    <Cursor x={cx+width*.32-drag*width*.65} y={cy+width*.04} size={42} press={copyLife} opacity={copyLife}/>
  </div>;
};
