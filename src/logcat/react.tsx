import { CSSProperties, FC, useEffect, useRef } from 'react'
import each from 'licia/each'
import Logcat, { IOptions } from './index'
import { useNonInitialEffect } from '../share/hooks'

interface IILogcatProps extends IOptions {
  style?: CSSProperties
  className?: string
  onCreate?: (logcat: Logcat) => void
}

const LunaLogcat: FC<IILogcatProps> = (props) => {
  const logcatRef = useRef<HTMLDivElement>(null)
  const logcat = useRef<Logcat>()

  useEffect(() => {
    const { maxNum, wrapLongLines, filter, entries } = props
    logcat.current = new Logcat(logcatRef.current!, {
      filter,
      maxNum,
      wrapLongLines,
      entries,
    })
    props.onCreate && props.onCreate(logcat.current)

    return () => logcat.current?.destroy()
  }, [])

  each(['filter', 'maxNum', 'wrapLongLines'], (key: keyof IOptions) => {
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
      style={props.style}
    ></div>
  )
}

export default LunaLogcat
