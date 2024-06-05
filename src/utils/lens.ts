export const formatDegree = (degree: number): string => {
  if (degree === null || degree === undefined) {
    return ''
  }
  if (degree > 0) {
    return `+${degree.toFixed(2)}`
  }
  return degree.toFixed(2)
}
