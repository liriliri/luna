import 'luna-performance-monitor.css'
import PerformanceMonitor from 'luna-performance-monitor.js'
import story from '../share/story'
import readme from './README.md'

const def = story(
  'performance-monitor',
  (container) => {
    const performanceMonitor = new PerformanceMonitor(container)

    return performanceMonitor
  },
  {
    readme,
    source: __STORY__,
  }
)

export default def

export const { performanceMonitor } = def
