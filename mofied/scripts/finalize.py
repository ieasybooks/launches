"""Loudness-normalise a rendered film to -14 LUFS (true peak about -1.5 dBTP) and remux with fast start.
usage: finalize.py video.mp4 final.mp4 "Title" mix.wav <ara|eng>"""
import json, re, subprocess, sys
raw, out, title, audio, language = sys.argv[1:6]

def loud(path):
    err = subprocess.run(["ffmpeg", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", err)[-1]), float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", err)[-1])

probe = json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration", "-of", "json", raw]))
video_duration = float(probe["streams"][0]["duration"])
I, tp = loud(audio)
gain = -14.0 - I
print(f"mix: {I} LUFS, true peak {tp} dBTP → gain {gain:+.2f} dB")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                "-af", f"volume={gain:.2f}dB,alimiter=limit=0.79:attack=4:release=80:level=disabled,aresample=48000,apad=whole_dur={video_duration:.6f},atrim=duration={video_duration:.6f}",
                "-c:a", "aac", "-b:a", "256k", "-metadata", f"title={title}", "-metadata:s:a:0", f"language={language}",
                "-movflags", "+faststart", out], check=True)
I2, tp2 = loud(out)
print(f"final: {I2} LUFS, true peak {tp2} dBTP")
