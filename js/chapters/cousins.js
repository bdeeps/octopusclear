// Chapter 4: cousins. A short contrast of the three coleoid cephalopods that change colour, with the
// Indian species most often landed. Details belong to the sibling boxes CuttlefishClear and SquidClear.
//  - All three use the same neuromuscular chromatophores (Messenger 2001). Octopus and cuttlefish
//    have white leucophores; squid generally do not, and some squid iridophores are switched on and off
//    by nerves (Mäthger, Denton, Marshall & Hanlon 2009, J R Soc Interface, abstract).
//  - Cuttlefish and octopus also have skin papillae driven by a muscular hydrostat system
//    (Gonzalez-Bellido et al. 2018, iScience 2: 24, abstract).
//  - India: the Indian squid Uroteuthis (Photololigo) duvaucelii and the pharaoh cuttlefish Sepia
//    pharaonis lead Indian cephalopod landings (CMFRI data for 1990–94: L. duvauceli over a third, with
//    S. pharaonis and S. aculeata 84% together; Karnataka 2015: U. duvaucelii 67.1%, S. pharaonis
//    21.7%; search summaries of CMFRI publications).
import { THREE, M, approach } from '../kit.js';
import { Octopus, POSES, cuttlefish, squid, patternSkin, seaFloor, FLOORS, board, panel, head, txt, COL, layoutOf, reelZoom, viewFixer, fitBoard, seaLook } from '../octo.js';

const LOOKS = {
  hide: { oc: { mode: 'mottle', base: [0.6, 0.52, 0.4], grain: 0.4, contrast: 0.5 }, cu: { mode: 'disruptive', base: [0.55, 0.45, 0.34] }, sq: { mode: 'uniform', base: [0.85, 0.75, 0.68], contrast: 0.05 } },
  talk: { oc: { mode: 'uniform', base: [0.35, 0.12, 0.08], contrast: 0.1 }, cu: { mode: 'cloud', base: [0.85, 0.75, 0.6], dark: [0.25, 0.12, 0.06] }, sq: { mode: 'bands', base: [0.8, 0.5, 0.4], dark: [0.55, 0.15, 0.1] } },
};

export default {
  id: 'cousins',
  short: 'Cuttlefish and squid',
  title: 'Cousins: cuttlefish and squid',
  subtitle: 'The same muscle-driven colour cells, used three different ways.',
  view: { pos: [0.9, 4.4, 11.2], target: [0.9, 1.3, 0], narrow: { pos: [0, 6.2, 13], target: [0, 1.1, 0] } },
  learn: `<p>Octopuses have two close cousins that change colour the same way: <b>cuttlefish</b> and <b>squid</b>. All three use <b>chromatophores</b> pulled open by muscles and wired to the brain. What differs is how they live.</p>
    <p>The <b>octopus</b> crawls over rocks and hides in dens, so it has white <b>leucophores</b> and bumpy <b>papillae</b> for close matching. The <b>cuttlefish</b> hovers just above the sea floor and is the champion of disruptive disguise: a pale square, bands and dark lines, plus waves of colour when it hunts or shows off. The <b>squid</b> lives in open water. It mostly lacks white cells, and some of its mirror cells can be switched on and off by nerves, making shimmering colours.</p>
    <p>In India, the <b>Indian squid</b> (<i>Uroteuthis duvaucelii</i>) and the <b>pharaoh cuttlefish</b> (<i>Sepia pharaonis</i>) are the cephalopods fishers land most, far more than octopus.</p>
    <p>Each has its own box: <a href="/cuttlefishclear/">CuttlefishClear</a> for the cuttlefish’s skin tricks and <a href="/squidclear/">SquidClear</a> for squid shimmer and glow.</p>
    <p class="tip"><b>Try it:</b> switch between hiding and signalling and compare the three.</p>`,
  terms: [
    { t: 'Cephalopod', d: 'The group of molluscs with arms on the head: octopus, cuttlefish, squid and nautilus.' },
    { t: 'Cuttlebone', d: 'The light internal shell of a cuttlefish that helps it float.' },
    { t: 'Fin', d: 'The flap along a cuttlefish’s or squid’s body that ripples or flaps for swimming.' },
  ],
  defaults: { look: 'hide' },
  controls: [
    { key: 'look', type: 'seg', label: 'Show', options: [{ v: 'hide', label: 'Hiding' }, { v: 'talk', label: 'Signalling' }] },
  ],
  quiz: [
    { q: 'What do octopus, cuttlefish and squid share?', options: ['A hard outer shell', 'Muscle-driven chromatophores wired to the brain', 'Lungs', 'Crystal cells that swell like a chameleon’s'], answer: 1, why: 'All three coleoid cephalopods use neuromuscular chromatophores.' },
    { q: 'Which cephalopods do Indian fishers land most?', options: ['Giant squid', 'The Indian squid and the pharaoh cuttlefish', 'Blue-ringed octopuses', 'Nautilus'], answer: 1, why: 'CMFRI data show Uroteuthis duvaucelii and Sepia pharaonis leading the cephalopod catch.' },
    { q: 'Which of the three mostly lacks white leucophores?', options: ['Octopus', 'Cuttlefish', 'Squid', 'All of them'], answer: 2, why: 'Squid generally have iridophores but not the broadband white leucophores of octopus and cuttlefish.' },
  ],
  reel: [
    { ms: 4800, caption: 'Cuttlefish and squid use the same muscle-driven colour cells, in their own ways.', set: { look: 'talk' }, anim: {}, view: { pos: [0.2, 4.2, 7.0], target: [0.0, 3.0, 0] }, spin: 0.15 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    seaLook(stage, 0x072029);
    const floor = seaFloor(root, 28); floor.paint(FLOORS.sand);
    const oc = new Octopus({ papillae: true }); oc.group.scale.setScalar(0.75); oc.group.position.set(-3.2, 0, 0.6); oc.group.rotation.y = 0.2; root.add(oc.group);
    const cuS = patternSkin(LOOKS.hide.cu), sqS = patternSkin(LOOKS.hide.sq);
    const cu = cuttlefish(cuS.mat); cu.position.set(0.3, 0.75, 0.6); cu.rotation.y = 0.15; root.add(cu);
    const sq = squid(sqS.mat); sq.position.set(3.4, 1.9, 0.2); sq.rotation.y = 0.25; sq.scale.setScalar(0.85); root.add(sq);
    const L = (h, p, c = '') => stage.label(h, p, root, c);
    const tags = [L('Octopus', [-3.2, 2.2, 0.6], 'hot'), L('Cuttlefish', [0.6, 1.9, 0.6], 'hot'), L('Squid', [3.5, 3.0, 0.2], 'hot')];
    const chart = board(root, 5.2, 2.9, 860, 480, (g, w, h) => {
      panel(g, w, h); head(g, 'Three ways to use the same skin');
      const rows = [['', 'Octopus', 'Cuttlefish', 'Squid'], ['Lives', 'on the bottom', 'just above it', 'open water'], ['White cells', 'yes', 'yes', 'mostly no'], ['Papillae', 'yes', 'yes', 'no'], ['Nerve-switched mirrors', 'no', 'no', 'some'], ['Top Indian catch', 'small share', 'pharaoh cuttlefish', 'Indian squid']];
      rows.forEach((r, i) => r.forEach((c, j) => txt(g, c, 24 + [0, 250, 440, 660][j], 96 + i * 60, i === 0 || j === 0 ? COL.hot : COL.text, (i === 0 ? 'bold ' : '') + '21px sans-serif')));
    }, [0.4, 4.0, -2.5]);
    let t = 0, last = '';
    const fixView = viewFixer(stage, this.view);
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.2); fixView();
        const lay = layoutOf(stage), Lk = LOOKS[s.look];
        if (s.look !== last || s.look === 'talk') { last = s.look; oc.paint(Lk.oc, t); cuS.paint(Lk.cu, t); sqS.paint(Lk.sq, t); }
        oc.pose(t, s.look === 'talk' ? POSES.lion : POSES.sit, dt);
        oc.setPapillae(s.look === 'hide' ? 0.7 : 0);
        // In the tall video frame, stack them: squid high in open water, cuttlefish hovering, octopus on the floor.
        const tall = lay === 'tall';
        oc.group.position.set(tall ? -0.6 : -3.2, 0, tall ? 1.2 : 0.6);
        cu.position.set(tall ? 0.2 : 0.3, (tall ? 2.6 : 0.75) + 0.06 * Math.sin(t * 1.4), tall ? 0.2 : 0.6); cu.rotation.z = 0.03 * Math.sin(t);
        sq.position.set((tall ? -0.6 : 3.4) + 0.2 * Math.sin(t * 0.5), (tall ? 4.9 : 1.9) + 0.12 * Math.sin(t * 0.9), tall ? -0.6 : 0.2);
        tags.forEach((tg, i) => { const o = [oc.group.position, cu.position, sq.position][i]; tg.position.set(o.x + (i === 2 ? 0.1 : 0), o.y + [2.2, 1.15, 1.1][i], o.z); });
        fitBoard(stage, chart.mesh, lay === 'tall' ? [0.3, 7.4, -2.5] : [0.4, 4.1, -2.5], lay === 'tall' ? 0.8 : 1);
        if (t < 0.1) chart.redraw();
      },
      readout: (s) => `<div class="big">${s.look === 'hide' ? 'Hiding' : 'Signalling'}</div>
        <div class="row"><span>Octopus</span><b>${s.look === 'hide' ? 'mottle and bumps' : 'dark, arms spread'}</b></div>
        <div class="row"><span>Cuttlefish</span><b>${s.look === 'hide' ? 'disruptive: pale square' : 'waves of colour'}</b></div>
        <div class="row"><span>Squid</span><b>${s.look === 'hide' ? 'pale, nearly see-through' : 'bands and flashes'}</b></div>
        <small>More in CuttlefishClear and SquidClear.</small>`,
    };
  },
};
