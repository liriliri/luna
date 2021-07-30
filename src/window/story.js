import 'luna-window.css'
import Window from 'luna-window.js'
import story from '../share/story'
import escape from 'licia/escape'
import readme from './README.md'
import { text } from '@storybook/addon-knobs'

const def = story(
  'window',
  () => {
    const titleA = text('Title A', 'Slayers - Wikipedia')
    const contentA = text('Content A', 'https://en.wikipedia.org/wiki/Slayers')

    const winA = new Window({
      title: titleA,
      x: 50,
      y: 50,
      content: contentA,
    })
    winA.show()

    const titleB = text('Title B', 'README.md')
    const contentB = text(
      'Content B',
      `<div style="padding:10px">${escape(readme).replace(
        /\n/g,
        '<br/>'
      )}</div>`
    )

    const winB = new Window({
      title: titleB,
      x: 100,
      y: 100,
      content: contentB,
    })
    winB.show()

    function updateSize() {
      const width = global.innerWidth - 150
      const height = (width / 4) * 3
      winA.setOption({
        width,
        height,
      })
      winB.setOption({
        width,
        height,
      })
    }
    updateSize()

    global.addEventListener('resize', updateSize)
    winA.on('destroy', () => {
      global.removeEventListener('resize', updateSize)
    })

    return [winA, winB]
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { window } = def
