import 'luna-retro-emulator.css'
import story from '../share/story'
import RetroEmulator from 'luna-retro-emulator.js'
import $ from 'licia/$'
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

    const fcCore = '/fceumm_libretro.js'

    const core = optionsKnob(
      'Core',
      {
        FC: fcCore,
        SFC: '/snes9x_libretro.js',
        GBA: '/vba_next_libretro.js',
      },
      fcCore,
      {
        display: 'select',
      }
    )

    const config = text('RetroArch Config', 'fps_show = true')
    const coreConfig = text(
      'RetroArch Core Options',
      core === fcCore ? 'fceumm_turbo_enable = "Player 1"' : ''
    )

    if (core === fcCore) {
      const rom = text('ROM', '/Contra.nes')
      button('Load', () => {
        retroEmulator.load(rom)
        return false
      })
    }

    const retroEmulator = new RetroEmulator(container, {
      core,
      coreConfig,
      browserFS: '/browserfs.min.js',
      config,
    })

    return retroEmulator
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { retroEmulator } = def
