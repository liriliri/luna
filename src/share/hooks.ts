import {
  DependencyList,
  EffectCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import Component from './Component'

export function useForceUpdate() {
  const [_, setForceUpdateValue] = useState(0)
  return () => setForceUpdateValue((value) => value + 1)
}

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

export function useNonInitialEffect(
  effect: EffectCallback,
  deps?: DependencyList
) {
  const initialRender = useRef(true)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    let effectReturns: any = () => {}

    if (initialRender.current) {
      initialRender.current = false
    } else {
      effectReturns = effect()
    }

    if (effectReturns && typeof effectReturns === 'function') {
      return effectReturns
    }
  }, deps)
}

export function useEvent<C extends Component>(
  component: React.MutableRefObject<C | undefined>,
  event: string,
  prev: any,
  prop: any
) {
  useEffect(() => {
    if (component.current) {
      if (prev) {
        component.current.off(event, prev)
      }
      if (prop) {
        component.current.on(event, prop)
      }
    }
  }, [prop])
}

export function useOption<C extends Component, P>(
  component: React.MutableRefObject<C | undefined>,
  key: keyof P,
  prop: any
) {
  useNonInitialEffect(() => {
    if (component.current) {
      component.current.setOption(key as string, prop)
    }
  }, [prop])
}
