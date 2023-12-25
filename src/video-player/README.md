# Luna Video Player

Elegant HTML5 video player.

## Demo

https://luna.liriliri.io/?path=/story/video-player

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-video-player/luna-video-player.css" />
<script src="//cdn.jsdelivr.net/npm/luna-video-player/luna-video-player.js"></script>
```

You can also get it on npm.

```bash
npm install luna-video-player --save
```

```javascript
import 'luna-video-player/luna-video-player.css'
import LunaVideoPlayer from 'luna-video-player'
```

## Usage

```javascript
const container = document.getElementById('container')
const videoPlayer = new LunaVideoPlayer(container, {
  url: 'https://api.dogecloud.com/player/get.mp4?vcode=9dbb405e2141b5e8&userId=2096&flsign=1c02d5e60d2a0f29e1fd2ec0c0762b8b&ext=.mp4',
})

videoPlayer.play()
```

## Configuration

* hotkey(boolean): Enable hotkey.
* url(string): Video url.

## Api

### pause(): void

Pause video.

### play(): undefined | Promise<void>

Play video.

### seek(time: number): void

Seek to specified time.

### volume(percentage: number): void

Set video volume.
