#!/usr/bin/env node
/* Build tools/voice/clips-app.json: every Arabic string the games speak that is not already in clips.json
   (sec "app"), plus every Cari Baby Mo object name in Indonesian and English (sec "cari").
   The strings come from the pages' own data (read in a real browser), so nothing is retyped by hand.

   Needs Playwright and the site served locally:
     (cd www && python3 -m http.server 8803) &
     node tools/voice/build-app-clips.js [http://127.0.0.1:8803/]

   Ids are stable: <sec>-<first 8 hex of sha1("lang|normalised text")>. The normalising matches
   www/bm-voice.js and tools/voice/gen.py (NFC, no tatweel, single spaces, no trailing punctuation,
   Latin lower-cased; harakat kept). */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..', '..');
const WWW = path.join(ROOT, 'www') + '/';
const BASE = process.argv[2] || 'http://127.0.0.1:8803/';
const AR = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;
const TRAIL = /[\s.,!?;:…،؛؟۔。]+$/;
function norm(t, lang) {
  let s = String(t).normalize('NFC').replace(/ـ/g, '').replace(/\s+/g, ' ').trim().replace(TRAIL, '');
  return lang === 'ar' ? s : s.toLowerCase();
}
const keyOf = (lang, t) => lang + '|' + norm(t, lang);
const idOf = (sec, lang, t) => sec + '-' + crypto.createHash('sha1').update(keyOf(lang, t)).digest('hex').slice(0, 8);
// original text, only trailing punctuation/space trimmed (never re-spelled)
const clean = t => String(t).replace(/\s+/g, ' ').trim().replace(TRAIL, '');

// What each page speaks, read from its own data. g = group shown on the listening page.
const PAGES = {
  'babymo-pray-with-mo': () => {
    const a = [];
    STEPS.forEach(s => s.recitations.forEach(r => a.push({ t: r.arabic, h: s.name + ' — ' + r.latin, k: 'phrase', g: 'Sholat Bareng Mo: bacaan' })));
    DZIKIR.forEach(d => (d.phrases || [d.arabic]).forEach((t, i) => a.push({ t, h: d.title + (d.phrases ? ' (' + (i + 1) + '/' + d.phrases.length + ')' : ' — ' + d.latin), k: 'phrase', g: 'Sholat Bareng Mo: dzikir' })));
    return a;
  },
  // the niat itself is not spoken (s.say "Bismillahirrahmanirrahim" is, see aliases.json)
  'babymo-wudhu': () => STEPS.filter(s => s.ar && !s.say).map(s => ({ t: s.ar, h: s.title + ' — ' + s.lat, k: 'doa', g: 'Wudhu' })),
  'babymo-puzzle-katabaik': () => PHRASES.map(p => ({ t: p.arabic, h: p.title + ' — ' + p.indo, k: 'phrase', g: 'Kata Baik' })),
  'babymo-dua-game': () => DUAS.map(d => ({ t: d.arabic, h: d.title[0] + ' — ' + d.latin, k: 'doa', g: 'Dua Game' })),
  'babymo-memory-match': () => Object.keys(CARD_DATA).filter(k => CARD_DATA[k].speak).map(k => ({ t: CARD_DATA[k].speak, h: CARD_DATA[k].label, k: 'name', g: 'Memory Match: huruf' })),
  'babymo-arabic-spelling': () => {
    const a = [];
    [...new Set(Object.values(LETTER_NAMES))].forEach(t => a.push({ t, h: 'nama huruf', k: 'name', g: 'Susun Huruf: nama huruf' }));
    WORDS.forEach(w => a.push({ t: w.arabic, h: w.latin + ' — ' + w.meaning, k: 'word', g: 'Susun Huruf: kata' }));
    return a;
  },
  'babymo-doa-harian': () => {
    const a = [];
    DUAS.forEach(d => a.push({ t: d.arabic, h: String(d.title || d.id || ''), k: 'doa', g: 'Doa Harian' }));
    // "Baca Bersama Mo" reads the du'a word by word
    DUAS.forEach(d => d.arabic.split(/\s+/).filter(Boolean).forEach(w => a.push({ t: w, h: 'kata dari ' + (d.title || d.id || ''), k: 'word', g: 'Doa Harian: per kata' })));
    return a;
  },
  'babymo-hijaiyah-classic': (PIC) => {
    const a = [];
    LETTERS.forEach(lt => a.push({ t: lt.arName, h: lt.name, k: 'name', g: 'Hijaiyah Klasik: nama huruf' }));
    LETTERS.forEach(lt => { const p = PIC[lt.id]; if (p) a.push({ t: p[1], h: p[2] + ' / ' + p[3], k: 'word', g: 'Hijaiyah Klasik: kata bergambar' }); });
    LETTERS.forEach(lt => {        // harakat chips: same rule as drill() in the page
      const b = lt.ar.replace(/[ً-ْ]/g, '');
      (lt.id === 'alif' ? ['أَ', 'إِ', 'أُ'] : [b + 'َ', b + 'ِ', b + 'ُ']).forEach(t => a.push({ t, h: lt.name + ' + harakat', k: 'syl', g: 'Hijaiyah Klasik: harakat' }));
    });
    return a;
  },
};

(async () => {
  const br = await chromium.launch();
  async function run(page, fn, arg, q) {
    const ctx = await br.newContext(); const p = await ctx.newPage();
    await p.goto(BASE + page + '.html' + (q || ''), { waitUntil: 'load' }); await p.waitForTimeout(300);
    const r = await p.evaluate(fn, arg); await ctx.close(); return r;
  }
  const hc = fs.readFileSync(WWW + 'babymo-hijaiyah-classic.html', 'utf8');          // PIC lives inside an IIFE
  const i0 = hc.indexOf('var PIC={'), PIC = eval('(' + hc.slice(i0 + 8, hc.indexOf('};', i0) + 1) + ')');
  const spoken = {};
  for (const pg in PAGES) spoken[pg] = await run(pg, PAGES[pg], pg === 'babymo-hijaiyah-classic' ? PIC : undefined);
  const cari = await run('babymo-look-and-find', () => {
    const m = new Map();
    LEVELS.forEach(lv => lv.objects.forEach(o => { if (!m.has(o.label)) m.set(o.label, [o.label, BM_T(o.label), lv.name]); }));
    Object.values(SECRETS).forEach(s => { if (!m.has(s.id)) m.set(s.id, [s.id, s.en, 'Misi rahasia']); });
    return { rooms: LEVELS.length, names: [...m.values()] };
  }, undefined, '?lang=en');
  await br.close();

  const old = JSON.parse(fs.readFileSync(path.join(__dirname, 'clips.json'), 'utf8'));
  const oldKey = new Map(old.map(x => [keyOf('ar', x.t), x]));
  const aliases = JSON.parse(fs.readFileSync(path.join(__dirname, 'aliases.json'), 'utf8'));
  const items = new Map(), audit = {};
  for (const pg in spoken) {
    const ks = new Set(), cov = new Set();
    for (const x of spoken[pg]) {
      if (!AR.test(x.t)) throw new Error('not Arabic: ' + pg + ' ' + x.t);
      const k = keyOf('ar', x.t); ks.add(k);
      if (oldKey.has(k)) { cov.add(k); continue; }
      if (!items.has(k)) items.set(k, { id: idOf('app', 'ar', x.t), t: clean(x.t), lang: 'ar', sec: 'app', k: x.k, h: x.h, g: x.g, p: [] });
      const it = items.get(k); if (!it.p.includes(pg)) it.p.push(pg);
    }
    audit[pg] = { strings: ks.size, existing: cov.size, new: ks.size - cov.size };
  }
  // Arabic targets of the Latin transliterations (aliases.json) that no page data has yet
  for (const lat in aliases) {
    const t = aliases[lat], k = keyOf('ar', t);
    if (oldKey.has(k)) continue;
    if (!items.has(k)) items.set(k, { id: idOf('app', 'ar', t), t: clean(t), lang: 'ar', sec: 'app', k: 'phrase', h: lat, g: 'Transliterasi (Bismillah, Masya Allah…)', p: [] });
    else if (!items.get(k).h.includes(lat)) items.get(k).h += ' · ' + lat;
  }
  const appList = [...items.values()];
  const cariList = [], seen = new Set();
  for (const lang of ['id', 'en']) for (const [idn, en, room] of cari.names) {
    const t = (lang === 'id' ? idn : en) + '!', k = keyOf(lang, t);
    if (seen.has(k)) continue; seen.add(k);
    cariList.push({ id: idOf('cari', lang, t), t, lang, sec: 'cari', k: 'name', h: lang === 'id' ? en : idn, g: 'Cari Baby Mo: ' + (lang === 'id' ? 'Indonesia' : 'English') });
  }
  const all = appList.concat(cariList);
  const ids = new Set(all.map(x => x.id)); if (ids.size !== all.length) throw new Error('id clash');
  fs.writeFileSync(path.join(__dirname, 'clips-app.json'), '[\n' + all.map(x => JSON.stringify(x)).join(',\n') + '\n]\n');
  console.log(JSON.stringify(audit, null, 1));
  console.log(`clips-app.json: ${appList.length} Arabic + ${cariList.filter(x => x.lang === 'en').length} EN + ${cariList.filter(x => x.lang === 'id').length} ID Cari names (${cari.rooms} rooms)`);
})().catch(e => { console.error(e); process.exit(1); });
