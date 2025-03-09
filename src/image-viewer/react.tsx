import { CSSProperties, FC, useEffect, useRef } from 'react'
import ImageViewer, { IOptions } from './index'
import each from 'licia/each'
import { useOption } from '../share/hooks'

interface IImageViewerProps extends IOptions {
  style?: CSSProperties
  className?: string
  onCreate?: (imageViewer: ImageViewer) => void
}

const LunaImageViewer: FC<IImageViewerProps> = (props) => {
  const imageViewerRef = useRef<HTMLDivElement>(null)
  const imageViewer = useRef<ImageViewer>()

  useEffect(() => {
    imageViewer.current = new ImageViewer(imageViewerRef.current!, {
      theme: props.theme,
      image: props.image,
      initialCoverage: props.initialCoverage,
      zoomOnWheel: props.zoomOnWheel,
    })
    props.onCreate && props.onCreate(imageViewer.current)

    return () => imageViewer.current?.destroy()
  }, [])

  each(['theme', 'image', 'zoomOnWheel'], (key: keyof IImageViewerProps) => {
    useOption<ImageViewer, IImageViewerProps>(imageViewer, key, props[key])
  })

  return (
    <div
      className={props.className || ''}
      ref={imageViewerRef}
      style={props.style}
    ></div>
  )
}

export default LunaImageViewer
