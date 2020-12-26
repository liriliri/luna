import 'luna-json-editor.css'
import JsonEditor from 'luna-json-editor.js'
import { text, boolean } from '@storybook/addon-knobs'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'json-editor',
  (container) => {
    const name = text('Name', 'example')
    let value = text(
      'Value',
      JSON.stringify({
        hello: 'world',
        doubleClick: 'me to edit',
        a: null,
        b: true,
        c: false,
        d: 1,
        e: { nested: 'object' },
        f: [1, 2, 3],
      })
    )

    try {
      value = JSON.parse(value)
    } catch (e) {
      value = 'Invalid JSON'
    }

    const showName = boolean('Show Name', true)
    const nameEditable = boolean('Name Editable', true)
    const valueEditable = boolean('Value Editable', true)
    const enableInsert = boolean('Enable Insert', true)
    const enableDelete = boolean('Enable Delete', true)

    const jsonEditor = new JsonEditor(container, {
      showName,
      name,
      value,
      nameEditable,
      valueEditable,
      enableDelete,
      enableInsert,
    })

    jsonEditor.on('change', function (key, oldValue, newValue) {
      console.log('change', key, oldValue, '=>', newValue)
    })

    jsonEditor.expand(true)

    return jsonEditor
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { jsonEditor } = def
