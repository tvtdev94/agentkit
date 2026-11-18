"""Thế Giới 24 · score + foley → out/mix.wav (48 kHz stereo; mux.sh brings it to −14 LUFS). No narration.
Score: A-minor news theme, 120 BPM, beat 0 = 4.5 s. Cold open: a low horn pad. Sting: tutti. Map: full theme.
Event photos (16.5–30.5): theme continues. Spec card: pizzicato and horns. One beat of silence, then the heaviest hit, then a low string drone under the quote.
Closing: lift to C major, the stamp, a held chord. End card: C-major tutti.
Run: $LIB/.venv/bin/python mix.py"""
import json, os, sys
import numpy as np
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB', os.path.abspath(os.path.join(HERE, '../..')))
sys.path.insert(0, os.path.join(LIB, 'core/audio'))
import sfx as X
import sampler as S

SR = X.SR
EVD = json.load(open(os.path.join(HERE, 'events.json')))
DUR, EV = EVD['dur'], EVD['ev']
N = int(DUR * SR) + SR
music = np.zeros((N, 2), np.float32); fx = np.zeros((N, 2), np.float32); amb = np.zeros((N, 2), np.float32)
tt = np.arange(N) / SR

BPM, T0 = 120, 4.5
B = 60 / BPM
def bt(k): return T0 + k * B
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
def triad(ch, octv):
    minor = ch.endswith('m'); r = 12 * (octv + 1) + NOTE[ch.rstrip('m')]
    return [r, r + (3 if minor else 4), r + 7]

# one bar = 2 s from 4.5 s
# The film is the 49 s story cut with event photos inserted at 16.5 s (16.5–30.5): story time u ≥ 16.5 plays at film time u + SHIFT.
INS, SHIFT = 16.5, 14.0
def A(u): return u + SHIFT if u >= INS else u
SECTIONS = [  # (first bar, chords, state)
    (0, ['Am', 'F', 'C', 'G', 'Am', 'F'], 'full'),     # 4.5–16.5 map
    (6, ['C', 'G', 'Dm', 'E'], 'full'),                # 16.5–24.5 the summit and the reception
    (10, ['Am', 'F', 'G'], 'full'),                    # 24.5–30.5 the leaders' photo grid
    (13, ['Dm', 'Am', 'E', 'Am'], 'sparse'),           # spec card (story 16.5–24.5)
    (24, ['C', 'G', 'Am'], 'lift'),                    # closing (story 38.5–44.5; stops at the stamp)
]
SIL = (A(24.9), A(25.5))
STAMP = A(42.15)
def state(t, st):
    if SIL[0] <= t < SIL[1]: return 'off'
    if st == 'sparse' and t >= SIL[0]: return 'off'
    if st == 'lift' and t >= STAMP: return 'off'
    return st

M = []
def ev(t, inst, pitch, dur, vel, pan=0, gain=1.0, **kw): M.append(dict(t=t, inst=inst, pitch=pitch, dur=dur, vel=vel, pan=pan, gain=gain, **kw))
def stab(t, notes, v=.9, d=.35):
    for ins, o, pan, g in [('trumpet_stac', 12, .15, .9), ('horn_stac', 0, -.2, 1.0), ('trombone_stac', -12, .05, 1.0)]:
        for n in notes: ev(t, ins, n + o, d, v, pan, g)

# —— cold open: a low A-minor horn pad, one glockenspiel note on the underline ——
ev(0.0, 'horn', 45, 3.0, .32, -.2, .55, attack=.6, release=.5); ev(0.0, 'horn', 52, 3.0, .28, .2, .5, attack=.6, release=.5)
ev(0.0, 'cellos', 45, 3.0, .3, 0, .45, attack=.8, release=.5)
ev(1.6, 'glockenspiel', 81, 1.2, .45, .2, .5)

# —— sting ——
for i, p in enumerate([57, 60, 64, 69]): ev(3.0 + i * .02, 'violins_trem', p, .42, .25 + i * .05, (i - 1.5) * .2, .5, attack=.35)
stab(3.4, [57, 60, 64], .95, .5)
ev(3.4, 'timpani', 'A2', 1, .95, 0, 1.3); ev(3.4, 'bass_drum', None, None, .9, 0, 1.1); ev(3.4, 'crash', None, None, .7, .1, .7)
for i, p in enumerate([81, 84, 88, 93]): ev(3.82 + i * .1, 'glockenspiel', p, .6, .55, .3 - i * .2, .7)

# —— theme ——
saw_ev = []
for bar0, chords, st0 in SECTIONS:
    for j, ch in enumerate(chords):
        tb = bt((bar0 + j) * 4); tri = triad(ch, 3)
        pat = [tri[0] + 12, tri[2] + 12, tri[0] + 24, tri[2] + 12]
        for k in range(8):   # spiccato violins in eighths
            t = tb + k * B / 2; st = state(t, st0)
            if st == 'off' or (st == 'sparse' and k % 2): continue
            v = (.42 if k % 2 == 0 else .32) * {'full': 1, 'sparse': .75, 'lift': .7}[st]
            ev(t, 'violins_spic', pat[k % 4], .2, v, .25, .55)
        for k in range(4):   # pizzicato bass on the beat
            t = tb + k * B; st = state(t, st0)
            if st == 'off': continue
            ev(t, 'contrabass_pizz', tri[0] - 12, .4, .72 if k == 0 else .5, -.1, .9)
            if st == 'sparse' and k in (0, 2): ev(t, 'cellos_pizz', tri[1], .4, .45, .2, .5)
        if state(tb + .6, st0) != 'off':
            ev(tb, 'horn', tri[1], 2.0, .3, -.25, .5, attack=.25); ev(tb, 'horn', tri[2], 2.0, .28, .25, .45, attack=.25)
        for k in range(4):   # drums
            t = tb + k * B; st = state(t, st0)
            if st == 'full':
                if k in (0, 2): ev(t, 'bass_drum', None, None, .55, 0, .7)
                else: ev(t, 'snare2', None, None, .35, .1, .35)
            elif st == 'lift' and k == 0: ev(t, 'bass_drum', None, None, .4, 0, .55)
        if st0 == 'full':
            for k in range(16): saw_ev.append((tb + k * B / 4, 12 * 3 + NOTE[ch.rstrip('m')], k))

# cuts and card parts
ev(4.5, 'timpani', 'A2', 1, .75, 0, 1.0); stab(4.5, [57, 60, 64], .7, .3)
for t, n in ((6.0, 81), (9.0, 84), (12.0, 88)): ev(t + .05, 'glockenspiel', n, .8, .5, .2, .55)   # map pings
# inserted photos (film time): two hard cuts, the name tag, four grid tiles
ev(16.5, 'timpani', 'A2', 1, .7, 0, .9); ev(20.0, 'timpani', 'E3', 1, .6, 0, .8); ev(21.2, 'glockenspiel', 88, .8, .45, .2, .5)
ev(24.5, 'timpani', 'A2', 1, .65, 0, .85)
for t, n in ((24.7, 81), (25.0, 84), (25.3, 88), (25.6, 93)): ev(t, 'glockenspiel', n, .6, .45, -.3 + (n - 81) * .05, .5)
# spec card (story time from here on)
ev(A(16.5), 'timpani', 'D3', 1, .7, 0, .9)
for u, n in ((16.75, 86), (17.8, 81), (18.6, 84), (19.3, 88), (19.9, 93)): ev(A(u), 'glockenspiel', n, .5, .42, .2, .45)
# the heaviest hit, then the drone under the quote (no percussion)
stab(A(25.5), [45, 52, 57], 1.0, .7); ev(A(25.5), 'timpani', 'A2', 1.4, 1.0, 0, 1.4); ev(A(25.5), 'bass_drum', None, None, 1.0, 0, 1.2); ev(A(25.5), 'crash', None, None, .5, -.1, .5)
ev(A(25.55), 'cellos', 45, 13.0, .38, -.15, .6, attack=.6, release=1.0); ev(A(25.55), 'contrabass', 33, 13.0, .38, .15, .55, attack=.6, release=1.0)
for u, n, d in ((27.5, 64, 3.0), (30.5, 62, 3.0), (33.5, 60, 4.5)): ev(A(u), 'horn', n, d, .22, 0, .35, attack=.8, release=.8)
ev(A(38.5), 'timpani', 'C3', 1, .6, 0, .8)
# the stamp: no brass, a held C chord after it
ev(STAMP + .02, 'cellos', 48, 2.7, .35, -.1, .55, attack=.15, release=.5); ev(STAMP + .02, 'contrabass', 36, 2.7, .35, .1, .5, attack=.15, release=.5)
ev(STAMP + .02, 'horn', 55, 2.6, .25, 0, .35, attack=.4)
ev(STAMP, 'tubular_bells', 'C4', 2.5, .45, .2, .35)
# end card: roll → C-major tutti
for i in range(10): ev(A(44.5) + i * .05, 'timpani', 'G2', .3, .35 + i * .05, 0, .6)
for ins, ns, g in [('trumpet', [72, 76, 79], .7), ('horn', [60, 64, 67], .8), ('trombone', [48, 55], .8), ('violins', [72, 76, 79, 84], .5), ('cellos', [36, 48], .7)]:
    for n in ns: ev(A(45.0), ins, n, 2.8, .78, 0, g, attack=.02, release=1.0)
ev(A(45.0), 'timpani', 'C3', 1, 1.0, 0, 1.3); ev(A(45.0), 'crash', None, None, .8, 0, .8); ev(A(45.0), 'tubular_bells', 'C5', 3, .6, .2, .5); ev(A(45.0), 'bass_drum', None, None, 1.0, 0, 1.1)
for i, p in enumerate([84, 88, 91, 96]): ev(A(45.35) + i * .09, 'glockenspiel', p, .8, .5, -.3 + i * .2, .55)

music += S.render(M, DUR + 1, master=False)[:N]

# low-passed 16th-note saw pulse under the full theme
def saw(f, d): t = X.t_(d); return 2 * ((t * f) % 1) - 1
pulse = np.zeros((N, 2), np.float32)
for t, midi, k in saw_ev:
    f = 440 * 2 ** ((midi - 69) / 12)
    x = X.lp(saw(f, .11) * X.env_exp(.11, .045), 900)
    X.add(pulse, x.astype(np.float32), t, .16 * (1.0 if k % 4 else .6))
music += pulse
music = S.room(music, .35, .14)

# —— ambience ——
def bed(a, d, x, g):
    n0 = int(a * SR); n1 = min(N, n0 + int(d * SR)); s = x[:n1 - n0] * g
    i = np.arange(len(s)); fade = np.minimum(1, np.minimum(i / (.4 * SR), (len(s) - i) / (.4 * SR)))
    amb[n0:n1] += (s * fade)[:, None]
bed(0.0, 3.0, X.norm(X.lp(X.noise(3.0), 700), .5), .05)            # cold open: room air
bed(SIL[0], .7, X.norm(X.lp(X.noise(.7), 600), .5), .05)             # the silence keeps only air
for e in EV:
    if e['type'] == 'air': bed(e['t'], e['dur'], X.norm(X.lp(X.noise(e['dur']), 900), .5), .05)

# —— foley ——
def ping():
    tt2 = X.t_(1.2); x = np.sin(2 * np.pi * 1180 * tt2) * X.env_exp(1.2, .18) * .8
    x += np.sin(2 * np.pi * 1180 * tt2) * X.env_exp(1.2, .5) * .15
    return x.astype(np.float32)
for e in EV:
    t, ty = e['t'], e['type']
    if ty == 'swish': X.add(fx, X.whoosh(.32, .7), t, .6, -.4)
    elif ty == 'whoosh': X.add(fx, X.whoosh(.38, .8), t - .1, .55, .3)
    elif ty == 'glint': X.add(fx, X.ding(.4), t, .25, .4)
    elif ty == 'hit': X.add(fx, X.thump(.9, 60), t, .6)
    elif ty == 'stab': X.add(fx, X.thump(1.0, 55), t, .5)
    elif ty == 'quote_soft': X.add(fx, X.thump(.5, 95), t, .3); X.add(fx, X.whoosh(.2, .4), t - .05, .2, -.2)
    elif ty == 'mark': X.add(fx, (X.bp(X.noise(.4), 2500, 7000) * np.sin(np.pi * X.t_(.4) / .4)).astype(np.float32), t, .12, .3)
    elif ty == 'ping': X.add(fx, ping(), t, .28, .1); X.add(fx, ping(), t + .32, .08, -.3)
    elif ty == 'card': X.add(fx, (X.bp(X.noise(.3), 1200, 6000) * X.env_exp(.3, .1)).astype(np.float32), t, .22, .4); X.add(fx, X.thump(.4, 110), t + .2, .25)
    elif ty == 'draw':
        d = e['dur']; X.add(fx, (X.bp(X.noise(d), 3000, 7000) * np.sin(np.pi * X.t_(d) / d)).astype(np.float32), t, .035, -.2)
    elif ty == 'flap':
        for i in range(3): X.add(fx, X.click(1.1 + i * .15, .7), t + i * .05, .3, .2)
    elif ty == 'push': X.add(fx, X.lp(X.whoosh(.35, .7), 2500), t, .35)
    elif ty == 'slide': X.add(fx, X.whoosh(.2, .5), t, .28, .3)
    elif ty == 'bar': X.add(fx, X.lp(X.whoosh(.55, .6), 1800), t, .3, -.2); X.add(fx, X.click(1.4, .5), t + .55, .25)
    elif ty == 'pop': X.add(fx, X.pop(.7), t, .35, .3)
    elif ty == 'boom': X.add(fx, X.thump(1.0, 42), t, .85); X.add(fx, X.lp(X.whoosh(.5, .9), 1200), t - .3, .35)
    elif ty == 'line': X.add(fx, X.lp(X.whoosh(.22, .4), 3000), t, .16, .2)
    elif ty == 'stamp_big': X.add(fx, X.thump(1.0, 70), t, .55); X.add(fx, X.lp(X.clack(.6, 1.0), 2500), t, .25)
fx = S.room(fx, .2, .08)

mix = music * .9 + fx * .8 + amb * .8
fade = np.clip((DUR - tt) / .8, 0, 1); mix *= fade[:, None]
mix = mix[:int(DUR * SR)]
# bus compression (linked): tames the hits so loudnorm can reach −14 LUFS under the true-peak ceiling
lvl = np.maximum(np.abs(mix[:, 0]), np.abs(mix[:, 1]))
cmp = X.compress(lvl.astype(np.float64), .22, 3.0, .002, .12)
gain = np.where(lvl > 1e-6, cmp / np.maximum(lvl, 1e-6), 1.0)
mix = mix * gain[:, None].astype(np.float32)
mix = mix / (np.abs(mix).max() + 1e-9) * .9
mix = np.stack([X.limit(mix[:, 0], .95), X.limit(mix[:, 1], .95)], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
wavfile.write(os.path.join(HERE, 'out', 'mix.wav'), SR, (mix * 32767).astype(np.int16))
print('mix', mix.shape, 'peak', float(np.abs(mix).max()))
print('\n'.join(S.credits(sorted({e['inst'] for e in M}))))
