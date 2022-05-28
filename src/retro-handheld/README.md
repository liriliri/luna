# Luna Retro Handheld

Retro emulator with controls ui.

## Demo

https://luna.liriliri.io/?path=/story/retro-handheld

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-retro-emulator/luna-retro-emulator.css" />
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-retro-handheld/luna-retro-handheld.css" />
<script src="//cdn.jsdelivr.net/npm/luna-retro-emulator/luna-retro-emulator.js"></script>
<script src="//cdn.jsdelivr.net/npm/luna-retro-handheld/luna-retro-handheld.js"></script>
```

You can also get it on npm.

```bash
npm install luna-retro-handheld luna-retro-emulator --save
```

```javascript
import 'luna-retro-emulator/luna-retro-emulator.css'
import 'luna-retro-handheld/luna-retro-handheld.css'
import LunaRetroHandheld from 'luna-retro-handheld'
```

## Api

### load(url: string): void

Load rom from url.
