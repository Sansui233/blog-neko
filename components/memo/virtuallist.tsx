import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { throttle } from "../../lib/throttle";

// source data type and element prop type
type Props<T extends { id: string | number }> = React.HTMLProps<HTMLDivElement> & {
  sources: T[]
  setSources: Dispatch<SetStateAction<T[]>>
  fetchFrom?: (i: number, batchsize: number) => Promise<T[] | undefined> // the function that returns new source data
  batchsize: number

  Elem: (props: {
    source: T
    triggerHeightChange: Dispatch<SetStateAction<boolean>>;
  } & React.HTMLProps<HTMLDivElement>) => JSX.Element // the render

  Loading?: () => JSX.Element

  scrollRef?: React.RefObject<HTMLElement> // get the outer scroll DOM, default for window
}

export type VirtualListType = <T extends {
  id: string | number;
}>(props: Props<T>) => JSX.Element


// TODO scroll to anywhere
// TODO modify height while loading
const VirtualList: VirtualListType = ({ sources, setSources, Elem, scrollRef, fetchFrom: fetchFrom, batchsize, Loading, style, ...otherprops }) => {
  const [placeHolder, setplaceHolder] = useState<number[]>(new Array(sources.length).fill(300))
  // 注意保持 activeIndex 和 sources 的状态一致性
  const [activeIndex, setActiveIndex] = useState<number[]>(new Array(sources.length).fill(0).map((_, i) => i))
  const [winBreakPoint, setWinBreakPoint] = useState(sources.length * 3)
  const [isLoading, setIsLoading] = useState(false) // render the loading compoenent or not
  const scrollLock = useRef({ enable: true }) // true means enable scroll

  const minHeight = useMemo(() => placeHolder.reduce((sum, height) => sum += height, 0), [placeHolder])

  const transformOnIndex = useCallback((i: number) => {
    let sum = 0
    for (let j = 0; j < i; j++) {
      sum += placeHolder[j]
    }
    return sum
  }, [placeHolder])

  // scroll monitor. when < 30% or > 30%, 
  // fetch new source and set source
  // concating placeholder with extended data length 
  useEffect(() => {
    const scrollElem = scrollRef?.current
    const handler = () => {
      if (!scrollLock.current.enable) return // false means disable scroll

      const scrollHeight = transformOnIndex(activeIndex[activeIndex.length - 1]) - transformOnIndex(activeIndex[0]) // okay?
      const currScrollTop = (scrollElem ? scrollElem.scrollTop : globalThis.scrollY) - transformOnIndex(activeIndex[0])
      const currScrollBottom = currScrollTop + globalThis.innerHeight - (scrollElem ? (scrollElem.getBoundingClientRect().y > 0 ? scrollElem.getBoundingClientRect().y : 0) : 0)
      // console.debug("scroll", scrollHeight, currScrollTop, currScrollBottom)

      const progress = currScrollTop / scrollHeight
      const progressBottom = currScrollBottom / scrollHeight
      // console.debug("progress", scrollHeight, progress, progressBottom)

      if (isNaN(progress) || !isFinite(progress) || progress > 1.5) return

      scrollLock.current = { enable: false }

      if (fetchFrom && progress < 0.2) {
        const reqStart = activeIndex[0] - batchsize
        if (reqStart < 0) {
          scrollLock.current = { enable: true }
          return
        }

        setIsLoading(true)
        fetchFrom(reqStart, batchsize).then(prevdata => {
          setIsLoading(false)
          if (!prevdata || prevdata.length === 0) { // head
            scrollLock.current = { enable: true }
            return
          }

          let prevActiveIndex = activeIndex.map(aci => aci - activeIndex.length)
          if (prevdata.length > activeIndex.length) {
            const additional = new Array(prevdata.length - activeIndex.length).fill(0).map((_, i) => i - prevdata.length + activeIndex.length + prevActiveIndex[0])
            prevActiveIndex = additional.concat(prevActiveIndex)
          } else if (prevdata.length < activeIndex.length) {
            prevActiveIndex = prevActiveIndex.slice(activeIndex.length - prevdata.length, activeIndex.length)
          }

          const fullIndex = prevActiveIndex.concat(activeIndex)
          const fulldata = prevdata.concat(sources)

          // slide window
          if (fullIndex.length > winBreakPoint) {
            fullIndex.splice(0 - prevActiveIndex.length, prevActiveIndex.length)
            fulldata.splice(0 - prevActiveIndex.length, prevActiveIndex.length)
          }

          setActiveIndex(fullIndex)
          setSources(fulldata)
          scrollLock.current = { enable: true }
        })

      } else if (fetchFrom && progressBottom > 0.8) {
        const reqStart = activeIndex[activeIndex.length - 1] + 1
        setIsLoading(true)
        fetchFrom(reqStart, batchsize).then(nextdata => {
          setIsLoading(false)
          if (!nextdata || nextdata.length === 0) { // tail
            scrollLock.current = { enable: true }
            return
          }

          let nextActiveIndex = activeIndex.map(aci => aci + activeIndex.length)
          if (nextdata.length > activeIndex.length) {
            const additional = new Array(nextdata.length - activeIndex.length).fill(0).map((_, i) => i + nextActiveIndex[nextActiveIndex.length - 1])
            nextActiveIndex = nextActiveIndex.concat(additional)
          } else if (nextdata.length < activeIndex.length) {
            nextActiveIndex = nextActiveIndex.slice(0, nextdata.length)
          }

          if (nextActiveIndex[nextActiveIndex.length - 1] > placeHolder.length - 1) {
            const additional = new Array(nextActiveIndex[nextActiveIndex.length - 1] - placeHolder.length + 1).fill(300)
            setplaceHolder(placeHolder.concat(additional))
          }

          const fullIndex = activeIndex.concat(nextActiveIndex)
          const fulldata = sources.concat(nextdata)

          // slide window
          if (fullIndex.length > winBreakPoint) {
            fullIndex.splice(0, nextdata.length)
            fulldata.splice(0, nextdata.length)
          }

          setActiveIndex(fullIndex)
          setSources(fulldata)
          scrollLock.current = { enable: true }
        })

      } else {
        scrollLock.current = { enable: true }
      }
    }

    const throttled = throttle(handler, 500)

    if (scrollElem) {
      scrollElem.addEventListener("scroll", throttled)
    } else {
      globalThis.addEventListener("scroll", throttled)
    }

    return () => {
      if (scrollElem) {
        scrollElem.addEventListener("scroll", throttled)
      } else {
        globalThis.removeEventListener("scroll", throttled)
      }
    }
  }, [scrollLock, scrollRef, fetchFrom, activeIndex, setSources, placeHolder, transformOnIndex, sources, batchsize, winBreakPoint])

  return (
    <div style={Object.assign({
      position: "relative",
      width: "100%",
      minHeight: `${minHeight}px`
    }, style)}
      className={otherprops.className}
    >
      {sources.map((e, i) => <ListItem key={e.id} index={activeIndex[i]} Elem={Elem} source={e} placeHolder={placeHolder} setplaceHolder={setplaceHolder} />)}
      {Loading && isLoading ? <div style={{
        position: "absolute",
        width: "100%",
        transform: `translateY(${placeHolder.slice(0, placeHolder.length).reduce((sum, height) => sum += height, 0)}px)`
      }}>
        <Loading />
      </div> : null}
    </div>
  )
}


function ListItem<T extends { id: string | number }>({ Elem, index, source, placeHolder, setplaceHolder }: {
  Elem: Props<T>["Elem"],
  source: T;
  index: number
  placeHolder: number[]
  setplaceHolder: Dispatch<SetStateAction<number[]>>
}) {

  const ref = useRef<HTMLDivElement>(null)
  const handler = useCallback(() => {
    if (ref.current) {
      const height = ref.current.offsetHeight;
      setplaceHolder(placeHolder => {
        if (placeHolder[index] === height || height === 0) return placeHolder
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
  // 二是元素内部主动触发的变化，靠手动点击执行
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
        source,
        triggerHeightChange
      })}
    </div>
  )

}

export default VirtualList