import 'luna-window.css'
import Window from 'luna-window.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'window',
  () => {
    const winA = new Window({ title: 'Window A', x: 50, y: 50 })
    winA.show()

    const winB = new Window({ title: 'Window B', x: 100, y: 100 })
    winB.show()

    return [winA, winB]
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { window } = def
