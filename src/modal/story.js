import 'luna-modal.css'
import Modal from 'luna-modal.js'
import readme from './README.md'
import story from '../share/story'
import { text, button } from '@storybook/addon-knobs'

const def = story(
  'modal',
  (container) => {
    const title = text('Modal Title', 'This is the Title')
    const content = text('Modal Content', 'This is the modal content.')

    const modal = new Modal(container, {
      title,
      content,
    })
    modal.show()

    button('Show', () => {
      modal.show()
      return false
    })

    button('hide', () => {
      modal.hide()
      return false
    })

    const alertContent = text('Alert Content', 'This is the alert content.')
    button('alert', () => {
      modal.hide()
      Modal.alert(alertContent)

      return false
    })

    return modal
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { modal } = def
