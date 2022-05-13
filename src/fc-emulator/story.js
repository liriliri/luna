import 'luna-fc-emulator.css'
import story from '../share/story'
import FcEmulator from 'luna-fc-emulator.js'
import readme from './README.md'

const def = story(
  'fc-emulator',
  (container) => {
    const fcEmulator = new FcEmulator(container)

    return fcEmulator
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { fcEmulator } = def
