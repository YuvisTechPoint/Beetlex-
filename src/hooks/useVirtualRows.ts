import { useMemo } from 'react'

interface VirtualWindow {
  start: number
  end: number
  paddingTop: number
  paddingBottom: number
}

export function useVirtualRows(
  itemCount: number,
  scrollTop: number,
  viewportHeight: number,
  rowHeight = 52,
): VirtualWindow {
  return useMemo(() => {
    const overscan = 4
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan)
    const visible = Math.ceil(viewportHeight / rowHeight) + overscan * 2
    const end = Math.min(itemCount, start + visible)
    return {
      start,
      end,
      paddingTop: start * rowHeight,
      paddingBottom: Math.max(0, (itemCount - end) * rowHeight),
    }
  }, [itemCount, rowHeight, scrollTop, viewportHeight])
}
