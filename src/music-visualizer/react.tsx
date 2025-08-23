import { FC, useEffect, useRef } from 'react'
import MusicVisualizer, { IOptions } from './index'
import each from 'licia/each'
import { useOption } from '../share/hooks'

interface IMusicVisualizerProps extends IOptions {
  style?: React.CSSProperties
  className?: string
  onCreate?: (visualizer: MusicVisualizer) => void
}

const LunaMusicVisualizer: FC<IMusicVisualizerProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const musicVisualizerRef = useRef<MusicVisualizer>()

  useEffect(() => {
    musicVisualizerRef.current = new MusicVisualizer(containerRef.current!, {
      audio: props.audio,
      image: props.image,
      fftSize: props.fftSize,
    })
    props.onCreate && props.onCreate(musicVisualizerRef.current)

    return () => musicVisualizerRef.current?.destroy()
  }, [])

  each(['audio', 'fftSize'], (key: keyof IMusicVisualizerProps) => {
    useOption<MusicVisualizer, IMusicVisualizerProps>(
      musicVisualizerRef,
      key,
      props[key]
    )
  })

  return (
    <div
      className={props.className || ''}
      style={props.style}
      ref={containerRef}
    />
  )
}

export default LunaMusicVisualizer
