import 'luna-otp-input.css'
import $ from 'licia/$'
import OtpInput from 'luna-otp-input.js'
import story from '../share/story'
import readme from './README.md'
import { number } from '@storybook/addon-knobs'
import LunaOtpInput from './react'

const def = story(
  'otp-input',
  (container) => {
    $(container).css({
      maxWidth: 480,
      margin: '0 auto',
    })

    const { inputNum } = createKnobs()

    const otpInput = new OtpInput(container, {
      inputNum,
    })
    otpInput.on('change', (value) => {
      console.log('OTP changed:', value)
    })
    otpInput.on('complete', (value) => {
      console.log('OTP complete:', value)
    })

    return otpInput
  },
  {
    readme,
    source: __STORY__,
    ReactComponent({ theme }) {
      const { inputNum } = createKnobs()

      return (
        <LunaOtpInput
          style={{ maxWidth: 480, margin: '0 auto' }}
          theme={theme}
          inputNum={inputNum}
          onChange={function (value) {
            console.log('OTP changed:', value)
          }}
          onComplete={function (value) {
            console.log('OTP complete:', value)
          }}
        />
      )
    },
  }
)

function createKnobs() {
  const inputNum = number('Input Number', 6, {
    range: true,
    min: 1,
    max: 10,
    step: 1,
  })

  return {
    inputNum,
  }
}

export default def

export const { otpInput: html, react } = def
