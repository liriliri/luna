import { CSSProperties, FC, useEffect, useRef } from 'react'
import Cropper, { IOptions } from './index'

interface ICropperProps extends IOptions {
  style?: CSSProperties
  className?: string
  onCreate?: (cropper: Cropper) => void
}

const LunaCropper: FC<ICropperProps> = (props) => {
  const cropperRef = useRef<HTMLDivElement>(null)
  const cropper = useRef<Cropper>()

  useEffect(() => {
    const { image, preview } = props
    cropper.current = new Cropper(cropperRef.current!, {
      image,
      preview,
    })
    props.onCreate && props.onCreate(cropper.current)

    return () => cropper.current?.destroy()
  }, [])

  useEffect(() => {
    if (cropper.current) {
      cropper.current.setOption('image', props.image)
    }
  }, [props.image])

  useEffect(() => {
    if (cropper.current) {
      cropper.current.setOption('preview', props.preview)
    }
  }, [props.preview])

  return (
    <div
      className={props.className || ''}
      style={props.style}
      ref={cropperRef}
    ></div>
  )
}

export default LunaCropper
