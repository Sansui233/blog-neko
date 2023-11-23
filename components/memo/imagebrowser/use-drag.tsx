import { MouseEventHandler, TouchEventHandler, useCallback, useEffect, useState } from "react";
import { ImgBroswerState } from ".";
import { throttle } from "../../../lib/throttle";

const state: {
  isPressed: boolean,
  startpos: number[],
  starttime: number,
  trans: number[],
  direction: "x" | "y" | "scrolly" | 0
} = {
  isPressed: false,
  startpos: [0, 0, 0],// x, y, scrolly
  starttime: 0,
  trans: [0, 0], // x,y
  direction: 0
}

type EvtHandler = (evt: TouchEvent | MouseEvent) => void
type ReactEvtHandler = TouchEventHandler<HTMLDivElement> | MouseEventHandler<HTMLDivElement>

const coord = (e: Event | React.UIEvent<HTMLDivElement>) => {
  if (e.type.includes("touch")) {
    return { x: (e as TouchEvent).touches[0].clientX, y: (e as TouchEvent).touches[0].clientY }
  } else {
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY }
  }
}

const evtName = (e: Event | React.UIEvent, suffix: "move" | "end"): keyof HTMLElementEventMap => {
  if (e.type.includes("touch")) {
    return suffix === "move" ? "touchmove" : "touchend"
  } else {
    return suffix === "move" ? "mousemove" : "mouseup"
  }
}

export function useDrag(store: ImgBroswerState, prev: () => void, next: () => void, reset: () => void, interval = 17) {
  // output res
  const [startfunc, setstartfunc] = useState<ReactEvtHandler>()
  const [trans, setTrans] = useState([0, 0])
  const [direction, setDirection] = useState<"x" | "y" | "scrolly" | 0>(0)
  const [isBeforeUnmount, setisBeforeUnmount] = useState(false)


  const startEvent = useCallback((movefunc: EvtHandler, endfunc: EvtHandler) => (evt: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    evt.stopPropagation()
    if (evt.target) {
      state.isPressed = true;
      state.starttime = Date.now();
      state.startpos = [coord(evt).x, coord(evt).y, (evt.target as HTMLElement).scrollTop]
      const target = evt.target as HTMLElement
      if (evt.type.includes("touch")) {
        //@ts-ignore
        target.addEventListener(evtName(evt, "move"), movefunc, { passive: true })
      }
      //@ts-ignore
      target.addEventListener(evtName(evt, "end"), endfunc, { once: true })
    }
  }, [])

  const moveEvent = useCallback((evt: TouchEvent | MouseEvent) => {
    evt.stopPropagation()

    // 禁多指手势，因为功能还没做，会和系统冲突。
    // 特别是缩放的情况下，由于 model 高度监听的 resize 事件，移动自带的放大导致屏幕高度减少。
    if (evt.type.includes("touch") && (evt as TouchEvent).touches.length > 1) return

    if (evt.target) {
      if (state.isPressed) {
        const x = coord(evt).x - state.startpos[0]
        const y = coord(evt).y - state.startpos[1]
        const scrolly = (evt.target as HTMLElement).scrollTop - state.startpos[2]
        if (state.direction !== 0) {

          // update
          const trans = state.direction === "x" ? [x, 0] : state.direction === "y" ? [0, y] : [0, scrolly]
          state.trans = trans
          setTrans(trans)
        } else {
          // set up
          if (Math.abs(x) > 20 || Math.abs(y) > 20 || Math.abs(scrolly) > 20) {
            const direction = Math.abs(x) > Math.abs(y) && Math.abs(x) > Math.abs(scrolly) ? "x" : Math.abs(y) > Math.abs(scrolly) ? "y" : "scrolly"
            state.direction = direction
            setDirection(direction)
            const trans = Math.abs(x) > Math.abs(y) && Math.abs(x) > Math.abs(scrolly) ? [x, 0] : y > Math.abs(scrolly) ? [0, y] : [0, scrolly]
            setTrans(trans)
            state.trans = trans
          }
        }
      }
    }
  }, [])

  const endEvent = useCallback((movefunc: EvtHandler) => (evt: TouchEvent | MouseEvent) => {
    evt.stopPropagation()

    if (Date.now() - state.starttime < 200 && Math.abs(state.trans[0]) < 5 && Math.abs(state.trans[1]) < 5) {
      setisBeforeUnmount(true)
      setTimeout(() => {
        store.setisModel(false)
        setisBeforeUnmount(false)
      }, 300) // 避免点击穿透的问题。touchstart ==>touchmove==>touched ==>click
    } else {
      if (state.direction === "x") {
        if (state.trans[0] < -60) {
          next()
        } else if (state.trans[0] > 60) {
          prev()
        } else {
          reset()
        }
      }
    }

    state.isPressed = false
    state.startpos = [0, 0, 0]
    state.trans = [0, 0]
    setTrans([0, 0])
    state.direction = 0
    setDirection(0)
      ; (evt.target as HTMLElement).removeEventListener("touchmove", movefunc)
  }
    , [store, prev, next, reset])

  // group func
  useEffect(() => {
    const movefunc = throttle(moveEvent, interval)
    const group = startEvent(movefunc, endEvent(movefunc))
    setstartfunc(() => group)
  }, [endEvent, moveEvent, startEvent, interval])


  return {
    trans,
    direction,
    isBeforeUnmount,
    bind: {
      onTouchStart: (startfunc as TouchEventHandler<HTMLDivElement>),
      onMouseDown: (startfunc as MouseEventHandler<HTMLDivElement>)
    }
  }

}