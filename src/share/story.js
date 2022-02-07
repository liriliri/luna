import { withKnobs } from '@storybook/addon-knobs'
import camelCase from 'licia/camelCase'
import spaceCase from 'licia/spaceCase'
import map from 'licia/map'
import h from 'licia/h'
import waitUntil from 'licia/waitUntil'
import toArr from 'licia/toArr'
import upperFirst from 'licia/upperFirst'
import { addReadme } from 'storybook-readme/html'
import each from 'licia/each'
import addons from '@storybook/addons'
import now from 'licia/now'
import * as registerKnobs from '@storybook/addon-knobs/dist/registerKnobs'

export default function story(
  name,
  storyFn,
  { readme, source, layout = 'padded' } = {}
) {
  const container = h('div')

  return {
    title: map(spaceCase(name).split(' '), upperFirst).join(' '),
    decorators: [withKnobs, addReadme],
    parameters: {
      knobs: {
        escapeHTML: false,
      },
      readme: {
        sidebar: readme,
      },
      storySource: {
        source,
      },
      layout,
    },
    [camelCase(name)]: () => {
      if (window.components) {
        const lastComponentName = window.componentName
        if (upperFirst(camelCase(name)) !== lastComponentName) {
          // Fix knobs not reset when story changed.
          const knobStore = registerKnobs.manager.knobStore
          knobStore.reset()
          addons.getChannel().emit('storybookjs/knobs/set', {
            knobs: knobStore.getAll(),
            timestamp: now(),
          })
        }
        each(window.components, (component) => component.destroy())
      }

      waitUntil(() => container.parentElement).then(() => {
        window.components = toArr(storyFn(container))
        window.component = window.components[0]
        window.componentName = upperFirst(camelCase(name))
      })

      return container
    },
  }
}
