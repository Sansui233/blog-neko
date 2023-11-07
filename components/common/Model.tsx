import { useEffect } from "react"
import styled from "styled-components"

type Props = React.HTMLProps<HTMLDivElement> & {
  isModel: boolean, // 外部控制的 model 状态 noun
  setModel: (isOpen: boolean) => void // 控制 model 状态 verb
  scrollRef?: HTMLElement // 有的页面的滚动不在 body 上
}

export default function Model({ isModel, setModel, scrollRef, ...otherprops }: Props) {
  // Local Scroll
  useEffect(() => {
    if (isModel) {
      if (!scrollRef) {
        document.body.style.overflow = 'hidden'
      } else {
        scrollRef.style.overflow = 'hidden'
      }
    } else {
      if (!scrollRef) {
        document.body.style.overflow = 'auto'
      } else {
        scrollRef.style.overflow = 'auto'
      }
    }
    return () => {
      if (!scrollRef) {
        document.body.style.overflow = 'auto'
      } else {
        scrollRef.style.overflow = 'auto'
      }
    }
  }, [isModel, scrollRef])

  return isModel
    ? <MaskedContainer {...otherprops} $isOpen={isModel} onClick={() => setModel(false)} />
    : undefined
}


// Notice that the bottom will be covered on ios
const MaskedContainer = styled.div< { $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background: #000000de;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
`