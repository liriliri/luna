import { withKnobs } from '@storybook/addon-knobs'
import camelCase from 'licia/camelCase'
import spaceCase from 'licia/spaceCase'
import map from 'licia/map'
import h from 'licia/h'
import waitUntil from 'licia/waitUntil'
import isArr from 'licia/isArr'
import contain from 'licia/contain'
import upperFirst from 'licia/upperFirst'
import extend from 'licia/extend'
import { addReadme } from 'storybook-readme/html'
import each from 'licia/each'
import addons from '@storybook/addons'
import now from 'licia/now'
import ReactDOM from 'react-dom'
import * as registerKnobs from '@storybook/addon-knobs/dist/registerKnobs'
import { optionsKnob } from '@storybook/addon-knobs'
import { createApp } from 'vue'

export default function story(
  name,
  storyFn,
  {
    i18n = null,
    readme,
    changelog = '',
    source,
    layout = 'padded',
    themes = {},
    ReactComponent = false,
    VueComponent = false,
  } = {}
) {
  if (changelog) {
    readme += `\n## Changelog\n${changelog.replace(/## /g, '### ')}`
  }

  const ret = {
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
      const container = h('div')

      fixKnobs(name)

      waitUntil(() => container.parentElement).then(() => {
        const { theme, language } = createKnobs()
        if (language) {
          i18n.locale(language)
        }
        const story = storyFn(container)
        if (isArr(story)) {
          window.components = story
        } else {
          window.components = [story]
        }
        window.component = window.components[0]
        window.componentName = upperFirst(camelCase(name))

        updateBackground(theme)

        each(window.components, (component) =>
          component.setOption('theme', theme)
        )
      })

      return container
    },
  }

  if (ReactComponent) {
    ret.react = function () {
      const container = h('div')

      fixKnobs(`react-${name}`)

      const { theme } = createKnobs()
      window.components = []
      delete window.component
      window.componentName = upperFirst(camelCase(`react-${name}`))

      ReactDOM.render(<ReactComponent theme={theme} />, container)

      updateBackground(theme)

      return container
    }
  }

  if (VueComponent) {
    ret.vue = function () {
      const container = h('div')

      fixKnobs(`vue-${name}`)

      const { theme } = createKnobs()
      window.components = []
      delete window.component
      window.componentName = upperFirst(camelCase(`vue-${name}`))

      createApp(VueComponent({ theme })).mount(container)

      updateBackground(theme)

      return container
    }
  }

  function createKnobs() {
    const theme = optionsKnob(
      'Theme',
      extend(
        {
          Light: 'light',
          Dark: 'dark',
        },
        themes
      ),
      'light',
      {
        display: 'select',
      }
    )

    if (i18n) {
      const language = optionsKnob(
        'Language',
        {
          English: 'en-US',
          中文: 'zh-CN',
        },
        navigator.language,
        {
          display: 'select',
        }
      )

      return {
        theme,
        language,
      }
    }

    return {
      theme,
    }
  }

  return ret
}

function fixKnobs(name) {
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
}

function updateBackground(theme) {
  document.documentElement.style.background = contain(theme, 'dark')
    ? '#000'
    : '#fff'
}
