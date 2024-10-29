import 'luna-logcat.css'
import Logcat from 'luna-logcat.js'
import readme from './README.md'
import story from '../share/story'
import each from 'licia/each'
import $ from 'licia/$'
import { boolean, number, select, text } from '@storybook/addon-knobs'
import LunaLogcat from './react'
import logs from './logcat.json'

const def = story(
  'logcat',
  (container) => {
    $(container).css('height', '500px')

    const { wrapLongLines, maxNum, filter } = createKnobs()

    const logcat = new Logcat(container, {
      filter,
      maxNum,
      wrapLongLines,
    })
    each(logs, (log) => logcat.append(log))

    return logcat
  },
  {
    readme,
    story: __STORY__,
    ReactComponent() {
      const { wrapLongLines, maxNum, filter } = createKnobs()

      return (
        <LunaLogcat
          style={{ height: '500px' }}
          wrapLongLines={wrapLongLines}
          maxNum={maxNum}
          filter={filter}
          onCreate={(logcat) => each(logs, (log) => logcat.append(log))}
        />
      )
    },
  }
)

function createKnobs() {
  const filterPriority = select(
    'Filter Level',
    {
      VERBOSE: 2,
      DEBUG: 3,
      INFO: 4,
      WARNING: 5,
      ERROR: 6,
    },
    1
  )
  const filterPackage = text('Filter Package', '')
  const filterTag = text('Filter Tag', '')
  const maxNum = number('Max Number', 500, {
    range: true,
    min: 10,
    max: 1000,
    step: 10,
  })
  const wrapLongLines = boolean('Wrap Long Lines', false)

  return {
    filter: {
      priority: filterPriority,
      package: filterPackage,
      tag: filterTag,
    },
    maxNum,
    wrapLongLines,
  }
}

export default def
export const { logcat: html, react } = def
