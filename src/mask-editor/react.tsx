import { CSSProperties, FC, useEffect, useRef } from 'react'
import MaskEditor, { IOptions } from './index'
import each from 'licia/each'
import { useEvent, useOption, usePrevious } from '../share/hooks'

interface IMaskEditorProps extends IOptions {
  style?: CSSProperties
  onChange?: (canvas: HTMLCanvasElement) => void
  onCreate?: (maskEditor: MaskEditor) => void
}

const LunaMaskEditor: FC<IMaskEditorProps> = (props) => {
  const maskEditorRef = useRef<HTMLDivElement>(null)
  const maskEditor = useRef<MaskEditor>()
  const prevProps = usePrevious(props)
  console.log('LunaMaskEditor from KK')

  useEffect(() => {
    const { image, mask, theme } = props
    maskEditor.current = new MaskEditor(maskEditorRef.current!, {
      image,
      mask,
      theme,
    })
    props.onCreate && props.onCreate(maskEditor.current)

    return () => maskEditor.current?.destroy()
  }, [])

  useEvent<MaskEditor>(
    maskEditor,
    'change',
    prevProps?.onChange,
    props.onChange
  )
  each(['theme', 'image', 'mask'], (key: keyof IMaskEditorProps) => {
    useOption<MaskEditor, IMaskEditorProps>(maskEditor, key, props[key])
  })

  return <div ref={maskEditorRef} style={props.style}></div>
}

export default LunaMaskEditor
