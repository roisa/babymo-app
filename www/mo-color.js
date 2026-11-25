/* Baby Mo colouring — brush-and-tap colouring pages made for 2–4 year olds (25 Nov 2026).
   MoColor.open({ src, guide, title, key, onDone })
     src   : black line art on white (PNG, square, thick closed outlines)
     guide : optional coloured version of the very same page. The 🪄 magic crayon paints it in: brushing reveals the
             real colours (with their shading) exactly where the finger goes; without a guide it paints cheerful colours.
     key   : where the finished picture is remembered (localStorage "bm_mo_color" → { key: dataURL })
   Drag = brush the colour on (crayons stay inside the shape the stroke started in). Tap = the colour spreads over the
   shape like wet paint. Every stroke sparkles, plays notes and a soft brush swish; glitter keeps twinkling.
   "✨ Sim salabim" sweeps a magic brush over the whole picture. A celebration pops up when most of it is coloured. */
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
  const CHEER = [['Hebat!', 'Awesome!'], ['Keren!', 'Great job!']];   // recorded clips (Meet Baby Mo / Memory Match)
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
  #moColor .mc-meter{position:relative;width:100%;max-width:min(560px,70vh);height:20px;margin:6px auto 0;border-radius:999px;background:#fff;box-shadow:inset 0 2px 4px rgba(60,40,120,.15),0 4px 10px -6px rgba(60,40,120,.4)}
  #moColor .mc-meter i{position:absolute;left:3px;top:3px;bottom:3px;width:0;border-radius:999px;background:linear-gradient(90deg,#FF6B6B,#FFB13B,#FFE066,#5FD068,#3EC1D3,#5B8CFF,#B07CF0);background-size:min(560px,70vh) 100%;transition:width .5s cubic-bezier(.3,1.4,.5,1)}
  #moColor .mc-meter i::after{content:'';position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,0) 60%)}
  #moColor .mc-meter b{position:absolute;right:-10px;top:50%;width:38px;height:38px;margin-top:-19px;display:grid;place-items:center;font-size:30px;filter:drop-shadow(0 3px 3px rgba(60,40,120,.3)) grayscale(.85);opacity:.7;transition:filter .3s,opacity .3s}
  #moColor .mc-meter.full b{filter:drop-shadow(0 0 10px #FFD23F);opacity:1}
  #moColor .mc-meter b.pop{animation:mcStarPop .7s cubic-bezier(.3,1.6,.5,1)}
  @keyframes mcStarPop{0%{transform:scale(1)}40%{transform:scale(1.7) rotate(25deg)}100%{transform:scale(1)}}
  #moColor .mc-cheer{position:absolute;left:50%;top:38%;transform:translate(-50%,-50%) scale(.3);opacity:0;pointer-events:none;font:700 clamp(30px,9vw,52px)/1 'Fredoka','Nunito',sans-serif;color:#fff;
    -webkit-text-stroke:2px rgba(120,40,160,.35);text-shadow:0 4px 0 #B07CF0,0 0 22px rgba(255,210,63,.9);white-space:nowrap;z-index:3}
  #moColor .mc-cheer.on{animation:mcCheer 1.4s cubic-bezier(.2,1.4,.4,1) forwards}
  @keyframes mcCheer{0%{opacity:0;transform:translate(-50%,-50%) scale(.3) rotate(-8deg)}20%{opacity:1;transform:translate(-50%,-50%) scale(1.15) rotate(3deg)}35%{transform:translate(-50%,-50%) scale(1)}80%{opacity:1}100%{opacity:0;transform:translate(-50%,-80%) scale(.9)}}
  @media (prefers-reduced-motion:reduce){#moColor .mc-conf,#moColor .mc-c.magic.sel svg{animation:none;display:none}}`;

  /* ═══ Painting model (brushing) ═══
     colorC  : the child's colours (white to start)          eyeC : real eye colours revealed by the magic crayon
     strokeC : soft white dabs of the stroke being painted   maskC: the shape the stroke started in (crayons stay inside it)
     srcC    : what the current crayon paints (a flat colour, glitter, rainbow bands, or the magic picture)
     targetC : the magic picture = the coloured version, cleaned so every shape holds only its own colours
     The view = colorC + (src ∩ stroke ∩ mask) → × line art → eyes. A tap spreads the colour over the shape like
     wet paint; a drag brushes it on under the finger. */
  const mk = () => { const c = document.createElement('canvas'); c.width = c.height = N; return c; };
  const colorC = mk(), eyeC = mk(), strokeC = mk(), maskC = mk(), srcC = mk(), tmpC = mk(), eyeTmpC = mk(), targetC = mk(), eyeTargetC = mk();
  const cx = c => c.getContext('2d', { willReadFrequently: true });
  let root, cvs, ctx, fx, fctx, lineImg, labels, regions, order, start, bgL = -1, opts = {}, audio, cur = CRAYONS[0],
      guideImg = null, guideData = null, guideCol = null, targetReady = false, blobs = [], adj = null,
      stroke = null, undoStack = [], glitPts = [], twinkles = [], fxOn = false, celebrated = false, halfSaid = false,
      samplePts = null, autoRun = false, rbShift = 0, noteI = 0,
      // rewards: which sample points are painted, finished shapes, the progress bar, particles and the magic wand
      ptL = null, ptX = null, ptY = null, covered = null, regTot = null, regCov = null, doneR = null, grid = null, doneArea = 0, totArea = 1, milestone = 0,
      parts = [], flashes = [], wand = null, shimmer = null, lastReward = 0, tgtData = null;

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
      <div class="mc-meter" aria-hidden="true"><i></i><b>⭐</b></div>
      <div class="mc-stage"><div class="mc-paper"><div class="mc-cheer"></div><canvas class="art" width="${N}" height="${N}"></canvas><canvas class="fx" width="${N}" height="${N}"></canvas><div class="mc-yay"><i>⭐</i><b></b></div></div></div>
      <div class="mc-pal" role="radiogroup" aria-label="${T('Krayon', 'Crayons')}"></div>
      <div class="mc-row"><button class="mc-btn mc-auto" type="button"></button><button class="mc-btn mc-done" type="button"></button></div></div>`);
    document.body.appendChild(root);
    cvs = root.querySelector('canvas.art'); ctx = cx(cvs);
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
    cvs.addEventListener('pointerdown', onDown);
    cvs.addEventListener('pointermove', onMove);
    cvs.addEventListener('pointerup', onUp);
    cvs.addEventListener('pointercancel', onUp);
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
  function swish(vol) {
    const A = ac(); if (!A) return;
    try { const len = Math.floor(A.sampleRate * .16), b = A.createBuffer(1, len, A.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / len) * .5;
      const s = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain(); s.buffer = b; f.type = 'bandpass'; f.frequency.value = 2200 + Math.random() * 600; f.Q.value = .8; g.gain.value = vol || .2;
      s.connect(f); f.connect(g); g.connect(A.destination); s.start(); } catch (e) {}
  }
  function note(vol) { tone(PENTA[noteI++ % PENTA.length], .1, 'triangle', vol || .13); }
  function say(t) { try { const u = new SpeechSynthesisUtterance(t); u.lang = EN ? 'en-US' : 'id-ID'; u.pitch = 1.2; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {} }

  /* ── the line art → shapes ── */
  function fitDraw(x, img) {
    x.fillStyle = '#fff'; x.fillRect(0, 0, N, N);
    const k = Math.min(N / img.naturalWidth, N / img.naturalHeight), w = img.naturalWidth * k, h = img.naturalHeight * k;
    x.drawImage(img, (N - w) / 2, (N - h) / 2, w, h);
  }
  function analyse(img) {
    const c = mk(), x = cx(c); fitDraw(x, img); lineImg = c;
    const d = x.getImageData(0, 0, N, N).data, wall = new Uint8Array(N * N);
    for (let i = 0; i < N * N; i++) { if (d[i * 4] * .3 + d[i * 4 + 1] * .59 + d[i * 4 + 2] * .11 < 160) wall[i] = 1; }
    const w2 = wall.slice();
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
    // the colour reaches right under the lines (no white halo next to them)
    for (let pass = 0; pass < 3; pass++) for (let i = N; i < N * N - N; i++) if (labels[i] < 0 && (pass > 0 || !wall[i])) { const a = labels[i - 1] >= 0 ? labels[i - 1] : labels[i + 1] >= 0 ? labels[i + 1] : labels[i - N] >= 0 ? labels[i - N] : labels[i + N]; if (a >= 0) labels[i] = a; }
    const R = regions.length, cnt = new Int32Array(R + 1);
    for (let i = 0; i < N * N; i++) if (labels[i] >= 0) cnt[labels[i] + 1]++;
    start = new Int32Array(R + 1); for (let r = 0; r < R; r++) start[r + 1] = start[r] + cnt[r + 1];
    order = new Int32Array(start[R]); const pos = start.slice(0, R);
    for (let i = 0; i < N * N; i++) { const L = labels[i]; if (L >= 0) order[pos[L]++] = i; }
    for (let r = 0; r < R; r++) regions[r] = start[r + 1] - start[r];
    bgL = -1; let best = 0;
    for (let i = 0; i < N; i++) for (const p of [i, (N - 1) * N + i, i * N, i * N + N - 1]) { const L = labels[p]; if (L >= 0 && regions[L] > best) { best = regions[L]; bgL = L; } }
    findBlobs(wall);
    // sample points for "how much is coloured" (Mo and the things, not the sky)
    samplePts = []; const pl = [];
    for (let L = 0; L < R; L++) { if (L === bgL || regions[L] < 150) continue; const k = Math.max(1, Math.floor(regions[L] / 40)); for (let j = start[L]; j < start[L + 1]; j += k) { samplePts.push(order[j]); pl.push(L); } }
    const M = samplePts.length; ptL = Int32Array.from(pl); ptX = new Float32Array(M); ptY = new Float32Array(M); covered = new Uint8Array(M);
    regTot = new Int32Array(R); regCov = new Int32Array(R); doneR = new Uint8Array(R); grid = new Map(); doneArea = 0; totArea = 1; milestone = 0;
    for (let m = 0; m < M; m++) { const p = samplePts[m], y = (p / N) | 0, x = p - y * N; ptX[m] = x; ptY[m] = y; regTot[pl[m]]++;
      const key = (x >> 5) + ',' + (y >> 5); (grid.get(key) || grid.set(key, []).get(key)).push(m); }
    for (let L = 0; L < R; L++) if (regTot[L]) totArea += regions[L];
    adj = null; guideCol = null; targetReady = false; maskCache.clear();
  }
  /* Mo's eyes are solid black on the page; the magic crayon reveals their real colours (iris, shine) */
  function findBlobs(wall) {
    blobs = [];
    let m = wall;
    const erode = a => { const o = new Uint8Array(N * N); for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) { const i = y * N + x; o[i] = a[i] && a[i - 1] && a[i + 1] && a[i - N] && a[i + N] ? 1 : 0; } return o; };
    const dilate = a => { const o = new Uint8Array(N * N); for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) { const i = y * N + x; o[i] = a[i] || a[i - 1] || a[i + 1] || a[i - N] || a[i + N] ? 1 : 0; } return o; };
    for (let k = 0; k < 4; k++) m = erode(m);
    let any = false; for (let i = 0; i < N * N; i++) if (m[i]) { any = true; break; } if (!any) return;
    for (let k = 0; k < 5; k++) m = dilate(m);
    const seen = new Uint8Array(N * N), st = new Int32Array(N * N);
    for (let s0 = 0; s0 < N * N; s0++) {
      if (!m[s0] || !wall[s0] || seen[s0]) continue;
      let sp = 0; const px = []; st[sp++] = s0; seen[s0] = 1;
      while (sp) { const i = st[--sp]; px.push(i); for (const j of [i - 1, i + 1, i - N, i + N]) if (j >= 0 && j < N * N && m[j] && wall[j] && !seen[j]) { seen[j] = 1; st[sp++] = j; } }
      if (px.length < 40 || px.length > N * N * .02) continue;
      let x0 = N, x1 = 0, y0 = N, y1 = 0; for (const i of px) { const y = (i / N) | 0, x = i - y * N; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
      if (Math.max(bw, bh) > 2.2 * Math.min(bw, bh) || px.length < .45 * bw * bh) continue;
      const cnt = new Map();
      for (const i of px) for (const j of [i - 3, i + 3, i - 3 * N, i + 3 * N]) { const L = labels[j]; if (L >= 0) cnt.set(L, (cnt.get(L) || 0) + 1); }
      let L = -1, best = 0; cnt.forEach((v, k) => { if (v > best) { best = v; L = k; } });
      if (L >= 0) blobs.push({ px: Int32Array.from(px), L });
    }
  }
  const maskCache = new Map();
  function regionMask(L) {
    if (maskCache.has(L)) return maskCache.get(L);
    const c = mk(), x = cx(c), img = x.createImageData(N, N), o = img.data;
    for (let k = start[L]; k < start[L + 1]; k++) { const i = order[k] * 4; o[i] = o[i + 1] = o[i + 2] = o[i + 3] = 255; }
    x.putImageData(img, 0, 0); maskCache.set(L, c); if (maskCache.size > 8) maskCache.delete(maskCache.keys().next().value);
    return c;
  }

  /* ── the magic picture: the coloured version, cleaned shape by shape ── */
  function loadGuide(src) {
    guideImg = null; guideData = null; if (!src) return;
    const g = new Image(); g.onload = () => { guideImg = g; guideData = null; guideCol = null; if (labels) targetReady = false; }; g.src = src;
  }
  function clusters() {
    if (guideCol) return guideCol;
    const d = guideData; guideCol = [];
    for (let L = 0; L < regions.length; L++) {
      const bins = new Map(), step = Math.max(1, Math.floor(regions[L] / 3000)); let all = 0;
      for (let k = start[L]; k < start[L + 1]; k += step) { const i = order[k] * 4, R = d[i], G = d[i + 1], B = d[i + 2];
        if (Math.max(R, G, B) < 75) continue; all++;
        const key = Math.min(R, G, B) > 232 ? -1 : (R >> 5) << 6 | (G >> 5) << 3 | (B >> 5), e = bins.get(key) || [0, 0, 0, 0];
        e[0]++; e[1] += R; e[2] += G; e[3] += B; bins.set(key, e); }
      const groups = [];
      [...bins.entries()].sort((a, b) => b[1][0] - a[1][0]).forEach(([key, e]) => {
        const c = [e[1] / e[0], e[2] / e[0], e[3] / e[0]];
        const g = groups.find(g => key !== -1 && !g.white && (g.c[0] - c[0]) ** 2 + (g.c[1] - c[1]) ** 2 + (g.c[2] - c[2]) ** 2 < 70 * 70);
        if (g) { g.n += e[0]; g.s[0] += e[1]; g.s[1] += e[2]; g.s[2] += e[3]; }
        else groups.push({ n: e[0], s: [e[1], e[2], e[3]], c, white: key === -1 });
      });
      const W = groups.find(g => g.white), wn = W ? W.n : 0;
      let cl = groups.filter(g => !g.white && g.n >= Math.max(30, (all - wn) * .04)).sort((a, b) => b.n - a.n).slice(0, 6).map(g => g.s.map(v => Math.round(v / g.n)));
      if (W && (wn > all * .7 || !cl.length)) cl = [[255, 255, 255]].concat(wn > all * .9 ? [] : cl);
      guideCol[L] = cl.length ? cl : null;
    }
    return guideCol;
  }
  function neighbours() {
    if (adj) return adj; adj = regions.map(() => new Set()); const D = 7;
    for (let y = 0; y < N - D; y += 2) for (let x = 0; x < N - D; x += 2) { const i = y * N + x, a = labels[i]; if (a < 0) continue;
      const b = labels[i + D], c = labels[i + D * N]; if (b >= 0 && b !== a) { adj[a].add(b); adj[b].add(a); } if (c >= 0 && c !== a) { adj[a].add(c); adj[c].add(a); } }
    return adj;
  }
  function buildTarget() {
    if (targetReady || !labels) return;
    const tx = cx(targetC), img = tx.createImageData(N, N), o = img.data;
    for (let i = 0; i < N * N * 4; i += 4) { o[i] = o[i + 1] = o[i + 2] = 255; o[i + 3] = 255; }
    if (guideImg) {
      const g = mk(), gx = cx(g); fitDraw(gx, guideImg); guideData = gx.getImageData(0, 0, N, N).data; guideCol = null;
      const cl = clusters(), d = guideData;
      for (let L = 0; L < regions.length; L++) {
        const C = cl[L] || [[255, 255, 255]];
        for (let k = start[L]; k < start[L + 1]; k++) {
          const p = order[k], i = p * 4, r = d[i], gg = d[i + 1], b = d[i + 2];
          let c;
          if (Math.min(r, gg, b) > 236) c = [255, 255, 255];                       // white stays white (margin, clouds)
          else if (Math.max(r, gg, b) < 75) c = C[0];                              // the coloured version's own outline → the shape's colour
          else { let bd = 1e9, bc = C[0]; for (const q of C) { const dd = (q[0] - r) ** 2 + (q[1] - gg) ** 2 + (q[2] - b) ** 2; if (dd < bd) { bd = dd; bc = q; } }
            c = bd < 55 * 55 ? [r, gg, b] : bc; }                                  // its real shade, or the shape's colour where the two pictures differ
          o[i] = c[0]; o[i + 1] = c[1]; o[i + 2] = c[2];
        }
      }
      // eyes
      const ex = cx(eyeTargetC), ei = ex.createImageData(N, N), eo = ei.data;
      for (const bl of blobs) { const sk = cl[bl.L] && cl[bl.L][0];
        for (const p of bl.px) { const i = p * 4, r = d[i], gg = d[i + 1], b = d[i + 2];
          if (Math.max(r, gg, b) < 45) continue;
          if (sk && (sk[0] - r) ** 2 + (sk[1] - gg) ** 2 + (sk[2] - b) ** 2 < 45 * 45) continue;
          eo[i] = r; eo[i + 1] = gg; eo[i + 2] = b; eo[i + 3] = 255; } }
      ex.putImageData(ei, 0, 0);
    } else {
      // no coloured version: cheerful colours that never touch the same colour, light sky behind
      const used = new Array(regions.length).fill(null), nb = neighbours();
      for (let L = 0; L < regions.length; L++) {
        let col = '#D9F1FF';
        if (L !== bgL) { const near = new Set([...nb[L]].map(n => used[n]).filter(Boolean)); const pool = HAPPY.filter(h => !near.has(h)); col = (pool.length ? pool : HAPPY)[(L * 7 + regions[L]) % (pool.length || HAPPY.length)]; }
        used[L] = col; const c = hex(col);
        for (let k = start[L]; k < start[L + 1]; k++) { const i = order[k] * 4; o[i] = c[0]; o[i + 1] = c[1]; o[i + 2] = c[2]; }
      }
      cx(eyeTargetC).clearRect(0, 0, N, N);
    }
    tx.putImageData(img, 0, 0); tgtData = o; targetReady = true;
  }
  function hex(c) { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }

  /* ── what each crayon paints ── */
  function makeSource(c) {
    const x = cx(srcC); x.globalCompositeOperation = 'source-over';
    if (c.kind === 'magic') { buildTarget(); x.clearRect(0, 0, N, N); x.drawImage(targetC, 0, 0); return; }
    if (c.kind === 'rainbow') {
      const g = x.createLinearGradient(0, 0, N, N), k = (rbShift++ % RAINBOW.length);
      for (let i = 0; i <= 16; i++) g.addColorStop(i / 16, RAINBOW[(i + k) % RAINBOW.length]);
      x.fillStyle = g; x.fillRect(0, 0, N, N); return;
    }
    x.fillStyle = c.c; x.fillRect(0, 0, N, N);
    if (c.kind === 'glitter') {                   // sparkly texture: light speckles + soft diagonal sheen
      const g = x.createLinearGradient(0, 0, N, N); for (let i = 0; i <= 12; i++) g.addColorStop(i / 12, i % 2 ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,.28)');
      x.fillStyle = g; x.fillRect(0, 0, N, N);
      for (let i = 0; i < 5000; i++) { x.fillStyle = Math.random() < .35 ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.5)'; const s = Math.random() < .2 ? 2.4 : 1.4; x.fillRect(Math.random() * N, Math.random() * N, s, s); }
    }
  }

  /* ── drawing ── */
  function compose() {
    if (!stroke) return;
    const t = cx(tmpC); t.globalCompositeOperation = 'source-over'; t.clearRect(0, 0, N, N); t.drawImage(srcC, 0, 0);
    t.globalCompositeOperation = 'destination-in'; t.drawImage(strokeC, 0, 0);
    if (stroke.mask) t.drawImage(stroke.mask, 0, 0);
    t.globalCompositeOperation = 'source-over';
    if (stroke.magic) { const e = cx(eyeTmpC); e.globalCompositeOperation = 'source-over'; e.clearRect(0, 0, N, N); e.drawImage(eyeTargetC, 0, 0);
      e.globalCompositeOperation = 'destination-in'; e.drawImage(strokeC, 0, 0); e.globalCompositeOperation = 'source-over'; }
  }
  function render() {
    ctx.globalCompositeOperation = 'source-over'; ctx.drawImage(colorC, 0, 0);
    if (stroke) ctx.drawImage(tmpC, 0, 0);
    ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(lineImg, 0, 0); ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(eyeC, 0, 0); if (stroke && stroke.magic) ctx.drawImage(eyeTmpC, 0, 0);
  }
  let raf = 0; function draw() { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; compose(); render(); }); }
  function dab(x, y, r) {
    const s = cx(strokeC), g = s.createRadialGradient(x, y, r * .35, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.75, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    s.fillStyle = g; s.beginPath(); s.arc(x, y, r, 0, Math.PI * 2); s.fill();
  }
  function snapshot() {
    const a = mk(), b = mk(); cx(a).drawImage(colorC, 0, 0); cx(b).drawImage(eyeC, 0, 0);
    undoStack.push({ a, b, g: glitPts.length }); if (undoStack.length > 12) undoStack.shift();
  }
  function commit() {
    if (!stroke) return;
    compose(); cx(colorC).drawImage(tmpC, 0, 0); if (stroke.magic) cx(eyeC).drawImage(eyeTmpC, 0, 0);
    stroke = null; cx(strokeC).clearRect(0, 0, N, N); render(); checkProgress();
  }
  function toCanvas(e) { const r = cvs.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * N, (e.clientY - r.top) / r.height * N]; }
  function regionAt(x, y) {
    x = Math.max(0, Math.min(N - 1, x | 0)); y = Math.max(0, Math.min(N - 1, y | 0));
    let L = labels[y * N + x];
    if (L < 0) for (let d = 1; d < 12 && L < 0; d++) for (const [dx, dy] of [[d, 0], [-d, 0], [0, d], [0, -d]]) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < N && yy < N && labels[yy * N + xx] >= 0) { L = labels[yy * N + xx]; break; } }
    return L;
  }
  const BR = N * .05;                              // brush size
  function onDown(e) {
    if (!labels || autoRun) return;
    e.preventDefault(); try { cvs.setPointerCapture(e.pointerId); } catch (er) {}
    const magic = cur.kind === 'magic', [x, y] = toCanvas(e), L = regionAt(x, y); if (L < 0 && !magic) return;   // the magic brush can start anywhere
    snapshot(); makeSource(cur); cx(strokeC).clearRect(0, 0, N, N);
    stroke = { L, magic, mask: magic ? null : regionMask(L), x, y, x0: x, y0: y, t0: performance.now(), moved: 0, lastNote: 0, lastSwish: 0, glitter: cur.kind === 'glitter' };
    dab(x, y, BR); swish(.16); draw();
    if (cur.kind !== 'erase') cover(x, y, BR, magic ? null : L);
    if (magic) { shimmerOn(); wand = { x, y }; chime([1568, 2093], 50); runFx(); }
    if (navigator.vibrate) try { navigator.vibrate(8); } catch (er) {}
  }
  function onMove(e) {
    if (!stroke || stroke.spreading) return;
    const [x, y] = toCanvas(e), dx = x - stroke.x, dy = y - stroke.y, dist = Math.hypot(dx, dy);
    if (dist < 2) return;
    const n = Math.ceil(dist / (BR * .3));
    for (let i = 1; i <= n; i++) { const px = stroke.x + dx * i / n, py = stroke.y + dy * i / n; dab(px, py, BR * (.92 + Math.random() * .16)); if (cur.kind !== 'erase') cover(px, py, BR, stroke.magic ? null : stroke.L); }
    if (stroke.magic) { wand = { x, y }; trail(x, y); }
    stroke.x = x; stroke.y = y; stroke.moved += dist;
    const now = performance.now();
    if (stroke.moved - stroke.lastNote > N * (stroke.magic ? .05 : .09)) { stroke.lastNote = stroke.moved; if (stroke.magic) tone(PENTA[5 + Math.floor(Math.random() * 5)], .08, 'sine', .09); else note(.1); addTwinkle(x, y, stroke.magic || stroke.glitter ? 3 : 2); if (stroke.glitter) glitPts.push([x, y]); }
    if (now - stroke.lastSwish > 150) { stroke.lastSwish = now; swish(.12); }
    draw();
  }
  function onUp() {
    shimmerOff(); wand = null;
    if (!stroke || stroke.spreading) return;
    const tap = stroke.moved < N * .02 && performance.now() - stroke.t0 < 450;
    if (tap && stroke.L >= 0) spread(stroke); else { if (stroke.glitter) glitPts.push([stroke.x, stroke.y]); commit(); }
  }
  /* a tap: the colour spreads over the whole shape like wet paint, from the finger outwards */
  function spread(s, done) {
    s.spreading = true; if (!s.mask) s.mask = regionMask(s.L);   // a tap only fills the shape it landed on
    const L = s.L; let maxR = 0;
    for (let k = start[L]; k < start[L + 1]; k += 37) { const p = order[k], y = (p / N) | 0, x = p - y * N; maxR = Math.max(maxR, Math.hypot(x - s.x0, y - s.y0)); }
    maxR += BR; const t0 = performance.now(), dur = Math.min(900, 300 + maxR * 1.1);
    note(.15); swish(.2); setTimeout(() => swish(.15), 160);
    const step = now => {
      const u = Math.min(1, (now - t0) / dur), r = maxR * (1 - Math.pow(1 - u, 2.2)), ring = Math.max(10, Math.floor(r / 5));
      for (let i = 0; i < ring; i++) { const a = Math.random() * Math.PI * 2, rr = r * (.55 + Math.random() * .45); dab(s.x0 + Math.cos(a) * rr, s.y0 + Math.sin(a) * rr, BR * (1 + u * 1.6)); }
      dab(s.x0, s.y0, Math.max(BR, r * .7));
      draw();
      if (u < 1) requestAnimationFrame(step);
      else {
        cx(strokeC).fillStyle = '#fff'; cx(strokeC).fillRect(0, 0, N, N);   // finish the whole shape cleanly
        if (s.magic) revealEyes(L);
        if (s.glitter) glitPts.push([s.x0, s.y0]);
        twinkleRegion(L, s.magic || s.glitter ? 12 : 7); if (cur.kind !== 'erase') coverRegion(L, false);
        if (s.magic) chime([1319, 1568, 2093], 55);
        commit(); done && done();
      }
    };
    requestAnimationFrame(step);
  }
  function revealEyes(L) {               // a magic tap on the face shows the eyes' real colours too
    const e = cx(eyeC);
    for (const b of blobs) if (b.L === L) {
      let x0 = N, x1 = 0, y0 = N, y1 = 0; for (const p of b.px) { const y = (p / N) | 0, x = p - y * N; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      e.drawImage(eyeTargetC, x0, y0, x1 - x0 + 1, y1 - y0 + 1, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
    }
  }
  function undo() {
    if (stroke || autoRun) return; const h = undoStack.pop(); if (!h) return;
    const a = cx(colorC); a.clearRect(0, 0, N, N); a.drawImage(h.a, 0, 0); const b = cx(eyeC); b.clearRect(0, 0, N, N); b.drawImage(h.b, 0, 0);
    glitPts.length = h.g; render(); tone(330, .08);
  }

  /* ── rewards: painted shapes "ding" + shine + star burst; a rainbow bar fills; Mo cheers at ¼ ½ ¾ ── */
  function cover(x, y, r, onlyL) {
    if (!grid) return; const touched = new Set(), rr = r * .85, r2 = rr * rr;
    for (let gx = (x - rr) >> 5; gx <= (x + rr) >> 5; gx++) for (let gy = (y - rr) >> 5; gy <= (y + rr) >> 5; gy++) {
      const cell = grid.get(gx + ',' + gy); if (!cell) continue;
      for (const m of cell) { if (covered[m]) continue; const L = ptL[m]; if (onlyL != null && L !== onlyL) continue;
        const dx = ptX[m] - x, dy = ptY[m] - y; if (dx * dx + dy * dy < r2) { covered[m] = 1; regCov[L]++; touched.add(L); } } }
    touched.forEach(L => { if (!doneR[L] && regCov[L] >= regTot[L] * .85) finishRegion(L, false); });
  }
  function coverRegion(L, quiet) {
    if (!grid || L < 0 || !regTot[L]) return;
    for (let m = 0; m < ptL.length; m++) if (ptL[m] === L && !covered[m]) { covered[m] = 1; regCov[L]++; }
    if (!doneR[L]) finishRegion(L, quiet);
  }
  function centroid(L) { let sx = 0, sy = 0, n = 0; for (let k = start[L]; k < start[L + 1]; k += 23) { const p = order[k], y = (p / N) | 0; sx += p - y * N; sy += y; n++; } return [sx / n, sy / n]; }
  function finishRegion(L, quiet) {
    doneR[L] = 1; doneArea += regions[L];
    const now = performance.now();
    if (!quiet && regions[L] > 400 && now - lastReward > 220) {
      lastReward = now;
      const [x, y] = centroid(L), big = regions[L] > N * N * .03;
      flashes.push({ L, t: now }); burst(x, y, big ? 22 : 12, big ? 1.4 : 1);
      const base = [523, 659, 784, 1047, 1319], k = Math.floor(Math.random() * 3);
      chime(big ? [base[k], base[k + 1], base[k + 2], base[k + 2] * 2] : [base[k + 1] * 2, base[k + 2] * 2], 60);
      if (navigator.vibrate) try { navigator.vibrate(big ? [10, 30, 16] : 10); } catch (er) {}
      runFx();
    }
    meter();
  }
  function burst(x, y, n, k) {
    for (let i = 0; i < n; i++) { const a = Math.PI * 2 * i / n + Math.random() * .4, v = (2.2 + Math.random() * 3.2) * (k || 1);
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.2, g: .12, life: 700 + Math.random() * 400, t: performance.now(), s: 7 + Math.random() * 9, c: HAPPY[i % HAPPY.length], star: i % 3 !== 2 }); }
  }
  function meter() {
    const f = Math.min(1, doneArea / totArea), bar = root.querySelector('.mc-meter'), st = bar.querySelector('b');
    bar.querySelector('i').style.width = 'calc(' + (f * 100) + '% - ' + (6 * f) + 'px)'; bar.classList.toggle('full', f >= .85);
    const steps = [[.25, CHEER[0]], [.5, CHEER[1]], [.75, LINES.almost]];
    while (milestone < steps.length && f >= steps[milestone][0]) {
      const line = steps[milestone][1][EN ? 1 : 0]; milestone++;
      if (autoRun) continue;
      st.classList.remove('pop'); void st.offsetWidth; st.classList.add('pop');
      const ch = root.querySelector('.mc-cheer'); ch.textContent = line; ch.classList.remove('on'); void ch.offsetWidth; ch.classList.add('on');
      setTimeout(() => { say(line); fanfare(); }, 120);
      for (let i = 0; i < 3; i++) setTimeout(() => burst(N * (.2 + Math.random() * .6), N * (.2 + Math.random() * .5), 14, 1.2), i * 160);
    }
    if (f >= .85 && !celebrated) { celebrated = true; setTimeout(() => party(LINES.done[EN ? 1 : 0], false), 700); }
  }
  function fanfare() { [[523, 0], [659, 90], [784, 180], [1047, 300], [784, 420], [1047, 520]].forEach(([f, t]) => setTimeout(() => tone(f, .14, 'triangle', .15), t)); }
  /* a soft magical shimmer that plays while the magic crayon is moving */
  function shimmerOn() {
    const A = ac(); if (!A || shimmer) return;
    try { const g = A.createGain(); g.gain.value = .0001; g.connect(A.destination);
      const o1 = A.createOscillator(), o2 = A.createOscillator(), l = A.createOscillator(), lg = A.createGain();
      o1.type = 'sine'; o1.frequency.value = 1568; o2.type = 'sine'; o2.frequency.value = 2093 * 1.003; l.frequency.value = 7; lg.gain.value = 18;
      l.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency); o1.connect(g); o2.connect(g); o1.start(); o2.start(); l.start();
      g.gain.exponentialRampToValueAtTime(.035, A.currentTime + .15); shimmer = { g, o: [o1, o2, l] }; } catch (e) {}
  }
  function shimmerOff() {
    if (!shimmer || !audio) return; const s = shimmer; shimmer = null;
    try { s.g.gain.cancelScheduledValues(audio.currentTime); s.g.gain.setValueAtTime(Math.max(.0001, s.g.gain.value), audio.currentTime); s.g.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + .25);
      setTimeout(() => s.o.forEach(o => { try { o.stop(); } catch (e) {} }), 320); } catch (e) {}
  }
  function trail(x, y) {             // sparkles in the colours being revealed
    let c = '#FFE27A';
    if (tgtData) { const i = ((y | 0) * N + (x | 0)) * 4; if (i >= 0 && i < tgtData.length) c = 'rgb(' + Math.min(255, tgtData[i] + 40) + ',' + Math.min(255, tgtData[i + 1] + 40) + ',' + Math.min(255, tgtData[i + 2] + 40) + ')'; }
    for (let i = 0; i < 2; i++) parts.push({ x: x + (Math.random() - .5) * BR, y: y + (Math.random() - .5) * BR, vx: (Math.random() - .5) * 1.6, vy: -.6 - Math.random() * 1.4, g: .03, life: 650, t: performance.now(), s: 5 + Math.random() * 7, c, star: Math.random() < .6 });
    runFx();
  }

  /* ── twinkles (and glitter that keeps sparkling) ── */
  function addTwinkle(x, y, n) { for (let i = 0; i < n; i++) twinkles.push({ x: x + (Math.random() - .5) * BR * 2, y: y + (Math.random() - .5) * BR * 2, t: performance.now() + i * 60, life: 520 + Math.random() * 260, s: 9 + Math.random() * 12 }); runFx(); }
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
    if (glitPts.length && now - lastGlint > 150) { lastGlint = now;
      for (let k = 0; k < 3; k++) { const q = glitPts[Math.floor(Math.random() * glitPts.length)]; twinkles.push({ x: q[0] + (Math.random() - .5) * BR * 2.5, y: q[1] + (Math.random() - .5) * BR * 2.5, t: now, life: 600, s: 6 + Math.random() * 8 }); } }
    flashes = flashes.filter(f => now < f.t + 520);
    flashes.forEach(f => { const u = (now - f.t) / 520; fctx.save(); fctx.globalAlpha = .6 * Math.sin(Math.PI * Math.min(1, u * 1.3)); fctx.drawImage(regionMask(f.L), 0, 0); fctx.restore(); });
    twinkles = twinkles.filter(w => now < w.t + w.life);
    twinkles.forEach(w => { if (now < w.t) return; const u = (now - w.t) / w.life, a = Math.sin(Math.PI * u); star(w.x, w.y, w.s * (.5 + a * .7), a); });
    parts = parts.filter(q => now < q.t + q.life);
    parts.forEach(q => { q.vy += q.g; q.x += q.vx; q.y += q.vy; const a = 1 - (now - q.t) / q.life;
      fctx.save(); fctx.globalAlpha = a; fctx.fillStyle = q.c; fctx.shadowColor = '#fff'; fctx.shadowBlur = 6; fctx.translate(q.x, q.y); fctx.rotate((now - q.t) / 200);
      if (q.star) { const r = q.s; fctx.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? r * .45 : r, an = k * Math.PI / 5 - Math.PI / 2; fctx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } fctx.closePath(); fctx.fill(); fctx.strokeStyle = '#fff'; fctx.lineWidth = 1.5; fctx.stroke(); }
      else { fctx.beginPath(); fctx.arc(0, 0, q.s * .45, 0, Math.PI * 2); fctx.fill(); }
      fctx.restore(); });
    if (wand) { const p = .5 + .5 * Math.sin(now / 90), r = 34 + p * 8;
      const g = fctx.createRadialGradient(wand.x, wand.y, 0, wand.x, wand.y, r * 2.4); g.addColorStop(0, 'rgba(255,240,170,.9)'); g.addColorStop(.4, 'rgba(255,200,90,.35)'); g.addColorStop(1, 'rgba(255,200,90,0)');
      fctx.fillStyle = g; fctx.beginPath(); fctx.arc(wand.x, wand.y, r * 2.4, 0, Math.PI * 2); fctx.fill();
      fctx.save(); fctx.translate(wand.x, wand.y); fctx.rotate(now / 400); fctx.fillStyle = '#FFE27A'; fctx.strokeStyle = '#fff'; fctx.lineWidth = 3; fctx.shadowColor = '#FFB13B'; fctx.shadowBlur = 14;
      fctx.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? r * .45 : r, an = k * Math.PI / 5 - Math.PI / 2; fctx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } fctx.closePath(); fctx.fill(); fctx.stroke(); fctx.restore(); }
    if (twinkles.length || glitPts.length || parts.length || flashes.length || wand) requestAnimationFrame(fxLoop); else { fxOn = false; fctx.clearRect(0, 0, N, N); }
  }

  /* ── "✨ Sim salabim": a magic brush sweeps over the picture and paints it in Mo's real colours ── */
  function magicAll() {
    if (!labels || stroke || autoRun) return;
    autoRun = true; snapshot(); buildTarget(); makeSource(CRAYONS[0]);
    cx(strokeC).clearRect(0, 0, N, N);
    stroke = { magic: true, mask: null, x: 0, y: 0 };
    say(LINES.magic[EN ? 1 : 0]); chime([784, 988, 1175, 1568], 60);
    const rows = 7, R = N / rows * .95, path = [];
    for (let r = 0; r < rows; r++) { const y = (r + .5) * N / rows, ltr = r % 2 === 0; for (let i = 0; i <= 24; i++) path.push([ltr ? i / 24 * N : N - i / 24 * N, y + Math.sin(i * .9 + r) * R * .25]); }
    const t0 = performance.now(), dur = 2600; let done = 0;
    const step = now => {
      const u = Math.min(1, (now - t0) / dur), upto = Math.floor(u * (path.length - 1));
      for (; done <= upto; done++) { const [x, y] = path[done]; dab(x, y, R); if (done % 3 === 0) { addTwinkle(x, y, 2); note(.09); } if (done % 5 === 0) swish(.12); }
      draw();
      if (u < 1) requestAnimationFrame(step);
      else { cx(strokeC).fillStyle = '#fff'; cx(strokeC).fillRect(0, 0, N, N); commit(); for (let L = 0; L < regions.length; L++) coverRegion(L, true); autoRun = false; celebrated = true; checkProgress(true); }
    };
    setTimeout(() => requestAnimationFrame(step), 250);
  }

  /* ── progress + celebrations ── */
  function coloured() {
    if (!samplePts || !samplePts.length) return 0;
    const d = cx(colorC).getImageData(0, 0, N, N).data; let got = 0;
    for (const p of samplePts) { const i = p * 4; if (d[i] < 245 || d[i + 1] < 245 || d[i + 2] < 245) got++; }
    return got / samplePts.length;
  }
  function checkProgress(force) { if (force) setTimeout(() => party(LINES.done[EN ? 1 : 0], false), 450); }
  function party(text, closing) {
    const yay = root.querySelector('.mc-yay'); yay.querySelector('b').textContent = text; yay.classList.add('on');
    say(text); chime([523, 659, 784, 1047, 1319], 110);
    const paper = root.querySelector('.mc-paper');
    for (let i = 0; i < 40; i++) { const c = document.createElement('span'); c.className = 'mc-conf'; c.style.left = Math.random() * 100 + '%'; c.style.background = HAPPY[i % HAPPY.length];
      c.style.animationDuration = (1.4 + Math.random() * 1.2) + 's'; c.style.animationDelay = (Math.random() * .5) + 's'; paper.appendChild(c); setTimeout(() => c.remove(), 3200); }
    for (let i = 0; i < 30; i++) addTwinkle(Math.random() * N, Math.random() * N, 1);
    setTimeout(() => { yay.classList.remove('on'); if (closing) { close(); opts.onDone && opts.onDone(); } }, closing ? 2300 : 2000);
  }
  function finish() {
    try { const s = document.createElement('canvas'); s.width = s.height = 320; s.getContext('2d').drawImage(cvs, 0, 0, 320, 320);
      const all = JSON.parse(localStorage.getItem(STORE) || '{}'); all[opts.key || 'mo'] = s.toDataURL('image/jpeg', .8);
      const keys = Object.keys(all); if (keys.length > 24) delete all[keys[0]]; localStorage.setItem(STORE, JSON.stringify(all)); } catch (e) {}
    party(T('MasyaAllah, indah! 🌈', 'MashaAllah, beautiful! 🌈'), true);
  }
  function close() { shimmerOff(); wand = null; root.classList.remove('on'); document.documentElement.style.overflow = ''; twinkles = []; glitPts = []; stroke = null; autoRun = false; }
  function open(o) {
    opts = o || {}; if (!root) build();
    root.querySelector('.mc-title').textContent = opts.title || T('Warnai Baby Mo 🖍️', 'Colour Baby Mo 🖍️');
    root.querySelector('.mc-done').textContent = T('Selesai! ⭐', 'Done! ⭐');
    root.querySelector('.mc-auto').textContent = T('✨ Sim salabim', '✨ Magic!');
    root.classList.add('on'); document.documentElement.style.overflow = 'hidden';
    const c = cx(colorC); c.fillStyle = '#fff'; c.fillRect(0, 0, N, N); cx(eyeC).clearRect(0, 0, N, N); cx(eyeTargetC).clearRect(0, 0, N, N);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, N, N); fctx.clearRect(0, 0, N, N); labels = null; stroke = null; undoStack = []; glitPts = []; celebrated = false; halfSaid = false; autoRun = false;
    cur = CRAYONS[0]; root.querySelectorAll('.mc-c').forEach((x, i) => x.classList.toggle('sel', i === 0));
    loadGuide(opts.guide); parts = []; flashes = []; wand = null; tgtData = null;
    { const bar = root.querySelector('.mc-meter'); bar.classList.remove('full'); bar.querySelector('i').style.width = '0'; }
    const img = new Image(); img.onload = () => { analyse(img); render(); say(LINES.start[EN ? 1 : 0]); }; img.src = opts.src;
  }
  window.MoColor = { open, CRAYONS, LINES,
    saved: k => { try { return (JSON.parse(localStorage.getItem(STORE) || '{}'))[k] || null; } catch (e) { return null; } } };
})();
