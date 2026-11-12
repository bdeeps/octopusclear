// Chapter 1: meet an octopus. A generic common octopus (Octopus vulgaris-like) on the sea floor, with
// its mantle, eight arms with suckers, siphon and slit-pupil eyes, and beside it a block of its skin cut
// open in layers (SkinSlab in octo.js). X-ray shows the brain and the nerve cords running down the arms.
// Numbers:
//  - About 500 million neurons in an octopus (Orvis et al. 2022, PNAS 119: e2122301119, abstract:
//    "Octopus (500 million neurons)"). About two-thirds of them lie in the arms (Hochner 2012, Current
//    Biology, as cited in later papers; search summaries put it at ~350 of ~500 million, after Young 1963).
//  - Over half a million neurons in the chromatophore lobes of the brain alone (Messenger 2001 abstract).
//  - Slit pupil kept level by the statocysts (Wells 1960; Fraser & Wells 1961; search summary).
//  - Three hearts and copper-based blue blood (haemocyanin): standard textbook facts, from memory.
import { THREE, M, approach, beam } from '../kit.js';
import { toast } from '../ui.js';
import { Octopus, SkinSlab, LAYERS, POSES, seaFloor, FLOORS, layoutOf, reelZoom, viewFixer, seaLook } from '../octo.js';

const OX = -1.3, SX = 2.3, SY = 2.0;
const INFO = {
  mantle: 'The <b>mantle</b> is the bag behind the head. It holds the gills, three hearts and the gut. Squeezing water out of it through the siphon jets the octopus backwards.',
  head: 'The <b>head</b> carries the eyes and wraps round the brain. The brain sits in a ring around the gullet, so food passes through the middle of it.',
  eye: 'Each eye has a <b>slit pupil</b> that the octopus keeps level using balance organs called statocysts, however it tilts. The eye has just one kind of light sensor.',
  siphon: 'The <b>siphon</b> (funnel) shoots water for jet swimming, breathing and squirting ink.',
  arm: 'Each <b>arm</b> has two rows of suckers that grip and taste. Most of the octopus’s nerve cells are in its arms.',
};

export default {
  id: 'anatomy',
  short: 'Meet an octopus',
  title: 'Meet an octopus',
  subtitle: 'Eight clever arms, a big brain, slit-pupil eyes and skin built like a screen.',
  view: { pos: [1.15, 3.0, 7.4], target: [1.15, 1.45, 0], narrow: { pos: [-0.3, 3.6, 8.2], target: [-0.3, 1.3, 0] } },
  learn: `<p>This is a generic <b>common octopus</b>, the kind found on rocky coasts from the Mediterranean to the Indian Ocean. It has no bones at all. Behind its head is the soft <b>mantle</b>, a bag that holds the gills, <b>three hearts</b> and the gut. On the side is the <b>siphon</b>, a funnel that squirts water for jet swimming, a stronger cousin of a jellyfish’s pulse (<a href="/jellyfishclear/#pulse">JellyfishClear</a>) and nothing like a fish’s swishing tail (<a href="/fishswimclear/#wave">FishSwimClear</a>).</p>
    <p>Its <b>eight arms</b> each carry two rows of <b>suckers</b> that can grip, feel and even taste. Its eyes are large, with a <b>slit pupil</b> that stays level however the animal tilts.</p>
    <p>An octopus has about <b>500 million nerve cells</b>, as many as some dogs. Only about a third are in the brain. About <b>two-thirds are in the arms</b>, so each arm can do a lot on its own. (Compare a human brain in <a href="/brainclear/">BrainClear</a>.)</p>
    <p>Now look at the <b>skin</b>. Just under the surface are thousands of <b>chromatophores</b>: tiny elastic bags of yellow, red or brown pigment, each ringed by muscles wired to the brain. Below them sit <b>iridophores</b>, stacks of thin plates that reflect blue-green light, and <b>leucophores</b>, white cells that scatter every colour. Deeper still are muscles that push up bumps called <b>papillae</b>. Together they work like a living screen. Your own skin has only one colour trick, the pigment melanin, which takes days to build up (<a href="/skinclear/#colour">SkinClear</a>).</p>
    <p class="tip"><b>Try it:</b> pull the skin layers apart, switch on X-ray to see the brain and the nerves in the arms, then raise the papillae. Tap a body part to learn more.</p>`,
  terms: [
    { t: 'Mantle', d: 'The soft bag behind an octopus’s head that holds its gills, hearts and gut.' },
    { t: 'Siphon', d: 'A funnel that squirts water out of the mantle, for jet swimming and breathing.' },
    { t: 'Chromatophore', d: 'In an octopus, a small elastic bag of pigment pulled open by a ring of tiny muscles.' },
    { t: 'Iridophore', d: 'A cell with stacks of very thin plates that reflect one colour of light, like a soap film.' },
    { t: 'Leucophore', d: 'A white cell that scatters all colours of light equally.' },
    { t: 'Papilla', d: 'A bump in the skin that muscles can raise or flatten to change texture.' },
  ],
  defaults: { explode: 0.35, xray: false, pap: 0 },
  controls: [
    { key: 'explode', type: 'range', label: 'Pull the skin layers apart', min: 0, max: 1, step: 0.01, ends: ['together', 'apart'], fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'xray', type: 'toggle', label: 'X-ray: brain and arm nerves' },
    { key: 'pap', type: 'range', label: 'Raise the papillae', min: 0, max: 1, step: 0.01, ends: ['smooth', 'bumpy'], fmt: (v) => Math.round(v * 100) + '%' },
  ],
  quiz: [
    { q: 'Where are most of an octopus’s nerve cells?', options: ['In its brain', 'In its arms', 'In its eyes', 'In its mantle'], answer: 1, why: 'About two-thirds of its roughly 500 million nerve cells are in the arms.' },
    { q: 'What is a chromatophore in an octopus?', options: ['A crystal that reflects light', 'An elastic bag of pigment ringed by tiny muscles', 'A light-making organ', 'A kind of sucker'], answer: 1, why: 'Each chromatophore is a pigment sac that radial muscles pull open on a nerve signal.' },
    { q: 'What do leucophores do?', options: ['Make the skin black', 'Scatter all colours, so they look white', 'Reflect only blue', 'Raise bumps'], answer: 1, why: 'Leucophores scatter every colour equally, so they look white in white light.' },
  ],
  reel: [
    { ms: 5200, caption: 'An octopus has eight arms, three hearts and about 500 million nerve cells, most of them in its arms.', set: { explode: 0, xray: true, pap: 0 }, anim: {}, view: { pos: [0.6, 4.4, 8.6], target: [-0.9, 1.2, 0] }, spin: 0.3 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    seaLook(stage);
    const floor = seaFloor(root, 26); floor.paint(FLOORS.gravel);
    const oc = new Octopus(); oc.group.position.set(OX, 0, 0); oc.group.rotation.y = -0.5; oc.group.scale.setScalar(1.15); root.add(oc.group);
    oc.paint({ mode: 'mottle', base: [0.62, 0.36, 0.26], contrast: 0.45, grain: 0.45 });
    const slab = new SkinSlab({ W: 2.0, D: 1.3 }); slab.group.position.set(SX, SY, 0); slab.group.rotation.y = -0.4; root.add(slab.group);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.24, 0.29, 40), M.glow(0x8ef0ff, { transparent: true, opacity: 0.8, side: THREE.DoubleSide })); root.add(ring);
    const L = (h, p, c = '') => stage.label(h, p, root, c);
    const tags = { mantle: L('Mantle', [0, 0, 0]), eye: L('Slit-pupil eye', [0, 0, 0], 'hot'), siphon: L('Siphon', [0, 0, 0]), arm: L('Arm with suckers', [0, 0, 0]), skin: L('Skin, cut open', [SX, SY + 0.8, 0], 'hot'), brain: L('Brain', [0, 0, 0], 'hot'), nerve: L('Nerve cord in each arm', [0, 0, 0]) };
    const ltags = LAYERS.map((ly) => L(ly.short, [0, 0, 0], ly.id === 'chr' ? 'hot' : ''));
    const pick = new Map(); oc.meshes.forEach((m) => { stage.pickables.push(m); pick.set(m, m.userData.kind); });
    const wp = (obj, v = new THREE.Vector3()) => obj.getWorldPosition(v);
    let t = 0, ex = 0, pap = 0, lead = null;
    const fixView = viewFixer(stage, this.view);
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.8); fixView();
        ex = approach(ex, s.explode, 5, dt); slab.explode(ex);
        pap = approach(pap, s.pap, 4, dt); slab.setPap(pap); oc.setPapillae(pap);
        slab.setOpen(0.5 + 0.35 * Math.sin(t * 1.3), t);
        oc.xray(s.xray); oc.pose(t, POSES.rest, dt);
        oc.body.rotation.y = 0.05 * Math.sin(t * 0.6);
        // Labels
        const narrow = layoutOf(stage) === 'narrow';
        tags.mantle.position.copy(wp(oc.mantle)).add(new THREE.Vector3(-0.3, 0.9, 0));
        tags.eye.position.copy(wp(oc.eyes[0].g)).add(new THREE.Vector3(0.4, 0.45, 0.3));
        tags.siphon.position.copy(wp(oc.siphon)).add(new THREE.Vector3(-0.2, -0.35, 0.5));
        tags.arm.position.copy(oc.group.localToWorld(oc.arms[6].pts[30].clone())).add(new THREE.Vector3(0, 0.45, 0));
        tags.brain.position.copy(wp(oc.head)).add(new THREE.Vector3(0.1, 0.6, 0)); tags.brain.visible = s.xray;
        tags.nerve.position.copy(oc.group.localToWorld(oc.arms[2].pts[22].clone())).add(new THREE.Vector3(0, 0.35, 0)); tags.nerve.visible = s.xray && !narrow;
        tags.siphon.visible = tags.arm.visible = !narrow && !s.xray;
        const m = oc.group.localToWorld(new THREE.Vector3(-0.55, 1.75, 0.62)); ring.position.copy(m); ring.lookAt(stage.camera.position);
        if (!lead) { lead = beam([m.x, m.y, m.z], [SX - 1.3, SY - 0.3, 0.2], 0.012, M.glow(0x8ef0ff, { transparent: true, opacity: 0.5 })); root.add(lead); }
        LAYERS.forEach((ly, i) => { const lg = slab.layers[ly.id]; ltags[i].position.set(SX + 1.05, SY + lg.position.y, 0.7); ltags[i].visible = !narrow && ex > 0.15; });
      },
      readout: (s) => (s.xray
        ? `<div class="big">About 500 million nerve cells</div>
          <div class="row"><span>In the arms</span><b>about two-thirds</b></div>
          <div class="row"><span>Brain</span><b>a ring round the gullet</b></div>
          <div class="row"><span>Brain lobes driving colour cells</span><b>over half a million cells</b></div>
          <small>Orvis et al. 2022; Hochner 2012; Messenger 2001 (Octopus vulgaris chromatophore lobes).</small>`
        : `<div class="big">A common octopus</div>
          <div class="row"><span>Arms</span><b>8, each with two rows of suckers</b></div>
          <div class="row"><span>Hearts</span><b>3</b></div>
          <div class="row"><span>Pupil</span><b>a slit, kept level</b></div>
          <div class="row"><span>Skin colour parts</span><b>pigment sacs, mirrors, white cells</b></div>
          <small>Tap a body part. The skin block shows the layers from top to bottom.</small>`),
      pick(o) { const k = pick.get(o); if (k && INFO[k]) toast(INFO[k]); },
    };
  },
};
