import { FC, PropsWithChildren, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import types from 'licia/types'
import Modal from './index'
import noop from 'licia/noop'
import each from 'licia/each'
import { useForceUpdate, useNonInitialEffect } from '../share/hooks'

interface IModalProps {
  title: string
  visible: boolean
  width?: number
  onClose?: () => void
}

const LunaModal: FC<PropsWithChildren<IModalProps>> = (props) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const modal = useRef<Modal>()
  const content = useRef<HTMLDivElement>()
  const doHide = useRef<types.AnyFn>()
  const forceUpdate = useForceUpdate()

  useEffect(() => {
    const m = new Modal(modalRef.current!, {
      title: props.title,
      content: '',
    })
    m.renderContent = noop
    doHide.current = m.hide
    m.hide = function () {
      props.onClose && props.onClose()
    }
    if (props.visible) {
      m.show()
    }
    if (props.width) {
      m.setOption('width', props.width)
    }
    modal.current = m

    content.current = m.$container
      .find(m.c('.content'))
      .get(0) as HTMLDivElement
    forceUpdate()

    return () => m.destroy()
  }, [])

  each(['title', 'width'], (key: keyof IModalProps) => {
    useNonInitialEffect(() => {
      if (modal.current) {
        modal.current.setOption(key, props[key])
      }
    }, [props[key]])
  })

  useEffect(() => {
    if (modal.current) {
      if (props.visible) {
        modal.current.show()
      } else {
        doHide.current && doHide.current.call(modal.current)
      }
    }
  }, [props.visible])

  return (
    <div ref={modalRef}>
      {content.current && createPortal(<>{props.children}</>, content.current)}
    </div>
  )
}

export default LunaModal
