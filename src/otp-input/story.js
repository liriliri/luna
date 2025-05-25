import 'luna-otp-input.css'
import $ from 'licia/$'
import OtpInput from 'luna-otp-input.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'otp-input',
  (container) => {
    $(container).css({
      maxWidth: 480,
      margin: '0 auto',
    })

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
