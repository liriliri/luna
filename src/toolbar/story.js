import 'luna-toolbar.css'
import Toolbar from 'luna-toolbar.js'
import readme from './README.md'
import story from '../share/story'

const def = story(
  'toolbar',
  (container) => {
    const toolbar = new Toolbar(container)
    toolbar.on('change', (key, val, oldVal) => {
      console.log(key, val, oldVal)
    })

    const toolbarSelect = toolbar.appendSelect(
      'throttling',
      'online',
      'Throttling',
      {
        Online: 'online',
      }
    )
    toolbarSelect.setOptions({
      Online: 'online',
      '3G': '3g',
      Offline: 'offline',
    })

    toolbar.appendSeparator()

    toolbar.appendInput('filter', '', 'Filter')
    toolbar.appendText('Status: OK')

    return toolbar
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { toolbar } = def
