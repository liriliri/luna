import JsonEditor from './index'
import test from '../share/test'

test('json-editor', (container) => {
  const jsonEditor = new JsonEditor(container, {
    name: 'luna',
    value: {
      a: true,
    },
    nameEditable: false,
  })

  it('basic', function () {
    jsonEditor.expand(true)

    const $container = $(container)
    expect($container.children('.luna-json-editor-name').text()).to.equal(
      'luna'
    )
  })

  return jsonEditor
})
