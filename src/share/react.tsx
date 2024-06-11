import { FC, PropsWithChildren } from 'react'
import { classPrefix, getPlatform } from './util'
import className from 'licia/className'

interface IComponentProps {
  compName: string
  theme?: string
}

export const Component: FC<PropsWithChildren<IComponentProps>> = (props) => {
  const c = classPrefix(props.compName)

  return (
    <div
      className={className(
        `luna-${props.compName}`,
        c(`platform-${getPlatform()}`),
        c(`theme-${props.theme || 'light'}`)
      )}
    >
      {props.children}
    </div>
  )
}
