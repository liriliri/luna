import 'luna-otp-input.css'
import h from 'licia/h'
import OtpInput from 'luna-otp-input.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'otp-input',
  (container) => {
    const otpInput = new OtpInput(container)

    return otpInput
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { otpInput } = def
