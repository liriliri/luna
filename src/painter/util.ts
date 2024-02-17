export function duplicateCanvas(
  canvas: HTMLCanvasElement,
  includingContent = false
) {
  const result = document.createElement('canvas')
  result.width = canvas.width
  result.height = canvas.height
  if (includingContent) {
    result.getContext('2d')!.drawImage(canvas, 0, 0)
  }
  return result
}
