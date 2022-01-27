import 'luna-menu-bar.css'
import MenuBar from 'luna-menu-bar.js'
import story from '../share/story'
import readme from './README.md'
import { object } from '@storybook/addon-knobs'
import cloneDeep from 'licia/cloneDeep'

const def = story(
  'menu-bar',
  (container) => {
    const template = object('Template', [
      {
        label: 'File',
        submenu: [
          {
            type: 'submenu',
            label: 'Open',
            submenu: [
              {
                label: 'index.html',
              },
              {
                label: 'example.js',
              },
            ],
          },
          {
            type: 'separator',
          },
          {
            label: 'Exit',
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          {
            label: 'Cut',
          },
          {
            label: 'Copy',
          },
          {
            label: 'Paste',
          },
        ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About Luna',
          },
        ],
      },
    ])
    const menuBar = MenuBar.build(container, cloneDeep(template))

    return menuBar
  },
  {
    readme,
    source: __STORY__,
    layout: 'fullscreen',
  }
)

export default def

export const { menuBar } = def
