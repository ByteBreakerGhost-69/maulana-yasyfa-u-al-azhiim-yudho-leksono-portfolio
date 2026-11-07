# Pixel Town Portfolio

A 2D, 16-bit pixel-art portfolio for **Maulana Yasyfa'u Al Azhiim Yudho Leksono**. Every section is a building in a small town; every sprite and scene is drawn with code, so there are no image assets to maintain.

Languages: Indonesian, English, Mandarin (switch in the top bar). Sound is **off by default**.

## Run it

The site loads its content from JSON files, so open it through a web server, not by double-clicking `index.html`:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy to GitHub Pages

1. Put the contents of this folder at the root of a repository (or in `/docs`).
2. Settings → Pages → deploy from the branch and folder you chose.
3. The empty `.nojekyll` file is already included.

## Where to edit content

| What | File |
|---|---|
| Name, bio, motto, education, achievements, timeline, social links | `data/profile.json` |
| The 14 project rooms (text in 3 languages, status, technologies, link) | `data/projects.json` |
| Skill tree and inventory | `data/skills.json` |
| Every UI label and terminal message | `data/i18n.json` |

Each translatable value looks like `{ "en": "...", "id": "...", "zh": "..." }`.

### Project status

`statusType` in `projects.json` must be one of `published`, `documented`, `developing`, `experimental`, `early`, `earlier`. Keep the `note` field for accuracy notes (for example, planned features that are not built yet). Please keep following `PORTFOLIO_CONTENT_GUIDELINES.md`: no invented metrics, audits, deployments, users, or skill percentages.

### Skill labels

Each skill has a `level`: `used`, `learning` or `exploring`. These were set from the project evidence in the data pack (a skill that appears in a project's technologies is `used`). **Please review them** and change any that do not match how you see yourself. `projects` lists the project ids shown in the skill's detail window.

### Add another language

1. Add the code to `LANGS` in `js/app.js` and a button in `index.html`.
2. Add the new key next to `en`, `id`, `zh` in every JSON file.

## Files

```
index.html          page structure
css/style.css       all styling (warm 16-bit theme)
js/app.js           rendering, language, dialogs, events
js/pixel.js         palette, sprites, buildings, town scene
js/audio.js         chiptune music and sound effects (Web Audio)
js/terminal.js      the contact terminal
js/easter.js        hidden easter egg
data/*.json         all content
assets/             favicon, social preview, fonts
```

## Accessibility and performance

- Works with keyboard only; dialogs use the native `<dialog>` element (focus trap, Esc to close).
- Respects `prefers-reduced-motion` (no animation loop, instant text, no blinking).
- Animated canvases pause when off screen. Layout is responsive; the town can be swiped sideways on small phones.
- No external requests: fonts are bundled.

## Credits

Fonts are bundled under the SIL Open Font License: *Press Start 2P* and *Jersey 15* (see `assets/fonts/`).
