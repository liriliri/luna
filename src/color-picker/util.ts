const round = Math.round

export function rgbToHsv(r: number, g: number, b: number) {
  let h = 0
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  if (delta === 0) {
    h = 0
  } else if (r === max) {
    h = ((g - b) / delta) % 6
  } else if (g === max) {
    h = (b - r) / delta + 2
  } else if (b === max) {
    h = (r - g) / delta + 4
  }

  h = round(h * 60)
  if (h < 0) h += 360

  const s = round((max === 0 ? 0 : delta / max) * 100)

  const v = round((max / 255) * 100)

  return [h, s, v]
}

export function hsvToRgb(h: number, s: number, v: number) {
  s = s / 100
  v = v / 100
  const c = v * s
  const p = h / 60
  const x = c * (1 - Math.abs((p % 2) - 1))
  const m = v - c

  const rgb =
    p === 0
      ? [c, x, 0]
      : p === 1
      ? [x, c, 0]
      : p === 2
      ? [0, c, x]
      : p === 3
      ? [0, x, c]
      : p === 4
      ? [x, 0, c]
      : p === 5
      ? [c, 0, x]
      : []

  return [
    round(255 * (rgb[0] + m)),
    round(255 * (rgb[1] + m)),
    round(255 * (rgb[2] + m)),
  ]
}
