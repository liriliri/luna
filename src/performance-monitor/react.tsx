import { FC, useEffect, useRef } from 'react'
import PerformanceMonitor, { IOptions } from './index'
import { useNonInitialEffect } from '../share/hooks'
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

  each(['theme', 'color'], (key: keyof IOptions) => {
    useNonInitialEffect(() => {
      if (performanceMonitor.current) {
        performanceMonitor.current.setOption(key, props[key])
      }
    }, [props[key]])
  })

  return <div ref={performanceMonitorRef} />
}

export default LunaPerformanceMonitor
