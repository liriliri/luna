import { CSSProperties, FC, useEffect, useRef } from 'react'
import Painter, { IOptions } from './index'

interface IPainterProps extends IOptions {
  style?: CSSProperties
  onCreate?: (painter: Painter) => void
}

const LunaPainter: FC<IPainterProps> = (props) => {
  const painterRef = useRef<HTMLDivElement>(null)
  const painter = useRef<Painter>()

  useEffect(() => {
    const { width, height, tool } = props
    console.log(width)
    painter.current = new Painter(painterRef.current!, {
      width,
      height,
      tool,
    })
    props.onCreate && props.onCreate(painter.current)

    return () => painter.current?.destroy()
  }, [])

  return <div ref={painterRef} style={props.style}></div>
}

export default LunaPainter
