import { CSSProperties, FC, useEffect, useRef } from 'react'
import Painter, { IOptions } from './index'
import { useNonInitialEffect } from '../share/hooks'
import clone from 'licia/clone'
import each from 'licia/each'

interface IPainterProps extends IOptions {
  style?: CSSProperties
  onCreate?: (painter: Painter) => void
}

const LunaPainter: FC<IPainterProps> = (props) => {
  const painterRef = useRef<HTMLDivElement>(null)
  const painter = useRef<Painter>()

  useEffect(() => {
    painter.current = new Painter(painterRef.current!, clone(props))
    props.onCreate && props.onCreate(painter.current)

    return () => painter.current?.destroy()
  }, [])

  each(['theme', 'width', 'height'], (key: keyof IPainterProps) => {
    useNonInitialEffect(() => {
      if (painter.current) {
        painter.current.setOption(key, props[key])
      }
    }, [props[key]])
  })

  return <div ref={painterRef} style={props.style}></div>
}

export default LunaPainter
