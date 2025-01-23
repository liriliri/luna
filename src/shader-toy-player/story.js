import 'luna-shader-toy-player.css'
import ShaderToyPlayer from 'luna-shader-toy-player.js'
import readme from './README.md'
import story from '../share/story'
import $ from 'licia/$'
import shaders, { cube } from './shaders'
import LunaShaderToyPlayer from './vue'
import { h } from 'vue'
import { text, optionsKnob, button, boolean } from '@storybook/addon-knobs'

const def = story(
  'shader-toy-player',
  (container) => {
    $(container).css({
      maxWidth: 640,
      width: '100%',
      margin: '0 auto',
      minHeight: 150,
      aspectRatio: '1280/720',
    })

    const { example, renderPass, controls } = createKnobs()

    button('Compile', function () {
      shaderToyPlayer.setOption('renderPass', renderPass)
      return false
    })

    const shaderToyPlayer = new ShaderToyPlayer(container, {
      controls,
      renderPass: example,
    })

    return shaderToyPlayer
  },
  {
    readme,
    source: __STORY__,
    VueComponent() {
      const { example, renderPass, controls } = createKnobs()
      let shaderToyPlayer

      button('Compile', function () {
        shaderToyPlayer.setOption('renderPass', renderPass)
        return false
      })

      return h(LunaShaderToyPlayer, {
        renderPass: example,
        controls,
        style: {
          maxWidth: '640px',
          width: '100%',
          margin: '0 auto',
          minHeight: '150px',
          aspectRatio: '1280/720',
        },
        onCreate(instance) {
          shaderToyPlayer = instance
        },
      })
    },
  }
)

function createKnobs() {
  const controls = boolean('Controls', true)

  const example = optionsKnob(
    'Example',
    {
      'Star Nest': 'star',
      Seascape: 'sea',
      'Protean clouds': 'cloud',
    },
    'star',
    {
      display: 'select',
    }
  )

  const userImage = text('Image', cube.image)
  const userSound = text('Sound', cube.sound)

  const renderPass = [
    {
      inputs: [],
      outputs: [],
      code: userImage,
      name: 'Image',
      description: '',
      type: 'image',
    },
  ]

  if (userSound) {
    renderPass.push({
      inputs: [],
      outputs: [],
      code: userSound,
      name: 'Sound',
      description: '',
      type: 'sound',
    })
  }

  return {
    controls,
    example: [
      {
        inputs: [],
        outputs: [],
        code: shaders[example],
        name: 'Image',
        description: '',
        type: 'image',
      },
    ],
    renderPass,
  }
}

export default def

export const { shaderToyPlayer: html, vue } = def
