// Chapter 2: pixels with muscles. Two views:
//  1. One chromatophore organ, seen from above: an elastic pigment sac with a ring of radial muscles,
//     each fed by a nerve (Messenger 2001). Nerve firing rate → steady muscle pull (pullOf in octo.js)
//     → activation with time constants 0.08 s to open and 0.13 s to close (stepAct) → diameter between
//     95 and 300 µm (diamOf; open size after reports that octopus chromatophores reach about 0.3 mm;
//     the closed size is illustrative). Under it sit mirror plates (iridophores) and white cells.
//  2. A patch of skin: 1,836 chromatophores in three colours over iridophores and leucophores, driven
//     by pattern presets. The patch colour is computed from how much of the floor each pigment covers
//     (skinSpectrum / colourOf in octo.js, CIE 1931 → sRGB). The change time is measured in the
//     simulation: from a preset switch until 90% of the organs are within 10% of their new size.
//     Compared with ChameleonClear's colour change, which takes "one or two minutes" in an excited
//     panther chameleon (CHAM_S = 90 s; Geneva press release, search summary).
//  - Energy: running the whole chromatophore system flat out costs nearly as much as the octopus's
//    resting metabolic rate (Sonner & Onthank 2024, PNAS 121: e2408386121, abstract).
import { THREE, M, approach, clamp, beam } from '../kit.js';
import { CHR, PIG, pullOf, stepAct, diamOf, T90_OPEN, T90_CLOSE, CHAM_S, colourOf, plateLambda, css, hueName, bandName, board, panel, head, txt, wrap, swatch, COL, layoutOf, reelZoom, viewFixer, fitBoard, focuser, seaLook, inReel } from '../octo.js';

const VIEWS = {
  one: { pos: [0.6, 5.6, 5.4], target: [0.6, 1.3, 0], narrow: { pos: [0, 6.6, 6.4], target: [0, 1.0, 0] } },
  patch: { pos: [0.9, 5.2, 6.2], target: [0.9, 1.1, 0], narrow: { pos: [0, 6.6, 7.4], target: [0, 0.9, 0] } },
};
const NX = 54, NZ = 34, PW = 6.0, PD = 3.8, SP = PW / NX;
const PRESETS = {
  pale: 'Pale', dark: 'Uniform dark', mottle: 'Mottle', bands: 'Disruptive bands', clouds: 'Passing clouds',
};
// Target pull (0–1) for organ class k (0 yellow, 1 red, 2 brown) at patch position u, v (0–1).
function target(preset, k, u, v, t, n) {
  const noise = (Math.sin(u * 37.1 + v * 11.7 + n) * 43758.5453) % 1, nz = Math.abs(noise);
  if (preset === 'pale') return 0.04;
  if (preset === 'dark') return k === 2 ? 1 : k === 1 ? 0.85 : 0.5;
  if (preset === 'mottle') { const b = Math.sin(u * 17 + Math.sin(v * 7) * 2.5) * Math.sin(v * 13 + Math.cos(u * 9) * 2.5) + 0.25 * (nz - 0.5); return b > 0.1 ? (k === 2 ? 1 : 0.85) : b < -0.25 ? 0.0 : (k === 0 ? 0.7 : 0.15); }
  if (preset === 'bands') { const sq = Math.abs(u - 0.5) < 0.1 && Math.abs(v - 0.5) < 0.16, band = Math.abs(((u * 4.2) % 1) - 0.5) < 0.12; return sq || band ? 0.0 : (k === 2 ? 1 : 0.8); }
  if (preset === 'clouds') { const x = (u * 1.3 - ((t * 0.6) % 1.6) + 0.15), on = Math.exp(-((x - 0) ** 2) / 0.012); return clamp(0.08 + 0.95 * on * (k === 0 ? 0.5 : 1), 0, 1); }
  return 0.3;
}

export default {
  id: 'pixels',
  short: 'Pixels with muscles',
  title: 'Pixels with muscles',
  subtitle: 'Each colour spot is a bag of pigment pulled open by tiny muscles, on orders from the brain.',
  view: VIEWS.one,
  learn: `<p>A screen makes pictures from millions of pixels. An octopus does it with thousands of <b>chromatophores</b>, and each one is a little machine.</p>
    <p>In the middle is a stretchy <b>sac of pigment</b>: yellow, red or brown. Around it, like the spokes of a wheel, is a ring of tiny <b>radial muscles</b>, each with its own <b>nerve</b> running straight from the brain. When the nerve fires, the muscles contract and pull the sac wide open into a coloured disc. When the nerve goes quiet, the muscles relax and the <b>elastic sac</b> springs back to a tiny dot. (How muscles pull: <a href="/muscleclear/#sliding">MuscleClear</a>.)</p>
    <p>Because it is nerves and muscles, it is <b>fast</b>. A sac opens or closes in about <b>a tenth to a third of a second</b>. No hormones in the blood, no waiting for cells to swell. A chameleon changes colour by slowly spreading the crystals in its skin, which takes a minute or two (<a href="/chameleonclear/#crystal">ChameleonClear</a>).</p>
    <p>Under the pigment sacs sit two kinds of fixed reflectors. <b>Iridophores</b> are stacks of very thin plates whose reflections add up for one colour, blue-green, the same <b>interference</b> of waves as in a soap bubble (<a href="/waveclear/#limits">WaveClear</a>) and in a chameleon, except an octopus does not tune them. <b>Leucophores</b> scatter all colours and look white. Open the sacs and you cover the mirrors; close them and the mirrors shine through.</p>
    <p>All this is costly: with every sac pulled open, the skin uses nearly as much energy as the whole resting octopus.</p>
    <p class="tip"><b>Try it:</b> fire the nerve faster and slower and watch one sac. Then switch to the skin patch and try each pattern. Watch the change time.</p>`,
  terms: [
    { t: 'Radial muscle', d: 'One of the tiny muscles arranged like spokes around a chromatophore sac.' },
    { t: 'Motor neuron', d: 'A nerve cell that tells a muscle to contract.' },
    { t: 'Elastic recoil', d: 'Springing back to shape when a stretching force stops, like a rubber band.' },
    { t: 'Interference', d: 'Light waves reflected from many thin layers adding up for one colour and cancelling for others.' },
    { t: 'Body pattern', d: 'The whole picture an octopus shows on its skin at one moment.' },
  ],
  defaults: { focus: 'one', rate: 0, pig: 'r', preset: 'mottle', pap: false },
  onChange(s, key) { if (key === 'rate' || key === 'pig') s.focus = 'one'; if (key === 'preset' || key === 'pap') s.focus = 'patch'; },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'one', label: 'One chromatophore' }, { v: 'patch', label: 'A patch of skin' }] },
    { key: 'rate', type: 'range', label: 'Nerve firing rate', min: 0, max: 40, step: 1, fmt: (v) => `${Math.round(v)} pulses a second`, ends: ['quiet', 'fast'] },
    { key: 'pig', type: 'seg', label: 'Pigment in the sac', options: [{ v: 'y', label: 'Yellow' }, { v: 'r', label: 'Red' }, { v: 'b', label: 'Brown' }] },
    { key: 'burst', type: 'buttons', label: 'Nerve', items: [{ label: 'Fire one short burst', act: (s, inst) => { s.focus = 'one'; inst.burst?.(); } }] },
    { key: 'preset', type: 'seg', label: 'Skin pattern', options: Object.entries(PRESETS).map(([v, label]) => ({ v, label })) },
    { key: 'pap', type: 'toggle', label: 'Raise papillae (texture)' },
  ],
  quiz: [
    { q: 'What makes an octopus chromatophore open?', options: ['Hormones in the blood', 'Radial muscles contracting when their nerves fire', 'Crystals moving apart', 'Water flowing in'], answer: 1, why: 'The radial muscles are wired straight to the brain. When they contract they pull the elastic sac wide.' },
    { q: 'What closes it again?', options: ['A second set of muscles pushing it shut', 'The stretchy sac springing back when the muscles relax', 'The pigment dissolving', 'Light'], answer: 1, why: 'Energy stored in the stretched elastic sac pulls it back to a dot when the muscles relax.' },
    { q: 'Why can an octopus change colour much faster than a chameleon?', options: ['Its skin is thinner', 'It uses nerves and muscles, not slowly swelling crystal cells', 'It has more colours', 'It lives in water'], answer: 1, why: 'Muscles pull the sacs open in a fraction of a second; a chameleon’s crystal cells take a minute or two to swell.' },
  ],
  reel: [
    { ms: 5000, caption: 'Each colour spot is a sac of pigment. When its nerve fires, a ring of muscles pulls it wide open.', set: { focus: 'one', pig: 'r' }, anim: { rate: [0, 30] }, view: { pos: [0.6, 5.8, 3.6], target: [0.6, 1.3, 0] }, spin: 0 },
    { ms: 5600, caption: 'Thousands of sacs switch patterns in about a quarter of a second. A chameleon needs a minute or two.', set: { focus: 'patch', preset: 'bands', pap: false }, act: (s, inst) => inst.cycle?.(), anim: {}, view: { pos: [0.6, 5.6, 4.6], target: [0.6, 1.1, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    seaLook(stage, 0x071a22);
    const G = { one: new THREE.Group(), patch: new THREE.Group() }; root.add(G.one, G.patch);
    const L = (h, p, par, c = '') => stage.label(h, p, par, c);
    // ---- one chromatophore
    const C0 = new THREE.Vector3(0.6, 1.2, 0);
    const irid = new THREE.Mesh(new THREE.CircleGeometry(2.1, 64), new THREE.MeshStandardMaterial({ color: 0x2fa7c9, emissive: 0x0a3c52, metalness: 0.4, roughness: 0.25 }));
    irid.rotation.x = -Math.PI / 2; irid.position.copy(C0).add(new THREE.Vector3(-0.6, -0.12, 0)); G.one.add(irid);
    const leu = new THREE.Mesh(new THREE.CircleGeometry(1.4, 48), M.matte(0xf2f2ee)); leu.rotation.x = -Math.PI / 2; leu.position.copy(C0).add(new THREE.Vector3(1.3, -0.1, 0.6)); G.one.add(leu);
    const sacMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.45 });
    const sac = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 16), sacMat); sac.position.copy(C0); G.one.add(sac);
    const musMat = M.plastic(0xd98a7a, { roughness: 0.6 }), mus = [], NM = CHR.nMuscles, RA = 1.9;
    for (let i = 0; i < NM; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 8), musMat); m.castShadow = true; G.one.add(m); mus.push(m); }
    const nerveMat = M.glow(0xffd84a, { transparent: true, opacity: 0.55 });
    const nerves = []; const pulses = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 10, 8), M.glow(0xfff3a0), NM * 3); G.one.add(pulses);
    for (let i = 0; i < NM; i++) {
      const a = (i / NM) * Math.PI * 2, p0 = [C0.x + Math.cos(a) * RA, C0.y + 0.06, C0.z + Math.sin(a) * RA], p1 = [C0.x + 2.6, C0.y + 0.06, C0.z - 2.4];
      const n = beam(p0, p1, 0.012, nerveMat); n.castShadow = false; G.one.add(n); nerves.push({ p0: new THREE.Vector3(...p0), p1: new THREE.Vector3(...p1) });
    }
    const lo = { sac: L('', [0, 0, 0], G.one, 'hot'), mus: L('Radial muscles', [0, 0, 0], G.one), nerve: L('Nerves from the brain', [C0.x + 2.4, C0.y + 0.3, C0.z - 2.3], G.one), irid: L('Iridophore plates below', [C0.x - 2.0, C0.y, C0.z + 1.4], G.one), leu: L('Leucophores (white)', [C0.x + 2.2, C0.y, C0.z + 1.6], G.one) };
    // ---- patch
    const N = NX * NZ, P0 = new THREE.Vector3(0.9 - PW / 2, 1.0, -PD / 2);
    const floorC = document.createElement('canvas'); floorC.width = 512; floorC.height = 324;
    const fg = floorC.getContext('2d'), ftex = new THREE.CanvasTexture(floorC); ftex.colorSpace = THREE.SRGBColorSpace;
    const floorM = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD), new THREE.MeshStandardMaterial({ map: ftex, roughness: 0.4, metalness: 0.1 }));
    floorM.rotation.x = -Math.PI / 2; floorM.position.set(0.9, 0.98, 0); G.patch.add(floorM);
    const paintFloor = (leuSq) => {
      fg.fillStyle = '#2b9fc2'; fg.fillRect(0, 0, 512, 324);
      for (let i = 0; i < 400; i++) { fg.fillStyle = `rgba(${120 + Math.random() * 60},${210 + Math.random() * 40},255,.25)`; fg.fillRect(Math.random() * 512, Math.random() * 324, 10, 3); }
      fg.fillStyle = '#f1f1ec'; for (let k = 0; k < 4; k++) fg.fillRect(k * 128 + 40, 0, 34, 324);   // white cells in bands
      if (leuSq) fg.fillRect(205, 110, 102, 104);
      ftex.needsUpdate = true;
    };
    paintFloor(true);
    const disc = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 14), new THREE.MeshStandardMaterial({ roughness: 0.6 }), N);
    disc.instanceMatrix.setUsage(THREE.DynamicDrawUsage); G.patch.add(disc);
    const org = [];
    let seed = 9; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
      const k = (i + 2 * j) % 3, u = (i + 0.5) / NX, v = (j + 0.5) / NZ;
      org.push({ k, u, v, x: P0.x + (i + 0.5 + (rnd() - 0.5) * 0.6) * SP, z: P0.z + (j + 0.5 + (rnd() - 0.5) * 0.6) * (PD / NZ), y: 1.0 + 0.004 * k, a: 0.3, n: rnd() * 9 });
      disc.setColorAt(org.length - 1, new THREE.Color().setRGB(...PIG['yrb'[k]], THREE.SRGBColorSpace));
    }
    disc.instanceColor.needsUpdate = true;
    const papM = new THREE.InstancedMesh(new THREE.ConeGeometry(0.16, 0.5, 10), M.plastic(0xc9a08a, { transparent: true, opacity: 0.75 }), 40); G.patch.add(papM);
    const papAt = Array.from({ length: 40 }, () => [P0.x + 0.3 + rnd() * (PW - 0.6), P0.z + 0.3 + rnd() * (PD - 0.6), 0.6 + rnd() * 0.6]);
    const lp = { size: L('Patch drawn for clarity: 1,836 chromatophores', [0.9, 0.95, PD / 2 + 0.35], G.patch) };
    // ---- board
    const cur = { t: 0, hist: [], meas: null, rate: 0, rgb: [0.5, 0.5, 0.5], preset: 'mottle' };
    const chart = board(root, 4.4, 3.4, 740, 580, (g, w, h) => {
      panel(g, w, h);
      if (cur.focus === 'one') {
        head(g, 'One sac, opening and closing', 'Size of the pigment disc over the last 3 seconds');
        const x0 = 70, x1 = w - 30, y0 = 420, y1 = 100, X = (tt) => x1 - (x1 - x0) * tt / 3, Y = (d) => y0 - (y0 - y1) * (d - 50) / 280;
        g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.moveTo(x0, y0); g.lineTo(x0, y1); g.stroke();
        [100, 200, 300].forEach((d) => txt(g, d + ' µm', 8, Y(d) + 6, COL.soft, '15px sans-serif'));
        txt(g, '3 s ago', x0, y0 + 30, COL.soft, '16px sans-serif'); txt(g, 'now', x1 - 34, y0 + 30, COL.soft, '16px sans-serif');
        g.strokeStyle = COL.hot; g.lineWidth = 4; g.beginPath();
        cur.hist.forEach(([tt, d, sp], i) => { const x = X(cur.t - tt), y = Y(d); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke();
        g.fillStyle = '#ffd84a'; cur.hist.forEach(([tt, d, sp]) => { if (sp) g.fillRect(X(cur.t - tt) - 1, y0 - 18, 3, 14); });
        txt(g, 'yellow ticks: nerve pulses', x0 + 10, y0 + 60, '#ffd84a', '17px sans-serif');
        txt(g, `opens 90% in ${(T90_OPEN * 1000).toFixed(0)} ms · closes 90% in ${(T90_CLOSE * 1000).toFixed(0)} ms`, x0 + 10, y0 + 95, COL.text, 'bold 18px sans-serif');
      } else {
        head(g, 'How long does a change take?', 'Log scale: each step is ten times longer');
        const x0 = 40, x1 = w - 40, X = (s) => x0 + (x1 - x0) * (Math.log10(s) + 1) / 4;  // 0.1 s to 1000 s
        const yb = 160;
        [[0.1, '0.1 s'], [1, '1 s'], [10, '10 s'], [100, '100 s'], [1000, '1,000 s']].forEach(([s, l]) => { g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(X(s), yb - 40, 2, 230); txt(g, l, X(s) - 20, yb + 210, COL.soft, '15px sans-serif'); });
        const tm = cur.meas ?? T90_OPEN;
        g.fillStyle = COL.water; g.fillRect(x0, yb, X(Math.max(0.1, tm)) - x0, 36); txt(g, `Octopus: ${tm.toFixed(2)} s`, x0, yb - 10, COL.water, 'bold 20px sans-serif');
        g.fillStyle = COL.lime; g.fillRect(x0, yb + 100, X(CHAM_S) - x0, 36); txt(g, `Chameleon: about ${CHAM_S} s`, x0, yb + 90, COL.lime, 'bold 20px sans-serif');
        wrap(g, `The octopus is about ${Math.round(CHAM_S / tm)} times faster: muscles pull pigment sacs open, while chameleon cells swell slowly to move crystals.`, 24, yb + 260, w - 48, 24, COL.text, '18px sans-serif');
        swatch(g, cur.rgb, w - 190, 22, 160, 70); txt(g, 'average colour', w - 180, 116, COL.soft, '15px sans-serif');
      }
    }, [5.2, 2.6, -1.5]);
    let tDraw = 0;

    let t = 0, a = 0, phase = 0, burstT = -1, last = '', change = null, cyc = -1;
    const focus = focuser(stage, G, VIEWS), fixView = viewFixer(stage, this.view);
    const o = new THREE.Object3D(), up = new THREE.Vector3(0, 1, 0);
    const self = {
      burst() { burstT = 0; },
      cycle() { cyc = 0; },
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.25); fixView(); focus(s.focus);
        const lay = layoutOf(stage);
        cur.focus = s.focus; cur.t = t;
        if (s.focus === 'one') {
          // Nerve pulses: a steady rate, or a 0.3 s burst at 40 per second.
          let f = s.rate; if (burstT >= 0) { burstT += dt; f = burstT < 0.3 ? 40 : 0; if (burstT > 2.5) burstT = -1; }
          phase += f * dt; const spike = phase >= 1; if (spike) phase %= 1;
          a = stepAct(a, pullOf(f), dt);
          const D = diamOf(a), r = (D / CHR.Dopen) * 0.95;
          sac.scale.set(r, 0.06 + 0.06 * (1 - a), r);
          sacMat.color.setRGB(...PIG[s.pig], THREE.SRGBColorSpace);
          mus.forEach((m, i) => {
            const an = (i / NM) * Math.PI * 2, p0 = new THREE.Vector3(C0.x + Math.cos(an) * r, C0.y, C0.z + Math.sin(an) * r), p1 = new THREE.Vector3(C0.x + Math.cos(an) * RA, C0.y + 0.04, C0.z + Math.sin(an) * RA);
            const len = p0.distanceTo(p1), th = 0.035 + 0.035 * a;
            m.position.copy(p0).add(p1).multiplyScalar(0.5); m.scale.set(th, len, th); m.quaternion.setFromUnitVectors(up, p1.clone().sub(p0).normalize());
          });
          // Pulses ride the nerves toward the muscles.
          for (let i = 0; i < NM; i++) for (let k = 0; k < 3; k++) {
            const q = f > 0 ? (((t * Math.min(f, 12) * 0.25 + k / 3 + i * 0.013) % 1)) : -1;
            const nv = nerves[i]; if (q < 0) o.scale.setScalar(0.001); else { o.position.lerpVectors(nv.p1, nv.p0, q); o.scale.setScalar(1); }
            o.updateMatrix(); pulses.setMatrixAt(i * 3 + k, o.matrix);
          }
          pulses.instanceMatrix.needsUpdate = true;
          nerveMat.opacity = 0.35 + 0.5 * Math.min(1, f / 20);
          cur.hist.push([t, D, spike]); while (cur.hist.length && t - cur.hist[0][0] > 3) cur.hist.shift();
          lo.sac.position.set(C0.x, C0.y + 0.5, C0.z); lo.sac.element.innerHTML = `Pigment sac: <b>${Math.round(D)} µm</b>`;
          lo.mus.position.set(C0.x - 1.4, C0.y + 0.2, C0.z - 1.3);
          lo.irid.visible = lo.leu.visible = lay !== 'narrow';
          cur.rate = f; cur.a = a; cur.D = D;
        } else {
          // Reel: cycle presets every 1.4 s.
          if (cyc >= 0) { cyc += dt; const order = ['bands', 'pale', 'mottle', 'dark']; const want = order[Math.floor(cyc / 1.4) % 4]; if (want !== s.preset) s.preset = want; }
          if (s.preset !== last) { last = s.preset; change = { t0: t, done: false }; paintFloor(s.preset !== 'dark'); }
          let near = 0, cov = [0, 0, 0];
          for (let i = 0; i < N; i++) {
            const p = org[i], tg = target(s.preset, p.k, p.u, p.v, t, p.n);
            p.a = stepAct(p.a, tg, dt);
            if (Math.abs(p.a - tg) < 0.1) near++;
            const r = (diamOf(p.a) / CHR.Dopen) * SP * 0.95;
            cov[p.k] += Math.PI * r * r;
            o.position.set(p.x, p.y, p.z); o.rotation.set(-Math.PI / 2, 0, 0); o.scale.set(r, r, 1); o.updateMatrix(); disc.setMatrixAt(i, o.matrix);
          }
          disc.instanceMatrix.needsUpdate = true;
          if (change && !change.done && near >= 0.9 * N && s.preset !== 'clouds') { change.done = true; cur.meas = Math.max(0.05, t - change.t0); }
          const A = PW * PD;   // classes are spread over the whole patch; overlaps follow 1 − e^(−area/A)
          const leuShare = s.preset === 'dark' ? 0.27 : 0.33;
          cur.cov = cov.map((c) => clamp(1 - Math.exp(-c / A), 0, 1));
          cur.rgb = colourOf({ y: cur.cov[0], r: cur.cov[1], b: cur.cov[2], irid: 1 - leuShare, leuco: leuShare }).rgb;
          papAt.forEach(([x, z, h], i) => { o.position.set(x, 1.0 + 0.25 * h * (s.pap ? 1 : 0.02), z); o.rotation.set(0, 0, 0); o.scale.set(1, (s.pap ? h : 0.02), 1); o.updateMatrix(); papM.setMatrixAt(i, o.matrix); });
          papM.instanceMatrix.needsUpdate = true; papM.visible = s.pap;
          lp.size.visible = lay !== 'narrow';
        }
        fitBoard(stage, chart.mesh, lay === 'tall' ? [0.6, 4.6, -2.5] : [5.6, 2.4, -1.6], lay === 'tall' ? 0.8 : 1);
        chart.mesh.lookAt(stage.camera.position);
        tDraw += dt; if (tDraw > 0.1) { tDraw = 0; chart.redraw(); }
      },
      readout: (s) => {
        if (s.focus === 'one') {
          const D = cur.D ?? CHR.Dclosed, area = (D / CHR.Dclosed) ** 2;
          return `<div class="big">Sac ${Math.round(D)} µm across</div>
            <div class="row"><span>Nerve pulses</span><b>${Math.round(cur.rate || 0)} a second</b></div>
            <div class="row"><span>Muscle pull</span><b>${Math.round((cur.a || 0) * 100)}%</b></div>
            <div class="row"><span>Area compared with closed</span><b>${area.toFixed(1)}×</b></div>
            <div class="row"><span>Time to open · to close (90%)</span><b>${T90_OPEN.toFixed(2)} s · ${T90_CLOSE.toFixed(2)} s</b></div>
            <div class="row"><span>Mirror plates reflect</span><b>${Math.round(plateLambda())} nm, ${bandName(plateLambda())}</b></div>
            <small>Muscles open sacs in 100–300 ms (Senft et al. 2021). Open size about 0.3 mm; closed size illustrative. Plates: λ = 2(1.56 × 90 + 1.33 × 75) nm, after Brocco & Cloney 1980.</small>`;
        }
        const m = cur.meas;
        return `<div class="big">${PRESETS[s.preset]}: <span style="color:${css(cur.rgb)}">${hueName(cur.rgb)}</span></div>
          <div class="row"><span>Change took (90% of sacs)</span><b>${s.preset === 'clouds' ? 'a moving wave' : m ? m.toFixed(2) + ' s' : '…'}</b></div>
          <div class="row"><span>Chameleon, for comparison</span><b>about 1 to 2 minutes</b></div>
          <div class="row"><span>Pigment cover: yellow · red · brown</span><b>${(cur.cov || [0, 0, 0]).map((c) => Math.round(c * 100) + '%').join(' · ')}</b></div>
          <small>All sacs open costs nearly the octopus’s resting energy use (Sonner & Onthank 2024). Chameleon time from Teyssier et al. 2015 coverage.</small>`;
      },
    };
    return self;
  },
};
