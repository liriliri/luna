import 'luna-command-palette.css'
import CommandPalette from 'luna-command-palette'
import story from '../share/story'
import readme from './README.md'
import { text, button } from '@storybook/addon-knobs'

const def = story(
  'command-palette',
  (container) => {
    const placeholder = text('Placeholder', 'Type a command')

    const commandPalette = new CommandPalette(container, {
      placeholder,
      commands: [
        {
          title: 'Reload Page',
          shortcut: 'ctrl+r',
          handler() {
            location.reload()
          },
        },
      ],
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
  }
)

export default def

export const { commandPalette } = def
