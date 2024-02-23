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

const ratio3 = 255 / Math.sqrt(255 * 255 * 3)
const ratio4 = 255 / Math.sqrt(255 * 255 * 4)

export function colorDistance(color1: number[], color2: number[]) {
  const r = Math.abs(color1[0] - color2[0])
  const g = Math.abs(color1[1] - color2[1])
  const b = Math.abs(color1[2] - color2[2])
  if (color1.length === 4 && color2.length === 4) {
    const a = Math.abs(color1[3] - color2[3])
    if (a !== 0) {
      return Math.sqrt(r * r + g * g + b * b + a * a) * ratio4
    }
  }
  return Math.sqrt(r * r + g * g + b * b) * ratio3
}
