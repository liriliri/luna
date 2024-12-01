import { CSSProperties, FC, MouseEventHandler, useEffect, useRef } from 'react'
import each from 'licia/each'
import Logcat, { IOptions } from './index'
import { useOption } from '../share/hooks'

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
    const { theme, maxNum, wrapLongLines, filter, entries, view } = props

    logcat.current = new Logcat(logcatRef.current!, {
      theme,
      filter,
      maxNum,
      wrapLongLines,
      entries,
      view,
    })
    props.onCreate && props.onCreate(logcat.current)

    return () => logcat.current?.destroy()
  }, [])

  each(
    ['theme', 'filter', 'maxNum', 'wrapLongLines', 'view'],
    (key: keyof IOptions) => {
      useOption<Logcat, IOptions>(logcat, key, props[key])
    }
  )

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
