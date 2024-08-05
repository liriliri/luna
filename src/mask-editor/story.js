import MaskEditor from 'luna-mask-editor.js'
import Painter from 'luna-painter.js'
import story from '../share/story'
import $ from 'licia/$'
import h from 'licia/h'
import readme from './README.md'
import LunaMaskEditor from './react'
import { text, files } from '@storybook/addon-knobs'
import { useRef } from 'react'
import isEmpty from 'licia/isEmpty'

const def = story(
  'mask-editor',
  (wrapper) => {
    $(wrapper).html('')

    const container = h('div')

    $(container).css({
      width: '100%',
      maxWidth: 1200,
      height: 600,
      margin: '0 auto',
    })
    wrapper.appendChild(container)

    const maskContainer = h('div')
    $(maskContainer).css({
      border: '1px solid #eee',
      width: '100%',
      maxWidth: 1200,
      margin: '0 auto',
      fontSize: 0,
      marginTop: '10px',
    })
    wrapper.appendChild(maskContainer)

    const { image, mask } = createKnobs()
    const maskEditor = new MaskEditor(container, {
      image,
      mask,
    })

    onCreate(maskEditor, maskContainer)

    maskEditor.on('change', () => {
      console.log('mask change')
    })

    return maskEditor
  },
  {
    i18n: Painter.i18n,
    readme,
    source: __STORY__,
    ReactComponent({ theme }) {
      const maskContainer = useRef(null)
      const { image, mask } = createKnobs()

      return (
        <>
          <LunaMaskEditor
            theme={theme}
            image={image}
            mask={mask}
            onCreate={(maskEditor) => {
              if (maskContainer.current) {
                onCreate(maskEditor, maskContainer.current)
              }
            }}
            onChange={() => {
              console.log('mask change')
            }}
          />
          <div
            style={{
              border: '1px solid #eee',
              width: '100%',
              maxWidth: 1200,
              margin: '0 auto',
              fontSize: 0,
              marginTop: '10px',
            }}
            ref={maskContainer}
          ></div>
        </>
      )
    },
  }
)

function createKnobs() {
  const image = text('Image', '/wallpaper.png')
  const masks = files('Mask')

  return {
    image,
    mask: !isEmpty(masks) ? masks[0] : '',
  }
}

function onCreate(maskEditor, maskContainer) {
  const canvas = maskEditor.getCanvas()
  maskContainer.appendChild(canvas)
  $(canvas).css({
    maxWidth: '100%',
  })
}

export default def

export const { maskEditor: html, react } = def
