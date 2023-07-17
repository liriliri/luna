import { FC, MutableRefObject, useEffect, useRef } from 'react'
import Log from './index'

interface ILogProps {
  log?: string
  wrapLongLines?: boolean
  maxHeight?: number
  onCreate?: (log: Log) => void
}

const LunaLog: FC<ILogProps> = (props) => {
  const logRef = useRef<HTMLDivElement>(null)
  const log = useRef<Log>()

  useEffect(() => {
    log.current = new Log(logRef.current!, {
      log: props.log,
      wrapLongLines: props.wrapLongLines,
      maxHeight: props.maxHeight,
    })
    props.onCreate && props.onCreate(log.current)

    return () => log.current?.destroy()
  }, [])

  useEffect(() => setOption(log, 'log', props.log), [props.log])
  useEffect(
    () => setOption(log, 'wrapLongLines', props.wrapLongLines),
    [props.wrapLongLines]
  )
  useEffect(
    () => setOption(log, 'maxHeight', props.maxHeight),
    [props.maxHeight]
  )

  return <div ref={logRef}></div>
}

function setOption(
  log: MutableRefObject<Log | undefined>,
  name: string,
  val: any
) {
  if (log.current) {
    log.current.setOption(name, val)
  }
}

export default LunaLog
