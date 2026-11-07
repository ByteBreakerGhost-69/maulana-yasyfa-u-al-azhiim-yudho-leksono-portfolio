/* Retro contact terminal. Output is built with DOM nodes (no innerHTML), so visitor input is never interpreted as HTML. */

export function mountTerminal(root, ctx) {
  const { t, L, state } = ctx;
  const screen = root.querySelector('.term-screen');
  const form = root.querySelector('.term-form');
  const input = root.querySelector('.term-input');
  const history = [];
  let hIdx = 0;

  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const fmt = (s, ...a) => a.reduce((acc, v, i) => acc.replace('{' + i + '}', v), s);

  function line(...parts) {
    const p = el('p', 'tl');
    for (const part of parts) {
      if (typeof part === 'string') p.append(document.createTextNode(part));
      else if (part.href) { const a = el('a', 'tlink', part.text); a.href = part.href; if (/^https?:/.test(part.href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; } p.append(a); }
      else if (part.cmd) { const b = el('button', 'tcmd', part.text); b.type = 'button'; b.addEventListener('click', () => run(part.cmd)); p.append(b); }
      else if (part.cls) p.append(el('span', part.cls, part.text));
    }
    screen.append(p);
    screen.scrollTop = screen.scrollHeight;
    return p;
  }
  const blank = () => line(' ');

  const COMMANDS = {
    help() {
      line({ cls: 'tdim', text: t('term.help.title') });
      for (const c of ['help', 'about', 'skills', 'projects', 'open', 'achievements', 'contact', 'philosophy', 'lang', 'sound', 'clear']) {
        const label = c === 'open' ? 'open <n>' : c === 'lang' ? 'lang <id|en|zh>' : c === 'sound' ? 'sound <on|off>' : c;
        line('  ', { cmd: c === 'open' ? 'projects' : c === 'lang' ? 'lang en' : c === 'sound' ? 'sound on' : c, text: label.padEnd(17) }, t('term.c.' + c));
      }
    },
    about() {
      const id = state.profile.identity;
      line({ cls: 'tgreen', text: id.firstName + ' ' + id.restOfName });
      id.classes.forEach((c) => line('  > ', L(c)));
      line(t('card.home') + ': ' + L(id.location));
      line(L(id.shortBio));
    },
    skills() {
      state.skills.categories.forEach((c) => line({ cls: 'tgreen', text: L(c.name) + ' (' + c.skills.length + ')' }, ': ' + c.skills.map((s) => s.name).join(', ')));
      line({ cls: 'tdim', text: t('term.skills.note') });
    },
    projects() {
      state.projects.forEach((p, i) => line({ cmd: 'open ' + (i + 1), text: String(i + 1).padStart(2, '0') + ' ' + p.name }, '  ', { cls: 'tdim', text: '[' + t('status.' + p.statusType) + ']' }));
      line({ cls: 'tdim', text: t('term.projects.hint') });
    },
    open(args) {
      const q = args.join(' ').toLowerCase();
      if (!q) return line(t('term.usage.open'));
      const n = Number(q);
      const p = Number.isInteger(n) ? state.projects[n - 1] : state.projects.find((x) => x.name.toLowerCase().includes(q) || x.id.includes(q));
      if (!p) { ctx.sfx('error'); return line({ cls: 'tred', text: fmt(t('term.notfound'), q) }); }
      line(fmt(t('term.opening'), p.name));
      ctx.openProject(p.id);
    },
    achievements() {
      state.profile.achievements.forEach((a) => line({ cls: 'tgreen', text: '* ' + L(a.name) }, ' - ' + L(a.result)));
    },
    contact() {
      const l = state.profile.links;
      line({ cls: 'tdim', text: t('term.contact.title') });
      line('  email      ', { href: 'mailto:' + l.email, text: l.email });
      line('  github     ', { href: l.github, text: l.github.replace('https://', '') });
      line('  linkedin   ', { href: l.linkedin, text: 'linkedin.com/in/maulana-yasyfa-u-al-azhiim-yudho-leksono' });
      line('  instagram  ', { href: l.instagram, text: l.instagram.replace('https://www.', '') });
      line('  x          ', { href: l.x, text: l.x.replace('https://', '') });
    },
    philosophy() { line({ cls: 'tyellow', text: '"' + L(state.profile.identity.philosophy) + '"' }); },
    lang(args) {
      const v = (args[0] || '').toLowerCase();
      if (!['id', 'en', 'zh'].includes(v)) return line(t('term.lang.usage'));
      ctx.setLang(v);
    },
    sound(args) {
      const v = (args[0] || '').toLowerCase();
      if (v !== 'on' && v !== 'off') return line(t('term.sound.usage'));
      ctx.setSound(v === 'on');
    },
    clear() { screen.textContent = ''; },
    whoami() { COMMANDS.about(); },
    ls() { COMMANDS.projects(); },
    konami() { line({ cls: 'tyellow', text: t('term.konami') }); },
    email() { const e = state.profile.links.email; line({ href: 'mailto:' + e, text: e }); },
    github() { const u = state.profile.links.github; line({ href: u, text: u }); },
    linkedin() { const u = state.profile.links.linkedin; line({ href: u, text: u }); },
    instagram() { const u = state.profile.links.instagram; line({ href: u, text: u }); },
    x() { const u = state.profile.links.x; line({ href: u, text: u }); }
  };

  function run(raw) {
    const text = raw.trim();
    if (!text) return;
    line({ cls: 'tprompt', text: '$ ' }, text);
    history.push(text); hIdx = history.length;
    const [cmd, ...args] = text.split(/\s+/);
    const key = cmd.toLowerCase();
    if (key === 'sudo') {
      const l = state.profile.links;
      line({ cls: 'tgreen', text: t('term.sudo') }, ' ', { href: 'mailto:' + l.email, text: l.email });
      ctx.sfx('open'); return;
    }
    if (Object.prototype.hasOwnProperty.call(COMMANDS, key)) { COMMANDS[key](args); ctx.sfx('click'); }
    else { ctx.sfx('error'); line({ cls: 'tred', text: fmt(t('term.notfound'), cmd.slice(0, 40)) }); }
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); const v = input.value; input.value = ''; run(v); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); if (hIdx > 0) { hIdx--; input.value = history[hIdx]; } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (hIdx < history.length - 1) { hIdx++; input.value = history[hIdx]; } else { hIdx = history.length; input.value = ''; } }
  });
  root.querySelector('.term-screen').addEventListener('click', (e) => { if (!window.getSelection().toString() && !e.target.closest('a,button')) input.focus({ preventScroll: true }); });
  root.querySelectorAll('[data-cmd]').forEach((b) => b.addEventListener('click', () => run(b.dataset.cmd)));

  line({ cls: 'tgreen', text: 'PIXEL-TOWN OS v1.0' });
  line(t('term.welcome'));
  blank();
}
