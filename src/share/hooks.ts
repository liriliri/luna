import { useState } from 'react'

export function useForceUpdate() {
  const [_, setForceUpdateValue] = useState(0)
  return () => setForceUpdateValue((value) => value + 1)
}
