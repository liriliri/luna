import 'luna-cropper.css'
import Cropper from 'luna-cropper.js'
import readme from './README.md'
import story from '../share/story'
import h from 'licia/h'
import $ from 'licia/$'
import { text } from '@storybook/addon-knobs'

const def = story(
  'cropper',
  (wrapper) => {
    $(wrapper).html('')

    const container = h('div', {
      style: {
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

    const url = text('Url', '/wallpaper.jpg')

    const cropper = new Cropper(container, {
      url,
      preview,
    })

    return cropper
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { cropper } = def
