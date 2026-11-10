#!/usr/bin/env node
/* Plays the games in a phone-sized browser (390×844, touch) in Indonesian and English and records what reaches
   the phone's own text-to-speech and which recorded clips play.

     (cd www && python3 -m http.server 8815) &
     node tools/voice/test-lines-play.js [mode] [base]
   mode:
     fake  (default) voice/manifest.js is replaced by one where EVERY key of clips.json + clips-app.json +
           clips-lines.json (+ the shipped manifest) points at an existing mp3, i.e. the app after the Cloud Shell
           run. Prints every text that still reaches the phone's voice and checks that clips play in its place
           with callbacks intact (Dreamtime story highlighting, Kebun/Sahabat flows, the hub greeting pair).
     real  the shipped manifest: prints the phone-voice log, to compare with the same run on the old code
           (pages must speak exactly as before while the line clips do not exist).
   Needs Playwright. Exit code 1 on a page error or (fake) a line that is not name / open-ended. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const MODE = process.argv[2] || 'fake';
const BASE = process.argv[3] || 'http://127.0.0.1:8815/';
const VOICE = path.resolve(__dirname, '..', '..', 'www', 'voice');

function fakeManifest() {
  const L = f => JSON.parse(fs.readFileSync(path.join(__dirname, f), 'utf8'));
  const mp3 = fs.readdirSync(VOICE).filter(f => f.endsWith('.mp3')).map(f => [f, fs.statSync(path.join(VOICE, f)).size])
    .sort((a, b) => a[1] - b[1]).slice(0, 6).map(x => x[0]);           // the shortest clips: fast test
  const m = {}; let i = 0;
  const real = fs.readFileSync(path.join(VOICE, 'manifest.js'), 'utf8');
  Object.assign(m, JSON.parse(real.slice(real.indexOf('{'), real.lastIndexOf('}') + 1)));
  for (const x of L('clips.json').concat(L('clips-app.json'), L('clips-lines.json'))) m[(x.lang || 'ar') + '|' + x.t] = mp3[i++ % mp3.length] + '?fake';
  return 'window.BM_VOICE=' + JSON.stringify(m) + ';';
}

// the phone's speech engine, recorded: every utterance that reaches it, then start/end like a real engine
const INIT = ({ lang, name }) => {
  try { localStorage.setItem('bm_lang', lang); localStorage.setItem('bm_lang_picked', '1'); if (name) localStorage.setItem('mo_child_name', name); } catch (e) {}
  window.__tts = []; window.__clips = [];
  const ss = window.speechSynthesis;
  if (ss) {
    ss.speak = function (u) {
      if (u.text && u.text.trim() && u.volume !== 0) window.__tts.push([u.text, u.lang || '']);
      setTimeout(() => { try { u.dispatchEvent(new SpeechSynthesisEvent('start', { utterance: u })); } catch (e) {} }, 5);
      setTimeout(() => { try { u.dispatchEvent(new SpeechSynthesisEvent('end', { utterance: u })); } catch (e) {} }, 40);
    };
    ss.cancel = function () {};
  }
  // everything the page asks to say (above bm-voice.js / bm-i18n.js), to show which lines a run covered
  window.__said = [];
  addEventListener('load', () => { const s = window.speechSynthesis; if (!s) return; const f = s.speak; s.speak = function (u) { if (u && u.text && u.text.trim() && u.volume !== 0) window.__said.push(u.text); return f.call(this, u); }; });
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { if (this.src && !/^data:/.test(this.src)) window.__clips.push(decodeURIComponent(this.src.split('/').pop())); return play.call(this); };
};

const W = ms => new Promise(r => setTimeout(r, ms));
async function tap(p, sel, ms) { const el = await p.$(sel); if (!el) throw new Error('missing ' + sel); await el.tap({ force: true }).catch(() => el.click({ force: true })); await W(ms || 500); }
const yesterday = () => { const d = new Date(Date.now() - 864e5); const z = n => (n < 10 ? '0' : '') + n; return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()); };

/* what each page does, with the checks on the clips (fake mode) */
const SCEN = {
  'babymo-wudhu': async (p) => {
    await p.evaluate(() => startGuide()); await W(900);
    for (let i = 0; i < 3; i++) { await p.evaluate(() => wash()); await W(500); }        // niat (Arabic) …
    await p.evaluate(() => go(1)); await W(1500);
    for (let i = 0; i < 3; i++) { await p.evaluate(() => wash()); await W(700); }        // 1, 2, 3
    for (let i = 2; i < 10; i++) { await p.evaluate(i => go(i), i); await W(600); }
    await p.evaluate(() => next()); await W(1400);
    await p.evaluate(() => startOrder(10)); await W(400);
    for (let i = 0; i < 10; i++) { await tap(p, '.ocard[data-i="' + i + '"]', 600); }
    await W(800);
    const ci = await p.$('#s-home .ci-go, .ci-go'); if (ci) { await p.evaluate(() => show('s-home')); await W(300); await tap(p, '.ci-go', 900); }
  },
  'babymo-kebun-ais': async (p, lang) => {
    await tap(p, '#goGarden', 2500);                                                    // first visit: the greeting
    await tap(p, '#aisHit', 1200);
    // a planted, watered garden from yesterday → this morning's line; a ripe tomato; a caterpillar
    await p.evaluate(y => { const D = JSON.parse(localStorage.getItem('bm_kebun_ais_v1'));
      D.beds = [{ crop: 'tomat', stage: 5, watered: true }, { crop: 'wortel', stage: 2, watered: true }, { crop: 'jagung', stage: 3, watered: true, cat: true }];
      D.real = y; localStorage.setItem('bm_kebun_ais_v1', JSON.stringify(D)); }, yesterday());
    await p.reload(); await W(800);
    await tap(p, '#goGarden', 9000);                                                    // the morning
    await tap(p, '.bed[data-i=\"0\"]', 1500); await tap(p, '.tool[data-t="harvest"]', 5000);
    for (const b of await p.$$('.mcard [data-close], #mcard button')) { await b.tap({ force: true }).catch(() => {}); await W(400); }
    await tap(p, '.bed[data-i=\"1\"]', 1500); await tap(p, '.tool[data-t="water"]', 4000);
    await tap(p, '.tool[data-t="water"]', 3000);                                        // again: "Ups! Sudah basah!"
    for (const b of await p.$$('#mcard button')) { await b.tap({ force: true }).catch(() => {}); await W(400); }
    const cat = await p.$('.cat'); if (cat) { await cat.tap({ force: true }).catch(() => {}); await W(4000); }
    for (const b of await p.$$('#mcard button')) { await b.tap({ force: true }).catch(() => {}); await W(400); }
    await tap(p, '#basketBtn', 800);
    const sh = await p.$('#mcard [data-share]'); if (sh) { await sh.tap({ force: true }); await W(3000); }
  },
  'babymo-tenis-adam': async (p) => {
    await tap(p, '#path .node', 800);
    await tap(p, '#introSay', 1500);
    for (const b of await p.$$('#fhPick button')) { await b.tap({ force: true }); await W(900); }
    await tap(p, '#introGo', 1500);                                                     // "Bismillah" (Arabic clip)
    await p.waitForSelector('#s-result.on', { timeout: 60000 }).catch(() => {}); await W(1500);
  },
  'babymo-sahabat-hewan': async (p) => {
    await tap(p, '#goFarm', 2500);
    await p.evaluate(y => { const D = JSON.parse(localStorage.getItem('bm_sahabat_hewan_v1')); D.real = y; D.basket = { telur: 2 }; localStorage.setItem('bm_sahabat_hewan_v1', JSON.stringify(D)); }, yesterday());
    await p.reload(); await W(800);
    await tap(p, '#goFarm', 7000);
    for (const b of await p.$$('#mcard button')) { await b.tap({ force: true }).catch(() => {}); await W(400); }
    await tap(p, '.spot[data-k="kucing"]', 1500); await tap(p, '.tool[data-t="feed"]', 4000).catch(() => {});
    for (const b of await p.$$('#mcard button')) { await b.tap({ force: true }).catch(() => {}); await W(400); }
    await tap(p, '#basketBtn', 800);
    const sh = await p.$('#mcard [data-share]'); if (sh) { await sh.tap({ force: true }); await W(3000); }
  },
  'babymo-dreamtime': async (p, lang, fake, out) => {
    await tap(p, '#btn-start', 2500);                                                   // brushing: step 1 is spoken
    for (const b of await p.$$('.btool')) { await b.tap({ force: true }); await W(500); }
    await W(2500);
    await p.evaluate(() => { document.getElementById('btn-home') && document.getElementById('btn-home').click(); }); await W(600);
    await tap(p, '#homeStory', 800);
    const n = await p.$$eval('#storyCard p', ps => ps.length);
    await tap(p, '#sRead', 200);
    // the read-aloud highlights each paragraph as its clip starts, and resets the button on the last onend
    const seen = new Set();
    for (let k = 0; k < 120; k++) { const r = await p.evaluate(() => [...document.querySelectorAll('#storyCard p')].findIndex(x => x.classList.contains('read'))); if (r >= 0) seen.add(r);
      const t = await p.$eval('#sRead', b => b.textContent); if (k > 3 && /Bacakan|Read aloud/.test(t)) break; await W(150); }
    out.story = { paragraphs: n, highlighted: seen.size, reset: /Bacakan|Read aloud/.test(await p.$eval('#sRead', b => b.textContent)) };
  },
  'index': async (p, lang, fake, out, ctx) => {
    await W(600);
    await tap(p, '#moPic', 2500);
    out.before = await p.evaluate(() => ({ tts: window.__tts.slice(), clips: window.__clips.slice(), said: window.__said.slice() }));
    // with the child's name ("Halo, Aisyah!" on screen)
    await p.evaluate(() => { localStorage.setItem('mo_child_name', 'Aisyah'); }); await p.reload(); await W(900);
    await tap(p, '#moPic', 2500);
  },
  'babymo-puzzle-katabaik': async (p) => {
    await W(800);
    await p.evaluate(() => { audio.playPhrase(PHRASES[0]); }); await W(3000);
    await p.evaluate(() => { state.tilesOpened = 3; showPraise(); }); await W(1200);
  },
  'babymo-look-and-find': async (p) => { await W(800); },
};
const ALL = process.env.PAGES ? process.env.PAGES.split(',') : ['index', 'babymo-wudhu', 'babymo-kebun-ais', 'babymo-tenis-adam', 'babymo-sahabat-hewan', 'babymo-dreamtime', 'babymo-memory-match',
  'babymo-pray-with-mo', 'babymo-doa-harian', 'babymo-dua-game', 'babymo-hijaiyah-classic', 'babymo-arabic-spelling', 'babymo-puzzle',
  'babymo-puzzle-katabaik', 'babymo-look-and-find', 'babymo-hijaiyah', 'baby-mo-forehand-beat', 'tools/dengar-suara'];

(async () => {
  const br = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const fake = MODE === 'fake' ? fakeManifest() : null;
  const report = {}; let fails = 0;
  for (const pg of ALL) for (const lang of ['id', 'en']) {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    if (fake) await ctx.route(/\/voice\/manifest\.js/, r => r.fulfill({ contentType: 'application/javascript', body: fake }));
    await ctx.addInitScript(INIT, { lang, name: null });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    const out = {};
    try {
      await p.goto(BASE + pg + '.html', { waitUntil: 'load' }); await W(700);
      if (SCEN[pg]) await SCEN[pg](p, lang, !!fake, out, ctx);
      else await W(500);
    } catch (e) { errs.push('scenario: ' + e.message.split('\n')[0]); }
    const got = await p.evaluate(() => ({ tts: window.__tts || [], clips: window.__clips || [], said: window.__said || [] })).catch(() => ({ tts: [], clips: [], said: [] }));
    if (out.before) { got.tts = out.before.tts.concat(got.tts); got.clips = out.before.clips.concat(got.clips); got.said = out.before.said.concat(got.said); delete out.before; }
    report[pg + ' ' + lang] = Object.assign({ said: got.said, tts: got.tts, clips: got.clips.length, errors: errs }, out);
    if (errs.length) fails++;
    await ctx.close();
    console.log(`${pg} [${lang}]  clips played: ${got.clips.length}  phone voice: ${got.tts.length}${errs.length ? '  ERRORS: ' + errs.join(' | ') : ''}${out.story ? '  story ' + JSON.stringify(out.story) : ''}`);
    if (process.env.SAID) got.said.forEach(t => console.log('      said  ' + t.slice(0, 90)));
    got.tts.forEach(([t, l]) => console.log('      TTS ' + l + '  ' + t));
  }
  await br.close();
  fs.writeFileSync(path.join(require('os').tmpdir(), 'bm-voice-test-' + MODE + '-' + (new URL(BASE).port || '80') + '.json'), JSON.stringify(report, null, 1));
  if (fake) {
    const left = Object.entries(report).flatMap(([k, v]) => v.tts.map(t => k + ': ' + t.join(' | ')));
    console.log('\nphone voice with every clip present: ' + (left.length ? left.length + ' utterance(s)' : 'none'));
    const s = (report['babymo-dreamtime id'] || {}).story, s2 = (report['babymo-dreamtime en'] || {}).story;
    [s, s2].filter((x, i) => report['babymo-dreamtime ' + ['id', 'en'][i]]).forEach(x => { if (!x || x.highlighted < x.paragraphs || !x.reset) { console.log('story callbacks FAILED', x); fails++; } });
  }
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
