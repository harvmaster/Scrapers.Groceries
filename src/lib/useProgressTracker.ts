export const useProgressTracker = (total: number, callback?: (value: number) => void) => {
  let count = 0
  let lastCallProgress = 0
  return (...value: any[]) => {
    count++
    const progress = Math.floor((count / total) * 100)
    if (progress !== lastCallProgress) {
      lastCallProgress = progress
      callback?.(progress)
    }
  }
}

export default useProgressTracker