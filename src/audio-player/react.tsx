import { FC, useEffect, useRef } from 'react'
import AudioPlayer, { IOptions } from './index'
import each from 'licia/each'
import { useOption } from '../share/hooks'

interface IAudioPlayerProps extends IOptions {
  className?: string
  style?: React.CSSProperties
  onCreate?: (player: AudioPlayer) => void
}

const LunaAudioPlayer: FC<IAudioPlayerProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const audioPlayerRef = useRef<AudioPlayer>()

  useEffect(() => {
    audioPlayerRef.current = new AudioPlayer(containerRef.current!, {
      url: props.url,
      name: props.name,
      waveColor: props.waveColor,
      progressColor: props.progressColor,
    })
    props.onCreate && props.onCreate(audioPlayerRef.current)

    return () => audioPlayerRef.current?.destroy()
  }, [])

  each(['theme', 'url', 'name'], (key: keyof IAudioPlayerProps) => {
    useOption<AudioPlayer, IAudioPlayerProps>(audioPlayerRef, key, props[key])
  })

  return (
    <div
      className={props.className || ''}
      style={props.style}
      ref={containerRef}
    />
  )
}

export default LunaAudioPlayer
