import { CSSProperties, FC, useEffect, useRef } from 'react'
import MaskEditor, { IOptions } from './index'
import { useNonInitialEffect } from '../share/hooks'

interface IMaskEditorProps extends IOptions {
  style?: CSSProperties
  onChange?: (canvas: HTMLCanvasElement) => void
  onCreate?: (maskEditor: MaskEditor) => void
}

const LunaMaskEditor: FC<IMaskEditorProps> = (props) => {
  const maskEditorRef = useRef<HTMLDivElement>(null)
  const maskEditor = useRef<MaskEditor>()

  useEffect(() => {
    const { image, mask } = props
    maskEditor.current = new MaskEditor(maskEditorRef.current!, {
      image,
      mask,
    })
    props.onCreate && props.onCreate(maskEditor.current)

    if (props.onChange) {
      maskEditor.current.on('change', props.onChange)
    }

    return () => maskEditor.current?.destroy()
  }, [])

  useNonInitialEffect(() => {
    if (maskEditor.current) {
      maskEditor.current.setOption('image', props.image)
    }
  }, [props.image])

  useNonInitialEffect(() => {
    if (maskEditor.current) {
      maskEditor.current.setOption('mask', props.mask)
    }
  }, [props.mask])

  return <div ref={maskEditorRef} style={props.style}></div>
}

export default LunaMaskEditor
