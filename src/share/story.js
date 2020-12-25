import { withKnobs } from '@storybook/addon-knobs'
import camelCase from 'licia/camelCase'
import spaceCase from 'licia/spaceCase'
import map from 'licia/map'
import h from 'licia/h'
import upperFirst from 'licia/upperFirst'
import { addReadme } from 'storybook-readme/html'

export default function story(name, storyFn, { readme } = {}) {
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
    },
    [camelCase(name)]: () => {
      if (window.component) {
        window.component.destroy()
      }
      window.component = storyFn(container)

      return container
    },
  }
}
