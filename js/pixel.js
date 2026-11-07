/* Pixel art engine: palette, 16x16 sprites, town scene and building illustrations.
   Everything is drawn with code, so no image assets are needed. */

export const PAL = {
  k: '#3b2416', w: '#fffbee', t: '#fff0c9',
  g: '#d9d0c0', G: '#9a8f7e',
  r: '#e8543c', R: '#a82f22',
  o: '#f28c28', O: '#b8651a',
  y: '#ffd23f', Y: '#d9a21b',
  l: '#7ac74f', L: '#3f8f3f',
  c: '#5ccfe6', C: '#2a8fa8',
  b: '#4a90d9', B: '#2b5fa8',
  p: '#9b7bd1', P: '#6a4aa3',
  m: '#f58fb0', n: '#b07a46', N: '#6b4526', s: '#f5c9a0'
};

const S = 16;
const blank = () => Array.from({ length: S }, () => Array(S).fill('.'));
const fromStrings = (rows) => rows.map((r) => [...r]);

/* small drawing helpers for code-built sprites */
const D = {
  rect(b, x, y, w, h, c) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (b[j] && i >= 0 && i < S) b[j][i] = c; },
  disc(b, cx, cy, r, c) { for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) if ((i - cx) ** 2 + (j - cy) ** 2 <= r * r) b[j][i] = c; },
  poly(b, pts, c) {
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
      let inside = false;
      for (let a = 0, z = pts.length - 1; a < pts.length; z = a++) {
        const [xa, ya] = pts[a], [xz, yz] = pts[z];
        if ((ya > j + 0.5) !== (yz > j + 0.5) && (i + 0.5) < ((xz - xa) * (j + 0.5 - ya)) / (yz - ya) + xa) inside = !inside;
      }
      if (inside) b[j][i] = c;
    }
  },
  line(b, x0, y0, x1, y1, c, th = 1) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let s = 0; s <= n; s++) {
      const x = Math.round(x0 + ((x1 - x0) * s) / (n || 1)), y = Math.round(y0 + ((y1 - y0) * s) / (n || 1));
      D.rect(b, x, y, th, th, c);
    }
  },
  outline(b, c = 'k') {
    const copy = b.map((r) => r.slice());
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
      if (copy[j][i] !== '.') continue;
      const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      if (nb.some(([dx, dy]) => copy[j + dy] && copy[j + dy][i + dx] && copy[j + dy][i + dx] !== '.' && copy[j + dy][i + dx] !== c)) b[j][i] = c;
    }
  }
};
const built = (fn) => { const b = blank(); fn(b); return b; };

export const SPRITES = {
  shield: fromStrings([
    '................',
    '...kkkkkkkkkk...',
    '..kbbbbbbbbbbk..',
    '..kbwwbbbbbbBk..',
    '..kbwbbbyybbBk..',
    '..kbbbbyyyybBk..',
    '..kbbbbbyybbBk..',
    '..kbbbbbbbbbBk..',
    '..kbbbbbbbbBBk..',
    '...kbbbbbbbBk...',
    '...kbbbbbbBBk...',
    '....kbbbbBBk....',
    '.....kbbBBk.....',
    '......kBBk......',
    '.......kk.......',
    '................'
  ]),
  robot: fromStrings([
    '.......kk.......',
    '......krrk......',
    '.......kk.......',
    '..kkkkkkkkkkkk..',
    '.kggggggggggggk.',
    '.kgkkkkggkkkkgk.',
    '.kgkcckggkcckgk.',
    '.kgkcckggkcckgk.',
    '.kgkkkkggkkkkgk.',
    '.kggggggggggGGk.',
    '.kgkkkkkkkkkkgk.',
    '.kgkwkwkwkwkkgk.',
    '.kggkkkkkkkkGGk.',
    '..kkkkkkkkkkkk..',
    '...kGk....kGk...',
    '..kkkk....kkkk..'
  ]),
  cap: built((b) => {
    D.rect(b, 4, 7, 8, 5, 'B');
    D.poly(b, [[8, 2], [15, 6], [8, 10], [1, 6]], 'b');
    D.rect(b, 5, 5, 3, 1, 'w');
    D.line(b, 14, 6, 14, 11, 'y');
    D.rect(b, 13, 11, 3, 2, 'y');
    D.outline(b);
  }),
  doc: built((b) => {
    D.rect(b, 3, 1, 10, 14, 'w');
    D.poly(b, [[10, 1], [13, 4], [10, 4]], 'g');
    D.rect(b, 5, 6, 6, 1, 'G'); D.rect(b, 5, 8, 6, 1, 'G'); D.rect(b, 5, 10, 4, 1, 'G');
    D.rect(b, 9, 11, 1, 1, 'l'); D.rect(b, 10, 12, 1, 1, 'l'); D.rect(b, 11, 11, 1, 1, 'l'); D.rect(b, 12, 10, 1, 1, 'l');
    D.outline(b);
  }),
  chat: built((b) => {
    D.rect(b, 1, 2, 14, 9, 'c');
    D.rect(b, 1, 10, 14, 1, 'C');
    D.poly(b, [[3, 11], [8, 11], [3, 14]], 'c');
    D.rect(b, 4, 6, 2, 2, 'w'); D.rect(b, 7, 6, 2, 2, 'w'); D.rect(b, 10, 6, 2, 2, 'w');
    D.outline(b);
  }),
  coin: built((b) => {
    D.disc(b, 8, 8, 6.2, 'Y'); D.disc(b, 8, 8, 5, 'y');
    D.poly(b, [[8, 4], [11, 8], [8, 12], [5, 8]], 'Y');
    D.rect(b, 5, 5, 2, 1, 'w'); D.rect(b, 4, 6, 1, 2, 'w');
    D.outline(b);
  }),
  gavel: fromStrings([
    '................',
    '...kkkkkkkkkk...',
    '..kooooooooyOk..',
    '..koyyyyyyyyOk..',
    '..koooooooooOk..',
    '...kkkkkkkkkk...',
    '.......kNk......',
    '.......kNk......',
    '.......kNk......',
    '.......kNk......',
    '..kkkkkkkkkkkk..',
    '..knnnnnnnnnNk..',
    '..kNNNNNNNNNNk..',
    '..kkkkkkkkkkkk..',
    '................',
    '................'
  ]),
  ballot: built((b) => {
    D.rect(b, 2, 7, 12, 8, 'b'); D.rect(b, 2, 13, 12, 2, 'B');
    D.rect(b, 5, 1, 6, 8, 'w');
    D.rect(b, 6, 4, 1, 1, 'l'); D.rect(b, 7, 5, 1, 1, 'l'); D.rect(b, 8, 4, 1, 1, 'l'); D.rect(b, 9, 3, 1, 1, 'l');
    D.rect(b, 4, 8, 8, 1, 'k');
    D.rect(b, 5, 10, 2, 2, 'y');
    D.outline(b);
  }),
  swap: fromStrings([
    '................',
    '..........kk....',
    '..........kyk...',
    '..kkkkkkkkkyyk..',
    '..kyyyyyyyyyyyk.',
    '..kkkkkkkkkyyk..',
    '..........kyk...',
    '..........kk....',
    '................',
    '....kk..........',
    '...kck..........',
    '..kccckkkkkkkkk.',
    '.kcccccccccccck.',
    '..kccckkkkkkkkk.',
    '...kck..........',
    '....kk..........'
  ]),
  neuron: built((b) => {
    const A = [[2, 3], [2, 8], [2, 13]], M = [[7, 5], [7, 11]], O = [[13, 8]];
    for (const a of A) for (const m of M) D.line(b, a[0] + 1, a[1] + 1, m[0] + 1, m[1] + 1, 'G');
    for (const m of M) for (const o of O) D.line(b, m[0] + 1, m[1] + 1, o[0] + 1, o[1] + 1, 'G');
    for (const a of A) D.disc(b, a[0] + 1, a[1] + 1, 1.6, 'c');
    for (const m of M) D.disc(b, m[0] + 1, m[1] + 1, 1.6, 'm');
    for (const o of O) D.disc(b, o[0] + 1, o[1] + 1, 2, 'y');
    D.outline(b);
  }),
  code: fromStrings([
    '................',
    '................',
    '.kkkkkkkkkkkkkk.',
    '.kNNNNNNNNNNNNk.',
    '.kNlNNNNNNNNNNk.',
    '.kNNlNNNNNNNNNk.',
    '.kNNNlNNNNNNNNk.',
    '.kNNlNNNNNNNNNk.',
    '.kNlNNNNyyyyNNk.',
    '.kNNNNNNNNNNNNk.',
    '.kkkkkkkkkkkkkk.',
    '.....kkkkkk.....',
    '....kkkkkkkk....',
    '................',
    '................',
    '................'
  ]),
  rocket: fromStrings([
    '.......kk.......',
    '......krrk......',
    '.....krrrrk.....',
    '.....kwwwwk.....',
    '.....kwccwk.....',
    '.....kwccwk.....',
    '.....kwwwwk.....',
    '....kkwwwwkk....',
    '...krkwwwwkrk...',
    '..krrkwwwwkrrk..',
    '..kkkkkGGkkkkk..',
    '.....kyyyyk.....',
    '......kyyk......',
    '.......oo.......',
    '................',
    '................'
  ]),
  window: fromStrings([
    '................',
    '................',
    '.kkkkkkkkkkkkkk.',
    '.kbbbbbbbbbbbbk.',
    '.kbrbybbbbbbbbk.',
    '.kkkkkkkkkkkkkk.',
    '.kwwwwwwwwwwwwk.',
    '.kwookkkwwlllwk.',
    '.kwooookwwwwwwk.',
    '.kwwwwwwwkkkkwk.',
    '.kwwwwwwwwwwwwk.',
    '.kwkkkkkkkwwwwk.',
    '.kwwwwwwwwwwwwk.',
    '.kkkkkkkkkkkkkk.',
    '................',
    '................'
  ]),
  mic: fromStrings([
    '................',
    '.....kkkkkk.....',
    '....kggggggk....',
    '....kgwgggGk....',
    '....kgwgggGk....',
    '....kggggggk....',
    '..k.kggggGGk.k..',
    '..k.kkggGGkk.k..',
    '..kk.kkkkkk.kk..',
    '...kk......kk...',
    '....kkkkkkkk....',
    '.......kk.......',
    '.......kk.......',
    '......kkkk......',
    '.....kooook.....',
    '................'
  ]),
  server: fromStrings([
    '................',
    '..kkkkkkkkkkkk..',
    '..kgggggggglrk..',
    '..kgkkkkkkkgGk..',
    '..kkkkkkkkkkkk..',
    '..kgggggggglyk..',
    '..kgkkkkkkkgGk..',
    '..kkkkkkkkkkkk..',
    '..kggggggggllk..',
    '..kgkkkkkkkgGk..',
    '..kkkkkkkkkkkk..',
    '......kkkk......',
    '.....kGGGGk.....',
    '................',
    '................',
    '................'
  ]),
  db: fromStrings([
    '................',
    '..kkkkkkkkkkkk..',
    '.kwwcccccccccck.',
    '.kcccccccccccck.',
    '..kkkkkkkkkkkk..',
    '.kbbbbbbbbbbbbk.',
    '.kbwbbbbbbbbbBk.',
    '..kkkkkkkkkkkk..',
    '.kbbbbbbbbbbbbk.',
    '.kbwbbbbbbbbbBk.',
    '..kkkkkkkkkkkk..',
    '.kbbbbbbbbbbbbk.',
    '.kbwbbbbbbbbbBk.',
    '..kBBBBBBBBBBk..',
    '...kkkkkkkkkk...',
    '................'
  ]),
  block: built((b) => {
    const box = (x, y, w, h, f, s) => { D.rect(b, x, y, w, h, f); D.rect(b, x + w - 2, y, 2, h, s); D.rect(b, x + 1, y + 1, 2, 1, 'w'); };
    D.rect(b, 6, 3, 4, 2, 'G'); D.rect(b, 3, 7, 2, 2, 'G');
    box(0, 1, 6, 6, 'p', 'P'); box(10, 1, 6, 6, 'c', 'C'); box(3, 9, 6, 6, 'y', 'Y');
    D.outline(b);
  }),
  wrench: built((b) => {
    D.line(b, 3, 12, 10, 5, 'g', 2);
    D.disc(b, 11, 4, 3.4, 'g');
    D.rect(b, 12, 1, 3, 3, '.');
    D.disc(b, 3, 13, 1.5, 'G');
    D.outline(b);
  }),
  medal: built((b) => {
    D.poly(b, [[3, 0], [7, 0], [9, 7], [6, 7]], 'r');
    D.poly(b, [[9, 0], [13, 0], [10, 7], [7, 7]], 'b');
    D.disc(b, 8, 11, 4.2, 'G'); D.disc(b, 8, 11, 3.2, 'g');
    D.rect(b, 6, 9, 2, 1, 'w'); D.rect(b, 7, 11, 2, 2, 'G');
    D.outline(b);
  }),
  star: built((b) => {
    const pts = [];
    for (let i = 0; i < 10; i++) { const a = (-90 + i * 36) * Math.PI / 180, r = i % 2 ? 3 : 7; pts.push([8 + Math.cos(a) * r, 8.4 + Math.sin(a) * r]); }
    D.poly(b, pts, 'y');
    D.rect(b, 7, 4, 1, 2, 'w'); D.rect(b, 8, 10, 3, 2, 'Y');
    D.outline(b);
  }),
  pkg: built((b) => {
    D.rect(b, 2, 4, 12, 10, 'o'); D.rect(b, 2, 11, 12, 3, 'O');
    D.rect(b, 2, 2, 12, 3, 'n'); D.rect(b, 7, 2, 2, 12, 'y');
    D.outline(b);
  }),
  book: built((b) => {
    D.rect(b, 2, 2, 12, 12, 'r'); D.rect(b, 2, 2, 2, 12, 'R');
    D.rect(b, 4, 12, 10, 2, 'w');
    D.rect(b, 6, 4, 6, 1, 'y'); D.rect(b, 6, 6, 4, 1, 'y');
    D.outline(b);
  }),
  mail: built((b) => {
    D.rect(b, 1, 3, 14, 10, 'w');
    D.line(b, 1, 3, 8, 9, 'G'); D.line(b, 15, 3, 8, 9, 'G');
    D.rect(b, 7, 8, 2, 2, 'r');
    D.outline(b);
  }),
  trophy: built((b) => {
    D.rect(b, 4, 1, 8, 7, 'y'); D.rect(b, 4, 7, 8, 1, 'Y'); D.rect(b, 6, 8, 4, 3, 'y');
    D.rect(b, 2, 2, 2, 4, 'Y'); D.rect(b, 12, 2, 2, 4, 'Y');
    D.rect(b, 5, 11, 6, 3, 'N'); D.rect(b, 5, 3, 1, 3, 'w');
    D.outline(b);
  }),
  gem: built((b) => {
    D.poly(b, [[8, 2], [14, 7], [8, 14], [2, 7]], 'c');
    D.poly(b, [[8, 2], [11, 7], [8, 14], [5, 7]], 'w');
    D.rect(b, 3, 7, 10, 1, 'C');
    D.outline(b);
  }),
  stump: built((b) => {
    D.rect(b, 3, 3, 10, 3, 'l'); D.rect(b, 2, 5, 12, 2, 'L');
    D.rect(b, 6, 7, 4, 6, 'n'); D.rect(b, 4, 12, 8, 2, 'N');
    D.rect(b, 4, 4, 2, 1, 'w');
    D.outline(b);
  })
};

const spriteCache = {};
function spriteCanvas(name) {
  if (spriteCache[name]) return spriteCache[name];
  const g = SPRITES[name] || SPRITES.gem;
  const cv = document.createElement('canvas');
  cv.width = S; cv.height = S;
  const cx = cv.getContext('2d');
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const ch = g[y][x];
    if (ch !== '.' && PAL[ch]) { cx.fillStyle = PAL[ch]; cx.fillRect(x, y, 1, 1); }
  }
  return (spriteCache[name] = cv);
}
export function drawSprite(ctx, name, x = 0, y = 0, scale = 1) {
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(spriteCanvas(name), x, y, S * scale, S * scale);
}
/* paint every <canvas data-sprite="name"> inside root */
export function paintSprites(root = document) {
  root.querySelectorAll('canvas[data-sprite]').forEach((cv) => {
    cv.width = S; cv.height = S;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, S, S);
    drawSprite(ctx, cv.dataset.sprite, 0, 0, 1);
  });
}

/* ------------------------------------------------------------------ */
/* Buildings: origin (0,0) = bottom centre, y grows downwards          */
/* ------------------------------------------------------------------ */
const INK = '#3b2416';
const COL = {
  stone: '#d9d0c0', stoneD: '#9a8f7e', wall: '#fff0c9', wallD: '#e6cf9c',
  wood: '#b07a46', woodD: '#6b4526', glass: '#8fd8f0', glow: '#ffe27a',
  red: '#e8543c', redD: '#a82f22', orange: '#f28c28', orangeD: '#b8651a',
  green: '#7ac74f', greenD: '#3f8f3f', teal: '#2fa7a0', tealD: '#1f7a76',
  blue: '#4a90d9', blueD: '#2b5fa8', purple: '#9b7bd1', purpleD: '#6a4aa3',
  gold: '#ffd23f', goldD: '#d9a21b', brick: '#df8a5c', brickD: '#a85a3a', white: '#fffbee'
};
const R = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const BOX = (c, x, y, w, h, fill, shade) => { R(c, INK, x - 1, y - 1, w + 2, h + 2); R(c, fill, x, y, w, h); if (shade) R(c, shade, x + w - 3, y, 3, h); };
const ROOF = (c, cx, y, half, h, fill, shade) => {
  for (let i = 0; i < h; i++) {
    const w = Math.round(2 + (i * (half * 2 - 2)) / Math.max(1, h - 1));
    R(c, INK, cx - Math.floor(w / 2) - 1, y + i - 1, w + 2, 3);
  }
  for (let i = 0; i < h; i++) {
    const w = Math.round(2 + (i * (half * 2 - 2)) / Math.max(1, h - 1));
    R(c, fill, cx - Math.floor(w / 2), y + i, w, 2);
    R(c, shade, cx + Math.floor(w / 2) - 3, y + i, 3, 2);
  }
};
const DISC = (c, cx, cy, r, col) => {
  c.fillStyle = col;
  for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r + 0.5) c.fillRect(cx + i, cy + j, 1, 1);
};
const WIN = (c, x, y, lit, w = 6, h = 7) => {
  BOX(c, x, y, w, h, lit ? COL.glow : COL.glass);
  R(c, INK, x + Math.floor(w / 2), y, 1, h); R(c, INK, x, y + Math.floor(h / 2), w, 1);
  R(c, '#ffffff', x + 1, y + 1, 1, 1);
};
const ARCHDOOR = (c, x, y, w, h, fill) => {
  BOX(c, x, y, w, h, fill, COL.woodD);
  R(c, INK, x - 1, y - 1, 1, 2); R(c, INK, x + w, y - 1, 1, 2);
  R(c, COL.stone, x - 1, y - 1, 1, 1);
  R(c, COL.gold, x + w - 3, y + Math.floor(h / 2), 1, 1);
};

export const BUILDINGS = {
  /* gate: town gate with flag */
  gate(c, t) {
    BOX(c, -22, -40, 13, 40, COL.stone, COL.stoneD); BOX(c, 9, -40, 13, 40, COL.stone, COL.stoneD);
    for (const x of [-22, -18, -14, 9, 13, 17]) BOX(c, x, -44, 3, 4, COL.stone, COL.stoneD);
    BOX(c, -9, -30, 18, 30, COL.stone, COL.stoneD);
    for (const x of [-8, -3, 2, 6]) R(c, COL.stoneD, x, -33, 2, 3);
    BOX(c, -6, -20, 12, 20, COL.wood, COL.woodD);
    R(c, INK, -6, -20, 1, 1); R(c, INK, 5, -20, 1, 1);
    R(c, COL.woodD, 0, -20, 1, 20); R(c, COL.woodD, -6, -12, 12, 1);
    R(c, COL.gold, 3, -9, 2, 2); R(c, COL.gold, -5, -9, 2, 2);
    R(c, INK, -18, -34, 1, 5); R(c, INK, -17, -34, 1, 5); R(c, INK, 13, -34, 1, 5); R(c, INK, 14, -34, 1, 5);
    BOX(c, -7, -28, 14, 6, COL.red, COL.redD);
    R(c, COL.white, -5, -26, 2, 2); R(c, COL.white, -1, -26, 2, 2); R(c, COL.white, 3, -26, 2, 2);
    R(c, INK, -16, -64, 2, 20);
    const w = [0, 1, 1, 0][t % 4];
    R(c, INK, -14 - 1, -64, 14, 9); R(c, COL.gold, -14, -63, 12, 7); R(c, COL.red, -14, -63, 12, 2);
    R(c, COL.goldD, -2 + w, -61, 1, 4);
    R(c, COL.gold, -16, -66, 2, 2);
  },
  /* house: cosy cottage with chimney smoke */
  house(c, t) {
    BOX(c, 8, -40, 6, 14, COL.orangeD);
    ROOF(c, 0, -38, 21, 16, COL.orange, COL.orangeD);
    BOX(c, -15, -22, 30, 22, COL.wall, COL.wallD);
    R(c, COL.wallD, -15, -4, 30, 1);
    BOX(c, -4, -14, 8, 14, COL.wood, COL.woodD); R(c, COL.gold, 2, -7, 1, 1);
    WIN(c, -12, -18, t % 8 < 6); WIN(c, 7, -18, true);
    DISC(c, 0, -30, 3, COL.glass); R(c, INK, 0, -33, 1, 7); R(c, INK, -3, -30, 7, 1);
    BOX(c, -23, -12, 8, 5, COL.wall, COL.wallD); R(c, INK, -20, -7, 1, 7);
    R(c, COL.red, -22, -11, 2, 1); R(c, COL.red, -19, -10, 2, 1);
    R(c, COL.green, -14, -2, 2, 2); R(c, '#f58fb0', -14, -3, 2, 1); R(c, COL.green, 12, -2, 2, 2); R(c, COL.gold, 12, -3, 2, 1);
    const k = t % 6;
    for (let i = 0; i < 3; i++) { const yy = -46 - ((k + i * 2) % 6) * 2, xx = 10 + ((k + i) % 3) - 1; R(c, 'rgba(255,255,255,' + (0.9 - ((k + i * 2) % 6) * 0.12) + ')', xx, yy, 3, 2); }
  },
  /* tower: skill tower with glowing orb */
  tower(c, t) {
    BOX(c, -13, -20, 26, 20, COL.stone, COL.stoneD);
    BOX(c, -9, -40, 18, 20, COL.stone, COL.stoneD);
    BOX(c, -12, -48, 24, 8, COL.stone, COL.stoneD);
    for (let i = -12; i < 12; i += 6) R(c, COL.stoneD, i, -47, 3, 1);
    ROOF(c, 0, -62, 15, 14, COL.teal, COL.tealD);
    R(c, INK, 0, -70, 1, 8);
    const g = [0, 1, 2, 1][t % 4];
    DISC(c, 0, -72, 3 + (g ? 1 : 0), 'rgba(255,226,122,0.55)'); DISC(c, 0, -72, 2, COL.gold); R(c, '#fff', -1, -73, 1, 1);
    ARCHDOOR(c, -4, -13, 8, 13, COL.wood);
    WIN(c, -11, -17, t % 6 < 4, 5, 6); WIN(c, 6, -17, true, 5, 6);
    WIN(c, -3, -36, true, 6, 8);
    for (const x of [-9, -3, 3]) { R(c, INK, x - 1, -46, 1, 5); R(c, COL.glow, x, -46, 2, 5); R(c, INK, x + 2, -46, 1, 5); }
    for (let i = 0; i < 7; i++) { R(c, COL.greenD, -13 + (i % 2), -4 - i * 3, 2, 2); if (i % 2) R(c, COL.green, -11, -6 - i * 3, 2, 1); }
    R(c, '#fff', -12 + ((t * 3) % 26), -60 - (t % 3) * 4, 1, 1);
  },
  /* lab: laboratory with dome and bubbling window */
  lab(c, t) {
    BOX(c, -22, -26, 44, 26, '#e6f4e0', '#bcd9b4');
    R(c, COL.teal, -22, -28, 44, 3); R(c, COL.tealD, -22, -26, 44, 1);
    for (let j = 0; j <= 11; j++) { const w = Math.round(Math.sqrt(144 - (j - 11) * (j - 11)) * 1.0); R(c, INK, -w - 1, -28 - 11 + j - 1, 2 * w + 2, 2); }
    for (let j = 0; j <= 11; j++) { const w = Math.round(Math.sqrt(144 - (j - 11) * (j - 11))); R(c, COL.glass, -w, -39 + j, 2 * w, 1); }
    R(c, '#fff', -5, -36, 3, 1); R(c, '#fff', -7, -34, 1, 2);
    R(c, INK, 15, -44, 1, 16); R(c, COL.red, 14, -46, 3, 3);
    BOX(c, -17, -21, 14, 13, '#2b5fa8');
    R(c, '#bfe9ff', -16, -20, 12, 1);
    const lvl = 4 + ((t % 5) > 2 ? 1 : 0);
    R(c, COL.green, -16, -9 - lvl, 12, lvl); R(c, '#b6f08a', -16, -9 - lvl, 12, 1);
    R(c, '#fff', -14 + (t % 3) * 3, -12 - (t % 4), 1, 1); R(c, '#fff', -9 + ((t + 1) % 3) * 3, -13 - ((t + 2) % 4), 1, 1);
    ARCHDOOR(c, 8, -15, 9, 15, COL.wood);
    R(c, COL.red, -20, -3, 2, 3); R(c, COL.purple, -17, -3, 2, 3);
    const k = t % 6;
    for (let i = 0; i < 3; i++) R(c, 'rgba(160,230,120,' + (0.85 - ((k + i * 2) % 6) * 0.12) + ')', -22 + ((k + i) % 3), -30 - ((k + i * 2) % 6) * 2 - 14, 3, 2);
  },
  /* hall: hall of fame temple */
  hall(c, t) {
    BOX(c, -23, -4, 46, 4, COL.stone, COL.stoneD); BOX(c, -21, -8, 42, 4, COL.stone, COL.stoneD);
    for (const x of [-19, -9, 4, 14]) { BOX(c, x, -30, 5, 22, COL.wall, COL.wallD); R(c, COL.stoneD, x - 1, -31, 7, 1); }
    BOX(c, -22, -35, 44, 5, COL.stone, COL.stoneD);
    ROOF(c, 0, -46, 24, 11, COL.gold, COL.goldD);
    DISC(c, 0, -41, 2, COL.red);
    DISC(c, 0, -22, 0, COL.gold);
    R(c, INK, -4, -22, 9, 9); R(c, COL.gold, -3, -21, 7, 4); R(c, COL.goldD, -3, -18, 7, 1); R(c, COL.gold, -1, -17, 3, 3); R(c, INK, -3, -13, 7, 1);
    R(c, '#fff', -2, -21, 1, 2);
    R(c, COL.red, -14, -26, 3, 10); R(c, COL.red, 12, -26, 3, 10);
    const s = t % 4;
    if (s < 2) { R(c, '#fff', -9, -50 - s, 1, 3); R(c, '#fff', -10, -49 - s, 3, 1); }
    else { R(c, '#fff', 11, -52 + (s - 2), 1, 3); R(c, '#fff', 10, -51 + (s - 2), 3, 1); }
  },
  /* library: journey library with clock */
  library(c, t) {
    BOX(c, -18, -26, 36, 26, COL.brick, COL.brickD);
    for (let j = 0; j < 6; j++) for (let i = 0; i < 9; i++) if ((i + j) % 2 === 0) R(c, COL.brickD, -17 + i * 4, -25 + j * 4, 2, 1);
    ROOF(c, 0, -42, 22, 16, COL.purple, COL.purpleD);
    BOX(c, -6, -34, 12, 11, COL.wall, COL.wallD);
    DISC(c, 0, -29, 4, COL.white); R(c, INK, 0, -32, 1, 4);
    const hand = [[2, 0], [2, 2], [0, 3], [-2, 2], [-2, 0], [-2, -2], [0, -3], [2, -2]][t % 8];
    R(c, INK, hand[0] < 0 ? -1 : 0, -29, 1, 1); R(c, INK, hand[0] === 0 ? 0 : (hand[0] > 0 ? 1 : -1), -29 + (hand[1] === 0 ? 0 : hand[1] > 0 ? 1 : -1), 1, 1);
    ARCHDOOR(c, -5, -17, 10, 17, COL.wood);
    for (const x of [-15, 8]) {
      BOX(c, x, -21, 8, 11, COL.glass);
      const cols = [COL.red, COL.blue, COL.gold, COL.green, COL.purple, COL.orange];
      for (let i = 0; i < 4; i++) R(c, cols[(i + (x < 0 ? 0 : 2)) % 6], x + 1 + i * 2, -19, 1, 4 + (i % 2));
      for (let i = 0; i < 4; i++) R(c, cols[(i + 3 + (x < 0 ? 0 : 1)) % 6], x + 1 + i * 2, -14, 1, 3 + (i % 2));
    }
    R(c, COL.wood, -20, -2, 40, 2);
  },
  /* post: post office with mailbox */
  post(c, t) {
    BOX(c, -16, -22, 32, 22, COL.wall, COL.wallD);
    ROOF(c, 0, -36, 20, 14, COL.red, COL.redD);
    BOX(c, -5, -22, 10, 8, COL.white);
    R(c, INK, -4, -21, 8, 1); R(c, COL.red, -4, -21, 8, 1);
    R(c, INK, -4, -20, 1, 1); R(c, INK, -3, -19, 1, 1); R(c, INK, -2, -18, 1, 1); R(c, INK, -1, -17, 1, 1); R(c, INK, 0, -18, 1, 1); R(c, INK, 1, -19, 1, 1); R(c, INK, 2, -20, 1, 1); R(c, INK, 3, -21, 1, 1);
    ARCHDOOR(c, -4, -13, 8, 13, COL.wood);
    WIN(c, -13, -17, true, 6, 7); WIN(c, 8, -17, t % 8 < 5, 6, 7);
    DISC(c, 10, -38, 3, COL.stone); R(c, INK, 10, -35, 1, 4); R(c, COL.red, 9, -39, 2, 2);
    R(c, INK, 21, -12, 1, 12); BOX(c, 18, -20, 8, 7, COL.blue, COL.blueD); R(c, INK, 20, -18, 5, 1);
    const up = t % 6 < 3;
    R(c, COL.red, 26, up ? -21 : -17, 3, 3);
    R(c, COL.white, 19 + (t % 3), -26 - (t % 3), 3, 2);
  }
};
export const BUILDING_ORDER = ['gate', 'house', 'tower', 'lab', 'hall', 'library', 'post'];

/* ------------------------------------------------------------------ */
/* Town scene (hero)                                                   */
/* ------------------------------------------------------------------ */
const W = 400, H = 150, GROUND = 124;
export const TOWN = { W, H, GROUND, xs: [32, 90, 148, 205, 262, 320, 372], widths: [48, 46, 30, 46, 50, 44, 50], heights: [68, 48, 76, 52, 56, 48, 44] };

function mulberry(seed) { let a = seed; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rnd = mulberry(7);
const FLOWERS = Array.from({ length: 46 }, () => ({ x: Math.floor(rnd() * W), y: GROUND + 3 + Math.floor(rnd() * 6), c: ['#f58fb0', '#ffd23f', '#ffffff', '#e8543c'][Math.floor(rnd() * 4)] }));
const CLOUDS = [{ x: 30, y: 14, s: 0.22, k: 1 }, { x: 170, y: 30, s: 0.15, k: 0.8 }, { x: 290, y: 10, s: 0.28, k: 1.2 }, { x: 110, y: 52, s: 0.1, k: 0.7 }];
const SKY = ['#6cc3f0', '#82cdf2', '#98d6f4', '#b0e0f4', '#c9ebf2', '#e4f1e6', '#fff0c9', '#ffe2a8', '#ffd391'];

function cloud(c, x, y, k) {
  const u = (v) => Math.round(v * k);
  R(c, '#ffffff', x + u(6), y, u(14), u(3)); R(c, '#ffffff', x, y + u(3), u(28), u(4)); R(c, '#ffffff', x + u(4), y + u(7), u(20), u(2));
  R(c, '#dbeaf7', x + u(2), y + u(7), u(24), u(2)); R(c, '#dbeaf7', x + u(8), y + u(9), u(12), 1);
}
function tree(c, x, base, s, kind) {
  R(c, '#6b4526', x - 1, base - 6 * s, 3, 6 * s);
  if (kind === 0) {
    for (let i = 0; i < 3; i++) { const w = (5 - i) * s + 2; R(c, INK, x - Math.floor(w / 2) - 1, base - 8 * s - i * 4 * s - 1, w + 2, 5 * s + 1); }
    for (let i = 0; i < 3; i++) { const w = (5 - i) * s + 2; R(c, '#4aa04a', x - Math.floor(w / 2), base - 8 * s - i * 4 * s, w, 4 * s); R(c, '#3f8f3f', x + Math.floor(w / 2) - 2, base - 8 * s - i * 4 * s, 2, 4 * s); }
  } else {
    DISC(c, x, base - 11 * s, 5 * s + 1, INK); DISC(c, x, base - 11 * s, 5 * s, '#7ac74f'); DISC(c, x + 2, base - 9 * s, 3 * s, '#5eb14a');
    R(c, '#b6f08a', x - 3 * s, base - 14 * s, 2, 2);
  }
}
function lamp(c, x, base, on) {
  R(c, INK, x, base - 14, 2, 14); R(c, INK, x - 2, base - 17, 6, 4); R(c, on ? '#ffe27a' : '#cfc6b8', x - 1, base - 16, 4, 2);
  if (on) { c.fillStyle = 'rgba(255,226,122,.25)'; c.fillRect(x - 4, base - 20, 10, 8); }
}

export function drawTown(ctx, t, hover = -1) {
  ctx.imageSmoothingEnabled = false;
  /* sky with dithered band edges */
  const bandH = 12;
  SKY.forEach((col, i) => { R(ctx, col, 0, i * bandH, W, bandH + 1); });
  for (let i = 1; i < SKY.length; i++) for (let x = 0; x < W; x += 2) { R(ctx, SKY[i - 1], x + (i % 2), i * bandH, 1, 1); R(ctx, SKY[i], x + ((i + 1) % 2), i * bandH - 1, 1, 1); }
  /* sun */
  const pulse = (t % 8) < 4 ? 0 : 1;
  DISC(ctx, 322, 40, 17 + pulse, 'rgba(255,226,122,.35)');
  DISC(ctx, 322, 40, 13, '#ffb43a'); DISC(ctx, 322, 40, 11, '#ffd23f'); DISC(ctx, 319, 37, 5, '#fff1a8');
  for (let a = 0; a < 8; a++) { const ang = a * Math.PI / 4 + (t % 2) * 0.2; R(ctx, '#ffd23f', Math.round(322 + Math.cos(ang) * (19 + pulse)), Math.round(40 + Math.sin(ang) * (19 + pulse)), 2, 2); }
  /* clouds */
  for (const cl of CLOUDS) { const x = ((cl.x + t * cl.s * 6) % (W + 60)) - 30; cloud(ctx, Math.round(x), cl.y, cl.k); }
  /* distant hills */
  for (let x = 0; x < W; x++) {
    const h1 = 100 + Math.sin(x / 37) * 7 + Math.sin(x / 15 + 2) * 3, h2 = 108 + Math.sin(x / 23 + 1) * 5 + Math.sin(x / 9) * 1.5;
    R(ctx, '#a6d9a0', x, Math.round(h1), 1, GROUND - h1); R(ctx, '#7cc58a', x, Math.round(h2), 1, GROUND - h2);
  }
  /* ground */
  R(ctx, '#7ac74f', 0, GROUND, W, H - GROUND);
  for (let x = 0; x < W; x += 4) { R(ctx, '#6ab644', x, GROUND, 2, 1); R(ctx, '#8ad45e', x + 2, GROUND + 2 + (x % 8 === 0 ? 1 : 0), 2, 1); }
  R(ctx, '#e8c88f', 0, GROUND + 12, W, 9); R(ctx, '#d4ad6c', 0, GROUND + 12, W, 1); R(ctx, '#d4ad6c', 0, GROUND + 20, W, 1);
  for (let x = 4; x < W; x += 24) R(ctx, '#fff0c9', x, GROUND + 16, 10, 2);
  R(ctx, '#6ab644', 0, GROUND + 21, W, H - GROUND - 21);
  for (let x = 0; x < W; x += 6) R(ctx, '#5aa23a', x, GROUND + 23, 3, 2);
  for (const f of FLOWERS) if (f.y < GROUND + 11) { R(ctx, f.c, f.x, f.y, 2, 2); R(ctx, '#3f8f3f', f.x, f.y + 2, 1, 2); }
  /* back trees */
  [[62, 0], [119, 1], [177, 0], [234, 1], [291, 0], [346, 1]].forEach(([x, k], i) => tree(ctx, x, GROUND + 1, 1 + (i % 2) * 0, k));
  /* buildings */
  BUILDING_ORDER.forEach((name, i) => {
    ctx.save();
    const lift = hover === i ? -(1 + (t % 4 < 2 ? 1 : 0)) : 0;
    ctx.translate(TOWN.xs[i], GROUND + 1 + lift);
    BUILDINGS[name](ctx, t);
    ctx.restore();
    if (hover === i) {
      const ay = GROUND - TOWN.heights[i] - 14 - (t % 4 < 2 ? 0 : 2), ax = TOWN.xs[i];
      R(ctx, INK, ax - 4, ay, 9, 3); R(ctx, INK, ax - 3, ay + 3, 7, 1); R(ctx, INK, ax - 2, ay + 4, 5, 1); R(ctx, INK, ax - 1, ay + 5, 3, 1); R(ctx, INK, ax, ay + 6, 1, 1);
      R(ctx, '#ffd23f', ax - 3, ay + 1, 7, 1); R(ctx, '#ffd23f', ax - 2, ay + 2, 5, 1); R(ctx, '#ffd23f', ax - 1, ay + 3, 3, 1);
    }
  });
  /* lamps + small bushes in front */
  [[46, 1], [118, 0], [176, 1], [234, 0], [291, 1], [347, 0]].forEach(([x, on]) => lamp(ctx, x, GROUND + 10, on || t % 8 < 6));
  for (const x of [8, 76, 134, 190, 246, 304, 392]) { DISC(ctx, x, GROUND + 7, 4, INK); DISC(ctx, x, GROUND + 7, 3, '#5eb14a'); R(ctx, '#b6f08a', x - 2, GROUND + 5, 2, 1); }
  /* birds */
  for (let i = 0; i < 3; i++) {
    const bx = ((t * (2 + i) + i * 120) % (W + 40)) - 20, by = 22 + i * 14 + Math.round(Math.sin((t + i * 3) / 2) * 2), wing = (t + i) % 2;
    R(ctx, INK, bx, by + (wing ? 0 : 1), 2, 1); R(ctx, INK, bx + 2, by + 1, 1, 1); R(ctx, INK, bx + 3, by + (wing ? 0 : 1), 2, 1);
  }
  /* walking dots (townsfolk silhouettes) on the road */
  for (let i = 0; i < 2; i++) {
    const px = ((t * (i ? -3 : 3) + i * 200) % (W + 20) + (W + 20)) % (W + 20) - 10, py = GROUND + 14;
    const cols = [['#e8543c', '#6b4526'], ['#4a90d9', '#3b2416']][i];
    R(ctx, INK, px, py - 8, 4, 8); R(ctx, '#f5c9a0', px + 1, py - 8, 2, 2); R(ctx, cols[0], px + 1, py - 6, 2, 3); R(ctx, cols[1], px + 1 + (t % 2) * 1, py - 3, 1, 3);
  }
}

/* Single building portrait (section headers) */
export function drawPortrait(ctx, name, t) {
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, 64, 80);
  R(ctx, '#7ac74f', 0, 70, 64, 10); R(ctx, '#6ab644', 0, 70, 64, 1);
  for (let x = 0; x < 64; x += 4) R(ctx, '#8ad45e', x + 1, 73, 2, 1);
  ctx.save(); ctx.translate(32, 71); BUILDINGS[name](ctx, t); ctx.restore();
}
