import 'luna-fc-emulator.css'
import story from '../share/story'
import FcEmulator from 'luna-fc-emulator.js'
import $ from 'licia/$'
import h from 'licia/h'
import readme from './README.md'

const def = story(
  'fc-emulator',
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

    const fcEmulator = new FcEmulator(container, {
      FCEUmm: '/fceumm_libretro.js',
      browserFS: '/browserfs.min.js',
    })

    return fcEmulator
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { fcEmulator } = def
