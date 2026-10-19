import 'luna-window.css'
import Window from 'luna-window.js'
import story from '../share/story'
import escape from 'licia/escape'
import readme from './README.md'
import LunaWindow from './vue'
import { h } from 'vue'
import { text } from '@storybook/addon-knobs'

const def = story(
  'window',
  () => {
    const { titleA, contentA, titleB, contentB } = createKnobs()

    const winA = new Window({
      title: titleA,
      x: 50,
      y: 50,
      content: contentA,
    })
    winA.show()

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
    VueComponent({ theme }) {
      const { titleA, contentA, titleB, contentB } = createKnobs()
      const width = global.innerWidth - 150
      const height = (width / 4) * 3

      return h('div', [
        h(LunaWindow, {
          theme,
          title: titleA,
          content: contentA,
          x: 50,
          y: 50,
          width,
          height,
        }),
        h(LunaWindow, {
          theme,
          title: titleB,
          content: contentB,
          x: 100,
          y: 100,
          width,
          height,
        }),
      ])
    },
  }
)

function createKnobs() {
  const titleA = text('Title A', 'Slayers - Wikipedia')
  const contentA = text('Content A', 'https://en.wikipedia.org/wiki/Slayers')
  const titleB = text('Title B', 'README.md')
  const contentB = text(
    'Content B',
    `<div style="padding:10px">${escape(readme).replace(/\n/g, '<br/>')}</div>`
  )

  return {
    titleA,
    contentA,
    titleB,
    contentB,
  }
}

export default def

export const { window, vue } = def
