import { FC, useEffect, useRef } from 'react'
import Gallery, { IOptions } from './index'
import each from 'licia/each'
import isUndef from 'licia/isUndef'
import types from 'licia/types'

interface IGalleryProps extends IOptions {
  images: Array<{ src: string; title?: string }>
  visible: boolean
  current?: number
  onClose?: () => void
}

const LunaGallery: FC<IGalleryProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<Gallery>()
  const doHide = useRef<types.AnyFn>()

  useEffect(() => {
    const gallery = new Gallery(containerRef.current!, {
      theme: props.theme,
      inline: props.inline,
    })

    doHide.current = gallery.hide
    gallery.hide = function () {
      props.onClose && props.onClose()
    }

    galleryRef.current = gallery

    return () => gallery.destroy()
  }, [])

  useEffect(() => {
    if (galleryRef.current) {
      galleryRef.current.hide = function () {
        props.onClose && props.onClose()
      }
    }
  }, [props.onClose])

  useEffect(() => {
    const gallery = galleryRef.current
    if (gallery) {
      if (props.visible) {
        gallery.show()
      } else {
        doHide.current && doHide.current.call(gallery)
      }
    }
  }, [props.visible])

  useEffect(() => {
    if (galleryRef.current) {
      galleryRef.current.clear()
      each(props.images, (image) => {
        galleryRef.current?.append(image.src, image.title)
      })
    }
  }, [props.images])

  useEffect(() => {
    if (galleryRef.current && !isUndef(props.current)) {
      galleryRef.current.slideTo(props.current)
    }
  }, [props.current])

  return <div ref={containerRef} />
}

export default LunaGallery
