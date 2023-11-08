import { useContext, useEffect, useState } from "react"
import { SafariCtx } from "./ctx"
import { throttle } from "./throttle"

/**
 * Get real view height
 */
export function useViewHeight() {
  const isSafari = useContext(SafariCtx)
  const [viewHeight, setviewHeight] = useState(globalThis.innerHeight)

  // subscribe scroll to get view height
  // for safari compability
  useEffect(() => {
    const setvhOnResize = () => {
      setviewHeight(globalThis.innerHeight)
    }
    if (isSafari) {
      globalThis.addEventListener("resize", setvhOnResize)
    }
    return () => {
      globalThis.removeEventListener("resize", setvhOnResize)
    }
  }, [isSafari, setviewHeight])

  return viewHeight
}

/**
 * Get real view width
 */
export function useViewWidth() {
  const isSafari = useContext(SafariCtx)
  const [viewWidth, setviewHeight] = useState(globalThis.innerWidth)

  // subscribe scroll to get view height
  // for safari compability
  useEffect(() => {
    const setvhOnResize = () => {
      setviewHeight(globalThis.innerWidth)
    }
    if (isSafari) {
      globalThis.addEventListener("resize", setvhOnResize)
    }
    return () => {
      globalThis.removeEventListener("resize", setvhOnResize)
    }
  }, [isSafari, setviewHeight])

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