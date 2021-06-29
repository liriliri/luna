import 'luna-carousel.css'
import Carousel from 'luna-carousel.js'
import $ from 'licia/$'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'carousel',
  (container) => {
    $(container).css({
      maxWidth: 640,
      margin: '0 auto',
      minHeight: 150,
      aspectRatio: '1280/720',
    })
    const carousel = new Carousel(container)

    const commonWrapperStyle = 'position:relative;height:100%;width:100%;'
    const commonTextStyle =
      'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:25px;color:#fff;'

    carousel.append(
      `<div style="background:#e73c5e;${commonWrapperStyle}"><span style="${commonTextStyle}">ITEM 1</span></div>`
    )
    carousel.append(
      `<div style="background:#614d82;${commonWrapperStyle}"><span style="${commonTextStyle}">ITEM 2</div>`
    )
    carousel.append(
      `<div style="background:#EB3D21;${commonWrapperStyle}"><span style="${commonTextStyle}">ITEM 3</div>`
    )

    return carousel
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { carousel } = def
