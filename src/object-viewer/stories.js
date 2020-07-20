import stringifyAll from 'licia/stringifyAll'
import h from 'licia/h'
import 'object-viewer.css'
import ObjectViewer from 'object-viewer.js'
import readme from './README.md'
import { addReadme } from 'storybook-readme/html'
import { withKnobs, text, boolean } from '@storybook/addon-knobs'

export default {
  title: 'Object Viewer',
  decorators: [withKnobs, addReadme],
  parameters: {
    readme: {
      sidebar: readme
    }
  }
}

export const Basic = () => {
  const container = h('div')

  const target = text('Target', 'navigator')
  const unenumerable = boolean('Show Unenumerable', true)
  const accessGetter = boolean('Access Getter', true)

  if (window[target]) {
    const objectViewer = new ObjectViewer(container, {
      unenumerable,
      accessGetter
    })

    objectViewer.set(window[target])
    objectViewer.on('change', () => console.log('change'))
  }

  return container
}

export const Static = () => {
  const container = h('div')

  const target = text('Target', 'navigator')
  const unenumerable = boolean('Show Unenumerable', false)
  const accessGetter = boolean('Access Getter', false)

  if (window[target]) {
    const objectViewer = new ObjectViewer.Static(container)
    objectViewer.set(
      stringifyAll(window[target], {
        unenumerable,
        accessGetter
      })
    )
    objectViewer.on('change', () => console.log('change'))
  }

  return container
}
