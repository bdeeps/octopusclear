// Chapter 5: octopus and people. Three scenes:
//  1. Catch: CMFRI national marine landings, 2024 (search summaries of CMFRI's "Marine Fish Landings
//     in India 2024" report: squids 95,409 t, cuttlefish 97,262 t, octopus 13,111 t; mainland total
//     3.45 million t). Octopus are landed mostly as trawl bycatch on the south-west and east coasts,
//     plus targeted shell-trap fisheries such as Palk Bay, where Amphioctopus aegina made up 97% of
//     the catch (CMFRI Mandapam study 2024, search summary). DNA barcoding on the south-west coast found
//     four Amphioctopus species, Cistopus indicus and C. taiwanicus, Octopus vulgaris and Callistoctopus
//     macropus (CMFRI-linked study, Malacologia 2022, search summary).
//  2. Blue-ringed octopus: Hapalochlaena nierstraszi recorded for the first time in Indian waters at
//     Kasimedu fishing harbour, Chennai, on 12 August 2012 (Indian Journal of Geo-Marine Sciences 48:
//     93–95; search summary). When disturbed, a blue-ringed octopus flashes about 60 blue rings: inert
//     multilayer mirrors uncovered by muscles under direct nerve control (Mäthger et al. 2012, J Exp
//     Biol 215: 3752, abstract). Its bite carries tetrodotoxin; there is no antivenom. Official first
//     aid in Australia: call an ambulance, pressure-immobilisation bandage on a bitten limb, keep still,
//     be ready to give CPR and rescue breathing for a long time (healthdirect; NSW Agency for Clinical
//     Innovation; St John Ambulance protocol; search summaries).
//  3. Feelings: the UK's Animal Welfare (Sentience) Act 2022 (Royal Assent 28 April 2022) covers
//     vertebrates, decapod crustaceans and cephalopod molluscs, after the LSE review led by Jonathan
//     Birch (published 19 November 2021, over 300 studies) found strong evidence they are sentient
//     (legislation.gov.uk explanatory notes, search summary).
import { THREE, M, approach, box } from '../kit.js';
import { Octopus, POSES, seaFloor, FLOORS, board, panel, head, txt, wrap, COL, layoutOf, reelZoom, viewFixer, fitBoard, focuser, seaLook } from '../octo.js';

const CATCH = [['Cuttlefish', 97262, COL.gold], ['Squid', 95409, COL.water], ['Octopus', 13111, COL.red]];
const VIEWS = {
  catch: { pos: [-1.1, 3.4, 10.4], target: [-1.1, 2.1, 0], narrow: { pos: [0, 4.4, 12.5], target: [0, 1.4, 0] } },
  blue: { pos: [0.4, 3.0, 5.4], target: [0.3, 0.6, 0], narrow: { pos: [0, 3.8, 7.0], target: [0, 0.6, 0] } },
  feel: { pos: [0.6, 3.6, 7.6], target: [0.4, 1.0, 0], narrow: { pos: [0, 4.6, 9.6], target: [0, 1.0, 0] } },
};

export default {
  id: 'people',
  short: 'Octopus and people',
  title: 'Octopus and people',
  subtitle: 'Food, danger and feelings: what we catch, what to avoid, and what the law now says.',
  view: VIEWS.catch,
  learn: `<p>India’s fishers land about <b>two lakh tonnes</b> of cephalopods a year. Most are squid and cuttlefish. Octopus is a smaller part, about <b>13,000 tonnes</b> in 2024, much of it caught by accident in shrimp trawls on the south-west and east coasts. In Palk Bay, fishers lower strings of empty shells, and small octopuses move in to use them as dens. Scientists at the <b>Central Marine Fisheries Research Institute (CMFRI)</b> have found at least eight octopus species in catches from the south-west coast alone, from the common octopus to the “old woman octopus” <i>Cistopus</i>.</p>
    <p>One small octopus needs real care: the <b>blue-ringed octopus</b>. It was first recorded in Indian waters at a Chennai fishing harbour in <b>2012</b>. When disturbed it flashes around <b>60 bright blue rings</b>, a warning made by muscles uncovering mirror plates. Its bite can be painless but carries <b>tetrodotoxin</b>, a nerve poison with no antivenom. <b>Never pick up a small octopus</b> from a rock pool, a net or a shell.</p>
    <p>Octopuses also feel. A 2021 review of over 300 studies found strong evidence that octopuses, squid and cuttlefish are <b>sentient</b>: they can feel pain and distress. In <b>2022</b> the UK wrote that into law. That is why scientists now argue about how they should be caught, kept and studied.</p>
    <p class="tip"><b>Try it:</b> compare the catch, disturb the blue-ringed octopus (safely, on screen), and see what the law says.</p>`,
  terms: [
    { t: 'Landings', d: 'The amount of fish and other seafood brought ashore by fishers.' },
    { t: 'Bycatch', d: 'Animals caught by accident while fishing for something else.' },
    { t: 'Tetrodotoxin', d: 'A strong nerve poison, also found in pufferfish, that can stop breathing muscles.' },
    { t: 'Sentience', d: 'The ability to have feelings, such as pain or pleasure.' },
  ],
  defaults: { focus: 'catch', poke: false },
  onChange(s, key) { if (key === 'poke') s.focus = 'blue'; },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'catch', label: 'India’s catch' }, { v: 'blue', label: 'Blue-ringed octopus' }, { v: 'feel', label: 'Feelings and the law' }] },
    { key: 'poke', type: 'toggle', label: 'Disturb the blue-ringed octopus (on screen only)' },
  ],
  quiz: [
    { q: 'Which cephalopods make up most of India’s catch?', options: ['Octopus', 'Squid and cuttlefish', 'Nautilus', 'Giant squid'], answer: 1, why: 'Squid and cuttlefish each run near a lakh tonnes a year; octopus is about a tenth of that.' },
    { q: 'What should you do if you see a small octopus with blue rings?', options: ['Pick it up to look closely', 'Leave it alone and keep others away', 'Poke it to see the rings', 'Take it home'], answer: 1, why: 'Its bite carries tetrodotoxin and there is no antivenom. Never handle it.' },
    { q: 'What did the UK law of 2022 recognise?', options: ['Octopuses are fish', 'Octopuses, squid and cuttlefish are sentient', 'Octopuses cannot feel pain', 'Octopuses are endangered'], answer: 1, why: 'The Animal Welfare (Sentience) Act 2022 covers cephalopod molluscs after a review found strong evidence of sentience.' },
  ],
  reel: [
    { ms: 5000, caption: 'Disturb a blue-ringed octopus and it flashes about 60 blue rings. Never touch one.', set: { focus: 'blue', poke: true }, anim: {}, view: { pos: [0.3, 2.6, 3.8], target: [0.2, 0.5, 0] }, spin: 0.3 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    seaLook(stage, 0x07202a);
    const G = { catch: new THREE.Group(), blue: new THREE.Group(), feel: new THREE.Group() }; for (const k in G) root.add(G[k]);
    const floor = seaFloor(root, 26); floor.paint(FLOORS.sand);
    const L = (h, p, par, c = '') => stage.label(h, p, par, c);
    // Catch: 3D bars to scale, 1 unit = 25,000 t.
    const bars = CATCH.map(([n, v, col], i) => { const b = box(1.0, v / 25000, 1.0, M.plastic(new THREE.Color(col))); b.position.set(-1.6 + i * 1.6, v / 50000, 0); G.catch.add(b); L(`${n}<br><b>${v.toLocaleString('en-IN')} t</b>`, [-1.6 + i * 1.6, v / 25000 + 0.55, 0], G.catch, i === 2 ? 'hot' : ''); return b; });
    const small = new Octopus({ papillae: false }); small.group.scale.setScalar(0.32); small.group.position.set(1.6, 13111 / 25000 + 0.02, 0.0); G.catch.add(small.group);
    small.paint({ mode: 'mottle', base: [0.65, 0.4, 0.3], grain: 0.4, contrast: 0.4 });
    // Blue-ringed: a small octopus, camouflaged until disturbed, then rings flash.
    const br = new Octopus({ papillae: false }); br.group.scale.setScalar(0.6); G.blue.add(br.group);
    const lb = L('', [0, 1.7, 0], G.blue, 'hot');
    // Feelings: an octopus in a den (a big shell-like rock) with a scale icon of laws.
    const den = new THREE.Mesh(new THREE.SphereGeometry(1.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.matte(0x5a5148, { side: THREE.DoubleSide })); den.position.set(-1.2, 0, -0.6); den.scale.set(1, 0.8, 1); G.feel.add(den);
    const fo = new Octopus({ papillae: true }); fo.group.scale.setScalar(0.7); fo.group.position.set(0.6, 0, 0.4); fo.group.rotation.y = 0.6; G.feel.add(fo.group);
    fo.paint({ mode: 'mottle', base: [0.7, 0.42, 0.3], grain: 0.5, contrast: 0.35 });
    const cur = { focus: '' };
    const chart = board(root, 4.4, 3.0, 740, 500, (g, w, h) => {
      panel(g, w, h);
      if (cur.focus === 'feel') {
        head(g, 'Octopuses can feel', 'What the science and the law say');
        let y = 100;
        y = wrap(g, '2021: a review of over 300 studies, led by Jonathan Birch at the London School of Economics, found strong evidence that cephalopods and decapod crustaceans are sentient.', 24, y, w - 48, 25, COL.text, '18px sans-serif') + 12;
        y = wrap(g, '2022: the UK’s Animal Welfare (Sentience) Act covers vertebrates, decapod crustaceans and cephalopod molluscs, and sets up a committee to check that government policy takes their welfare into account.', 24, y, w - 48, 25, COL.text, '18px sans-serif') + 12;
        wrap(g, 'Signs of feeling include learning to avoid places linked to pain, and tending a wound.', 24, y, w - 48, 25, COL.soft, '17px sans-serif');
      } else {
        head(g, 'Blue-ringed octopus: stay safe', 'Official first aid (Australian health services)');
        const steps = ['Never pick up or touch a small octopus.', 'If someone is bitten, call an ambulance at once (112 in India).', 'Put a firm pressure bandage on a bitten arm or leg and keep the person still.', 'Breathing may stop: be ready to give rescue breaths and CPR until help arrives.', 'There is no antivenom; hospitals support breathing until the poison wears off.'];
        let y = 100; steps.forEach((st, i) => { txt(g, `${i + 1}.`, 24, y, COL.hot, 'bold 19px sans-serif'); y = wrap(g, st, 56, y, w - 80, 24, COL.text, '18px sans-serif') + 10; });
      }
    }, [5.0, 2.4, -1.5]);
    let t = 0, flash = 0, drawn = '';
    const focus = focuser(stage, G, VIEWS), fixView = viewFixer(stage, this.view);
    return {
      update(dt, s) {
        dt = Math.max(0, dt); t += dt;
        reelZoom(stage, 1.25); fixView(); focus(s.focus);
        const lay = layoutOf(stage);
        cur.focus = s.focus;
        floor.mesh.visible = true;
        if (s.focus === 'catch') { small.pose(t, POSES.sit, dt); }
        if (s.focus === 'blue') {
          // Rings flash about once a second when disturbed (illustrative rhythm).
          const want = s.poke ? (Math.sin(t * 6) > -0.2 ? 1 : 0.3) : 0;
          flash = approach(flash, want, 12, dt);
          br.paint(s.poke ? { mode: 'blue', base: [0.85, 0.68, 0.35], flash } : { mode: 'mottle', base: [0.72, 0.62, 0.48], grain: 0.3, contrast: 0.3 }, t);
          br.pose(t, s.poke ? POSES.lion : POSES.sit, dt);
          lb.element.innerHTML = s.poke ? 'Warning: about 60 blue rings flash' : 'Camouflaged, rings hidden';
        }
        if (s.focus === 'feel') { fo.pose(t, POSES.sit, dt); fo.group.position.x = 0.6 + 0.3 * Math.sin(t * 0.3); }
        const key = s.focus;
        chart.mesh.visible = s.focus !== 'catch';
        if (chart.mesh.visible) fitBoard(stage, chart.mesh, lay === 'tall' ? [0.3, 4.4, -2] : [4.6, 2.0, -1.5], lay === 'tall' ? 0.8 : 1);
        chart.mesh.visible = chart.mesh.visible && s.focus !== 'catch';
        if (key !== drawn) { drawn = key; chart.redraw(); }
      },
      readout: (s) => {
        if (s.focus === 'catch') return `<div class="big">India’s cephalopod catch, 2024</div>
          ${CATCH.map(([n, v]) => `<div class="row"><span>${n}</span><b>${v.toLocaleString('en-IN')} tonnes</b></div>`).join('')}
          <div class="row"><span>Octopus share</span><b>about ${Math.round(13111 / (97262 + 95409 + 13111) * 100)}%</b></div>
          <small>CMFRI, Marine Fish Landings in India 2024. Bars to scale.</small>`;
        if (s.focus === 'blue') return `<div class="big">Blue-ringed octopus</div>
          <div class="row"><span>First Indian record</span><b>Chennai, 2012</b></div>
          <div class="row"><span>Rings</span><b>about 60, flashed by muscles</b></div>
          <div class="row"><span>Venom</span><b>tetrodotoxin, no antivenom</b></div>
          <small>Never handle a small octopus. First aid: ambulance, pressure bandage, keep still, rescue breathing.</small>`;
        return `<div class="big">Sentient, by law</div>
          <div class="row"><span>Evidence review</span><b>LSE, November 2021</b></div>
          <div class="row"><span>UK law</span><b>Animal Welfare (Sentience) Act 2022</b></div>
          <small>The Act covers vertebrates, decapod crustaceans and cephalopod molluscs.</small>`;
      },
    };
  },
};
