import 'luna-object-viewer.css'
import ObjectViewer, { Static } from 'luna-object-viewer.js'
import stringifyAll from 'licia/stringifyAll'
import readme from './README.md'
import { text, boolean } from '@storybook/addon-knobs'
import story from '../share/story'

const def = story(
  'object-viewer',
  (container) => {
    const target = text('Target', 'navigator')
    const useStatic = boolean('Use Static Object Viewer', false)
    const unenumerable = boolean('Show Unenumerable', true)
    const accessGetter = boolean('Access Getter', true)

    if (window[target]) {
      if (useStatic) {
        const data = stringifyAll(window[target], {
          unenumerable,
          accessGetter,
        })
        const staticObjectViewer = new Static(container)
        staticObjectViewer.set(data)

        return staticObjectViewer
      } else {
        const objectViewer = new ObjectViewer(container, {
          unenumerable,
          accessGetter,
        })

        objectViewer.set(window[target])

        return objectViewer
      }
    }
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { objectViewer } = def
