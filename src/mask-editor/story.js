import MaskEditor from 'luna-mask-editor.js'
import story from '../share/story'
import $ from 'licia/$'

const def = story('mask-editor', (container) => {
  $(container).css({
    width: '100%',
    maxWidth: 1200,
    height: 600,
    margin: '0 auto',
  })

  const maskEditor = new MaskEditor(container, {
    image: 'https://res.liriliri.io/luna/pic1.jpg',
  })

  return maskEditor
})

export default def

export const { maskEditor } = def
