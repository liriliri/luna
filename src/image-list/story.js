import 'luna-image-list.css'
import ImageList from 'luna-image-list.js'
import { number, boolean } from '@storybook/addon-knobs'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'image-list',
  (container) => {
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

    const imageList = new ImageList(container, {
      rowHeight,
      verticalMargin,
      horizontalMargin,
      showTitle,
    })

    imageList.append('/pic1.png', 'pic1.png')
    imageList.append('/pic2.png', 'pic2.png')
    imageList.append('/pic3.png', 'pic3.png')
    imageList.append('/pic4.png', 'pic4.png')
    imageList.append('/icon.png', 'icon.png')

    return imageList
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { imageList } = def
