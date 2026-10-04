# Luna — Agent Guide

Luna is a multi-package UI library. Each component under `src/` is independently built and published as `luna-<name>` (npm / CDN). Prefer small, focused components with real behavior — pure CSS widgets (button, icon alone) are out of scope.

Demo: https://luna.liriliri.io/

## Tech stack

| Layer | Choice |
| --- | --- |
| Language | TypeScript (strict), target ES5 |
| Runtime UI | Vanilla DOM classes extending `Component` |
| Utilities | [licia](https://licia.liriliri.io/) |
| Styles | SCSS + PostCSS (autoprefixer, `postcss-prefixer` → `luna-*` classes) |
| Themes | `light` / `dark` / `auto` via `src/share/theme` |
| Bundler | Webpack 4 (per-component config generated at build time) |
| Docs / demos | Storybook 6 (`@storybook/html` + knobs + readme) |
| Tests | Karma + Mocha + Chai (+ Istanbul coverage) |
| Framework wrappers | Optional React (`react.tsx`); some also have Vue |
| Tooling | Custom CLI `bin/luna.js`, ESLint, Prettier |

## Repository layout

```
bin/luna.js          # CLI entry
lib/                 # build, doc generation, shared CLI helpers
src/
  share/             # Component base, hooks, theme, story/test helpers, webpack/karma templates
  <component>/       # one package per folder
    package.json     # name, version, luna.* config
    index.ts         # main class (default export) + JSDoc source of truth
    style.scss       # optional
    react.tsx        # optional React wrapper
    vue.ts           # optional Vue wrapper
    story.js         # Storybook story
    test.js          # Karma tests
    README.md        # GENERATED — do not edit by hand
dist/<component>/    # build output (publishable package)
index.json           # component registry (`luna update`)
```

Path aliases: `luna-<component>` → `src/<component>/index` (kept in sync by `luna update`).

## Component architecture

1. **Vanilla class first** — extend `src/share/Component.ts` (Emitter: `on` / `emit` / `off`).
2. **Options** — declare `IOptions`, `this.initOptions(options, defaults)`, handle updates in `changeOption`.
3. **DOM** — `this.c(...)` for prefixed classes, `this.find('.foo')` for queries; use `licia/$` / `licia/h`.
4. **Lifecycle** — `destroy()` must clean listeners, timers, and subcomponents (`addSubComponent`).
5. **Export** — end `index.ts` with `exportCjs(module, Class)`.
6. **React** (if `luna.react: true`) — thin wrapper: create instance in `useEffect`, sync with `useOption` / `useEvent`, expose `onCreate` for the imperative API.

### `package.json` → `luna` config

```json
{
  "name": "icon-list",
  "version": "0.4.0",
  "luna": {
    "react": true,
    "style": true,
    "dependencies": ["drag-selector"]
  }
}
```

Flags: `react`, `vue`, `style`, `icon`, `test`, `install`, `dependencies` (other Luna packages → peerDeps when published).

### Documentation

`src/<component>/README.md` is **generated**. Never edit it by hand.

1. Update JSDoc on the class (`@example`), public methods, and `IOptions` / related interfaces in `index.ts`.
2. Run `luna doc <component>`.
3. Commit the regenerated README with the source changes.

## CLI (`bin/luna.js`)

| Command | Purpose |
| --- | --- |
| `luna format [component]` | Prettier — run after every code change |
| `luna doc [component]` | Regenerate README from JSDoc |
| `luna lint [component]` | ESLint |
| `luna test [component]` | Karma tests |
| `luna build [component]` | Webpack UMD + `tsc` CJS/ESM → `dist/` |
| `luna dev <component>` | Watch rebuild for one component |
| `luna install` | `npm install` in component folders that need it |
| `luna update` | Refresh `index.json` + `tsconfig` paths |
| `luna genIcon` / `genAsset` | Icon CSS / inlined asset modules |

Omit `[component]` to run over all packages (topo-sorted by `luna.dependencies`).

Root scripts: `npm run dev` (Storybook `:8080`), `npm run ci` (install + lint + test), `npm run genTheme`.

## Conventions for agents

- Prefer **licia** utilities over hand-rolled helpers.
- Match an existing similar component before inventing patterns.
- Expose behavior via `IOptions` / `setOption`; React props mirror options plus events / `onCreate`.
- Theme with `src/share/mixin` + `theme-var` (`.theme-light` / `.theme-dark`).
- After edits: always `luna format <component>`; if JSDoc/API changed, also `luna doc <component>`.
- Change only the component you are working on.
- Commit only when the user asks.

## Quick workflow

```bash
luna format <component>
luna doc <component>    # if JSDoc / public API changed
luna lint <component>
luna test <component>
# npm run dev           # Storybook
```
