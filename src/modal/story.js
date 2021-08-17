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
      width: 600,
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

    const confirmContent = text(
      'Confirm Content',
      'This is the confirm content.'
    )
    button('confirm', () => {
      modal.hide()
      Modal.confirm(confirmContent).then((result) => {
        console.log('Confirm result:', result)
      })
      return false
    })

    const promptTitle = text('Prompt Title', 'This is the prompt title.')
    const promptDefault = text('Prompt Default', 'This is the default text.')
    button('prompt', () => {
      modal.hide()
      Modal.prompt(promptTitle, promptDefault).then((result) => {
        console.log('Prompt result:', result)
      })
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
