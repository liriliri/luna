# Luna Audio Player

Audio player.

## Demo

https://luna.liriliri.io/?path=/story/audio-player

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-audio-player/luna-audio-player.css" />
<script src="//cdn.jsdelivr.net/npm/luna-audio-player/luna-audio-player.js"></script>
```

You can also get it on npm.

```bash
npm install luna-audio-player --save
```

```javascript
import 'luna-audio-player/luna-audio-player.css'
import LunaAudioPlayer from 'luna-audio-player'
```

## Usage

```javascript
const audioPlayer = new LunaAudioPlayer(container, { url: 'https://luna.liriliri.io/Get_along.mp3' })
audioPlayer.play()
```

## Configuration

* progressColor(string): Progress color.
* url(string): Audio url.
* waveColor(string): Wave color.

## Api

### play(): void

Play audio.
