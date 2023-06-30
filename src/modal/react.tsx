import { FC, PropsWithChildren, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import h from 'licia/h'
import types from 'licia/types'
import Modal from './index'

interface IModalProps {
  title: string
  visible: boolean
  width?: number
  onClose?: () => void
}

const LunaModal: FC<PropsWithChildren<IModalProps>> = (props) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const modal = useRef<Modal>()
  const content = useRef<HTMLDivElement>(h('div') as HTMLDivElement)
  const doHide = useRef<types.AnyFn>()

  useEffect(() => {
    modal.current = new Modal(modalRef.current!, {
      title: props.title,
      content: content.current,
    })
    doHide.current = modal.current.hide
    modal.current.hide = function () {
      props.onClose && props.onClose()
    }
    if (props.visible) {
      modal.current.show()
    }
    if (props.width) {
      modal.current.setOption('width', props.width)
    }

    return () => modal.current?.destroy()
  }, [])

  useEffect(() => {
    if (modal.current) {
      modal.current.setOption('title', props.title)
    }
  }, [props.title])

  useEffect(() => {
    if (modal.current) {
      if (props.visible) {
        modal.current.show()
      } else {
        doHide.current && doHide.current.call(modal.current)
      }
    }
  }, [props.visible])

  useEffect(() => {
    if (modal.current) {
      modal.current.setOption('width', props.width)
    }
  }, [props.width])

  return <div ref={modalRef}>
    {createPortal(<>{props.children}</>, content.current)}
  </div>
}

export default LunaModal