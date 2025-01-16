import 'luna-command-palette.css'
import CommandPalette from 'luna-command-palette'
import LunaCommandPalette from './react'
import story from '../share/story'
import readme from './README.md'
import { text, button } from '@storybook/addon-knobs'
import { useState } from 'react'

const def = story(
  'command-palette',
  (container) => {
    const { placeholder, shortcut } = createKnobs()

    const commandPalette = new CommandPalette(container, {
      placeholder,
      shortcut,
      commands: getCommands(),
    })
    commandPalette.show()

    button('Show', () => {
      commandPalette.show()
      return false
    })

    return commandPalette
  },
  {
    readme,
    source: __STORY__,
    ReactComponent({ theme }) {
      const { placeholder, shortcut } = createKnobs()
      const [visible, setVisible] = useState(true)

      return (
        <LunaCommandPalette
          theme={theme}
          placeholder={placeholder}
          shortcut={shortcut}
          visible={visible}
          onClose={() => setVisible(false)}
          commands={getCommands()}
        />
      )
    },
  }
)

function getCommands() {
  return [
    {
      title: 'Reload Page',
      shortcut: 'Ctrl+R',
      handler(e) {
        if (e && e.preventDefault) {
          e.preventDefault()
        }
        location.reload()
      },
    },
    {
      title: 'Alert Something',
      handler() {
        alert('Luna Command Palette')
      },
    },
    {
      title: 'Do Nothing',
      handler() {},
    },
    {
      title: 'Log Timestamp',
      handler() {
        console.log(Date.now())
      },
    },
    {
      title: 'Open luna.liriliri.io',
      shortcut: 'Ctrl+O',
      handler() {
        window.open('https://luna.liriliri.io')
      },
    },
    {
      title: 'Goto luna.liriliri.io',
      handler() {
        location = 'https://luna.liriliri.io'
      },
    },
  ]
}

function createKnobs() {
  const placeholder = text('Placeholder', 'Type a command')
  const shortcut = text('Shortcut', 'Ctrl+P')

  return {
    placeholder,
    shortcut,
  }
}

export default def
export const { commandPalette: html, react } = def
