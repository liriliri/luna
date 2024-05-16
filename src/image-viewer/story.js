import 'luna-image-viewer.css'
import ImageViewer from 'luna-image-viewer.js'
import readme from './README.md'
import story from '../share/story'
import $ from 'licia/$'
import { text, number, button, boolean } from '@storybook/addon-knobs'
import LunaImageViewer from './react'

const def = story(
  'image-viewer',
  (container) => {
    $(container).css({
      width: '100%',
      maxWidth: 640,
      height: 360,
      margin: '0 auto',
    })

    const { image, initialCoverage, zoomOnWheel } = createKnobs()

    const imageViewer = new ImageViewer(container, {
      image,
      initialCoverage,
      zoomOnWheel,
    })

    button('Reset', () => {
      imageViewer.reset()
      return false
    })

    button('Zoom In', () => {
      imageViewer.zoom(0.1)
      return false
    })

    button('Zoom Out', () => {
      imageViewer.zoom(-0.1)
      return false
    })

    button('Rotate Left', () => {
      imageViewer.rotate(-90)
      return false
    })

    button('Rotate Right', () => {
      imageViewer.rotate(90)
      return false
    })

    return imageViewer
  },
  {
    readme,
    source: __STORY__,
    ReactComponent() {
      const { image, initialCoverage, zoomOnWheel } = createKnobs()

      return (
        <LunaImageViewer
          style={{
            width: '100%',
            maxWidth: 640,
            height: 360,
            margin: '0 auto',
          }}
          onCreate={(imageViewer) => {
            console.log(imageViewer)
          }}
          image={image}
          initialCoverage={initialCoverage}
          zoomOnWheel={zoomOnWheel}
        />
      )
    },
  }
)

function createKnobs() {
  const image = text('Image', 'https://res.liriliri.io/luna/pic1.jpg')
  const initialCoverage = number('Initial Coverage', 0.9, {
    range: true,
    min: 0.1,
    max: 1,
    step: 0.1,
  })
  const zoomOnWheel = boolean('Zoom On Wheel', true)

  return {
    image,
    initialCoverage,
    zoomOnWheel,
  }
}

export default def

export const { imageViewer: html, react } = def
