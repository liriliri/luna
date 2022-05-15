import 'luna-retro-emulator.css'
import story from '../share/story'
import RetroEmulator from 'luna-retro-emulator.js'
import $ from 'licia/$'
import h from 'licia/h'
import readme from './README.md'

const def = story(
  'retro-emulator',
  (wrapper) => {
    $(wrapper)
      .css({
        maxWidth: 640,
        width: '100%',
        margin: '0 auto',
        minHeight: 150,
        aspectRatio: '1024/768',
      })
      .html('')
    const container = h('div')
    wrapper.appendChild(container)

    const retroEmulator = new RetroEmulator(container, {
      core: '/fceumm_libretro.js',
      browserFS: '/browserfs.min.js',
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
