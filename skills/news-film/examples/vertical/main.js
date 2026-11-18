// THẾ GIỚI 24 · Vua Charles III tại CHOGM — vertical cuts (1080×1920) for Instagram/Facebook Reels and YouTube Shorts.
// Broadcast News Package, no narration. Canvas 2D, deterministic render(t). 120 BPM grid, beat 0 = 6.0 s. Shot list in TREATMENT.md.
// Every fact on screen is in FACTS.md. ?cut=reels (default) or ?cut=shorts picks the platform's safe box: everything that must be
// read stays inside it (the platforms draw their buttons, title and search bar over the rest).
const W = 1080, H = 1920, DUR = 56.5;
const CUT = new URLSearchParams(location.search).get('cut') === 'shorts' ? 'shorts' : 'reels';
// Reels: right rail ~120 px, caption ~350–440 px, top ~210–250 px. Shorts: right rail ~190–200 px, title ~380–390 px, top ~300–380 px.
const SAFE = CUT === 'shorts' ? { l: 60, r: 880, t: 340, b: 1530 } : { l: 60, r: 960, t: 250, b: 1480 };
const cv = document.getElementById('out'); const ctx = cv.getContext('2d');

const C = {
  ink: '#121417', ink2: '#1B1E23', ink3: '#22262C', line: '#454B55',
  lemon: '#F2CF1D', lemonL: '#F8DE4A', lemonD: '#D8B30C', gold: '#D4B064',
  paper: '#F4F1E8', olive: '#6E5A1E', white: '#FFFFFF', grey: '#C9CCD2', grey2: '#7D838D',
};
const F = {
  v9: s => `900 ${s}px BVP`, v7: s => `700 ${s}px BVP`,
  b8: s => `800 ${s}px Barlow`, b6: s => `600 ${s}px Barlow`, b6i: s => `italic 600 ${s}px Barlow`, mono: s => `500 ${s}px Plex`,
};

// shot boundaries (film time)
const T = { sting: 4.5, map: 6.0, sum: 14.0, rec: 18.0, grid: 22.0, spec: 28.0, quote: 35.5, close: 46.0, end: 52.5 };

// —— helpers ——
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const eo = x => 1 - Math.pow(1 - x, 3);
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const back = (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function mixc(a, b, k) { const pa = a.match(/\w\w/g).map(h => parseInt(h, 16)), pb = b.match(/\w\w/g).map(h => parseInt(h, 16)); return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], k))).join(',')})`; }

// —— text registry for readcheck ——
let TX = [];
function text(s, x, y, font, color, align = 'left', ls = 0, id = null, pass = false) {
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.letterSpacing = ls + 'px'; ctx.fillText(s, x, y);
  const w = ctx.measureText(s).width; ctx.letterSpacing = '0px';
  if (id) {
    const m = ctx.getTransform(); const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2; const fs = parseFloat(font.match(/([\d.]+)px/)[1]);
    const p0 = m.transformPoint({ x: x0, y: y - fs }), p1 = m.transformPoint({ x: x0 + w, y: y + 8 });
    const r = { id, text: s, x0: Math.min(p0.x, p1.x), y0: Math.min(p0.y, p1.y), x1: Math.max(p0.x, p1.x), y1: Math.max(p0.y, p1.y) };
    if (pass) r.pass = true; TX.push(r);
  }
  return w;
}
function tw(s, font, ls = 0) { ctx.font = font; ctx.letterSpacing = ls + 'px'; const w = ctx.measureText(s).width; ctx.letterSpacing = '0px'; return w; }
function fit(str, fontFn, s, maxW, ls = 0) { while (s > 12 && tw(str, fontFn(s), ls) > maxW) s -= 1; return s; }
// greedy word wrap at a fixed font
function wrap(str, font, maxW, ls = 0) {
  const out = []; let cur = '';
  for (const w of str.split(' ')) { const nx = cur ? cur + ' ' + w : w; if (cur && tw(nx, font, ls) > maxW) { out.push(cur); cur = w; } else cur = nx; }
  if (cur) out.push(cur); return out;
}
function pushUp(str, x, y, font, color, k, h, ls = 0, id = null, align = 'left') {
  if (k <= 0) return 0;
  ctx.save(); ctx.beginPath(); ctx.rect(0, y - h, W, h + 14); ctx.clip();
  const w = text(str, x, y + (1 - k) * (h + 14), font, color, align, ls, k >= 1 ? id : null); ctx.restore(); return w;
}

// —— the brand plate ——
function plate(cx, cy, s, glint = -1, drop = 1) {
  const w = 520 * s, h = 180 * s, k = h * .28;
  ctx.save(); ctx.translate(cx, cy);
  const path = new Path2D(); path.moveTo(-w / 2 + k, -h / 2); path.lineTo(w / 2 + k, -h / 2); path.lineTo(w / 2 - k, h / 2); path.lineTo(-w / 2 - k, h / 2); path.closePath();
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, C.lemonL); g.addColorStop(1, C.lemonD);
  ctx.fillStyle = g; ctx.fill(path);
  ctx.save(); ctx.clip(path);
  const gx = -w / 2 - k;
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(gx + 2 * k, -h / 2); ctx.lineTo(gx + 2 * k + w * .085, -h / 2); ctx.lineTo(gx + w * .085, h / 2); ctx.lineTo(gx, h / 2); ctx.fill();
  ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(gx + 2 * k + w * .085, -h / 2); ctx.lineTo(gx + 2 * k + w * .11, -h / 2); ctx.lineTo(gx + w * .11, h / 2); ctx.lineTo(gx + w * .085, h / 2); ctx.fill();
  ctx.font = F.b8(h * .74); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  let x = -w * .27;
  ['T', 'G', '2', '4'].forEach((L, i) => {
    const d = clamp(drop * 4 - i), yy = h * .29 + (1 - eo(d)) * -h * 1.1;
    ctx.save(); ctx.globalAlpha *= clamp(d * 3); ctx.fillStyle = C.ink; ctx.fillText(L, x, yy); ctx.restore();
    x += ctx.measureText(L).width - h * .005;
  });
  if (glint >= 0 && glint <= 1) {
    const gx2 = lerp(-w, w, glint), gg = ctx.createLinearGradient(gx2 - 80 * s, 0, gx2 + 80 * s, 0);
    gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(.5, 'rgba(255,255,255,.6)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gg; ctx.fillRect(-w, -h, w * 2, h * 2);
  }
  ctx.restore(); ctx.restore();
}
function wordmark(x, y, size, align = 'center', id = null) {
  const parts = [['THẾ GIỚI ', C.white], ['24', C.lemon]], ls = size * .1;
  const tot = parts.reduce((a, [s]) => a + tw(s, F.v9(size), ls), 0);
  let cx = align === 'center' ? x - tot / 2 : align === 'right' ? x - tot : x; const x0 = cx;
  for (const [s, c] of parts) cx += text(s, cx, y, F.v9(size), c, 'left', ls);
  if (id) TX.push({ id, text: 'THẾ GIỚI 24', x0, y0: y - size, x1: cx, y1: y + 8 });
}

// ============ package layer ============
// One strap from the map to the end-card wipe; in this cut it changes only on cuts and wipes.
const STRAP = [
  { a: T.map, tab: 'HOÀNG GIA ANH', hl: 'Chuyến công du mùa thu của Vua Charles III' },
  { a: T.sum, tab: 'HOÀNG GIA ANH', hl: 'Vua Charles III tại Antigua' },
  { a: T.grid, tab: 'KHỐI THỊNH VƯỢNG CHUNG', hl: 'Lãnh đạo các nước tới Antigua dự CHOGM' },
  { a: T.spec, tab: 'KHỐI THỊNH VƯỢNG CHUNG', hl: 'Hội nghị Thượng đỉnh Khối Thịnh vượng chung lần thứ 28' },
  { a: T.quote, tab: 'NHÂN VẬT', hl: 'Vua Charles III · Người đứng đầu Khối Thịnh vượng chung' },
  { a: T.close, tab: 'HOÀNG GIA ANH', hl: 'Phát biểu khai mạc CHOGM · St John’s, 03.11.2026' },
];
const SBH = 132, EBW = 100, SX = SAFE.l, SBW = SAFE.r - SAFE.l - EBW, SBY = SAFE.b - 52 - SBH, STY = SBY - 44;
// content was laid out in a design box (x 56–1016, y 326–1232); content() maps it into the safe box, between the bug and the strap
const CT = SAFE.t + 80, CB = STY - 20, DW = 960, CS = Math.min((SAFE.r - SAFE.l) / DW, (CB - CT) / 906);
function content(fn, dx0 = 56, dy0 = 326, sx = SAFE.l, sy = CT, s = CS) { ctx.save(); ctx.translate(sx, sy); ctx.scale(s, s); ctx.translate(-dx0, -dy0); fn(); ctx.restore(); }
function strap(t) {
  if (t < T.map || t >= T.end) return;
  let S = STRAP[0]; for (const s of STRAP) if (t >= s.a) S = s;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(SX + 8, SBY + 8, SBW + EBW, SBH);
  ctx.fillStyle = C.paper; ctx.fillRect(SX, SBY, SBW, SBH);
  ctx.fillStyle = C.lemon; ctx.fillRect(SX, SBY, 14, SBH);
  ctx.fillStyle = C.ink; ctx.fillRect(SX + SBW, SBY, EBW, SBH); ctx.fillStyle = C.lemon; ctx.fillRect(SX + SBW, SBY, EBW, 6);
  text('TG24', SX + SBW + EBW / 2, SBY + SBH / 2 + 15, F.b8(40), C.lemon, 'center', 1);
  // one line if it fits at 44 px, else two lines at up to 42 px
  const mw = SBW - 70; let L = [S.hl], fs = 44;
  if (tw(S.hl, F.v9(fs)) > mw) { fs = 42; L = wrap(S.hl, F.v9(fs), mw); while (L.length > 2 || L.some(l => tw(l, F.v9(fs)) > mw)) { fs--; L = wrap(S.hl, F.v9(fs), mw); } }
  const lh = fs * 1.22, y0 = SBY + SBH / 2 - (L.length - 1) * lh / 2 + fs * .36;
  L.forEach((l, i) => text(l, SX + 40, y0 + i * lh, F.v9(fs), C.ink, 'left', 0, 'strap' + i));
  const tabW = 40 + tw(S.tab, F.v9(26), 1);
  ctx.fillStyle = C.lemon; ctx.fillRect(SX, STY, tabW, SBY - STY);
  text(S.tab, SX + 20, STY + 33, F.v9(26), C.ink, 'left', 1, 'tab');
  ctx.restore();
}

// corner tag: the proportion bars on the spec card are a schematic, not data
function cornerTag(t) {
  const a = T.spec, b = T.quote;
  if (t < a || t >= b) return;
  const k = Math.min(eo(seg(t, a + .3, a + .5)), 1 - seg(t, b - .2, b));
  if (k <= 0) return;
  ctx.save(); const x = SAFE.l, y = SAFE.t - 8, h = 64, w = 330;
  ctx.translate(0, y + h / 2); ctx.scale(1, Math.max(.02, k)); ctx.translate(0, -(y + h / 2));
  ctx.fillStyle = 'rgba(18,20,23,.82)'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = C.gold; ctx.fillRect(x, y, 8, h);
  text('SCHEMATIC', x + 26, y + 28, F.mono(18), C.gold, 'left', 2, k >= 1 ? 'tag' : null);
  text('Sơ đồ minh hoạ tỉ lệ', x + 26, y + 54, F.v7(19), C.white, 'left', 0, k >= 1 ? 'tagv' : null);
  ctx.restore();
}

// source or photo credit, under the strap, left-aligned (the right edge sits under the platform's buttons)
function srcLine(s1, s2, id = 'src') {
  ctx.save(); ctx.globalAlpha = .78;
  text(s1, SX, SAFE.b - 26, F.mono(15), C.paper, 'left', .5, id, true);
  if (s2) text(s2, SX, SAFE.b + 2, F.v7(18), C.paper, 'left', 0, id + 'v', true);
  ctx.restore();
}
const PHOTO_CR = ['PHOTO: SIMON DAWSON / NO 10 · OGL 3', 'Ảnh: Phủ Thủ tướng Anh · OGL v3'];
function credit(t) {
  if (t < T.map || t >= T.end) return;
  if (t < T.sum) srcLine('SOURCE: ROYAL.UK · NATURAL EARTH', 'Nguồn: royal.uk · bản đồ Natural Earth');
  else if (t < T.grid) srcLine(...PHOTO_CR);
  else if (t < T.spec) srcLine('PHOTOS: SIMON DAWSON / NO 10 · OGL 3', PHOTO_CR[1]);
  else srcLine('SOURCE: ROYAL.UK · SPEECH 3 NOV 2026', 'Nguồn: royal.uk · toàn văn bài phát biểu');
}

const BUG = [SAFE.r - 76, SAFE.t + 30, .3];
function bug(t) {
  if (t < T.map - .05 || t > T.end) return;
  ctx.save(); ctx.globalAlpha = .95; plate(BUG[0], BUG[1], BUG[2], -1, 1);
  text('THẾ GIỚI 24', BUG[0] - 92, BUG[1] + 9, F.v9(21), C.white, 'right', 2); ctx.restore();
}

// ============ backgrounds ============
function studioBg(t, warm = .16) {
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  const rg = ctx.createRadialGradient(700, 600, 60, 700, 600, 1300); rg.addColorStop(0, `rgba(242,207,29,${warm})`); rg.addColorStop(1, 'rgba(242,207,29,0)');
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 6; i++) {
    const x = ((i * 300 + t * (30 + i * 6)) % 2000) - 500, w = 40 + hash(i) * 120;
    ctx.fillStyle = `rgba(242,207,29,${(.025 + hash(i + 9) * .035) * warm / .16})`;
    ctx.beginPath(); ctx.moveTo(x + 400, 0); ctx.lineTo(x + 400 + w, 0); ctx.lineTo(x + w - 500, H); ctx.lineTo(x - 500, H); ctx.fill();
  }
  dots(t, .05, 12);
}
function dots(t, a, sp) { ctx.fillStyle = `rgba(244,241,232,${a})`; for (let x = 40 - (t * sp) % 48; x < W; x += 48) for (let y = 24; y < H; y += 48) ctx.fillRect(x, y, 2, 2); }
function vignette(a = .5) {
  const g = ctx.createRadialGradient(W / 2, H * .45, W * .4, W / 2, H * .45, H * .75);
  g.addColorStop(0, 'rgba(8,9,11,0)'); g.addColorStop(1, `rgba(8,9,11,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function shade(y0, y1, a0, a1) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, `rgba(14,16,19,${a0})`); g.addColorStop(1, `rgba(14,16,19,${a1})`); ctx.fillStyle = g; ctx.fillRect(0, y0, W, H - y0); }
function underline(x, y, w, k) { if (k > 0) { ctx.fillStyle = C.lemon; ctx.fillRect(x, y, w * k, 9); } }
// photos (graded to the package duotone by tools/prep_photos.py)
const IM = {};
function loadImg(src) { return new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(src); i.src = src; }); }
// place image point (fx, fy) — fractions of the image — at screen (sx, sy) at scale s, clamped so the image always covers the rectangle
function photoAt(img, fx, fy, s, sx, sy, rx = 0, ry = 0, rw = W, rh = H) {
  s = Math.max(s, rw / img.width, rh / img.height);
  let ox = sx - fx * img.width * s, oy = sy - fy * img.height * s;
  ox = Math.min(rx, Math.max(rx + rw - img.width * s, ox)); oy = Math.min(ry, Math.max(ry + rh - img.height * s, oy));
  ctx.save(); ctx.beginPath(); ctx.rect(rx, ry, rw, rh); ctx.clip(); ctx.drawImage(img, ox, oy, img.width * s, img.height * s); ctx.restore();
  return { s, ox, oy, at: (x, y) => [ox + x * img.width * s, oy + y * img.height * s] };
}
const cover = (img, w = W, h = H) => Math.max(w / img.width, h / img.height);
const GR = [];
function makeGrain() {
  for (let k = 0; k < 6; k++) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), d = g.createImageData(256, 256);
    for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (hash(i * .37 + k * 9.1) + hash(i * .11 + k) - 1) * 150; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0); GR.push(c);
  }
}
// grain on the photo layer only, never on graphics or the package
function grain(t, a = .07) {
  const f = Math.floor(t * 24), c = GR[f % GR.length];
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = a;
  const ox = -Math.floor(hash(f) * 256), oy = -Math.floor(hash(f + 7) * 256);
  for (let x = ox; x < W; x += 256) for (let y = oy; y < H; y += 256) ctx.drawImage(c, x, y);
  ctx.restore();
}
// a lemon name tag pinned above a face, scaled in on a back ease
// dy < 0: the tag sits above the head; dy > 0: below the chin, its line pointing up
function nameTag(t, a, hx, hy, dy = -200, s = 'VUA CHARLES III') {
  const nk = seg(t, a, a + .25); if (nk <= 0) return;
  const lw = 40 + tw(s, F.v9(28), 1), ty = hy + dy, sg = Math.sign(dy), y0 = ty - 26 * sg, y1 = hy + 50 * sg;
  ctx.strokeStyle = C.lemon; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hx, y0); ctx.lineTo(hx, lerp(y0, y1, eo(nk))); ctx.stroke();
  ctx.save(); ctx.translate(hx, ty); ctx.scale(back(nk, 2.2), back(nk, 2.2));
  ctx.fillStyle = C.lemon; ctx.fillRect(-lw / 2, -26, lw, 52);
  text(s, 0, 11, F.v9(28), C.ink, 'center', 1, nk >= 1 ? 'tag_' + a : null); ctx.restore();
}

// ============ 1 · cold open (0–4.5): his words first ============
function shotCold(t) {
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  // The King at the reception for new Commonwealth leaders, Antigua, 3 Nov 2026 (No 10 Downing Street, OGL v3): slow push on his face
  photoAt(IM.king_leaders_b, .76, .3, lerp(1.25, 1.33, seg(t, 0, T.sting)), 560, 600);
  shade(700, 1150, 0, .9); vignette(.5); grain(t);
  content(() => coldText(t), 56, 1440, SAFE.l, SAFE.b - 50);
  srcLine('PHOTO 3 NOV 2026: NO 10 · OGL 3', 'Ảnh: Vua Charles III tại Antigua', 'pc0');
  const dk = seg(t, T.sting - .4, T.sting); if (dk > 0) { ctx.fillStyle = `rgba(10,11,13,${dk * .5})`; ctx.fillRect(0, 0, W, H); }
}
function coldText(t) {
  const x = 64;
  ctx.globalAlpha = eo(seg(t, .05, .25)); text('ANTIGUA · 03.11.2026', x, 960, F.mono(26), C.gold, 'left', 4, 'c0'); ctx.globalAlpha = 1;
  const qk = seg(t, .08, .3);
  if (qk > 0) { const s = back(qk, 2.4); ctx.save(); ctx.translate(x + 6, 1000); ctx.scale(s, s); text('“', -20, 110, F.b8(180), C.lemon, 'left'); ctx.restore(); }
  const fs = fit('…the most profound', F.b8, 132, 950, 1);
  pushUp('…the most profound', x, 1190, F.b8(fs), C.white, eo(seg(t, .08, .28)), fs, 1, 'c1');
  pushUp('personal sorrow.”', x, 1320, F.b8(fs), C.white, eo(seg(t, .16, .36)), fs, 1, 'c2');
  const sw = tw('personal ', F.b8(fs), 1), ow = tw('sorrow', F.b8(fs), 1);
  underline(x + sw, 1340, ow, eio(seg(t, 1.6, 1.95)));
  const vk = eo(seg(t, .3, .55));
  ctx.globalAlpha = vk; text('“…nỗi đau buồn cá nhân sâu sắc nhất”', x, 1420, F.v7(40), C.lemon, 'left', 0, vk >= 1 ? 'c3' : null); ctx.globalAlpha = 1;
}

// ============ 2 · sting (4.5–6.0): the plate becomes the bug ============
const SC = [540, 820];
function shotSting(t) {
  const s = t - T.sting; studioBg(t);
  [[.04, .3, 22, -60], [.1, .36, 8, 40]].forEach(([a, b, h, dy]) => {
    const k = seg(s, a, b); if (k <= 0 || k >= 1) return;
    ctx.save(); ctx.translate(SC[0], SC[1] + dy); ctx.rotate(-.24);
    const x = lerp(-1400, 1400, eio(k)); ctx.fillStyle = C.lemon; ctx.fillRect(x - 600, -h / 2, 1200, h); ctx.restore();
  });
}
function stingLogo(t) {
  const s = t - T.sting; if (s < 0 || s > 1.5) return;
  const k = seg(s, .16, .42), fly = eio(seg(s, 1.12, 1.45));
  const shake = s > .42 && s < .7 ? Math.sin(s * 90) * 12 * (1 - seg(s, .42, .7)) : 0;
  const cx = lerp(SC[0], BUG[0], fly) + shake, cy = lerp(SC[1], BUG[1], fly), sc = lerp(back(k, 2.2) * .82, BUG[2], fly);
  if (k > 0) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate((1 - eo(k)) * -.12 * (1 - fly)); ctx.translate(-cx, -cy);
    plate(cx, cy, sc, seg(s, .85, 1.12) || -1, seg(s, .3, .7)); ctx.restore();
  }
  const r = seg(s, .42, .8); if (r > 0 && r < 1) { ctx.strokeStyle = `rgba(242,207,29,${1 - r})`; ctx.lineWidth = 6 * (1 - r) + 1; ctx.beginPath(); ctx.ellipse(SC[0], SC[1], 260 + r * 420, 110 + r * 260, 0, 0, Math.PI * 2); ctx.stroke(); }
  const wa = seg(s, .5, .8), wo = 1 - seg(s, 1.05, 1.18);
  if (wa > 0 && wo > 0) {
    ctx.save(); ctx.globalAlpha = wo; ctx.beginPath(); ctx.rect(SC[0] - 480 * eo(wa), SC[1] + 110, 960 * eo(wa), 170); ctx.clip();
    wordmark(SC[0], SC[1] + 200, 72, 'center');
    text('BẢN TIN QUỐC TẾ', SC[0], SC[1] + 255, F.v7(26), C.gold, 'center', 5);
    ctx.restore();
  }
}

// ============ 3 · map (6.0–14.0): the tour in one look ============
let LAND = null, LANDP = null;
const MAPK = 43, LON0 = -67.6, LAT0 = 16, COSL = Math.cos(16 * Math.PI / 180), MC = [540, 720];
const proj = (lon, lat) => [(lon - LON0) * MAPK * COSL, -(lat - LAT0) * MAPK];
const STOPS = [
  { ll: [-77.35, 25.06], t: 6.4, name: 'BAHAMAS', l1: '28.10 · Clifford Park', l2: 'nơi Bahamas giành độc lập năm 1973', side: 1, dy: 200, isl: [-79.6, -72.6, 20.8, 27.4],
    img: 'nassau_assembly', f: [.5, .5], cr: 'NASSAU · P. HUGHES · CC BY 4.0' },
  { ll: [-58.16, 6.80], t: 7.8, name: 'GUYANA', l1: 'Georgetown · Umana Yana', l2: 'Vua gặp Tổng thống Ali', side: -1, dy: -196,
    img: 'umana', f: [.5, .5], cr: 'UMANA YANA · S. DOS SANTOS · PD' },
  { ll: [-61.85, 17.12], t: 9.2, name: 'ANTIGUA VÀ BARBUDA', l1: 'St John’s · 03.11', l2: 'Hoàng hậu tham gia · khai mạc CHOGM', side: -1, dy: 44, isl: [-62.1, -61.5, 16.9, 17.8],
    img: 'dockyard', f: [.47, .45], cr: 'NELSON’S DOCKYARD · T. LIPTAK · CC BY 4.0' },
];
const ROUTE = [[6.8, 7.6], [8.2, 9.0]];
function mapView(t) {
  const S = lerp(1.0, 1.05, eio(seg(t, T.map, T.sum)));
  return { S, tf: (x, y) => [MC[0] + x * S, MC[1] + y * S], O: MC };
}
function buildMap() {
  LANDP = new Path2D(); const isl = STOPS.map(() => new Path2D());
  for (const r of LAND) {
    let sx = 0, sy = 0, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; const p = new Path2D();
    r.forEach(([lon, lat], i) => { const [x, y] = proj(lon, lat); i ? p.lineTo(x, y) : p.moveTo(x, y); sx += lon; sy += lat; x0 = Math.min(x0, lon); x1 = Math.max(x1, lon); y0 = Math.min(y0, lat); y1 = Math.max(y1, lat); });
    const small = x1 - x0 < 2.5 && y1 - y0 < 2.5;   // islands only: keeps Cuba and Hispaniola out of the Bahamas box
    p.closePath(); LANDP.addPath(p);
    const cx = sx / r.length, cy = sy / r.length;
    STOPS.forEach((s, j) => { if (s.isl && small && cx >= s.isl[0] && cx <= s.isl[1] && cy >= s.isl[2] && cy <= s.isl[3]) isl[j].addPath(p); });
  }
  STOPS.forEach((s, j) => s.path = isl[j]);
}
function bez(a, b, bend) { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1]; return [a, [mx - dy * bend, my + dx * bend], b]; }
function bezAt(B, k) { const u = 1 - k; return [u * u * B[0][0] + 2 * u * k * B[1][0] + k * k * B[2][0], u * u * B[0][1] + 2 * u * k * B[1][1] + k * k * B[2][1]]; }
function shotMap(t) {
  ctx.fillStyle = '#0D0F12'; ctx.fillRect(0, 0, W, H);
  const V = mapView(t);
  ctx.save(); ctx.setTransform(V.S, 0, 0, V.S, V.O[0], V.O[1]);
  ctx.strokeStyle = 'rgba(244,241,232,.045)'; ctx.lineWidth = 1 / V.S;
  for (let lon = -100; lon <= -40; lon += 5) { const [x] = proj(lon, 0); ctx.beginPath(); ctx.moveTo(x, -1600); ctx.lineTo(x, 1600); ctx.stroke(); }
  for (let lat = -20; lat <= 50; lat += 5) { const [, y] = proj(0, lat); ctx.beginPath(); ctx.moveTo(-1200, y); ctx.lineTo(1200, y); ctx.stroke(); }
  ctx.lineJoin = 'round';
  ctx.fillStyle = C.ink3; ctx.fill(LANDP);
  ctx.strokeStyle = 'rgba(150,156,166,.55)'; ctx.lineWidth = 1.1 / V.S; ctx.stroke(LANDP);
  STOPS.forEach(s => { if (!s.isl) return; const k = seg(t, s.t, s.t + .3); if (k <= 0) return;
    ctx.fillStyle = mixc('FFFFFF', 'F2CF1D', k); ctx.fill(s.path); ctx.strokeStyle = 'rgba(18,20,23,.9)'; ctx.stroke(s.path); });
  ctx.restore();
  // sea names: map furniture, readable but not news
  ctx.save(); ctx.globalAlpha = .55 * eo(seg(t, T.map + .1, T.map + .7));
  const [ax, ay] = V.tf(...proj(-64, 22)); text('ĐẠI TÂY DƯƠNG', ax, ay, F.v7(20), C.gold, 'center', 6, 'sea1');
  const [cx2, cy2] = V.tf(...proj(-75.6, 12.0)); text('BIỂN CARIBE', cx2, cy2, F.v7(20), C.gold, 'center', 6, 'sea2');
  ctx.restore();
  // route
  const pts = STOPS.map(s => V.tf(...proj(...s.ll)));
  ROUTE.forEach(([a, b], i) => {
    const k = eio(seg(t, a, b)); if (k <= 0) return;
    const B = bez(pts[i], pts[i + 1], i ? .22 : .18);
    ctx.strokeStyle = C.lemon; ctx.lineWidth = 4; ctx.setLineDash([16, 10]); ctx.lineCap = 'round';
    ctx.beginPath(); for (let j = 0; j <= 60; j++) { const q = bezAt(B, k * j / 60); j ? ctx.lineTo(...q) : ctx.moveTo(...q); } ctx.stroke(); ctx.setLineDash([]);
    if (k < 1) { const q = bezAt(B, k); ctx.fillStyle = C.lemon; ctx.beginPath(); ctx.arc(q[0], q[1], 8, 0, Math.PI * 2); ctx.fill(); }
  });
  // stops: ping, dot, card on a leader
  STOPS.forEach((s, i) => {
    const [x, y] = pts[i], a = s.t; if (t < a) return;
    const rb = seg(t, a, a + .6); if (rb < 1) { ctx.strokeStyle = `rgba(242,207,29,${1 - rb})`; ctx.lineWidth = 6 * (1 - rb) + 1; ctx.beginPath(); ctx.arc(x, y, 16 + rb * 200, 0, Math.PI * 2); ctx.stroke(); }
    const pr = ((t - a) * 1.1) % 1; ctx.strokeStyle = `rgba(242,207,29,${.8 * (1 - pr)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 12 + pr * 30, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
    const k = eo(seg(t, a + .1, a + .45)); if (k <= 0) return;
    const PW = 190, chh = 146, cw = PW + 24 + Math.max(tw(s.name, F.b8(38), 2), tw(s.l1, F.mono(18), 1.5), tw(s.l2, F.v7(22))) + 26;
    const bx = clamp(s.side > 0 ? x + 40 : x - 40 - cw, SAFE.l, SAFE.r - cw), by = y + s.dy, ex = s.side > 0 ? bx : bx + cw;
    ctx.strokeStyle = C.lemon; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + 12 * Math.sign(s.dy)); ctx.lineTo(lerp(x, ex, k), lerp(y + 12 * Math.sign(s.dy), s.dy > 0 ? by : by + chh, k)); ctx.stroke();
    ctx.save(); ctx.translate(bx, by + chh / 2); ctx.scale(1, Math.max(.02, back(k, 1.6))); ctx.translate(-bx, -(by + chh / 2));
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(bx + 8, by + 8, cw, chh);
    ctx.fillStyle = 'rgba(27,30,35,.96)'; ctx.fillRect(bx, by, cw, chh); ctx.fillStyle = C.lemon; ctx.fillRect(bx, by, cw, 5);
    const done = k >= 1, im = IM[s.img];
    photoAt(im, s.f[0], s.f[1], cover(im, PW, chh - 5) * lerp(1.12, 1.0, eo(seg(t, a + .1, a + 3))), bx + PW / 2, by + 5 + (chh - 5) / 2, bx, by + 5, PW, chh - 5);
    ctx.fillStyle = 'rgba(14,16,19,.72)'; ctx.fillRect(bx, by + chh - 22, PW, 22);
    text(s.cr, bx + 6, by + chh - 7, F.mono(9), C.paper, 'left', .3, done ? 'scr' + i : null, true);
    const tx = bx + PW + 24;
    text(s.name, tx, by + 52, F.b8(38), C.white, 'left', 2, done ? 'sn' + i : null);
    text(s.l1, tx, by + 86, F.mono(18), C.gold, 'left', 1.5, done ? 'sa' + i : null);
    text(s.l2, tx, by + 124, F.v7(22), C.paper, 'left', 0, done ? 'sb' + i : null);
    ctx.restore();
  });
  shade(1150, 1500, 0, .85);
}

// ============ 4 · event photos (14.0–22.0): the summit, the reception ============
function shotSummit(t) {
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  // the Leaders Investment Summit, Antigua, 2 Nov 2026: the King with the UK Prime Minister (No 10, OGL v3)
  const P = photoAt(IM.king_summit, .3, .25, lerp(1.2, 1.27, eio(seg(t, T.sum, T.rec))), 600, 760);
  shade(760, 1200, 0, .9); vignette(.45); grain(t);
  content(() => { const x = 64;
    ctx.globalAlpha = eo(seg(t, T.sum + .05, T.sum + .25)); text('ANTIGUA · 2 NOV 2026', x + 2, 1020, F.mono(24), C.gold, 'left', 3, 'm0'); ctx.globalAlpha = 1;
    pushUp('Hội nghị Đầu tư', x, 1120, F.v9(80), C.white, eo(seg(t, T.sum + .1, T.sum + .35)), 90, 0, 'm1');
    pushUp('trước CHOGM', x, 1210, F.v9(80), C.lemon, eo(seg(t, T.sum + .2, T.sum + .45)), 90, 0, 'm2'); });
  { const [hx, hy] = P.at(.3, .25); nameTag(t, T.sum + .9, hx + 40, hy, 290); }
}
function shotReception(t) {
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  // the reception for new Commonwealth leaders, Antigua, 3 Nov 2026 (No 10, OGL v3)
  const P = photoAt(IM.king_leaders_b, .76, .3, lerp(1.12, 1.18, eio(seg(t, T.rec, T.grid))), 600, 600);
  shade(720, 1200, 0, .9); vignette(.45); grain(t);
  content(() => { const x = 64, fs = fit('Vua tiếp các nhà lãnh đạo mới', F.v9, 66, 950);
    ctx.globalAlpha = eo(seg(t, T.rec + .05, T.rec + .25)); text('ANTIGUA · 3 NOV 2026', x + 2, 1030, F.mono(24), C.gold, 'left', 3, 'h0'); ctx.globalAlpha = 1;
    pushUp('Vua tiếp các nhà lãnh đạo mới', x, 1120, F.v9(fs), C.white, eo(seg(t, T.rec + .1, T.rec + .35)), fs + 10, 0, 'h1');
    pushUp('của Khối Thịnh vượng chung', x, 1200, F.v9(fs), C.lemon, eo(seg(t, T.rec + .2, T.rec + .45)), fs + 10, 0, 'h2'); });
  { const [hx, hy] = P.at(.76, .3); nameTag(t, T.rec + .9, hx - 60, hy, 250); }
}

// ============ 5 · the leaders who came (22.0–28.0): four photos, 2 × 2 (No 10, OGL v3) ============
const TILES = [
  { img: 'mottley', f: [.5, .32], a: T.grid + .2, n: ['Thủ tướng Barbados', 'Mia Mottley'], d: '2 NOV 2026 · WITH UK PM ANDY BURNHAM' },
  { img: 'albanese', f: [.5, .35], a: T.grid + .5, n: ['Thủ tướng Australia', 'Anthony Albanese'], d: '2 NOV 2026 · WITH UK PM ANDY BURNHAM' },
  { img: 'holness', f: [.47, .42], a: T.grid + .8, n: ['Thủ tướng Jamaica', 'Andrew Holness'], d: '3 NOV 2026 · WITH UK PM ANDY BURNHAM' },
  { img: 'steelpan', f: [.45, .42], a: T.grid + 1.1, n: ['Dàn trống thép', 'Hell’s Gate, Antigua'], d: '4 NOV 2026 · DURING CHOGM' },
];
function shotGrid(t) {
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H); dots(t, .035, 8);
  content(() => gridTiles(t)); grain(t, .04);
}
function gridTiles(t) {
  const x0 = 56, gw = 478, gh = 420, gap = 12, top = 356;
  ctx.globalAlpha = eo(seg(t, T.grid + .05, T.grid + .25)); text('CHOGM · ANTIGUA · 2–4 NOV 2026', x0 + 2, 326, F.mono(24), C.gold, 'left', 3, 'g0'); ctx.globalAlpha = 1;
  TILES.forEach((Tl, i) => {
    const k = seg(t, Tl.a, Tl.a + .3); if (k <= 0) return;
    const bx = x0 + (i % 2) * (gw + gap), by = top + Math.floor(i / 2) * (gh + gap), im = IM[Tl.img];
    ctx.save(); ctx.translate(0, by + gh / 2); ctx.scale(1, Math.max(.02, back(k, 1.8))); ctx.translate(0, -(by + gh / 2));
    ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(bx + 8, by + 8, gw, gh);
    photoAt(im, Tl.f[0], Tl.f[1], cover(im, gw, gh) * lerp(1.12, 1.0, eo(seg(t, Tl.a, Tl.a + 5))), bx + gw / 2, by + gh / 2, bx, by, gw, gh);
    ctx.fillStyle = C.lemon; ctx.fillRect(bx, by, gw, 5);
    const g = ctx.createLinearGradient(0, by + gh - 150, 0, by + gh); g.addColorStop(0, 'rgba(14,16,19,0)'); g.addColorStop(.4, 'rgba(14,16,19,.85)'); g.addColorStop(1, 'rgba(14,16,19,.96)');
    ctx.fillStyle = g; ctx.fillRect(bx, by + gh - 150, gw, 150);
    const done = k >= 1;
    text(Tl.n[0], bx + 20, by + gh - 82, F.v7(26), C.paper, 'left', 0, done ? 'gn' + i : null);
    text(Tl.n[1], bx + 20, by + gh - 48, F.v9(30), C.white, 'left', 0, done ? 'gm' + i : null);
    text(Tl.d, bx + 20, by + gh - 18, F.mono(12), C.gold, 'left', 1, done ? 'gd' + i : null, true);
    ctx.restore();
  });
}

// ============ 6 · spec card (28.0–35.5): the room he spoke to ============
const SP = { eb: 28.1, title: 28.25, lab: 28.6, bar1: 28.8, bar2: 29.4, badge: 30.0, ph: 30.3, big: 30.6, bigl: 30.8 };
function shotSpec(t) {
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H); dots(t, .035, 8);
  content(() => specBody(t));
}
function specBody(t) {
  ctx.save(); ctx.translate(0, lerp(8, -8, seg(t, T.spec, T.quote)));
  const x = 64;
  ctx.globalAlpha = eo(seg(t, SP.eb, SP.eb + .2)); text('ROYAL.UK · ST JOHN’S · 3 NOV 2026', x + 4, 352, F.mono(22), C.gold, 'left', 3, 'p0'); ctx.globalAlpha = 1;
  pushUp('CHOGM 28', x - 4, 520, F.b8(176), C.white, eo(seg(t, SP.title, SP.title + .35)), 176, 2, 'p1');
  // the whole and the part on one scale (schematic: his words, "a third of humanity")
  const BW = 760, y1 = 600, y2 = 712;
  const bar = (y, label, v, a, col, id, val) => {
    const la = eo(seg(t, a - .2, a + .05)); if (la <= 0) return;
    ctx.globalAlpha = la; text(label, x, y - 14, F.v7(28), C.white, 'left', 0, id); ctx.globalAlpha = 1;
    ctx.fillStyle = '#22262C'; ctx.fillRect(x, y, BW, 50);
    const k = eio(seg(t, a, a + .55)), w = Math.max(4, BW * v * k);
    const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, col === C.lemon ? C.lemonD : '#B9B4A6'); g.addColorStop(1, col);
    ctx.fillStyle = g; ctx.fillRect(x, y, w, 50);
    if (k >= 1) text(val, x + (v < 1 ? w + 16 : BW + 16), y + 42, F.b8(48), col, 'left', 0, id + 'v');
  };
  bar(y1 + 30, 'Toàn nhân loại', 1, SP.bar1, C.paper, 'pb1', '100%');
  bar(y2 + 30, 'Khối Thịnh vượng chung', 1 / 3, SP.bar2, C.lemon, 'pb2', '1/3');
  const tk = seg(t, SP.bar2 + .2, SP.bar2 + .5);
  if (tk > 0) { ctx.globalAlpha = tk; ctx.fillStyle = C.ink; [1, 2].forEach(j => ctx.fillRect(x + BW * j / 3 - 2, y1 + 30, 4, 50)); ctx.globalAlpha = 1; }
  const pk = seg(t, SP.badge, SP.badge + .2);
  if (pk > 0) {
    const s = back(pk, 2.4), q = '“a third of humanity”', lw = tw(q, F.b6i(34), 1) + 44;
    ctx.save(); ctx.translate(x + 360 + lw / 2, y2 + 55); ctx.scale(s, s);
    ctx.fillStyle = C.gold; ctx.fillRect(-lw / 2, -26, lw, 52);
    text(q, -lw / 2 + 22, 12, F.b6i(34), C.ink, 'left', 1, pk >= 1 ? 'pq' : null); ctx.restore();
  }
  // more than a billion young people, given a face: Sir Viv Richards with young cricketers, Antigua, 2 Nov 2026 (No 10, OGL v3)
  const yk = eo(seg(t, SP.ph, SP.ph + .3));
  if (yk > 0) {
    const px = 40, pw = 1000, py = 830, ph = 400, im = IM.cricket;
    ctx.save(); ctx.globalAlpha = yk; ctx.beginPath(); ctx.rect(px, py + (1 - yk) * ph, pw, ph * yk); ctx.clip();
    photoAt(im, .5, .4, cover(im, pw, ph) * lerp(1.1, 1.0, seg(t, SP.ph, T.quote)), px + pw / 2, py + ph / 2, px, py, pw, ph);
    const g = ctx.createLinearGradient(0, py + ph - 210, 0, py + ph); g.addColorStop(0, 'rgba(14,16,19,0)'); g.addColorStop(.5, 'rgba(14,16,19,.85)'); g.addColorStop(1, 'rgba(14,16,19,.95)');
    ctx.fillStyle = g; ctx.fillRect(px, py + ph - 210, pw, 210);
    ctx.fillStyle = 'rgba(14,16,19,.78)'; ctx.fillRect(px, py + 5, pw, 34);
    text('Viv Richards và các cầu thủ trẻ · Antigua, 2.11', px + 14, py + 29, F.v7(19), C.paper, 'left', 0, yk >= 1 ? 'py' : null, true);
    text('NO 10 · OGL 3', px + pw - 12, py + 28, F.mono(12), C.grey2, 'right', .5, null, true);
    ctx.fillStyle = C.lemon; ctx.fillRect(px, py, pw, 5);
    ctx.restore();
    pushUp('HƠN 1 TỶ', x, 1148, F.v9(112), C.lemon, eo(seg(t, SP.big, SP.big + .3)), 124, 0, 'pr1');
    const lk = eo(seg(t, SP.bigl, SP.bigl + .3));
    if (lk > 0) { ctx.globalAlpha = lk; text('người trẻ trong Khối Thịnh vượng chung', x, 1204, F.v7(34), C.white, 'left', 0, lk >= 1 ? 'pr2' : null); ctx.globalAlpha = 1; }
  }
  ctx.restore();
}

// ============ 7 · quote card (35.5–46.0): one beat of silence, then his words ============
const Q = { mark: 36.0, q1: 36.5, q2: 39.0, ul: 40.9, vn: 41.2, who: 42.0 };
const Q1 = 'The transatlantic trade in enslaved persons still casts a shadow over these islands and other Members of our Commonwealth.';
const Q2 = '…that shameful chapter of history is one that fills my heart with horror and my soul with the most profound personal sorrow.';
const QVN = 'Vua nói chương sử buôn bán nô lệ khiến ông kinh hoàng và vô cùng đau buồn';
function shotQuote(t) {
  studioBg(t, lerp(.03, .12, seg(t, Q.mark, Q.mark + 1.5)));
  // the King's photo from the cold open returns, dimmed behind his words
  ctx.save(); ctx.globalAlpha = .2 * eo(seg(t, Q.mark + .1, Q.mark + 1.5));
  photoAt(IM.king_leaders_b, .76, .3, lerp(1.3, 1.36, seg(t, T.quote, T.close)), 560, 640); ctx.restore(); grain(t, .05);
  content(() => quoteBody(t));
  if (t >= Q.mark + .1) { ctx.save(); ctx.globalAlpha = .7; text('BACKGROUND PHOTO 3 NOV 2026: NO 10 · OGL 3', SAFE.r, STY - 8, F.mono(13), C.paper, 'right', .5, 'qpc', true); ctx.restore(); }
}
function quoteBody(t) {
  const z = lerp(1, 1.03, eio(seg(t, T.quote, T.close)));
  ctx.save(); ctx.translate(540, 760); ctx.scale(z, z); ctx.translate(-540, -760);
  const x = 64, FS = 58, LH = 66, mw = 950;
  const qk = seg(t, Q.mark, Q.mark + .25);
  if (qk > 0) { const s = back(qk, 2.4); ctx.save(); ctx.translate(x, 300); ctx.scale(s, s); text('“', -14, 150, F.b8(240), C.lemon, 'left'); ctx.restore(); }
  const L1 = wrap(Q1, F.b6(FS), mw, .5), L2 = wrap(Q2, F.b6(FS), mw, .5);
  let y = 470;
  L1.forEach((L, i) => { pushUp(L, x, y, F.b6(FS), C.grey, eo(seg(t, Q.q1 + i * .18, Q.q1 + i * .18 + .32)), LH, .5, 'qa' + i); y += LH; });
  y += 30;
  L2.forEach((L, i) => {
    pushUp(L, x, y, F.b6(FS), C.white, eo(seg(t, Q.q2 + i * .18, Q.q2 + i * .18 + .32)), LH, .5, 'qb' + i);
    const j = L.indexOf('sorrow');
    if (j >= 0) underline(x + tw(L.slice(0, j), F.b6(FS), .5), y + 14, tw('sorrow', F.b6(FS), .5), eio(seg(t, Q.ul, Q.ul + .4)));
    y += LH;
  });
  y += 50;
  const vk = eo(seg(t, Q.vn, Q.vn + .3));
  ctx.globalAlpha = vk;
  wrap(QVN, F.v7(38), mw).forEach((L, i) => text(L, x, y + i * 50, F.v7(38), C.lemon, 'left', 0, vk >= 1 ? 'qv' + i : null));
  y += 100;
  ctx.globalAlpha = eo(seg(t, Q.who, Q.who + .3));
  ctx.fillStyle = C.gold; ctx.fillRect(x, y - 10, 60, 4);
  text('VUA CHARLES III', x, y + 42, F.v9(36), C.paper, 'left', 2, t > Q.who + .3 ? 'qw' : null);
  text('CHOGM OPENING CEREMONY · 3 NOV 2026', x, y + 80, F.mono(20), C.grey2, 'left', 2, t > Q.who + .3 ? 'qs' : null);
  ctx.globalAlpha = 1;
  ctx.restore();
}

// ============ 8 · closing quote and the one stamp (46.0–52.5) ============
const CL = { eb: 46.1, l: [46.25, 46.4, 46.55, 47.4, 47.55], vn: 48.0, stamp: 49.6 };
const CLL = [['We cannot change', C.white], ['the actions of those', C.white], ['who came before us.', C.white], ['We can, however,', C.lemon], ['learn from the past.', C.lemon]];
function shotClose(t) {
  studioBg(t, .14);
  // the King with Commonwealth leaders, 3 Nov 2026 (No 10, OGL v3), dimmed behind the closing line
  ctx.save(); ctx.globalAlpha = .2 * eo(seg(t, T.close, T.close + 1));
  photoAt(IM.king_leaders_a, .3, .32, lerp(.8, .85, seg(t, T.close, T.end)), 420, 700); ctx.restore(); grain(t, .04);
  if (t >= T.close + .5) { ctx.save(); ctx.globalAlpha = .7; text('BACKGROUND PHOTO 3 NOV 2026: NO 10 · OGL 3', SAFE.r, STY - 8, F.mono(13), C.paper, 'right', .5, 'kpc', true); ctx.restore(); }
  content(() => closeBody(t));
}
function closeBody(t) {
  const z = lerp(1, 1.04, eio(seg(t, T.close, T.end - .5)));
  ctx.save(); ctx.translate(540, 700); ctx.scale(z, z); ctx.translate(-540, -700);
  const x = 64, fs = fit('the actions of those', F.b8, 108, 940, 1);
  ctx.globalAlpha = eo(seg(t, CL.eb, CL.eb + .2)); text('ROYAL.UK · 3 NOV 2026', x, 360, F.mono(24), C.gold, 'left', 4, 'k0'); ctx.globalAlpha = 1;
  CLL.forEach(([L, col], i) => pushUp(L, x, 480 + i * (fs + 4) + (i > 2 ? 30 : 0), F.b8(fs), col, eo(seg(t, CL.l[i], CL.l[i] + .32)), fs + 4, 1, 'k' + (i + 1)));
  const vk = eo(seg(t, CL.vn, CL.vn + .3)), vy = 480 + 4 * (fs + 4) + 30 + 72;
  ctx.globalAlpha = vk;
  ['Quá khứ không đổi được,', 'nhưng ta có thể học từ đó'].forEach((L, i) => text(L, x, vy + i * 52, F.v7(40), C.paper, 'left', 0, vk >= 1 ? 'kv' + i : null));
  ctx.globalAlpha = 1;
  const sk = seg(t, CL.stamp, CL.stamp + .16), SXY = [760, 1140];
  if (sk > 0) {
    const s = 1 + .9 * (1 - eo(sk)); ctx.save(); ctx.translate(...SXY); ctx.rotate(-.12); ctx.scale(s * .82, s * .82); ctx.globalAlpha = clamp(sk * 3);
    ctx.fillStyle = 'rgba(18,20,23,.95)'; ctx.fillRect(-250, -62, 500, 124);
    ctx.strokeStyle = C.lemon; ctx.lineWidth = 4; ctx.strokeRect(-240, -52, 480, 104); ctx.lineWidth = 1.5; ctx.strokeRect(-231, -43, 462, 86);
    text('CHOGM 28', 0, 2, F.b8(54), C.lemon, 'center', 4, sk >= 1 ? 'ks1' : null);
    text('ST JOHN’S · ANTIGUA', 0, 36, F.mono(20), C.paper, 'center', 3, sk >= 1 ? 'ks2' : null);
    ctx.restore();
    const rr = seg(t, CL.stamp + .05, CL.stamp + .5); if (rr < 1) { ctx.strokeStyle = `rgba(242,207,29,${.8 * (1 - rr)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(...SXY, 180 + rr * 130, 66 + rr * 50, -.12, 0, Math.PI * 2); ctx.stroke(); }
  }
  ctx.restore();
}

// ============ 9 · end card (52.5–56.5) ============
const E0 = T.end - .15;
function shotEnd(t) {
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#1A1D22'); g.addColorStop(1, '#0E1013');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); dots(t, .04, 10);
  content(() => endBody(t), 56, 400, SAFE.l, CT, Math.min((SAFE.r - SAFE.l) / DW, (SAFE.b - CT) / 1040));
}
function endBody(t) {
  ctx.fillStyle = C.lemon; ctx.beginPath(); ctx.moveTo(880, 0); ctx.lineTo(910, 0); ctx.lineTo(720, 760); ctx.lineTo(690, 760); ctx.fill();
  ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(920, 0); ctx.lineTo(926, 0); ctx.lineTo(736, 760); ctx.lineTo(730, 760); ctx.fill();
  const m = (a, b) => eo(seg(t, E0 + a, E0 + b)), x = 64;
  const la = m(.35, .65); ctx.globalAlpha = la;
  plate(400, 480, .7, seg(t, E0 + 1.0, E0 + 1.45) || -1, seg(t, E0 + .35, E0 + .85));
  wordmark(64, 660, 50, 'left', 'e8');
  ctx.globalAlpha = 1;
  ctx.globalAlpha = m(.1, .3); text('ST JOHN’S, ANTIGUA · 3 NOV 2026', x, 790, F.mono(24), C.gold, 'left', 3, 'e0'); ctx.globalAlpha = 1;
  pushUp('Vua Charles III tại CHOGM', x - 4, 900, F.v9(fit('Vua Charles III tại CHOGM', F.v9, 88, 950)), C.white, m(.15, .45), 104, 0, 'e1');
  pushUp('The King in Antigua', x, 990, F.b6i(72), C.lemon, m(.3, .58), 80, 2, 'e2');
  ctx.fillStyle = C.lemon; ctx.fillRect(x, 1030, 900 * eio(seg(t, E0 + .45, E0 + .75)), 2);
  ctx.globalAlpha = m(.6, .85); text('THẾ GIỚI 24 · BẢN TIN QUỐC TẾ', x, 1090, F.v7(30), C.white, 'left', 1, 'e3'); ctx.globalAlpha = 1;
  ctx.globalAlpha = m(.8, 1.1);
  ctx.fillStyle = C.line; ctx.fillRect(x, 1150, 950, 1);
  let y = 1190;
  ['Nguồn: royal.uk — chuyến công du mùa thu (26.10.2026), phát biểu khai mạc CHOGM (03.11.2026)',
   'Ảnh: Simon Dawson / No 10 Downing Street (OGL v3) · P. Hughes, Dr. Thomas Liptak (CC BY 4.0) · Stacey Dos Santos (phạm vi công cộng)',
   'Contains public sector information licensed under the Open Government Licence v3.0',
   'Bản đồ: Natural Earth (phạm vi công cộng) · Nhạc mẫu: VSCO 2 CE, VCSL (CC0) · Phông chữ: Be Vietnam Pro, Barlow Condensed, IBM Plex Mono (OFL)']
    .forEach((s, i) => { wrap(s, F.v7(20), 950).forEach((L, j) => { text(L, x, y, F.v7(20), C.grey, 'left', 0, `ef${i}_${j}`, true); y += 29; }); y += 8; });
  ctx.globalAlpha = 1;
}

// ============ compositing ============
function wipeBand(bx) { ctx.fillStyle = C.lemon; ctx.fillRect(bx - 84, 0, 84, H); ctx.fillStyle = C.ink; ctx.fillRect(bx, 0, 5, H); ctx.fillStyle = C.gold; ctx.fillRect(bx + 5, 0, 14, H); }
// one picture = a shot + its own package layer, drawn in its state at time tov
function layer(fn, t, tov) { fn(t); cornerTag(tov); credit(tov); strap(tov); }
// vertical band wipe: right of the band the old picture, left the new one (each with its own package)
function wipe(t, a, b, oldFn, newFn) {
  const bx = lerp(-140, W + 140, eio(seg(t, a, b)));
  const n0 = TX.length; layer(newFn, t, b + .001); const NEW = TX.splice(n0);
  ctx.save(); ctx.beginPath(); ctx.rect(bx, 0, W, H); ctx.clip(); layer(oldFn, t, a - .001); ctx.restore();
  const OLD = TX.splice(n0); TX.push(...(seg(t, a, b) < .5 ? OLD : NEW));
  wipeBand(bx);
}
// transitions: band wipe (sting → map, quote → closing), hard cut + timpani inside the story, slanted wipe into the end card
const SCENES = [[0, shotCold], [T.sting, shotSting], [T.map, shotMap], [T.sum, shotSummit], [T.rec, shotReception], [T.grid, shotGrid],
  [T.spec, shotSpec], [T.quote, shotQuote], [T.close, shotClose], [T.end, shotEnd]];
const WIPES = [[T.close - .3, T.close]];
function scene(t) {
  if (t >= T.sting && t < T.map) {
    if (t >= T.map - .3) wipe(t, T.map - .3, T.map, shotSting, shotMap); else layer(shotSting, t, t);
    stingLogo(t); return;
  }
  const w = WIPES.find(([a, b]) => t >= a && t < b);
  if (w) { const i = SCENES.findIndex(s => Math.abs(s[0] - w[1]) < .01); wipe(t, w[0], w[1], SCENES[i - 1][1], SCENES[i][1]); return; }
  if (t >= T.end - .25 && t < T.end) {   // slanted wipe; the end card is already moving underneath
    layer(shotClose, t, t);
    const k = eio(seg(t, T.end - .25, T.end)), y = H - k * (H + 400);
    ctx.save(); ctx.beginPath(); ctx.moveTo(0, y + 400); ctx.lineTo(W, y); ctx.lineTo(W, H + 400); ctx.lineTo(0, H + 400); ctx.closePath(); ctx.clip(); shotEnd(t); ctx.restore();
    ctx.fillStyle = C.lemon; ctx.beginPath(); ctx.moveTo(0, y + 400); ctx.lineTo(W, y); ctx.lineTo(W, y + 40); ctx.lineTo(0, y + 440); ctx.fill();
    return;
  }
  let fn = SCENES[0][1]; for (const [a, f] of SCENES) if (t >= a) fn = f;
  layer(fn, t, t);
}
function render(t) {
  TX = [];
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  scene(t);
  bug(t);
  if (t > DUR - .6) { ctx.fillStyle = `rgba(0,0,0,${seg(t, DUR - .6, DUR)})`; ctx.fillRect(0, 0, W, H); }
}

// —— events for mix.py (exported by events.mjs) ——
const EV = [
  { t: .12, type: 'quote_soft' }, { t: 1.6, type: 'mark' },
  { t: T.sting + .04, type: 'swish' }, { t: T.sting + .4, type: 'stab' }, { t: T.sting + .9, type: 'glint' }, { t: T.map - .3, type: 'whoosh' },
  { t: T.map, type: 'hit' }, { t: T.map + .1, type: 'air', dur: 8.0 },
  ...STOPS.map(s => ({ t: s.t, type: 'ping' })), ...STOPS.map(s => ({ t: s.t + .12, type: 'card' })),
  ...ROUTE.map(([a, b]) => ({ t: a, type: 'draw', dur: b - a })),
  { t: T.sum, type: 'hit' }, { t: T.sum + .1, type: 'push' }, { t: T.sum + .9, type: 'pop' },
  { t: T.rec, type: 'hit' }, { t: T.rec + .1, type: 'slide' }, { t: T.rec + .9, type: 'pop' },
  { t: T.grid, type: 'hit' }, ...TILES.map(Tl => ({ t: Tl.a, type: 'card' })),
  { t: T.spec, type: 'hit' }, { t: SP.title, type: 'push' }, { t: SP.bar1, type: 'bar' }, { t: SP.bar2, type: 'bar' }, { t: SP.badge, type: 'pop' },
  { t: SP.ph, type: 'slide' }, { t: SP.big, type: 'push' },
  { t: Q.mark, type: 'boom' }, { t: Q.mark, type: 'air', dur: 10.0 }, { t: Q.q1, type: 'line' }, { t: Q.q1 + .36, type: 'line' }, { t: Q.q2, type: 'line' }, { t: Q.q2 + .36, type: 'line' },
  { t: Q.ul, type: 'mark' }, { t: Q.vn, type: 'slide' },
  { t: T.close - .3, type: 'whoosh' }, { t: CL.l[0], type: 'line' }, { t: CL.l[2], type: 'line' }, { t: CL.l[3], type: 'line' }, { t: CL.stamp, type: 'stamp_big' },
  { t: T.end - .25, type: 'whoosh' }, { t: E0 + 1.0, type: 'glint' },
];
window.DUR = DUR; window.EV = EV; window.render = render; window.TEXTS = t => { render(t); return TX; };
(async () => {
  makeGrain();
  const names = ['king_summit', 'king_leaders_b', 'king_leaders_a', 'nassau_assembly', 'umana', 'dockyard', 'mottley', 'albanese', 'holness', 'steelpan', 'cricket'];
  const imgs = await Promise.all(names.map(n => loadImg(`assets/ph_${n}.jpg`))); names.forEach((n, i) => IM[n] = imgs[i]);
  LAND = await fetch('assets/land.json').then(r => r.json());
  buildMap();
  await Promise.all([F.v9(40), F.v7(40), F.b8(40), F.b6(40), F.b6i(40), F.mono(40)].map(f => document.fonts.load(f, 'Thế giới Aa')));
  render(0); window.READY = true;
})();
