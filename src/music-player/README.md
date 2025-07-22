# Luna Music Player

Music player with playlist support.

## Demo

https://luna.liriliri.io/?path=/story/music-player

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-music-player/luna-music-player.css" />
<script src="//cdn.jsdelivr.net/npm/luna-music-player/luna-music-player.js"></script>
```

You can also get it on npm.

```bash
npm install luna-music-player --save
```

```javascript
import 'luna-music-player/luna-music-player.css'
import LunaMusicPlayer from 'luna-music-player'
```

## Usage

```javascript
const musicPlayer = new LunaMusicPlayer(container, {
  audio: {
    url: 'https://luna.liriliri.io/Get_along.mp3',
    cover: 'https://luna.liriliri.io/Get_along.jpg',
    title: 'Get Along',
    artist: '林原めぐみ',
  }
})
musicPlayer.play()
```

## Configuration

* audio(IAudio | IAudio[]): Audio list.
* listFolded(boolean): Whether list should folded at first.

## Types

### IAudio

* artist(string): Audio artist.
* cover(string): Audio cover.
* title(string): Audio title.
* url(string): Audio src.
