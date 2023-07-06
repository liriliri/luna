import { CSSProperties, FC, useEffect, useRef } from 'react'
import ImageViewer from './index'

interface IImageViewerProps {
  image: string
  initialCoverage?: number
  style?: CSSProperties
  className?: string
  onCreate?: (imageViewer: ImageViewer) => void
}

const LunaImageViewer: FC<IImageViewerProps> = (props) => {
  const imageViewerRef = useRef<HTMLDivElement>(null)
  const imageViewer = useRef<ImageViewer>()

  useEffect(() => {
    const { image, initialCoverage } = props
    imageViewer.current = new ImageViewer(imageViewerRef.current!, {
      image,
      initialCoverage,
    })
    props.onCreate && props.onCreate(imageViewer.current)

    return () => imageViewer.current?.destroy()
  }, [])

  useEffect(() => {
    if (imageViewer.current) {
      imageViewer.current.setOption('image', props.image)
    }
  }, [props.image])

  return (
    <div
      className={props.className || ''}
      ref={imageViewerRef}
      style={props.style}
    ></div>
  )
}

export default LunaImageViewer
