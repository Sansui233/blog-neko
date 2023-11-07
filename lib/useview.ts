import { useContext, useEffect, useState } from "react"
import { SafariCtx } from "./ctx"

/**
 * Get real view height
 */
export function useViewHeight(){
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