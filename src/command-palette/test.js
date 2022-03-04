import trim from 'licia/trim'
import CommandPalette from './index'
import test from '../share/test'

test('command-palette', (container) => {
  const commandPalette = new CommandPalette(container, {
    commands: [
      {
        title: 'Do Nothing',
        handler() {},
      },
    ],
  })
  commandPalette.show()

  it('basic', function () {
    const $command = $(container).find(commandPalette.c('.list') + ' li')
    expect(trim($command.text())).to.equal('Do Nothing')
  })

  return commandPalette
})
