import 'luna-cropper.css'
import Cropper from 'luna-cropper.js'
import readme from './README.md'
import story from '../share/story'
import h from 'licia/h'

const def = story(
  'cropper',
  (wrapper) => {
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

    const cropper = new Cropper(container, {
      url: '/wallpaper.jpg',
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
