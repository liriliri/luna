import 'luna-keyboard.css'
import Keyboard from 'luna-keyboard.js'
import readme from './README.md'
import story from '../share/story'
import h from 'licia/h'
import $ from 'licia/$'

const def = story(
  'keyboard',
  (wrapper) => {
    $(wrapper).html('').css({
      maxWidth: 800,
      margin: '0 auto',
      fontSize: 0,
    })

    const textarea = h('textarea', {
      placeholder: 'Tap to start',
    })
    $(textarea).css({
      width: '100%',
      background: '#2e2e2e',
      border: 'none',
      boxSizing: 'border-box',
      outline: 'none',
      borderRadius: '4px 4px 0 0',
      height: 134,
      fontSize: '18px',
      padding: 20,
      resize: 'vertical',
      color: '#fff',
    })
    wrapper.appendChild(textarea)

    const keyboardContainer = h('div')
    wrapper.appendChild(keyboardContainer)

    const keyboard = new Keyboard(keyboardContainer)
    keyboard.on('change', (input) => {
      textarea.value = input
    })
    textarea.addEventListener('input', (event) => {
      keyboard.setInput(event.target.value)
    })

    return keyboard
  },
  {
    readme,
    story: __STORY__,
  }
)

export default def
export const { keyboard } = def
