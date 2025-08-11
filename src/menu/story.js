import 'luna-menu.css'
import Menu from 'luna-menu.js'
import cloneDeep from 'licia/cloneDeep'
import readme from './README.md'
import story from '../share/story'
import { eventClient } from '../share/util'
import { object } from '@storybook/addon-knobs'

const def = story(
  'menu',
  () => {
    const template = object('Template', [
      {
        label: 'New File',
      },
      {
        type: 'submenu',
        label: 'Open',
        submenu: [
          {
            label: 'index.html',
            enabled: false,
          },
          {
            label: 'example.js',
          },
          {
            type: 'submenu',
            label: 'Styles',
            submenu: [
              {
                label: 'about.css',
              },
              {
                label: 'index.css',
              },
            ],
          },
        ],
      },
      {
        type: 'separator',
      },
      {
        label: 'Quit',
      },
    ])

    const menu = Menu.build(cloneDeep(template))

    function showMenu(e) {
      e.preventDefault()
      menu.show(eventClient('x', e), eventClient('y', e))
    }
    document.addEventListener('contextmenu', showMenu)
    menu.on('destroy', () => {
      document.removeEventListener('contextmenu', showMenu)
    })

    menu.show(16, 16)

    return menu
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { menu } = def
