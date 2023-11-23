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
    return suffix === "move" ? "touchmove" : "mouseup"
  } else {
    return suffix === "move" ? "mousemove" : "mouseup"
  }
}

export function useDrag(store: ImgBroswerState, next: () => void, prev: () => void) {
  // output res
  const [startfunc, setstartfunc] = useState<ReactEvtHandler>()
  const [trans, setTrans] = useState([0, 0])
  const [direction, setDirection] = useState<"x" | "y" | "scrolly" | 0>(0)
  const [isBeforeUnmount, setisBeforeUnmount] = useState(false)


  const moveEvent = useCallback((evt: TouchEvent | MouseEvent) => {
    evt.stopPropagation()
    if (evt.target) {
      if (state.isPressed) {
        const x = coord(evt).x - state.startpos[0]
        const y = coord(evt).y - state.startpos[1]
        const scrolly = (evt.target as HTMLElement).scrollTop - state.startpos[2]
        if (state.direction !== 0) {
          const trans = state.direction === "x" ? [x, 0] : state.direction === "y" ? [0, y] : [0, scrolly]
          state.trans = trans
          setTrans(trans)
        } else {
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

  const startEvent = useCallback((movefunc: EvtHandler, endfunc: EvtHandler) => (evt: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>) => {
    evt.stopPropagation()
    console.debug("% event trigger", evt.type)
    if (evt.target) {
      state.isPressed = true;
      state.starttime = Date.now();
      state.startpos = [coord(evt).x, coord(evt).y, (evt.target as HTMLElement).scrollTop]
      const target = evt.target as HTMLElement
      if (evt.type.includes("touch")) {
        //@ts-ignore
        target.addEventListener(evtName(evt, "move"), movefunc)
      }
      //@ts-ignore
      target.addEventListener(evtName(evt, "end"), endfunc, { once: true })
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
    , [store, prev, next])

  // group func
  useEffect(() => {
    const movefunc = throttle(moveEvent, 17)
    const group = startEvent(movefunc, endEvent(movefunc))
    setstartfunc(() => group)
  }, [endEvent, moveEvent, startEvent])


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