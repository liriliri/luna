import 'luna-modal.css'
import Modal from 'luna-modal.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'modal',
  (container) => {
    const modal = new Modal(container, {
      title: 'Modal Title',
      content: 'This is the modal content.',
    })
    modal.show()

    return modal
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { modal } = def