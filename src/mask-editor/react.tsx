import { CSSProperties, FC, useEffect, useRef } from 'react'
import MaskEditor, { IOptions } from './index'
import { useNonInitialEffect } from '../share/hooks'

interface IMaskEditorProps extends IOptions {
  style?: CSSProperties
  onCreate?: (maskEditor: MaskEditor) => void
}

const LunaMaskEditor: FC<IMaskEditorProps> = (props) => {
  const maskEditorRef = useRef<HTMLDivElement>(null)
  const maskEditor = useRef<MaskEditor>()

  useEffect(() => {
    const { image } = props
    maskEditor.current = new MaskEditor(maskEditorRef.current!, {
      image,
    })
    props.onCreate && props.onCreate(maskEditor.current)

    return () => maskEditor.current?.destroy()
  }, [])

  useNonInitialEffect(() => {
    if (maskEditor.current) {
      maskEditor.current.setOption('image', props.image)
    }
  }, [props.image])

  return <div ref={maskEditorRef} style={props.style}></div>
}

export default LunaMaskEditor
