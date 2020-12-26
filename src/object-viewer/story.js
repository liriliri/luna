import 'luna-object-viewer.css'
import ObjectViewer from 'luna-object-viewer.js'
import readme from './README.md'
import { text, boolean } from '@storybook/addon-knobs'
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

      return objectViewer
    }
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { objectViewer } = def
