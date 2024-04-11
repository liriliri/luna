import { FC, useEffect, useRef } from 'react'
import ObjectViewer, { IOptions } from './index'
import each from 'licia/each'

const LunaObjectViewer: FC<IOptions> = (props) => {
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
    (key: keyof IOptions) => {
      useEffect(() => {
        if (objectViewer.current) {
          objectViewer.current.setOption(key, props[key])
        }
      }, [props[key]])
    }
  )

  return <div ref={objectViewerRef} />
}

export default LunaObjectViewer
