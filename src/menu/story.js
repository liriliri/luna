import 'luna-menu.css'
import Menu from 'luna-menu.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'menu',
  () => {
    const menu = new Menu()

    menu.append('New File', () => {
      console.log('New File clicked')
    })

    const openSubMenu = menu.appendSubMenu('Open')
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

    menu.appendSeparator()
    menu.append('Quit', () => {
      console.log('Quit clicked')
    })

    document.addEventListener('contextmenu', () => {
      menu.show(0, 0)
    })

    return menu
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { menu } = def
