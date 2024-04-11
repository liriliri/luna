import { CSSProperties, FC, useEffect, useRef } from 'react'
import Cropper, { IOptions } from './index'
import each from 'licia/each'
import { useNonInitialEffect } from '../share/hooks'
import clone from 'licia/clone'

interface ICropperProps extends IOptions {
  style?: CSSProperties
  className?: string
  onCreate?: (cropper: Cropper) => void
}

const LunaCropper: FC<ICropperProps> = (props) => {
  const cropperRef = useRef<HTMLDivElement>(null)
  const cropper = useRef<Cropper>()

  useEffect(() => {
    cropper.current = new Cropper(cropperRef.current!, clone(props))
    props.onCreate && props.onCreate(cropper.current)

    return () => cropper.current?.destroy()
  }, [])

  each(['image', 'preview'], (key: keyof ICropperProps) => {
    useNonInitialEffect(() => {
      if (cropper.current) {
        cropper.current.setOption(key, props[key])
      }
    }, [props[key]])
  })

  return (
    <div
      className={props.className || ''}
      style={props.style}
      ref={cropperRef}
    ></div>
  )
}

export default LunaCropper
