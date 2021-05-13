import 'luna-menu.css'
import Menu from 'luna-menu.js'
import readme from './README.md'
import story from '../share/story'
import { eventClient } from '../share/util'

const def = story(
  'menu',
  () => {
    const menu = new Menu()

    menu.append({
      label: 'New File',
      click() {
        console.log('New File clicked')
      },
    })

    const openSubMenu = new Menu()
    openSubMenu.append({
      label: 'index.html',
      click() {
        console.log('index.html clicked')
      },
    })
    openSubMenu.append({
      label: 'example.js',
      click() {
        console.log('example.js clicked')
      },
    })
    menu.append({
      type: 'submenu',
      label: 'Open',
      submenu: openSubMenu,
    })

    const stylesSubMenu = new Menu()
    stylesSubMenu.append({
      label: 'about.css',
      click() {
        console.log('about.css clicked')
      },
    })
    stylesSubMenu.append({
      label: 'index.css',
      click() {
        console.log('index.css clicked')
      },
    })
    openSubMenu.append({
      type: 'submenu',
      label: 'Styles',
      submenu: stylesSubMenu,
    })

    menu.append({
      type: 'separator',
    })
    menu.append({
      label: 'Quit',
      click() {
        console.log('Quit clicked')
      },
    })

    function showMenu(e) {
      event.preventDefault()
      menu.show(eventClient('x', e), eventClient('y', e))
    }
    document.addEventListener('contextmenu', showMenu)
    menu.on('destroy', () => {
      document.removeEventListener('contextmenu', showMenu)
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
