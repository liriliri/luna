import { CSSProperties, FC, useEffect, useRef } from 'react'
import each from 'licia/each'
import Logcat, { IOptions, IEntry } from './index'
import { useEvent, useOption, usePrevious } from '../share/hooks'

interface IILogcatProps extends IOptions {
  style?: CSSProperties
  className?: string
  onContextMenu?: (e: PointerEvent, entry: IEntry) => void
  onCreate?: (logcat: Logcat) => void
}

const LunaLogcat: FC<IILogcatProps> = (props) => {
  const logcatRef = useRef<HTMLDivElement>(null)
  const logcat = useRef<Logcat>()
  const prevProps = usePrevious(props)

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

  useEvent<Logcat>(
    logcat,
    'contextmenu',
    prevProps?.onContextMenu,
    props.onContextMenu
  )

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
      style={props.style}
    ></div>
  )
}

export default LunaLogcat
