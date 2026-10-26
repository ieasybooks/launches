"""Verify source/download integrity, selected voice takes and the shared Arabic captions.
Usage: qa_assets.py [path/to/coordinator/narration-draft.json]
"""
import hashlib,json,pathlib,re,sys,zipfile
import xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parent.parent
read=lambda p:json.loads((ROOT/p).read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
script=read('data/script.json');vo=read('src/data/vo.json');takes=read('data/voice-takes.json')
checks=[]
if len(sys.argv)>1:
    draft=json.loads(pathlib.Path(sys.argv[1]).read_text())
    assert [{k:c[k] for k in ('id','text','caption')} for c in script['clips']]==draft
    checks.append('PASS: all script texts and captions exactly match the coordinator draft.')
assert {c['id'] for c in script['clips']}=={c['id'] for c in takes['clips']}==set(vo)
for c in script['clips']:
    cid=c['id'];v=vo[cid];take=next(t for t in takes['clips'] if t['id']==cid)
    assert take['seed']==c.get('seed',script['voice']['seed'])
    assert sha(ROOT/f'audio/vo/{cid}.mp3')==take['rawSha256']
    assert sha(ROOT/f'public/audio/vo/{cid}.wav')==take['preparedSha256']
    assert v['chars']==c['text'] and v['caption']==c['caption']
    assert len(v['chars'])==len(v['starts'])==len(v['ends'])
    assert all(0<=a<=b<=v['duration'] for a,b in zip(v['starts'],v['ends']))
    assert v['starts']==sorted(v['starts']) and v['ends']==sorted(v['ends'])
checks.append('PASS: all ten final voice seeds/hashes match; character alignments are ordered within clip duration.')
source=read('src/data/source.json');meta=read('src/data/ocr-provenance.json')
assert sha(ROOT/'src/data'/source['sampleFile'])==source['sampleSha256']
for f in meta['downloads']:
    p=ROOT/'src/data'/f['file'];assert p.stat().st_size==f['bytes'] and sha(p)==f['sha256']
pages=read('src/data/ocr.json');assert [p['page'] for p in pages]==[1,2]
txt=(ROOT/'src/data/ocr.txt').read_text()
with zipfile.ZipFile(ROOT/'src/data/ocr.docx') as z:
    doc=''.join(ET.fromstring(z.read('word/document.xml')).itertext())
for p in pages:
    assert p['content'] in txt
    assert all(line in doc for line in p['content'].splitlines())
checks.append('PASS: input PDF and unedited TXT/DOCX/JSON hashes match; both page texts are present in TXT and DOCX.')
base=ROOT/'out/final/arabi-tools-ocr-launch.ar'
srt=base.with_suffix('.ar.srt').read_text();vtt=base.with_suffix('.ar.vtt').read_text()
blocks=srt.strip().split('\n\n');texts=[];prior=0
maximum=read('out/dbg/director.json')['DURATION']
for i,block in enumerate(blocks,1):
    lines=block.splitlines();assert int(lines[0])==i
    match=re.fullmatch(r'(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})',lines[1]);assert match
    n=list(map(int,match.groups()));assert n[1]<60 and n[2]<60 and n[5]<60 and n[6]<60
    start=n[0]*3600+n[1]*60+n[2]+n[3]/1000;end=n[4]*3600+n[5]*60+n[6]+n[7]/1000
    assert prior<=start<end<=maximum;prior=end;text=' '.join(lines[2:]);texts.append(text)
    assert lines[1].replace(',','.')+'\n'+text in vtt
assert ' '.join(texts)==' '.join(c['caption'] for c in script['clips'])
checks.append(f'PASS: {len(blocks)} matching SRT/VTT cues; valid timestamps, no overlaps, exact approved captions within the film.')
(ROOT/'out/qa/data-integrity.txt').write_text('\n'.join(checks)+'\n')
print('\n'.join(checks))
