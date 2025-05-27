import { CSSProperties, FC, useEffect, useRef } from 'react'
import OtpInput, { IOptions } from './index'
import { useEvent, useOption, usePrevious } from '../share/hooks'
import each from 'licia/each'

interface IOtpInputProps extends IOptions {
  style?: CSSProperties
  className?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
}

const LunaOtpInput: FC<IOtpInputProps> = (props) => {
  const otpInputRef = useRef<HTMLDivElement>(null)
  const otpInput = useRef<OtpInput>()
  const prevProps = usePrevious(props)

  useEffect(() => {
    otpInput.current = new OtpInput(otpInputRef.current!, {
      theme: props.theme,
      inputNum: props.inputNum,
    })

    return () => otpInput.current?.destroy()
  }, [])

  useEvent<OtpInput>(otpInput, 'change', prevProps?.onChange, props.onChange)
  useEvent<OtpInput>(
    otpInput,
    'complete',
    prevProps?.onComplete,
    props.onComplete
  )

  each(['theme'], (key: keyof IOtpInputProps) => {
    useOption<OtpInput, IOtpInputProps>(otpInput, key, props[key])
  })

  return (
    <div
      ref={otpInputRef}
      className={props.className || ''}
      style={props.style}
    />
  )
}

export default LunaOtpInput
