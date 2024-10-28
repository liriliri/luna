import 'luna-logcat.css'
import Logcat from 'luna-logcat.js'
import readme from './README.md'
import story from '../share/story'
import each from 'licia/each'
import $ from 'licia/$'
import { boolean, number } from '@storybook/addon-knobs'
import logs from './logcat.json'

const def = story(
  'logcat',
  (container) => {
    $(container).css('height', '500px')

    const { wrapLongLines } = createKnobs()

    const logcat = new Logcat(container, {
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
  const wrapLongLines = boolean('Wrap Long Lines', true)

  return {
    wrapLongLines,
  }
}

export default def
export const { logcat } = def
