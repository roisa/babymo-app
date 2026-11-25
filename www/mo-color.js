/* Baby Mo colouring — tap-to-fill colouring pages made for 2–4 year olds (25 Nov 2026).
   MoColor.open({ src, guide, title, key, onDone })
     src   : black line art on white (PNG, square, thick closed outlines)
     guide : optional coloured version of the very same page (Mo's real colours). The 🪄 magic crayon fills
             each shape with the colour it has there; without a guide it picks cheerful colours that never
             repeat next to each other.
     key   : where the finished picture is remembered (localStorage "bm_mo_color" → { key: dataURL })
   Every tap is a little show: the colour grows out from the finger, the shape twinkles, a xylophone note
   climbs with each fill and a soft crayon swish plays. Glitter crayons (gold, silver) keep sparkling.
   Picking a crayon says its colour's name. "✨ Sim salabim" colours the whole picture by magic, shape by shape.
   When most of the picture is coloured, a celebration pops up by itself. */
(function () {
  if (window.MoColor) return;
  const EN = window.BM_LANG === 'en', T = (id, en) => EN ? en : id;
  const N = 768;                                  // working resolution
  const CRAYONS = [
    { id: 'magic', kind: 'magic', name: ['Krayon ajaib', 'Magic crayon'] },
    { id: 'rainbow', kind: 'rainbow', name: ['Pelangi', 'Rainbow'] },
    { id: 'gold', kind: 'glitter', c: '#F2B705', name: ['Emas berkilau', 'Sparkly gold'] },
    { id: 'silver', kind: 'glitter', c: '#B8C4D6', name: ['Perak berkilau', 'Sparkly silver'] },
    { id: 'red', c: '#FF4D4D', name: ['Merah', 'Red'] }, { id: 'orange', c: '#FF9F1C', name: ['Oranye', 'Orange'] },
    { id: 'yellow', c: '#FFD93D', name: ['Kuning', 'Yellow'] }, { id: 'green', c: '#4CC94C', name: ['Hijau', 'Green'] },
    { id: 'blue', c: '#3D8BFF', name: ['Biru', 'Blue'] }, { id: 'purple', c: '#9B5DE5', name: ['Ungu', 'Purple'] },
    { id: 'pink', c: '#FF7EB6', name: ['Merah muda', 'Pink'] }, { id: 'brown', c: '#A0522D', name: ['Cokelat', 'Brown'] },
    { id: 'peach', c: '#F6C9A8', name: ['Krem', 'Peach'] }, { id: 'erase', kind: 'erase', c: '#FFFFFF', name: ['Penghapus', 'Eraser'] }
  ];
  const RAINBOW = ['#FF4D4D', '#FF9F1C', '#FFD93D', '#4CC94C', '#2EC4B6', '#3D8BFF', '#9B5DE5', '#FF7EB6'];
  const HAPPY = ['#FF6B6B', '#FFB13B', '#FFE066', '#5FD068', '#3EC1D3', '#5B8CFF', '#B07CF0', '#FF8FC7', '#7ED6A5', '#FFC6A8'];
  const PENTA = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760];
  const STORE = 'bm_mo_color';
  const LINES = {   // spoken lines (recorded clips play through bm-voice when they exist)
    start: ['Ayo warnai! Ketuk gambarnya.', "Let's colour! Tap the picture."],
    almost: ['Wah, hampir selesai!', 'Wow, almost done!'],
    done: ['MasyaAllah, cantik sekali!', 'MashaAllah, so beautiful!'],
    magic: ['Sim salabim!', 'Abracadabra!']
  };

  const css = `
  #moColor{position:fixed;inset:0;z-index:2147483000;display:none;flex-direction:column;align-items:center;background:radial-gradient(120% 70% at 50% 0%,#FFFDF5,#FFF1DE 55%,#FBE4FF);
    padding:calc(10px + env(safe-area-inset-top)) 12px calc(12px + env(safe-area-inset-bottom));font-family:'Fredoka','Nunito',sans-serif;touch-action:manipulation;user-select:none;-webkit-user-select:none;overflow:hidden}
  #moColor.on{display:flex}
  #moColor .mc-top{width:100%;max-width:680px;display:flex;align-items:center;gap:10px;min-height:48px}
  #moColor .mc-x,#moColor .mc-undo{width:48px;height:48px;border-radius:50%;border:0;background:#fff;box-shadow:0 6px 14px -8px rgba(60,40,120,.5);font-size:22px;color:#4A3B8C;cursor:pointer;flex:none;display:grid;place-items:center}
  #moColor .mc-title{flex:1;text-align:center;font-size:clamp(18px,5vw,24px);font-weight:700;color:#4A3B8C;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #moColor .mc-stage{flex:1;min-height:0;width:100%;display:flex;align-items:center;justify-content:center;padding:6px 0}
  #moColor .mc-paper{position:relative;aspect-ratio:1;height:100%;max-width:100%;max-height:100%;background:#fff;border-radius:26px;box-shadow:0 18px 36px -18px rgba(60,40,120,.45),0 0 0 6px #fff;overflow:hidden}
  #moColor canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}
  #moColor canvas.fx{pointer-events:none}
  #moColor .mc-pal{width:100%;max-width:min(680px,70vh);display:grid;grid-template-columns:repeat(7,1fr);gap:6px 4px;padding:8px 2px 0;align-items:end}
  #moColor .mc-c{position:relative;height:64px;border:0;background:none;cursor:pointer;padding:0;transition:transform .2s cubic-bezier(.3,1.6,.5,1);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;-webkit-tap-highlight-color:transparent}
  #moColor .mc-c svg{width:100%;max-width:44px;height:58px;filter:drop-shadow(0 4px 4px rgba(60,40,120,.25))}
  #moColor .mc-c.sel{transform:translateY(-10px) scale(1.12)}
  #moColor .mc-c.sel::after{content:'';position:absolute;left:50%;bottom:-8px;width:10px;height:10px;margin-left:-5px;border-radius:50%;background:#4A3B8C}
  #moColor .mc-c.magic svg{filter:drop-shadow(0 0 8px rgba(255,200,60,.9)) drop-shadow(0 4px 4px rgba(60,40,120,.25))}
  #moColor .mc-c.magic.sel svg{animation:mcWiggle .9s ease-in-out infinite}
  @keyframes mcWiggle{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
  #moColor .mc-row{display:flex;gap:10px;width:100%;max-width:480px;margin-top:10px}
  #moColor .mc-btn{flex:1;min-height:56px;border:0;border-radius:999px;cursor:pointer;color:#fff;font:700 clamp(17px,4.6vw,21px)/1 'Fredoka','Nunito',sans-serif}
  #moColor .mc-auto{background:linear-gradient(120deg,#B07CF0,#FF7EB6);box-shadow:0 6px 0 #8A3F9E,0 14px 24px -12px rgba(176,124,240,.6)}
  #moColor .mc-done{background:linear-gradient(120deg,#16C47F,#0A8FA0);box-shadow:0 6px 0 #0A6B60,0 14px 24px -12px rgba(10,143,160,.6)}
  #moColor .mc-btn:active{transform:translateY(4px)}
  #moColor .mc-yay{position:absolute;inset:0;display:none;align-items:center;justify-content:center;flex-direction:column;gap:6px;background:rgba(255,255,255,.4);pointer-events:none}
  #moColor .mc-yay.on{display:flex}
  #moColor .mc-yay i{font-style:normal;font-size:clamp(54px,16vw,90px);animation:mcPop .6s cubic-bezier(.3,1.6,.5,1),mcSpin 2.2s linear .6s infinite}
  #moColor .mc-yay b{font-size:clamp(26px,8vw,44px);color:#E2489A;text-shadow:0 3px 0 #fff,0 0 18px #fff;animation:mcPop .6s cubic-bezier(.3,1.6,.5,1);text-align:center;padding:0 12px}
  @keyframes mcPop{from{transform:scale(.3)}to{transform:scale(1)}}
  @keyframes mcSpin{to{transform:rotate(360deg)}}
  #moColor .mc-conf{position:absolute;top:-20px;width:12px;height:16px;border-radius:3px;pointer-events:none;animation:mcFall linear forwards}
  @keyframes mcFall{to{transform:translateY(110vh) rotate(720deg)}}
  @media (prefers-reduced-motion:reduce){#moColor .mc-conf,#moColor .mc-c.magic.sel svg{animation:none;display:none}}`;

  let root, cvs, ctx, fx, fctx, lineImg, labels, regions, order, start, colorOf, glitterOf, history, cur = CRAYONS[0], rbI = 0, opts = {},
      busy = false, audio, guideCol = null, guideImg = null, bgL = -1, celebrated = false, fills = 0, twinkles = [], fxOn = false, adj = null;

  function el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function crayonSvg(c) {
    const body = c.kind === 'magic' ? 'url(#mcMagic)' : c.kind === 'rainbow' ? 'url(#mcRain)' : c.kind === 'glitter' ? `url(#mcG-${c.id})` : c.c;
    const tip = c.kind === 'magic' ? '#FFD23F' : c.kind === 'rainbow' ? '#FF4D4D' : c.c;
    const edge = c.kind === 'erase' ? '#E3DDF2' : 'rgba(0,0,0,.18)';
    let defs = '';
    if (c.kind === 'magic') defs = '<linearGradient id="mcMagic" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B07CF0"/><stop offset=".5" stop-color="#FF7EB6"/><stop offset="1" stop-color="#FFB13B"/></linearGradient>';
    if (c.kind === 'rainbow') defs = '<linearGradient id="mcRain" x1="0" y1="0" x2="0" y2="1">' + RAINBOW.map((r, i) => `<stop offset="${i / 7}" stop-color="${r}"/>`).join('') + '</linearGradient>';
    if (c.kind === 'glitter') defs = `<linearGradient id="mcG-${c.id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${c.c}"/><stop offset=".7" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="${c.c}"/></linearGradient>`;
    const extra = c.kind === 'magic' ? '<path d="M22 4l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z" fill="#FFE27A" stroke="#fff" stroke-width="1.2"/>'
      : c.kind === 'glitter' ? '<circle cx="17" cy="34" r="1.6" fill="#fff"/><circle cx="26" cy="44" r="1.3" fill="#fff"/><circle cx="21" cy="52" r="1.1" fill="#fff"/><path d="M27 28l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z" fill="#fff"/>'
      : c.kind === 'erase' ? '<rect x="13" y="38" width="18" height="10" rx="2" fill="#FF9FC4"/>' : '';
    return `<svg viewBox="0 0 44 64" aria-hidden="true"><defs>${defs}</defs>
      <path d="M14 22 L22 4 L30 22Z" fill="${c.kind === 'erase' ? '#FFFFFF' : tip}" stroke="${edge}" stroke-width="1.5" stroke-linejoin="round"/>
      <rect x="12" y="20" width="20" height="42" rx="5" fill="${body}" stroke="${edge}" stroke-width="1.5"/>
      <rect x="12" y="27" width="20" height="4" fill="#fff" opacity=".45"/><rect x="12" y="54" width="20" height="4" fill="#fff" opacity=".45"/>
      <rect x="15" y="22" width="3.5" height="38" rx="1.7" fill="#fff" opacity=".35"/>${extra}</svg>`;
  }
  function build() {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    root = el(`<div id="moColor" role="dialog" aria-modal="true">
      <div class="mc-top"><button class="mc-x" type="button" aria-label="${T('Tutup', 'Close')}">✕</button><div class="mc-title"></div><button class="mc-undo" type="button" aria-label="${T('Batal', 'Undo')}">↶</button></div>
      <div class="mc-stage"><div class="mc-paper"><canvas class="art" width="${N}" height="${N}"></canvas><canvas class="fx" width="${N}" height="${N}"></canvas><div class="mc-yay"><i>⭐</i><b></b></div></div></div>
      <div class="mc-pal" role="radiogroup" aria-label="${T('Krayon', 'Crayons')}"></div>
      <div class="mc-row"><button class="mc-btn mc-auto" type="button"></button><button class="mc-btn mc-done" type="button"></button></div></div>`);
    document.body.appendChild(root);
    cvs = root.querySelector('canvas.art'); ctx = cvs.getContext('2d', { willReadFrequently: true });
    fx = root.querySelector('canvas.fx'); fctx = fx.getContext('2d');
    const pal = root.querySelector('.mc-pal');
    CRAYONS.forEach((c, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'mc-c' + (c.kind === 'magic' ? ' magic' : ''); b.innerHTML = crayonSvg(c);
      b.setAttribute('role', 'radio'); b.setAttribute('aria-label', c.name[EN ? 1 : 0]);
      b.onclick = () => { cur = c; pal.querySelectorAll('.mc-c').forEach(x => { x.classList.toggle('sel', x === b); x.setAttribute('aria-checked', x === b ? 'true' : 'false'); });
        if (c.kind === 'magic') chime([784, 988, 1319]); else tone(PENTA[i % PENTA.length], .07, 'sine', .12);
        say(c.name[EN ? 1 : 0]); };
      pal.appendChild(b);
    });
    pal.firstChild.classList.add('sel');
    root.querySelector('.mc-x').onclick = close;
    root.querySelector('.mc-undo').onclick = undo;
    root.querySelector('.mc-done').onclick = finish;
    root.querySelector('.mc-auto').onclick = magicAll;
    cvs.addEventListener('pointerdown', onTap);
  }

  /* ── sound ── */
  function ac() { try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); return audio; } catch (e) { return null; } }
  function tone(f, d, type, vol) {
    const A = ac(); if (!A) return;
    const t = A.currentTime, o = A.createOscillator(), g = A.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol || .16, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d + .25);
    o.connect(g); g.connect(A.destination); o.start(t); o.stop(t + d + .3);
  }
  function chime(fs, gap) { fs.forEach((f, i) => setTimeout(() => tone(f, .1, 'triangle', .14), i * (gap || 70))); }
  function swish() {                                // a soft crayon scribble
    const A = ac(); if (!A) return;
    try { const len = Math.floor(A.sampleRate * .16), b = A.createBuffer(1, len, A.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / len) * .5;
      const s = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain(); s.buffer = b; f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = .8; g.gain.value = .22;
      s.connect(f); f.connect(g); g.connect(A.destination); s.start(); } catch (e) {}
  }
  function say(t) { try { const u = new SpeechSynthesisUtterance(t); u.lang = EN ? 'en-US' : 'id-ID'; u.pitch = 1.2; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {} }

  /* ── split the line art into regions once ── */
  function fitDraw(x, img) {
    x.fillStyle = '#fff'; x.fillRect(0, 0, N, N);
    const k = Math.min(N / img.naturalWidth, N / img.naturalHeight), w = img.naturalWidth * k, h = img.naturalHeight * k;
    x.drawImage(img, (N - w) / 2, (N - h) / 2, w, h);
  }
  function analyse(img) {
    const c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d', { willReadFrequently: true });
    fitDraw(x, img); lineImg = c;
    const d = x.getImageData(0, 0, N, N).data, wall = new Uint8Array(N * N);
    for (let i = 0; i < N * N; i++) { if (d[i * 4] * .3 + d[i * 4 + 1] * .59 + d[i * 4 + 2] * .11 < 160) wall[i] = 1; }
    const w2 = wall.slice();                        // thicken lines by 1px so tiny gaps don't leak
    for (let y = 1; y < N - 1; y++) for (let xx = 1; xx < N - 1; xx++) { const i = y * N + xx; if (!wall[i] && (wall[i - 1] || wall[i + 1] || wall[i - N] || wall[i + N])) w2[i] = 1; }
    labels = new Int32Array(N * N).fill(-1); const st = new Int32Array(N * N); regions = [];
    for (let s = 0; s < N * N; s++) {
      if (w2[s] || labels[s] >= 0) continue;
      const id = regions.length; let sp = 0, n = 0; st[sp++] = s; labels[s] = id;
      while (sp) { const i = st[--sp]; n++; const y = (i / N) | 0, xx = i - y * N;
        if (xx > 0 && !w2[i - 1] && labels[i - 1] < 0) { labels[i - 1] = id; st[sp++] = i - 1; }
        if (xx < N - 1 && !w2[i + 1] && labels[i + 1] < 0) { labels[i + 1] = id; st[sp++] = i + 1; }
        if (y > 0 && !w2[i - N] && labels[i - N] < 0) { labels[i - N] = id; st[sp++] = i - N; }
        if (y < N - 1 && !w2[i + N] && labels[i + N] < 0) { labels[i + N] = id; st[sp++] = i + N; } }
      regions.push(n);
    }
    for (let pass = 0; pass < 2; pass++) for (let i = N; i < N * N - N; i++) if (labels[i] < 0 && !wall[i]) { const a = labels[i - 1] >= 0 ? labels[i - 1] : labels[i + 1] >= 0 ? labels[i + 1] : labels[i - N] >= 0 ? labels[i - N] : labels[i + N]; if (a >= 0) labels[i] = a; }
    // pixel lists per region (fast fills, twinkle spots)
    const R = regions.length, cnt = new Int32Array(R + 1);
    for (let i = 0; i < N * N; i++) if (labels[i] >= 0) cnt[labels[i] + 1]++;
    start = new Int32Array(R + 1); for (let r = 0; r < R; r++) start[r + 1] = start[r] + cnt[r + 1];
    order = new Int32Array(start[R]); const pos = start.slice(0, R);
    for (let i = 0; i < N * N; i++) { const L = labels[i]; if (L >= 0) order[pos[L]++] = i; }
    for (let r = 0; r < R; r++) regions[r] = start[r + 1] - start[r];
    // background = the biggest shape touching the edge of the page
    bgL = -1; let best = 0;
    for (let i = 0; i < N; i++) for (const p of [i, (N - 1) * N + i, i * N, i * N + N - 1]) { const L = labels[p]; if (L >= 0 && regions[L] > best) { best = regions[L]; bgL = L; } }
    colorOf = new Array(R).fill(null); glitterOf = new Array(R).fill(false); history = []; adj = null; guideCol = null; guideData = null; celebrated = false; halfSaid = false; fills = 0;
  }
  function hex(c) { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  let fill;
  function renderAll() {
    fill = ctx.createImageData(N, N); const f = fill.data;
    for (let i = 0; i < N * N * 4; i++) f[i] = 255;
    for (let L = 0; L < regions.length; L++) if (colorOf[L]) setRegion(L, colorOf[L], glitterOf[L]);
    paint();
  }
  const tmp = document.createElement('canvas'); tmp.width = tmp.height = N; const tctx = tmp.getContext('2d');
  function paint(clip) {
    if (clip) { ctx.save(); ctx.beginPath(); ctx.arc(clip.x, clip.y, clip.r, 0, Math.PI * 2); ctx.clip(); }
    tctx.putImageData(fill, 0, 0); ctx.drawImage(tmp, 0, 0);
    ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(lineImg, 0, 0); ctx.globalCompositeOperation = 'source-over';
    if (clip) ctx.restore();
  }
  function setRegion(L, color, glitter) {
    const f = fill.data;
    if (color && color[0] === 'g' && guideData && guideCol && guideCol[L]) {
      const cl = guideCol[L], d = guideData;
      for (let k = start[L]; k < start[L + 1]; k++) { const p = order[k], i = p * 4; let best = cl[0], bd = 1e9;
        if (Math.min(d[i], d[i + 1], d[i + 2]) > 236) best = WHITE3;   // white in the coloured version (margin, clouds) stays white
        else if (Math.max(d[i], d[i + 1], d[i + 2]) >= 75) for (const c of cl) { const dd = (c[0] - d[i]) ** 2 + (c[1] - d[i + 1]) ** 2 + (c[2] - d[i + 2]) ** 2; if (dd < bd) { bd = dd; best = c; } }
        f[i] = best[0]; f[i + 1] = best[1]; f[i + 2] = best[2]; }
      return;
    }
    const c = color ? hex(color) : [255, 255, 255];
    for (let k = start[L]; k < start[L + 1]; k++) {
      const i = order[k] * 4;
      if (glitter) {                                // sparkly texture: light speckles and a soft sheen
        const p = order[k], y = (p / N) | 0, x = p - y * N, sh = .18 * Math.sin((x + y) * .045), r = Math.random();
        const m = r < .05 ? .85 : r < .14 ? .45 : Math.max(0, sh);
        f[i] = c[0] + (255 - c[0]) * m; f[i + 1] = c[1] + (255 - c[1]) * m; f[i + 2] = c[2] + (255 - c[2]) * m;
      } else { f[i] = c[0]; f[i + 1] = c[1]; f[i + 2] = c[2]; }
    }
  }

  /* ── the magic crayon: Mo's real colours from the guide, or cheerful colours that never touch the same colour ── */
  function loadGuide(src) {
    guideImg = null; if (!src) return;
    const g = new Image(); g.onload = () => { guideImg = g; guideCol = null; }; g.onerror = () => { guideImg = null; }; g.src = src;
  }
  /* The coloured version → for each shape, its main colours (up to 4, each at least 10% of it).
     One colour: a flat fill. Several (a sky and grass that share a shape because of a tiny gap in a line,
     hair that leaks into the sky…): every pixel takes the nearest of them, so each part gets its real colour. */
  let guideData = null;
  function guideColours() {
    if (guideCol || !guideImg) return guideCol;
    const c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d', { willReadFrequently: true }); fitDraw(x, guideImg);
    const d = guideData = x.getImageData(0, 0, N, N).data; guideCol = [];
    for (let L = 0; L < regions.length; L++) {
      const bins = new Map(), step = Math.max(1, Math.floor(regions[L] / 3000)); let all = 0;
      for (let k = start[L]; k < start[L + 1]; k += step) { const i = order[k] * 4, R = d[i], G = d[i + 1], B = d[i + 2];
        if (Math.max(R, G, B) < 75) continue; all++;
        const key = Math.min(R, G, B) > 232 ? -1 : (R >> 5) << 6 | (G >> 5) << 3 | (B >> 5), e = bins.get(key) || [0, 0, 0, 0];
        e[0]++; e[1] += R; e[2] += G; e[3] += B; bins.set(key, e); }
      // merge similar shades (light / dark green…) into one colour each, biggest first
      const groups = [];
      [...bins.entries()].sort((a, b) => b[1][0] - a[1][0]).forEach(([key, e]) => {
        const c = [e[1] / e[0], e[2] / e[0], e[3] / e[0]];
        const g = groups.find(g => key !== -1 && !g.white && (g.c[0] - c[0]) ** 2 + (g.c[1] - c[1]) ** 2 + (g.c[2] - c[2]) ** 2 < 70 * 70);
        if (g) { g.n += e[0]; g.s[0] += e[1]; g.s[1] += e[2]; g.s[2] += e[3]; }
        else groups.push({ n: e[0], s: [e[1], e[2], e[3]], c, white: key === -1 });
      });
      const W = groups.find(g => g.white), wn = W ? W.n : 0;
      let cl = groups.filter(g => !g.white && g.n >= Math.max(30, (all - wn) * .04)).sort((a, b) => b.n - a.n).slice(0, 6)
        .map(g => g.s.map(v => Math.round(v / g.n)));
      if (W && (wn > all * .7 || !cl.length)) cl = [[255, 255, 255]].concat(wn > all * .9 ? [] : cl);
      guideCol[L] = cl.length ? cl : null;
    }
    return guideCol;
  }
  const WHITE3 = [255, 255, 255];
  const toHex = c => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
  function neighbours() {
    if (adj) return adj; adj = regions.map(() => new Set()); const D = 7;
    for (let y = 0; y < N - D; y += 2) for (let x = 0; x < N - D; x += 2) { const i = y * N + x, a = labels[i]; if (a < 0) continue;
      const b = labels[i + D], c = labels[i + D * N]; if (b >= 0 && b !== a) { adj[a].add(b); adj[b].add(a); } if (c >= 0 && c !== a) { adj[a].add(c); adj[c].add(a); } }
    return adj;
  }
  function magicColour(L) {
    const gc = guideColours(); if (gc && gc[L]) return gc[L].length > 1 ? 'g' + L : toHex(gc[L][0]);
    if (L === bgL) return '#D9F1FF';
    const used = new Set([...neighbours()[L]].map(n => colorOf[n]).filter(Boolean));
    const opts2 = HAPPY.filter(h => !used.has(h)); const pool = opts2.length ? opts2 : HAPPY;
    return pool[(L * 7 + regions[L]) % pool.length];
  }

  /* ── tapping ── */
  function regionAt(x, y) {
    let L = labels[y * N + x];
    if (L < 0) for (let d = 1; d < 10 && L < 0; d++) for (const [dx, dy] of [[d, 0], [-d, 0], [0, d], [0, -d]]) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < N && yy < N && labels[yy * N + xx] >= 0) { L = labels[yy * N + xx]; break; } }
    return L;
  }
  function onTap(e) {
    if (busy || !labels) return;
    const r = cvs.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * N), y = Math.floor((e.clientY - r.top) / r.height * N);
    if (x < 0 || y < 0 || x >= N || y >= N) return;
    const L = regionAt(x, y); if (L < 0) return;
    const c = cur, color = c.kind === 'magic' ? magicColour(L) : c.kind === 'rainbow' ? RAINBOW[rbI++ % RAINBOW.length] : c.kind === 'erase' ? null : c.c;
    const glitter = c.kind === 'glitter';
    if (colorOf[L] === color && glitterOf[L] === glitter) { twinkleRegion(L, 5); tone(PENTA[fills % PENTA.length], .06, 'sine', .08); return; }
    fillRegion(L, color, glitter, x, y, c.kind);
  }
  function fillRegion(L, color, glitter, x, y, kind, quick) {
    history.push([L, colorOf[L], glitterOf[L]]); if (history.length > 80) history.shift();
    colorOf[L] = color; glitterOf[L] = !!glitter && !!color; setRegion(L, color, glitterOf[L]);
    if (x == null) { const p = order[start[L] + ((regions[L] / 2) | 0)]; y = (p / N) | 0; x = p - y * N; }
    busy = !quick; const t0 = performance.now(), R = N * 1.1, dur = quick ? 220 : 340;
    const step = now => { const u = Math.max(0, Math.min(1, (now - t0) / dur)); paint({ x, y, r: R * (1 - Math.pow(1 - u, 3)) }); if (u < 1) requestAnimationFrame(step); else { paint(); busy = false; } };
    requestAnimationFrame(step);
    if (!color) { tone(260, .1, 'sine', .14); return; }
    fills++;
    // sound: a climbing xylophone note + crayon swish (+ magic / glitter extras)
    tone(PENTA[fills % PENTA.length], .12, 'triangle', .17); if (!quick) swish();
    if (kind === 'magic') setTimeout(() => chime([1319, 1568, 2093], 55), 90);
    if (glitter) setTimeout(() => chime([2093, 2637, 3136], 45), 80);
    twinkleRegion(L, kind === 'magic' || glitter ? 12 : 7);
    if (!quick && navigator.vibrate) try { navigator.vibrate(12); } catch (er) {}
    checkProgress();
  }
  function undo() {
    const h = history.pop(); if (!h) return;
    colorOf[h[0]] = h[1]; glitterOf[h[0]] = h[2];
    const f = fill.data; for (let k = start[h[0]]; k < start[h[0] + 1]; k++) { const i = order[k] * 4; f[i] = f[i + 1] = f[i + 2] = 255; }
    if (h[1]) setRegion(h[0], h[1], h[2]); paint(); tone(330, .08);
  }

  /* ── twinkles (and glitter that keeps sparkling) ── */
  function twinkleRegion(L, n) {
    for (let i = 0; i < n; i++) { const p = order[start[L] + Math.floor(Math.random() * regions[L])], y = (p / N) | 0, x = p - y * N;
      twinkles.push({ x, y, t: performance.now() + i * 45, life: 520 + Math.random() * 260, s: 10 + Math.random() * 14 }); }
    runFx();
  }
  function star(x, y, s, a) {
    fctx.save(); fctx.globalAlpha = a; fctx.translate(x, y); fctx.fillStyle = '#fff'; fctx.shadowColor = '#FFE27A'; fctx.shadowBlur = s;
    fctx.beginPath(); fctx.moveTo(0, -s); fctx.quadraticCurveTo(0, 0, s, 0); fctx.quadraticCurveTo(0, 0, 0, s); fctx.quadraticCurveTo(0, 0, -s, 0); fctx.quadraticCurveTo(0, 0, 0, -s); fctx.fill(); fctx.restore();
  }
  let lastGlint = 0;
  function runFx() { if (fxOn) return; fxOn = true; requestAnimationFrame(fxLoop); }
  function fxLoop(now) {
    if (!root || !root.classList.contains('on')) { fxOn = false; return; }
    fctx.clearRect(0, 0, N, N);
    if (now - lastGlint > 140) { lastGlint = now;    // glitter shapes keep glinting
      for (let L = 0; L < regions.length; L++) if (glitterOf[L] && Math.random() < .55) { const p = order[start[L] + Math.floor(Math.random() * regions[L])], y = (p / N) | 0, x = p - y * N; twinkles.push({ x, y, t: now, life: 600, s: 7 + Math.random() * 9 }); } }
    twinkles = twinkles.filter(w => now < w.t + w.life);
    twinkles.forEach(w => { if (now < w.t) return; const u = (now - w.t) / w.life, a = Math.sin(Math.PI * u); star(w.x, w.y, w.s * (.5 + a * .7), a); });
    if (twinkles.length || glitterOf.some(Boolean)) requestAnimationFrame(fxLoop); else { fxOn = false; fctx.clearRect(0, 0, N, N); }
  }

  /* ── "✨ Sim salabim": colour everything left, shape by shape ── */
  function magicAll() {
    if (!labels || busy) return;
    const todo = []; for (let L = 0; L < regions.length; L++) if (!colorOf[L] && regions[L] > 120) todo.push(L);
    todo.sort((a, b) => (a === bgL) - (b === bgL) || regions[b] - regions[a]);   // Mo and the things first, the sky last
    if (!todo.length) { checkProgress(true); return; }
    say(LINES.magic[EN ? 1 : 0]); chime([784, 988, 1175, 1568], 60);
    todo.forEach((L, i) => setTimeout(() => fillRegion(L, magicColour(L), false, null, null, 'magic', true), 280 + i * Math.max(70, Math.min(160, 2600 / todo.length))));
  }

  /* ── progress + celebrations ── */
  function coloured() { let tot = 0, got = 0; for (let L = 0; L < regions.length; L++) { if (L === bgL || regions[L] < 120) continue; tot += regions[L]; if (colorOf[L]) got += regions[L]; } return tot ? got / tot : 0; }
  let halfSaid = false;
  function checkProgress(force) {
    if (celebrated && !force) return;
    const done = coloured();
    if (!force && !halfSaid && done > .5 && done < .85) { halfSaid = true; setTimeout(() => say(LINES.almost[EN ? 1 : 0]), 500); }
    if (force || done > .85) { celebrated = true; setTimeout(() => party(LINES.done[EN ? 1 : 0], false), 450); }
  }
  function party(text, closing) {
    const yay = root.querySelector('.mc-yay'); yay.querySelector('b').textContent = text; yay.classList.add('on');
    say(text); chime([523, 659, 784, 1047, 1319], 110);
    const paper = root.querySelector('.mc-paper');
    for (let i = 0; i < 40; i++) { const c = document.createElement('span'); c.className = 'mc-conf'; c.style.left = Math.random() * 100 + '%'; c.style.background = HAPPY[i % HAPPY.length];
      c.style.animationDuration = (1.4 + Math.random() * 1.2) + 's'; c.style.animationDelay = (Math.random() * .5) + 's'; paper.appendChild(c); setTimeout(() => c.remove(), 3200); }
    for (let L = 0; L < regions.length; L++) if (colorOf[L] && Math.random() < .6) twinkleRegion(L, 3);
    setTimeout(() => { yay.classList.remove('on'); if (closing) { close(); opts.onDone && opts.onDone(); } }, closing ? 2300 : 2000);
  }
  function finish() {
    try { const s = document.createElement('canvas'); s.width = s.height = 320; s.getContext('2d').drawImage(cvs, 0, 0, 320, 320);
      const all = JSON.parse(localStorage.getItem(STORE) || '{}'); all[opts.key || 'mo'] = s.toDataURL('image/jpeg', .8);
      const keys = Object.keys(all); if (keys.length > 24) delete all[keys[0]]; localStorage.setItem(STORE, JSON.stringify(all)); } catch (e) {}
    party(T('MasyaAllah, indah! 🌈', 'MashaAllah, beautiful! 🌈'), true);
  }
  function close() { root.classList.remove('on'); document.documentElement.style.overflow = ''; twinkles = []; }
  function open(o) {
    opts = o || {}; if (!root) build();
    root.querySelector('.mc-title').textContent = opts.title || T('Warnai Baby Mo 🖍️', 'Colour Baby Mo 🖍️');
    root.querySelector('.mc-done').textContent = T('Selesai! ⭐', 'Done! ⭐');
    root.querySelector('.mc-auto').textContent = T('✨ Sim salabim', '✨ Magic!');
    root.classList.add('on'); document.documentElement.style.overflow = 'hidden';
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, N, N); fctx.clearRect(0, 0, N, N); labels = null;
    cur = CRAYONS[0]; root.querySelectorAll('.mc-c').forEach((x, i) => x.classList.toggle('sel', i === 0));
    loadGuide(opts.guide);
    const img = new Image(); img.onload = () => { analyse(img); renderAll(); say(LINES.start[EN ? 1 : 0]); }; img.src = opts.src;
  }
  window.MoColor = { open, CRAYONS, LINES,
    saved: k => { try { return (JSON.parse(localStorage.getItem(STORE) || '{}'))[k] || null; } catch (e) { return null; } } };
})();
