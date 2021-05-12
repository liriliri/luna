import 'luna-contextmenu.css'
import Contextmenu from 'luna-contextmenu.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'contextmenu',
  () => {
    const contextmenu = new Contextmenu()

    contextmenu.append('New File', () => {
      console.log('New File clicked')
    })

    const openSubMenu = contextmenu.appendSubMenu('Open')
    openSubMenu.append('index.html', () => {
      console.log('index.html clicked')
    })
    openSubMenu.append('example.js', () => {
      console.log('example.js clicked')
    })

    const stylesSubMenu = openSubMenu.appendSubMenu('Styles')
    stylesSubMenu.append('about.css', () => {
      console.log('about.css clicked')
    })
    stylesSubMenu.append('index.css', () => {
      console.log('index.css clicked')
    })

    contextmenu.appendSeparator()
    contextmenu.append('Quit', () => {
      console.log('Quit clicked')
    })

    document.addEventListener('contextmenu', () => {
      contextmenu.show(0, 0)
    })

    return contextmenu
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { contextmenu } = def
