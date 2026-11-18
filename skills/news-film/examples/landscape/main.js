// THẾ GIỚI 24 · Vua Charles III tại CHOGM Antigua — Broadcast News Package, one lead story, no narration.
// Canvas 2D, deterministic render(t). 120 BPM grid, beat 0 = 4.5 s (after the cold open and the sting). Shot list in TREATMENT.md.
// Every fact on screen is in FACTS.md (royal.uk). No burned-in subtitles, no crawl.
const W = 1920, H = 1080, DUR = 63.0;
// Event photos (16.5–30.5: summit, reception, leaders' grid) were inserted into a 49 s cut: after them, every shot runs on story time u = t − 14 (see render()).
const INS = [16.5, 30.5], SHIFT = 14, PHB = 20.0, GRB = 24.5;
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
// largest size ≤ s at which the string fits in maxW
function fit(str, fontFn, s, maxW, ls = 0) { while (s > 12 && tw(str, fontFn(s), ls) > maxW) s -= 1; return s; }
// a line pushed up from below through a mask
function pushUp(str, x, y, font, color, k, h, ls = 0, id = null, align = 'left') {
  if (k <= 0) return 0;
  ctx.save(); ctx.beginPath(); ctx.rect(0, y - h, W, h + 14); ctx.clip();
  const w = text(str, x, y + (1 - k) * (h + 14), font, color, align, ls, k >= 1 ? id : null); ctx.restore(); return w;
}

// —— the brand plate: lemon parallelogram, ink and gold bars, "TG24" ——
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
// One strap from the map (4.5) to the end-card wipe (45.0). Changes inside a shot flip vertically (0.32 s);
// changes on a cut or wipe switch with the picture (each side of a wipe draws its own strap).
const STRAP = [
  { a: 4.5, tab: 'HOÀNG GIA ANH', hl: 'Chuyến công du mùa thu của Vua Charles III', cut: true },
  { a: 12.0, tab: 'HOÀNG GIA ANH', hl: 'Vua và Hoàng hậu dự khai mạc CHOGM tại Antigua' },
  { a: 16.5, tab: 'KHỐI THỊNH VƯỢNG CHUNG', hl: 'Hội nghị Thượng đỉnh Khối Thịnh vượng chung lần thứ 28', cut: true },
  { a: 25.0, tab: 'NHÂN VẬT', hl: 'Vua Charles III · Người đứng đầu Khối Thịnh vượng chung', cut: true },
  { a: 38.5, tab: 'HOÀNG GIA ANH', hl: 'Phát biểu khai mạc CHOGM · St John’s, 03.11.2026', cut: true },
];
const STRAP_OUT = 45.0;
const SX = 96, STY = 856, SBY = 904, SBH = 104, SBW = 1250;
function strapWords(S, dy, id) {
  const s = fit(S.hl, F.v9, 46, SBW - 70);
  text(S.hl, SX + 44, SBY + 68 + dy, F.v9(s), C.ink, 'left', 0, id);
}
function strap(t, ov = null) {
  if (!ov && (t < STRAP[0].a || t >= STRAP_OUT)) return;
  let i = 0; for (let j = 0; j < STRAP.length; j++) if (t >= STRAP[j].a) i = j;
  const S = ov || STRAP[i], P = ov ? null : i > 0 ? STRAP[i - 1] : null;
  const fk = S.cut || !P ? 1 : eio(seg(t, S.a, S.a + .32));
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(SX + 8, SBY + 8, SBW, SBH);
  ctx.fillStyle = C.paper; ctx.fillRect(SX, SBY, SBW, SBH);
  ctx.fillStyle = C.lemon; ctx.fillRect(SX, SBY, 14, SBH);
  ctx.fillStyle = C.ink; ctx.fillRect(SX + SBW, SBY, 120, SBH); ctx.fillStyle = C.lemon; ctx.fillRect(SX + SBW, SBY, 120, 6);
  text('TG24', SX + SBW + 60, SBY + 70, F.b8(42), C.lemon, 'center', 1);
  ctx.save(); ctx.beginPath(); ctx.rect(SX + 14, SBY, SBW - 14, SBH); ctx.clip();
  if (fk < 1) { strapWords(P, -SBH * fk, null); strapWords(S, SBH * (1 - fk), null); }
  else strapWords(S, 0, 'strap');
  ctx.restore();
  const tabTxt = fk < .5 && P ? P.tab : S.tab;
  const tabW = 40 + tw(tabTxt, F.v9(26), 1);
  ctx.fillStyle = C.lemon; ctx.fillRect(SX, STY, tabW, SBY - STY);
  if (P && !S.cut && P.tab !== S.tab) { const fl = 1 - seg(t, S.a, S.a + .25); if (fl > 0 && fl < 1) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(SX, STY, tabW, SBY - STY); } }
  text(tabTxt, SX + 20, STY + 35, F.v9(26), C.ink, 'left', 1, 'tab');
  ctx.restore();
}

// corner tag: the proportion bar on the spec card is a schematic, not data
const TAGS = [[16.5, 25.0, 'SCHEMATIC', 'Sơ đồ minh hoạ tỉ lệ']];
function cornerTag(t) {
  const A = TAGS.find(r => t >= r[0] && t < r[1]); if (!A) return;
  const k = Math.min(eo(seg(t, A[0] + .3, A[0] + .5)), 1 - seg(t, A[1] - .2, A[1]));
  if (k <= 0) return;
  ctx.save(); const x = 96, y = 56, h = 64, w = 330;
  ctx.translate(0, y + h / 2); ctx.scale(1, Math.max(.02, k)); ctx.translate(0, -(y + h / 2));
  ctx.fillStyle = 'rgba(18,20,23,.82)'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = C.gold; ctx.fillRect(x, y, 8, h);
  text(A[2], x + 26, y + 28, F.mono(18), C.gold, 'left', 2, k >= 1 ? 'tag' : null);
  text(A[3], x + 26, y + 54, F.v7(19), C.white, 'left', 0, k >= 1 ? 'tagv' : null);
  ctx.restore();
}

// source line, bottom right, beside the strap's end block
const SOURCES = [
  [4.5, 16.5, 'SOURCE: ROYAL.UK · NATURAL EARTH', 'Nguồn: royal.uk · bản đồ Natural Earth'],
  [16.5, 45.0, 'SOURCE: ROYAL.UK · SPEECH 3 NOV 2026', 'Nguồn: royal.uk · toàn văn bài phát biểu'],
];
function credit(t) {
  const R = SOURCES.find(r => t >= r[0] && t < r[1]); if (!R) return;
  ctx.save(); ctx.globalAlpha = .75;
  text(R[2], 1836, 950, F.mono(13), C.paper, 'right', .5, 'src', true);
  text(R[3], 1836, 978, F.v7(16), C.paper, 'right', 0, 'srcv', true);
  ctx.restore();
}

function bug(t) {
  if (t < 4.45 || t > 45.0) return;
  ctx.save(); ctx.globalAlpha = .95; plate(1739, 86, .327, -1, 1);
  text('THẾ GIỚI 24', 1652, 96, F.v9(22), C.white, 'right', 2); ctx.restore();
}

// ============ backgrounds ============
function studioBg(t, warm = .16) {
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  const rg = ctx.createRadialGradient(1300, 380, 60, 1300, 380, 1100); rg.addColorStop(0, `rgba(242,207,29,${warm})`); rg.addColorStop(1, 'rgba(242,207,29,0)');
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 7; i++) {
    const x = ((i * 380 + t * (30 + i * 6)) % 2600) - 400, w = 40 + hash(i) * 120;
    ctx.fillStyle = `rgba(242,207,29,${(.025 + hash(i + 9) * .035) * warm / .16})`;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + w, 0); ctx.lineTo(x + w - 500, H); ctx.lineTo(x - 500, H); ctx.fill();
  }
  ctx.fillStyle = 'rgba(244,241,232,.05)';
  for (let x = 40 - (t * 12) % 48; x < W; x += 48) for (let y = 24; y < H; y += 48) ctx.fillRect(x, y, 2, 2);
}
function vignette(a = .5) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .95);
  g.addColorStop(0, 'rgba(8,9,11,0)'); g.addColorStop(1, `rgba(8,9,11,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function underline(x, y, w, k) { if (k > 0) { ctx.fillStyle = C.lemon; ctx.fillRect(x, y, w * k, 9); } }
// photos (graded to the package duotone by tools/prep_photos.py)
const IM = {};
function loadImg(src) { return new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(src); i.src = src; }); }
// place image point (fx, fy) at screen (sx, sy) at scale s, clamped so the image always covers the rectangle; returns the transform
function photoAt(img, fx, fy, s, sx, sy, rx = 0, ry = 0, rw = W, rh = H) {
  s = Math.max(s, rw / img.width, rh / img.height);
  let ox = sx - fx * s, oy = sy - fy * s;
  ox = Math.min(rx, Math.max(rx + rw - img.width * s, ox)); oy = Math.min(ry, Math.max(ry + rh - img.height * s, oy));
  ctx.save(); ctx.beginPath(); ctx.rect(rx, ry, rw, rh); ctx.clip(); ctx.drawImage(img, ox, oy, img.width * s, img.height * s); ctx.restore();
  return { s, ox, oy, at: (x, y) => [ox + x * s, oy + y * s] };
}
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
function photoCredit(s1, s2) {
  ctx.save(); ctx.globalAlpha = .8;
  text(s1, 1836, 950, F.mono(13), C.paper, 'right', .5, 'pcr', true);
  if (s2) text(s2, 1836, 978, F.v7(16), C.paper, 'right', 0, 'pcrv', true);
  ctx.restore();
}

// ============ 1 · cold open (0–3.0): his words first ============
function shotCold(t) {
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  // The King at the reception for new Commonwealth leaders, Antigua, 3 Nov 2026 (No 10 Downing Street, OGL v3): slow push on his face
  photoAt(IM.king_leaders_b, 1794, 640, lerp(1.45, 1.53, seg(t, 0, 3.0)), 500, 400);
  const g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(14,16,19,.15)'); g.addColorStop(.36, 'rgba(14,16,19,.35)'); g.addColorStop(.5, 'rgba(14,16,19,.86)'); g.addColorStop(1, 'rgba(14,16,19,.93)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); vignette(.5); grain(t);
  const x = 830;
  ctx.globalAlpha = eo(seg(t, .05, .25)); text('ANTIGUA · 03.11.2026', x, 330, F.mono(26), C.gold, 'left', 4, 'c0'); ctx.globalAlpha = 1;
  const qk = seg(t, .08, .3);
  if (qk > 0) { const s = back(qk, 2.4); ctx.save(); ctx.translate(x - 90, 400); ctx.scale(s, s); text('“', -40, 130, F.b8(260), C.lemon, 'left'); ctx.restore(); }
  pushUp('…the most profound', x, 520, F.b8(134), C.white, eo(seg(t, .08, .28)), 134, 1, 'c1');
  pushUp('personal sorrow.”', x, 664, F.b8(134), C.white, eo(seg(t, .16, .36)), 134, 1, 'c2');
  const sw = tw('personal ', F.b8(134), 1), ow = tw('sorrow', F.b8(134), 1);
  underline(x + sw, 686, ow, eio(seg(t, 1.6, 1.95)));
  photoCredit('PHOTO 3 NOV 2026: NO 10 · OGL 3', 'Ảnh: Vua Charles III tại Antigua');
  const dk = seg(t, 2.6, 3.0); if (dk > 0) { ctx.fillStyle = `rgba(10,11,13,${dk * .5})`; ctx.fillRect(0, 0, W, H); }
}

// ============ 2 · sting (3.0–4.5): the plate becomes the bug ============
const ST0 = 3.0;
function shotSting(t) {
  const s = t - ST0; studioBg(t);
  [[.04, .3, 22, -60], [.1, .36, 8, 40]].forEach(([a, b, h, dy]) => {
    const k = seg(s, a, b); if (k <= 0 || k >= 1) return;
    ctx.save(); ctx.translate(960, 470 + dy); ctx.rotate(-.14);
    const x = lerp(-1900, 1900, eio(k)); ctx.fillStyle = C.lemon; ctx.fillRect(x - 700, -h / 2, 1400, h); ctx.restore();
  });
}
function stingLogo(t) {
  const s = t - ST0; if (s < 0 || s > 1.5) return;
  const k = seg(s, .16, .42), fly = eio(seg(s, 1.12, 1.45));
  const shake = s > .42 && s < .7 ? Math.sin(s * 90) * 14 * (1 - seg(s, .42, .7)) : 0;
  const cx = lerp(960, 1739, fly) + shake, cy = lerp(450, 86, fly), sc = lerp(back(k, 2.2), .327, fly);
  if (k > 0) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate((1 - eo(k)) * -.12 * (1 - fly)); ctx.translate(-cx, -cy);
    plate(cx, cy, sc, seg(s, .85, 1.12) || -1, seg(s, .3, .7)); ctx.restore();
  }
  const r = seg(s, .42, .8); if (r > 0 && r < 1) { ctx.strokeStyle = `rgba(242,207,29,${1 - r})`; ctx.lineWidth = 6 * (1 - r) + 1; ctx.beginPath(); ctx.ellipse(960, 450, 300 + r * 700, 120 + r * 300, 0, 0, Math.PI * 2); ctx.stroke(); }
  const wa = seg(s, .5, .8), wo = 1 - seg(s, 1.05, 1.18);
  if (wa > 0 && wo > 0) {
    ctx.save(); ctx.globalAlpha = wo; ctx.beginPath(); ctx.rect(960 - 560 * eo(wa), 560, 1120 * eo(wa), 170); ctx.clip();
    wordmark(960, 645, 72, 'center');
    text('BẢN TIN QUỐC TẾ', 960, 700, F.v7(24), C.gold, 'center', 5);
    ctx.restore();
  }
}

// ============ 3 · map long take (4.5–16.5): the tour in one look ============
let LAND = null, LANDP = null;
const MAPK = 30, LON0 = -66.5, LAT0 = 16, COSL = Math.cos(16 * Math.PI / 180);
const proj = (lon, lat) => [(lon - LON0) * MAPK * COSL, -(lat - LAT0) * MAPK];
const STOPS = [
  { ll: [-77.35, 25.06], t: 6.0, name: 'BAHAMAS', l1: '28.10 · Clifford Park', l2: 'nơi Bahamas giành độc lập năm 1973', side: 1, dy: -40, isl: [-79.6, -72.6, 20.8, 27.4],
    img: 'nassau_assembly', f: [450, 330], cr: 'NASSAU · P. HUGHES · CC BY 4.0' },
  { ll: [-58.16, 6.80], t: 9.0, name: 'GUYANA', l1: 'Georgetown · Umana Yana', l2: 'Vua gặp Tổng thống Ali', side: -1, dy: -190,
    img: 'umana', f: [450, 330], cr: 'UMANA YANA · S. DOS SANTOS · PD' },
  { ll: [-61.85, 17.12], t: 12.0, name: 'ANTIGUA VÀ BARBUDA', l1: 'St John’s · 03.11', l2: 'Hoàng hậu tham gia · khai mạc CHOGM', side: 1, dy: -70, isl: [-62.1, -61.5, 16.9, 17.8],
    img: 'dockyard', f: [420, 300], cr: 'NELSON’S DOCKYARD · T. LIPTAK · CC BY 4.0' },
];
const ROUTE = [[6.9, 8.9], [9.9, 11.9]];
function mapView(t) {
  const S = lerp(1.0, 1.14, eio(seg(t, 4.5, 10.5)));
  const ox = lerp(0, -125, eio(seg(t, 10.5, 15.5))), oy = lerp(0, -10, eio(seg(t, 10.5, 15.5)));
  return { S, tf: (x, y) => [960 + ox + x * S, 450 + oy + y * S], O: [960 + ox, 450 + oy] };
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
  for (let lon = -100; lon <= -40; lon += 5) { const [x] = proj(lon, 0); ctx.beginPath(); ctx.moveTo(x, -1200); ctx.lineTo(x, 1200); ctx.stroke(); }
  for (let lat = -10; lat <= 40; lat += 5) { const [, y] = proj(0, lat); ctx.beginPath(); ctx.moveTo(-2000, y); ctx.lineTo(2000, y); ctx.stroke(); }
  ctx.lineJoin = 'round';
  ctx.fillStyle = C.ink3; ctx.fill(LANDP);
  ctx.strokeStyle = 'rgba(150,156,166,.55)'; ctx.lineWidth = 1.1 / V.S; ctx.stroke(LANDP);
  STOPS.forEach(s => { if (!s.isl) return; const k = seg(t, s.t, s.t + .3); if (k <= 0) return;
    ctx.fillStyle = mixc('FFFFFF', 'F2CF1D', k); ctx.fill(s.path); ctx.strokeStyle = 'rgba(18,20,23,.9)'; ctx.stroke(s.path); });
  ctx.restore();
  // sea names: map furniture, readable but not news
  ctx.save(); ctx.globalAlpha = .55 * eo(seg(t, 4.6, 5.2));
  const [ax, ay] = V.tf(...proj(-66, 25.5)); text('ĐẠI TÂY DƯƠNG', ax, ay, F.v7(22), C.gold, 'center', 6, 'sea1');
  const [cx2, cy2] = V.tf(...proj(-72.5, 14.2)); text('BIỂN CARIBE', cx2, cy2, F.v7(22), C.gold, 'center', 6, 'sea2');
  ctx.restore();
  // route
  const pts = STOPS.map(s => V.tf(...proj(...s.ll)));
  ROUTE.forEach(([a, b], i) => {
    const k = eio(seg(t, a, b)); if (k <= 0) return;
    const B = bez(pts[i], pts[i + 1], i ? -.25 : .18);
    ctx.strokeStyle = C.lemon; ctx.lineWidth = 4; ctx.setLineDash([16, 10]); ctx.lineCap = 'round';
    ctx.beginPath(); for (let j = 0; j <= 60; j++) { const q = bezAt(B, k * j / 60); j ? ctx.lineTo(...q) : ctx.moveTo(...q); } ctx.stroke(); ctx.setLineDash([]);
    if (k < 1) { const q = bezAt(B, k); ctx.fillStyle = C.lemon; ctx.beginPath(); ctx.arc(q[0], q[1], 8, 0, Math.PI * 2); ctx.fill(); }
  });
  // stops: ping, dot, card on a leader
  STOPS.forEach((s, i) => {
    const [x, y] = pts[i], a = s.t; if (t < a) return;
    const rb = seg(t, a, a + .6); if (rb < 1) { ctx.strokeStyle = `rgba(242,207,29,${1 - rb})`; ctx.lineWidth = 6 * (1 - rb) + 1; ctx.beginPath(); ctx.arc(x, y, 16 + rb * 220, 0, Math.PI * 2); ctx.stroke(); }
    const pr = ((t - a) * 1.1) % 1; ctx.strokeStyle = `rgba(242,207,29,${.8 * (1 - pr)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 12 + pr * 30, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
    const k = eo(seg(t, a + .1, a + .45)); if (k <= 0) return;
    const PW = 220, cw = PW + 28 + Math.max(tw(s.name, F.b8(40), 2), tw(s.l1, F.mono(19), 1.5), tw(s.l2, F.v7(24))) + 30, chh = 170;
    const bx = s.side > 0 ? x + 46 : x - 46 - cw, by = y + s.dy, ex = s.side > 0 ? bx : bx + cw;
    ctx.strokeStyle = C.lemon; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 12 * s.side, y); ctx.lineTo(lerp(x + 12 * s.side, ex, k), lerp(y, by + 40, k)); ctx.stroke();
    ctx.save(); ctx.translate(bx, by + chh / 2); ctx.scale(1, Math.max(.02, back(k, 1.6))); ctx.translate(-bx, -(by + chh / 2));
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(bx + 8, by + 8, cw, chh);
    ctx.fillStyle = 'rgba(27,30,35,.96)'; ctx.fillRect(bx, by, cw, chh); ctx.fillStyle = C.lemon; ctx.fillRect(bx, by, cw, 5);
    const done = k >= 1, im = IM[s.img];
    const ps = Math.max(PW / im.width, (chh - 5) / im.height) * lerp(1.12, 1.0, eo(seg(t, a + .1, a + 3)));
    photoAt(im, s.f[0], s.f[1], ps, bx + PW / 2, by + 5 + (chh - 5) / 2, bx, by + 5, PW, chh - 5);
    ctx.fillStyle = 'rgba(14,16,19,.72)'; ctx.fillRect(bx, by + chh - 22, PW, 22);
    text(s.cr, bx + 8, by + chh - 7, F.mono(10), C.paper, 'left', .5, done ? 'scr' + i : null, true);
    const tx = bx + PW + 28;
    text(s.name, tx, by + 60, F.b8(40), C.white, 'left', 2, done ? 'sn' + i : null);
    text(s.l1, tx, by + 96, F.mono(19), C.gold, 'left', 1.5, done ? 'sa' + i : null);
    text(s.l2, tx, by + 138, F.v7(24), C.paper, 'left', 0, done ? 'sb' + i : null);
    ctx.restore();
  });
  vignette(.35);
}

// ============ 3b · the event photo (16.5–22.5, film time): the reception for new Commonwealth leaders, 3 Nov 2026 ============
const PH_STRAP = { tab: 'HOÀNG GIA ANH', hl: 'Tiệc chiêu đãi các nhà lãnh đạo mới tại CHOGM', cut: true };
function shotPhoto(t) {
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  const k = eio(seg(t, PHB, GRB));
  const P = photoAt(IM.king_leaders_b, 1794, 700, lerp(.74, .84, k), lerp(1180, 1220, k), lerp(430, 410, k));
  const g = ctx.createLinearGradient(0, 380, 0, H); g.addColorStop(0, 'rgba(14,16,19,0)'); g.addColorStop(.55, 'rgba(14,16,19,.82)'); g.addColorStop(1, 'rgba(14,16,19,.92)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const g2 = ctx.createLinearGradient(0, 0, 900, 0); g2.addColorStop(0, 'rgba(14,16,19,.55)'); g2.addColorStop(1, 'rgba(14,16,19,0)');
  ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H); vignette(.45); grain(t);
  const x = 120;
  ctx.globalAlpha = eo(seg(t, PHB + .1, PHB + .3)); text('ANTIGUA · 3 NOV 2026', x + 2, 618, F.mono(22), C.gold, 'left', 3, 'h0'); ctx.globalAlpha = 1;
  pushUp('Vua tiếp các nhà lãnh đạo mới', x, 700, F.v9(64), C.white, eo(seg(t, PHB + .15, PHB + .45)), 74, 0, 'h1');
  pushUp('của Khối Thịnh vượng chung', x, 780, F.v9(64), C.lemon, eo(seg(t, PHB + .3, PHB + .6)), 74, 0, 'h2');
  // name tag on the King, attached to the photo through its own transform
  const nk = seg(t, PHB + 1.2, PHB + 1.45);
  if (nk > 0) {
    const [hx, hy] = P.at(1794, 560), lw = 40 + tw('VUA CHARLES III', F.v9(26), 1), ty = hy - 190;
    ctx.strokeStyle = C.lemon; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hx, ty + 50); ctx.lineTo(hx, lerp(ty + 50, hy - 40, eo(nk))); ctx.stroke();
    ctx.save(); ctx.translate(hx, ty + 25); ctx.scale(back(nk, 2.2), back(nk, 2.2));
    ctx.fillStyle = C.lemon; ctx.fillRect(-lw / 2, -25, lw, 50);
    text('VUA CHARLES III', 0, 11, F.v9(26), C.ink, 'center', 1, nk >= 1 ? 'hk' : null); ctx.restore();
  }
}

// the Leaders Investment Summit, 2 Nov 2026: the King with the UK Prime Minister
const SUM_STRAP = { tab: 'HOÀNG GIA ANH', hl: 'Vua tại Hội nghị Đầu tư, Antigua', cut: true };
function shotSummit(t) {
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  const k = eio(seg(t, 16.5, PHB));
  photoAt(IM.king_summit, 1150, 520, lerp(.80, .88, k), lerp(900, 960, k), 470);
  const g = ctx.createLinearGradient(0, 420, 0, H); g.addColorStop(0, 'rgba(14,16,19,0)'); g.addColorStop(.55, 'rgba(14,16,19,.8)'); g.addColorStop(1, 'rgba(14,16,19,.92)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); vignette(.45); grain(t);
  const x = 120;
  ctx.globalAlpha = eo(seg(t, 16.55, 16.75)); text('ANTIGUA · 2 NOV 2026', x + 2, 700, F.mono(22), C.gold, 'left', 3, 'm0'); ctx.globalAlpha = 1;
  pushUp('Hội nghị Đầu tư trước CHOGM', x, 782, F.v9(64), C.white, eo(seg(t, 16.6, 16.9)), 74, 0, 'm1');
}

// the leaders who came: four photos in a grid, 24.5–30.5 (No 10 Downing Street, OGL v3)
const GRID_STRAP = { tab: 'KHỐI THỊNH VƯỢNG CHUNG', hl: 'Lãnh đạo các nước tới Antigua dự CHOGM', cut: true };
const TILES = [
  { img: 'mottley', f: [.52, .42], a: GRB + .2, n: 'Thủ tướng Barbados Mia Mottley', d: '2 NOV 2026 · WITH UK PM ANDY BURNHAM' },
  { img: 'albanese', f: [.45, .32], a: GRB + .5, n: 'Thủ tướng Australia Anthony Albanese', d: '2 NOV 2026 · WITH UK PM ANDY BURNHAM' },
  { img: 'holness', f: [.55, .4], a: GRB + .8, n: 'Thủ tướng Jamaica Andrew Holness', d: '3 NOV 2026 · WITH UK PM ANDY BURNHAM' },
  { img: 'steelpan', f: [.55, .45], a: GRB + 1.1, n: 'Dàn trống thép Hell’s Gate, Antigua', d: '4 NOV 2026 · DURING CHOGM' },
];
function shotGrid(t) {
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(244,241,232,.035)';
  for (let x = 40 - (t * 8) % 48; x < W; x += 48) for (let y = 24; y < H; y += 48) ctx.fillRect(x, y, 2, 2);
  const x0 = 120, gw = 830, gh = 300, gap = 20, top = 196;
  ctx.globalAlpha = eo(seg(t, GRB + .05, GRB + .25)); text('ANTIGUA · 2–4 NOV 2026', x0 + 2, 110, F.mono(22), C.gold, 'left', 3, 'g0'); ctx.globalAlpha = 1;
  pushUp('Lãnh đạo các nước tới Antigua', x0, 172, F.v9(52), C.white, eo(seg(t, GRB + .05, GRB + .35)), 60, 0, 'g1');
  TILES.forEach((T, i) => {
    const k = seg(t, T.a, T.a + .3); if (k <= 0) return;
    const bx = x0 + (i % 2) * (gw + gap), by = top + Math.floor(i / 2) * (gh + gap), im = IM[T.img];
    ctx.save(); ctx.translate(0, by + gh / 2); ctx.scale(1, Math.max(.02, back(k, 1.8))); ctx.translate(0, -(by + gh / 2));
    ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(bx + 8, by + 8, gw, gh);
    const s0 = Math.max(gw / im.width, gh / im.height) * lerp(1.12, 1.0, eo(seg(t, T.a, T.a + 5)));
    photoAt(im, T.f[0] * im.width, T.f[1] * im.height, s0, bx + gw / 2, by + gh / 2, bx, by, gw, gh);
    ctx.fillStyle = C.lemon; ctx.fillRect(bx, by, gw, 5);
    const g = ctx.createLinearGradient(0, by + gh - 110, 0, by + gh); g.addColorStop(0, 'rgba(14,16,19,0)'); g.addColorStop(.45, 'rgba(14,16,19,.85)'); g.addColorStop(1, 'rgba(14,16,19,.95)');
    ctx.fillStyle = g; ctx.fillRect(bx, by + gh - 110, gw, 110);
    const done = k >= 1;
    text(T.n, bx + 22, by + gh - 46, F.v7(28), C.white, 'left', 0, done ? 'gn' + i : null);
    text(T.d, bx + 22, by + gh - 18, F.mono(14), C.gold, 'left', 1.5, done ? 'gd' + i : null, true);
    ctx.restore();
  });
  grain(t, .04);
}

// ============ 4 · spec card (16.5–25.0): the room he spoke to ============
const SP = { eb: 16.6, title: 16.75, sub: 17.15, lab: 17.6, bar1: 17.8, bar2: 18.6, badge: 19.3, big: 19.9, bigl: 20.2, chip: 20.7 };
function shotSpec(t) {
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(244,241,232,.035)';
  for (let x = 40 - (t * 8) % 48; x < W; x += 48) for (let y = 24; y < H; y += 48) ctx.fillRect(x, y, 2, 2);
  ctx.save(); ctx.translate(lerp(10, -14, seg(t, 16.5, 25.0)), 40);
  const x = 150;
  ctx.globalAlpha = eo(seg(t, SP.eb, SP.eb + .2)); text('ROYAL.UK · ST JOHN’S, ANTIGUA · 3 NOV 2026', x + 4, 150, F.mono(22), C.gold, 'left', 3, 'p0'); ctx.globalAlpha = 1;
  pushUp('CHOGM 28', x - 4, 300, F.b8(150), C.white, eo(seg(t, SP.title, SP.title + .35)), 150, 2, 'p1');
  pushUp('Hội nghị Thượng đỉnh Khối Thịnh vượng chung lần thứ 28', x, 360, F.v7(34), C.lemon, eo(seg(t, SP.sub, SP.sub + .3)), 44, 0, 'p2');
  // the whole and the part on one scale (schematic: his words, "a third of humanity")
  const BW = 900, y1 = 500, y2 = 620;
  const bar = (y, label, v, a, col, id, val) => {
    const la = eo(seg(t, a - .2, a + .05)); if (la <= 0) return;
    ctx.globalAlpha = la; text(label, x, y - 18, F.v7(28), C.white, 'left', 0, id); ctx.globalAlpha = 1;
    ctx.fillStyle = '#22262C'; ctx.fillRect(x, y, BW, 56);
    const k = eio(seg(t, a, a + .55)), w = Math.max(4, BW * v * k);
    const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, col === C.lemon ? C.lemonD : '#B9B4A6'); g.addColorStop(1, col);
    ctx.fillStyle = g; ctx.fillRect(x, y, w, 56);
    if (k >= 1) text(val, x + w + 20, y + 46, F.b8(52), col, 'left', 0, id + 'v');
  };
  bar(y1, 'Toàn nhân loại', 1, SP.bar1, C.paper, 'pb1', '100%');
  bar(y2, 'Khối Thịnh vượng chung', 1 / 3, SP.bar2, C.lemon, 'pb2', '1/3');
  // one-third ticks on the whole bar
  const tk = seg(t, SP.bar2 + .2, SP.bar2 + .5);
  if (tk > 0) { ctx.globalAlpha = tk; ctx.fillStyle = C.ink; [1, 2].forEach(j => ctx.fillRect(x + BW * j / 3 - 2, y1, 4, 56)); ctx.globalAlpha = 1; }
  const pk = seg(t, SP.badge, SP.badge + .2);
  if (pk > 0) {
    const s = back(pk, 2.4), q = '“a third of humanity”', lw = tw(q, F.b6i(34), 1) + 44;
    ctx.save(); ctx.translate(x + 470 + lw / 2, y2 + 28); ctx.scale(s, s);
    ctx.fillStyle = C.gold; ctx.fillRect(-lw / 2, -28, lw, 56);
    text(q, -lw / 2 + 22, 12, F.b6i(34), C.ink, 'left', 1, pk >= 1 ? 'pq' : null); ctx.restore();
  }
  // right column: more than a billion young people; almost thirty years
  const RX = 1220;
  // the youth figure gets a face: Sir Viv Richards with young cricketers, Antigua, 2 Nov 2026 (No 10, OGL v3)
  const yk = eo(seg(t, SP.big - .5, SP.big - .2));
  if (yk > 0) {
    const pw = 600, ph = 240, py = 168, im = IM.cricket;
    ctx.save(); ctx.globalAlpha = yk; ctx.beginPath(); ctx.rect(RX, py + (1 - yk) * ph, pw, ph * yk); ctx.clip();
    photoAt(im, .5 * im.width, .42 * im.height, Math.max(pw / im.width, ph / im.height) * lerp(1.1, 1.0, seg(t, SP.big - .5, 24.5)), RX + pw / 2, py + ph / 2, RX, py, pw, ph);
    ctx.fillStyle = 'rgba(14,16,19,.8)'; ctx.fillRect(RX, py + ph - 34, pw, 34);
    text('Viv Richards và các cầu thủ trẻ · Antigua, 2.11', RX + 14, py + ph - 11, F.v7(18), C.paper, 'left', 0, yk >= 1 ? 'py' : null, true);
    text('NO 10 · OGL 3', RX + pw - 12, py + ph - 12, F.mono(12), C.grey2, 'right', .5, null, true);
    ctx.fillStyle = C.lemon; ctx.fillRect(RX, py, pw, 5);
    ctx.restore();
  }
  pushUp('HƠN 1 TỶ', RX, 560, F.v9(108), C.lemon, eo(seg(t, SP.big, SP.big + .35)), 120, 0, 'pr1');
  const lk = eo(seg(t, SP.bigl, SP.bigl + .3));
  if (lk > 0) { ctx.globalAlpha = lk; text('người trẻ ở các nước', RX, 610, F.v7(30), C.white, 'left', 0, 'pr2'); text('Khối Thịnh vượng chung', RX, 650, F.v7(30), C.white, 'left', 0, 'pr3'); ctx.globalAlpha = 1; }
  const ck = eo(seg(t, SP.chip, SP.chip + .3));
  if (ck > 0) {
    const y = 720, s1 = 'Gần 30 năm', s2 = 'kể từ CHOGM đầu tiên Vua dự', cw = 30 + tw(s1, F.v9(30)) + 16 + tw(s2, F.v7(24)) + 30;
    ctx.save(); ctx.translate((1 - ck) * 300, 0); ctx.globalAlpha = ck;
    ctx.fillStyle = 'rgba(27,30,35,.95)'; ctx.fillRect(RX, y, cw, 70); ctx.fillStyle = C.lemon; ctx.fillRect(RX, y, 6, 70);
    const w1 = text(s1, RX + 28, y + 47, F.v9(30), C.lemon, 'left', 0, ck >= 1 ? 'pc1' : null); text(s2, RX + 28 + w1 + 16, y + 46, F.v7(24), C.grey, 'left', 0, ck >= 1 ? 'pc2' : null);
    ctx.restore();
  }
  ctx.restore();
}

// ============ 5 · quote card (25.0–38.5): one beat of silence, then his words ============
const Q = { mark: 25.5, l: [26.0, 26.25, 28.6, 28.85], ul: 31.2, vn: 31.5, who: 32.4 };
const QL = ['The transatlantic trade in enslaved persons still casts', 'a shadow over these islands and other Members of our Commonwealth.',
  '…that shameful chapter of history is one that fills my heart', 'with horror and my soul with the most profound personal sorrow.'];
function shotQuote(t) {
  studioBg(t, lerp(.03, .12, seg(t, 25.5, 27)));
  // the King's photo from the cold open returns, dimmed behind his words
  ctx.save(); ctx.globalAlpha = .2 * eo(seg(t, 25.6, 27.0));
  photoAt(IM.king_leaders_b, 1794, 640, lerp(1.5, 1.56, seg(t, 25.5, 38.5)), 520, 420); ctx.restore(); grain(t, .05);
  const z = lerp(1, 1.04, eio(seg(t, 25.5, 38.5)));
  ctx.save(); ctx.translate(900, 420); ctx.scale(z, z); ctx.translate(-900, -420);
  const x = 230, Y = [250, 320, 440, 510], FS = 54;
  const qk = seg(t, Q.mark, Q.mark + .25);
  if (qk > 0) { const s = back(qk, 2.4); ctx.save(); ctx.translate(x - 70, 150); ctx.scale(s, s); text('“', -40, 150, F.b8(300), C.lemon, 'left'); ctx.restore(); }
  QL.forEach((L, i) => pushUp(L, x + 80, Y[i], F.b6(FS), i < 2 ? C.grey : C.white, eo(seg(t, Q.l[i], Q.l[i] + .32)), 72, .5, 'q' + i));
  const pre = tw('with horror and my soul with the most profound personal ', F.b6(FS), .5), ow = tw('sorrow', F.b6(FS), .5);
  underline(x + 80 + pre, Y[3] + 16, ow, eio(seg(t, Q.ul, Q.ul + .4)));
  const vk = eo(seg(t, Q.vn, Q.vn + .3));
  ctx.globalAlpha = vk;
  text('Vua nói chương sử buôn bán nô lệ khiến ông kinh hoàng và vô cùng đau buồn', x + 80, 620, F.v7(34), C.lemon, 'left', 0, vk >= 1 ? 'qv' : null);
  ctx.globalAlpha = eo(seg(t, Q.who, Q.who + .3));
  ctx.fillStyle = C.gold; ctx.fillRect(x + 80, 656, 60, 4);
  text('VUA CHARLES III', x + 80, 712, F.v9(34), C.paper, 'left', 2, t > Q.who + .3 ? 'qw' : null);
  text('CHOGM OPENING CEREMONY · ST JOHN’S · 3 NOV 2026', x + 80, 752, F.mono(20), C.grey2, 'left', 2, t > Q.who + .3 ? 'qs' : null);
  ctx.globalAlpha = 1;
  ctx.restore();
  if (t >= 25.6) { ctx.save(); ctx.globalAlpha = .7; text('BACKGROUND PHOTO 3 NOV 2026: NO 10 · OGL 3', 1836, 826, F.mono(13), C.paper, 'right', .5, 'qpc', true); ctx.restore(); }
}

// ============ 6 · closing quote and the one stamp (38.5–45.0) ============
const CL = { eb: 38.6, l1: 38.75, l2: 38.95, l3: 40.2, vn: 40.6, stamp: 42.15 };
function shotClose(t) {
  studioBg(t, .14);
  // the King with Commonwealth leaders, 3 Nov 2026 (No 10, OGL v3), dimmed behind the closing line
  ctx.save(); ctx.globalAlpha = .18 * eo(seg(t, 38.5, 39.5));
  photoAt(IM.king_leaders_a, .26 * IM.king_leaders_a.width, .45 * IM.king_leaders_a.height, lerp(.46, .5, seg(t, 38.5, 44.75)), 1300, 560); ctx.restore(); grain(t, .04);
  if (t >= 39.0) { ctx.save(); ctx.globalAlpha = .7; text('BACKGROUND PHOTO 3 NOV 2026: NO 10 · OGL 3', 1836, 826, F.mono(13), C.paper, 'right', .5, 'kpc', true); ctx.restore(); }
  const z = lerp(1, 1.05, eio(seg(t, 38.5, 44.0)));
  ctx.save(); ctx.translate(800, 430); ctx.scale(z, z); ctx.translate(-800, -430);
  const x = 200;
  ctx.globalAlpha = eo(seg(t, CL.eb, CL.eb + .2)); text('ROYAL.UK · 3 NOV 2026', x, 170, F.mono(24), C.gold, 'left', 4, 'k0'); ctx.globalAlpha = 1;
  pushUp('We cannot change the actions', x, 300, F.b8(96), C.white, eo(seg(t, CL.l1, CL.l1 + .32)), 100, 1, 'k1');
  pushUp('of those who came before us.', x, 400, F.b8(96), C.white, eo(seg(t, CL.l2, CL.l2 + .32)), 100, 1, 'k2');
  pushUp('We can, however, learn from the past.', x, 530, F.b8(96), C.lemon, eo(seg(t, CL.l3, CL.l3 + .35)), 100, 1, 'k3');
  const vk = eo(seg(t, CL.vn, CL.vn + .3));
  ctx.globalAlpha = vk; text('Quá khứ không đổi được, nhưng ta có thể học từ đó', x, 610, F.v7(36), C.paper, 'left', 0, vk >= 1 ? 'kv' : null); ctx.globalAlpha = 1;
  const sk = seg(t, CL.stamp, CL.stamp + .16);
  if (sk > 0) {
    const s = 1 + .9 * (1 - eo(sk)); ctx.save(); ctx.translate(1450, 720); ctx.rotate(-.12); ctx.scale(s, s); ctx.globalAlpha = clamp(sk * 3);
    ctx.fillStyle = 'rgba(18,20,23,.95)'; ctx.fillRect(-250, -62, 500, 124);
    ctx.strokeStyle = C.lemon; ctx.lineWidth = 4; ctx.strokeRect(-240, -52, 480, 104); ctx.lineWidth = 1.5; ctx.strokeRect(-231, -43, 462, 86);
    text('CHOGM 28', 0, 2, F.b8(54), C.lemon, 'center', 4, sk >= 1 ? 'ks1' : null);
    text('ST JOHN’S · ANTIGUA', 0, 36, F.mono(20), C.paper, 'center', 3, sk >= 1 ? 'ks2' : null);
    ctx.restore();
    const rr = seg(t, CL.stamp + .05, CL.stamp + .5); if (rr < 1) { ctx.strokeStyle = `rgba(242,207,29,${.8 * (1 - rr)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(1450, 720, 220 + rr * 160, 80 + rr * 60, -.12, 0, Math.PI * 2); ctx.stroke(); }
  }
  ctx.restore();
}

// ============ 7 · end card (45.0–49.0) ============
const E0 = 44.85;
function shotEnd(t) {
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#1A1D22'); g.addColorStop(1, '#0E1013');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(244,241,232,.04)';
  for (let x = 40 - (t * 10) % 48; x < W; x += 48) for (let y = 24; y < H; y += 48) ctx.fillRect(x, y, 2, 2);
  ctx.fillStyle = C.lemon; ctx.beginPath(); ctx.moveTo(1260, 0); ctx.lineTo(1290, 0); ctx.lineTo(1150, 790); ctx.lineTo(1120, 790); ctx.fill();
  ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(1300, 0); ctx.lineTo(1306, 0); ctx.lineTo(1166, 790); ctx.lineTo(1160, 790); ctx.fill();
  const m = (a, b) => eo(seg(t, E0 + a, E0 + b)), x = 150;
  ctx.globalAlpha = m(.1, .3); text('ST JOHN’S, ANTIGUA · 3 NOV 2026', x, 210, F.mono(24), C.gold, 'left', 3, 'e0'); ctx.globalAlpha = 1;
  pushUp('Vua Charles III tại CHOGM', x - 4, 350, F.v9(fit('Vua Charles III tại CHOGM', F.v9, 88, 940)), C.white, m(.15, .45), 110, 0, 'e1');
  pushUp('The King in Antigua', x, 440, F.b6i(72), C.lemon, m(.3, .58), 80, 2, 'e2');
  ctx.fillStyle = C.lemon; ctx.fillRect(x, 482, 880 * eio(seg(t, E0 + .45, E0 + .75)), 2);
  ctx.globalAlpha = m(.6, .85); text('THẾ GIỚI 24 · BẢN TIN QUỐC TẾ', x, 548, F.v7(30), C.white, 'left', 1, 'e3'); ctx.globalAlpha = 1;
  ctx.globalAlpha = m(.8, 1.1);
  ctx.fillStyle = C.line; ctx.fillRect(x, 816, 1620, 1);
  ['Nguồn: royal.uk — chuyến công du mùa thu (26.10.2026), phát biểu khai mạc CHOGM (03.11.2026)',
   'Ảnh: Simon Dawson / No 10 Downing Street (OGL v3) · P. Hughes, Dr. Thomas Liptak (CC BY 4.0) · Stacey Dos Santos (phạm vi công cộng)',
   'Contains public sector information licensed under the Open Government Licence v3.0',
   'Bản đồ: Natural Earth (phạm vi công cộng) · Nhạc mẫu: VSCO 2 CE, VCSL (CC0) · Phông chữ: Be Vietnam Pro, Barlow Condensed, IBM Plex Mono (OFL)'].forEach((s, i) => text(s, x, 850 + i * 32, F.v7(19), C.grey, 'left', 0, 'ef' + i, true));
  ctx.globalAlpha = 1;
  const la = m(.35, .65); ctx.globalAlpha = la;
  plate(1600, 360, .62, seg(t, E0 + 1.0, E0 + 1.45) || -1, seg(t, E0 + .35, E0 + .85));
  wordmark(1600, 520, 50, 'center', 'e8');
  ctx.globalAlpha = 1;
}

// ============ compositing ============
function wipeBand(bx) { ctx.fillStyle = C.lemon; ctx.fillRect(bx - 84, 0, 84, H); ctx.fillStyle = C.ink; ctx.fillRect(bx, 0, 5, H); ctx.fillStyle = C.gold; ctx.fillRect(bx + 5, 0, 14, H); }
// one picture = a shot + its own package layer, drawn in its state at time tov
function layer(fn, t, tov) { fn(t); cornerTag(tov); credit(tov); strap(tov); }
// vertical band wipe: right of the band the old picture (package frozen before the wipe), left the new one (package already on the new state)
function wipe(t, a, b, oldFn, newFn) {
  const bx = lerp(-140, W + 140, eio(seg(t, a, b)));
  const n0 = TX.length; layer(newFn, t, b + .001); const NEW = TX.splice(n0);
  ctx.save(); ctx.beginPath(); ctx.rect(bx, 0, W, H); ctx.clip(); layer(oldFn, t, a - .001); ctx.restore();
  const OLD = TX.splice(n0); TX.push(...(seg(t, a, b) < .5 ? OLD : NEW));
  wipeBand(bx);
}
// transitions: band wipe (sting → story, story → closing), hard cut + timpani inside the story, slanted wipe into the end card
const MAP = t => shotMap(t), CLOSE = t => shotClose(t);
const SCENES = [[0, shotCold], [3.0, shotSting], [4.5, MAP], [16.5, shotSpec], [25.0, shotQuote], [38.5, CLOSE], [45.0, shotEnd]];
const WIPES = [[4.2, 4.5], [38.2, 38.5]];
function scene(t) {
  if (t >= 3.0 && t < 4.5) {
    if (t >= 4.2) wipe(t, 4.2, 4.5, shotSting, MAP); else layer(shotSting, t, t);
    stingLogo(t); return;
  }
  const w = WIPES.find(([a, b]) => t >= a && t < b);
  if (w) { const i = SCENES.findIndex(s => Math.abs(s[0] - w[1]) < .01); wipe(t, w[0], w[1], SCENES[i - 1][1], SCENES[i][1]); return; }
  if (t >= 44.75 && t < 45.0) {   // slanted wipe; the end card is already moving underneath
    layer(CLOSE, t, t);
    const k = eio(seg(t, 44.75, 45.0)), x = W - k * (W + 340);
    ctx.save(); ctx.beginPath(); ctx.moveTo(x + 340, 0); ctx.lineTo(W + 340, 0); ctx.lineTo(W + 340, H); ctx.lineTo(x, H); ctx.closePath(); ctx.clip(); shotEnd(t); ctx.restore();
    ctx.fillStyle = C.lemon; ctx.beginPath(); ctx.moveTo(x + 340, 0); ctx.lineTo(x + 380, 0); ctx.lineTo(x + 40, H); ctx.lineTo(x, H); ctx.fill();
    return;
  }
  let fn = SCENES[0][1]; for (const [a, f] of SCENES) if (t >= a) fn = f;
  layer(fn, t, t);
}
function render(t) {
  TX = [];
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  if (t >= INS[0] && t < INS[1]) {   // hard cuts: map → summit → reception → spec card
    if (t < PHB) { shotSummit(t); strap(t, SUM_STRAP); } else if (t < GRB) { shotPhoto(t); strap(t, PH_STRAP); } else { shotGrid(t); strap(t, GRID_STRAP); }
    photoCredit(t < GRB ? 'PHOTO: SIMON DAWSON / NO 10 · OGL 3' : 'PHOTOS: SIMON DAWSON / NO 10 · OGL 3', 'Ảnh: Phủ Thủ tướng Anh · OGL v3'); bug(t);
    return;
  }
  const u = t >= INS[1] ? t - SHIFT : t;
  scene(u);
  bug(u);
  if (u > 48.4) { ctx.fillStyle = `rgba(0,0,0,${seg(u, 48.4, 49.0)})`; ctx.fillRect(0, 0, W, H); }
}

// —— events for mix.py (exported by events.mjs) ——
const EV = [
  { t: .12, type: 'quote_soft' }, { t: 1.6, type: 'mark' },
  { t: 3.04, type: 'swish' }, { t: 3.4, type: 'stab' }, { t: 3.9, type: 'glint' }, { t: 4.2, type: 'whoosh' },
  { t: 4.5, type: 'hit' }, { t: 4.6, type: 'air', dur: 12.0 },
  ...STOPS.map(s => ({ t: s.t, type: 'ping' })), ...STOPS.map(s => ({ t: s.t + .12, type: 'card' })),
  ...ROUTE.map(([a, b]) => ({ t: a, type: 'draw', dur: b - a })),
  { t: 12.0, type: 'flap' },
  { t: 16.5, type: 'hit' }, { t: 16.75, type: 'push' }, { t: 17.15, type: 'slide' }, { t: 17.8, type: 'bar' }, { t: 18.6, type: 'bar' }, { t: 19.3, type: 'pop' },
  { t: 19.9, type: 'push' }, { t: 20.7, type: 'slide' },
  { t: 25.5, type: 'boom' }, { t: 25.5, type: 'air', dur: 13.0 }, { t: 26.0, type: 'line' }, { t: 26.25, type: 'line' }, { t: 28.6, type: 'line' }, { t: 28.85, type: 'line' },
  { t: 31.2, type: 'mark' }, { t: 31.5, type: 'slide' },
  { t: 38.2, type: 'whoosh' }, { t: 38.75, type: 'line' }, { t: 38.95, type: 'line' }, { t: 40.2, type: 'line' }, { t: 42.15, type: 'stamp_big' },
  { t: 44.75, type: 'whoosh' }, { t: 45.85, type: 'glint' },
];

for (const e of EV) if (e.t >= INS[0]) e.t = Math.round((e.t + SHIFT) * 1000) / 1000;
EV.push({ t: 16.5, type: 'hit' }, { t: 16.55, type: 'push' }, { t: 16.6, type: 'slide' },
  { t: PHB, type: 'hit' }, { t: PHB + .15, type: 'slide' }, { t: PHB + .3, type: 'slide' }, { t: PHB + 1.2, type: 'pop' },
  { t: GRB, type: 'hit' }, { t: GRB + .05, type: 'slide' }, ...TILES.map(T => ({ t: T.a, type: 'card' })));
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
