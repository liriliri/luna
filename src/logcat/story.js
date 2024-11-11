import 'luna-logcat.css'
import Logcat from 'luna-logcat.js'
import readme from './README.md'
import story from '../share/story'
import each from 'licia/each'
import $ from 'licia/$'
import random from 'licia/random'
import randomItem from 'licia/randomItem'
import { boolean, number, select, text, button } from '@storybook/addon-knobs'
import LunaLogcat from './react'
import logs from './logcat.json'
import { useEffect, useRef } from 'react'

const def = story(
  'logcat',
  (container) => {
    $(container).css('height', '500px')

    const { wrapLongLines, maxNum, filter, view } = createKnobs()

    const logcat = new Logcat(container, {
      filter,
      maxNum,
      view,
      wrapLongLines,
    })

    let destroyed = false

    function append() {
      const log = randomItem(logs)
      log.date = new Date()
      logcat.append(log)
      if (destroyed) {
        return
      }
      setTimeout(append, random(10, 100))
    }
    append()

    logcat.on('destroy', () => (destroyed = true))

    button('Clear', () => {
      logcat.clear()
      return false
    })

    return logcat
  },
  {
    readme,
    story: __STORY__,
    ReactComponent() {
      const { wrapLongLines, maxNum, filter, view } = createKnobs()
      const logcatRef = useRef(null)

      useEffect(() => {
        let destroyed = false

        if (logcatRef.current) {
          function append() {
            const log = randomItem(logs)
            log.date = new Date()
            logcatRef.current.append(log)
            if (destroyed) {
              return
            }
            setTimeout(append, random(10, 100))
          }
          append()
        }

        return () => (destroyed = true)
      }, [])

      return (
        <LunaLogcat
          style={{ height: '500px' }}
          wrapLongLines={wrapLongLines}
          maxNum={maxNum}
          filter={filter}
          view={view}
          onContextMenu={() => console.log('context menu')}
          onCreate={(logcat) => (logcatRef.current = logcat)}
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
  const view = select('View', {
    'Standard View': 'standard',
    'Compact View': 'compact',
  })
  const wrapLongLines = boolean('Wrap Long Lines', false)

  return {
    filter: {
      priority: filterPriority,
      package: filterPackage,
      tag: filterTag,
    },
    view,
    maxNum,
    wrapLongLines,
  }
}

export default def
export const { logcat: html, react } = def
