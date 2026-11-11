#!/usr/bin/env node
/* Build tools/voice/clips-lines.json: every Indonesian and English line the games speak (instructions,
   praise, tips, narration, greetings, story read-alouds), so they play in the same recorded voice as the
   Arabic clips instead of the phone's own voice.

   The lines come from the pages' own data, read in a real browser in both languages:
     - each page's builder below lists what the page passes to speechSynthesis.speak(), with data arrays and
       template lines enumerated over their real values;
     - in English mode an Indonesian utterance (lang id-ID) is translated exactly like bm-i18n.js does
       (window.BM_T on the whole text), so the English entry is the text that really reaches the speech engine;
     - lines that are only an Arabic transliteration ("Bismillah", "Bismika Allahumma ahya wa amut") are left
       out: aliases.json already plays the Arabic clip for them.

   Needs Playwright and the site served locally:
     (cd www && python3 -m http.server 8815) &
     node tools/voice/build-lines-clips.js [http://127.0.0.1:8815/]

   Ids are stable: lines-<first 8 hex of sha1("lang|normalised text")>; the normalising is the same as in
   www/bm-voice.js and tools/voice/gen.py (see voicekey.js). */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { norm, trKey, speakable } = require('./voicekey.js');
const ROOT = path.resolve(__dirname, '..', '..');
const WWW = path.join(ROOT, 'www') + '/';
const BASE = process.argv[2] || 'http://127.0.0.1:8815/';
const keyOf = (lang, t) => lang + '|' + norm(t, lang);
const idOf = (lang, t) => 'lines-' + crypto.createHash('sha1').update(keyOf(lang, t)).digest('hex').slice(0, 8);

/* a literal declared inside a page's closure: `var NAME = [ … ];` → its source text (brackets matched) */
function literal(file, name) {
  const s = fs.readFileSync(WWW + file, 'utf8');
  const m = new RegExp('(?:var|let|const)\\s+' + name + '\\s*=\\s*').exec(s);
  if (!m) throw new Error(file + ': no ' + name);
  let i = m.index + m[0].length, depth = 0, q = null;
  const start = i;
  for (; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') q = c;
    else if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') { depth--; if (!depth) return s.slice(start, i + 1); }
  }
  throw new Error(file + ': unterminated ' + name);
}

/* Page builders. They run inside the page (so window.BM_T is the page's own translator) and return what the
   page speaks in mode M ("id" | "en"): [text, utteranceLang ("id" | "en"), group]. */
const PAGES = {
  'babymo-wudhu': {
    g: 'Wudhu', lits: ['STEPS'],
    fn: (M, X) => {
      const a = [];
      X.STEPS.forEach(s => a.push([s.title + '. ' + s.text, 'id', 'langkah / steps']));          // go(): every step, title + text
      X.STEPS.forEach(s => a.push([s.short, 'id', 'urutkan / order game']));                            // order game: the step tapped
      [1, 2, 3].forEach(n => a.push(M === 'en' ? [['One', 'Two', 'Three'][n - 1], 'en', 'hitungan / counting'] : [String(n), 'id', 'hitungan / counting']));   // wash(): taps counted (≤ 3; English says the word)
      a.push(['MasyaAllah, wudhumu selesai! Sekarang siap sholat.', 'id', 'selesai / done']);
      a.push(M === 'en' ? ['MashaAllah, wudu done!', 'en', 'check-in'] : ['MasyaAllah, sudah wudhu!', 'id', 'check-in']);
      return a;
    }
  },
  'babymo-kebun-ais': {
    g: 'Kebun Ais', lits: ['CROPS', 'ORDER', 'FRIENDS'],
    fn: (M, X) => {
      const E = M === 'en', L = (i, e) => E ? e : i, C = X.CROPS, a = [];
      const say = (t, g) => a.push([t, M, g]);
      say(L('Ups! Sudah basah!', "Oops! It's already wet!"), 'siram / watering');
      X.ORDER.forEach(k => say(L('Alhamdulillah! Panen ' + C[k].id, 'Alhamdulillah! We picked ' + C[k].en), 'panen / harvest'));
      say(L('Ulat juga makhluk Allah. Kita pindahkan ke pohon, ya.', "Caterpillars are Allah's creatures too. Let's move it to the tree."), 'ulat / caterpillar');
      // playMorning(): "Selamat pagi! " + morningLine(); grewLine() names one crop or two different ones
      const grew = (ks, ripe) => {
        let id = C[ks[0]].id.toLowerCase(), en = C[ks[0]].en.toLowerCase();
        if (ks.length > 1) { id += ' dan ' + C[ks[1]].id.toLowerCase(); en += ' and ' + C[ks[1]].en.toLowerCase(); }
        id = id.charAt(0).toUpperCase() + id.slice(1);
        if (ripe) return L(id + 'mu siap dipanen! 🧺', 'Your ' + en + (ks.length > 1 ? ' are' : ' is') + ' ready to pick! 🧺');
        return L(id + 'mu tumbuh! 🌱', 'Your ' + en + (ks.length > 1 ? ' have' : ' has') + ' grown! 🌱');
      };
      const lines = [];
      [true, false].forEach(ripe => X.ORDER.forEach(k1 => {
        lines.push(grew([k1], ripe));
        X.ORDER.forEach(k2 => { if (k2 !== k1) lines.push(grew([k1, k2], ripe)); });
      }));
      lines.push(L('Tanaman haus. Ayo siram! 💧', "The plants are thirsty. Let's water them! 💧"),
                 L('Ayo tanam benih hari ini! 🌱', "Let's plant a seed today! 🌱"),
                 L('Ayo rawat kebun hari ini! 💧', "Let's look after the garden today! 💧"));
      lines.forEach(l => say(L('Selamat pagi! ', 'Good morning! ') + l, 'pagi / morning'));
      X.ORDER.forEach(k => X.FRIENDS.forEach(f => say(L('Ais memberi ' + C[k].id + ' untuk ' + f[0], 'Ais gives a ' + C[k].en + ' to ' + f[1]), 'berbagi / sharing')));
      say(L("Assalamu'alaikum! Ayo berkebun bersama Ais!", "Assalamu'alaikum! Let's do some gardening with Ais!"), 'sapaan / greeting');
      say(L('Hihi!', 'Hehe!'), 'sapaan / greeting');
      say('Bismillah', 'tanam / planting'); say('Bismika Allahumma ahya wa amut', 'tidur / bedtime');   // aliases → Arabic clip
      return a;
    }
  },
  'babymo-tenis-adam': {
    g: 'Tenis Adam', lits: ['STATIONS'],
    fn: (M, X) => {
      const T = s => (window.BM_T ? window.BM_T(s) : s), a = [];
      const say = (t, g) => a.push([String(t).replace(/<[^>]+>/g, ''), M, g]);
      say('Bismillah', 'mulai / start');
      ['Alhamdulillah! Masya Allah!', 'Alhamdulillah!', 'Alhamdulillah. Ayo coba lagi!'].forEach(t => say(T(t), 'hasil / result'));
      X.STATIONS.forEach(st => say(T(st.title) + '. ' + (M === 'en' ? st.tipEn : st.tip).replace(/<[^>]+>/g, '') + ' ' + T(st.how), 'pos latihan / station intro'));
      ['Forehand dua tangan: lebih kuat dan stabil!', 'Forehand satu tangan: jangkauan lebih panjang!', 'Acak: gaya forehand Kak Adam ganti-ganti!'].forEach(t => say(T(t), 'gaya forehand / forehand style'));
      return a;
    }
  },
  'babymo-sahabat-hewan': {
    g: 'Sahabat Hewan', lits: ['ANIMALS', 'ORDER', 'GIVES', 'FRIENDS'],
    fn: (M, X) => {
      const E = M === 'en', L = (i, e) => E ? e : i, a = [];
      const say = (t, g) => a.push([t, M, g]);
      say(L("Assalamu'alaikum! Ayo rawat sahabat-sahabat kita!", "Assalamu'alaikum! Let's look after our animal friends!"), 'sapaan / greeting');
      say(L("Assalamu'alaikum, teman-teman!", "Assalamu'alaikum, friends!"), 'sapaan / greeting');
      X.ORDER.forEach(k => { const n = X.ANIMALS[k].pname[E ? 1 : 0];
        say(L('Selamat pagi! ' + n + ' lapar, ayo beri makan.', 'Good morning! ' + n + ' is hungry — time for breakfast!'), 'pagi / morning'); });
      Object.keys(X.GIVES).forEach(k => X.FRIENDS.forEach(f => say(L('Mo memberi ' + X.GIVES[k][1].toLowerCase() + ' untuk ' + f[0], 'Mo gives ' + X.GIVES[k][2].toLowerCase() + ' to ' + f[1]), 'berbagi / sharing')));
      say('Bismillah', 'makan / feeding'); say(L('Alhamdulillah', 'Alhamdulillah'), 'makan / feeding'); say('Bismika Allahumma ahya wa amut', 'tidur / bedtime');
      return a;
    }
  },
  'babymo-dreamtime': {
    g: 'Dreamtime', lits: ['PH', 'STORIES'],
    fn: (M, X) => {
      const a = [];
      X.PH.forEach(p => a.push([p.say, 'id', 'sikat gigi / brushing']));                    // speakMom(): always id-ID (bm-i18n translates)
      X.STORIES.forEach(st => [st.t[M === 'en' ? 1 : 0] + '.'].concat(M === 'en' ? st.en : st.id).forEach(t => a.push([t, M, 'cerita / story: ' + st.t[0]])));
      return a;
    }
  },
  'babymo-puzzle-katabaik': {
    g: 'Kata Baik', lits: [],
    fn: (M) => {
      const E = M === 'en', T = s => (window.BM_T ? window.BM_T(s) : s), a = [];
      const clean = t => String(t || '').replace(/[^\p{L}\p{N}\s'.,!?\-]/gu, '').trim();
      PHRASES.forEach(p => {
        a.push([clean(p.title) + '.', M, 'nama kata / phrase name', true]);                    // tu.bmRaw: the Latin name itself, never the alias
        a.push([clean(E ? T(p.indo) : p.indo), M, 'arti / meaning']);
      });
      // the spoken cheer: the toast's text (translated on screen in English), cleaned, translated, cleaned
      PRAISES.forEach(p => { const shown = p.star + (E ? T(p.text) : p.text); a.push([clean(E ? T(clean(shown)) : shown), M, 'pujian / praise']); });
      return a;
    }
  },
  // Doa Ramadan (babymo-doa-harian.html?series=ramadan): Mo says when we read each du'a as its page opens
  // (doa-ramadan.js narrate(): always id-ID, bm-i18n speaks the English line in English mode)
  'doa-ramadan': {
    g: 'Doa Ramadan', file: 'babymo-doa-harian', q: '&series=ramadan', lits: [],
    fn: () => window.DOA_SERIES_DATA.duas.map(d => [d.desc, 'id', 'kapan dibaca / when: ' + d.title])
  },
  'index': {
    g: 'Beranda', lits: ['GREETINGS'],
    fn: (M, X) => {
      const c = t => t.replace(/[^\p{L}\p{N}\s',!?]/gu, ''), a = [];
      a.push([c("Assalamu'alaikum! 👋"), M, 'sapaan / greeting']);                           // alias → Arabic clip
      a.push([M === 'en' ? 'Hi!' : 'Halo!', M, 'sapaan dengan nama anak / greeting with the child\'s name']);     // the name itself is not spoken
      Object.keys(X.GREETINGS).forEach(k => a.push([c(X.GREETINGS[k][M]), M, 'sapaan / greeting']));
      return a;
    }
  },
};

(async () => {
  const br = await chromium.launch();
  const aliases = JSON.parse(fs.readFileSync(path.join(__dirname, 'aliases.json'), 'utf8'));
  const aliasKeys = new Set(Object.keys(aliases).map(trKey));
  const app = JSON.parse(fs.readFileSync(path.join(__dirname, 'clips-app.json'), 'utf8'));
  const appKeys = new Set(app.filter(x => x.lang !== 'ar').map(x => keyOf(x.lang, x.t)));
  const items = new Map(), audit = {}, untranslated = [];
  for (const pg in PAGES) {
    const P = PAGES[pg], lits = {};
    for (const n of P.lits) lits[n] = literal((P.file || pg) + '.html', n);
    audit[pg] = { found: 0, id: 0, en: 0, alias: [], untranslated: [] };
    const ks = new Set();
    for (const M of ['id', 'en']) {
      const ctx = await br.newContext(); const p = await ctx.newPage();
      p.on('pageerror', e => console.error(pg, M, 'page error:', e.message));
      await p.goto(BASE + (P.file || pg) + '.html?lang=' + M + (P.q || ''), { waitUntil: 'load' }); await p.waitForTimeout(400);
      const got = await p.evaluate(([src, lits, M]) => {
        const X = {}; for (const n in lits) X[n] = (0, eval)('(' + lits[n] + ')');
        const raw = (0, eval)('(' + src + ')')(M, X);
        // what bm-i18n.js does to an Indonesian utterance in English mode
        return raw.map(([t, ul, g, bmRaw]) => {
          let text = t, lang = ul;
          if (M === 'en' && ul === 'id' && typeof window.BM_T === 'function') { const tx = window.BM_T(t); if (tx !== t) { text = tx; lang = 'en'; } }
          return { text, lang, g, raw: !!bmRaw, src: t, ul };
        });
      }, [P.fn.toString(), lits, M]);
      await ctx.close();
      for (const x of got) {
        const t = speakable(x.text), k = keyOf(x.lang, t);
        if (!norm(t, x.lang)) continue;
        audit[pg].found++;
        if (M === 'en' && x.lang === 'id' && x.ul === 'id') { if (!audit[pg].untranslated.includes(t)) audit[pg].untranslated.push(t); }
        if (!x.raw && aliasKeys.has(trKey(t))) { if (!audit[pg].alias.includes(t)) audit[pg].alias.push(t); continue; }
        if (appKeys.has(k)) continue;
        ks.add(k);
        if (!items.has(k)) items.set(k, { id: idOf(x.lang, t), t, lang: x.lang, sec: 'lines', k: 'line',
          h: x.g, g: P.g + ' — ' + (x.lang === 'id' ? 'Indonesia' : 'English'), p: [] });
        const it = items.get(k); if (!it.p.includes(pg)) it.p.push(pg);
      }
    }
    audit[pg].id = [...ks].filter(k => k.startsWith('id|')).length;
    audit[pg].en = [...ks].filter(k => k.startsWith('en|')).length;
  }
  await br.close();
  // grouped by game, Indonesian then English inside each group (the listening page shows them in this order)
  const order = Object.values(PAGES).map(p => p.g);
  const all = [...items.values()].sort((a, b) => order.indexOf(a.g.split(' — ')[0]) - order.indexOf(b.g.split(' — ')[0])
    || (a.lang === b.lang ? 0 : a.lang === 'id' ? -1 : 1));
  const ids = new Set(all.map(x => x.id)); if (ids.size !== all.length) throw new Error('id clash');
  fs.writeFileSync(path.join(__dirname, 'clips-lines.json'), '[\n' + all.map(x => JSON.stringify(x)).join(',\n') + '\n]\n');
  const chars = all.reduce((n, x) => n + x.t.length, 0);
  console.log(JSON.stringify(audit, null, 1));
  console.log(`clips-lines.json: ${all.length} clips (${all.filter(x => x.lang === 'id').length} ID + ${all.filter(x => x.lang === 'en').length} EN), ${chars} characters`);
})().catch(e => { console.error(e); process.exit(1); });
