# Luna Retro Emulator

Retro emulator using libretro.

## Demo

https://luna.liriliri.io/?path=/story/retro-emulator

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-retro-emulator/luna-retro-emulator.css" />
<script src="//cdn.jsdelivr.net/npm/luna-retro-emulator/luna-retro-emulator.js"></script>
```

You can also get it on npm.

```bash
npm install luna-retro-emulator --save
```

```javascript
import 'luna-retro-emulator/luna-retro-emulator.css'
import LunaRetroEmulator from 'luna-retro-emulator'
```

## Usage

```javascript
const retroEmulator = new RetroEmulator(container, {
  core: 'https://res.liriliri.io/luna/fceumm_libretro.js',
  browserFS: 'https://res.liriliri.io/luna/browserfs.min.js',
})
retroEmulator.load('https://res.liriliri.io/luna/Contra.nes')
```

## Configuration

* browserFS(string): BrowserFS url.
* core(string): Libretro core url.

## Api

### load(url?: string): void

Load rom from url.
