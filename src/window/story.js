import 'luna-window.css'
import Window from 'luna-window.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'window',
  () => {
    const winA = new Window()

    const winB = new Window()

    return [winA, winB]
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { window } = def
