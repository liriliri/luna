import { CSSProperties, FC, useEffect, useRef } from 'react'
import Painter, { IOptions } from './index'
import { useNonInitialEffect } from '../share/hooks'

interface IPainterProps extends IOptions {
  style?: CSSProperties
  onCreate?: (painter: Painter) => void
}

const LunaPainter: FC<IPainterProps> = (props) => {
  const painterRef = useRef<HTMLDivElement>(null)
  const painter = useRef<Painter>()

  useEffect(() => {
    const { width, height, tool } = props
    painter.current = new Painter(painterRef.current!, {
      width,
      height,
      tool,
    })
    props.onCreate && props.onCreate(painter.current)

    return () => painter.current?.destroy()
  }, [])

  useNonInitialEffect(() => {
    if (painter.current) {
      painter.current.setOption('width', props.width)
    }
  }, [props.width])

  useNonInitialEffect(() => {
    if (painter.current) {
      painter.current.setOption('height', props.height)
    }
  }, [props.height])

  return <div ref={painterRef} style={props.style}></div>
}

export default LunaPainter
