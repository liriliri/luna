import 'luna-setting.css'
import Setting from 'luna-setting.js'
import story from '../share/story'
import readme from './README.md'
import { boolean, text } from '@storybook/addon-knobs'
import LunaSetting, {
  LunaSettingTitle,
  LunaSettingMarkdown,
  LunaSettingSelect,
  LunaSettingNumber,
  LunaSettingSeparator,
  LunaSettingCheckbox,
  LunaSettingInput,
  LunaSettingHtml,
  LunaSettingButton,
} from './react'
import { useState } from 'react'

const def = story(
  'setting',
  (container) => {
    const { separatorCollapse, filter } = createKnobs()

    const setting = new Setting(container, {
      separatorCollapse,
      filter,
    })
    setting.on('change', (key, val, oldVal) => {
      console.log(key, val, oldVal)
    })

    setting.appendTitle('Configuration')
    setting.appendMarkdown(
      'Click [here](https://github.com/liriliri/luna/blob/master/src/setting/README.md) to see the documentation.'
    )
    setting.appendTitle('Appearance', 2)
    setting.appendSelect(
      'theme',
      'light',
      'Theme',
      'Specifies the color theme.',
      { 'System preference': 'system', Light: 'light', Dark: 'dark' }
    )
    setting.appendNumber('transparency', 0.5, 'Transparency', {
      min: 0.1,
      max: 1,
      step: 0.1,
    })
    setting.appendNumber('height', 50, 'Height', 'Set devtools height.', {
      range: true,
      min: 40,
      max: 100,
      step: 1,
    })

    setting.appendSeparator()
    setting.appendSeparator()

    setting.appendTitle('Console')
    setting.appendCheckbox(
      'selectedContextFilterEnabled',
      false,
      'Selected context only'
    )
    setting.appendCheckbox(
      'consoleTimestampsEnabled',
      false,
      'Timestamp',
      'Show timestamps'
    )
    setting.appendCheckbox(
      'consoleHistoryAutocomplete',
      true,
      'Autocomplete from history'
    )
    setting.appendCheckbox('consoleGroupSimilar', true, 'Group similar')

    setting.appendSeparator()

    setting.appendTitle('Element')

    setting.appendInput(
      'searchKeyword',
      'div',
      'Search Keyword',
      'Find by **string**, **selector**, or **XPath**'
    )

    setting.appendSeparator()

    setting.appendTitle('Sources')

    setting.appendHtml(`<div style="padding:10px;">
      <div class="luna-setting-title">Default indentation</div>
      <div class="luna-setting-description">The number of spaces used for indentation</div>
      <a style="font-size:12px;color:#0969da;cursor:pointer;" 
        onmouseover="this.style.textDecoration='underline';"
        onmouseout="this.style.textDecoration='none';">
        Edit in settings.json
      </a>
    </div>`)

    setting.appendButton('Restore defaults and reload', function () {
      console.log('Restore defaults and reload')
    })

    return setting
  },
  {
    readme,
    source: __STORY__,
    ReactComponent({ theme }) {
      const { separatorCollapse, filter } = createKnobs()
      const [mouseOver, setMouseOver] = useState(false)

      const [themeSetting, setThemeSetting] = useState('light')
      const [selectedContextFilterEnabled, setSelectedContextFilterEnabled] =
        useState(false)
      const [consoleTimestampsEnabled, setConsoleTimestampsEnabled] =
        useState(false)
      const [consoleHistoryAutocomplete, setConsoleHistoryAutocomplete] =
        useState(true)
      const [consoleGroupSimilar, setConsoleGroupSimilar] = useState(true)
      const [searchKeyword, setSearchKeyword] = useState('div')
      const [height, setHeight] = useState(50)
      const [transparency, setTransparency] = useState(0.5)

      return (
        <LunaSetting
          theme={theme}
          separatorCollapse={separatorCollapse}
          filter={filter}
          onChange={(key, val, oldVal) => {
            console.log(key, val, oldVal)
            switch (key) {
              case 'theme':
                setTheme(val)
                break
              case 'selectedContextFilterEnabled':
                setSelectedContextFilterEnabled(val)
                break
              case 'consoleTimestampsEnabled':
                setConsoleTimestampsEnabled(val)
                break
              case 'consoleHistoryAutocomplete':
                setConsoleHistoryAutocomplete(val)
                break
              case 'consoleGroupSimilar':
                setConsoleGroupSimilar(val)
                break
              case 'searchKeyword':
                setSearchKeyword(val)
                break
              case 'height':
                setHeight(val)
                break
              case 'transparency':
                setTransparency(val)
                break
            }
          }}
        >
          <LunaSettingTitle title="Configuration" />
          <LunaSettingMarkdown markdown="Click [here](https://github.com/liriliri/luna/blob/master/src/setting/README.md) to see the documentation." />
          <LunaSettingTitle title="Appearance" level={2} />
          <LunaSettingSelect
            keyName="theme"
            value={themeSetting}
            title="Theme"
            description="Specifies the color theme."
            options={{
              'System preference': 'system',
              Light: 'light',
              Dark: 'dark',
            }}
          />
          <LunaSettingNumber
            keyName="transparency"
            value={transparency}
            title="Transparency"
            min={0.1}
            max={1}
            step={0.1}
          />
          <LunaSettingNumber
            keyName="height"
            value={height}
            title="Height"
            description="Set devtools height."
            range={true}
            min={40}
            max={100}
            step={1}
          />
          <LunaSettingSeparator />
          <LunaSettingSeparator />
          <LunaSettingTitle title="Console" />
          <LunaSettingCheckbox
            keyName="selectedContextFilterEnabled"
            value={selectedContextFilterEnabled}
            description="Selected context only"
          />
          <LunaSettingCheckbox
            keyName="consoleTimestampsEnabled"
            value={consoleTimestampsEnabled}
            title="Timestamp"
            description="Show timestamps"
          />
          <LunaSettingCheckbox
            keyName="consoleHistoryAutocomplete"
            value={consoleHistoryAutocomplete}
            title="Autocomplete from history"
          />
          <LunaSettingCheckbox
            keyName="consoleGroupSimilar"
            value={consoleGroupSimilar}
            description="Group similar"
          />
          <LunaSettingSeparator />
          <LunaSettingTitle title="Element" />
          <LunaSettingInput
            keyName="searchKeyword"
            value={searchKeyword}
            title="Search Keyword"
            description="Find by **string**, **selector**, or **XPath**"
          />
          <LunaSettingSeparator />
          <LunaSettingTitle title="Sources" />
          <LunaSettingHtml>
            <div style={{ padding: '10px' }}>
              <div className="luna-setting-title">Default indentation</div>
              <div className="luna-setting-description">
                The number of spaces used for indentation
              </div>
              <a
                style={{
                  fontSize: '12px',
                  color: '#0969da',
                  cursor: 'pointer',
                  textDecoration: mouseOver ? 'underline' : 'none',
                }}
                onMouseOver={() => setMouseOver(true)}
                onMouseOut={() => setMouseOver(false)}
              >
                Edit in settings.json
              </a>
            </div>
          </LunaSettingHtml>
          <LunaSettingButton
            description="Restore defaults and reload"
            onClick={() => {
              console.log('Restore defaults and reload')
            }}
          />
        </LunaSetting>
      )
    },
  }
)

function createKnobs() {
  const separatorCollapse = boolean('Separator Collapse', true)
  const filter = text('Filter', '')

  return {
    separatorCollapse,
    filter,
  }
}

export default def

export const { setting: html, react } = def
