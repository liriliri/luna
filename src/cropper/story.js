import 'luna-cropper.css'
import Cropper from 'luna-cropper.js'
import LunaCropper from './react'
import readme from './README.md'
import story from '../share/story'
import h from 'licia/h'
import $ from 'licia/$'
import { text } from '@storybook/addon-knobs'
import { useState } from 'react'

const def = story(
  'cropper',
  (wrapper) => {
    $(wrapper).html('')

    const container = h('div', {
      style: {
        width: '100%',
        height: 400,
        aspectRatio: '2',
      },
    })
    const preview = h('div', {
      style: {
        width: '50%',
        margin: '1rem 0',
      },
    })
    wrapper.appendChild(container)
    wrapper.appendChild(preview)

    const { image } = createKnobs()

    const cropper = new Cropper(container, {
      image,
      preview,
    })

    return cropper
  },
  {
    readme,
    source: __STORY__,
    ReactComponent() {
      const { image } = createKnobs()
      const [ref, setRef] = useState()

      return (
        <>
          <LunaCropper
            style={{
              width: '100%',
              height: 400,
              aspectRatio: '2',
            }}
            onCreate={(cropper) => {
              console.log(cropper)
            }}
            preview={ref}
            image={image}
          />
          <div
            style={{ width: '50%', margin: '1rem 0' }}
            ref={(ref) => {
              setRef(ref)
            }}
          />
        </>
      )
    },
  }
)

function createKnobs() {
  const image = text('Image', '/wallpaper.png')

  return {
    image,
  }
}

export default def

export const { cropper: html, react } = def
