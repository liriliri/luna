const $ = require('licia/$')
const trim = require('licia/trim')
const CommandPalette = require('./index')
require('./style.scss')

const container = document.createElement('div')
document.body.appendChild(container)

const commandPalette = new CommandPalette(container, {
  commands: [
    {
      title: 'Do Nothing',
      handler() {},
    },
  ],
})
commandPalette.show()

describe('command-palette', function () {
  it('basic', function () {
    const $command = $(container).find(commandPalette.c('.list') + ' li')
    expect(trim($command.text())).to.equal('Do Nothing')
  })
})
