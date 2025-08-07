import { CSSProperties, FC, useEffect, useRef } from 'react'
import PathBar, { IOptions } from './index'
import each from 'licia/each'
import { useEvent, useOption, usePrevious } from '../share/hooks'

interface IPathBarProps extends IOptions {
  style?: CSSProperties
  className?: string
  onChange?: (path: string) => void
}

const LunaPathBar: FC<IPathBarProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathBarRef = useRef<PathBar>()
  const prevProps = usePrevious(props)

  useEffect(() => {
    pathBarRef.current = new PathBar(containerRef.current!, {
      theme: props.theme,
      path: props.path,
    })

    return () => pathBarRef.current?.destroy()
  }, [])

  each(['theme', 'path'], (key: keyof IPathBarProps) => {
    useOption<PathBar, IPathBarProps>(pathBarRef, key, props[key])
  })

  useEvent<PathBar>(pathBarRef, 'change', prevProps?.onChange, props.onChange)

  return (
    <div
      className={props.className || ''}
      style={props.style}
      ref={containerRef}
    />
  )
}

export default LunaPathBar
