"""Record the pace, observed pauses, STT text, selected seeds and final phoneme evidence."""
import hashlib,json,pathlib,re,subprocess
import numpy as np
ROOT=pathlib.Path(__file__).resolve().parent.parent
script=json.loads((ROOT/'data/script.json').read_text())
vo=json.loads((ROOT/'src/data/vo.json').read_text())
phones=json.loads((ROOT/'out/qa/phonemes-prepared.json').read_text())
report=[]
for c in script['clips']:
    cid=c['id'];file=ROOT/f'public/audio/vo/{cid}.wav'
    raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(file),'-f','f32le','-ac','1','-ar','16000','-'])
    x=np.frombuffer(raw,np.float32);hop=160
    rms=np.array([np.sqrt(np.mean(x[i:i+hop]**2)) for i in range(0,len(x)-hop+1,hop)])
    active=np.where(rms>0.003)[0];start,end=float(active[0])/100,float(active[-1]+1)/100
    pauses=[];i=active[0]
    while i<active[-1]:
        if rms[i]<=0.003:
            j=i
            while j<len(rms) and rms[j]<=0.003:j+=1
            if j-i>=12:
                t0,t1=float(i)/100,float(j)/100
                chars=vo[cid]['chars'];starts=vo[cid]['starts']
                before=''.join(ch for ch,t in zip(chars,starts) if t<t0)
                after=''.join(ch for ch,t in zip(chars,starts) if t>=t0)
                pauses.append({'start':t0,'end':t1,'seconds':round(t1-t0,3),'near':before[-24:]+' | '+after[:24]})
            i=j
        else:i+=1
    count=len(c['text'].split());span=end-start
    stt=json.loads((ROOT/f'out/qa/prepared-{cid}.stt.json').read_text())
    report.append({'id':cid,'seed':c.get('seed',script['voice']['seed']),'duration':vo[cid]['duration'],'words':count,'speechSpanSeconds':round(span,3),'wordsPerSecond':round(count/span,2),'leadSeconds':start,'tailSeconds':round(vo[cid]['duration']-end,3),'pauses':pauses,'stt':stt['text'],'phonemes':phones[f'public/audio/vo/{cid}.wav']['phones'],'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
(ROOT/'out/qa/voice-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
for c in report:
 print(c['id'], 'seed',c['seed'], f"{c['wordsPerSecond']} words/s",'pauses',c['pauses'],'STT:',c['stt'])
