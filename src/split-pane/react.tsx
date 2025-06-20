import {
  Children,
  cloneElement,
  CSSProperties,
  FC,
  PropsWithChildren,
  ReactElement,
  useEffect,
  useRef,
} from 'react'
import SplitPane, { IOptions } from './index'
import { useEvent, useForceUpdate, usePrevious } from '../share/hooks'

interface ISplitPaneProps extends IOptions {
  style?: CSSProperties
  className?: string
  onResize?: (weights: number[]) => void
}

const LunaSplitPane: FC<PropsWithChildren<ISplitPaneProps>> = (props) => {
  const splitPaneRef = useRef<HTMLDivElement>(null)
  const splitPane = useRef<SplitPane>()
  const forceUpdate = useForceUpdate()
  const prevProps = usePrevious(props)

  useEffect(() => {
    splitPane.current = new SplitPane(splitPaneRef.current!, {
      direction: props.direction,
    })

    forceUpdate()

    return () => splitPane.current?.destroy()
  }, [])

  useEvent<SplitPane>(splitPane, 'resize', prevProps?.onResize, props.onResize)

  return (
    <div
      ref={splitPaneRef}
      className={props.className || ''}
      style={props.style}
    >
      {Children.map(props.children, (child) =>
        cloneElement(child as ReactElement, {
          splitPane: splitPane.current,
        })
      )}
    </div>
  )
}

interface ISplitPaneItemProps {
  splitPane?: SplitPane
  minSize?: number
  weight?: number
  visible?: boolean
  style?: CSSProperties
  className?: string
}

export const LunaSplitPaneItem: FC<PropsWithChildren<ISplitPaneItemProps>> = (
  props
) => {
  const splitPaneItemRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (props.splitPane) {
      props.splitPane.append(splitPaneItemRef.current!, {
        minSize: props.minSize,
        weight: props.weight,
        visible: props.visible,
      })
    }
  }, [props.splitPane])

  useEffect(() => {
    if (props.splitPane) {
      props.splitPane.update(splitPaneItemRef.current!, {
        minSize: props.minSize,
        weight: props.weight,
        visible: props.visible,
      })
    }
  }, [props.minSize, props.weight, props.visible])

  return (
    <div
      ref={splitPaneItemRef}
      className={props.className || ''}
      style={props.style}
    >
      {props.children}
    </div>
  )
}

export default LunaSplitPane
