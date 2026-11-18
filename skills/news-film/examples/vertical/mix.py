"""Thế Giới 24 (vertical cut) · score + foley → out/mix.wav (48 kHz stereo; mux.sh brings it to −14 LUFS). No narration.
Score: A-minor news theme, 120 BPM, beat 0 = 6.0 s. Cold open (0–4.5): a low horn pad. Sting: tutti. Map, photos, grid: full theme.
Spec card: pizzicato and horns. One beat of silence, then the heaviest hit (36.0), then a low string drone under the quote.
Closing (46.0): lift to C major, the stamp, a held chord. End card (52.5): C-major tutti.
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

BPM, T0 = 120, 6.0
B = 60 / BPM
def bt(k): return T0 + k * B
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
def triad(ch, octv):
    minor = ch.endswith('m'); r = 12 * (octv + 1) + NOTE[ch.rstrip('m')]
    return [r, r + (3 if minor else 4), r + 7]

# one bar = 2 s from 6.0 s
SECTIONS = [  # (first bar, chords, state)
    (0, ['Am', 'F', 'C', 'G'], 'full'),                # 6.0–14.0 map
    (4, ['C', 'G', 'Dm', 'E'], 'full'),                # 14.0–22.0 the summit and the reception
    (8, ['Am', 'F', 'G'], 'full'),                     # 22.0–28.0 the leaders' photo grid
    (11, ['Dm', 'Am', 'E', 'Am'], 'sparse'),           # 28.0–35.5 spec card
    (20, ['C', 'G', 'Am'], 'lift'),                    # 46.0–52.0 closing (stops at the stamp)
]
SIL = (35.4, 36.0)
BOOM, STAMP, END = 36.0, 49.6, 52.5
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
ev(0.0, 'horn', 45, 4.5, .32, -.2, .55, attack=.6, release=.5); ev(0.0, 'horn', 52, 4.5, .28, .2, .5, attack=.6, release=.5)
ev(0.0, 'cellos', 45, 4.5, .3, 0, .45, attack=.8, release=.5)
ev(1.6, 'glockenspiel', 81, 1.2, .45, .2, .5)

# —— sting ——
S0 = 4.5
for i, p in enumerate([57, 60, 64, 69]): ev(S0 + i * .02, 'violins_trem', p, .42, .25 + i * .05, (i - 1.5) * .2, .5, attack=.35)
stab(S0 + .4, [57, 60, 64], .95, .5)
ev(S0 + .4, 'timpani', 'A2', 1, .95, 0, 1.3); ev(S0 + .4, 'bass_drum', None, None, .9, 0, 1.1); ev(S0 + .4, 'crash', None, None, .7, .1, .7)
for i, p in enumerate([81, 84, 88, 93]): ev(S0 + .82 + i * .1, 'glockenspiel', p, .6, .55, .3 - i * .2, .7)

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
ev(6.0, 'timpani', 'A2', 1, .75, 0, 1.0); stab(6.0, [57, 60, 64], .7, .3)
for t, n in ((6.4, 81), (7.8, 84), (9.2, 88)): ev(t + .05, 'glockenspiel', n, .8, .5, .2, .55)   # map pings
ev(14.0, 'timpani', 'A2', 1, .7, 0, .9); ev(14.9, 'glockenspiel', 88, .8, .45, .2, .5)
ev(18.0, 'timpani', 'E3', 1, .6, 0, .8); ev(18.9, 'glockenspiel', 88, .8, .45, .2, .5)
ev(22.0, 'timpani', 'A2', 1, .65, 0, .85)
for t, n in ((22.2, 81), (22.5, 84), (22.8, 88), (23.1, 93)): ev(t, 'glockenspiel', n, .6, .45, -.3 + (n - 81) * .05, .5)
ev(28.0, 'timpani', 'D3', 1, .7, 0, .9)
for t, n in ((28.25, 86), (28.8, 81), (29.4, 84), (30.0, 88), (30.6, 93)): ev(t, 'glockenspiel', n, .5, .42, .2, .45)
# the heaviest hit, then the drone under the quote (no percussion)
stab(BOOM, [45, 52, 57], 1.0, .7); ev(BOOM, 'timpani', 'A2', 1.4, 1.0, 0, 1.4); ev(BOOM, 'bass_drum', None, None, 1.0, 0, 1.2); ev(BOOM, 'crash', None, None, .5, -.1, .5)
ev(BOOM + .05, 'cellos', 45, 10.0, .38, -.15, .6, attack=.6, release=1.0); ev(BOOM + .05, 'contrabass', 33, 10.0, .38, .15, .55, attack=.6, release=1.0)
for t, n, d in ((38.0, 64, 3.0), (41.0, 62, 2.6), (43.4, 60, 2.8)): ev(t, 'horn', n, d, .22, 0, .35, attack=.8, release=.8)
ev(46.0, 'timpani', 'C3', 1, .6, 0, .8)
# the stamp: no brass, a held C chord after it
ev(STAMP + .02, 'cellos', 48, 2.8, .35, -.1, .55, attack=.15, release=.5); ev(STAMP + .02, 'contrabass', 36, 2.8, .35, .1, .5, attack=.15, release=.5)
ev(STAMP + .02, 'horn', 55, 2.7, .25, 0, .35, attack=.4)
ev(STAMP, 'tubular_bells', 'C4', 2.5, .45, .2, .35)
# end card: roll → C-major tutti
for i in range(10): ev(END - .5 + i * .05, 'timpani', 'G2', .3, .35 + i * .05, 0, .6)
for ins, ns, g in [('trumpet', [72, 76, 79], .7), ('horn', [60, 64, 67], .8), ('trombone', [48, 55], .8), ('violins', [72, 76, 79, 84], .5), ('cellos', [36, 48], .7)]:
    for n in ns: ev(END, ins, n, 2.8, .78, 0, g, attack=.02, release=1.0)
ev(END, 'timpani', 'C3', 1, 1.0, 0, 1.3); ev(END, 'crash', None, None, .8, 0, .8); ev(END, 'tubular_bells', 'C5', 3, .6, .2, .5); ev(END, 'bass_drum', None, None, 1.0, 0, 1.1)
for i, p in enumerate([84, 88, 91, 96]): ev(END + .35 + i * .09, 'glockenspiel', p, .8, .5, -.3 + i * .2, .55)

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
bed(0.0, 4.5, X.norm(X.lp(X.noise(4.5), 700), .5), .05)            # cold open: room air
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
