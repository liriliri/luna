import 'luna-image-list.css'
import ImageList from 'luna-image-list.js'
import { number, boolean, button } from '@storybook/addon-knobs'
import story from '../share/story'
import readme from './README.md'
import map from 'licia/map'
import range from 'licia/range'
import LunaImageList from './vue'
import { h } from 'vue'

const def = story(
  'image-list',
  (container) => {
    const { rowHeight, verticalMargin, horizontalMargin, showTitle } =
      createKnobs()

    const imageList = new ImageList(container, {
      rowHeight,
      verticalMargin,
      horizontalMargin,
      showTitle,
    })

    imageList.setImages(getImages())

    button('Clear', () => {
      imageList.clear()
      return false
    })

    return imageList
  },
  {
    readme,
    source: __STORY__,
    VueComponent({ theme }) {
      const { rowHeight, verticalMargin, horizontalMargin, showTitle } =
        createKnobs()

      let imageList

      button('Clear', () => {
        imageList.clear()
        return false
      })

      return h(LunaImageList, {
        theme,
        rowHeight,
        verticalMargin,
        horizontalMargin,
        showTitle,
        images: getImages(),
        onCreate(instance) {
          imageList = instance
        },
      })
    },
  }
)

function getImages() {
  const images = map(range(1, 5), (i) => {
    return {
      src: `/pic${i}.png`,
      title: `pic${i}.png`,
    }
  })

  images.push({
    src: '/icon.png',
    title: 'icon.png',
  })

  return images
}

function createKnobs() {
  const rowHeight = number('Row Height', 180, {
    range: true,
    min: 100,
    max: 300,
  })

  const verticalMargin = number('Vertical Margin', 20, {
    range: true,
    min: 0,
    max: 100,
  })

  const horizontalMargin = number('Horizontal Margin', 20, {
    range: true,
    min: 0,
    max: 100,
  })

  const showTitle = boolean('Show Title', true)

  return {
    rowHeight,
    verticalMargin,
    horizontalMargin,
    showTitle,
  }
}

export default def

export const { imageList: html, vue } = def
