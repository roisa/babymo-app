/* The clip key normalising, shared by the build scripts (node). The same rules live in www/bm-voice.js (norm)
   and tools/voice/gen.py (norm); tools/voice/test-keys.js checks that all three agree.
     - Unicode NFC; emoji, pictographs, arrows, variation selectors and joiners removed;
     - curly quotes → straight, dashes → "—", whitespace collapsed, no space before , . ! ? ; : …;
     - Arabic: tatweel removed, harakat KEPT;
     - leading and trailing punctuation / quotes trimmed, repeated end marks ("!!", "?!") folded;
     - Latin lower-cased. */
const EMO = /\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDC00-\uDEFF]|\uDB40[\uDC20-\uDC7F]|[\u2190-\u21FF\u2300-\u23FF\u25A0-\u25FF\u2600-\u27BF\u2B00-\u2BFF\uFE00-\uFE0F\u200D\u20E3\u00A9\u00AE\u2122\u2139\u3030\u303D\u3297\u3299]/g;
const AR = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const EDGE = "\\s.,!?;:…،؛؟۔。'\"()\\[\\]\\-—•·*~_";
const LEAD = new RegExp('^[' + EDGE + ']+'), TRAIL = new RegExp('[' + EDGE + ']+$');
function speakable(t) {
  let s = String(t == null ? '' : t);
  try { s = s.normalize('NFC'); } catch (e) {}
  return s.replace(EMO, '').replace(/[‘’ʼ`´]/g, "'").replace(/[“”„«»]/g, '"').replace(/[‒–―]/g, '—')
    .replace(/\s+/g, ' ').replace(/ ([,.!?;:…])/g, '$1').replace(/\s*—\s*/g, ' — ')
    .replace(/([.!?…؟])[.!?…؟]+/g, '$1').trim();
}
function norm(t, lang) {
  let s = speakable(t).replace(/ـ/g, '');
  s = s.replace(LEAD, '').replace(TRAIL, '');
  return lang === 'ar' ? s : s.toLowerCase();
}
function trKey(t) {
  let s = String(t == null ? '' : t);
  try { s = s.normalize('NFD'); } catch (e) {}
  return 'tr|' + s.replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}
module.exports = { norm, trKey, speakable, AR };
