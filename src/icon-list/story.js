import 'luna-icon-list.css'
import story from '../share/story'
import IconList from 'luna-icon-list.js'
import readme from './README.md'

const def = story(
  'icon-list',
  (container) => {
    const iconList = new IconList(container, {
      icons: getIcons(),
    })

    return iconList
  },
  {
    readme,
    source: __STORY__,
  }
)

function getIcons() {
  return [
    {
      src: '/icon.png',
      name: 'Luna',
    },
    {
      src: 'https://licia.liriliri.io/icon.png',
      name: 'Licia',
    },
  ]
}

export default def

export const { iconList } = def
