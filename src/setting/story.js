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
  LunaSettingText,
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

    setting.appendText(
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
    ReactComponent() {
      const { separatorCollapse, filter } = createKnobs()
      const [mouseOver, setMouseOver] = useState(false)

      return (
        <LunaSetting
          separatorCollapse={separatorCollapse}
          filter={filter}
          onChange={(key, val, oldVal) => {
            console.log(key, val, oldVal)
          }}
        >
          <LunaSettingTitle title="Configuration" />
          <LunaSettingMarkdown markdown="Click [here](https://github.com/liriliri/luna/blob/master/src/setting/README.md) to see the documentation." />
          <LunaSettingTitle title="Appearance" level={2} />
          <LunaSettingSelect
            keyName="theme"
            value="light"
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
            value={0.5}
            title="Transparency"
            options={{
              min: 0.1,
              max: 1,
              step: 0.1,
            }}
          />
          <LunaSettingNumber
            keyName="height"
            value={50}
            title="Height"
            description="Set devtools height."
            options={{
              range: true,
              min: 40,
              max: 100,
              step: 1,
            }}
          />
          <LunaSettingSeparator />
          <LunaSettingSeparator />
          <LunaSettingTitle title="Console" />
          <LunaSettingCheckbox
            keyName="selectedContextFilterEnabled"
            value={false}
            description="Selected context only"
          />
          <LunaSettingCheckbox
            keyName="consoleTimestampsEnabled"
            value={false}
            title="Timestamp"
            description="Show timestamps"
          />
          <LunaSettingCheckbox
            keyName="consoleHistoryAutocomplete"
            value={true}
            title="Autocomplete from history"
          />
          <LunaSettingCheckbox
            keyName="consoleGroupSimilar"
            value={true}
            description="Group similar"
          />
          <LunaSettingSeparator />
          <LunaSettingTitle title="Element" />
          <LunaSettingText
            keyName="searchKeyword"
            value="div"
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
