import 'luna-object-viewer.css'
import ObjectViewer from 'luna-object-viewer.js'
import readme from './README.md'
import { text, boolean, button } from '@storybook/addon-knobs'
import story from '../share/story'

const def = story(
  'object-viewer',
  (container) => {
    const target = text('Target', 'navigator')
    const unenumerable = boolean('Show Unenumerable', true)
    const accessGetter = boolean('Access Getter', true)

    if (window[target]) {
      const objectViewer = new ObjectViewer(container, {
        unenumerable,
        accessGetter,
      })

      objectViewer.set(window[target])

      button('Destroy', () => {
        objectViewer.destroy()
        return false
      })

      return objectViewer
    }
  },
  {
    readme,
  }
)

export default def

export const { objectViewer } = def
