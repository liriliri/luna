import 'luna-modal.css'
import Modal from 'luna-modal.js'
import LunaModal from './react'
import readme from './README.md'
import changelog from './CHANGELOG.md'
import story from '../share/story'
import { text, button, number } from '@storybook/addon-knobs'
import { useState } from 'react'

const def = story(
  'modal',
  (container) => {
    const { title, content, width } = createKnobs()

    const modal = new Modal(container, {
      title,
      content,
      width,
    })
    modal.show()

    button('Show', () => {
      modal.show()
      return false
    })

    button('Hide', () => {
      modal.hide()
      return false
    })

    const alertContent = text('Alert Content', 'This is the alert content.')
    button('Alert', () => {
      modal.hide()
      Modal.alert(alertContent)

      return false
    })

    const confirmContent = text(
      'Confirm Content',
      'This is the confirm content.'
    )
    button('Confirm', () => {
      modal.hide()
      Modal.confirm(confirmContent).then((result) => {
        console.log('Confirm result:', result)
      })
      return false
    })

    const promptTitle = text('Prompt Title', 'This is the prompt title.')
    const promptDefault = text('Prompt Default', 'This is the default text.')
    button('Prompt', () => {
      modal.hide()
      Modal.prompt(promptTitle, promptDefault).then((result) => {
        console.log('Prompt result:', result)
      })
      return false
    })

    return modal
  },
  {
    i18n: Modal.i18n,
    readme,
    changelog,
    source: __STORY__,
    ReactComponent() {
      const { title, content, width } = createKnobs()
      const [visible, setVisible] = useState(true)

      button('Show', () => {
        setVisible(true)
        return false
      })

      button('Hide', () => {
        setVisible(false)
        return false
      })

      return (
        <LunaModal
          title={title}
          visible={visible}
          width={width}
          onClose={() => setVisible(false)}
        >
          {content}
        </LunaModal>
      )
    },
  }
)

function createKnobs() {
  const title = text('Modal Title', 'This is the Title')
  const content = text('Modal Content', 'This is the modal content.')
  const width = number('Modal Width', 500, {
    range: true,
    min: 250,
    max: 1000,
    stp: 1,
  })

  return {
    title,
    content,
    width,
  }
}

export default def

export const { modal: html, react } = def
