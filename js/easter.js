/* Easter egg: Konami code (up up down down left right left right B A), or tap the logo 7 times. */

const CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const COLORS = ['#e8543c', '#ffd23f', '#7ac74f', '#5ccfe6', '#f58fb0', '#f28c28', '#9b7bd1', '#ffffff'];

export function initEasterEgg(onUnlock) {
  let pos = 0;
  document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === CODE[pos]) { pos++; if (pos === CODE.length) { pos = 0; onUnlock(); } } else pos = key === CODE[0] ? 1 : 0;
  });
  const brand = document.getElementById('brand');
  let taps = 0, timer = null;
  brand.addEventListener('click', () => {
    taps++; clearTimeout(timer); timer = setTimeout(() => { taps = 0; }, 2500);
    if (taps >= 7) { taps = 0; onUnlock(); }
  });
}

export function fireworks(reduced) {
  const cv = document.getElementById('fx');
  const ctx = cv.getContext('2d');
  const scale = 4;
  const resize = () => { cv.width = Math.ceil(innerWidth / scale); cv.height = Math.ceil(innerHeight / scale); };
  resize();
  cv.classList.add('on');
  const parts = [];
  let t = 0, last = performance.now(), running = true;
  const burst = (x, y) => {
    const col = COLORS[Math.floor(Math.random() * COLORS.length)], n = reduced ? 10 : 34;
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, s = 0.6 + Math.random() * 1.1; parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 34 + Math.random() * 16, c: Math.random() < 0.25 ? '#ffffff' : col }); }
  };
  const loop = (now) => {
    if (!running) return;
    if (now - last > 45) {
      last = now; t++;
      ctx.clearRect(0, 0, cv.width, cv.height);
      if (t % 9 === 1 && t < 90) burst(20 + Math.random() * (cv.width - 40), 12 + Math.random() * (cv.height * 0.5));
      for (const p of parts) { p.x += p.vx; p.y += p.vy; p.vy += 0.035; p.life--; if (p.life > 0) { ctx.globalAlpha = Math.min(1, p.life / 14); ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); } }
      ctx.globalAlpha = 1;
      for (let i = parts.length - 1; i >= 0; i--) if (parts[i].life <= 0) parts.splice(i, 1);
      if (t > 100 && !parts.length) { running = false; cv.classList.remove('on'); ctx.clearRect(0, 0, cv.width, cv.height); return; }
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
