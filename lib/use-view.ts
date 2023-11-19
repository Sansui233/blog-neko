import { useEffect, useState } from "react"
import { throttle } from "./throttle"

/**
 * Get real view height
 */
export function useViewHeight() {
  const [viewHeight, setviewHeight] = useState(globalThis.innerHeight)

  // subscribe scroll to get view height
  // for safari compability
  useEffect(() => {
    const setvhOnResize = () => {
      setviewHeight(globalThis.innerHeight)
    }
    globalThis.addEventListener("resize", setvhOnResize)
    return () => {
      globalThis.removeEventListener("resize", setvhOnResize)
    }
  }, [])

  return viewHeight
}

/**
 * Get real view width
 */
export function useViewWidth() {
  const [viewWidth, setviewHeight] = useState(globalThis.innerWidth)

  // subscribe scroll to get view height
  // for safari compability
  useEffect(() => {
    const setvhOnResize = () => {
      setviewHeight(globalThis.innerWidth)
    }
    globalThis.addEventListener("resize", setvhOnResize)
    return () => {
      globalThis.removeEventListener("resize", setvhOnResize)
    }
  }, [])

  return viewWidth
}

export function useMouseCoor() {
  const [mouseCoor, setMouseCoor] = useState([0, 0])
  useEffect(() => {
    const handler = throttle((e: PointerEvent) => setMouseCoor([e.clientX, e.clientY]), 16)//60fps
    document.addEventListener('pointermove', handler)
    return () => document.removeEventListener('pointermove', handler)
  }, [])

  return mouseCoor
}