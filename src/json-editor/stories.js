import 'json-editor.css'
import h from 'licia/h'
import JsonEditor from 'json-editor.js'

export default {
  title: 'Json Editor',
}

export const Basic = () => {
  const container = h('div')

  const jsonEditor = new JsonEditor(container, {
    name: 'example',
    value: {
      hello: 'world',
      doubleClick: 'me to edit',
      a: null,
      b: true,
      c: false,
      d: 1,
      e: { nested: 'object' },
      f: [1, 2, 3],
    },
  })

  jsonEditor.on('change', function (key, oldValue, newValue) {
    console.log('change', key, oldValue, '=>', newValue)
  })

  jsonEditor.expand(true)

  return container
}
