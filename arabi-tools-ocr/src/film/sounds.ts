import {DURATION,ORDER} from '../lib/timeline';
import {T} from './times';
// The predecessor's quiet, non-musical air, paper and UI sounds.
type Sfx={t:number;name:string;vol:number;fadeOut?:number};
export const FILM_SFX:Sfx[]=[
  {t:0,name:'air_bed',vol:.08,fadeOut:DURATION},
  {t:.15,name:'paper',vol:.23},
  {t:.35,name:'paper',vol:.15},
  {t:T.trapped,name:'whoosh',vol:.1},
  {t:T.search-.35,name:'pop',vol:.12},
  ...Array.from({length:5},(_,i)=>({t:T.search+i*.09,name:`key${i%4}`,vol:.1})),
  {t:T.search+.55,name:'denied',vol:.23},
  {t:T.copy+.55,name:'denied',vol:.2},
  {t:T.collapse-.9,name:'whoosh_long',vol:.13},
  {t:T.collapse+.2,name:'impact',vol:.25},
  {t:T.name-.2,name:'whoosh',vol:.12},
  {t:T.newTool-.12,name:'pop',vol:.2},
  {t:T.tool-.4,name:'whoosh',vol:.13},
  {t:T.toText-.15,name:'paper',vol:.2},
  {t:T.upload-.6,name:'whoosh',vol:.15},
  {t:T.raise,name:'slide',vol:.24},
  {t:T.drop,name:'drop',vol:.4},
  {t:T.pagesLimit,name:'pop',vol:.08},
  {t:T.go,name:'ui_click',vol:.35},
  {t:T.eachPage,name:'paper',vol:.14},
  {t:T.arabic-.2,name:'slide',vol:.15},
  {t:T.language,name:'pop',vol:.1},
  {t:T.done,name:'pop',vol:.18},
  {t:T.txt,name:'ui_click',vol:.35},
  {t:T.docx,name:'ui_click',vol:.35},
  {t:T.free-.5,name:'whoosh',vol:.17},
  {t:T.freeWord-.12,name:'pop',vol:.18},
  {t:T.account-.1,name:'pop',vol:.11},
  {t:T.install-.1,name:'pop',vol:.11},
  {t:T.privacy-.4,name:'slide',vol:.2},
  {t:T.remove+.05,name:'dissolve',vol:.3},
  {t:T.remove+.8,name:'pop',vol:.12},
  {t:T.outro-.55,name:'whoosh_long',vol:.15},
  {t:T.outro-.4,name:'impact',vol:.24},
  {t:T.tryIt-.2,name:'pop',vol:.15},
  {t:T.tryIt+.45,name:'ui_click',vol:.28},
];
export const SFX_LEN:Record<string,number>={air_bed:80,whoosh:1,whoosh_long:1.8,pop:.5,slide:.7,denied:.6,air_riser:2.4,impact:3,drop:.6,paper:.8,dissolve:1.4,ui_click:.12,key0:.09,key1:.09,key2:.09,key3:.09};
export const SOUND_EVENTS=[...ORDER.map(c=>({t:c.start,file:`audio/vo/${c.id}.wav`,vol:1})),...FILM_SFX.map(e=>({t:e.t,file:`audio/sfx/${e.name}.wav`,vol:e.vol,fadeOut:e.fadeOut}))];
