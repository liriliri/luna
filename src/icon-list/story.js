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
      src: '/logo.png',
      name: 'Luna',
    },
    {
      src: 'https://eruda.liriliri.io/logo.png',
      name: 'Eruda',
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

export default def

export const { iconList } = def
