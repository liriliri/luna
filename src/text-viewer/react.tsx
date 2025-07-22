import { CSSProperties, FC, useEffect, useRef } from 'react'
import TextViewer, { IOptions } from './index'
import each from 'licia/each'
import { useOption } from '../share/hooks'

interface ITextViewerProps extends IOptions {
  style?: CSSProperties
  className?: string
  onCreate?: (viewer: TextViewer) => void
}

const LunaTextViewer: FC<ITextViewerProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const textViewerRef = useRef<TextViewer>()

  useEffect(() => {
    textViewerRef.current = new TextViewer(containerRef.current!, {
      theme: props.theme,
      text: props.text,
      escape: props.escape,
      showLineNumbers: props.showLineNumbers,
      wrapLongLines: props.wrapLongLines,
      maxHeight: props.maxHeight,
    })
    props.onCreate && props.onCreate(textViewerRef.current)

    return () => textViewerRef.current?.destroy()
  }, [])

  each(
    [
      'theme',
      'text',
      'escape',
      'showLineNumbers',
      'wrapLongLines',
      'maxHeight',
    ],
    (key: keyof ITextViewerProps) => {
      useOption<TextViewer, ITextViewerProps>(textViewerRef, key, props[key])
    }
  )

  return (
    <div
      className={props.className || ''}
      style={props.style}
      ref={containerRef}
    />
  )
}

export default LunaTextViewer
