import { withKnobs } from '@storybook/addon-knobs'
import camelCase from 'licia/camelCase'
import spaceCase from 'licia/spaceCase'
import map from 'licia/map'
import h from 'licia/h'
import isHidden from 'licia/isHidden'
import waitUntil from 'licia/waitUntil'
import toArr from 'licia/toArr'
import upperFirst from 'licia/upperFirst'
import { addReadme } from 'storybook-readme/html'
import each from 'licia/each'

export default function story(name, storyFn, { readme, source } = {}) {
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
    },
    [camelCase(name)]: () => {
      if (window.components) {
        each(window.components, (component) => component.destroy())
      }

      waitUntil(() => !isHidden(container)).then(() => {
        window.components = toArr(storyFn(container))
        window.component = window.components[0]
      })
      
      return container
    },
  }
}
