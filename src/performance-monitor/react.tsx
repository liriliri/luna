import { FC, useEffect, useRef } from 'react'
import PerformanceMonitor, { IOptions } from './index'
import { useOption } from '../share/hooks'
import each from 'licia/each'
import clone from 'licia/clone'

const LunaPerformanceMonitor: FC<IOptions> = (props) => {
  const performanceMonitorRef = useRef<HTMLDivElement>(null)
  const performanceMonitor = useRef<PerformanceMonitor>()

  useEffect(() => {
    performanceMonitor.current = new PerformanceMonitor(
      performanceMonitorRef.current!,
      clone(props)
    )
    performanceMonitor.current.start()

    return () => performanceMonitor.current?.destroy()
  }, [])

  each(['theme', 'color', 'height', 'title'], (key: keyof IOptions) => {
    useOption<PerformanceMonitor, IOptions>(performanceMonitor, key, props[key])
  })

  return <div ref={performanceMonitorRef} />
}

export default LunaPerformanceMonitor
