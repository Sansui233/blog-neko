import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { throttle } from "../../lib/throttle";

// source data type and element prop type
type Props<T, P> = {
  sources: T[]
  setSources: Dispatch<SetStateAction<T[]>>
  props: P[]
  Elem: (props: P & {
    triggerHeightChange?: Dispatch<SetStateAction<boolean>>;
  }) => JSX.Element // the render
  dataFetch: {
    prev?: () => Promise<T[]>
    next?: () => Promise<T[]>
  }
}

export default function VirtualList<T, P>({ props: sources, setSources, Elem }: Props<T, P>) {
  const [placeHolder, setplaceHolder] = useState<number[]>(new Array(sources.length).fill(0))
  // 注意保持 activeIndex 和 sources 的状态一致性
  const [activeIndex, setActiveIndex] = useState<number[]>(new Array(sources.length).fill(0).map((_, i) => i))

  const minHeight = useMemo(() => placeHolder.reduce((sum, height) => sum += height, 0), [placeHolder])

  // TODO scroll monitor. when < 30% or > 30%, 
  // fetch new source and set source
  // concating placeholder with extended data length


  return (
    <div style={{
      position: "relative",
      width: "100%",
      minHeight: `${minHeight}px`
    }}>
      {sources.map((e, i) => <ListItem<T, P> key={activeIndex[i]} index={activeIndex[i]} Elem={Elem} elem={e} placeHolder={placeHolder} setplaceHolder={setplaceHolder} />)}
    </div>
  )
}


function ListItem<T, P>({ Elem, index, elem, placeHolder, setplaceHolder }: {
  Elem: Props<T, P>["Elem"],
  elem: P;
  index: number
  placeHolder: number[]
  setplaceHolder: Dispatch<SetStateAction<number[]>>
}) {

  const ref = useRef<HTMLDivElement>(null)
  const handler = useCallback(() => {
    // console.debug("window resize")
    if (ref.current) {
      const height = ref.current.offsetHeight;
      // console.debug("heihgt", index, height)
      setplaceHolder(placeHolder => {
        const newplaceHolder = [...placeHolder]
        newplaceHolder[index] = height
        return newplaceHolder
      })
    }
  }, [ref, setplaceHolder, index])

  // on window resize
  useEffect(() => {
    const throttled = throttle(handler, 150)
    globalThis.addEventListener("resize", throttled)
    return () => {
      globalThis.removeEventListener("resize", throttled)
    }
  }, [ref, index, setplaceHolder, handler])

  // 有两个原因会影响高度
  // 一是外部窗口 resize,靠监听执行
  // 二是元素加载后和元素内部主动触发的变化，靠手动点击执行
  // 因此需要一个状态要交给元素内部执行高度变化

  const [isHeightChange, triggerHeightChange] = useState(false)
  useEffect(() => {
    if (isHeightChange) {
      handler()
      triggerHeightChange(false)
    }
  }, [isHeightChange, handler])

  // visible after height is set
  const [isvisible, setIsVisible] = useState(false)
  useEffect(() => {
    handler()
    setIsVisible(true)
  }, [ref, handler])

  // calc translateY
  const translateY = useMemo(() => {
    return placeHolder.slice(0, index).reduce((sum, height) => sum += height, 0)
  }, [index, placeHolder])

  return (
    <div ref={ref} style={{
      position: "absolute",
      width: "100%",
      transform: `translateY(${translateY}px)`,
      visibility: isvisible ? "visible" : "hidden",
    }}>
      {Elem({
        ...elem,
        triggerHeightChange
      })}
    </div>
  )

}