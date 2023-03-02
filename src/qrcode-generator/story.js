import 'luna-qrcode-generator.css'
import h from 'licia/h'
import QrcodeGenerator from 'luna-qrcode-generator.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'qrcode-generator',
  (container) => {
    const qrcodeGenerator = new QrcodeGenerator(container)

    return qrcodeGenerator
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { qrcodeGenerator } = def
