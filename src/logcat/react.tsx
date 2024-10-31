import { CSSProperties, FC, MouseEventHandler, useEffect, useRef } from 'react'
import each from 'licia/each'
import Logcat, { IOptions } from './index'
import { useNonInitialEffect } from '../share/hooks'

interface IILogcatProps extends IOptions {
  style?: CSSProperties
  className?: string
  onContextMenu?: MouseEventHandler<HTMLDivElement>
  onCreate?: (logcat: Logcat) => void
}

const LunaLogcat: FC<IILogcatProps> = (props) => {
  const logcatRef = useRef<HTMLDivElement>(null)
  const logcat = useRef<Logcat>()

  useEffect(() => {
    const { maxNum, wrapLongLines, filter, entries, view } = props
    logcat.current = new Logcat(logcatRef.current!, {
      filter,
      maxNum,
      wrapLongLines,
      entries,
      view,
    })
    props.onCreate && props.onCreate(logcat.current)

    return () => logcat.current?.destroy()
  }, [])

  each(['filter', 'maxNum', 'wrapLongLines', 'view'], (key: keyof IOptions) => {
    useNonInitialEffect(() => {
      if (logcat.current) {
        logcat.current.setOption(key, props[key])
      }
    }, [props[key]])
  })

  return (
    <div
      className={props.className || ''}
      ref={logcatRef}
      onContextMenu={props.onContextMenu}
      style={props.style}
    ></div>
  )
}

export default LunaLogcat
