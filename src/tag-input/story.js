import 'luna-tag-input.css'
import h from 'licia/h'
import TagInput from 'luna-tag-input.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'tag-input',
  (wrapper) => {
    const container = h('input')
    wrapper.appendChild(container)
    const tagInput = new TagInput(container)

    return tagInput
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { tagInput } = def
