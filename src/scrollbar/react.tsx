import { CSSProperties, FC, PropsWithChildren, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Scrollbar, { IOptions } from './index'
import { useForceUpdate, useOption } from '../share/hooks'

interface IScrollbarProps extends IOptions {
  style?: CSSProperties
  className?: string
  onCreate?: (scrollbar: Scrollbar) => void
}

const LunaScrollbar: FC<PropsWithChildren<IScrollbarProps>> = (props) => {
  const scrollbarRef = useRef<HTMLDivElement>(null)
  const scrollbar = useRef<Scrollbar>()
  const content = useRef<HTMLElement>()
  const forceUpdate = useForceUpdate()

  useEffect(() => {
    scrollbar.current = new Scrollbar(scrollbarRef.current!, {
      theme: props.theme,
    })
    props.onCreate && props.onCreate(scrollbar.current)

    content.current = scrollbar.current.getContent()
    forceUpdate()

    return () => scrollbar.current?.destroy()
  }, [])

  useOption<Scrollbar, IScrollbarProps>(scrollbar, 'theme', props.theme)

  return (
    <div
      className={props.className || ''}
      style={props.style}
      ref={scrollbarRef}
    >
      {content.current && createPortal(<>{props.children}</>, content.current)}
    </div>
  )
}

export default LunaScrollbar
