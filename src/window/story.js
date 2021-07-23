import 'luna-window.css'
import Window from 'luna-window.js'
import story from '../share/story'
import escape from 'licia/escape'
import readme from './README.md'

const def = story(
  'window',
  () => {
    const winA = new Window({
      title: 'Window A - Iframe',
      x: 50,
      y: 50,
      content: 'https://eruda.liriliri.io',
    })
    winA.show()

    const winB = new Window({
      title: 'Window B - Html',
      x: 100,
      y: 100,
      content: `<div style="padding:10px">${escape(readme).replace(
        /\n/g,
        '<br/>'
      )}</div>`,
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
