import { CSSProperties, FC, useEffect, useRef } from 'react'
import ImageViewer, { IOptions } from './index'
import each from 'licia/each'
import { useNonInitialEffect } from '../share/hooks'

interface IImageViewerProps extends IOptions {
  style?: CSSProperties
  className?: string
  onCreate?: (imageViewer: ImageViewer) => void
}

const LunaImageViewer: FC<IImageViewerProps> = (props) => {
  const imageViewerRef = useRef<HTMLDivElement>(null)
  const imageViewer = useRef<ImageViewer>()

  useEffect(() => {
    const { image, initialCoverage, zoomOnWheel } = props
    imageViewer.current = new ImageViewer(imageViewerRef.current!, {
      image,
      initialCoverage,
      zoomOnWheel,
    })
    props.onCreate && props.onCreate(imageViewer.current)

    return () => imageViewer.current?.destroy()
  }, [])

  each(['image', 'zoomOnWheel'], (key: keyof IOptions) => {
    useNonInitialEffect(() => {
      if (imageViewer.current) {
        imageViewer.current.setOption(key, props[key])
      }
    }, [props[key]])
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
