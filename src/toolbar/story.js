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
  LunaToolbarNumber,
  LunaToolbarCheckbox,
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

    toolbar.appendButton(
      'Trigger',
      () => {
        console.log('trigger')
      },
      'hover'
    )

    toolbar.appendText('Size:')
    toolbar.appendNumber('size', 50, {
      min: 1,
      max: 1000,
      step: 1,
    })

    toolbar.appendCheckbox('checkbox', true, 'Show all')

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
    ReactComponent({ theme }) {
      return (
        <LunaToolbar
          onChange={(key, val, oldVal) => {
            console.log(key, val, oldVal)
          }}
          theme={theme}
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
            onChange={(val) => console.log(val)}
            placeholder="Filter"
            disabled={true}
          />
          <LunaToolbarButton
            onClick={() => console.log('trigger')}
            state="hover"
          >
            Trigger
          </LunaToolbarButton>
          <LunaToolbarText text="Size:" />
          <LunaToolbarNumber
            keyName="size"
            value={50}
            min={1}
            max={1000}
            step={1}
          />
          <LunaToolbarCheckbox
            keyName="checkbox"
            value={true}
            label="Show all"
          />
          <LunaToolbarSpace />
          <LunaToolbarHtml className="custom-class">
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
