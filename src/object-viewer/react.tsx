import { CSSProperties, FC, useEffect, useRef } from 'react'
import ObjectViewer, { IOptions } from './index'
import each from 'licia/each'
import { useNonInitialEffect } from '../share/hooks'

interface IObjectViewerProps extends IOptions {
  style?: CSSProperties
  className?: string
}

const LunaObjectViewer: FC<IObjectViewerProps> = (props) => {
  const objectViewerRef = useRef<HTMLDivElement>(null)
  const objectViewer = useRef<ObjectViewer>()

  useEffect(() => {
    const { prototype, unenumerable, accessGetter, object } = props
    objectViewer.current = new ObjectViewer(objectViewerRef.current!, {
      prototype,
      unenumerable,
      accessGetter,
      object,
    })

    return () => objectViewer.current?.destroy()
  }, [])

  each(
    ['object', 'prototype', 'unenumerable', 'accessGetter'],
    (key: keyof IObjectViewerProps) => {
      useNonInitialEffect(() => {
        if (objectViewer.current) {
          objectViewer.current.setOption(key, props[key])
        }
      }, [props[key]])
    }
  )

  return (
    <div
      className={props.className || ''}
      style={props.style}
      ref={objectViewerRef}
    />
  )
}

export default LunaObjectViewer
