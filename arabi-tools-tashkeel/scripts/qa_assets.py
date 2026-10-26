"""Verify the site captures, the selected voice takes and the shared Arabic captions."""
import hashlib,json,pathlib,re,zipfile
import xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parent.parent
read=lambda p:json.loads((ROOT/p).read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
MARK=re.compile('[ً-ْٰ]')
W='{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
def paragraphs(path):
    root=ET.fromstring(zipfile.ZipFile(path).read('word/document.xml'))
    return [t for t in (''.join(x.text or '' for x in p.iter(W+'t')) for p in root.iter(W+'p')) if t]
script=read('data/script.json');vo=read('src/data/vo.json');takes=read('data/voice-takes.json')
checks=[]
assert {c['id'] for c in script['clips']}=={c['id'] for c in takes['clips']}==set(vo)
for c in script['clips']:
    cid=c['id'];v=vo[cid];take=next(t for t in takes['clips'] if t['id']==cid)
    assert take['seed']==c.get('seed',script['voice']['seed'])
    assert sha(ROOT/f'audio/vo/{cid}.mp3')==take['rawSha256']
    assert sha(ROOT/f'public/audio/vo/{cid}.wav')==take['preparedSha256']
    if c.get('reused'):
        assert sha(ROOT/f'audio/vo/{cid}.mp3')==sha(ROOT.parent/c['reused']/f'audio/vo/{cid}.mp3')
    assert v['chars']==c['text'] and v['caption']==c['caption']
    assert len(v['chars'])==len(v['starts'])==len(v['ends'])
    assert all(0<=a<=b<=v['duration'] for a,b in zip(v['starts'],v['ends']))
    assert v['starts']==sorted(v['starts']) and v['ends']==sorted(v['ends'])
checks.append(f'PASS: all {len(vo)} voice seeds/hashes match (3 reused unchanged from the OCR film); character alignments are ordered within clip duration.')
site=read('src/data/site.json');lesson=read('src/data/lesson.json')
for rid,r in site.items():
    d=r['download'];p=ROOT/'src/data'/d['file']
    assert p.stat().st_size==d['bytes'] and sha(p)==d['sha256'],rid
    if 'output' in r:
        assert r['downloadMatchesTextarea'] and MARK.sub('',r['output'])==r['input'],rid
    else:
        assert sha(ROOT/r['input'])==r['inputSha256'],rid
        assert paragraphs(p)==lesson['marked'] and paragraphs(ROOT/r['input'])==lesson['plain'],rid
assert sha(ROOT/'src/data'/lesson['file'])==lesson['sha256']
assert [MARK.sub('',m) for m in lesson['marked']]==lesson['plain']
checks.append('PASS: site downloads and the input DOCX match their hashes; every result is its input with diacritics added and no letter changed.')
base=ROOT/'out/final/arabi-tools-tashkeel-launch.ar'
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
