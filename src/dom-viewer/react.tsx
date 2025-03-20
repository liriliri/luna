import { FC, useEffect, useRef } from 'react'
import each from 'licia/each'
import DomViewer, { IOptions } from './index'
import { useOption } from '../share/hooks'

interface IDomViewerProps extends IOptions {
  onCreate?: (domViewer: DomViewer) => void
}

const LunaDomViewer: FC<IDomViewerProps> = (props) => {
  const domViewerRef = useRef<HTMLDivElement>(null)
  const domViewer = useRef<DomViewer>()

  useEffect(() => {
    domViewer.current = new DomViewer(domViewerRef.current!, {
      theme: props.theme,
      hotkey: props.hotkey,
      node: props.node,
      observe: props.observe,
    })
    props.onCreate && props.onCreate(domViewer.current)

    return () => domViewer.current?.destroy()
  }, [])

  each(['theme'], (key: keyof IDomViewerProps) => {
    useOption<DomViewer, IDomViewerProps>(domViewer, key, props[key])
  })

  return <div ref={domViewerRef} />
}

export default LunaDomViewer
