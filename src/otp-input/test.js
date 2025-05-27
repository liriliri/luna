import OtpInput from './index'
import test from '../share/test'

test('otp-input', (container) => {
  const otpInput = new OtpInput(container, {
    inputNum: 6,
  })

  it('basic', function () {
    expect($(container).find('input').length).to.equal(6)
  })

  return otpInput
})
