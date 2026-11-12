// OctopusClear's shared parts: the skin-colour model (pigment sacs over fixed mirror plates and white
// cells → a colour you can see), the chromatophore muscle model, a procedural common octopus, a
// cut-open slab of skin, body-pattern painting, and the layout and chart-board helpers the chapters use
// (the same ones as ChameleonClear and JellyfishClear; the CIE colour code is ChameleonClear's).
//
// The chromatophore organ (Messenger 2001, "Cephalopod chromatophores: neurobiology and natural
// history", Biological Reviews 76: 473–528; abstract read in Europe PMC): each organ is an elastic
// pigment sac (sacculus) with a set of obliquely striated radial muscles, each with its own nerves.
// When the muscles contract the sac is pulled wide; when they relax, energy stored in the elastic sac
// shrinks it again. They are wired straight from the brain and are not controlled by hormones. In
// Octopus vulgaris there are over half a million neurons in the chromatophore lobes alone.
// Speed: the radial muscles widen or relax the sac in 100–300 ms (Senft, Kuzirian & Hanlon 2021,
// Journal of Morphology; abstract; measured in squid). Our activation model below uses time constants
// of 0.08 s (contract) and 0.13 s (elastic recoil), so 90% of a change takes 0.18 s and 0.30 s.
// Muscle count: "15–25 radial muscles" is a figure quoted for squid organs in reviews citing Messenger
// 2001 (search summary); Senft et al. 2021 say "several dozen" in squid. We draw 18 and call it
// "a ring of about 15 to 25 or more".
// Size: octopus chromatophores are smaller than squid ones, up to about 0.3 mm across when open
// (secondary source, search summary). The closed size and the area ratio below are illustrative.
// Density: "several hundred chromatophores per mm²" in some common cephalopods (Packard 1995 chapter
// abstract, search summary).
//
// The mirror plates (iridophores, called reflector cells in octopus): in Octopus dofleini each reflector
// cell carries stacks ("reflectosomes") of about 11 protein platelets about 90 nm thick with gaps of
// about 60 nm, a quarter-wave thin-film mirror that should reflect blue-green "as seen in vivo"
// (Brocco & Cloney 1980, Cell and Tissue Research 211: 525; abstract read in Europe PMC). We use the
// textbook multilayer formula λ = 2 (n₁d₁ + n₂d₂) with platelet n₁ = 1.56 (the reflecting-platelet
// index commonly used for cephalopod iridophores, Land 1972 / Denton & Land 1971; from memory, not
// re-checked) and n₂ = 1.33 for the watery gap: 2 × (1.56 × 90 + 1.33 × 60) = 440 nm, blue. The gaps
// were measured in embedded (shrunken) tissue, so living gaps are probably a little wider; our default
// of 75 nm gives about 480 nm, blue-green. Unlike a chameleon's lattice, octopus plates are not tuned
// by the animal: the colour change comes from pigment sacs opening over them (Mäthger, Denton, Marshall
// & Hanlon 2009, J. R. Soc. Interface 6: S149, abstract: most cephalopod iridescence and white
// scattering is passive; some squid iridophores are actively controlled).
// White cells (leucophores) scatter all colours and so take on the colour of the light around them.
// Octopus and cuttlefish have them; squid generally do not (Mäthger et al. 2009).
// Pigments: brown, red and yellow chromatophores (Mäthger & Hanlon 2007, Cell Tissue Res 329: 179,
// abstract, in squid; octopus have the same three classes in the usual textbook account).
import { THREE, M, clamp, beam, sphere, smooth } from './kit.js';

export const TAU = Math.PI * 2;
// ---------------------------------------------------------------- spectra and colour
const L0 = 380, L1 = 730, DL = 5, NL = (L1 - L0) / DL + 1;
export const LAMBDAS = Array.from({ length: NL }, (_, i) => L0 + i * DL);
const g = (x, mu, s1, s2) => { const t = (x - mu) / (x < mu ? s1 : s2); return Math.exp(-0.5 * t * t); };
const CMF = LAMBDAS.map((l) => [
  1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2),
  0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1),
  1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8),
]);
const planck = (l, T) => { const x = l * 1e-9; return 1 / (x ** 5 * (Math.exp(1.4388e-2 / (x * T)) - 1)); };
const ILL = (() => { const a = LAMBDAS.map((l) => planck(l, 6500)); const m = a[Math.round((560 - L0) / DL)]; return a.map((v) => v / m); })();
const YW = LAMBDAS.reduce((acc, _, i) => acc + ILL[i] * CMF[i][1], 0);
const gam = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
function xyzToRgb([X, Y, Z], gain = 1) {
  let r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z, gg = -0.9689 * X + 1.8758 * Y + 0.0415 * Z, b = 0.0557 * X - 0.204 * Y + 1.057 * Z;
  r *= gain; gg *= gain; b *= gain;
  const mx = Math.max(r, gg, b, 1); // keep the hue if one channel overflows
  return [r, gg, b].map((c) => clamp(gam(Math.max(0, c / mx)), 0, 1));
}
export function spectrumToRgb(R, gain = 1.45) {
  const xyz = [0, 0, 0];
  R.forEach((v, i) => { for (let k = 0; k < 3; k++) xyz[k] += v * ILL[i] * CMF[i][k]; });
  return xyzToRgb(xyz.map((v) => v / YW), gain);
}
// The colour of pure light of one wavelength (for drawing rays and the spectrum strip).
export function lambdaRgb(l) {
  if (l > 730) return [0.45, 0.05, 0.05];
  const i = clamp(Math.round((l - L0) / DL), 0, NL - 1), [X, Y, Z] = CMF[i];
  let r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z, gg = -0.9689 * X + 1.8758 * Y + 0.0415 * Z, b = 0.0557 * X - 0.204 * Y + 1.057 * Z;
  const mn = Math.min(r, gg, b); if (mn < 0) { r -= mn; gg -= mn; b -= mn; }
  const mx = Math.max(r, gg, b) || 1;
  return [r, gg, b].map((c) => gam(c / mx));
}
export const css = (rgb) => `rgb(${rgb.map((c) => Math.round(c * 255)).join(',')})`;
export const hex = (rgb) => (Math.round(rgb[0] * 255) << 16) | (Math.round(rgb[1] * 255) << 8) | Math.round(rgb[2] * 255);

export function hueName(rgb) {
  const [r, g2, b] = rgb, mx = Math.max(r, g2, b), mn = Math.min(r, g2, b), l = (mx + mn) / 2;
  if (mx < 0.16) return 'almost black';
  if (mx - mn < 0.08) return l > 0.7 ? 'whitish' : 'grey-brown';
  let h = mx === r ? ((g2 - b) / (mx - mn)) % 6 : mx === g2 ? (b - r) / (mx - mn) + 2 : (r - g2) / (mx - mn) + 4; h *= 60; if (h < 0) h += 360;
  const n = h < 14 ? 'red' : h < 38 ? 'orange' : h < 62 ? 'yellow' : h < 82 ? 'yellow-green' : h < 150 ? 'green' : h < 190 ? 'turquoise' : h < 250 ? 'blue' : h < 290 ? 'violet' : h < 335 ? 'pink' : 'red';
  return (mx < 0.38 ? 'dark ' : '') + n;
}
export const bandName = (l) => (l < 450 ? 'violet' : l < 470 ? 'blue' : l < 500 ? 'blue-green' : l < 565 ? 'green' : l < 590 ? 'yellow' : l < 625 ? 'orange' : l < 720 ? 'red' : 'near-infrared');

// ---------------------------------------------------------------- boards (as in JellyfishClear)
export const COL = { hot: '#ffb547', cool: '#8ef0ff', up: '#5ce1a9', down: '#ff7a59', water: '#6cc4ff', red: '#ff5a8a', gold: '#f2c24b', violet: '#c49bff', lime: '#a3e635', soft: 'rgba(255,255,255,.6)', text: '#e8eef8' };
export function board(root, w, h, pxW, pxH, draw, pos) {
  const c = document.createElement('canvas'); c.width = pxW; c.height = pxH;
  const gx = c.getContext('2d'), tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const redraw = (...a) => { draw(gx, pxW, pxH, ...a); tex.needsUpdate = true; };
  redraw();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, side: THREE.DoubleSide, depthWrite: false }));
  m.position.set(...pos); m.renderOrder = 10; root.add(m);
  return { tex, redraw, canvas: c, mesh: m };
}
export function panel(gx, w, h) { gx.clearRect(0, 0, w, h); gx.fillStyle = 'rgba(10,12,18,.88)'; gx.beginPath(); gx.roundRect(0, 0, w, h, 18); gx.fill(); }
export function head(gx, t, sub = '') {
  gx.fillStyle = COL.text; gx.font = 'bold 26px sans-serif'; gx.fillText(t, 22, 38);
  if (sub) { gx.font = '18px sans-serif'; gx.fillStyle = COL.soft; gx.fillText(sub, 22, 64); }
}
export function txt(gx, s, x, y, col = 'rgba(255,255,255,.78)', font = '19px sans-serif') { gx.fillStyle = col; gx.font = font; gx.fillText(s, x, y); }
export function wrap(gx, s, x, y, maxW, lh = 24, col = 'rgba(255,255,255,.78)', font = '19px sans-serif') {
  gx.fillStyle = col; gx.font = font; let line = '', yy = y;
  for (const word of s.split(' ')) { const t = line ? line + ' ' + word : word; if (gx.measureText(t).width > maxW && line) { gx.fillText(line, x, yy); line = word; yy += lh; } else line = t; }
  if (line) gx.fillText(line, x, yy);
  return yy + lh;
}
export function swatch(gx, rgb, x, y, w, h, label) {
  gx.fillStyle = css(rgb); gx.beginPath(); gx.roundRect(x, y, w, h, 12); gx.fill();
  gx.strokeStyle = 'rgba(255,255,255,.35)'; gx.lineWidth = 2; gx.stroke();
  if (label) txt(gx, label, x, y + h + 24, COL.text, '18px sans-serif');
}

// ---------------------------------------------------------------- layout helpers
export const inReel = () => document.body.classList.contains('gb-reel');
export function layoutOf(stage) {
  const w = stage.host.clientWidth, h = stage.host.clientHeight || 1;
  if (inReel() && w / h < 0.8) return 'tall';
  return w < 560 ? 'narrow' : 'wide';
}
export function viewFor(stage, v) { const lay = layoutOf(stage); return v[lay] || v; }
export function viewFixer(stage, view) {
  let done = false;
  return () => {
    if (done) return; done = true;
    const lay = layoutOf(stage);
    if (lay !== 'wide' && view[lay] && !inReel()) stage.setView(view[lay].pos, view[lay].target, 0.01);
  };
}
export function focuser(stage, groups, views) {
  let cur = '';
  return (f, force = false) => {
    if (f === cur && !force) return false;
    cur = f;
    for (const k in groups) groups[k].visible = k === f;
    if (!inReel()) { const v = viewFor(stage, views[f]); stage.setView(v.pos, v.target, 1.0); }
    return true;
  };
}
const _v = new THREE.Vector3(), _r = new THREE.Vector3(), _u = new THREE.Vector3();
export function fitBoard(stage, mesh, base, scale = 1) {
  const cam = stage.camera;
  mesh.visible = layoutOf(stage) !== 'narrow';
  if (!mesh.visible) return;
  mesh.position.set(...base); mesh.scale.setScalar(scale); mesh.updateMatrixWorld(true);
  const p = mesh.geometry.parameters, hw = p.width / 2, hh = p.height / 2;
  cam.updateMatrixWorld(); _r.setFromMatrixColumn(cam.matrixWorld, 0); _u.setFromMatrixColumn(cam.matrixWorld, 1);
  for (let it = 0; it < 8; it++) {
    let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      _v.set(sx * hw, sy * hh, 0).applyMatrix4(mesh.matrixWorld).project(cam);
      x0 = Math.min(x0, _v.x); x1 = Math.max(x1, _v.x); y0 = Math.min(y0, _v.y); y1 = Math.max(y1, _v.y);
    }
    const wN = x1 - x0, hN = y1 - y0;
    if (wN > 1.25 || hN > 0.9) { const k = Math.min(1.25 / wN, 0.9 / hN); mesh.scale.multiplyScalar(k); mesh.updateMatrixWorld(true); continue; }
    let dx = 0, dy = 0;
    if (x1 > 0.97) dx = 0.97 - x1; if (x0 + dx < -0.97) dx = -0.97 - x0;
    if (y1 > 0.86) dy = 0.86 - y1;
    if (x0 + dx < 0.2 && y1 + dy > 0.3 && y0 + dy < 0.98) {
      if (wN > 0.77) { mesh.scale.multiplyScalar(0.77 / wN); mesh.updateMatrixWorld(true); continue; }
      dx = 0.2 - x0;
    }
    if (!dx && !dy) break;
    const d = mesh.position.distanceTo(cam.position), th = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * d;
    mesh.position.addScaledVector(_r, dx * th * cam.aspect).addScaledVector(_u, dy * th);
    mesh.updateMatrixWorld(true);
  }
}
export function reelZoom(stage, z) {
  const lay = layoutOf(stage), want = lay === 'tall' ? z : 1;
  if (stage.camera.zoom !== want) { stage.camera.zoom = want; stage.camera.updateProjectionMatrix(); }
  const [x, y] = lay === 'narrow' ? [0, -0.24] : lay === 'wide' ? [0.08, -0.1] : [0, 0];
  if (!stage.shift || stage.shift[0] !== x || stage.shift[1] !== y) stage.setShift(x, y);
}
// Dim blue-green water. The stage resets background and fog on chapter close.
export function seaLook(stage, col = 0x061820) { stage.floor.visible = false; stage.scene.background = new THREE.Color(col); stage.scene.fog = new THREE.Fog(col, 16, 44); }

// ---------------------------------------------------------------- mirror plates (iridophores)
export const PLATE = { n1: 1.56, n2: 1.33, d1: 90, d2: 75, N: 11 };
export function plateLambda(d2 = PLATE.d2, d1 = PLATE.d1) { return 2 * (PLATE.n1 * d1 + PLATE.n2 * d2); }
// Peak reflectance of an ideal stack of N pairs, and its relative bandwidth (standard thin-film results).
export function plateStack(d2 = PLATE.d2) {
  const q = Math.pow(PLATE.n2 / PLATE.n1, 2 * PLATE.N), Rpk = ((1 - q) / (1 + q)) ** 2;
  const bw = (4 / Math.PI) * Math.asin((PLATE.n1 - PLATE.n2) / (PLATE.n1 + PLATE.n2));
  return { lambda: plateLambda(d2), Rpk, bw };
}

// ---------------------------------------------------------------- skin spectrum
// p: { y, r, b: area covered by yellow, red and brown pigment (0–1); irid: share of the floor that is
// mirror plates, leuco: share that is white cells, d2: plate gap nm }. Reflectosomes face every which
// way, so only part of the ideal stack's reflection comes back toward the viewer (factor 0.45, chosen).
const TY = (l) => 1 - 0.92 / (1 + Math.exp((l - 505) / 12));
const TR = (l) => 1 - 0.9 / (1 + Math.exp((l - 595) / 14));
const TB = (l) => 0.07 + 0.1 * (l - 380) / 350;
export function skinSpectrum({ y = 0, r = 0, b = 0, irid = 0.5, leuco = 0.3, d2 = PLATE.d2 } = {}) {
  const st = plateStack(d2), w = st.lambda * st.bw / 2;
  return LAMBDAS.map((l) => {
    const plate = st.Rpk * 0.45 * Math.exp(-0.5 * ((l - st.lambda) / w) ** 2) + 0.04;
    const floor = irid * plate + leuco * 0.72 + Math.max(0, 1 - irid - leuco) * 0.14;
    const f = (c, T) => (1 - c) + c * T * T;
    return 0.025 + floor * f(y, TY(l)) * f(r, TR(l)) * f(b, TB(l));
  });
}
export function colourOf(p) { const R = skinSpectrum(p); return { R, rgb: spectrumToRgb(R, 1.35), Rvis: meanVisible(R) }; }
export const meanVisible = (R) => R.reduce((a, v, i) => a + v * ILL[i] * CMF[i][1], 0) / YW;
export const PIG = { y: [0.95, 0.74, 0.2], r: [0.78, 0.2, 0.14], b: [0.22, 0.12, 0.07] };

// ---------------------------------------------------------------- chromatophore muscles
// Activation a (0 = muscles relaxed, sac shrunk by its own elasticity; 1 = fully pulled open).
// Steady pull for a nerve firing at f spikes per second: f²/(f² + f½²) with f½ = 12 Hz (illustrative
// twitch fusion, like any striated muscle; see MuscleClear). Dynamics: first order, faster to open.
export const CHR = { tauOn: 0.08, tauOff: 0.13, Dopen: 300, Dclosed: 95, fHalf: 12, nMuscles: 18 };
export const pullOf = (f) => (f <= 0 ? 0 : (f * f) / (f * f + CHR.fHalf ** 2));
export function stepAct(a, target, dt) { const tau = target > a ? CHR.tauOn : CHR.tauOff; return a + (target - a) * (1 - Math.exp(-Math.max(0, dt) / tau)); }
export const diamOf = (a) => CHR.Dclosed + (CHR.Dopen - CHR.Dclosed) * clamp(a, 0, 1);
export const T90_OPEN = CHR.tauOn * Math.LN10, T90_CLOSE = CHR.tauOff * Math.LN10;
// ChameleonClear's change: crystals spread as cells swell; a panther chameleon can change "within one or
// two minutes" (University of Geneva press release on Teyssier et al. 2015; search summary). We use 90 s.
export const CHAM_S = 90;

// ---------------------------------------------------------------- body patterns
// Painted into a canvas that wraps the octopus. Modes after the camouflage types of Hanlon 2007/2009
// (uniform, mottle, disruptive) plus signals. P: { mode, base, light, dark, grain (0–1), contrast (0–1) }
const rng = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const cs = (c, k = 1) => `rgb(${c.map((v) => Math.round(clamp(v * k, 0, 1) * 255)).join(',')})`;
const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
export function paintPattern(g, w, h, P, t = 0) {
  const R = rng(7), base = P.base, light = P.light || mix(base, [1, 1, 1], 0.55), dark = P.dark || mix(base, [0, 0, 0], 0.7), con = P.contrast ?? 0.5;
  g.fillStyle = cs(base); g.fillRect(0, 0, w, h);
  const blob = (x, y, r, c, a) => { g.globalAlpha = a; g.fillStyle = cs(c); g.beginPath(); g.ellipse(x, y, r * (0.7 + R() * 0.6), r * (0.6 + R() * 0.5), R() * 3, 0, TAU); g.fill(); };
  const m = P.mode;
  if (m === 'mottle' || m === 'weed') {
    const n = Math.round(90 + 260 * (1 - (P.grain ?? 0.5))), rr = 6 + 26 * (P.grain ?? 0.5);
    for (let i = 0; i < n; i++) blob(R() * w, R() * h, rr, R() < 0.5 ? light : dark, 0.35 + 0.5 * con);
  } else if (m === 'disruptive') {
    for (let i = 0; i < 40; i++) blob(R() * w, R() * h, 10, dark, 0.4);
    g.globalAlpha = 0.92; g.fillStyle = cs(mix(light, [1, 1, 1], 0.4));
    g.fillRect(w * 0.32, h * 0.38, w * 0.12, h * 0.24);                      // the pale square on the mantle
    for (let k = 0; k < 4; k++) g.fillRect(w * (0.08 + k * 0.25), 0, w * 0.04, h);  // pale bands on arms
    g.fillStyle = cs(dark, 0.6); g.fillRect(0, h * 0.47, w, h * 0.05);           // dark lines through the body
    g.fillRect(w * 0.6, 0, w * 0.03, h);
  } else if (m === 'lion' || m === 'snake' || m === 'bands') {
    const nb = m === 'snake' ? 22 : 14;
    for (let k = 0; k < nb; k++) { g.globalAlpha = 1; g.fillStyle = cs(k % 2 ? [0.95, 0.93, 0.85] : dark); g.fillRect((k / nb) * w, 0, w / nb + 1, h); }
  } else if (m === 'cloud') {
    for (let k = 0; k < 3; k++) {
      const x = (((t * 0.55 + k / 3) % 1) * 1.4 - 0.2) * w, gr = g.createLinearGradient(x - 60, 0, x + 60, 0);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, cs(dark, 0.6)); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = 0.9; g.fillStyle = gr; g.fillRect(x - 60, 0, 120, h);
    }
  } else if (m === 'blue') {
    for (let i = 0; i < 46; i++) { const x = R() * w, y = R() * h; g.globalAlpha = 1; g.strokeStyle = cs([0.15, 0.45, 1], 0.4 + 0.6 * (P.flash ?? 0)); g.lineWidth = 5; g.fillStyle = cs([0.15, 0.1, 0.05]); g.beginPath(); g.arc(x, y, 9, 0, TAU); g.fill(); g.stroke(); }
  }
  if (m !== 'disruptive' && m !== 'blue') for (let i = 0; i < 220; i++) { g.globalAlpha = 0.18; g.fillStyle = cs(dark); g.beginPath(); g.arc(R() * w, R() * h, 1.6, 0, TAU); g.fill(); }
  g.globalAlpha = 1;
}

// ---------------------------------------------------------------- an arm: a tapered tube we re-shape every frame
class Arm {
  constructor(mat, seg = 40, rs = 10, r0 = 0.17, r1 = 0.014) {
    this.seg = seg; this.rs = rs; this.r0 = r0; this.r1 = r1;
    const n = (seg + 1) * (rs + 1), pos = new Float32Array(n * 3), uv = new Float32Array(n * 2), idx = [];
    for (let i = 0; i <= seg; i++) for (let j = 0; j <= rs; j++) { const k = i * (rs + 1) + j; uv[k * 2] = i / seg; uv[k * 2 + 1] = j / rs; }
    for (let i = 0; i < seg; i++) for (let j = 0; j < rs; j++) { const a = i * (rs + 1) + j, b = a + rs + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx);
    this.mesh = new THREE.Mesh(geo, mat); this.mesh.castShadow = this.mesh.receiveShadow = true; this.mesh.frustumCulled = false;
    this.pts = Array.from({ length: seg + 1 }, () => new THREE.Vector3()); this.nrm = Array.from({ length: seg + 1 }, () => new THREE.Vector3());
  }
  radius(u) { return this.r0 + (this.r1 - this.r0) * Math.pow(u, 0.8); }
  build() {
    const { seg, rs, pts } = this, pos = this.mesh.geometry.attributes.position, T = new THREE.Vector3(), N = new THREE.Vector3(), B = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i <= seg; i++) {
      T.subVectors(pts[Math.min(seg, i + 1)], pts[Math.max(0, i - 1)]).normalize();
      B.crossVectors(T, up); if (B.lengthSq() < 1e-6) B.set(1, 0, 0); B.normalize(); N.crossVectors(B, T).normalize();
      this.nrm[i].copy(N).negate();                       // underside, where the suckers sit
      const r = this.radius(i / seg);
      for (let j = 0; j <= rs; j++) { const a = (j / rs) * TAU, k = i * (rs + 1) + j; pos.setXYZ(k, pts[i].x + r * (Math.cos(a) * N.x + Math.sin(a) * B.x), pts[i].y + r * (Math.cos(a) * N.y + Math.sin(a) * B.y), pts[i].z + r * (Math.cos(a) * N.z + Math.sin(a) * B.z)); }
    }
    pos.needsUpdate = true; this.mesh.geometry.computeVertexNormals(); this.mesh.geometry.computeBoundingSphere();
  }
}

// ---------------------------------------------------------------- the octopus
// A generic common octopus (Octopus vulgaris-like) sitting on the sea floor (y = 0). The arm crown is at
// the origin, the head with its two eyes sits above it, and the bag-like mantle (holding the gills,
// hearts and gut) behind and above the head, toward −X. Arms are re-shaped every frame by a "turtle":
// each arm has a heading that dips down to the floor, may rise (raise), waves sideways and curls at
// the tip. Pupils are horizontal slits (kept level by the balance organs, the statocysts: Wells 1960,
// Fraser & Wells 1961; search summary).
export const POSES = {
  rest: { len: 2.6, spread: 1, raise: 0, curl: 0.7, wave: 0.18, sweep: 0, hide: 0, lift: 0 },
  sit: { len: 2.3, spread: 1, raise: 0.05, curl: 1.0, wave: 0.12, sweep: 0, hide: 0, lift: 0 },
  weed: { len: 2.5, spread: 0.7, raise: 1.05, curl: 0.4, wave: 0.35, sweep: 0, hide: 0, lift: 0.1 },
  flat: { len: 2.8, spread: 1, raise: -0.05, curl: 0.05, wave: 0.06, sweep: 1, hide: 0, lift: -0.35 },
  lion: { len: 2.6, spread: 1, raise: 0.5, curl: 0.15, wave: 0.08, sweep: 0, hide: 0, lift: 0.15 },
  snake: { len: 3.2, spread: 1, raise: -0.02, curl: 0.0, wave: 0.5, sweep: 0, hide: 1, lift: -0.4 },
};
export class Octopus {
  constructor({ seg = 36, papillae = true } = {}) {
    const g = (this.group = new THREE.Group());
    this.tex = document.createElement('canvas'); this.tex.width = 512; this.tex.height = 256;
    this.gx = this.tex.getContext('2d'); this.map = new THREE.CanvasTexture(this.tex); this.map.colorSpace = THREE.SRGBColorSpace; this.map.wrapS = THREE.RepeatWrapping;
    this.skin = new THREE.MeshStandardMaterial({ map: this.map, roughness: 0.55, metalness: 0, transparent: true, opacity: 1 });
    this.under = new THREE.MeshStandardMaterial({ color: 0xf0d9c8, roughness: 0.5, transparent: true });
    this.meshes = [];
    const add = (m, kind) => { m.castShadow = m.receiveShadow = true; m.userData.kind = kind; this.meshes.push(m); return m; };
    // Mantle and head
    this.body = new THREE.Group(); g.add(this.body);
    this.mantle = add(new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), this.skin), 'mantle');
    this.mantle.scale.set(0.95, 0.72, 0.72); this.mantle.position.set(-0.75, 1.45, 0); this.mantle.rotation.z = -0.55; this.body.add(this.mantle);
    this.head = add(new THREE.Mesh(new THREE.SphereGeometry(0.52, 32, 20), this.skin), 'head'); this.head.position.set(0.05, 0.85, 0); this.head.scale.set(1, 0.85, 1.02); this.body.add(this.head);
    this.eyes = [];
    for (const z of [1, -1]) {
      const e = new THREE.Group(); e.position.set(0.18, 1.12, z * 0.43); this.body.add(e);
      const ball = add(new THREE.Mesh(new THREE.SphereGeometry(0.19, 24, 16), new THREE.MeshStandardMaterial({ color: 0xd8c27a, roughness: 0.3, transparent: true })), 'eye'); e.add(ball);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8), new THREE.MeshBasicMaterial({ color: 0x050505 })); pupil.scale.set(0.12, 0.03, 0.05); pupil.position.set(0.02, 0, z * 0.16); e.add(pupil);
      this.eyes.push({ g: e, pupil, ball });
    }
    this.siphon = add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 0.42, 16, 1, true), this.skin), 'siphon');
    this.siphon.position.set(-0.32, 0.78, 0.5); this.siphon.rotation.set(1.1, 0, 0.5); this.body.add(this.siphon);
    // Arms and suckers
    this.arms = []; this.cords = [];
    this.cordMat = M.glow(0xffd84a, { transparent: true, opacity: 0.9 });
    const SUCK = 18;
    this.suckers = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 0.8, 0.5, 12), this.under, 8 * SUCK); this.suckers.castShadow = true; g.add(this.suckers);
    this.SUCK = SUCK;
    for (let i = 0; i < 8; i++) {
      const a = new Arm(this.skin, seg); add(a.mesh, 'arm'); g.add(a.mesh); this.arms.push(a);
      const c = new Arm(this.cordMat, seg, 6, 0.035, 0.008); c.mesh.visible = false; c.mesh.castShadow = false; g.add(c.mesh); this.cords.push(c);
    }
    // Brain (shown in X-ray): a ring round the gullet plus two big optic lobes behind the eyes.
    this.brain = new THREE.Group(); this.brain.visible = false; this.body.add(this.brain);
    const bm = M.glow(0xffb547, { transparent: true, opacity: 0.95 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.09, 12, 32), bm); ring.position.set(0.02, 0.92, 0); ring.rotation.x = Math.PI / 2; this.brain.add(ring);
    for (const z of [1, -1]) { const ol = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), bm); ol.scale.set(0.8, 1.1, 0.7); ol.position.set(0.12, 1.02, z * 0.27); this.brain.add(ol); }
    // Papillae: small skin cones on the mantle and head that rise for texture.
    this.pap = null;
    if (papillae) {
      const N = 70, pm = new THREE.InstancedMesh(new THREE.ConeGeometry(0.06, 0.16, 8), this.skin, N); this.pap = pm; this.papN = N; this.papAt = [];
      const R = rng(11);
      for (let i = 0; i < N; i++) { const th = R() * TAU, ph = 0.25 + R() * 1.25, onHead = i < 14; this.papAt.push({ th, ph, onHead }); }
      this.body.add(pm);
    }
    this.cur = { ...POSES.rest }; this.setPapillae(0);
    this.paint({ mode: 'mottle', base: [0.55, 0.38, 0.28], contrast: 0.4, grain: 0.5 });
    this.pose(0);
  }
  paint(P, t = 0) { paintPattern(this.gx, 512, 256, P, t); this.map.needsUpdate = true; }
  setPapillae(k) {
    if (!this.pap) return; const o = new THREE.Object3D(), up = new THREE.Vector3(0, 1, 0);
    this.papAt.forEach((p, i) => {
      const host = p.onHead ? this.head : this.mantle, n = new THREE.Vector3(Math.sin(p.ph) * Math.cos(p.th), Math.cos(p.ph), Math.sin(p.ph) * Math.sin(p.th));
      if (p.onHead && n.x > 0.2) n.x = -n.x;   // keep head papillae off the face
      const local = n.clone().multiply(host.scale).applyEuler(host.rotation).add(host.position);
      const nn = n.clone().divide(host.scale).applyEuler(host.rotation).normalize();
      o.position.copy(local).addScaledVector(nn, 0.02); o.quaternion.setFromUnitVectors(up, nn); o.scale.set(1, Math.max(0.02, k), 1);
      o.updateMatrix(); this.pap.setMatrixAt(i, o.matrix);
    });
    this.pap.instanceMatrix.needsUpdate = true; this.pap.visible = k > 0.03;
  }
  xray(on) {
    this.skin.opacity = on ? 0.28 : 1; this.under.opacity = on ? 0.28 : 1; this.skin.depthWrite = this.under.depthWrite = !on;
    this.brain.visible = on; this.cords.forEach((c) => (c.mesh.visible = on));
    this.eyes.forEach((e) => { e.ball.material.opacity = on ? 0.3 : 1; e.ball.material.depthWrite = !on; });
  }
  // Blend toward a pose and re-shape the arms. t: time in seconds.
  pose(t, target = null, dt = 0, k = 3) {
    const c = this.cur;
    if (target) for (const key in target) c[key] += (target[key] - c[key]) * (1 - Math.exp(-k * Math.max(0, dt)));
    const v = new THREE.Vector3(), o = new THREE.Object3D(), up = new THREE.Vector3(0, 1, 0);
    this.body.position.y = c.lift; this.body.rotation.z = -0.25 * c.sweep;
    for (let i = 0; i < 8; i++) {
      const arm = this.arms[i], seg = arm.seg;
      // Base angle: arms spread round the crown; "sweep" gathers them all behind (−X), as a flatfish.
      let phi = ((i + 0.5) / 8) * TAU;
      const back = Math.PI + (i - 3.5) * 0.09;
      phi = phi + (back - phi) * c.sweep;
      // Snake: six arms hidden in a tight coil under the body, two stretched out in opposite directions.
      const hidden = c.hide * (i === 1 || i === 5 ? 0 : 1);
      const L = c.len * (1 - 0.8 * hidden) * (1 + 0.25 * c.hide * (1 - hidden)) * (0.94 + 0.12 * Math.sin(i * 2.1));
      const ds = L / seg;
      v.set(Math.cos(phi) * 0.3, 0.55 + c.lift, Math.sin(phi) * 0.3);
      let yaw = phi;
      for (let s = 0; s <= seg; s++) {
        const u = s / seg;
        arm.pts[s].copy(v);
        const curl = (c.curl + 1.6 * hidden) * smooth((u - 0.6) / 0.4) * 3.2;
        const pitch = -1.1 * Math.exp(-u * 9) + c.raise * (0.7 + 0.3 * Math.sin(i * 1.3)) * (1 - u * 0.3) + curl * (i % 2 ? 1 : 0.7);
        const wav = c.wave * Math.sin(5 * u - 1.7 * t + i * 1.9) * (0.4 + u);
        yaw = phi + wav + hidden * u * 3.0;
        v.x += ds * Math.cos(pitch) * Math.cos(yaw); v.y += ds * Math.sin(pitch); v.z += ds * Math.cos(pitch) * Math.sin(yaw);
        const r = arm.radius(u); if (v.y < r) v.y = r;
      }
      arm.build();
      const cord = this.cords[i]; cord.pts.forEach((p, s) => p.copy(arm.pts[s])); if (cord.mesh.visible) cord.build();
      for (let k2 = 0; k2 < this.SUCK; k2++) {
        const u = 0.08 + 0.86 * (k2 / this.SUCK), s = Math.round(u * seg), r = arm.radius(u);
        o.position.copy(arm.pts[s]).addScaledVector(arm.nrm[s], r * 0.85); o.quaternion.setFromUnitVectors(up, arm.nrm[s]); o.scale.set(r * 0.55, r * 0.6, r * 0.55);
        o.updateMatrix(); this.suckers.setMatrixAt(i * this.SUCK + k2, o.matrix);
      }
    }
    this.suckers.instanceMatrix.needsUpdate = true;
  }
}

// ---------------------------------------------------------------- the sea floor
// A floor plane with a painted texture: fine sand, gravel, or big pale and dark rocks.
export const FLOORS = {
  sand: { base: [0.72, 0.64, 0.5], light: [0.85, 0.79, 0.66], dark: [0.55, 0.47, 0.36], grain: 0.03, contrast: 0.15, n: 4000, r: 1.6 },
  gravel: { base: [0.5, 0.45, 0.38], light: [0.8, 0.76, 0.68], dark: [0.25, 0.22, 0.2], grain: 0.18, contrast: 0.5, n: 900, r: 7 },
  rocks: { base: [0.36, 0.34, 0.32], light: [0.93, 0.92, 0.88], dark: [0.12, 0.11, 0.1], grain: 0.6, contrast: 0.9, n: 70, r: 26 },
  weed: { base: [0.3, 0.32, 0.18], light: [0.55, 0.52, 0.3], dark: [0.16, 0.18, 0.08], grain: 0.35, contrast: 0.45, n: 500, r: 9 },
};
export function paintFloor(g, w, h, F) {
  const R = rng(5); g.fillStyle = cs(F.base); g.fillRect(0, 0, w, h);
  for (let i = 0; i < F.n; i++) { g.fillStyle = cs(R() < 0.5 ? F.light : F.dark); g.globalAlpha = 0.5 + 0.5 * R(); g.beginPath(); g.ellipse(R() * w, R() * h, F.r * (0.5 + R()), F.r * (0.4 + R() * 0.8), R() * 3, 0, TAU); g.fill(); }
  g.globalAlpha = 1;
}
export function seaFloor(root, size = 24) {
  const c = document.createElement('canvas'); c.width = c.height = 1024;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.CircleGeometry(size / 2, 64), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.006; m.receiveShadow = true; root.add(m);
  return { mesh: m, paint(F) { paintFloor(g, 1024, 1024, F); tex.needsUpdate = true; } };
}

// ---------------------------------------------------------------- skin cut open
// A block of octopus skin, top to bottom: thin outer skin (epidermis), the chromatophore layer (yellow,
// red and brown sacs), the mirror plates (iridophores), the white cells (leucophores), and the dermis
// with the muscles that raise papillae. Width along X, depth along Z.
export const LAYERS = [
  { id: 'epi', short: 'Outer skin', h: 0.12 },
  { id: 'chr', short: 'Chromatophores', h: 0.2 },
  { id: 'iri', short: 'Iridophores (mirror plates)', h: 0.16 },
  { id: 'leu', short: 'Leucophores (white cells)', h: 0.2 },
  { id: 'der', short: 'Dermis and papilla muscles', h: 0.34 },
];
export class SkinSlab {
  constructor({ W = 3, D = 1.8 } = {}) {
    this.group = new THREE.Group(); this.layers = {}; this.W = W; this.D = D;
    let y = 0; const tops = {};
    for (const ly of LAYERS) { const g = new THREE.Group(); g.userData.home = -y - ly.h / 2; g.position.y = g.userData.home; this.group.add(g); this.layers[ly.id] = g; tops[ly.id] = ly.h; y += ly.h; }
    const R = rng(3);
    const epi = this.layers.epi; epi.add(new THREE.Mesh(new THREE.BoxGeometry(W, 0.12, D), M.clear(0xf3e3d6, 0.35)));
    // Papilla: a bump in the outer skin, pushed up by muscles below.
    this.bump = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 12, 0, TAU, 0, Math.PI / 2), M.clear(0xf3e3d6, 0.45)); this.bump.position.set(W * 0.3, 0.06, 0); epi.add(this.bump);
    const chr = this.layers.chr; chr.add(new THREE.Mesh(new THREE.BoxGeometry(W, 0.2, D), M.clear(0xffe8d8, 0.08)));
    const N = 60, disc = new THREE.CylinderGeometry(1, 1, 1, 18);
    this.sacs = new THREE.InstancedMesh(disc, new THREE.MeshStandardMaterial({ roughness: 0.5 }), N); chr.add(this.sacs); this.sacAt = [];
    for (let i = 0; i < N; i++) { const k = i % 3; this.sacAt.push({ x: (R() - 0.5) * (W - 0.2), z: (R() - 0.5) * (D - 0.2), k, ph: R() * 6 }); this.sacs.setColorAt(i, new THREE.Color().setRGB(...PIG['yrb'[k]], THREE.SRGBColorSpace)); }
    const iri = this.layers.iri;
    const pm = new THREE.MeshStandardMaterial({ color: 0x3fb7e0, emissive: 0x0d4a6a, metalness: 0.5, roughness: 0.15 });
    this.plates = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 0.02, 0.16), pm, 70); iri.add(this.plates);
    const o = new THREE.Object3D();
    for (let i = 0; i < 70; i++) { o.position.set((R() - 0.5) * (W - 0.15), (R() - 0.5) * 0.1, (R() - 0.5) * (D - 0.15)); o.rotation.set((R() - 0.5) * 0.6, R() * 3, (R() - 0.5) * 0.6); o.updateMatrix(); this.plates.setMatrixAt(i, o.matrix); }
    const leu = this.layers.leu;
    this.whites = new THREE.InstancedMesh(new THREE.SphereGeometry(0.075, 12, 8), M.plastic(0xf6f6f2, { roughness: 0.9 }), 120); leu.add(this.whites);
    for (let i = 0; i < 120; i++) { o.position.set((R() - 0.5) * (W - 0.1), (R() - 0.5) * 0.1, (R() - 0.5) * (D - 0.1)); o.rotation.set(0, 0, 0); o.scale.set(1, 0.7, 1); o.updateMatrix(); this.whites.setMatrixAt(i, o.matrix); }
    const der = this.layers.der; der.add(new THREE.Mesh(new THREE.BoxGeometry(W, 0.34, D), M.matte(0xd99a8a, { transparent: true, opacity: 0.85 })));
    this.fibres = [];
    for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU, f = beam([W * 0.3 + Math.cos(a) * 0.45, 0.12, Math.sin(a) * 0.45], [W * 0.3, 0.17, 0], 0.025, M.plastic(0xb0453a)); der.add(f); this.fibres.push(f); }
    this.setOpen(0.5); this.setPap(0);
  }
  setOpen(a, t = 0) {
    const o = new THREE.Object3D();
    this.sacAt.forEach((p, i) => { const k = clamp(a + 0.15 * Math.sin(t * 2 + p.ph), 0, 1), r = (diamOf(k) / CHR.Dopen) * 0.14; o.position.set(p.x, 0.02 * (p.k - 1), p.z); o.scale.set(r, 0.035, r); o.updateMatrix(); this.sacs.setMatrixAt(i, o.matrix); });
    this.sacs.instanceMatrix.needsUpdate = true; if (this.sacs.instanceColor) this.sacs.instanceColor.needsUpdate = true;
  }
  setPap(k) { this.bump.scale.set(1, Math.max(0.02, k), 1); this.fibres.forEach((f) => (f.scale.y = 1 - 0.3 * k)); }
  explode(k) { let i = 0; for (const ly of LAYERS) { const g = this.layers[ly.id]; g.position.y = g.userData.home + (2 - i) * 0.32 * k; i++; } }
}

// ---------------------------------------------------------------- small cousins (for the cousins chapter)
// Very simplified: a cuttlefish (flattened oval mantle with a fin skirt round it, eight short arms and
// two tentacles) and a squid (long torpedo mantle with a pair of triangular fins). Facing +X.
export function cuttlefish(mat) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 18), mat); body.scale.set(1.25, 0.42, 0.62); g.add(body);
  const skirt = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 8), M.clear(0xe8d8c8, 0.5)); skirt.scale.set(1.28, 0.06, 0.82); skirt.position.y = -0.08; g.add(skirt);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 16), mat); head.position.set(1.25, 0, 0); head.scale.set(0.9, 0.85, 1.1); g.add(head);
  for (let i = 0; i < 8; i++) { const a = (i / 8 - 0.5) * 1.2, pts = [[1.55, 0, a * 0.3], [2.0, -0.05 + 0.05 * Math.cos(i), a * 0.45], [2.35, -0.12, a * 0.55]]; g.add(tubeOf(pts, 0.07, mat)); }
  for (const z of [0.1, -0.1]) g.add(tubeOf([[1.55, -0.1, z], [2.3, -0.25, z * 2], [2.8, -0.3, z * 3]], 0.03, mat));
  for (const z of [1, -1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12), new THREE.MeshStandardMaterial({ color: 0xd8c27a })); e.position.set(1.3, 0.2, z * 0.38); g.add(e); }
  return g;
}
export function squid(mat) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.42, 3.0, 28), mat); body.rotation.z = Math.PI / 2; body.position.x = -0.3; g.add(body);
  const finShape = new THREE.Shape(); finShape.moveTo(0, 0); finShape.lineTo(-0.9, 0.75); finShape.lineTo(-1.15, 0); finShape.closePath();
  for (const s of [1, -1]) { const f = new THREE.Mesh(new THREE.ShapeGeometry(finShape), M.clear(0xe8d8c8, 0.6)); f.rotation.x = s * Math.PI / 2; f.position.x = -0.65; g.add(f); }
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 16), mat); head.position.set(1.3, 0, 0); head.scale.set(1.1, 0.9, 1); g.add(head);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; g.add(tubeOf([[1.55, 0.12 * Math.cos(a), 0.12 * Math.sin(a)], [2.1, 0.18 * Math.cos(a), 0.18 * Math.sin(a)], [2.5, 0.2 * Math.cos(a), 0.2 * Math.sin(a)]], 0.05, mat)); }
  for (const z of [0.07, -0.07]) g.add(tubeOf([[1.55, 0, z], [2.5, -0.05, z * 2], [3.2, -0.08, z * 3]], 0.025, mat));
  for (const z of [1, -1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), new THREE.MeshStandardMaterial({ color: 0x223344, roughness: 0.2 })); e.position.set(1.32, 0.08, z * 0.28); g.add(e); }
  return g;
}
function tubeOf(pts, r, mat) {
  const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
  const geo = new THREE.TubeGeometry(curve, 16, 1, 8, false), pos = geo.attributes.position, c = new THREE.Vector3(), v = new THREE.Vector3();
  for (let i = 0; i <= 16; i++) { const u = i / 16, rr = r * (1 - 0.75 * u); curve.getPointAt(u, c); for (let j = 0; j <= 8; j++) { const k = i * 9 + j; v.fromBufferAttribute(pos, k).sub(c).multiplyScalar(rr).add(c); pos.setXYZ(k, v.x, v.y, v.z); } }
  geo.computeVertexNormals(); const m = new THREE.Mesh(geo, mat); m.castShadow = true; return m;
}
// A skin material with its own pattern canvas, for the cousins.
export function patternSkin(P) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const g = c.getContext('2d'), tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 });
  const paint = (p, t = 0) => { paintPattern(g, 256, 128, p, t); tex.needsUpdate = true; };
  paint(P); return { mat, paint };
}
