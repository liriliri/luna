import 'luna-object-viewer.css'
import ObjectViewer, { Static } from 'luna-object-viewer.js'
import stringifyAll from 'licia/stringifyAll'
import readme from './README.md'
import { text, boolean } from '@storybook/addon-knobs'
import story from '../share/story'
import LunaObjectViewer from './react'

const def = story(
  'object-viewer',
  (container) => {
    const useStatic = boolean('Use Static Object Viewer', false)
    const { target, prototype, unenumerable, accessGetter } = createKnobs()

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
          prototype,
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
    ReactComponent({ theme }) {
      const { target, prototype, unenumerable, accessGetter } = createKnobs()

      return (
        <LunaObjectViewer
          theme={theme}
          object={window[target]}
          prototype={prototype}
          unenumerable={unenumerable}
          accessGetter={accessGetter}
        />
      )
    },
  }
)

function createKnobs() {
  const target = text('Target', 'navigator')
  const prototype = boolean('Show Prototype', true)
  const unenumerable = boolean('Show Unenumerable', true)
  const accessGetter = boolean('Access Getter', true)

  return {
    target,
    prototype,
    unenumerable,
    accessGetter,
  }
}

export default def

export const { objectViewer: html, react } = def
