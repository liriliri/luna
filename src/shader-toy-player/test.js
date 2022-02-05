import ShaderToyPlayer from './index'
import './style.scss'
import './icon.css'
import test from '../share/test'

const code = `void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

    // Output to screen
    fragColor = vec4(col,1.0);
}`

test('shader-toy-player', (container) => {
  it('basic', function () {
    const shaderToyPlayer = new ShaderToyPlayer(container)
    shaderToyPlayer.load([
      {
        inputs: [],
        outputs: [],
        code,
        name: 'Image',
        description: '',
        type: 'image',
      },
    ])
  })
})
