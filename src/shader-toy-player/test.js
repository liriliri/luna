import ShaderToyPlayer from './index'
import test from '../share/test'

const code = `void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord/iResolution.xy;
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
    fragColor = vec4(col,1.0);
}`

test('shader-toy-player', (container) => {
  const shaderToyPlayer = new ShaderToyPlayer(container)

  it('basic', function () {
    shaderToyPlayer.setOption('renderPass', [
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

  return shaderToyPlayer
})
