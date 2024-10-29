import 'luna-logcat.css'
import Logcat from 'luna-logcat.js'
import readme from './README.md'
import story from '../share/story'
import each from 'licia/each'
import $ from 'licia/$'
import { boolean, number, select } from '@storybook/addon-knobs'
import logs from './logcat.json'

const def = story(
  'logcat',
  (container) => {
    $(container).css('height', '500px')

    const { wrapLongLines, filter } = createKnobs()

    const logcat = new Logcat(container, {
      filter,
      wrapLongLines,
    })
    each(logs, (log) => logcat.append(log))

    return logcat
  },
  {
    readme,
    story: __STORY__,
  }
)

function createKnobs() {
  const priority = select(
    'Filter Level',
    {
      DEFAULT: 1,
      VERBOSE: 2,
      DEBUG: 3,
      INFO: 4,
      WARN: 5,
      ERROR: 6,
      FATAL: 7,
      SILENT: 8,
    },
    1
  )
  const wrapLongLines = boolean('Wrap Long Lines', false)

  return {
    filter: {
      priority,
    },
    wrapLongLines,
  }
}

export default def
export const { logcat } = def
