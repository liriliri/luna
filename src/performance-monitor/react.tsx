import { FC, useEffect, useRef } from 'react'
import PerformanceMonitor, { IOptions } from './index'
import { useNonInitialEffect } from '../share/hooks'

const LunaPerformanceMonitor: FC<IOptions> = (props) => {
  const performanceMonitorRef = useRef<HTMLDivElement>(null)
  const performanceMonitor = useRef<PerformanceMonitor>()

  useEffect(() => {
    performanceMonitor.current = new PerformanceMonitor(
      performanceMonitorRef.current!,
      {
        ...props,
      }
    )
    performanceMonitor.current.start()

    return () => performanceMonitor.current?.destroy()
  }, [])

  useNonInitialEffect(() => {
    if (performanceMonitor.current) {
      performanceMonitor.current.setOption('theme', props.theme)
    }
  }, [props.theme])

  useNonInitialEffect(() => {
    if (performanceMonitor.current) {
      performanceMonitor.current.setOption('color', props.color)
    }
  }, [props.color])

  return <div ref={performanceMonitorRef} />
}

export default LunaPerformanceMonitor
