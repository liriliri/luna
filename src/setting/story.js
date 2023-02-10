import 'luna-setting.css'
import Setting from 'luna-setting.js'
import story from '../share/story'
import readme from './README.md'
import { boolean, text } from '@storybook/addon-knobs'

const def = story(
  'setting',
  (container) => {
    const separatorCollapse = boolean('Separator Collapse', true)
    const filter = text('Filter', '')

    const setting = new Setting(container, {
      separatorCollapse,
      filter,
    })
    setting.on('change', (key, val, oldVal) => {
      console.log(key, val, oldVal)
    })

    setting.appendTitle('Configuration')
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
  }
)

export default def

export const { setting } = def
