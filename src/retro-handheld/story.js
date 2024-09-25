import 'luna-retro-handheld.css'
import $ from 'licia/$'
import story from '../share/story'
import RetroHandheld from 'luna-retro-handheld.js'
import readme from './README.md'
import { optionsKnob, button, text } from '@storybook/addon-knobs'

const def = story(
  'retro-handheld',
  (container) => {
    $(container).css({
      maxWidth: 640,
      width: '100%',
      margin: '0 auto',
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

    const retroHandheld = new RetroHandheld(container, {
      core,
      config,
      coreConfig,
      browserFS: '/browserfs.min.js',
    })

    if (core === fcCore) {
      const rom = text('ROM', '/Contra.nes')
      button('Load', () => {
        retroHandheld.load(rom)
        return false
      })
    }

    return retroHandheld
  },
  {
    readme,
    story: __STORY__,
  }
)

export default def
export const { retroHandheld } = def
