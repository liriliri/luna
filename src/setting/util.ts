export const progress = (val: number, min: number, max: number) => {
  return (((val - min) / (max - min)) * 100).toFixed(2)
}
