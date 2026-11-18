"""Compare a rendered video with stills of the same times, so a frame the browser captured wrongly (an old picture left
under a new one) is caught before delivery. Stills come from core/render/still.mjs (one page, one frame each).
Run from the library root:
  node core/render/still.mjs <film> --range 0:<dur>:0.5 [--size WxH] --out <dir> --prefix v_
  .venv/bin/python <film>/tools/verify_frames.py <video.mp4> <dir> [--fps 24] [--max 6]
Prints the worst frames and exits 1 if any differs by more than --max (mean absolute difference, 0–255, at 270 px wide)."""
import argparse, glob, os, re, subprocess, sys
import numpy as np
from PIL import Image

ap = argparse.ArgumentParser(); ap.add_argument('video'); ap.add_argument('stills'); ap.add_argument('--fps', type=float, default=24); ap.add_argument('--max', type=float, default=6)
a = ap.parse_args()
files = sorted(glob.glob(os.path.join(a.stills, 'v_*.jpg')), key=lambda f: float(re.search(r'v_([\d.]+)\.jpg$', f).group(1)))
if not files: sys.exit(f'no v_*.jpg stills in {a.stills}')
probe = Image.open(files[0]); w = 270; h = round(probe.height * w / probe.width)
# decode the whole video once at 270 px wide, raw RGB
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.video, '-vf', f'scale={w}:{h}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
frames = np.frombuffer(raw, np.uint8).reshape(-1, h, w, 3)
res = []
for f in files:
    t = float(re.search(r'v_([\d.]+)\.jpg$', f).group(1)); n = round(t * a.fps)
    if n >= len(frames): continue
    s = np.asarray(Image.open(f).convert('RGB').resize((w, h), Image.BILINEAR), np.float32)
    res.append((float(np.abs(frames[n].astype(np.float32) - s).mean()), t))
res.sort(reverse=True)
bad = [r for r in res if r[0] > a.max]
print(f'{len(res)} frames compared; worst:', ', '.join(f'{t:.2f}s {d:.1f}' for d, t in res[:5]))
if bad: print('MISMATCH at', ', '.join(f'{t:.2f}s ({d:.1f})' for d, t in sorted(bad, key=lambda r: r[1]))); sys.exit(1)
print('all frames match the stills')
