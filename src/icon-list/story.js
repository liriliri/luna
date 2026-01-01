import 'luna-icon-list.css'
import story from '../share/story'
import IconList from 'luna-icon-list.js'
import readme from './README.md'
import LunaIconList from './react'
import $ from 'licia/$'
import { number, text, boolean } from '@storybook/addon-knobs'
import { red5 } from '../share/theme'

const def = story(
  'icon-list',
  (container) => {
    const { size, filter, selectable, multiSelections } = createKnobs()

    $(container).css('height', 400)

    const iconList = new IconList(container, {
      size,
      filter,
      selectable,
      multiSelections,
    })
    iconList.setIcons(getIcons())

    iconList.on('select', (icon) => {
      console.log('select', icon)
    })
    iconList.on('deselect', () => {
      console.log('deselect')
    })
    iconList.on('click', (e, icon) => {
      console.log('click', icon)
    })
    iconList.on('dblclick', (e, icon) => {
      console.log('dblclick', icon)
    })
    iconList.on('contextmenu', (e, icon) => {
      console.log('contextmenu', icon)
    })

    return iconList
  },
  {
    readme,
    source: __STORY__,
    ReactComponent({ theme }) {
      const { size, filter, selectable } = createKnobs()

      return (
        <LunaIconList
          style={{ maxHeight: 400 }}
          onSelect={(icon) => {
            console.log('select', icon)
          }}
          onDeselect={(icon) => {
            console.log('deselect', icon)
          }}
          onClick={(e, icon) => {
            console.log('click', icon)
          }}
          onDoubleClick={(e, icon) => {
            console.log('dblclick', icon)
          }}
          onContextMenu={(e, icon) => {
            console.log('contextmenu', icon)
          }}
          filter={filter}
          theme={theme}
          selectable={selectable}
          size={size}
          icons={getIcons()}
        />
      )
    },
  }
)

function getIcons() {
  return [
    {
      src: '/logo.png',
      name: 'Luna - "UI library"',
    },
    {
      src: '/pic1.png',
      name: 'Pic1',
      style: {
        filter: 'grayscale(100%)',
      },
    },
    {
      src: '/pic2.png',
      name: 'Pic2',
      style: {
        borderRadius: '50%',
      },
    },
    {
      src: '/pic3.png',
      name: 'Pic3',
      style: {
        border: `1px solid ${red5}`,
      },
    },
    {
      src: '/pic4.png',
      name: 'A_very_longlonglonglonglong name',
    },
    {
      src: 'https://eruda.liriliri.io/logo.png',
      name: 'Eruda - "Console for mobile browsers"',
    },
    {
      src: 'https://chii.liriliri.io/logo.png',
      name: 'Chii',
    },
    {
      src: 'https://licia.liriliri.io/logo.png',
      name: 'Licia',
    },
    {
      src: 'https://aya.liriliri.io/logo.png',
      name: 'Aya',
    },
    {
      src: 'https://vivy.liriliri.io/logo.png',
      name: 'Vivy',
    },
  ]
}

function createKnobs() {
  const size = number('Size', 72, {
    range: true,
    min: 32,
    max: 256,
    step: 1,
  })

  const filter = text('Filter', '')

  const selectable = boolean('Selectable', true)

  const multiSelections = boolean('Multi Selections', false)

  return {
    size,
    filter,
    selectable,
    multiSelections,
  }
}

export default def

export const { iconList: html, react } = def
