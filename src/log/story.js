import 'luna-log.css'
import Log from 'luna-log.js'
import readme from './README.md'
import story from '../share/story'
import ansiColor from 'licia/ansiColor'
import { text, boolean, number, button } from '@storybook/addon-knobs'
import buildLog from '!!raw-loader!./build.log'

const def = story(
  'log',
  (container) => {
    const logTxt = text('Log', buildLog)
    const wrapLongLines = boolean('Wrap Long Lines', true)
    const maxHeight = number('Max Height', 500, {
      range: true,
      min: 50,
      max: 1000,
    })

    const logToAppend = text(
      'Log to Append',
      `\n${ansiColor.yellow('Hello')} ${ansiColor.green(
        'Luna'
      )} ${ansiColor.blue('Log')}!\n`
    )
    button('Append', () => {
      log.append(logToAppend)
      return false
    })

    const log = new Log(container, {
      log: logTxt,
      wrapLongLines,
      maxHeight,
    })

    return log
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { log } = def
