const DPI = window.devicePixelRatio || 1

export function px(val: number) {
  return val * DPI
}
