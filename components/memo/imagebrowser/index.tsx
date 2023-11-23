import { ArrowLeft, ArrowRight } from "lucide-react";
import { CSSProperties, useCallback, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { create } from 'zustand';
import { useDocumentEvent } from "../../../lib/use-event";
import { useViewHeight } from "../../../lib/use-view";
import { fadeIn, slideInLeft, slideInRight } from "../../../styles/animations";
import Model from "../../common/model";
import { TImage } from "../imagesthumb";
import { useDrag } from "./use-drag";

export interface ImgBroswerState {
  isModel: boolean;
  setisModel: (b: boolean) => void
  imagesData: Array<TImage>
  setImagesData: (imagesData: TImage[]) => void
  currentIndex: number
  setCurrentIndex: (i: number) => void
}

export const useImgBroswerStore = create<ImgBroswerState>((set) => {
  return {
    isModel: false,
    setisModel: (isModel: boolean) => set(() => ({ isModel })), // wow amazing, partial updating
    imagesData: new Array<TImage>(),
    setImagesData: (imagesData: TImage[]) => set(() => ({ imagesData })),
    currentIndex: 0,
    setCurrentIndex: (currentIndex: number) => set(() => ({ currentIndex })),
  }
})


export default function ImageBrowser() {
  const store = useImgBroswerStore(state => state) // wont update except re-render
  const imagesData = useImgBroswerStore(state => state.imagesData)

  const [index, setIndex] = useState({
    curr: useImgBroswerStore(state => state.currentIndex),
    last: useImgBroswerStore(state => state.currentIndex),
  })
  const scrollRef = useRef<HTMLDivElement>(null)

  if (index.curr > imagesData.length - 1) console.error("uncaught ivalid image index:", index, "in length", imagesData.length)

  const ratio = useMemo(() => index.curr < imagesData.length ? imagesData[index.curr].width / imagesData[index.curr].height : 1, [imagesData, index])
  const maxHeight = useViewHeight()

  const prev = useCallback(() => {
    if (index.curr > 0) {
      setIndex({
        curr: index.curr - 1,
        last: index.curr
      })
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0 })
      }
    }
  }, [index, setIndex, scrollRef])

  const next = useCallback(() => {
    if (index.curr < imagesData.length - 1) {
      setIndex({
        curr: index.curr + 1,
        last: index.curr
      })
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0 })
      }
    }
  }, [index, setIndex, scrollRef, imagesData])


  // keyboard shortcut
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
  const { bind, trans, direction, isBeforeUnmount } = useDrag(store, prev, next)

  const buttonLTrans = useMemo(() => direction === "x" && trans[0] > 60, [trans, direction])
  const buttonRTrans = useMemo(() => direction === "x" && trans[0] < -60, [trans, direction])

  const containerTrans: CSSProperties = useMemo(() => Object.assign(
    direction === "x"
      ? {
        overflowY: "hidden",
        transition: "transform 0.017s linear",
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

  return (
    <Model isModel={true} setModel={store.setisModel} style={{ ...endTrans, background: "#1d1d1d" }}>
      {/* Debug */}
      {/* <Tools style={{ bottom: "0rem", flexDirection: "column", height: "12em" }}>
        <div>startpos {startpos.toString()}</div>
        <div>trans {trans.toString()}</div>
        <div>direction {direction}</div>
      </Tools> */}

      <Container ref={scrollRef}
        {...bind}
        onClick={e => e.stopPropagation()}
        style={containerTrans}
      >

        <Img src={imagesData[index.curr].ok === "loaded" ? imagesData[index.curr].src : ""} alt={imagesData[index.curr].ok}
          style={ratioStyle}
          $entranceDirection={index.curr === index.last ? 0 : index.curr > index.last ? 1 : -1} />

      </Container>

      {index.curr > 0
        && <Button $isLeft={true} $isShown={buttonLTrans} onClick={(e) => { e.stopPropagation(); prev() }}><ArrowLeft /></Button>
      }

      {index.curr < imagesData.length - 1
        && <Button $isLeft={false} $isShown={buttonRTrans} onClick={(e) => { e.stopPropagation(); next() }}><ArrowRight /></Button>
      }

      <Tools>{index.curr + 1}/{imagesData.length} &nbsp;|&nbsp;
        <span onClick={(e) => { e.stopPropagation(), store.setisModel(false) }}>{"关闭"}</span></Tools>

    </Model>
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
  cursor: default;

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