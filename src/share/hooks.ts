import {
  DependencyList,
  EffectCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

export function useForceUpdate() {
  const [_, setForceUpdateValue] = useState(0)
  return () => setForceUpdateValue((value) => value + 1)
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
