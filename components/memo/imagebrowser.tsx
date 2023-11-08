import { CSSProperties, useCallback, useContext, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { throttle } from "../../lib/throttle";
import { useDocumentEvent } from "../../lib/useEvent";
import { useViewHeight } from "../../lib/useview";
import { MemoModelCtx } from "../../pages/memos";
import { fadeIn, slideInLeft, slideInRight } from "../../styles/animations";
import Model from "../common/Model";
import { TImage } from "./imagesthumb";

type Props = {
  imagesData: TImage[]
  currentIndex: number
}

export default function ImageBrowser({ imagesData, currentIndex }: Props) {
  const ctx = useContext(MemoModelCtx)
  const [i, setI] = useState({
    curr: currentIndex,
    last: currentIndex
  })
  const scrollRef = useRef<HTMLDivElement>(null)

  if (i.curr > imagesData.length - 1) console.error("uncaught ivalid image index:", i, "in length", imagesData.length)

  const ratio = useMemo(() => i.curr < imagesData.length ? imagesData[i.curr].width / imagesData[i.curr].height : 1, [imagesData, i])
  const maxHeight = useViewHeight()

  const prev = useCallback(() => {
    if (i.curr > 0) {
      setI({
        curr: i.curr - 1,
        last: i.curr
      })
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0 })
      }
    }
  }, [i, setI, scrollRef])

  const next = useCallback(() => {
    if (i.curr < imagesData.length - 1) {
      setI({
        curr: i.curr + 1,
        last: i.curr
      })
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0 })
      }
    }
  }, [i, setI, scrollRef, imagesData.length])

  const keyevent = useCallback((evt: KeyboardEvent) => {
    if (evt.key === "ArrowLeft") {
      prev()
    } else if (evt.key === "ArrowRight") {
      next()
    } else if (evt.key === "ArrowDown") {
      if (scrollRef.current) {
        const pos = scrollRef.current.scrollTop + 400
        scrollRef.current.scrollTo({
          top: pos > scrollRef.current.scrollHeight ? scrollRef.current.scrollHeight : pos,
          behavior: "smooth",
        })
      }
    } else if (evt.key === "ArrowUp") {
      if (scrollRef.current) {
        const pos = scrollRef.current.scrollTop - 400
        scrollRef.current.scrollTo({
          top: pos < 0 ? 0 : pos,
          behavior: "smooth",
        })
      }
    }
  }, [scrollRef, next, prev]) // todo throttle?

  useDocumentEvent("keydown", keyevent)


  // mobile Drag
  const [isPressed, setIsPressed] = useState(false)
  const [startpos, setStartpos] = useState([0, 0, 0]) // x, y, scrolly
  const [starttime, setStartTime] = useState(Date.now())
  const [trans, setTrans] = useState([0, 0])
  const [direction, setDirection] = useState<"x" | "y" | "scrolly" | 0>(0)
  const [isBeforeUnmount, setisBeforeUnmount] = useState(false)

  const touchStartEvent = useCallback((evt: React.TouchEvent<HTMLDivElement>) => {
    evt.stopPropagation()
    setIsPressed(true)
    setStartTime(Date.now())
    setStartpos([evt.touches[0].clientX, evt.touches[0].clientY, scrollRef.current ? scrollRef.current.scrollTop : 0])
    setisBeforeUnmount(false)
  }, [])

  const touchMoveEvent = useCallback((evt: React.TouchEvent<HTMLDivElement>) => {
    evt.stopPropagation()
    if (isPressed) {
      const x = evt.touches[0].clientX - startpos[0]
      const y = evt.touches[0].clientY - startpos[1]
      const scrolly = scrollRef.current ? scrollRef.current.scrollTop - startpos[2] : 0
      if (direction !== 0) {
        setTrans(direction === "x" ? [x, 0] : direction === "y" ? [0, y] : [0, scrolly])
      } else {
        if (Math.abs(x) > 20 || Math.abs(y) > 20 || Math.abs(scrolly) > 20) {
          setDirection(Math.abs(x) > Math.abs(y) && Math.abs(x) > Math.abs(scrolly) ? "x" : Math.abs(y) > Math.abs(scrolly) ? "y" : "scrolly")
          setTrans(Math.abs(x) > Math.abs(y) && Math.abs(x) > Math.abs(scrolly) ? [x, 0] : y > Math.abs(scrolly) ? [0, y] : [0, scrolly])
        }
      }
    }
  }, [startpos, direction, isPressed])

  const touchEndEvent = useCallback((evt: React.TouchEvent<HTMLDivElement>) => {
    evt.stopPropagation()
    console.debug("%% touch up")

    if (Date.now() - starttime < 200 && Math.abs(trans[0]) < 5 && Math.abs(trans[1]) < 5) {
      setisBeforeUnmount(true)
      setTimeout(() => { ctx.setIsModel(false) }, 300) // 避免点击穿透的问题。touchstart ==>touchmove==>touched ==>click
    } else {
      if (direction === "x") {
        if (trans[0] < -60) {
          next()
        } else if (trans[0] > 60) {
          prev()
        }
      }
    }

    setIsPressed(false)
    setStartpos([0, 0, 0])
    setTrans([0, 0])
    setDirection(0)
  }, [trans, next, prev, direction, starttime, ctx])

  const buttonLTrans = useMemo(() => direction === "x" && trans[0] > 60, [trans, direction])
  const buttonRTrans = useMemo(() => direction === "x" && trans[0] < -60, [trans, direction])

  const containerTrans: CSSProperties = useMemo(() => Object.assign(
    direction === "x"
      ? {
        overflowY: "hidden",
        transition: "transform 0.016s linear",
        transform: `translate3d(${trans[0]}px, 0px, 0px)`,
        opacity: Math.max((200 - Math.abs(trans[0])), 0) / 200
      }
      : {}
  )
    , [trans, direction])

  const endTrans: CSSProperties = useMemo(() => isBeforeUnmount ? { opacity: 0, transition: "opacity 0.3s ease" } : {}, [isBeforeUnmount])


  // img style
  const ratioStyle: CSSProperties = Object.assign(
    ratio >= 2
      ? { maxWidth: "100%", maxHeight: maxHeight * 0.9 + "px" }
      : ratio > 0.6
        ? { maxWidth: "100%", maxHeight: maxHeight + "px" }
        : { maxWidth: "95%" },
  )


  return (ctx.isModel ?
    <Model isModel={true} setModel={ctx.setIsModel} style={{ ...endTrans, background: "#1d1d1d" }}>
      {/* Debug */}
      {/* <Tools style={{ bottom: "0rem", flexDirection: "column", height: "12em" }}>
        <div>startpos {startpos.toString()}</div>
        <div>trans {trans.toString()}</div>
        <div>direction {direction}</div>
      </Tools> */}

      <Container ref={scrollRef}
        onTouchStart={touchStartEvent}
        onTouchMove={throttle(touchMoveEvent, 16)}
        onTouchEnd={touchEndEvent}
        onClick={e => e.stopPropagation()}
        style={containerTrans}
      >

        <Img src={imagesData[i.curr].ok === "loaded" ? imagesData[i.curr].src : ""} alt={imagesData[i.curr].ok}
          style={ratioStyle}
          $entranceDirection={i.curr === i.last ? 0 : i.curr > i.last ? 1 : -1} />

      </Container>

      {i.curr > 0
        ? <Button $isLeft={true} $isShown={buttonLTrans} onClick={(e) => { e.stopPropagation(); prev() }}><i className="icon-arrow-left2" /></Button>
        : null}

      {i.curr < imagesData.length - 1
        ? <Button $isLeft={false} $isShown={buttonRTrans} onClick={(e) => { e.stopPropagation(); next() }}><i className="icon-arrow-right2" /></Button>
        : null}

      <Tools>{i.curr + 1}/{imagesData.length} &nbsp;|&nbsp;
        <span onClick={(e) => { e.stopPropagation(), ctx.setIsModel(false) }}>{"关闭"}</span></Tools>

    </Model> : undefined
  )
}

const Img = styled.img<{
  $entranceDirection: -1 | 0 | 1
}>`
  animation: ${p => p.$entranceDirection === 0 ? fadeIn : p.$entranceDirection === 1 ? slideInRight : slideInLeft} 0.7s ease;
  transform: translate3d(0,0,0);
`

const Tools = styled.div`
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0.5rem;
  right: 0.5rem;

  height: 2.5rem;
  border-radius: 1.25rem;
  padding: 0 1rem;
  background: #5b5b5bbd;
  color: white;
  backdrop-filter: blur(5px);

  &:hover{
    opacity: 1;
  }
`

const Button = styled.div<{
  $isLeft: boolean
  $isShown: boolean
}>`
  
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  width: 2.5rem;
  height: 2.5rem;
  padding: 0rem;
  color: white;
  opacity: 0.5;
  background: #5b5b5bbd;
  font-size: 1.25rem;
  border-radius: 50%;
  ${p => p.$isLeft ? "left: 1rem;" : "right: 1rem;"}

  @media screen and (max-width: 580px) {
    ${p => p.$isLeft
    ? (p.$isShown ? "left: 1rem;" : "left: -2.5rem;")
    : (p.$isShown ? "right: 1rem;" : "right: -2.5rem;")}
    transition: left 0.3s linear, right 0.3s linear;
  }

  &:hover{
    opacity: 1;
    backdrop-filter: blur(5px);
  }
`

const Container = styled.div`
  width: 100%;
  max-height: 100%;
  overflow-y: auto;

  -webkit-user-select:none;
  -moz-user-select:none;
  -ms-user-select:none;
  user-select:none;	
  
  & img {
    display: block;
    margin: 0 auto;
  }

  & img::after{
    content: attr(alt);
  }
`