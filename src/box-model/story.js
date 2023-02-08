import 'luna-box-model.css'
import story from '../share/story'
import readme from './README.md'
import BoxModel from 'luna-box-model.js'

const def = story(
  'box-model',
  (container) => {
    const boxModel = new BoxModel(container)

    return boxModel
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { boxModel } = def
