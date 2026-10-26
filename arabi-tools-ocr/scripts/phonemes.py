"""Phoneme QA with the predecessor's cached wav2vec2 xlsr-53 eSpeak model.
Usage: phonemes.py [--json report.json] file.wav|mp3 [file@start@end ...]
The recognizer is evidence for endings; its IPA is not a perfect Arabic transcription.
"""
import argparse, json, pathlib, subprocess
import numpy as np
import torch
from huggingface_hub import hf_hub_download
from transformers import Wav2Vec2ForCTC, Wav2Vec2FeatureExtractor
parser=argparse.ArgumentParser()
parser.add_argument('--json',dest='report')
parser.add_argument('files',nargs='+')
args=parser.parse_args()
torch.set_num_threads(2)
MID='facebook/wav2vec2-xlsr-53-espeak-cv-ft'
fe=Wav2Vec2FeatureExtractor.from_pretrained(MID)
vocab={v:k for k,v in json.load(open(hf_hub_download(MID,'vocab.json'))).items()}
model=Wav2Vec2ForCTC.from_pretrained(MID).eval()
report={}
for p in args.files:
    spec=p.split('@')
    raw=subprocess.check_output(['ffmpeg','-v','error','-i',spec[0],'-f','f32le','-ac','1','-ar','16000','-'])
    x=np.frombuffer(raw,np.float32)
    offset=0
    if len(spec)==3:
        offset=float(spec[1]);x=x[int(offset*16000):int(float(spec[2])*16000)]
    inp=fe(x,sampling_rate=16000,return_tensors='pt')
    with torch.inference_mode(): ids=model(inp.input_values).logits.argmax(-1)[0].tolist()
    out=[];prev=None;segments=[]
    for frame,i in enumerate(ids):
        if i!=prev and vocab[i] not in ('<pad>','<s>','</s>','<unk>'):
            out.append(vocab[i]);segments.append({'at':round(offset+frame*len(x)/16000/len(ids),3),'phone':vocab[i]})
        prev=i
    phones=' '.join(out)
    print(p,'|',phones,flush=True)
    report[p]={'model':MID,'phones':phones,'segments':segments}
if args.report:pathlib.Path(args.report).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
