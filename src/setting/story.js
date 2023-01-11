import 'luna-setting.css'
import Setting from 'luna-setting.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'setting',
  (container) => {
    const setting = new Setting(container)

    setting.appendTitle('Console')
    setting.appendCheckbox(
      'consoleTimestampsEnabled',
      'Timestamp',
      'Show timestamps'
    )

    setting.appendSeparator()

    setting.appendTitle('Element')

    return setting
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { setting } = def
