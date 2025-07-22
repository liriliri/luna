import { CSSProperties, FC, useEffect, useRef } from 'react'
import MusicPlayer, { IOptions } from './index'
import each from 'licia/each'
import { useOption } from '../share/hooks'

interface IMusicPlayerProps extends IOptions {
  style?: CSSProperties
  className?: string
  onCreate?: (player: MusicPlayer) => void
}

const LunaMusicPlayer: FC<IMusicPlayerProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const musicPlayerRef = useRef<MusicPlayer>()

  useEffect(() => {
    musicPlayerRef.current = new MusicPlayer(containerRef.current!, {
      theme: props.theme,
      audio: props.audio,
      listFolded: props.listFolded,
    })
    props.onCreate && props.onCreate(musicPlayerRef.current)

    return () => musicPlayerRef.current?.destroy()
  }, [])

  each(['theme', 'audio'], (key: keyof IMusicPlayerProps) => {
    useOption<MusicPlayer, IMusicPlayerProps>(musicPlayerRef, key, props[key])
  })

  return (
    <div
      className={props.className || ''}
      style={props.style}
      ref={containerRef}
    />
  )
}

export default LunaMusicPlayer
