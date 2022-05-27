import 'luna-retro-emulator.css'
import story from '../share/story'
import RetroEmulator from 'luna-retro-emulator.js'
import $ from 'licia/$'
import h from 'licia/h'
import readme from './README.md'
import { optionsKnob, button, text } from '@storybook/addon-knobs'

const def = story(
  'retro-emulator',
  (container) => {
    $(container).css({
      maxWidth: 640,
      width: '100%',
      margin: '0 auto',
      aspectRatio: '1024/768',
    })

    const fcCore = 'https://res.liriliri.io/luna/fceumm_libretro.js'

    const core = optionsKnob(
      'Core',
      {
        FC: fcCore,
        SFC: 'https://res.liriliri.io/luna/snes9x_libretro.js',
        GBA: 'https://res.liriliri.io/luna/vba_next_libretro.js',
      },
      fcCore,
      {
        display: 'select',
      }
    )

    const retroEmulator = new RetroEmulator(container, {
      core,
      browserFS: 'https://res.liriliri.io/luna/browserfs.min.js',
    })

    if (core === fcCore) {
      const rom = text('ROM', 'https://res.liriliri.io/luna/Contra.nes')
      button('Load', () => {
        retroEmulator.load(rom)
        return false
      })
    }

    return retroEmulator
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { retroEmulator } = def
