import 'luna-toolbar.css'
import Toolbar from 'luna-toolbar.js'
import readme from './README.md'
import story from '../share/story'
import LunaToolbar, {
  LunaToolbarText,
  LunaToolbarSelect,
  LunaToolbarSeparator,
  LunaToolbarSpace,
  LunaToolbarInput,
  LunaToolbarButton,
  LunaToolbarHtml,
} from './react'

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

    const filter = toolbar.appendInput('filter', '', 'Filter')
    filter.disable()

    toolbar.appendButton('Trigger', () => {
      console.log('trigger')
    })

    toolbar.appendText('Size:')
    toolbar.appendNumber('size', 50, {
      min: 1,
      max: 1000,
      step: 1,
    })

    toolbar.appendSpace()
    toolbar.appendHtml(
      '<span style="color:green;line-height:30px;">Loading</span>'
    )
    toolbar.appendText('Status: OK')

    return toolbar
  },
  {
    readme,
    source: __STORY__,
    ReactComponent() {
      return (
        <LunaToolbar
          onChange={(key, val, oldVal) => {
            console.log(key, val, oldVal)
          }}
        >
          <LunaToolbarSelect
            keyName="throttling"
            value="online"
            title="Throttling"
            options={{
              Online: 'online',
              '3G': '3g',
              Offline: 'offline',
            }}
          />
          <LunaToolbarSeparator />
          <LunaToolbarInput
            keyName="filter"
            value=""
            placeholder="Filter"
            disabled={true}
          />
          <LunaToolbarButton
            title="Trigger"
            onClick={() => console.log('trigger')}
          />
          <LunaToolbarSpace />
          <LunaToolbarHtml>
            <span
              style={{
                color: 'green',
                lineHeight: '30px',
              }}
            >
              Loading
            </span>
          </LunaToolbarHtml>
          {null}
          <LunaToolbarText text="Status: OK" />
        </LunaToolbar>
      )
    },
  }
)

export default def

export const { toolbar: html, react } = def
