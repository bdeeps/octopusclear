// Chapter 6: how people worked out octopus colour. Four scenes:
// 1. Aristotle, History of Animals (book IX in Thompson's translation): the octopus "seeks its prey by
//    so changing its colour as to render it like the colour of the stones adjacent to it; it does so
//    also when alarmed" (read in search results quoting D'Arcy Thompson's translation).
// 2. Sangiovanni 1819 named the colour organs of cephalopods ("cromoforo", later chromatophore) in an
//    Italian science journal (Sereni 1930, Biological Bulletin, and Wikipedia; search summaries).
// 3. J. Z. Young's "The Anatomy of the Nervous System of Octopus vulgaris" (Clarendon Press, Oxford,
//    1971, 690 pages: library record and 1972 Nature review, search summaries). Messenger 2001: optic
//    lobes pick a body pattern; chromatophore lobes (over half a million neurons) carry it out.
// 4. Cephalopod-inspired machines: Morin et al. 2012 (Science 337: 828, microfluidic colour and
//    display for soft robots, Whitesides lab, Harvard); Yu et al. 2014 (PNAS 111: 12998, a flexible
//    sheet of light sensors and black-and-white pixels that matches its surroundings by itself, Rogers
//    and Hanlon); Pikul et al. 2017 (Science 358: 210, silicone skins that inflate into programmed 3D
//    bumps, inspired by papillae, Cornell with Hanlon). Our pixel sheet copies the Yu idea: each pixel
//    reads the brightness under it and switches black or white.
import { THREE, M, approach, clamp, box } from '../kit.js';
import { Octopus, POSES, seaFloor, FLOORS, PIG, layoutOf, reelZoom, focuser, viewFixer, seaLook } from '../octo.js';

const VIEWS = {
  ancient: { pos: [0.6, 3.6, 7.0], target: [0.4, 0.9, 0], narrow: { pos: [0, 4.6, 9.0], target: [0, 0.9, 0] } },
  cells: { pos: [0.4, 5.4, 4.0], target: [0.4, 1.0, 0], narrow: { pos: [0, 6.6, 5.4], target: [0, 0.9, 0] } },
  brain: { pos: [0.6, 2.8, 4.6], target: [0.2, 1.1, 0], narrow: { pos: [0, 3.6, 6.4], target: [0, 1.1, 0] } },
  robots: { pos: [0.4, 4.8, 5.6], target: [0.4, 0.9, 0], narrow: { pos: [0, 6.0, 7.4], target: [0, 0.8, 0] } },
};

export default {
  id: 'history',
  short: 'Working it out',
  title: 'How we worked out octopus colour',
  subtitle: 'From Aristotle’s stones to colour organs, a brain map and robots with skin.',
  view: VIEWS.ancient,
  learn: `<p>Around <b>350 BCE</b> the Greek thinker <b>Aristotle</b> watched octopuses on the island of Lesbos. He wrote that the octopus hunts by changing its colour to match the <b>stones</b> beside it, and does the same when alarmed. He was right.</p>
    <p>In <b>1819</b> the Italian naturalist <b>Giosuè Sangiovanni</b> looked at cephalopod skin closely and described the tiny colour organs. His name for them became <b>chromatophore</b>, “colour carrier”. Later scientists found that, unlike the colour cells of fish or lizards, these are <b>organs with muscles and nerves</b>. ChameleonClear tells the lizard side of the story (<a href="/chameleonclear/#history">ChameleonClear</a>).</p>
    <p>In the twentieth century the British biologist <b>J. Z. Young</b> spent decades mapping the octopus nervous system. His <b>1971</b> atlas of the brain of <i>Octopus vulgaris</i> runs to nearly 700 pages. We now know that big <b>optic lobes</b> behind the eyes choose a body pattern from what the eyes see, and <b>chromatophore lobes</b>, with over half a million nerve cells, fire the muscles that draw it. <b>Roger Hanlon</b> and <b>John Messenger</b> then showed how cuttlefish and octopus use those patterns to hide and to talk.</p>
    <p>Engineers are copying the trick. In 2012 a Harvard team gave soft robots coloured fluid channels for camouflage. In 2014 a sheet of tiny light sensors and pixels learned to match the pattern beneath it by itself. In 2017 silicone skins inflated into bumps, like papillae.</p>
    <p class="tip"><b>Try it:</b> move Aristotle’s octopus onto pale and dark stones, look through Sangiovanni’s lens, light up Young’s brain map, and slide the robot skin over a pattern.</p>`,
  terms: [
    { t: 'History of Animals', d: 'Aristotle’s great book of animal observations, written in the 300s BCE.' },
    { t: 'Optic lobe', d: 'A large part of the octopus brain behind each eye that handles vision and picks body patterns.' },
    { t: 'Chromatophore lobe', d: 'The part of the brain whose nerve cells fire the chromatophore muscles.' },
    { t: 'Soft robot', d: 'A robot made of flexible materials, like rubber, instead of rigid metal.' },
  ],
  defaults: { focus: 'ancient', stone: 0, slide: 0, inflate: 0 },
  onChange(s, key) { if (key === 'stone') s.focus = 'ancient'; if (key === 'slide' || key === 'inflate') s.focus = 'robots'; },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'ancient', label: 'Aristotle' }, { v: 'cells', label: 'Sangiovanni, 1819' }, { v: 'brain', label: 'Young’s brain map' }, { v: 'robots', label: 'Robot skins' }] },
    { key: 'stone', type: 'range', label: 'Stones beside the octopus', min: 0, max: 1, step: 0.01, ends: ['pale', 'dark'], fmt: (v) => Math.round(v * 100) + '% dark' },
    { key: 'slide', type: 'range', label: 'Slide the pixel sheet over the pattern', min: 0, max: 1, step: 0.01, fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'inflate', type: 'range', label: 'Inflate the papilla skin', min: 0, max: 1, step: 0.01, fmt: (v) => Math.round(v * 100) + '%' },
  ],
  quiz: [
    { q: 'What did Aristotle notice about octopuses?', options: ['They glow at night', 'They change colour to match nearby stones, to hunt and when alarmed', 'They have three hearts', 'They are colour-blind'], answer: 1, why: 'His History of Animals describes octopuses matching the colour of the stones beside them.' },
    { q: 'What does the word chromatophore mean?', options: ['Colour carrier', 'Light eater', 'Muscle bag', 'Ink maker'], answer: 0, why: 'From Greek roots for colour and bearing; Sangiovanni named the organs in 1819.' },
    { q: 'What did the 2014 camouflage sheet do?', options: ['Glowed in the dark', 'Sensed the pattern under it and switched its pixels to match', 'Changed temperature', 'Swam'], answer: 1, why: 'Yu and colleagues built a flexible sheet whose light sensors drove black-and-white pixels to match the surroundings.' },
  ],
  reel: [
    { ms: 4800, caption: 'About 350 BCE, Aristotle wrote that octopuses change colour to match the stones around them.', set: { focus: 'ancient' }, anim: { stone: [0, 1] }, view: { pos: [0.4, 3.2, 5.2], target: [0.3, 0.9, 0] }, spin: 0.25 },
    { ms: 4800, caption: 'Engineers now build skins of tiny sensors and pixels that match what lies beneath.', set: { focus: 'robots', inflate: 0.6 }, anim: { slide: [0, 1] }, view: { pos: [0.4, 6.4, 3.2], target: [0.4, 0.7, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    seaLook(stage, 0x0b1a20);
    const G = { ancient: new THREE.Group(), cells: new THREE.Group(), brain: new THREE.Group(), robots: new THREE.Group() }; for (const k in G) root.add(G[k]);
    const L = (h, p, par, c = '') => stage.label(h, p, par, c);
    // Ancient: an octopus amid stones whose shade you set.
    const fl = seaFloor(G.ancient, 20); fl.paint(FLOORS.sand);
    const stones = [];
    let seed = 2; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 16; i++) { const a = rnd() * 6.28, d = 1.6 + rnd() * 2.6, m = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25 + rnd() * 0.35, 1), M.matte(0xffffff)); m.position.set(Math.cos(a) * d, 0.15, Math.sin(a) * d); m.scale.y = 0.6; m.castShadow = true; G.ancient.add(m); stones.push(m); }
    const oa = new Octopus(); oa.group.scale.setScalar(0.85); G.ancient.add(oa.group);
    L('Aristotle: it changes colour “like the colour of the stones adjacent to it”', [0.3, 2.6, 0], G.ancient, 'hot');
    // Cells: a magnified view through a lens: a field of chromatophores pulsing.
    const lens = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.12, 12, 64), M.metal(0xc8a050)); lens.rotation.x = Math.PI / 2; lens.position.set(0.4, 1.0, 0); G.cells.add(lens);
    const glass = new THREE.Mesh(new THREE.CircleGeometry(2.0, 64), M.matte(0xf3e0cf)); glass.rotation.x = -Math.PI / 2; glass.position.set(0.4, 0.98, 0); G.cells.add(glass);
    const NC = 90, dots = new THREE.InstancedMesh(new THREE.CircleGeometry(1, 16), new THREE.MeshStandardMaterial({ roughness: 0.6 }), NC); G.cells.add(dots);
    const dotAt = []; for (let i = 0; i < NC; i++) { const r = Math.sqrt(rnd()) * 1.8, a = rnd() * 6.28; dotAt.push([0.4 + r * Math.cos(a), r * Math.sin(a), rnd() * 6]); dots.setColorAt(i, new THREE.Color().setRGB(...PIG['yrb'[i % 3]], THREE.SRGBColorSpace)); }
    dots.instanceColor.needsUpdate = true;
    L('Sangiovanni, 1819: “cromoforo”, colour carriers', [0.4, 1.2, 2.4], G.cells, 'hot');
    // Brain: a big X-ray octopus head.
    const ob = new Octopus({ papillae: false }); ob.xray(true); G.brain.add(ob.group);
    const lb = { opt: L('Optic lobes: choose the pattern', [0.6, 1.7, 0.9], G.brain, 'hot'), chr: L('Chromatophore lobes: over half a million cells fire the muscles', [0.2, 0.55, 0.8], G.brain), arms: L('Nerves run on to the skin', [1.8, 0.35, 1.2], G.brain) };
    // Robots: a patterned floor and a sheet of 10×10 pixels sliding over it, plus inflatable bumps.
    const pat = new THREE.Group(); G.robots.add(pat);
    const cells = [];
    for (let i = 0; i < 20; i++) for (let j = 0; j < 10; j++) { const dark = ((Math.floor(i / 2) + Math.floor(j / 2)) % 2 === 0) !== (i > 12 && j > 4); const b = box(0.3, 0.04, 0.3, M.matte(dark ? 0x1a1a1a : 0xf0f0ea)); b.position.set(-2.6 + i * 0.3, 0.6, -1.35 + j * 0.3); pat.add(b); cells.push({ b, dark }); }
    const sheet = new THREE.Group(); G.robots.add(sheet);
    const pix = [];
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { const b = box(0.27, 0.03, 0.27, M.matte(0x808080)); b.position.set(i * 0.3, 0.68, -1.05 + j * 0.3); sheet.add(b); pix.push(b); }
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.02, 2.45), M.clear(0xbfe8ff, 0.25)); frame.position.set(1.05, 0.66, 0); sheet.add(frame);
    const bumps = []; for (let k = 0; k < 6; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.clear(0xe8e0d8, 0.7)); b.position.set(-2.2 + k * 0.85, 0.62, 1.35); G.robots.add(b); bumps.push(b); }
    L('Pixels read the pattern below and switch to match (after Yu et al. 2014)', [0.4, 1.4, -1.6], G.robots, 'hot'); L('Inflatable “papilla” skin (after Pikul et al. 2017)', [0.2, 1.3, 1.8], G.robots);
    let t = 0, st = 0, sl = 0, inf = 0;
    const focus = focuser(stage, G, VIEWS), fixView = viewFixer(stage, this.view);
    const col = new THREE.Color(), o = new THREE.Object3D();
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.25); fixView(); focus(s.focus);
        const narrow = layoutOf(stage) === 'narrow';
        if (s.focus === 'ancient') {
          st = approach(st, s.stone, 3, dt);
          const g0 = 0.85 - 0.72 * st; stones.forEach((m) => m.material.color.setRGB(g0, g0 * 0.97, g0 * 0.92, THREE.SRGBColorSpace));
          const b = [0.15 + 0.6 * (1 - st), 0.12 + 0.55 * (1 - st), 0.1 + 0.48 * (1 - st)];
          if (Math.abs(st - (oa._st ?? -1)) > 0.01) { oa._st = st; oa.paint({ mode: 'mottle', base: b, light: b.map((v) => v * 1.2), dark: b.map((v) => v * 0.5), grain: 0.5, contrast: 0.45 }); }
          oa.pose(t, POSES.sit, dt);
        }
        if (s.focus === 'cells') {
          dotAt.forEach(([x, z, ph], i) => { const k = 0.5 + 0.5 * Math.sin(t * 2.2 + ph), r = 0.05 + 0.13 * k; o.position.set(x, 1.0 + 0.004 * (i % 3) + 0.0001 * i, z); o.rotation.set(-Math.PI / 2, 0, 0); o.scale.set(r, r, 1); o.updateMatrix(); dots.setMatrixAt(i, o.matrix); });
          dots.instanceMatrix.needsUpdate = true;
        }
        if (s.focus === 'brain') { ob.pose(t, POSES.sit, dt); ob.brain.children.forEach((m, i) => (m.material.opacity = 0.6 + 0.4 * Math.sin(t * 4 + i))); lb.arms.visible = !narrow; }
        if (s.focus === 'robots') {
          sl = approach(sl, s.slide, 4, dt); inf = approach(inf, s.inflate, 4, dt);
          sheet.position.x = -2.6 + sl * 3.6;
          // Each pixel samples the floor cell under its centre (with a short lag, like the real sheet's ~1 s response).
          pix.forEach((p, i) => {
            const wx = sheet.position.x + p.position.x, wz = p.position.z;
            const ci = Math.round((wx + 2.6) / 0.3), cj = Math.round((wz + 1.35) / 0.3);
            const c = ci >= 0 && ci < 20 && cj >= 0 && cj < 10 ? cells[ci * 10 + cj] : null;
            const want = c ? (c.dark ? 0.1 : 0.92) : 0.5;
            p.userData.v = approach(p.userData.v ?? 0.5, want, 9, dt); p.material.color.setRGB(p.userData.v, p.userData.v, p.userData.v, THREE.SRGBColorSpace);
          });
          bumps.forEach((b, k) => b.scale.set(1, Math.max(0.05, inf * (0.7 + 0.3 * Math.sin(k))), 1));
        }
      },
      readout: (s) => {
        if (s.focus === 'ancient') return `<div class="big">c. 350 BCE</div><div class="row"><span>Who</span><b>Aristotle, on Lesbos</b></div><div class="row"><span>Saw</span><b>colour matched to nearby stones</b></div><div class="row"><span>When</span><b>hunting, and when alarmed</b></div><small>History of Animals, book IX (D’Arcy Thompson’s translation).</small>`;
        if (s.focus === 'cells') return `<div class="big">1819: colour carriers</div><div class="row"><span>Who</span><b>Giosuè Sangiovanni, Italy</b></div><div class="row"><span>Named</span><b>“cromoforo”, now chromatophore</b></div><small>Later work showed each is an organ of pigment sac, muscles and nerves (Messenger 2001).</small>`;
        if (s.focus === 'brain') return `<div class="big">1971: a brain atlas</div><div class="row"><span>Who</span><b>J. Z. Young, London</b></div><div class="row"><span>Book</span><b>about 690 pages</b></div><div class="row"><span>Chromatophore lobes</span><b>over half a million cells</b></div><small>Optic lobes select the pattern; chromatophore lobes carry it out (Messenger 2001).</small>`;
        return `<div class="big">Skins for machines</div><div class="row"><span>2012</span><b>coloured fluid channels in soft robots</b></div><div class="row"><span>2014</span><b>self-matching pixel sheet</b></div><div class="row"><span>2017</span><b>silicone that inflates into bumps</b></div><small>Morin et al. 2012; Yu et al. 2014; Pikul et al. 2017.</small>`;
      },
    };
  },
};
