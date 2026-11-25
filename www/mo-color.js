/* Baby Mo colouring — tap-to-fill colouring pages for little hands (25 Nov 2026).
   MoColor.open({ src, title, key, onDone })
     src  : black line art on white (PNG, square, thick closed outlines)
     key  : where the finished picture is remembered (localStorage "bm_mo_color" → { key: dataURL })
   How it works: the line art is split once into regions (connected non-line pixels). A tap fills the
   region under the finger with the chosen crayon, revealed with a growing circle from the finger;
   the lines are multiplied on top so edges stay crisp. Undo, a rainbow crayon (new colour each tap),
   a "done" celebration, and the result is kept so the child can see it again. */
(function () {
  if (window.MoColor) return;
  const EN = window.BM_LANG === 'en', T = (id, en) => EN ? en : id;
  const N = 768;                                  // working resolution
  const COLORS = ['#FF4D4D', '#FF9F1C', '#FFD93D', '#4CC94C', '#2EC4B6', '#3D8BFF', '#9B5DE5', '#FF7EB6', '#A0522D', '#F6C9A8', '#FFFFFF', 'rainbow'];
  const RAINBOW = ['#FF4D4D', '#FF9F1C', '#FFD93D', '#4CC94C', '#2EC4B6', '#3D8BFF', '#9B5DE5', '#FF7EB6'];
  const STORE = 'bm_mo_color';

  const css = `
  #moColor{position:fixed;inset:0;z-index:2147483000;display:none;flex-direction:column;align-items:center;background:linear-gradient(180deg,#FFF7E8,#FDEBFF);
    padding:calc(10px + env(safe-area-inset-top)) 12px calc(12px + env(safe-area-inset-bottom));font-family:'Fredoka','Nunito',sans-serif;touch-action:manipulation;user-select:none;-webkit-user-select:none}
  #moColor.on{display:flex}
  #moColor .mc-top{width:100%;max-width:640px;display:flex;align-items:center;gap:10px;min-height:48px}
  #moColor .mc-x,#moColor .mc-undo{width:48px;height:48px;border-radius:50%;border:0;background:#fff;box-shadow:0 6px 14px -8px rgba(60,40,120,.5);font-size:22px;color:#4A3B8C;cursor:pointer;flex:none;display:grid;place-items:center}
  #moColor .mc-title{flex:1;text-align:center;font-size:clamp(18px,5vw,24px);font-weight:700;color:#4A3B8C}
  #moColor .mc-stage{flex:1;min-height:0;width:100%;display:flex;align-items:center;justify-content:center;padding:8px 0}
  #moColor .mc-paper{position:relative;aspect-ratio:1;height:100%;max-width:100%;max-height:100%;background:#fff;border-radius:26px;box-shadow:0 18px 36px -18px rgba(60,40,120,.45),0 0 0 6px #fff;overflow:hidden}
  #moColor canvas{width:100%;height:100%;display:block;touch-action:none}
  #moColor .mc-pal{width:100%;max-width:min(640px, 62vh);display:grid;grid-template-columns:repeat(6,1fr);gap:10px;padding:10px 4px 4px}
  #moColor .mc-c{aspect-ratio:1;border-radius:50%;border:0;cursor:pointer;box-shadow:inset 0 -5px 0 rgba(0,0,0,.14),0 5px 10px -6px rgba(0,0,0,.4);transition:transform .18s cubic-bezier(.3,1.6,.5,1);min-height:44px}
  #moColor .mc-c.white{box-shadow:inset 0 0 0 2px #E3DDF2,inset 0 -5px 0 rgba(0,0,0,.08),0 5px 10px -6px rgba(0,0,0,.3)}
  #moColor .mc-c.rainbow{background:conic-gradient(#FF4D4D,#FF9F1C,#FFD93D,#4CC94C,#2EC4B6,#3D8BFF,#9B5DE5,#FF7EB6,#FF4D4D)}
  #moColor .mc-c.sel{transform:scale(1.18) translateY(-4px);box-shadow:0 0 0 4px #fff,0 0 0 7px #4A3B8C,0 10px 16px -8px rgba(0,0,0,.5)}
  #moColor .mc-done{margin-top:10px;width:100%;max-width:420px;min-height:58px;border:0;border-radius:999px;cursor:pointer;color:#fff;font:700 22px/1 'Fredoka','Nunito',sans-serif;
    background:linear-gradient(120deg,#16C47F,#0A8FA0);box-shadow:0 6px 0 #0A6B60,0 14px 24px -12px rgba(10,143,160,.6)}
  #moColor .mc-done:active{transform:translateY(4px);box-shadow:0 2px 0 #0A6B60}
  #moColor .mc-spark{position:fixed;pointer-events:none;font-size:22px;z-index:2147483001;animation:mcSpark .7s ease-out forwards}
  @keyframes mcSpark{from{opacity:1;transform:translate(-50%,-50%) scale(.4)}to{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(1.2)}}
  #moColor .mc-yay{position:absolute;inset:0;display:none;align-items:center;justify-content:center;flex-direction:column;gap:10px;background:rgba(255,255,255,.55);backdrop-filter:blur(2px)}
  #moColor .mc-yay.on{display:flex}
  #moColor .mc-yay b{font-size:clamp(30px,9vw,48px);color:#E2489A;text-shadow:0 3px 0 #fff;animation:mcPop .6s cubic-bezier(.3,1.6,.5,1)}
  @keyframes mcPop{from{transform:scale(.3)}to{transform:scale(1)}}
  @media (prefers-reduced-motion:reduce){#moColor .mc-spark{display:none}}`;

  let root, cvs, ctx, lineImg, labels, regions, colorOf, history, cur = COLORS[0], rbI = 0, opts = {}, busy = false, audio;

  function el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
  function build() {
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    root = el(`<div id="moColor" role="dialog" aria-modal="true">
      <div class="mc-top"><button class="mc-x" type="button" aria-label="${T('Tutup', 'Close')}">✕</button><div class="mc-title"></div><button class="mc-undo" type="button" aria-label="${T('Batal', 'Undo')}">↶</button></div>
      <div class="mc-stage"><div class="mc-paper"><canvas width="${N}" height="${N}"></canvas><div class="mc-yay"><b></b></div></div></div>
      <div class="mc-pal"></div>
      <button class="mc-done" type="button"></button></div>`);
    document.body.appendChild(root);
    cvs = root.querySelector('canvas'); ctx = cvs.getContext('2d', { willReadFrequently: true });
    const pal = root.querySelector('.mc-pal');
    COLORS.forEach(c => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'mc-c' + (c === 'rainbow' ? ' rainbow' : '') + (c === '#FFFFFF' ? ' white' : '');
      if (c !== 'rainbow') b.style.background = c;
      b.setAttribute('aria-label', c === 'rainbow' ? T('Pelangi', 'Rainbow') : c === '#FFFFFF' ? T('Putih (hapus)', 'White (erase)') : c);
      b.onclick = () => { cur = c; pal.querySelectorAll('.mc-c').forEach(x => x.classList.toggle('sel', x === b)); tone(520 + COLORS.indexOf(c) * 40, .08); };
      pal.appendChild(b);
    });
    pal.firstChild.classList.add('sel');
    root.querySelector('.mc-x').onclick = close;
    root.querySelector('.mc-undo').onclick = undo;
    root.querySelector('.mc-done').onclick = finish;
    cvs.addEventListener('pointerdown', onTap);
  }
  function tone(f, d, type) {
    try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume();
      const t = audio.currentTime, o = audio.createOscillator(), g = audio.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.5, t + d);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.16, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d + .12); o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t + d + .15); } catch (e) {}
  }
  function say(t) { try { const u = new SpeechSynthesisUtterance(t); u.lang = EN ? 'en-US' : 'id-ID'; u.pitch = 1.2; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {} }

  /* split the line art into regions once */
  function analyse(img) {
    const c = document.createElement('canvas'); c.width = c.height = N; const x = c.getContext('2d', { willReadFrequently: true });
    x.fillStyle = '#fff'; x.fillRect(0, 0, N, N);
    const k = Math.min(N / img.naturalWidth, N / img.naturalHeight), w = img.naturalWidth * k, h = img.naturalHeight * k;
    x.drawImage(img, (N - w) / 2, (N - h) / 2, w, h);
    lineImg = c;
    const d = x.getImageData(0, 0, N, N).data, wall = new Uint8Array(N * N);
    for (let i = 0; i < N * N; i++) { const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2]; if (r * .3 + g * .59 + b * .11 < 160) wall[i] = 1; }
    // thicken lines by 1px so tiny gaps in the art don't leak
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
    // the thickened ring belongs to the nearest region, so colour reaches right under the line
    for (let pass = 0; pass < 2; pass++) for (let i = N; i < N * N - N; i++) if (labels[i] < 0 && !wall[i]) { const a = labels[i - 1] >= 0 ? labels[i - 1] : labels[i + 1] >= 0 ? labels[i + 1] : labels[i - N] >= 0 ? labels[i - N] : labels[i + N]; if (a >= 0) labels[i] = a; }
    colorOf = new Array(regions.length).fill(null); history = [];
  }
  function hex(c) { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  let fill;                                       // ImageData of the colour layer
  function renderAll() {
    fill = ctx.createImageData(N, N); const f = fill.data;
    for (let i = 0; i < N * N; i++) { const L = labels[i], c = L >= 0 && colorOf[L] ? hex(colorOf[L]) : [255, 255, 255]; f[i * 4] = c[0]; f[i * 4 + 1] = c[1]; f[i * 4 + 2] = c[2]; f[i * 4 + 3] = 255; }
    paint();
  }
  const tmp = document.createElement('canvas'); tmp.width = tmp.height = N; const tctx = tmp.getContext('2d');
  function paint(clip) {
    if (clip) { ctx.save(); ctx.beginPath(); ctx.arc(clip.x, clip.y, clip.r, 0, Math.PI * 2); ctx.clip(); }
    tctx.putImageData(fill, 0, 0); ctx.drawImage(tmp, 0, 0);
    ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(lineImg, 0, 0); ctx.globalCompositeOperation = 'source-over';
    if (clip) ctx.restore();
  }
  function setRegion(L, color) {
    const c = color ? hex(color) : [255, 255, 255], f = fill.data;
    for (let i = 0; i < N * N; i++) if (labels[i] === L) { f[i * 4] = c[0]; f[i * 4 + 1] = c[1]; f[i * 4 + 2] = c[2]; }
  }
  function onTap(e) {
    if (busy || !labels) return;
    const r = cvs.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * N), y = Math.floor((e.clientY - r.top) / r.height * N);
    if (x < 0 || y < 0 || x >= N || y >= N) return;
    let L = labels[y * N + x];
    if (L < 0) { for (let d = 1; d < 8 && L < 0; d++) for (const [dx, dy] of [[d, 0], [-d, 0], [0, d], [0, -d]]) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < N && yy < N && labels[yy * N + xx] >= 0) { L = labels[yy * N + xx]; break; } } }
    if (L < 0) return;
    const color = cur === 'rainbow' ? RAINBOW[rbI++ % RAINBOW.length] : cur === '#FFFFFF' ? null : cur;
    if (colorOf[L] === color) return;
    history.push([L, colorOf[L]]); if (history.length > 60) history.shift();
    colorOf[L] = color; setRegion(L, color);
    // reveal with a circle growing from the finger
    busy = true; const t0 = performance.now(), R = N * 1.1;
    const step = now => { const u = Math.max(0, Math.min(1, (now - t0) / 320)); paint({ x, y, r: R * (1 - Math.pow(1 - u, 3)) }); if (u < 1) requestAnimationFrame(step); else { paint(); busy = false; } };
    requestAnimationFrame(step);
    tone(440 + (regions[L] % 7) * 60, .1, 'triangle');
    sparkle(e.clientX, e.clientY, color || '#fff');
    if (navigator.vibrate) try { navigator.vibrate(10); } catch (er) {}
  }
  function sparkle(x, y) {
    for (let i = 0; i < 6; i++) { const s = document.createElement('span'); s.className = 'mc-spark'; s.textContent = ['✨', '⭐', '💖', '🌟'][i % 4];
      const a = Math.random() * 6.28, d = 40 + Math.random() * 40; s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d + 'px');
      root.appendChild(s); setTimeout(() => s.remove(), 750); }
  }
  function undo() { const h = history.pop(); if (!h) return; colorOf[h[0]] = h[1]; setRegion(h[0], h[1]); paint(); tone(330, .08); }
  function finish() {
    const yay = root.querySelector('.mc-yay'); yay.querySelector('b').textContent = T('MasyaAllah, indah! 🌈', 'MashaAllah, beautiful! 🌈'); yay.classList.add('on');
    say(T('MasyaAllah, indah sekali!', 'MashaAllah, so beautiful!'));
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, .14, 'triangle'), i * 110));
    for (let i = 0; i < 18; i++) setTimeout(() => { const r = cvs.getBoundingClientRect(); sparkle(r.left + Math.random() * r.width, r.top + Math.random() * r.height); }, i * 60);
    try { const s = document.createElement('canvas'); s.width = s.height = 320; s.getContext('2d').drawImage(cvs, 0, 0, 320, 320);
      const all = JSON.parse(localStorage.getItem(STORE) || '{}'); all[opts.key || 'mo'] = s.toDataURL('image/jpeg', .8);
      const keys = Object.keys(all); if (keys.length > 24) delete all[keys[0]]; localStorage.setItem(STORE, JSON.stringify(all)); } catch (e) {}
    setTimeout(() => { yay.classList.remove('on'); close(); opts.onDone && opts.onDone(); }, 2200);
  }
  function close() { root.classList.remove('on'); document.documentElement.style.overflow = ''; }
  function open(o) {
    opts = o || {}; if (!root) build();
    root.querySelector('.mc-title').textContent = opts.title || T('Warnai Baby Mo 🖍️', 'Colour Baby Mo 🖍️');
    root.querySelector('.mc-done').textContent = T('Selesai! ⭐', 'Done! ⭐');
    root.classList.add('on'); document.documentElement.style.overflow = 'hidden';
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, N, N); labels = null;
    const img = new Image(); img.onload = () => { analyse(img); renderAll(); say(T('Ayo warnai! Ketuk gambarnya.', 'Let\'s colour! Tap the picture.')); }; img.src = opts.src;
  }
  window.MoColor = { open, saved: k => { try { return (JSON.parse(localStorage.getItem(STORE) || '{}'))[k] || null; } catch (e) { return null; } } };
})();
