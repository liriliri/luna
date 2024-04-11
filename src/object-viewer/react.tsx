import { CSSProperties, FC, useEffect, useRef } from 'react'
import ObjectViewer, { IOptions } from './index'
import each from 'licia/each'
import clone from 'licia/clone'
import { useNonInitialEffect } from '../share/hooks'

interface IObjectViewerProps extends IOptions {
  style?: CSSProperties
  className?: string
}

const LunaObjectViewer: FC<IObjectViewerProps> = (props) => {
  const objectViewerRef = useRef<HTMLDivElement>(null)
  const objectViewer = useRef<ObjectViewer>()

  useEffect(() => {
    objectViewer.current = new ObjectViewer(
      objectViewerRef.current!,
      clone(props)
    )

    return () => objectViewer.current?.destroy()
  }, [])

  each(
    ['theme', 'object', 'prototype', 'unenumerable', 'accessGetter'],
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
