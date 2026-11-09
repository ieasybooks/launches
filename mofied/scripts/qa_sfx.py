"""Flag sound effects that carry a sustained pitch (a bell, chime, ring or musical tone), plus their
length and loudness. A non-tonal effect has no narrow spectral peak that persists over time.
usage: qa_sfx.py [dir]   (default audio/sfx_raw)"""
import sys, subprocess, pathlib, numpy as np
ROOT = pathlib.Path(__file__).resolve().parent.parent
SR = 44100

def decode(p):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(p), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"])
    return np.frombuffer(raw, np.float32)

def tonality(x, n=4096, hop=1024):
    """Longest run (seconds) of frames in which one narrow peak stands 18 dB above its neighbourhood
    at a stable frequency, among frames loud enough to matter."""
    win = np.hanning(n)
    freqs = np.fft.rfftfreq(n, 1 / SR)
    band = (freqs > 150) & (freqs < 6000)
    level = np.sqrt(np.mean(x ** 2)) + 1e-9
    peaks = []
    for i in range(0, max(1, len(x) - n), hop):
        seg = x[i:i + n]
        if len(seg) < n or np.sqrt(np.mean(seg ** 2)) < level * 0.3:
            peaks.append(None); continue
        mag = 20 * np.log10(np.abs(np.fft.rfft(seg * win)) + 1e-9)
        m = mag[band]; f = freqs[band]
        k = int(np.argmax(m))
        local = np.median(m[max(0, k - 40):k + 40])
        peaks.append(f[k] if m[k] - local > 18 else None)
    best = run = 0; prev = None
    for p in peaks:
        if p is not None and prev is not None and abs(p - prev) < prev * 0.02:
            run += 1; best = max(best, run)
        else:
            run = 0
        prev = p
    return best * hop / SR

folder = ROOT / (sys.argv[1] if len(sys.argv) > 1 else "audio/sfx_raw")
flagged = []
for p in sorted(folder.glob("*.*")):
    if p.suffix not in (".mp3", ".wav"): continue
    x = decode(p)
    t = tonality(x)
    peak = 20 * np.log10(np.abs(x).max() + 1e-9)
    rms = 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
    mark = "TONAL" if t >= 0.25 else "ok"
    if mark != "ok": flagged.append(p.stem)
    print(f"{p.stem:10s} {len(x) / SR:5.2f}s peak {peak:6.1f} dBFS rms {rms:6.1f} dBFS sustained pitch {t:4.2f}s {mark}")
if flagged: raise SystemExit("tonal effects: " + ", ".join(flagged))
