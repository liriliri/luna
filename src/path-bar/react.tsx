import { FC, useEffect, useRef } from 'react'
import PathBar, { IOptions } from './index'
import each from 'licia/each'
import { useEvent, useOption } from '../share/hooks'

interface IPathBarProps extends IOptions {
  onChange?: (path: string) => void
}

const LunaPathBar: FC<IPathBarProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathBarRef = useRef<PathBar>()

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

  useEvent<PathBar>(pathBarRef, 'change', undefined, props.onChange)

  return <div ref={containerRef} />
}

export default LunaPathBar
