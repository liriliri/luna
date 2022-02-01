import 'luna-shader-toy-player.css'
import ShaderToyPlayer from 'luna-shader-toy-player.js'
import readme from './README.md'
import story from '../share/story'
import h from 'licia/h'
import $ from 'licia/$'
import shaders from './shaders'
import { text, optionsKnob, button } from '@storybook/addon-knobs'

const def = story(
  'shader-toy-player',
  (wrapper) => {
    $(wrapper)
      .css({
        maxWidth: 640,
        width: '100%',
        margin: '0 auto',
        minHeight: 150,
        aspectRatio: '1280/720',
      })
      .html('')
    const container = h('div')
    wrapper.appendChild(container)

    const example = optionsKnob(
      'Example',
      {
        'Fork Star Nest elevations 792': 'star',
        Seascape: 'sea',
      },
      'star',
      {
        display: 'select',
      }
    )

    const userCode = text('Shader', shaders.star)
    button('Compile', function () {
      loadShader(userCode)
      return false
    })

    const shaderToyPlayer = new ShaderToyPlayer(container)

    function loadShader(code) {
      shaderToyPlayer.load([
        {
          inputs: [],
          outputs: [
            {
              id: '4dfGRr',
              channel: 0,
            },
          ],
          code,
          name: 'Image',
          description: '',
          type: 'image',
        },
      ])
    }

    loadShader(shaders[example])

    return shaderToyPlayer
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { shaderToyPlayer } = def
