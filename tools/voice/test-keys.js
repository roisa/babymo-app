#!/usr/bin/env node
/* Checks that the clip keys line up: the normalising in www/bm-voice.js (what the page looks up), in
   tools/voice/gen.py (what the manifest is written with) and in tools/voice/voicekey.js (what the clip lists
   are built with) give the same key for every clip text, and that the ways pages decorate a spoken line
   (emoji, extra spaces, curly quotes, "!.", upper case, HTML-free spacing) still find the same key.
     node tools/voice/test-keys.js */
const fs = require('fs'), path = require('path'), vm = require('vm'), { execFileSync } = require('child_process');
const vk = require('./voicekey.js');
const ROOT = path.resolve(__dirname, '..', '..');

// www/bm-voice.js in a bare sandbox (no speechSynthesis: it only sets up window.BMVoice)
const win = {}; win.window = win; win.localStorage = { getItem: () => null }; win.document = { currentScript: null, addEventListener() {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'www', 'bm-voice.js'), 'utf8'), win);
const pageNorm = win.BMVoice.norm;

const lists = ['clips.json', 'clips-app.json', 'clips-lines.json'].flatMap(f => JSON.parse(fs.readFileSync(path.join(__dirname, f), 'utf8')));
const cases = [];
for (const x of lists) cases.push([x.t, x.lang || 'ar']);
const deco = [
  t => '☀️ ' + t + ' 💧', t => '  ' + t.replace(/ /g, '  ') + '  ', t => t.replace(/'/g, '’'), t => t + '!.', t => '👋 ' + t + ' 🎉🎉',
  t => t.toUpperCase(), t => t.replace(/([.!?])/g, ' $1'), t => '"' + t + '"', t => t + ' ⭐️', t => t.replace(/ — /g, ' – '),
];
const variants = [];
for (const x of lists) if ((x.lang || 'ar') !== 'ar') for (const d of deco) variants.push([d(x.t), x.lang, x.t]);
// a few hand-made ones from the pages
[['☀️ Selamat pagi! Tanaman haus. Ayo siram! 💧', 'id', 'Selamat pagi! Tanaman haus. Ayo siram!'],
 ['Tunggu Pantulannya!. Bola merah', 'id', 'Tunggu Pantulannya! Bola merah'],
 ['🐛➜🌳 Ulat pindah ke pohon!', 'id', 'Ulat pindah ke pohon'],
 ["Assalamu’alaikum! 👋", 'id', "Assalamu'alaikum"]].forEach(v => variants.push(v));

const all = cases.concat(variants.map(v => [v[0], v[1]]));
const py = JSON.parse(execFileSync('python3', ['-I', '-c', `
import sys, json, importlib.util
spec = importlib.util.spec_from_file_location("gen", sys.argv[1]); g = importlib.util.module_from_spec(spec)
import os; os.environ["NO_GCLOUD"] = "1"; spec.loader.exec_module(g)
cases = json.load(sys.stdin)
print(json.dumps([[g.norm(t, l), g.norm(g.norm(t, l), l)] for t, l in cases], ensure_ascii=False))
`, path.join(__dirname, 'gen.py')], { input: JSON.stringify(all), env: Object.assign({}, process.env, { NO_GCLOUD: '1' }), maxBuffer: 1 << 26 }).toString());

let bad = 0;
const fail = (...a) => { if (bad++ < 25) console.log('FAIL', ...a); };
all.forEach(([t, l], i) => {
  const a = pageNorm(t, l), b = vk.norm(t, l), [c, cc] = py[i];
  if (a !== b || a !== c) fail('differ', JSON.stringify(t), { page: a, voicekey: b, gen: c });
  if (pageNorm(a, l) !== a || vk.norm(b, l) !== b || cc !== c) fail('not idempotent', JSON.stringify(t));
  if (l !== 'ar' && !a) fail('empty key', JSON.stringify(t));
});
variants.forEach(([t, l, base]) => { if (pageNorm(t, l) !== pageNorm(base, l)) fail('variant', JSON.stringify(t), pageNorm(t, l), '≠', pageNorm(base, l)); });
// Arabic: harakat kept, tatweel dropped
if (pageNorm('بَ', 'ar') === pageNorm('بِ', 'ar')) fail('harakat lost');
if (pageNorm('اللـه', 'ar') !== pageNorm('الله', 'ar')) fail('tatweel kept');
// keys in the clip lists are unique per language
const seen = new Map();
for (const x of lists) { const k = (x.lang || 'ar') + '|' + vk.norm(x.t, x.lang || 'ar'); if (seen.has(k) && seen.get(k) !== x.id && x.sec === 'lines') fail('duplicate key', k); seen.set(k, x.id); }
console.log(`${all.length} texts (${cases.length} clip texts + ${variants.length} decorated variants): ${bad ? bad + ' FAILED' : 'all keys agree'}`);
process.exit(bad ? 1 : 0);
