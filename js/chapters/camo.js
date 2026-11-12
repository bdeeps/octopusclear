// Chapter 3: camouflage and signals.
//  - Pattern types: uniform and mottle patterns for background matching, disruptive patterns that break
//    up the outline; "size, contrast and edges of background objects are key visual cues" (Hanlon,
//    Chiao, Mäthger, Barbosa, Buresch & Chubb 2009, Phil Trans R Soc B 364: 429, abstract; building on
//    Hanlon 2007, Current Biology 17: R400). Our rule turns the floor's object size (relative to the
//    octopus) and contrast into a choice: small and faint → uniform; middling → mottle; large,
//    high-contrast objects → disruptive. Real animals mix them (the paper says mottle and disruptive
//    are often mixed), so this rule is a teaching simplification.
//  - Masquerade: looking like an object (weed, rock) rather than like the background; arms raised,
//    papillae up.
//  - Mimic octopus: filmed in Indonesia (Sulawesi and Bali), forages on sand in daylight and
//    impersonates venomous animals: a banded sole (Zebrias), a lionfish (Pterois) and a banded sea snake
//    (Laticauda) (Norman, Finn & Tregenza 2001, Proc R Soc B 268: 1755; abstract and figure captions).
//  - Passing clouds: dark waves running over body and arms; rarely recorded in the wild, and what they
//    do is debated (Frontiers in Physiology 2017 review; cuttlefish work suggests hunting or warning).
//  - The colour-blind paradox: coastal cephalopods have one visual pigment (8 coastal species,
//    λmax 484–505 nm: Chung & Marshall 2016, search summary). Hypotheses: light-sensing skin (Ramirez &
//    Oakley 2015, J Exp Biol 218: 1513: excised O. bimaculoides skin expands chromatophores in light,
//    λmax 480 nm, matching the eye opsin; Kingston et al. 2015 found opsins in squid and cuttlefish
//    chromatophores), chromatic aberration with off-axis pupils (Stubbs & Stubbs 2016, PNAS 113: 8206; a
//    computer model, disputed in a reply letter), or matching brightness, contrast and texture, helped by
//    white cells that reflect whatever light is around. All are hypotheses.
import { THREE, M, approach, clamp } from '../kit.js';
import { Octopus, POSES, FLOORS, seaFloor, board, panel, head, txt, wrap, swatch, COL, css, layoutOf, reelZoom, viewFixer, fitBoard, seaLook, inReel } from '../octo.js';

const MODELS = {
  sole: { pose: 'flat', P: { mode: 'bands', base: [0.6, 0.5, 0.38], dark: [0.25, 0.17, 0.1] }, name: 'a banded sole (flatfish)', why: 'Swims flat over the sand with arms trailing, like a poisonous sole.' },
  lion: { pose: 'lion', P: { mode: 'lion', base: [0.7, 0.45, 0.3], dark: [0.45, 0.16, 0.08] }, name: 'a lionfish', why: 'Spreads striped arms like the venomous spines of a lionfish.' },
  snake: { pose: 'snake', P: { mode: 'snake', base: [0.8, 0.78, 0.7], dark: [0.07, 0.07, 0.08] }, name: 'a banded sea snake', why: 'Hides six arms in a hole and waves two banded arms, like a sea snake.' },
};
function choose(F) {
  // Object size relative to the octopus's pale mantle square (~0.6 of the floor's biggest blobs), and contrast.
  const size = F.grain, con = F.contrast;
  if (size < 0.08 && con < 0.3) return 'uniform';
  if (size > 0.45 && con > 0.7) return 'disruptive';
  return 'mottle';
}
const NAMES = { uniform: 'Uniform', mottle: 'Mottle', disruptive: 'Disruptive', weed: 'Masquerade' };

export default {
  id: 'camo',
  short: 'Hide and show',
  title: 'Camouflage and signals',
  subtitle: 'Three basic disguises, chosen by what the eyes see, plus impersonations and warnings.',
  view: { pos: [0.6, 4.2, 8.2], target: [0.4, 0.9, 0], narrow: { pos: [0, 3.9, 7.4], target: [0, 0.8, 0] } },
  learn: `<p>An octopus can hide on almost any sea floor in under a second. Scientists who filmed thousands of camouflaged octopuses, cuttlefish and squid found that most disguises fall into <b>three types</b>:</p>
    <p><b>Uniform</b>: one even colour, for fine, plain sand. <b>Mottle</b>: small light and dark blotches, for gravel. <b>Disruptive</b>: bold pale patches and dark lines that break up the body’s outline, for big, high-contrast rocks. The octopus chooses by looking at the <b>size, contrast and edges</b> of the things around it. Raised <b>papillae</b> add matching bumps.</p>
    <p>Sometimes it copies an <b>object</b> instead of the background: a clump of weed or a rock. That is <b>masquerade</b>. The <b>mimic octopus</b> of Indonesia goes further. On open sand it impersonates <b>venomous animals</b>: a banded sole, a lionfish or a sea snake, picking the act to suit the threat.</p>
    <p>Colour is also for talking. Waves of dark colour called <b>passing clouds</b> can ripple across the body, perhaps to startle prey or flush it out. Nobody is quite sure.</p>
    <p>Here is the puzzle. An octopus eye has only <b>one kind of light sensor</b>, so it should be <b>colour-blind</b>, yet it matches colours well. Scientists have ideas, not answers: the <b>skin itself may sense light</b>; the odd-shaped <b>pupil</b> might pull colour out of blur; or matching <b>brightness and pattern</b>, with white cells reflecting the light around them, may be enough. (How our eyes see colour with three sensors: <a href="/eyeclear/#colour">EyeClear</a>.)</p>
    <p class="tip"><b>Try it:</b> change the sea floor and watch which disguise the octopus picks. Then try the mimic acts, the passing clouds and the colour-blind puzzle.</p>`,
  terms: [
    { t: 'Background matching', d: 'Looking like the general colour and texture of the background.' },
    { t: 'Disruptive pattern', d: 'Bold patches that break up an animal’s outline so its shape is hard to see.' },
    { t: 'Masquerade', d: 'Looking like a particular object, such as a rock or seaweed, rather than the background.' },
    { t: 'Mimicry', d: 'Copying another kind of animal, often a dangerous one.' },
    { t: 'Photoreceptor', d: 'A light-sensing cell in the eye. Octopuses have one type; we have three for colour.' },
    { t: 'Opsin', d: 'The light-catching protein in photoreceptors. Octopuses have it in their skin too.' },
  ],
  defaults: { act: 'hide', bg: 'gravel', model: 'snake' },
  onChange(s, key) { if (key === 'bg' && s.act !== 'hide' && s.act !== 'blind') s.act = 'hide'; if (key === 'model') s.act = 'mimic'; },
  controls: [
    { key: 'act', type: 'seg', label: 'What the octopus does', options: [{ v: 'hide', label: 'Hide' }, { v: 'mimic', label: 'Mimic' }, { v: 'clouds', label: 'Passing clouds' }, { v: 'blind', label: 'Colour-blind puzzle' }] },
    { key: 'bg', type: 'seg', label: 'Sea floor', options: [{ v: 'sand', label: 'Fine sand' }, { v: 'gravel', label: 'Gravel' }, { v: 'rocks', label: 'Big rocks' }, { v: 'weed', label: 'Seaweed' }] },
    { key: 'model', type: 'seg', label: 'Mimic octopus act', options: [{ v: 'sole', label: 'Flatfish' }, { v: 'lion', label: 'Lionfish' }, { v: 'snake', label: 'Sea snake' }] },
  ],
  quiz: [
    { q: 'Which disguise suits a background of big, high-contrast rocks?', options: ['Uniform', 'Mottle', 'Disruptive', 'Transparent'], answer: 2, why: 'Bold pale patches and dark lines break up the outline against large, contrasting objects.' },
    { q: 'What does the mimic octopus impersonate?', options: ['Sharks and whales', 'Venomous animals such as lionfish and sea snakes', 'Rocks only', 'Other octopuses'], answer: 1, why: 'Norman and colleagues filmed it imitating a banded sole, a lionfish and a sea snake.' },
    { q: 'Why is octopus colour matching a puzzle?', options: ['Octopuses live in the dark', 'Their eyes have only one type of light sensor, so they should be colour-blind', 'They have no eyes', 'Their skin has no pigment'], answer: 1, why: 'With one photoreceptor type they cannot tell colours apart by eye in the usual way. The answer is still being studied.' },
  ],
  reel: [
    { ms: 5000, caption: 'On gravel it mottles. On big rocks it goes disruptive, breaking up its own outline.', set: { act: 'hide', bg: 'gravel' }, act: (s, inst) => inst.later?.('bg', 'rocks', 2.4), anim: {}, view: { pos: [0.4, 3.6, 5.6], target: [0.2, 0.9, 0] }, spin: 0.3 },
    { ms: 5200, caption: 'The mimic octopus hides six arms and waves two banded ones, like a venomous sea snake.', set: { act: 'mimic', model: 'snake', bg: 'sand' }, anim: {}, view: { pos: [0.4, 4.4, 5.6], target: [0.2, 0.4, 0] }, spin: 0.2 },
    { ms: 4800, caption: 'Its eyes have one kind of light sensor, so how it matches colours is still a puzzle.', set: { act: 'blind', bg: 'weed' }, anim: {}, view: { pos: [0.6, 3.6, 6.4], target: [0.4, 0.9, 0] }, spin: 0.2 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    seaLook(stage, 0x07202a);
    const floor = seaFloor(root, 26);
    const oc = new Octopus(); oc.group.rotation.y = -0.4; root.add(oc.group);
    // Rocks for the rocky floor, weed fronds for seaweed.
    const rocks = new THREE.Group(); root.add(rocks);
    let seed = 4; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 9; i++) { const a = rnd() * 6.28, d = 3 + rnd() * 4, r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4 + rnd() * 0.6, 0), M.matte(rnd() < 0.5 ? 0xe8e6df : 0x2a2826)); r.position.set(Math.cos(a) * d, 0.2, Math.sin(a) * d - 1); r.scale.y = 0.6; r.castShadow = true; rocks.add(r); }
    const weed = new THREE.Group(); root.add(weed);
    for (let i = 0; i < 14; i++) { const a = rnd() * 6.28, d = 2.4 + rnd() * 4; const f = new THREE.Mesh(new THREE.ConeGeometry(0.12, 1.6 + rnd() * 1.2, 6), M.matte(0x4c5a26)); f.position.set(Math.cos(a) * d, 0.9, Math.sin(a) * d - 1); f.rotation.z = (rnd() - 0.5) * 0.4; weed.add(f); }
    const L = (h, p, c = '') => stage.label(h, p, root, c);
    const lb = L('', [0, 3.0, 0], 'hot');
    const cur = { act: 'hide', bg: 'gravel' };
    const chart = board(root, 4.6, 3.5, 760, 580, (g, w, h) => {
      panel(g, w, h);
      head(g, 'A colour-blind master of colour?', 'Ideas scientists are testing');
      // What the eye has: one sensor. Two equally bright colours look the same.
      swatch(g, [0.9, 0.78, 0.15], 30, 92, 120, 60); swatch(g, [0.35, 0.62, 1.0], 160, 92, 120, 60);
      swatch(g, [0.72, 0.72, 0.72], 410, 92, 120, 60); swatch(g, [0.72, 0.72, 0.72], 540, 92, 120, 60);
      txt(g, 'what we see', 30, 180, COL.soft, '16px sans-serif'); txt(g, '→ one sensor type sees', 300, 128, COL.text, '15px sans-serif'); txt(g, 'same grey', 410, 180, COL.soft, '16px sans-serif');
      let y = 225;
      const ideas = [
        ['1. Skin that senses light', 'Octopus skin opens its colour sacs in light, even cut off from the eyes and brain, with the same opsin as the eye (Ramirez & Oakley 2015).'],
        ['2. Colour from blur', 'A slit or U-shaped pupil blurs each colour differently; a model shows that could reveal colour (Stubbs & Stubbs 2016). Not yet shown in a live animal.'],
        ['3. Colour may not be needed', 'Matching brightness, contrast and texture may fool most predators, and white cells reflect the colour of the light around them.'],
      ];
      for (const [tt, d] of ideas) { txt(g, tt, 24, y, COL.hot, 'bold 19px sans-serif'); y = wrap(g, d, 24, y + 26, w - 48, 22, COL.text, '17px sans-serif') + 8; }
    }, [5.4, 2.4, -1.5]);
    let drawn = false;

    let t = 0, last = '', pat = null, timer = null;
    const fixView = viewFixer(stage, this.view);
    return {
      later(key, v, sec) { timer = { key, v, at: t + sec }; },
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.3); fixView();
        if (timer && t >= timer.at) { s[timer.key] = timer.v; timer = null; }
        const lay = layoutOf(stage), F = FLOORS[s.bg];
        const key = s.act + s.bg + s.model;
        if (key !== last) { last = key; floor.paint(s.act === 'mimic' ? FLOORS.sand : F); }
        rocks.visible = s.bg === 'rocks' && s.act !== 'mimic'; weed.visible = s.bg === 'weed' && s.act !== 'mimic';
        let pose = POSES.rest, P, pap = 0, text = '';
        if (s.act === 'hide' || s.act === 'blind') {
          const type = s.bg === 'weed' ? 'weed' : choose(F);
          P = { mode: type === 'uniform' ? 'uniform' : type, base: F.base, light: F.light, dark: F.dark, grain: F.grain, contrast: type === 'uniform' ? 0.1 : F.contrast };
          pose = type === 'weed' ? POSES.weed : POSES.sit; pap = type === 'weed' ? 1 : type === 'mottle' ? 0.6 : type === 'disruptive' ? 0.3 : 0.1;
          text = NAMES[type]; cur.type = type;
        } else if (s.act === 'mimic') {
          const md = MODELS[s.model]; pose = POSES[md.pose]; P = md.P; text = 'Impersonating ' + md.name;
        } else {
          P = { mode: 'cloud', base: [0.75, 0.55, 0.4], dark: [0.2, 0.1, 0.05] }; pose = POSES.sit; text = 'Passing clouds';
        }
        // Switch pattern within ~0.3 s: blend by repainting the target once, with a quick fade of the old.
        const pk = JSON.stringify(P);
        if (pk !== pat || s.act === 'clouds') { oc.paint(P, t); pat = pk; }
        oc.pose(t, pose, dt, 3);
        oc.setPapillae(approach(oc._pap ?? 0, pap, 4, dt)); oc._pap = approach(oc._pap ?? 0, pap, 4, dt);
        // Flatfish act glides slowly; others sit.
        oc.group.position.x = s.act === 'mimic' && s.model === 'sole' ? 0.8 * Math.sin(t * 0.4) : approach(oc.group.position.x, 0, 2, dt);
        lb.position.set(oc.group.position.x, 3.0, 0); lb.element.textContent = text;
        cur.act = s.act;
        fitBoard(stage, chart.mesh, lay === 'tall' ? [0.4, 4.8, -2] : [5.4, 2.4, -1.5], lay === 'tall' ? 0.8 : 1);
        chart.mesh.visible = chart.mesh.visible && s.act === 'blind';
        if (!drawn) { drawn = true; chart.redraw(); }
      },
      readout: (s) => {
        const F = FLOORS[s.bg];
        if (s.act === 'hide') return `<div class="big">${NAMES[cur.type] || ''}</div>
          <div class="row"><span>Objects on the floor</span><b>${F.grain < 0.08 ? 'tiny grains' : F.grain < 0.45 ? 'pebble-sized' : 'big, with sharp edges'}</b></div>
          <div class="row"><span>Contrast</span><b>${F.contrast < 0.3 ? 'low' : F.contrast < 0.7 ? 'medium' : 'high'}</b></div>
          <div class="row"><span>Job</span><b>${cur.type === 'disruptive' ? 'break up the outline' : cur.type === 'weed' ? 'look like an object' : 'match the background'}</b></div>
          <small>Size, contrast and edges of background objects guide the choice (Hanlon et al. 2009). Real animals often mix types.</small>`;
        if (s.act === 'mimic') { const md = MODELS[s.model]; return `<div class="big">Mimic octopus</div><div class="row"><span>Pretending to be</span><b>${md.name}</b></div><div class="row"><span>Where</span><b>open sand, Indonesia, by day</b></div><small>${md.why} Norman, Finn & Tregenza 2001.</small>`; }
        if (s.act === 'clouds') return `<div class="big">Passing clouds</div><div class="row"><span>What</span><b>dark waves running over the body</b></div><div class="row"><span>Why</span><b>unclear: prey, rivals or warning?</b></div><small>Rarely recorded in the wild, so still debated.</small>`;
        return `<div class="big">One kind of light sensor</div><div class="row"><span>Eye pigment peaks at</span><b>about 480 to 500 nm (blue-green)</b></div><div class="row"><span>Skin light response peaks at</span><b>480 nm</b></div><small>Ramirez & Oakley 2015; Chung & Marshall 2016. The answer is not known yet.</small>`;
      },
    };
  },
};
