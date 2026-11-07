import { paintSprites, drawTown, drawPortrait, TOWN, BUILDING_ORDER } from './pixel.js';
import { audio } from './audio.js';
import { mountTerminal } from './terminal.js';
import { initEasterEgg, fireworks } from './easter.js';

/* ---------- settings ---------- */
const DEFAULT_LANG = 'en';           // used when the browser language is not id / en / zh
const LANGS = ['id', 'en', 'zh'];
const CAT_ICON = { security: 'shield', ai: 'robot', web3: 'block', ml: 'neuron', research: 'code', creative: 'rocket' };
const LEVELS = ['used', 'learning', 'exploring'];

const state = { lang: DEFAULT_LANG, i18n: {}, profile: null, projects: [], skills: null, skillView: 'tree', skillLevel: null, invCat: 'all', projectCat: 'all', dlg: null, hover: -1 };
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const t = (k) => { const e = state.i18n[k]; return e ? (e[state.lang] || e.en || k) : k; };
const L = (o) => (o ? o[state.lang] || o.en || '' : '');
const sprite = (name, cls = 's2') => `<canvas class="spr ${cls}" data-sprite="${name}" aria-hidden="true"></canvas>`;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } }
};
const sfx = (n) => audio.sfx(n);

/* ---------- boot ---------- */
async function boot() {
  const j = (p) => fetch(p).then((r) => { if (!r.ok) throw new Error(p + ' ' + r.status); return r.json(); });
  try {
    const [i18n, profile, projects, skills] = await Promise.all([j('data/i18n.json'), j('data/profile.json'), j('data/projects.json'), j('data/skills.json')]);
    Object.assign(state, { i18n, profile, projects, skills });
  } catch (err) {
    $('#main').innerHTML = '<section class="room"><div class="panel"><h2 class="h2">Oops</h2><p>The data files could not be loaded. If you opened index.html directly from a folder, start a small local server instead (for example <code>python3 -m http.server</code>) or open the site on GitHub Pages.</p><p>Berkas data tidak bisa dimuat. Jika kamu membuka index.html langsung dari folder, jalankan server lokal (misalnya <code>python3 -m http.server</code>) atau buka lewat GitHub Pages.</p></div></section>';
    console.error(err);
    return;
  }
  state.lang = pickLang();
  bind();
  renderAll();
  initObservers();
  initEasterEgg(unlockEgg);
}

function pickLang() {
  const saved = store.get('pt-lang');
  if (LANGS.includes(saved)) return saved;
  for (const l of navigator.languages || [navigator.language || '']) {
    const base = String(l).toLowerCase().slice(0, 2);
    if (base === 'in') return 'id';
    if (LANGS.includes(base)) return base;
  }
  return DEFAULT_LANG;
}

/* ---------- rendering ---------- */
function renderAll() {
  applyStatic();
  renderGate(); renderHouse(); renderTower(); renderLab(); renderHall(); renderLibrary(); renderPost();
  paintSprites();
  registerCanvases();
  if (state.dlg) reopenDialog();
}

function applyStatic() {
  const html = document.documentElement;
  html.lang = state.lang === 'zh' ? 'zh-CN' : state.lang;
  document.title = t('meta.title');
  $$('[data-i18n]').forEach((n) => { n.textContent = t(n.dataset.i18n); });
  $$('[data-i18n-attr]').forEach((n) => n.dataset.i18nAttr.split(';').forEach((pair) => { const [a, k] = pair.split(':'); n.setAttribute(a, t(k)); }));
  $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)));
  $('#footer-motto').textContent = L(state.profile.identity.philosophy);
  updateSoundButton();
}

function renderGate() {
  const id = state.profile.identity;
  $('#logo-sub').textContent = id.restOfName;
  $('#classes').innerHTML = id.classes.map((c) => `<span>${esc(L(c))}</span>`).join('<i aria-hidden="true">◆</i>');
  $('#motto').textContent = L(id.philosophy);
  $('#town-links').innerHTML = BUILDING_ORDER.map((name, i) => {
    const w = TOWN.widths[i], h = TOWN.heights[i];
    const style = `left:${(((TOWN.xs[i] - w / 2) / TOWN.W) * 100).toFixed(2)}%;width:${((w / TOWN.W) * 100).toFixed(2)}%;top:${(((TOWN.GROUND - h) / TOWN.H) * 100).toFixed(2)}%;height:${((h / TOWN.H) * 100).toFixed(2)}%`;
    return `<a class="town-link" href="#${name}" data-town="${i}" style="${style}"><span class="town-tag">${esc(t('nav.' + name))}</span></a>`;
  }).join('');
}

function renderHouse() {
  const { identity: id, education, achievements } = state.profile;
  const skillCount = state.skills.categories.reduce((n, c) => n + c.skills.length, 0);
  const edu = education[0];
  $('#house-body').innerHTML = `
    <div class="house-grid">
      <article class="panel player">
        <h3 class="panel-title">${esc(t('card.title'))}</h3>
        <dl class="sheet">
          <div><dt>${esc(t('card.name'))}</dt><dd>${esc(id.firstName + ' ' + id.restOfName)}</dd></div>
          <div><dt>${esc(t('card.class'))}</dt><dd><ul class="tags">${id.classes.map((c) => `<li>${esc(L(c))}</li>`).join('')}</ul></dd></div>
          <div><dt>${esc(t('card.home'))}</dt><dd>${esc(L(id.location))}</dd></div>
          <div><dt>${esc(t('card.school'))}</dt><dd>${esc(edu.institution)}<br><span class="dim">${esc(L(edu.period))} · ${esc(L(edu.stream))}</span></dd></div>
          <div><dt>${esc(t('card.interests'))}</dt><dd><ul class="tags alt">${id.interests.map((c) => `<li>${esc(L(c))}</li>`).join('')}</ul></dd></div>
        </dl>
      </article>
      <article class="panel story">
        <h3 class="panel-title">${esc(t('card.story'))}</h3>
        <p class="story-short">${esc(L(id.shortBio))}</p>
        <p>${esc(L(id.longBio))}</p>
        <blockquote class="motto-box"><span class="mb-label">${esc(t('card.motto'))}</span>${esc(L(id.philosophy))}</blockquote>
      </article>
    </div>
    <ul class="stats" aria-label="${esc(t('card.stats'))}">
      <li>${sprite('code', 's3')}<b>${state.projects.length}</b><span>${esc(t('stat.projects'))}</span></li>
      <li>${sprite('gem', 's3')}<b>${state.skills.categories.length}</b><span>${esc(t('stat.groups'))}</span></li>
      <li>${sprite('wrench', 's3')}<b>${skillCount}</b><span>${esc(t('stat.skills'))}</span></li>
      <li>${sprite('trophy', 's3')}<b>${achievements.length}</b><span>${esc(t('stat.awards'))}</span></li>
    </ul>`;
}

/* --- skills --- */
function renderTower() {
  $('#tower-body').innerHTML = `
    <div class="toolbar">
      <div class="seg" role="group" aria-label="${esc(t('tower.view'))}">
        <button type="button" data-view="tree" aria-pressed="${state.skillView === 'tree'}">${sprite('stump', 's1')}${esc(t('view.tree'))}</button>
        <button type="button" data-view="inv" aria-pressed="${state.skillView === 'inv'}">${sprite('pkg', 's1')}${esc(t('view.inv'))}</button>
      </div>
      <div class="legend" role="group" aria-label="${esc(t('legend.label'))}">
        ${LEVELS.map((lv) => `<button type="button" class="legend-btn" data-level-filter="${lv}" aria-pressed="${state.skillLevel === lv}"><i class="gem g-${lv}"></i>${esc(t('level.' + lv))}</button>`).join('')}
      </div>
    </div>
    <p class="note-line">${esc(t('tower.note'))}</p>
    <div id="skill-view"></div>`;
  renderSkillView();
}

function renderSkillView() {
  const box = $('#skill-view');
  if (!box) return;
  const cats = state.skills.categories;
  const leaf = (c, ci, s, si, mode) => mode === 'tree'
    ? `<li><button type="button" class="leaf" data-skill="${ci}-${si}" data-level="${s.level}"><i class="gem g-${s.level}"></i><span>${esc(s.name)}</span></button></li>`
    : `<li><button type="button" class="slot" data-skill="${ci}-${si}" data-level="${s.level}">${sprite(c.icon, 's3')}<i class="gem g-${s.level}"></i><span>${esc(s.name)}</span></button></li>`;
  if (state.skillView === 'tree') {
    box.innerHTML = `<div class="tree">
      <div class="tree-root">${sprite('stump', 's3')}<div><b>${esc(state.profile.identity.firstName.toUpperCase())}</b><span>${esc(t('tree.root'))}</span></div></div>
      ${cats.map((c, ci) => `<div class="branch">
        <button type="button" class="cat-node" data-cat-toggle="${ci}" aria-expanded="true">${sprite(c.icon, 's2')}<span class="cat-name">${esc(L(c.name))}</span><span class="cat-count">${c.skills.length}</span><span class="chev" aria-hidden="true">▾</span></button>
        <ul class="leaves" id="leaves-${ci}">${c.skills.map((s, si) => leaf(c, ci, s, si, 'tree')).join('')}</ul>
      </div>`).join('')}
    </div>`;
  } else {
    const tabs = [['all', t('inv.all')], ...cats.map((c) => [c.id, L(c.name)])];
    const list = cats.flatMap((c, ci) => (state.invCat === 'all' || state.invCat === c.id) ? c.skills.map((s, si) => leaf(c, ci, s, si, 'inv')) : []);
    box.innerHTML = `<div class="inv">
      <div class="inv-tabs" role="group" aria-label="${esc(t('inv.cat'))}">${tabs.map(([k, label]) => `<button type="button" data-inv-cat="${k}" aria-pressed="${state.invCat === k}">${esc(label)}</button>`).join('')}</div>
      <ul class="inv-grid">${list.join('')}</ul>
    </div>`;
  }
  paintSprites(box);
  applyLevelFilter();
}

function applyLevelFilter() {
  $$('#skill-view [data-level]').forEach((n) => n.classList.toggle('dim', !!state.skillLevel && n.dataset.level !== state.skillLevel));
}

/* --- projects --- */
function badge(type) { return `<span class="badge st-${type}">${esc(t('status.' + type))}</span>`; }

function renderLab() {
  const cats = [...new Set(state.projects.map((p) => p.category))];
  const count = (c) => c === 'all' ? state.projects.length : state.projects.filter((p) => p.category === c).length;
  $('#lab-body').innerHTML = `
    <div class="chips" role="group" aria-label="${esc(t('filter.label'))}">
      ${['all', ...cats].map((c) => `<button type="button" class="chip" data-filter-cat="${c}" aria-pressed="${state.projectCat === c}">${c === 'all' ? '' : sprite(CAT_ICON[c], 's1')}${esc(c === 'all' ? t('filter.all') : t('cat.' + c))}<b>${count(c)}</b></button>`).join('')}
    </div>
    <ul class="rooms" id="rooms"></ul>
    <div class="panel legend-panel">
      <h3 class="panel-title">${esc(t('lab.legend'))}</h3>
      <ul class="status-legend">${['published', 'documented', 'developing', 'experimental', 'early', 'earlier'].map((s) => `<li>${badge(s)}<span>${esc(t('status.' + s + '.desc'))}</span></li>`).join('')}</ul>
      <p class="note-line">${esc(t('lab.disclaimer'))}</p>
    </div>`;
  renderRooms();
}

function renderRooms() {
  const box = $('#rooms');
  if (!box) return;
  box.innerHTML = state.projects.map((p, i) => ({ p, i })).filter(({ p }) => state.projectCat === 'all' || p.category === state.projectCat).map(({ p, i }) => `
    <li><button type="button" class="room-card" data-project="${p.id}">
      <span class="room-no">${esc(t('lab.room'))} ${String(i + 1).padStart(2, '0')}${p.featured ? `<span class="feat" title="${esc(t('lab.featured'))}">★</span>` : ''}</span>
      <span class="room-ico">${sprite(p.icon, 's4')}</span>
      <span class="room-name">${esc(p.name)}</span>
      <span class="room-cat">${esc(t('cat.' + p.category))}</span>
      ${badge(p.statusType)}
      <span class="room-go">${esc(t('lab.enter'))} ▶</span>
    </button></li>`).join('');
  paintSprites(box);
}

/* --- achievements --- */
function renderHall() {
  const { achievements, identity } = state.profile;
  $('#hall-body').innerHTML = `
    <ul class="trophies">
      ${achievements.map((a) => `<li class="panel trophy">
        <div class="pedestal">${sprite(a.icon, 's5')}</div>
        <h3>${esc(L(a.name))}</h3>
        <p class="result">${esc(L(a.result))}</p>
        ${a.note ? `<p class="dim small">${esc(L(a.note))}</p>` : ''}
        ${a.project ? `<button type="button" class="btn btn-small" data-project="${a.project}">${esc(t('hall.viewProject'))}</button>` : ''}
      </li>`).join('')}
    </ul>
    <div class="banner"><span>${esc(t('card.motto'))}</span><b>${esc(L(identity.philosophy))}</b></div>`;
}

/* --- journey --- */
function renderLibrary() {
  const { journey, paths } = state.profile;
  const byId = Object.fromEntries(state.projects.map((p) => [p.id, p]));
  $('#library-body').innerHTML = `
    <div class="lib-grid">
      <div>
        <h3 class="sub-h">${esc(t('lib.timeline'))}</h3>
        <ol class="timeline">
          ${journey.map((j) => `<li><span class="node">${sprite(j.icon, 's2')}</span><div class="panel"><span class="when">${esc(L(j.when))}</span><h4>${esc(L(j.title))}</h4><p>${esc(L(j.text))}</p></div></li>`).join('')}
        </ol>
      </div>
      <div>
        <h3 class="sub-h">${esc(t('lib.paths'))}</h3>
        <ul class="paths">
          ${paths.map((p) => `<li class="panel path"><div class="path-head">${sprite(p.icon, 's3')}<h4>${esc(t('path.' + p.id + '.title'))}</h4></div><p>${esc(t('path.' + p.id + '.text'))}</p>
            <ul class="mini">${p.projects.map((id) => byId[id] ? `<li><button type="button" data-project="${id}">${esc(byId[id].name)}</button></li>` : '').join('')}</ul></li>`).join('')}
        </ul>
      </div>
    </div>`;
}

/* --- contact --- */
function renderPost() {
  const l = state.profile.links;
  const items = [
    ['mail', 'Email', l.email, 'mailto:' + l.email],
    ['code', 'GitHub', '@' + state.profile.identity.githubUsername, l.github],
    ['cap', 'LinkedIn', 'Maulana Yasyfa\'u Al Azhiim Yudho Leksono', l.linkedin],
    ['star', 'Instagram', '@liang_zhe_ming', l.instagram],
    ['chat', 'X', '@u53864', l.x]
  ];
  $('#post-body').innerHTML = `
    <div class="post-grid">
      <section class="term" id="term" aria-label="${esc(t('term.title'))}">
        <div class="term-bar"><i></i><i></i><i></i><span>${esc(t('term.title'))}</span></div>
        <div class="term-screen" role="log" aria-live="polite"></div>
        <div class="term-quick">${['help', 'projects', 'contact', 'philosophy'].map((c) => `<button type="button" data-cmd="${c}">${c}</button>`).join('')}</div>
        <form class="term-form" autocomplete="off"><label for="term-input" class="term-prompt">visitor@pixel-town:~$</label><input id="term-input" class="term-input" type="text" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="${esc(t('term.placeholder'))}"></form>
      </section>
      <div class="post-side">
        <h3 class="sub-h">${esc(t('contact.title'))}</h3>
        <ul class="contacts">
          ${items.map(([ic, name, handle, href]) => `<li><a class="contact" href="${esc(href)}" ${href.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>${sprite(ic, 's3')}<span><b>${name}</b><small>${esc(handle)}</small></span></a></li>`).join('')}
        </ul>
        <form class="panel mail-form" id="mail-form">
          <h3 class="panel-title">${esc(t('form.title'))}</h3>
          <label>${esc(t('form.name'))}<input name="name" type="text" maxlength="80" required></label>
          <label>${esc(t('form.message'))}<textarea name="message" rows="4" maxlength="1500" required></textarea></label>
          <button class="btn" type="submit">${esc(t('form.send'))}</button>
          <p class="dim small">${esc(t('form.hint'))}</p>
        </form>
      </div>
    </div>`;
  mountTerminal($('#term'), { t, L, state, sfx, setLang, setSound, openProject: (id) => openProject(id) });
}

/* ---------- dialog ---------- */
const dlg = () => $('#dlg');
let twTimer = null;

function openDialog({ icon, title, sub, body, foot, key }) {
  const d = dlg();
  $('#dlg-ico').dataset.sprite = icon || 'gem';
  paintSprites($('#dlg-box'));
  $('#dlg-title').textContent = title;
  $('#dlg-sub').innerHTML = sub || '';
  $('#dlg-body').innerHTML = body;
  $('#dlg-foot').innerHTML = foot || '';
  state.dlg = key;
  if (!d.open) { d.showModal(); document.documentElement.classList.add('lock'); sfx('open'); }
  $('#dlg-body').scrollTop = 0;
  paintSprites($('#dlg-box'));
}

function typewriter(node, text) {
  clearInterval(twTimer);
  node.setAttribute('aria-label', text);
  if (reduced) { node.textContent = text; node.classList.add('done'); return; }
  const chars = [...text];
  node.innerHTML = '<span class="on"></span><span class="off" aria-hidden="true"></span>';
  const on = node.firstChild, off = node.lastChild;
  off.textContent = text;
  node.classList.remove('done');
  const per = Math.max(1, Math.ceil(chars.length / 150));
  let i = 0, n = 0;
  const finish = () => { clearInterval(twTimer); node.textContent = text; node.classList.add('done'); };
  node.onclick = finish;
  twTimer = setInterval(() => {
    i = Math.min(chars.length, i + per);
    on.textContent = chars.slice(0, i).join('');
    off.textContent = chars.slice(i).join('');
    if (n++ % 2 === 0) sfx('tick');
    if (i >= chars.length) finish();
  }, 24);
}

function openProject(id) {
  const idx = state.projects.findIndex((p) => p.id === id);
  if (idx < 0) return;
  const p = state.projects[idx];
  const prev = state.projects[(idx - 1 + state.projects.length) % state.projects.length];
  const next = state.projects[(idx + 1) % state.projects.length];
  const body = `
    <p class="tw" id="tw"></p>
    <div class="kv"><span class="k">${esc(t('dlg.status'))}</span><span>${esc(L(p.status))}</span></div>
    ${p.note ? `<div class="callout"><b>${esc(t('dlg.note'))}</b><span>${esc(L(p.note))}</span></div>` : ''}
    <h4 class="sub-h">${esc(t('dlg.tech'))}</h4>
    <ul class="tags">${p.technologies.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    <h4 class="sub-h">${esc(t('dlg.highlights'))}</h4>
    <ul class="marks">${(p.highlights[state.lang] || p.highlights.en).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  const foot = `
    <div class="nav-pair">
      <button type="button" class="btn btn-small ghost" data-project="${prev.id}" aria-label="${esc(t('dlg.prev'))}: ${esc(prev.name)}">◀ <span>${esc(t('dlg.prev'))}</span></button>
      <button type="button" class="btn btn-small ghost" data-project="${next.id}" aria-label="${esc(t('dlg.next'))}: ${esc(next.name)}"><span>${esc(t('dlg.next'))}</span> ▶</button>
    </div>
    <a class="btn" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(t('dlg.github'))} ↗</a>`;
  openDialog({ icon: p.icon, title: p.name, sub: `${badge(p.statusType)}<span class="sub-cat">${esc(t('cat.' + p.category))} · ${esc(t('lab.room'))} ${String(idx + 1).padStart(2, '0')}</span>`, body, foot, key: { kind: 'project', id } });
  typewriter($('#tw'), L(p.summary));
}

function openSkill(key) {
  const [ci, si] = key.split('-').map(Number);
  const c = state.skills.categories[ci], s = c && c.skills[si];
  if (!s) return;
  const byId = Object.fromEntries(state.projects.map((p) => [p.id, p]));
  const used = (s.projects || []).filter((id) => byId[id]);
  const body = `
    <p class="tw done">${esc(t('level.' + s.level + '.desc'))}</p>
    <div class="kv"><span class="k">${esc(t('skill.group'))}</span><span>${esc(L(c.name))}</span></div>
    ${used.length ? `<h4 class="sub-h">${esc(t('skill.usedIn'))}</h4><ul class="mini">${used.map((id) => `<li><button type="button" data-project="${id}">${esc(byId[id].name)}</button></li>`).join('')}</ul>` : `<p class="dim">${esc(t('skill.none'))}</p>`}
    <p class="dim small">${esc(t('tower.note'))}</p>`;
  openDialog({ icon: c.icon, title: s.name, sub: `<span class="badge lv-${s.level}"><i class="gem g-${s.level}"></i>${esc(t('level.' + s.level))}</span>`, body, foot: `<button type="button" class="btn" data-close>${esc(t('dlg.close'))}</button>`, key: { kind: 'skill', id: key } });
}

function reopenDialog() {
  const k = state.dlg;
  if (!dlg().open || !k) return;
  if (k.kind === 'project') openProject(k.id);
  else if (k.kind === 'skill') openSkill(k.id);
  else if (k.kind === 'egg') showEgg();
}

function showEgg() {
  openDialog({ icon: 'star', title: t('egg.title'), sub: '<span class="badge st-published">+1 UP</span>', body: `<p class="tw done">${esc(t('egg.text'))}</p><p class="dim small">↑ ↑ ↓ ↓ ← → ← → B A</p>`, foot: `<button type="button" class="btn" data-close>${esc(t('dlg.close'))}</button>`, key: { kind: 'egg' } });
}
function unlockEgg() {
  fireworks(reduced);
  sfx('secret');
  showEgg();
}

/* ---------- language & sound ---------- */
function setLang(l) {
  if (!LANGS.includes(l) || l === state.lang) return;
  state.lang = l;
  store.set('pt-lang', l);
  renderAll();
  sfx('toggle');
}

async function setSound(on) {
  if (on) {
    const ok = await audio.enable();
    if (!ok) { toast(t('sound.unsupported')); return; }
    sfx('toggle');
  } else { audio.disable(); }
  updateSoundButton();
}
function updateSoundButton() {
  const b = $('#sound');
  b.setAttribute('aria-pressed', String(audio.enabled));
  b.classList.toggle('on', audio.enabled);
  $('#sound-txt').textContent = audio.enabled ? t('sound.on') : t('sound.off');
  b.setAttribute('aria-label', t('sound.label') + ': ' + (audio.enabled ? t('sound.on') : t('sound.off')));
}
let toastTimer = null;
function toast(msg) {
  const n = $('#toast'); n.textContent = msg; n.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => n.classList.remove('show'), 2600);
}

/* ---------- events ---------- */
function bind() {
  document.addEventListener('click', (e) => {
    const q = (s) => e.target.closest(s);
    let el;
    if ((el = q('[data-lang]'))) return setLang(el.dataset.lang);
    if (q('#sound')) return setSound(!audio.enabled);
    if (q('#start')) { sfx('start'); $('#house').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); return; }
    if ((el = q('[data-project]'))) { sfx('click'); return openProject(el.dataset.project); }
    if ((el = q('[data-skill]'))) { sfx('click'); return openSkill(el.dataset.skill); }
    if ((el = q('[data-filter-cat]'))) { state.projectCat = el.dataset.filterCat; $$('[data-filter-cat]').forEach((b) => b.setAttribute('aria-pressed', String(b === el))); renderRooms(); return sfx('click'); }
    if ((el = q('[data-view]'))) { state.skillView = el.dataset.view; $$('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b === el))); renderSkillView(); return sfx('click'); }
    if ((el = q('[data-level-filter]'))) { state.skillLevel = state.skillLevel === el.dataset.levelFilter ? null : el.dataset.levelFilter; $$('[data-level-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.levelFilter === state.skillLevel))); applyLevelFilter(); return sfx('click'); }
    if ((el = q('[data-inv-cat]'))) { state.invCat = el.dataset.invCat; renderSkillView(); return sfx('click'); }
    if ((el = q('[data-cat-toggle]'))) { const open = el.getAttribute('aria-expanded') !== 'true'; el.setAttribute('aria-expanded', String(open)); $('#leaves-' + el.dataset.catToggle).hidden = !open; return sfx('click'); }
    if (q('[data-close]') || q('#dlg-x')) return dlg().close();
    if (e.target === dlg()) return dlg().close();
    if (q('a[href^="#"], button')) sfx('click');
  });
  dlg().addEventListener('close', () => { clearInterval(twTimer); document.documentElement.classList.remove('lock'); state.dlg = null; sfx('close'); });
  document.addEventListener('submit', (e) => {
    if (e.target.id !== 'mail-form') return;
    e.preventDefault();
    const f = new FormData(e.target);
    const subject = encodeURIComponent('Hello from ' + String(f.get('name')).slice(0, 80));
    const body = encodeURIComponent(String(f.get('message')) + '\n\n— ' + String(f.get('name')));
    toast(t('form.opening'));
    window.location.href = `mailto:${state.profile.links.email}?subject=${subject}&body=${body}`;
  });
  /* town hover */
  document.addEventListener('pointerover', (e) => { const a = e.target.closest('.town-link'); if (a) setHover(Number(a.dataset.town)); });
  document.addEventListener('pointerout', (e) => { if (e.target.closest('.town-link')) setHover(-1); });
  document.addEventListener('focusin', (e) => { const a = e.target.closest('.town-link'); if (a) setHover(Number(a.dataset.town)); });
  document.addEventListener('focusout', (e) => { if (e.target.closest('.town-link')) setHover(-1); });
  const bar = $('.topbar');
  new ResizeObserver(() => document.documentElement.style.setProperty('--topbar-h', bar.offsetHeight + 'px')).observe(bar);
  /* let the title overlap the empty sky of the town canvas so the buildings show on the first screen */
  const wrap = $('#town-wrap');
  new ResizeObserver(() => document.documentElement.style.setProperty('--town-overlap', Math.round(wrap.offsetHeight * 0.3) + 'px')).observe(wrap);
}
function setHover(i) { if (state.hover !== i) { state.hover = i; if (reduced) drawNow(); else if (i >= 0) sfx('hover'); } }

/* ---------- canvases & animation ---------- */
const anims = [];
let tick = 0, lastTick = 0;
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { const a = anims.find((x) => x.el === e.target); if (a) { a.visible = e.isIntersecting; if (a.visible) a.draw(tick); } });
  document.documentElement.dataset.ready = '1';
}, { rootMargin: '120px' });

function registerCanvases() {
  anims.splice(0).forEach((a) => io.unobserve(a.el));
  const town = $('#town');
  anims.push({ el: town, visible: false, draw: (t0) => drawTown(town.getContext('2d'), t0, state.hover) });
  $$('canvas.bld').forEach((cv) => anims.push({ el: cv, visible: false, draw: (t0) => drawPortrait(cv.getContext('2d'), cv.dataset.building, t0) }));
  anims.forEach((a) => { io.observe(a.el); a.draw(tick); });
}
function drawNow() { anims.forEach((a) => a.visible && a.draw(tick)); }
if (!reduced) {
  const loop = (now) => {
    if (now - lastTick >= 110) { lastTick = now; tick++; for (const a of anims) if (a.visible) a.draw(tick); }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

function initObservers() {
  const links = $$('[data-nav]');
  const secs = links.map((l) => document.getElementById(l.dataset.nav));
  const vis = new Map();
  const so = new IntersectionObserver((es) => {
    es.forEach((e) => vis.set(e.target.id, e.intersectionRatio));
    let best = null, bestR = 0;
    secs.forEach((s) => { const r = vis.get(s.id) || 0; if (r > bestR) { best = s.id; bestR = r; } });
    links.forEach((l) => { if (l.dataset.nav === best) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current'); });
  }, { threshold: [0, 0.15, 0.3, 0.5, 0.75] });
  secs.forEach((s) => so.observe(s));
}

boot();
