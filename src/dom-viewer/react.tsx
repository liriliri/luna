import { FC, useEffect, useRef } from 'react'
import each from 'licia/each'
import DomViewer, { IOptions } from './index'
import { useEvent, useOption, usePrevious } from '../share/hooks'

interface IDomViewerProps extends IOptions {
  onCreate?: (domViewer: DomViewer) => void
  onSelect?: (node: Node) => void
  onDeselect?: () => void
}

const LunaDomViewer: FC<IDomViewerProps> = (props) => {
  const domViewerRef = useRef<HTMLDivElement>(null)
  const domViewer = useRef<DomViewer>()
  const prevProps = usePrevious(props)

  useEffect(() => {
    domViewer.current = new DomViewer(domViewerRef.current!, {
      theme: props.theme,
      hotkey: props.hotkey,
      node: props.node,
      ignore: props.ignore,
      ignoreAttr: props.ignoreAttr,
      observe: props.observe,
    })
    props.onCreate && props.onCreate(domViewer.current)

    return () => domViewer.current?.destroy()
  }, [])

  useEvent<DomViewer>(domViewer, 'select', prevProps?.onSelect, props.onSelect)
  useEvent<DomViewer>(
    domViewer,
    'deselect',
    prevProps?.onDeselect,
    props.onDeselect
  )

  each(['theme'], (key: keyof IDomViewerProps) => {
    useOption<DomViewer, IDomViewerProps>(domViewer, key, props[key])
  })

  return <div ref={domViewerRef} />
}

export default LunaDomViewer
