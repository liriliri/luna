import { CSSProperties, FC, useEffect, useRef } from 'react'
import VideoPlayer, { IOptions } from './index'
import each from 'licia/each'
import { useOption } from '../share/hooks'

interface IVideoPlayerProps extends IOptions {
  style?: CSSProperties
  className?: string
  onCreate?: (player: VideoPlayer) => void
}

const LunaVideoPlayer: FC<IVideoPlayerProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoPlayerRef = useRef<VideoPlayer>()

  useEffect(() => {
    videoPlayerRef.current = new VideoPlayer(containerRef.current!, props)
    props.onCreate && props.onCreate(videoPlayerRef.current)

    return () => videoPlayerRef.current?.destroy()
  }, [])

  each(['url'], (key: keyof IVideoPlayerProps) => {
    useOption<VideoPlayer, IVideoPlayerProps>(videoPlayerRef, key, props[key])
  })

  return (
    <div
      className={props.className || ''}
      style={props.style}
      ref={containerRef}
    />
  )
}

export default LunaVideoPlayer
