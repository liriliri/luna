import 'luna-scrollbar.css'
import Scrollbar from 'luna-scrollbar.js'
import $ from 'licia/$'
import escape from 'licia/escape'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'scrollbar',
  (container) => {
    $(container)
      .css({
        maxWidth: 640,
        padding: '50px',
        width: '100%',
        aspectRatio: '4/3',
        margin: '0 auto',
        border: '1px solid black',
      })
      .html(
        `<div style="white-space:pre-wrap;min-width:400px;">${escape(
          readme
        )}</div>`
      )

    const scrollbar = new Scrollbar(container)

    return scrollbar
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { scrollbar } = def
