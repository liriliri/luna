import 'luna-performance-monitor.css'
import PerformanceMonitor from 'luna-performance-monitor.js'
import story from '../share/story'
import readme from './README.md'
import changelog from './CHANGELOG.md'
import $ from 'licia/$'
import h from 'licia/h'
import raf from 'licia/raf'
import now from 'licia/now'
import random from 'licia/random'
import each from 'licia/each'
import { button } from '@storybook/addon-knobs'
import LunaPerformanceMonitor from './react'

const def = story(
  'performance-monitor',
  (wrapper) => {
    $(wrapper).html('')

    let cpu = 0
    const cpuId = setInterval(() => {
      cpu = random(0, 100)
    }, 1500)
    const cpuContainer = h('div', {
      style: {
        marginBottom: 10,
      },
    })
    wrapper.appendChild(cpuContainer)
    const cpuMonitor = new PerformanceMonitor(cpuContainer, {
      title: 'CPU(Fake)',
      unit: '%',
      max: 100,
      data: () => cpu,
    })
    cpuMonitor.start()
    cpuMonitor.on('destroy', () => clearInterval(cpuId))

    let frames = 0
    let prevTime = 0
    let fps = 0
    let fpsId
    function updateFPS() {
      frames++
      const time = now()
      if (time > prevTime + 1000) {
        fps = Math.round((frames * 1000) / (time - prevTime))
        prevTime = time
        frames = 0
      }
      fpsId = raf(updateFPS)
    }
    updateFPS()

    const fpsContainer = h('div', {
      style: {
        marginBottom: 10,
      },
    })
    wrapper.appendChild(fpsContainer)
    const fpsMonitor = new PerformanceMonitor(fpsContainer, {
      title: 'FPS',
      color: '#00864B',
      smooth: false,
      data: () => fps,
    })
    fpsMonitor.start()
    fpsMonitor.on('destroy', () => raf.cancel.call(window, fpsId))

    const monitors = [cpuMonitor, fpsMonitor]

    if (performance.memory) {
      const memoryContainer = h('div')
      wrapper.appendChild(memoryContainer)
      const memoryMonitor = new PerformanceMonitor(memoryContainer, {
        title: 'Used JS heap size',
        unit: 'MB',
        color: '#614d82',
        smooth: false,
        data() {
          return (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)
        },
      })
      memoryMonitor.start()
      monitors.push(memoryMonitor)
    }

    button('Start All', () => {
      each(monitors, (monitor) => monitor.start())

      return false
    })

    button('Stop All', () => {
      each(monitors, (monitor) => monitor.stop())

      return false
    })

    return monitors
  },
  {
    readme,
    changelog,
    source: __STORY__,
    ReactComponent({ theme }) {
      return (
        <LunaPerformanceMonitor
          title="Used JS heap size"
          theme={theme}
          unit="MB"
          // color="#614d82"
          smooth={false}
          data={() => {
            return (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)
          }}
        />
      )
    },
  }
)

export default def

export const { performanceMonitor: html, react } = def
