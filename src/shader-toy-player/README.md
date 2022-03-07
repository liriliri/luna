# Luna Shader Toy Player

Shader toy player.

## Demo

https://luna.liriliri.io/?path=/story/shader-toy-player

## Install

Add the following script and style to your page.

```html
<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/luna-shader-toy-player/luna-shader-toy-player.css" />
<script src="//cdn.jsdelivr.net/npm/luna-shader-toy-player/luna-shader-toy-player.js"></script>
```

You can also get it on npm.

```bash
npm install luna-shader-toy-player --save
```

```javascript
import 'luna-shader-toy-player/luna-shader-toy-player.css'
import LunaShaderToyPlayer from 'luna-shader-toy-player'
```

## Usage

```javascript
const container = document.getElementById('container')
const shaderToyPlayer = new LunaShaderToyPlayer(container)

shaderToyPlayer.load([
  {
    inputs: [],
    outputs: [],
    code: `void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
    fragColor = vec4(col,1.0);
}`,
    name: 'Image',
    description: '',
    type: 'image',
  },
])
```
