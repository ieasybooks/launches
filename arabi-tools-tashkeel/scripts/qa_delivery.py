"""Validate both final MP4 streams and write the review bundle's hashes/settings."""
import hashlib,json,math,pathlib,subprocess
from datetime import datetime,timezone
from fractions import Fraction
ROOT=pathlib.Path(__file__).resolve().parent.parent
expected=json.loads((ROOT/'out/dbg/director.json').read_text())['DURATION']
frames=math.ceil(expected*30);duration=frames/30
manifest={'checkedAt':datetime.now(timezone.utc).isoformat(),'timelineSeconds':expected,'render':{'remotion':'4.0.533','browser':'Chromium Headless Shell 149.0.7790.0','frameFormat':'png','colorSpace':'bt709','fps':30,'frames':frames,'durationSeconds':duration,'crf':17,'preset':'medium','concurrency':2},'videos':[],'reviewFiles':[]}
for shape,width,height in [('16x9',1920,1080),('9x16',1080,1920)]:
    p=ROOT/f'out/final/arabi-tools-tashkeel-launch-{shape}.mp4'
    info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]))
    video=next(s for s in info['streams'] if s['codec_type']=='video');audio=next(s for s in info['streams'] if s['codec_type']=='audio')
    assert (video['width'],video['height'])==(width,height)
    assert Fraction(video['r_frame_rate'])==30 and int(video['nb_frames'])==frames
    assert abs(float(video['duration'])-duration)<.001
    assert abs(float(audio['duration'])-duration)<.001
    assert video['codec_name']=='h264' and video['pix_fmt']=='yuv420p' and video['color_space']=='bt709'
    assert audio['codec_name']=='aac' and audio['sample_rate']=='48000' and audio['channels']==2
    assert audio['tags']['language']=='ara'
    data=p.read_bytes();offset=0;atoms=[]
    while offset+8<=len(data):
        length=int.from_bytes(data[offset:offset+4],'big');kind=data[offset+4:offset+8].decode('ascii')
        if length==1:length=int.from_bytes(data[offset+8:offset+16],'big')
        if length==0:length=len(data)-offset
        assert length>=8;atoms.append(kind);offset+=length
    assert atoms.index('moov')<atoms.index('mdat')
    record={'file':p.name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'width':width,'height':height,'frames':frames,'durationSeconds':duration,'videoCodec':video['codec_name'],'pixelFormat':video['pix_fmt'],'colorSpace':video['color_space'],'audioCodec':audio['codec_name'],'audioSampleRate':48000,'channels':2,'language':'ara','fastStart':True}
    manifest['videos'].append(record)
    print('PASS',p.name,f'{width}x{height}',frames,'frames',duration,'s, H.264 BT.709, stereo AAC Arabic, fast start')
for name in ['arabi-tools-tashkeel-launch.ar.srt','arabi-tools-tashkeel-launch.ar.vtt','contact-sheet-16x9.jpg','contact-sheet-9x16.jpg']:
    p=ROOT/'out/final'/name;data=p.read_bytes();manifest['reviewFiles'].append({'file':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
(ROOT/'out/final/delivery.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('PASS: delivery.json written with final video and review-file hashes')
