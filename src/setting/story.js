import 'luna-setting.css'
import Setting from 'luna-setting.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'setting',
  (container) => {
    const setting = new Setting(container)
    setting.on('change', (key, val, oldVal) => {
      console.log(key, val, oldVal)
    })

    setting.appendTitle('Appearance')
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
      'Find by string, selector, or XPath'
    )

    setting.appendButton(function () {
      console.log('Restore defaults and reload')
    }, 'Restore defaults and reload')

    return setting
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { setting } = def
