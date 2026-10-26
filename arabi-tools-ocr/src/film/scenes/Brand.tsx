import React from 'react';
import {BODY} from '../../lib/fonts';
import {clamp,ease,life,ramp,spr,useStage} from '../../lib/motion';
import {C} from '../../theme';
import {Logo} from '../parts/Logo';
import {Display,Icon,OUTLINE,Ornament,Panel,SOLID} from '../parts/kit';
import {T} from '../times';

export const Brand: React.FC=()=>{
  const {W,P,t}=useStage();
  if(t<T.collapse||t>T.tool+.1)return null;
  const exit=1-ramp(t,T.tool-.45,.45,ease.in);
  const enter=spr(t,T.collapse+.15,{damping:18});
  const name=life(t,T.name-.25,T.tool, .45,.3);
  const cardW=P?820:620;
  return <div style={{position:'absolute',inset:0,opacity:exit}}>
    <div style={{position:'absolute',top:P?340:150,left:W/2-(P?180:150)/2,opacity:clamp(enter),transform:`scale(${.75+.25*enter})`}}>
      <Logo size={P?180:150} glyph={ramp(t,T.collapse+.2,.55)} diamond={spr(t,T.collapse+.6,{damping:12})}/>
    </div>
    <div style={{position:'absolute',top:P?550:320,left:0,right:0,textAlign:'center',opacity:name,transform:`translateY(${(1-name)*30}px)`}}>
      <Display size={P?138:132}>أدوات العربية</Display>
      <div style={{fontFamily:BODY,fontSize:42,color:C.muted,marginTop:10}}>arabi.tools</div>
      <div style={{display:'flex',justifyContent:'center',marginTop:25}}><Ornament width={310} draw={name}/></div>
    </div>
    <div style={{position:'absolute',top:P?980:660,left:0,right:0,display:'flex',flexDirection:P?'column':'row',direction:'rtl',alignItems:'center',justifyContent:'center',gap:28}}>
      {[{name:'تفريغ الصوت',icon:OUTLINE.mic,at:T.name+.2,fresh:false},{name:'استخراج النص من الصور',icon:SOLID.doc,at:T.newTool-.15,fresh:true}].map(c=>{
        const a=spr(t,c.at,{damping:17,stiffness:140});
        return <div key={c.name} style={{opacity:clamp(a),transform:`translateY(${(1-a)*80}px) scale(${.93+.07*a})`}}>
          <Panel radius={28} style={{width:cardW,height:P?180:190,padding:P?30:32,display:'flex',alignItems:'center',gap:24,border:c.fresh?`2px solid ${C.green}`:`2px solid transparent`}}>
            <div style={{width:76,height:76,borderRadius:20,background:c.fresh?C.green:C.greenSoft,display:'grid',placeItems:'center',flexShrink:0}}><Icon d={c.icon} solid={c.fresh} size={42} color={c.fresh?C.paper:C.green}/></div>
            <div><div style={{fontFamily:BODY,fontSize:P?40:34,color:C.text,fontWeight:600}}>{c.name}</div>
              {c.fresh&&<div style={{fontFamily:BODY,fontSize:28,color:C.green,marginTop:7}}>أداة جديدة</div>}</div>
          </Panel>
        </div>;
      })}
    </div>
  </div>;
};
