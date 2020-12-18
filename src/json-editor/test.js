const JsonEditor = require('./index')
require('./style.scss')
require('./icon.css')

describe('json-editor', function () {
  it('basic', function () {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const jsonEditor = new JsonEditor(container, {
      name: 'luna',
      value: {
        a: true,
      },
      nameEditable: false,
    })
    jsonEditor.expand(true)

    const $container = $(container)
    expect($container.find('.luna-json-editor-name').text()).to.equal('luna')
  })
})
